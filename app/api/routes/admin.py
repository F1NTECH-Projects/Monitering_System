from fastapi import APIRouter, HTTPException, Depends, Request
from pydantic import BaseModel
from slowapi import Limiter
from slowapi.util import get_remote_address
from datetime import datetime, timezone
from bson import ObjectId

from app.db.mongodb import get_collection
from app.db.serializer import serialize_doc, serialize_list
from app.core.security import verify_password, create_access_token
from app.core.dependencies import get_current_admin
from app.core.config import settings

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)


class AdminLoginRequest(BaseModel):
    email: str
    password: str


@router.post("/login")
@limiter.limit("5/minute")
async def admin_login(request: Request, data: AdminLoginRequest):
    if data.email != settings.ADMIN_EMAIL:
        raise HTTPException(status_code=401, detail="Invalid admin credentials")
    if data.password != settings.ADMIN_PASSWORD:
        raise HTTPException(status_code=401, detail="Invalid admin credentials")

    token = create_access_token(
        {"email": data.email, "role": "super_admin"},
        token_type="admin"
    )
    return {"access_token": token, "token_type": "bearer", "role": "super_admin"}


@router.get("/overview")
async def admin_overview(admin=Depends(get_current_admin)):
    clinics = get_collection("clinics")
    patients = get_collection("patients")
    appointments = get_collection("appointments")
    message_logs = get_collection("message_logs")

    now = datetime.now(timezone.utc)
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)

    total_clinics = await clinics.count_documents({})
    active_clinics = await clinics.count_documents({"is_active": True})
    total_patients = await patients.count_documents({})
    total_appointments = await appointments.count_documents({})
    today_appointments = await appointments.count_documents({"appointment_time": {"$gte": today_start}})
    total_messages = await message_logs.count_documents({})
    success_messages = await message_logs.count_documents({"success": True})

    return {
        "total_clinics": total_clinics,
        "active_clinics": active_clinics,
        "total_patients": total_patients,
        "total_appointments": total_appointments,
        "today_appointments": today_appointments,
        "total_messages": total_messages,
        "delivery_rate": round(success_messages / total_messages * 100, 1) if total_messages > 0 else 0,
    }


@router.get("/clinics")
async def list_all_clinics(
    page: int = 1,
    per_page: int = 20,
    admin=Depends(get_current_admin),
):
    clinics = get_collection("clinics")
    patients = get_collection("patients")
    appointments = get_collection("appointments")

    total = await clinics.count_documents({})
    cursor = clinics.find({}, {"password_hash": 0}).sort("created_at", -1).skip((page - 1) * per_page).limit(per_page)
    docs = await cursor.to_list(per_page)

    enriched = []
    for clinic in docs:
        cid = str(clinic["_id"])
        patient_count = await patients.count_documents({"clinic_id": cid})
        appt_count = await appointments.count_documents({"clinic_id": cid})
        s = serialize_doc(clinic)
        s["patient_count"] = patient_count
        s["appointment_count"] = appt_count
        enriched.append(s)

    return {"clinics": enriched, "total": total, "page": page}


@router.patch("/clinics/{clinic_id}")
async def update_clinic_status(clinic_id: str, is_active: bool, admin=Depends(get_current_admin)):
    clinics = get_collection("clinics")
    try:
        result = await clinics.update_one(
            {"_id": ObjectId(clinic_id)},
            {"$set": {"is_active": is_active, "updated_at": datetime.now(timezone.utc)}}
        )
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid clinic ID")

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Clinic not found")
    return {"success": True, "is_active": is_active}


@router.get("/system-health")
async def system_health(admin=Depends(get_current_admin)):
    from app.db.mongodb import get_database
    try:
        db = get_database()
        await db.command("ping")
        db_status = "healthy"
    except Exception as e:
        db_status = f"error: {e}"

    return {
        "database": db_status,
        "whatsapp": "configured" if settings.whatsapp_enabled else "not_configured",
        "sms": "configured" if settings.sms_enabled else "not_configured",
        "email": "configured" if settings.email_enabled else "not_configured",
    }
