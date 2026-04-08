import logging
from datetime import datetime, timedelta, timezone
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger

from app.db.supabase_client import get_supabase
from app.services.whatsapp import send_reminder, send_noshow_rebook
from app.core.config import settings
from app.scheduler.lock import acquire_lock, release_lock

logger = logging.getLogger(__name__)
scheduler = BackgroundScheduler()

def check_and_send_reminders():
    if not acquire_lock("reminder_job"):
        logger.debug("Reminder job already running, skipping")
        return
    
    try:
        logger.info("Starting reminder job...")
        supabase = get_supabase()
        
        window_start = datetime.now(timezone.utc) + timedelta(hours=settings.REMINDER_BEFORE_HOURS - 1)
        window_end = datetime.now(timezone.utc) + timedelta(hours=settings.REMINDER_BEFORE_HOURS + 1)
        
        response = supabase.table("appointments").select(
            "*, patients(name, phone), clinics(name)"
        ).eq("status", "scheduled").eq("reminder_sent", False).gte(
            "appointment_time", window_start.isoformat()
        ).lte("appointment_time", window_end.isoformat()).execute()
        
        appointments = response.data or []
        logger.info(f"Found {len(appointments)} appointments to remind")
        
        sent_count = 0
        failed_count = 0
        
        for appt in appointments:
            try:
                patient = appt.get("patients", {})
                clinic = appt.get("clinics", {})
                appt_dt = datetime.fromisoformat(appt["appointment_time"])
                appt_str = appt_dt.strftime("%d %b %Y at %I:%M %p")
                
                success = send_reminder(
                    patient_name=patient.get("name", "Patient"),
                    patient_phone=patient.get("phone"),
                    clinic_name=clinic.get("name", "Clinic"),
                    appointment_time=appt_str,
                )
                
                supabase.table("message_logs").insert({
                    "appointment_id": appt["id"],
                    "patient_phone": patient.get("phone"),
                    "message_type": "reminder",
                    "success": success,
                }).execute()
                
                supabase.table("appointments").update({
                    "reminder_sent": True
                }).eq("id", appt["id"]).execute()
                
                if success:
                    sent_count += 1
                else:
                    failed_count += 1
                    
            except Exception as e:
                logger.error(f"Failed to process appointment {appt.get('id')}: {e}", exc_info=True)
                failed_count += 1
        
        logger.info(f"Reminder job completed: {sent_count} sent, {failed_count} failed")
        
    except Exception as e:
        logger.error(f"Reminder job failed: {e}", exc_info=True)
    finally:
        release_lock("reminder_job")

def check_and_handle_noshows():
    if not acquire_lock("noshow_job"):
        logger.debug("No-show job already running, skipping")
        return
    
    try:
        logger.info("Starting no-show check...")
        supabase = get_supabase()
        
        cutoff = datetime.now(timezone.utc) - timedelta(minutes=settings.NOSHOW_CHECK_MINUTES)
        lower_bound = datetime.now(timezone.utc) - timedelta(hours=48)
        
        response = supabase.table("appointments").select(
            "*, patients(name, phone), clinics(name)"
        ).eq("status", "scheduled").gte(
            "appointment_time", lower_bound.isoformat()
        ).lte("appointment_time", cutoff.isoformat()).execute()
        
        noshows = response.data or []
        logger.info(f"Found {len(noshows)} missed appointments")
        
        for appt in noshows:
            try:
                patient = appt.get("patients", {})
                clinic = appt.get("clinics", {})
                
                supabase.table("appointments").update({
                    "status": "no_show"
                }).eq("id", appt["id"]).execute()
                
                success = send_noshow_rebook(
                    patient_name=patient.get("name", "Patient"),
                    patient_phone=patient.get("phone"),
                    clinic_name=clinic.get("name", "Clinic"),
                )
                
                supabase.table("message_logs").insert({
                    "appointment_id": appt["id"],
                    "patient_phone": patient.get("phone"),
                    "message_type": "no_show_rebook",
                    "success": success,
                }).execute()
                
            except Exception as e:
                logger.error(f"Failed to handle no-show {appt.get('id')}: {e}", exc_info=True)
        
        logger.info(f"No-show job completed: {len(noshows)} checked")
        
    except Exception as e:
        logger.error(f"No-show job failed: {e}", exc_info=True)
    finally:
        release_lock("noshow_job")

def start_scheduler():
    try:
        scheduler.add_job(
            check_and_send_reminders,
            trigger=IntervalTrigger(hours=settings.REMINDER_INTERVAL_HOURS),
            id="reminder_job",
            replace_existing=True,
            next_run_time=datetime.now(timezone.utc),
            max_instances=1,
        )
        
        scheduler.add_job(
            check_and_handle_noshows,
            trigger=IntervalTrigger(minutes=30),
            id="noshow_job",
            replace_existing=True,
            max_instances=1,
        )
        
        scheduler.start()
        logger.info("Scheduler started successfully")
        
    except Exception as e:
        logger.error(f"Failed to start scheduler: {e}", exc_info=True)
        raise

def stop_scheduler():
    try:
        scheduler.shutdown(wait=True)
        logger.info("Scheduler stopped")
    except Exception as e:
        logger.error(f"Error stopping scheduler: {e}")
