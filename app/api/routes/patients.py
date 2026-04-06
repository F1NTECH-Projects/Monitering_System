from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, field_validator
from typing import Optional
from app.db.supabase_client import get_supabase
from app.core.dependencies import get_current_clinic
from fastapi import Depends

router = APIRouter()


class PatientCreate(BaseModel):
    clinic_id: str
    name: str
    phone: str
    age: Optional[int] = None
    notes: Optional[str] = ""

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v: str) -> str:
        import re
        if not re.match(r"^91[6-9]\d{9}$", v):
            raise ValueError("Phone must be in format 919876543210 (India E.164)")
        return v


class PatientUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    age: Optional[int] = None
    notes: Optional[str] = None


@router.post("/add")
def add_patient(data: PatientCreate, current_clinic=Depends(get_current_clinic)):
    supabase = get_supabase()
    try:
        resp = supabase.table("patients").insert({
            "clinic_id": current_clinic["id"],  # always use JWT clinic_id
            "name":      data.name,
            "phone":     data.phone,
            "age":       data.age,
            "notes":     data.notes,
        }).execute()
        return {"success": True, "patient": resp.data[0]}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/clinic/{clinic_id}")
def get_patients(clinic_id: str, current_clinic=Depends(get_current_clinic)):
    if clinic_id != current_clinic["id"]:
        raise HTTPException(status_code=403, detail="Access denied")
    supabase = get_supabase()
    resp = supabase.table("patients").select("*").eq("clinic_id", clinic_id).order("created_at", desc=True).execute()
    return {"patients": resp.data, "total": len(resp.data)}


@router.get("/{patient_id}")
def get_patient(patient_id: str, current_clinic=Depends(get_current_clinic)):
    supabase = get_supabase()
    resp = supabase.table("patients").select("*, appointments(*)").eq("id", patient_id).execute()
    if not resp.data:
        raise HTTPException(status_code=404, detail="Patient not found")
    return resp.data[0]


@router.patch("/{patient_id}")
def update_patient(patient_id: str, data: PatientUpdate, current_clinic=Depends(get_current_clinic)):
    supabase = get_supabase()
    updates = {k: v for k, v in data.model_dump().items() if v is not None}
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")
    resp = supabase.table("patients").update(updates).eq("id", patient_id).execute()
    return {"success": True, "patient": resp.data[0]}


@router.delete("/{patient_id}")
def delete_patient(patient_id: str, current_clinic=Depends(get_current_clinic)):
    supabase = get_supabase()
    supabase.table("patients").delete().eq("id", patient_id).execute()
    return {"success": True, "message": "Patient deleted"}
