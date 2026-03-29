from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from app.db.supabase_client import get_supabase
from app.services.razorpay_service import create_subscription

router = APIRouter()


class ClinicRegister(BaseModel):
    name: str
    phone: str
    owner_name: str
    owner_email: str
    address: Optional[str] = ""


class ClinicUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    owner_name: Optional[str] = None
    address: Optional[str] = None


@router.post("/register")
def register_clinic(data: ClinicRegister):
    supabase = get_supabase()
    try:
        # Create clinic
        resp = supabase.table("clinics").insert({
            "name":       data.name,
            "phone":      data.phone,
            "owner_name": data.owner_name,
            "owner_email": data.owner_email,
            "address":    data.address,
            "is_active":  False,   
        }).execute()

        clinic = resp.data[0]

        
        payment = create_subscription(
            clinic_name  = data.name,
            owner_email  = data.owner_email,
            owner_phone  = data.phone,
        )

        
        supabase.table("clinics").update({
            "razorpay_subscription_id": payment["subscription_id"],
        }).eq("id", clinic["id"]).execute()

        return {
            "success":     True,
            "clinic":      clinic,
            "payment_url": payment["payment_url"],
            "message":     "Share payment_url with the clinic owner to activate their subscription",
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{clinic_id}")
def get_clinic(clinic_id: str):
    supabase = get_supabase()
    resp = supabase.table("clinics").select("*").eq("id", clinic_id).execute()
    if not resp.data:
        raise HTTPException(status_code=404, detail="Clinic not found")
    return resp.data[0]


@router.get("/{clinic_id}/stats")
def get_clinic_stats(clinic_id: str):
    """Dashboard stats for the clinic."""
    supabase = get_supabase()
    from datetime import datetime, timedelta

    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0).isoformat()
    today_end   = datetime.utcnow().replace(hour=23, minute=59, second=59).isoformat()

    total_patients = supabase.table("patients").select("id", count="exact").eq("clinic_id", clinic_id).execute()
    today_appts    = supabase.table("appointments").select("id, status", count="exact")\
                        .eq("clinic_id", clinic_id)\
                        .gte("appointment_time", today_start)\
                        .lte("appointment_time", today_end).execute()
    noshows_total  = supabase.table("appointments").select("id", count="exact")\
                        .eq("clinic_id", clinic_id).eq("status", "no_show").execute()

    return {
        "total_patients":   total_patients.count or 0,
        "today_appointments": today_appts.count or 0,
        "today_details":    today_appts.data,
        "total_no_shows":   noshows_total.count or 0,
    }


@router.patch("/{clinic_id}")
def update_clinic(clinic_id: str, data: ClinicUpdate):
    supabase = get_supabase()
    updates = {k: v for k, v in data.dict().items() if v is not None}
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")
    resp = supabase.table("clinics").update(updates).eq("id", clinic_id).execute()
    return {"success": True, "clinic": resp.data[0]}
