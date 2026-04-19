from fastapi import APIRouter, HTTPException, Depends, Query
from pydantic import BaseModel, field_validator
from typing import Optional
from datetime import datetime, timezone
from bson import ObjectId

from app.db.mongodb import get_collection
from app.db.serializer import serialize_doc, serialize_list
from app.core.dependencies import get_current_clinic

router = APIRouter()


class PatientCreate(BaseModel):
    name: str
    phone: str
    age: Optional[int] = None
    email: Optional[str] = None
    notes: str = ""
    language: str = "en"

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v):
        import re
        digits = re.sub(r'\D', '', v)
        if not re.match(r'^91[6-9]\d{9}$', digits):
            raise ValueError("Phone format: 919876543210")
        return digits


class PatientUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    age: Optional[int] = None
    email: Optional[str] = None
    notes: Optional[str] = None
    language: Optional[str] = None


@router.post("/add", status_code=201)
async def add_patient(data: PatientCreate, current_clinic=Depends(get_current_clinic)):
    patients = get_collection("patients")
    clinic_id = current_clinic["id"]

    existing = await patients.find_one({"clinic_id": clinic_id, "phone": data.phone})
    if existing:
        raise HTTPException(status_code=400, detail="Patient with this phone already exists")

    doc = {
        "clinic_id": clinic_id,
        "name": data.name,
        "phone": data.phone,
        "age": data.age,
        "email": data.email,
        "notes": data.notes,
        "language": data.language,
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
    }
    result = await patients.insert_one(doc)
    doc["_id"] = result.inserted_id
    return {"success": True, "patient": serialize_doc(doc)}


@router.get("/clinic/{clinic_id}")
async def get_patients(
    clinic_id: str,
    page: int = Query(1, ge=1),
    per_page: int = Query(50, ge=1, le=200),
    search: Optional[str] = None,
    current_clinic=Depends(get_current_clinic),
):
    if clinic_id != current_clinic["id"]:
        raise HTTPException(status_code=403, detail="Access denied")

    patients = get_collection("patients")
    query: dict = {"clinic_id": clinic_id}

    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"phone": {"$regex": search}},
            {"email": {"$regex": search, "$options": "i"}},
        ]

    total = await patients.count_documents(query)
    cursor = patients.find(query).sort("created_at", -1).skip((page - 1) * per_page).limit(per_page)
    docs = await cursor.to_list(per_page)

    return {"patients": serialize_list(docs), "total": total, "page": page, "per_page": per_page}


@router.get("/{patient_id}")
async def get_patient(patient_id: str, current_clinic=Depends(get_current_clinic)):
    patients = get_collection("patients")
    appointments = get_collection("appointments")

    try:
        patient = await patients.find_one({"_id": ObjectId(patient_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid patient ID")

    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    if patient["clinic_id"] != current_clinic["id"]:
        raise HTTPException(status_code=403, detail="Access denied")

    appts_cursor = appointments.find({"patient_id": patient_id}).sort("appointment_time", -1).limit(20)
    appts = await appts_cursor.to_list(20)

    result = serialize_doc(patient)
    result["appointments"] = serialize_list(appts)
    return result


@router.patch("/{patient_id}")
async def update_patient(patient_id: str, data: PatientUpdate, current_clinic=Depends(get_current_clinic)):
    patients = get_collection("patients")
    try:
        existing = await patients.find_one({"_id": ObjectId(patient_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid patient ID")

    if not existing:
        raise HTTPException(status_code=404, detail="Patient not found")
    if existing["clinic_id"] != current_clinic["id"]:
        raise HTTPException(status_code=403, detail="Access denied")

    updates = {k: v for k, v in data.model_dump().items() if v is not None}
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")

    updates["updated_at"] = datetime.now(timezone.utc)
    await patients.update_one({"_id": ObjectId(patient_id)}, {"$set": updates})
    updated = await patients.find_one({"_id": ObjectId(patient_id)})
    return {"success": True, "patient": serialize_doc(updated)}


@router.delete("/{patient_id}")
async def delete_patient(patient_id: str, current_clinic=Depends(get_current_clinic)):
    patients = get_collection("patients")
    try:
        existing = await patients.find_one({"_id": ObjectId(patient_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid patient ID")

    if not existing:
        raise HTTPException(status_code=404, detail="Patient not found")
    if existing["clinic_id"] != current_clinic["id"]:
        raise HTTPException(status_code=403, detail="Access denied")

    await patients.delete_one({"_id": ObjectId(patient_id)})
    return {"success": True, "message": "Patient deleted"}
