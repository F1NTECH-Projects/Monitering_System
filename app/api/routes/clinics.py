from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone
from app.db.supabase_client import get_supabase
from app.core.dependencies import get_current_clinic
from app.core.cache import invalidate_clinic_cache

class ClinicUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    owner_name: Optional[str] = None
    address: Optional[str] = None

router = APIRouter()

class ClinicUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    owner_name: Optional[str] = None
    address: Optional[str] = None

@router.get("/{clinic_id}/dashboard")
def get_clinic(clinic_id: str, current_clinic=Depends(get_current_clinic)):
    if clinic_id != current_clinic["id"]:
        raise HTTPException(status_code=403, detail="Access denied")
    supabase = get_supabase()
    resp = supabase.table("clinics").select("*").eq("id", clinic_id).execute()
    if not resp.data:
        raise HTTPException(status_code=404, detail="Clinic not found")
    return resp.data[0]

@router.get("/{clinic_id}")
def get_clinic_stats(clinic_id: str, current_clinic=Depends(get_current_clinic)):
    if clinic_id != current_clinic["id"]:
        raise HTTPException(status_code=403, detail="Access denied")
    supabase = get_supabase()
    today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0).isoformat()
    today_end = datetime.now(timezone.utc).replace(hour=23, minute=59, second=59).isoformat()
    total_patients = supabase.table("patients").select("id", count="exact").eq("clinic_id", clinic_id).execute()
    today_appts = supabase.table("appointments").select("id, status", count="exact").eq("clinic_id", clinic_id).gte("appointment_time", today_start).lte("appointment_time", today_end).execute()
    noshows_total = supabase.table("appointments").select("id", count="exact").eq("clinic_id", clinic_id).eq("status", "no_show").execute()
    return {
        "total_patients": total_patients.count or 0,
        "today_appointments": today_appts.count or 0,
        "today_details": today_appts.data,
        "total_no_shows": noshows_total.count or 0,
    }

@router.patch("/{clinic_id}")
def update_clinic(clinic_id: str, data: ClinicUpdate, current_clinic=Depends(get_current_clinic)):
    if clinic_id != current_clinic["id"]:
        raise HTTPException(status_code=403, detail="Access denied")
    supabase = get_supabase()
    updates = {k: v for k, v in data.model_dump().items() if v is not None}
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")
    resp = supabase.table("clinics").update(updates).eq("id", clinic_id).execute()
    invalidate_clinic_cache(clinic_id)
    return {"success": True, "clinic": resp.data[0]}
