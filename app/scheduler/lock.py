"""
Distributed scheduler lock — prevents duplicate jobs across workers.
Uses Supabase as a simple lock store. Only one worker runs jobs at a time.
"""
import os
import logging
from datetime import datetime, timezone, timedelta
from app.db.supabase_client import get_supabase

logger = logging.getLogger(__name__)
LOCK_TABLE = "scheduler_locks"
LOCK_TTL_SECONDS = 55  # slightly less than 1 min interval


def acquire_lock(job_name: str) -> bool:
    """Try to acquire a lock. Returns True if acquired, False if another worker holds it."""
    supabase = get_supabase()
    now = datetime.now(timezone.utc)
    expires_at = (now + timedelta(seconds=LOCK_TTL_SECONDS)).isoformat()

    try:
        # Try to upsert — if lock exists and not expired, do nothing
        existing = supabase.table(LOCK_TABLE).select("*").eq("job_name", job_name).execute()

        if existing.data:
            lock = existing.data[0]
            lock_expires = datetime.fromisoformat(lock["expires_at"])
            if lock_expires.tzinfo is None:
                lock_expires = lock_expires.replace(tzinfo=timezone.utc)
            if lock_expires > now:
                logger.debug("Lock held by another worker for job: %s", job_name)
                return False
            # Lock expired — take it
            supabase.table(LOCK_TABLE).update({
                "worker_id": os.getpid(),
                "expires_at": expires_at,
                "acquired_at": now.isoformat(),
            }).eq("job_name", job_name).execute()
        else:
            supabase.table(LOCK_TABLE).insert({
                "job_name": job_name,
                "worker_id": os.getpid(),
                "expires_at": expires_at,
                "acquired_at": now.isoformat(),
            }).execute()

        logger.debug("Lock acquired for job: %s (worker %s)", job_name, os.getpid())
        return True

    except Exception as e:
        logger.error("Lock acquire failed for %s: %s", job_name, e)
        return False


def release_lock(job_name: str):
    try:
        supabase = get_supabase()
        supabase.table(LOCK_TABLE).delete().eq("job_name", job_name).execute()
    except Exception as e:
        logger.error("Lock release failed for %s: %s", job_name, e)
