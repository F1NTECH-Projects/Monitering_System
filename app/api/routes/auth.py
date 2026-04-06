from fastapi import APIRouter, Request, HTTPException, status
from pydantic import BaseModel, EmailStr
from app.db.supabase_client import get_supabase
from app.core.security import hash_password, verify_password, create_access_token
from app.core.dependencies import get_current_clinic
from fastapi import Depends

router = APIRouter()

class RegisterRequest(BaseModel):
    name: str
    phone: str
    owner_name: str
    owner_email: EmailStr
    password: str
    address: str = ""

class LoginRequest(BaseModel):
    owner_email: EmailStr
    password: str

@router.post("/register", status_code=201)
def register(data: RegisterRequest):
    supabase = get_supabase()

    # Check email not already used
    existing = supabase.table("clinics").select("id").eq("owner_email", data.owner_email).execute()
    if existing.data:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed = hash_password(data.password)

    resp = supabase.table("clinics").insert({
        "name":           data.name,
        "phone":          data.phone,
        "owner_name":     data.owner_name,
        "owner_email":    data.owner_email,
        "password_hash":  hashed,
        "address":        data.address,
        "is_active":      True,   # set True for now, False after Razorpay live
    }).execute()

    clinic = resp.data[0]
    token = create_access_token({"clinic_id": clinic["id"], "email": data.owner_email})

    return {
        "access_token": token,
        "token_type":   "bearer",
        "clinic":       {k: v for k, v in clinic.items() if k != "password_hash"}
    }

@router.post("/login")
@limiter.limit("5/minute")
def login(data: LoginRequest):
    supabase = get_supabase()

    resp = supabase.table("clinics").select("*").eq("owner_email", data.owner_email).execute()
    if not resp.data:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    clinic = resp.data[0]

    if not verify_password(data.password, clinic.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token({"clinic_id": clinic["id"], "email": data.owner_email})

    return {
        "access_token": token,
        "token_type":   "bearer",
        "clinic":       {k: v for k, v in clinic.items() if k != "password_hash"}
    }

@router.get("/me")
def me(current_clinic=Depends(get_current_clinic)):
    return {"clinic": current_clinic}
