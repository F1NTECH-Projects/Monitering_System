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
        # Atomic: delete expired lock first, then insert
        supabase.table(LOCK_TABLE).delete().eq(
            "job_name", job_name
        ).lt("expires_at", now.isoformat()).execute()

        resp = supabase.table(LOCK_TABLE).insert({
            "job_name": job_name,
            "worker_id": worker_id,
            "expires_at": expires_at,
            "acquired_at": now.isoformat(),
        }).execute()

        if not resp.data:
            logger.debug(f"Lock already held for {job_name}")
            return False

        logger.info(f"Lock acquired for {job_name} (worker {worker_id})")
        return True

    except Exception as e:
        # Insert conflict = another worker just acquired it
        logger.debug(f"Lock acquire failed for {job_name}: {e}")
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
