import os
import logging
from datetime import datetime, timezone, timedelta
from app.db.supabase_client import get_supabase

logger = logging.getLogger(__name__)
LOCK_TABLE = "scheduler_locks"
LOCK_TTL_SECONDS = 55

def acquire_lock(job_name: str) -> bool:
    supabase = get_supabase()
    now = datetime.now(timezone.utc)
    worker_id = os.getpid()
    expires_at = (now + timedelta(seconds=LOCK_TTL_SECONDS)).isoformat()
    
    try:
        existing = supabase.table(LOCK_TABLE).select("*").eq("job_name", job_name).execute()
        
        if existing.data:
            lock = existing.data[0]
            lock_expires = datetime.fromisoformat(lock["expires_at"])
            if lock_expires.tzinfo is None:
                lock_expires = lock_expires.replace(tzinfo=timezone.utc)
            
            if lock_expires > now:
                logger.debug(f"Lock held by worker {lock['worker_id']} for {job_name}")
                return False
            
            resp = supabase.table(LOCK_TABLE).update({
                "worker_id": worker_id,
                "expires_at": expires_at,
                "acquired_at": now.isoformat(),
            }).eq("job_name", job_name).execute()
            
            if not resp.data:
                logger.debug(f"Failed to acquire expired lock for {job_name}")
                return False
        else:
            resp = supabase.table(LOCK_TABLE).insert({
                "job_name": job_name,
                "worker_id": worker_id,
                "expires_at": expires_at,
                "acquired_at": now.isoformat(),
            }).execute()
            
            if not resp.data:
                logger.error(f"Failed to create lock for {job_name}")
                return False
        
        logger.info(f"Lock acquired for {job_name} (worker {worker_id})")
        return True
        
    except Exception as e:
        logger.error(f"Lock acquire failed for {job_name}: {e}", exc_info=True)
        return False

def release_lock(job_name: str) -> bool:
    try:
        supabase = get_supabase()
        supabase.table(LOCK_TABLE).delete().eq("job_name", job_name).execute()
        logger.info(f"Lock released for {job_name}")
        return True
    except Exception as e:
        logger.error(f"Lock release failed for {job_name}: {e}", exc_info=True)
        return False

def force_release_expired_locks():
    try:
        supabase = get_supabase()
        now = datetime.now(timezone.utc).isoformat()
        
        supabase.table(LOCK_TABLE).delete().lte("expires_at", now).execute()
        logger.info("Expired locks cleaned up")
    except Exception as e:
        logger.error(f"Lock cleanup failed: {e}")
