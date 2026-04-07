from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.core.security import decode_token
from app.db.supabase_client import get_supabase
from cachetools import TTLCache
import threading
_cache_lock = threading.Lock()

_clinic_cache = TTLCache(maxsize=500, ttl=300)  # 5 min TTL

bearer_scheme = HTTPBearer()

def get_current_clinic(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme)
):
    token = credentials.credentials
    payload = decode_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )
    clinic_id = payload.get("clinic_id")
    if not clinic_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload"
        )
    # Verify clinic still exists and is active
    supabase = get_supabase()
    if clinic_id in _clinic_cache:
        return _clinic_cache[clinic_id]
    resp = supabase.table("clinics").select("id, name, is_active").eq("id", clinic_id).execute()
    if not resp.data:
        raise HTTPException(status_code=404, detail="Clinic not found")
    clinic = resp.data[0]
    if not clinic["is_active"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Clinic subscription is not active"
        )
    with _cache_lock:
        _clinic_cache[clinic_id] = clinic
    return clinic
