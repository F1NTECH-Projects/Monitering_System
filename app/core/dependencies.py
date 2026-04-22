from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from bson import ObjectId

from app.core.security import decode_token
from app.db.mongodb import get_collection

bearer_scheme = HTTPBearer()


async def get_current_clinic(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
):
    payload = decode_token(credentials.credentials, token_type="clinic")
    if not payload:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")

    clinic_id = payload.get("clinic_id")
    if not clinic_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload")

    clinics = get_collection("clinics")
    clinic = await clinics.find_one({"_id": ObjectId(clinic_id)})
    if not clinic:
        raise HTTPException(status_code=404, detail="Clinic not found")
    if not clinic.get("is_active"):
        raise HTTPException(status_code=403, detail="Clinic subscription is not active")

    clinic["id"] = str(clinic["_id"])
    return clinic


async def get_current_admin(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
):
    payload = decode_token(credentials.credentials, token_type="admin")
    if not payload:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid admin token")
    return payload
