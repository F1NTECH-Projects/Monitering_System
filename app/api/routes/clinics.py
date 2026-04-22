from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone
from bson import ObjectId

from app.db.mongodb import get_collection
from app.db.serializer import serialize_doc
from app.core.dependencies import get_current_clinic

router = APIRouter()

class ClinicUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    owner_name: Optional[str] = None
    upi_id: Optional[str] = None



@router.get("/{clinic_id}/dashboard")
async def get_clinic_dashboard(clinic_id: str, current_clinic=Depends(get_current_clinic)):
    if clinic_id != current_clinic["id"]:
        raise HTTPException(status_code=403, detail="Access denied")
    clinics = get_collection("clinics")
    clinic = await clinics.find_one({"_id": ObjectId(clinic_id)}, {"password_hash": 0})
    if not clinic:
        raise HTTPException(status_code=404, detail="Clinic not found")
    return serialize_doc(clinic)


@router.get("/{clinic_id}")
async def get_clinic_stats(clinic_id: str, current_clinic=Depends(get_current_clinic)):
    if clinic_id != current_clinic["id"]:
        raise HTTPException(status_code=403, detail="Access denied")
    patients = get_collection("patients")
    appointments = get_collection("appointments")
    now = datetime.now(timezone.utc)
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    today_end = now.replace(hour=23, minute=59, second=59, microsecond=0)

    total_patients = await patients.count_documents({"clinic_id": clinic_id})
    today_appts = await appointments.count_documents({
        "clinic_id": clinic_id,
        "appointment_time": {"$gte": today_start, "$lte": today_end}
    })
    today_docs_cursor = appointments.find({
        "clinic_id": clinic_id,
        "appointment_time": {"$gte": today_start, "$lte": today_end}
    }).limit(100)
    today_docs = await today_docs_cursor.to_list(100)
    noshows = await appointments.count_documents({"clinic_id": clinic_id, "status": "no_show"})
    return {
        "total_patients": total_patients,
        "today_appointments": today_appts,
        "today_details": [serialize_doc(d) for d in today_docs],
        "total_no_shows": noshows,
    }


@router.patch("/{clinic_id}")
async def update_clinic(clinic_id: str, data: ClinicUpdate, current_clinic=Depends(get_current_clinic)):
    if clinic_id != current_clinic["id"]:
        raise HTTPException(status_code=403, detail="Access denied")

    clinics = get_collection("clinics")
    updates = {k: v for k, v in data.model_dump().items() if v is not None}
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")
    updates["updated_at"] = datetime.now(timezone.utc)
    await clinics.update_one({"_id": ObjectId(clinic_id)}, {"$set": updates})
    updated = await clinics.find_one({"_id": ObjectId(clinic_id)}, {"password_hash": 0})
    return {"success": True, "clinic": serialize_doc(updated)}
