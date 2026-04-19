import asyncio
import logging
from datetime import datetime, timedelta, timezone
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger

from app.db.mongodb import get_collection
from app.core.config import settings

logger = logging.getLogger(__name__)
scheduler = BackgroundScheduler()


def run_async(coro):
    """Run an async coroutine from sync context."""
    try:
        loop = asyncio.get_event_loop()
        if loop.is_running():
            import concurrent.futures
            with concurrent.futures.ThreadPoolExecutor() as pool:
                future = pool.submit(asyncio.run, coro)
                return future.result()
        else:
            return loop.run_until_complete(coro)
    except RuntimeError:
        return asyncio.run(coro)


async def _check_and_send_reminders():
    from app.services.whatsapp import send_reminder
    from app.services.sms import send_sms_reminder
    from app.services.email_service import send_email_reminder

    appointments = get_collection("appointments")
    message_logs = get_collection("message_logs")
    patients = get_collection("patients")

    window_start = datetime.now(timezone.utc) + timedelta(hours=settings.REMINDER_BEFORE_HOURS - 1)
    window_end = datetime.now(timezone.utc) + timedelta(hours=settings.REMINDER_BEFORE_HOURS + 1)

    cursor = appointments.find({
        "status": "scheduled",
        "reminder_sent": False,
        "appointment_time": {"$gte": window_start, "$lte": window_end},
    })
    appts = await cursor.to_list(500)
    logger.info(f"Reminder job: {len(appts)} appointments to remind")

    sent, failed = 0, 0
    for appt in appts:
        try:
            patient = await patients.find_one({"_id": __import__("bson").ObjectId(appt["patient_id"])}) if appt.get("patient_id") else None
            language = patient.get("language", "en") if patient else "en"
            patient_email = patient.get("email") if patient else None

            appt_dt = appt["appointment_time"]
            appt_str = appt_dt.strftime("%d %b %Y at %I:%M %p UTC")
            portal_url = f"{settings.PORTAL_BASE_URL}/{appt.get('portal_token', '')}"

            # Try WhatsApp first
            wa_success = await send_reminder(
                patient_name=appt.get("patient_name", "Patient"),
                patient_phone=appt.get("patient_phone", ""),
                clinic_name=appt.get("clinic_name", "Clinic"),
                appointment_time=appt_str,
                portal_url=portal_url,
                language=language,
            )

            # SMS fallback if WhatsApp fails
            sms_success = False
            if not wa_success and settings.sms_enabled:
                sms_success = await send_sms_reminder(
                    patient_name=appt.get("patient_name", "Patient"),
                    patient_phone=appt.get("patient_phone", ""),
                    clinic_name=appt.get("clinic_name", "Clinic"),
                    appointment_time=appt_str,
                    portal_url=portal_url,
                )

            # Email if available
            email_success = False
            if patient_email and settings.email_enabled:
                email_success = await send_email_reminder(
                    patient_name=appt.get("patient_name", "Patient"),
                    patient_email=patient_email,
                    clinic_name=appt.get("clinic_name", "Clinic"),
                    appointment_time=appt_str,
                    portal_url=portal_url,
                )

            overall_success = wa_success or sms_success or email_success

            # Log
            log_entries = []
            if wa_success or not wa_success:
                log_entries.append({
                    "appointment_id": str(appt["_id"]),
                    "clinic_id": appt.get("clinic_id"),
                    "patient_phone": appt.get("patient_phone"),
                    "message_type": "reminder",
                    "channel": "whatsapp",
                    "success": wa_success,
                    "sent_at": datetime.now(timezone.utc),
                })
            if not wa_success and settings.sms_enabled:
                log_entries.append({
                    "appointment_id": str(appt["_id"]),
                    "clinic_id": appt.get("clinic_id"),
                    "patient_phone": appt.get("patient_phone"),
                    "message_type": "reminder",
                    "channel": "sms",
                    "success": sms_success,
                    "sent_at": datetime.now(timezone.utc),
                })
            if patient_email:
                log_entries.append({
                    "appointment_id": str(appt["_id"]),
                    "clinic_id": appt.get("clinic_id"),
                    "patient_phone": appt.get("patient_phone"),
                    "message_type": "reminder",
                    "channel": "email",
                    "success": email_success,
                    "sent_at": datetime.now(timezone.utc),
                })

            if log_entries:
                await message_logs.insert_many(log_entries)

            await appointments.update_one(
                {"_id": appt["_id"]},
                {"$set": {"reminder_sent": True}}
            )

            if overall_success:
                sent += 1
            else:
                failed += 1

        except Exception as e:
            logger.error(f"Reminder failed for {appt.get('_id')}: {e}", exc_info=True)
            failed += 1

    logger.info(f"Reminder job done: {sent} sent, {failed} failed")


async def _check_and_handle_noshows():
    from app.services.whatsapp import send_noshow_rebook
    appointments = get_collection("appointments")
    message_logs = get_collection("message_logs")
    patients = get_collection("patients")

    cutoff = datetime.now(timezone.utc) - timedelta(minutes=settings.NOSHOW_CHECK_MINUTES)
    lower = datetime.now(timezone.utc) - timedelta(hours=48)

    cursor = appointments.find({
        "status": "scheduled",
        "appointment_time": {"$gte": lower, "$lte": cutoff},
    })
    missed = await cursor.to_list(200)
    logger.info(f"No-show check: {len(missed)} missed appointments")

    for appt in missed:
        try:
            patient = await patients.find_one({"_id": __import__("bson").ObjectId(appt["patient_id"])}) if appt.get("patient_id") else None
            language = patient.get("language", "en") if patient else "en"

            await appointments.update_one(
                {"_id": appt["_id"]},
                {"$set": {"status": "no_show"}}
            )

            success = await send_noshow_rebook(
                patient_name=appt.get("patient_name", "Patient"),
                patient_phone=appt.get("patient_phone", ""),
                clinic_name=appt.get("clinic_name", "Clinic"),
                language=language,
            )

            await message_logs.insert_one({
                "appointment_id": str(appt["_id"]),
                "clinic_id": appt.get("clinic_id"),
                "patient_phone": appt.get("patient_phone"),
                "message_type": "no_show_rebook",
                "channel": "whatsapp",
                "success": success,
                "sent_at": datetime.now(timezone.utc),
            })
        except Exception as e:
            logger.error(f"No-show handler failed: {e}", exc_info=True)


def check_and_send_reminders():
    run_async(_check_and_send_reminders())


def check_and_handle_noshows():
    run_async(_check_and_handle_noshows())


def start_scheduler():
    scheduler.add_job(
        check_and_send_reminders,
        trigger=IntervalTrigger(hours=settings.REMINDER_INTERVAL_HOURS),
        id="reminder_job",
        replace_existing=True,
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
    logger.info("Scheduler started")


def stop_scheduler():
    try:
        scheduler.shutdown(wait=False)
        logger.info("Scheduler stopped")
    except Exception:
        pass
