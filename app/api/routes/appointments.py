from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks, Query
from pydantic import BaseModel, field_validator
from typing import Optional
from datetime import datetime, timezone
from bson import ObjectId

from app.db.mongodb import get_collection
from app.db.serializer import serialize_doc, serialize_list
from app.core.dependencies import get_current_clinic
from app.core.security import generate_portal_token
from app.core.config import settings
from app.services.whatsapp import send_booking_confirmation

router = APIRouter()


class AppointmentCreate(BaseModel):
    patient_id: str
    appointment_time: str
    notes: str = ""
    send_confirmation: bool = True
    consultation_type: str = "offline"
    payment_mode: str = "offline"

    @field_validator("appointment_time")
    @classmethod
    def validate_time(cls, v):
        try:
            dt = datetime.fromisoformat(v)
            if dt.tzinfo is None:
                dt = dt.replace(tzinfo=timezone.utc)
            if dt <= datetime.now(timezone.utc):
                raise ValueError("Appointment must be in the future")
        except ValueError as e:
            raise ValueError(str(e))
        return v


class AppointmentUpdate(BaseModel):
    appointment_time: Optional[str] = None
    notes: Optional[str] = None
    status: Optional[str] = None
    payment_status: Optional[str] = None


@router.post("/schedule", status_code=201)
async def schedule_appointment(
    data: AppointmentCreate,
    background_tasks: BackgroundTasks,
    current_clinic=Depends(get_current_clinic),
):
    patients = get_collection("patients")
    appointments = get_collection("appointments")
    clinic_id = current_clinic["id"]

    try:
        patient = await patients.find_one({"_id": ObjectId(data.patient_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid patient ID")
    if not patient or patient["clinic_id"] != clinic_id:
        raise HTTPException(status_code=404, detail="Patient not found")

    dt = datetime.fromisoformat(data.appointment_time)
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    else:
        dt = dt.astimezone(timezone.utc)

    portal_token = generate_portal_token()
    doc = {
        "clinic_id": clinic_id,
        "patient_id": data.patient_id,
        "patient_name": patient["name"],
        "patient_phone": patient["phone"],
        "clinic_name": current_clinic["name"],
        "appointment_time": dt,
        "notes": data.notes,
        "status": "scheduled",
        "consultation_type": data.consultation_type,
        "payment_mode": data.payment_mode,
        "payment_status": "pending",
        "reminder_sent": False,
        "portal_token": portal_token,
        "portal_confirmed": None,
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
    }
    result = await appointments.insert_one(doc)
    doc["_id"] = result.inserted_id

    if data.send_confirmation:
        appt_str = dt.strftime("%d %b %Y at %I:%M %p UTC")
        portal_url = f"{settings.PORTAL_BASE_URL}/{portal_token}"
        background_tasks.add_task(
            send_booking_confirmation,
            patient_name=patient["name"],
            patient_phone=patient["phone"],
            clinic_name=current_clinic["name"],
            appointment_time=appt_str,
            portal_url=portal_url,
        )

    return {"success": True, "appointment": serialize_doc(doc)}


@router.get("/clinic/{clinic_id}")
async def get_appointments(
    clinic_id: str,
    status: Optional[str] = None,
    date: Optional[str] = None,
    page: int = Query(1, ge=1),
    per_page: int = Query(50, ge=1, le=200),
    current_clinic=Depends(get_current_clinic),
):
    if clinic_id != current_clinic["id"]:
        raise HTTPException(status_code=403, detail="Access denied")

    appointments = get_collection("appointments")
    query: dict = {"clinic_id": clinic_id}
    if status:
        query["status"] = status
    if date:
        from datetime import date as dt_date
        d = datetime.fromisoformat(date)
        start = datetime(d.year, d.month, d.day, 0, 0, 0, tzinfo=timezone.utc)
        end = datetime(d.year, d.month, d.day, 23, 59, 59, tzinfo=timezone.utc)
        query["appointment_time"] = {"$gte": start, "$lte": end}

    total = await appointments.count_documents(query)
    cursor = appointments.find(query).sort("appointment_time", 1).skip((page - 1) * per_page).limit(per_page)
    docs = await cursor.to_list(per_page)
    return {"appointments": serialize_list(docs), "total": total, "page": page}


@router.post("/{appointment_id}/complete")
async def complete_appointment(appointment_id: str, current_clinic=Depends(get_current_clinic)):
    appointments = get_collection("appointments")
    try:
        appt = await appointments.find_one({"_id": ObjectId(appointment_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid ID")
    if not appt or appt["clinic_id"] != current_clinic["id"]:
        raise HTTPException(status_code=404, detail="Appointment not found")

    await appointments.update_one(
        {"_id": ObjectId(appointment_id)},
        {"$set": {"status": "completed", "updated_at": datetime.now(timezone.utc)}}
    )
    return {"success": True}


@router.post("/{appointment_id}/mark-noshow")
async def mark_no_show(appointment_id: str, background_tasks: BackgroundTasks, current_clinic=Depends(get_current_clinic)):
    from app.services.whatsapp import send_noshow_rebook
    appointments = get_collection("appointments")
    message_logs = get_collection("message_logs")

    try:
        appt = await appointments.find_one({"_id": ObjectId(appointment_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid ID")
    if not appt or appt["clinic_id"] != current_clinic["id"]:
        raise HTTPException(status_code=404, detail="Appointment not found")

    await appointments.update_one(
        {"_id": ObjectId(appointment_id)},
        {"$set": {"status": "no_show", "updated_at": datetime.now(timezone.utc)}}
    )

    success = await send_noshow_rebook(
        patient_name=appt.get("patient_name", "Patient"),
        patient_phone=appt.get("patient_phone"),
        clinic_name=appt.get("clinic_name", "Clinic"),
    )
    await message_logs.insert_one({
        "appointment_id": appointment_id,
        "clinic_id": current_clinic["id"],
        "patient_phone": appt.get("patient_phone"),
        "message_type": "no_show_rebook",
        "channel": "whatsapp",
        "success": success,
        "sent_at": datetime.now(timezone.utc),
    })
    return {"success": True, "whatsapp_sent": success}


@router.patch("/{appointment_id}")
async def update_appointment(appointment_id: str, data: AppointmentUpdate, current_clinic=Depends(get_current_clinic)):
    appointments = get_collection("appointments")
    try:
        appt = await appointments.find_one({"_id": ObjectId(appointment_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid ID")
    if not appt or appt["clinic_id"] != current_clinic["id"]:
        raise HTTPException(status_code=404, detail="Appointment not found")

    updates = {k: v for k, v in data.model_dump().items() if v is not None}
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")

    if "appointment_time" in updates:
        dt = datetime.fromisoformat(updates["appointment_time"])
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        updates["appointment_time"] = dt

    updates["updated_at"] = datetime.now(timezone.utc)
    await appointments.update_one({"_id": ObjectId(appointment_id)}, {"$set": updates})
    updated = await appointments.find_one({"_id": ObjectId(appointment_id)})
    return {"success": True, "appointment": serialize_doc(updated)}


@router.delete("/{appointment_id}")
async def cancel_appointment(appointment_id: str, current_clinic=Depends(get_current_clinic)):
    appointments = get_collection("appointments")
    try:
        appt = await appointments.find_one({"_id": ObjectId(appointment_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid ID")
    if not appt or appt["clinic_id"] != current_clinic["id"]:
        raise HTTPException(status_code=404, detail="Appointment not found")

    await appointments.update_one(
        {"_id": ObjectId(appointment_id)},
        {"$set": {"status": "cancelled", "updated_at": datetime.now(timezone.utc)}}
    )
    return {"success": True}


@router.get("/logs/{clinic_id}")
async def get_message_logs(
    clinic_id: str,
    page: int = Query(1, ge=1),
    per_page: int = Query(50, ge=1, le=200),
    current_clinic=Depends(get_current_clinic),
):
    if clinic_id != current_clinic["id"]:
        raise HTTPException(status_code=403, detail="Access denied")

    logs = get_collection("message_logs")
    total = await logs.count_documents({"clinic_id": clinic_id})
    cursor = logs.find({"clinic_id": clinic_id}).sort("sent_at", -1).skip((page - 1) * per_page).limit(per_page)
    docs = await cursor.to_list(per_page)
    return {"logs": serialize_list(docs), "total": total, "page": page}


@router.post("/trigger-reminders")
async def trigger_reminders(background_tasks: BackgroundTasks, current_clinic=Depends(get_current_clinic)):
    from app.scheduler.reminder_scheduler import check_and_send_reminders
    background_tasks.add_task(check_and_send_reminders)
    return {"success": True, "message": "Reminder job triggered"}
