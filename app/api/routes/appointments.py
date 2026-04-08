from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone
from app.db.supabase_client import get_supabase
from app.services.whatsapp import send_booking_confirmation
from app.core.dependencies import get_current_clinic
from fastapi import Depends

router = APIRouter()


class AppointmentCreate(BaseModel):
    clinic_id:        str
    patient_id:       str
    appointment_time: str      
    notes:            Optional[str] = ""
    send_confirmation: bool = True


class AppointmentUpdate(BaseModel):
    appointment_time: Optional[str] = None
    notes:            Optional[str] = None
    status:           Optional[str] = None


@router.post("/schedule")
def schedule_appointment(data: AppointmentCreate, background_tasks: BackgroundTasks, current_clinic=Depends(get_current_clinic)):
    supabase = get_supabase()
    try:
        if appt_dt.tzinfo is None:
            appt_dt = appt_dt.replace(tzinfo=timezone.utc)
        else:
            appt_dt = appt_dt.astimezone(timezone.utc)
        if appt_dt <= datetime.now(timezone.utc):
            raise HTTPException(status_code=400, detail="Appointment time must be in the future")

        resp = supabase.table("appointments").insert({
            "clinic_id":        current_clinic["id"],  # always from JWT
            "patient_id":       data.patient_id,
            "appointment_time": data.appointment_time,
            "notes":            data.notes,
            "status":           "scheduled",
            "reminder_sent":    False,
        }).execute()

        appt = resp.data[0]

        
        if data.send_confirmation:
            patient = supabase.table("patients").select("name, phone").eq("id", data.patient_id).execute()
            clinic  = supabase.table("clinics").select("name").eq("id", current_clinic["id"]).execute()
            if patient.data and clinic.data:
                appt_str = appt_dt.strftime("%d %b %Y at %I:%M %p")
                background_tasks.add_task(
                    send_booking_confirmation,
                    patient_name     = patient.data[0]["name"],
                    patient_phone    = patient.data[0]["phone"],
                    clinic_name      = clinic.data[0]["name"],
                    appointment_time = appt_str,
                )

        return {"success": True, "appointment": appt}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/clinic/{clinic_id}")
def get_appointments(clinic_id: str, status: Optional[str] = None, date: Optional[str] = None, page: int = 1, per_page: int = 50, current_clinic=Depends(get_current_clinic)):
    if clinic_id != current_clinic["id"]:
        raise HTTPException(status_code=403, detail="Access denied")
    supabase = get_supabase()
    query = supabase.table("appointments")\
        .select("*, patients(name, phone)")\
        .eq("clinic_id", clinic_id)\
        .order("appointment_time")

    if status:
        query = query.eq("status", status)
    if date:
        
        query = query.gte("appointment_time", f"{date}T00:00:00")\
                     .lte("appointment_time", f"{date}T23:59:59")

    resp = query.range((page - 1) * per_page, page * per_page - 1).execute()
    return {"appointments": resp.data, "total": len(resp.data)}


@router.post("/{appointment_id}/mark-noshow")
def mark_no_show(appointment_id: str, current_clinic=Depends(get_current_clinic)):
    """Manually mark an appointment as no-show and send rebook message."""
    supabase = get_supabase()
    from app.services.whatsapp import send_noshow_rebook

    appt = supabase.table("appointments")\
        .select("*, patients(name, phone), clinics(name)")\
        .eq("id", appointment_id).execute()

    if not appt.data:
        raise HTTPException(status_code=404, detail="Appointment not found")

    appt_data = appt.data[0]
    if appt_data["clinic_id"] != current_clinic["id"]:
        raise HTTPException(status_code=403, detail="Access denied")

    patient   = appt_data.get("patients", {})
    clinic    = appt_data.get("clinics", {})

    supabase.table("appointments").update({"status": "no_show"}).eq("id", appointment_id).execute()

    success = send_noshow_rebook(
        patient_name  = patient.get("name", "Patient"),
        patient_phone = patient.get("phone"),
        clinic_name   = clinic.get("name", "Clinic"),
    )

    supabase.table("message_logs").insert({
        "appointment_id": appointment_id,
        "patient_phone":  patient.get("phone"),
        "message_type":   "no_show_rebook",
        "success":        success,
    }).execute()

    return {"success": True, "message": "Marked as no-show, rebook WhatsApp sent"}


@router.post("/{appointment_id}/complete")
def complete_appointment(appointment_id: str, current_clinic=Depends(get_current_clinic)):
    supabase = get_supabase()
    existing = get_supabase().table("appointments").select("clinic_id").eq("id", appointment_id).execute()
    if not existing.data:
        raise HTTPException(status_code=404, detail="Appointment not found")
    if existing.data[0]["clinic_id"] != current_clinic["id"]:
        raise HTTPException(status_code=403, detail="Access denied")
    supabase.table("appointments").update({"status": "completed"}).eq("id", appointment_id).execute()
    return {"success": True, "message": "Appointment marked as completed"}


@router.patch("/{appointment_id}")
def update_appointment(appointment_id: str, data: AppointmentUpdate, current_clinic=Depends(get_current_clinic)):
    supabase = get_supabase()
    existing = get_supabase().table("appointments").select("clinic_id").eq("id", appointment_id).execute()
    if not existing.data:
        raise HTTPException(status_code=404, detail="Appointment not found")
    if existing.data[0]["clinic_id"] != current_clinic["id"]:
        raise HTTPException(status_code=403, detail="Access denied")
    updates = {k: v for k, v in data.model_dump().items() if v is not None}
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")
    resp = supabase.table("appointments").update(updates).eq("id", appointment_id).execute()
    return {"success": True, "appointment": resp.data[0]}


@router.delete("/{appointment_id}")
def cancel_appointment(appointment_id: str, current_clinic=Depends(get_current_clinic)):
    supabase = get_supabase()
    existing = get_supabase().table("appointments").select("clinic_id").eq("id", appointment_id).execute()
    if not existing.data:
        raise HTTPException(status_code=404, detail="Appointment not found")
    if existing.data[0]["clinic_id"] != current_clinic["id"]:
        raise HTTPException(status_code=403, detail="Access denied")
    supabase.table("appointments").update({"status": "cancelled"}).eq("id", appointment_id).execute()
    return {"success": True, "message": "Appointment cancelled"}


@router.get("/logs/{clinic_id}")
def get_message_logs(clinic_id: str, current_clinic=Depends(get_current_clinic)):
    if clinic_id != current_clinic["id"]:
        raise HTTPException(status_code=403, detail="Access denied")
    """Get all WhatsApp message logs for a clinic."""
    supabase = get_supabase()
    resp = supabase.table("message_logs")\
        .select("*, appointments(appointment_time, status, patients(name, phone))")\
        .eq("appointments.clinic_id", clinic_id)\
        .order("sent_at", desc=True)\
        .limit(100)\
        .execute()
    return {"logs": resp.data, "total": len(resp.data)}


@router.post("/trigger-reminders")
def trigger_reminders_manually(background_tasks: BackgroundTasks, current_clinic=Depends(get_current_clinic)):
    """Manually trigger the reminder job — for testing."""
    from app.scheduler.reminder_scheduler import check_and_send_reminders
    
    background_tasks.add_task(check_and_send_reminders)
    return {"success": True, "message": "Reminder job triggered in background"}


@router.post("/trigger-noshow-check")
def trigger_noshow_manually(background_tasks: BackgroundTasks, current_clinic=Depends(get_current_clinic)):
    """Manually trigger no-show detection — for testing."""
    from app.scheduler.reminder_scheduler import check_and_handle_noshows
    
    background_tasks.add_task(check_and_handle_noshows)
    return {"success": True, "message": "No-show check triggered in background"}
