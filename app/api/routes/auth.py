from fastapi import APIRouter, HTTPException, Request, Depends
from slowapi import Limiter
from slowapi.util import get_remote_address
from pydantic import BaseModel, EmailStr, field_validator
from datetime import datetime, timezone

from app.db.mongodb import get_collection
from app.db.serializer import serialize_doc
from app.core.security import hash_password, verify_password, create_access_token
from app.core.dependencies import get_current_clinic

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)


class RegisterRequest(BaseModel):
    name: str
    phone: str
    owner_name: str
    owner_email: EmailStr
    password: str
    address: str = ""

    @field_validator("password")
    @classmethod
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        return v

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v):
        import re
        digits = re.sub(r'\D', '', v)
        if not re.match(r'^91[6-9]\d{9}$', digits):
            raise ValueError("Phone must be format 919876543210")
        return digits


class LoginRequest(BaseModel):
    owner_email: EmailStr
    password: str


@router.post("/register", status_code=201)
@limiter.limit("5/hour")
async def register(request: Request, data: RegisterRequest):
    clinics = get_collection("clinics")
    existing = await clinics.find_one({"owner_email": data.owner_email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed = hash_password(data.password)
    doc = {
        "name": data.name,
        "phone": data.phone,
        "owner_name": data.owner_name,
        "owner_email": data.owner_email,
        "password_hash": hashed,
        "address": data.address,
        "is_active": True,
        "plan": "free",
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
    }
    result = await clinics.insert_one(doc)
    clinic_id = str(result.inserted_id)

    token = create_access_token({"clinic_id": clinic_id, "email": data.owner_email})
    clinic = serialize_doc(doc)
    clinic["id"] = clinic_id
    clinic.pop("password_hash", None)

    return {"access_token": token, "token_type": "bearer", "clinic": clinic}


@router.post("/login")
@limiter.limit("10/minute")
async def login(request: Request, data: LoginRequest):
    clinics = get_collection("clinics")
    clinic = await clinics.find_one({"owner_email": data.owner_email})
    if not clinic or not verify_password(data.password, clinic.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    clinic_id = str(clinic["_id"])
    token = create_access_token({"clinic_id": clinic_id, "email": data.owner_email})
    serialized = serialize_doc(clinic)
    serialized.pop("password_hash", None)

    return {"access_token": token, "token_type": "bearer", "clinic": serialized}


@router.get("/me")
async def me(current_clinic=Depends(get_current_clinic)):
    current_clinic.pop("password_hash", None)
    return {"clinic": current_clinic}
