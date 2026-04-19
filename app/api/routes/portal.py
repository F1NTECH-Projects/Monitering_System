from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from datetime import datetime, timezone
from bson import ObjectId

from app.db.mongodb import get_collection
from app.db.serializer import serialize_doc
from app.services.whatsapp import send_text_message

router = APIRouter()


@router.get("/{token}")
async def get_portal_appointment(token: str):
    appointments = get_collection("appointments")
    appt = await appointments.find_one({"portal_token": token})
    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found or link expired")

    clinics = get_collection("clinics")
    clinic = await clinics.find_one({"_id": ObjectId(appt.get("clinic_id"))})
    clinic_upi_id = clinic.get("upi_id") if clinic else None

    # Don't expose sensitive data
    return {
        "appointment_id": str(appt.get("_id")),
        "patient_name": appt.get("patient_name"),
        "clinic_name": appt.get("clinic_name"),
        "appointment_time": appt.get("appointment_time").isoformat() if appt.get("appointment_time") else None,
        "status": appt.get("status"),
        "portal_confirmed": appt.get("portal_confirmed"),
        "notes": appt.get("notes", ""),
        "consultation_type": appt.get("consultation_type", "offline"),
        "payment_mode": appt.get("payment_mode", "offline"),
        "payment_status": appt.get("payment_status", "pending"),
        "clinic_upi_id": clinic_upi_id,
        "clinic_phone": clinic.get("phone") if clinic else None
    }


@router.post("/{token}/confirm")
async def confirm_appointment(token: str):
    appointments = get_collection("appointments")
    appt = await appointments.find_one({"portal_token": token})
    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found")

    if appt.get("status") != "scheduled":
        raise HTTPException(status_code=400, detail=f"Cannot confirm appointment with status: {appt['status']}")

    await appointments.update_one(
        {"portal_token": token},
        {"$set": {
            "portal_confirmed": True,
            "updated_at": datetime.now(timezone.utc)
        }}
    )

    # Notify clinic via WhatsApp (optional - send to clinic phone)
    try:
        appt_time = appt.get("appointment_time")
        appt_str = appt_time.strftime("%d %b at %I:%M %p") if appt_time else "your appointment"
        msg = f"✅ {appt.get('patient_name')} has CONFIRMED their appointment on {appt_str}."
        # Could notify clinic here if needed
    except Exception:
        pass

    return {"success": True, "message": "Appointment confirmed successfully"}


class RescheduleRequest(BaseModel):
    preferred_time: str
    message: str = ""


@router.post("/{token}/reschedule")
async def request_reschedule(token: str, data: RescheduleRequest):
    appointments = get_collection("appointments")
    appt = await appointments.find_one({"portal_token": token})
    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found")

    await appointments.update_one(
        {"portal_token": token},
        {"$set": {
            "portal_confirmed": False,
            "reschedule_requested": True,
            "reschedule_preferred_time": data.preferred_time,
            "reschedule_message": data.message,
            "updated_at": datetime.now(timezone.utc),
        }}
    )

    return {"success": True, "message": "Reschedule request sent to clinic"}


class PublicAppointmentCreate(BaseModel):
    patient_name: str
    patient_phone: str
    appointment_time: str
    notes: str = ""
    consultation_type: str = "offline"
    payment_mode: str = "offline"

@router.post("/clinic/{clinic_id}/book")
async def public_book_appointment(clinic_id: str, data: PublicAppointmentCreate):
    # This public endpoint creates a patient if it doesn't exist, and schedules an appointment
    from app.core.security import generate_portal_token
    clinics = get_collection("clinics")
    patients = get_collection("patients")
    appointments = get_collection("appointments")
    
    clinic = await clinics.find_one({"_id": ObjectId(clinic_id)})
    if not clinic:
        raise HTTPException(status_code=404, detail="Clinic not found")
        
    dt = datetime.fromisoformat(data.appointment_time)
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    else:
        dt = dt.astimezone(timezone.utc)
        
    if dt <= datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="Appointment must be in the future")
        
    # Find or create patient
    patient = await patients.find_one({"clinic_id": clinic_id, "phone": data.patient_phone})
    if not patient:
        res = await patients.insert_one({
            "clinic_id": clinic_id,
            "name": data.patient_name,
            "phone": data.patient_phone,
            "email": "",
            "dob": None,
            "gender": "other",
            "blood_group": "",
            "medical_history": [],
            "created_at": datetime.now(timezone.utc)
        })
        patient_id = str(res.inserted_id)
    else:
        patient_id = str(patient["_id"])
        
    portal_token = generate_portal_token()
    doc = {
        "clinic_id": clinic_id,
        "patient_id": patient_id,
        "patient_name": data.patient_name,
        "patient_phone": data.patient_phone,
        "clinic_name": clinic["name"],
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
    await appointments.insert_one(doc)
    return {"success": True, "portal_token": portal_token}
