import logging
from datetime import datetime, timedelta
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger

from app.db.supabase_client import get_supabase
from app.services.whatsapp import send_reminder, send_noshow_rebook
from app.core.config import settings

logger = logging.getLogger(__name__)
scheduler = BackgroundScheduler()


def check_and_send_reminders():
    """Find appointments in the next 23-25 hours and send WhatsApp reminders."""
    logger.info("Scheduler: checking upcoming appointments...")
    supabase = get_supabase()

    window_start = datetime.utcnow() + timedelta(hours=settings.REMINDER_BEFORE_HOURS - 1)
    window_end   = datetime.utcnow() + timedelta(hours=settings.REMINDER_BEFORE_HOURS + 1)

    try:
        response = (
            supabase.table("appointments")
            .select("*, patients(name, phone), clinics(name)")
            .eq("status", "scheduled")
            .eq("reminder_sent", False)
            .gte("appointment_time", window_start.isoformat())
            .lte("appointment_time", window_end.isoformat())
            .execute()
        )

        appointments = response.data or []
        logger.info(f"Scheduler: found {len(appointments)} appointments to remind")

        for appt in appointments:
            patient    = appt.get("patients", {})
            clinic     = appt.get("clinics", {})
            appt_dt    = datetime.fromisoformat(appt["appointment_time"])
            appt_str   = appt_dt.strftime("%d %b %Y at %I:%M %p")

            success = send_reminder(
                patient_name     = patient.get("name", "Patient"),
                patient_phone    = patient.get("phone"),
                clinic_name      = clinic.get("name", "Clinic"),
                appointment_time = appt_str,
            )

            # Log message
            supabase.table("message_logs").insert({
                "appointment_id": appt["id"],
                "patient_phone":  patient.get("phone"),
                "message_type":   "reminder",
                "success":        success,
            }).execute()

            # Mark reminder sent
            supabase.table("appointments").update({
                "reminder_sent": True
            }).eq("id", appt["id"]).execute()

    except Exception as e:
        logger.error(f"Scheduler reminder job failed: {e}")


def check_and_handle_noshows():
    """Find appointments that passed X minutes ago and are still 'scheduled' — mark as no-show."""
    logger.info("Scheduler: checking no-shows...")
    supabase = get_supabase()

    cutoff = datetime.utcnow() - timedelta(minutes=settings.NOSHOW_CHECK_MINUTES)

    try:
        response = (
            supabase.table("appointments")
            .select("*, patients(name, phone), clinics(name)")
            .eq("status", "scheduled")
            .lte("appointment_time", cutoff.isoformat())
            .execute()
        )

        noshows = response.data or []
        logger.info(f"Scheduler: found {len(noshows)} no-shows")

        for appt in noshows:
            patient = appt.get("patients", {})
            clinic  = appt.get("clinics", {})

            # Mark no-show
            supabase.table("appointments").update({
                "status": "no_show"
            }).eq("id", appt["id"]).execute()

            # Send rebook message
            success = send_noshow_rebook(
                patient_name  = patient.get("name", "Patient"),
                patient_phone = patient.get("phone"),
                clinic_name   = clinic.get("name", "Clinic"),
            )

            supabase.table("message_logs").insert({
                "appointment_id": appt["id"],
                "patient_phone":  patient.get("phone"),
                "message_type":   "no_show_rebook",
                "success":        success,
            }).execute()

    except Exception as e:
        logger.error(f"Scheduler no-show job failed: {e}")


def start_scheduler():
    scheduler.add_job(
        check_and_send_reminders,
        trigger=IntervalTrigger(hours=settings.REMINDER_INTERVAL_HOURS),
        id="reminder_job",
        replace_existing=True,
        next_run_time=datetime.utcnow(),   # Run immediately on startup too
    )
    scheduler.add_job(
        check_and_handle_noshows,
        trigger=IntervalTrigger(minutes=30),
        id="noshow_job",
        replace_existing=True,
    )
    scheduler.start()
    logger.info("Scheduler started — reminder + no-show jobs running")


def stop_scheduler():
    scheduler.shutdown(wait=False)
    logger.info("Scheduler stopped")
