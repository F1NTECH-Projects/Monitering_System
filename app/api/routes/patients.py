from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from app.db.supabase_client import get_supabase

router = APIRouter()


class PatientCreate(BaseModel):
    clinic_id: str
    name: str
    phone: str                 # Format: 919876543210
    age: Optional[int] = None
    notes: Optional[str] = ""


class PatientUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    age: Optional[int] = None
    notes: Optional[str] = None


@router.post("/add")
def add_patient(data: PatientCreate):
    supabase = get_supabase()
    try:
        resp = supabase.table("patients").insert({
            "clinic_id": data.clinic_id,
            "name":      data.name,
            "phone":     data.phone,
            "age":       data.age,
            "notes":     data.notes,
        }).execute()
        return {"success": True, "patient": resp.data[0]}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/clinic/{clinic_id}")
def get_patients(clinic_id: str):
    supabase = get_supabase()
    resp = supabase.table("patients").select("*").eq("clinic_id", clinic_id).order("created_at", desc=True).execute()
    return {"patients": resp.data, "total": len(resp.data)}


@router.get("/{patient_id}")
def get_patient(patient_id: str):
    supabase = get_supabase()
    resp = supabase.table("patients").select("*, appointments(*)").eq("id", patient_id).execute()
    if not resp.data:
        raise HTTPException(status_code=404, detail="Patient not found")
    return resp.data[0]


@router.patch("/{patient_id}")
def update_patient(patient_id: str, data: PatientUpdate):
    supabase = get_supabase()
    updates = {k: v for k, v in data.dict().items() if v is not None}
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")
    resp = supabase.table("patients").update(updates).eq("id", patient_id).execute()
    return {"success": True, "patient": resp.data[0]}


@router.delete("/{patient_id}")
def delete_patient(patient_id: str):
    supabase = get_supabase()
    supabase.table("patients").delete().eq("id", patient_id).execute()
    return {"success": True, "message": "Patient deleted"}
