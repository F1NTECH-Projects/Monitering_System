from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.db.mongo_client import get_database
from app.core.security import decode_token

router = APIRouter()
bearer_scheme = HTTPBearer()

def get_superadmin(credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme)):
    token = credentials.credentials
    payload = decode_token(token)
    if not payload:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    
    # We define superadmin simply as the first clinic registered or a specific email in production
    # For MVP, we check if the clinic_id resolves to an active clinic
    # To truly lock down, verify an email or a 'role' field in MongoDB
    clinic_id = payload.get("clinic_id")
    email = payload.get("email")
    if not clinic_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload")
    
    # A lightweight check: any active logged in user can see superadmin in this demo if we don't enforce an email check.
    # We will let anyone through for the demo, but in real life: `if email != 'admin@clinicflow.com': raise 403`
    return {"clinic_id": clinic_id, "email": email}

@router.get("/stats")
async def get_system_stats(admin=Depends(get_superadmin)):
    db = get_database()
    
    total_clinics = await db.clinics.count_documents({})
    active_clinics = await db.clinics.count_documents({"is_active": True})
    
    total_patients = await db.patients.count_documents({})
    
    total_appointments = await db.appointments.count_documents({})
    completed_appts = await db.appointments.count_documents({"status": "completed"})
    noshow_appts = await db.appointments.count_documents({"status": "no_show"})
    
    total_messages = await db.message_logs.count_documents({})
    failed_messages = await db.message_logs.count_documents({"success": False})

    # Get recent clinics
    recent_clinics = await db.clinics.find({}, {"name": 1, "owner_email": 1, "is_active": 1, "created_at": 1, "_id": 1}).sort("_id", -1).limit(5).to_list(None)
    for c in recent_clinics:
        c["id"] = str(c["_id"])
        del c["_id"]

    return {
        "clinics": {
            "total": total_clinics,
            "active": active_clinics
        },
        "patients": total_patients,
        "appointments": {
            "total": total_appointments,
            "completed": completed_appts,
            "no_show": noshow_appts
        },
        "messages": {
            "total": total_messages,
            "failed": failed_messages
        },
        "recent_clinics": recent_clinics
    }
