import logging
from app.core.config import settings

logger = logging.getLogger(__name__)


async def send_sms(to_phone: str, message: str) -> bool:
    """Send SMS via Twilio as fallback when WhatsApp fails."""
    if not settings.sms_enabled:
        logger.info(f"[SMS MOCK] To: {to_phone} | {message[:60]}...")
        return True

    try:
        from twilio.rest import Client
        client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)

        # Format phone number
        phone = to_phone if to_phone.startswith("+") else f"+{to_phone}"

        msg = client.messages.create(
            body=message[:1600],
            from_=settings.TWILIO_FROM_NUMBER,
            to=phone,
        )
        logger.info(f"SMS sent to {phone}: {msg.sid}")
        return True
    except ImportError:
        logger.error("Twilio not installed. Run: pip install twilio")
        return False
    except Exception as e:
        logger.error(f"SMS error for {to_phone}: {e}")
        return False


async def send_sms_reminder(
    patient_name: str,
    patient_phone: str,
    clinic_name: str,
    appointment_time: str,
    portal_url: str = "",
) -> bool:
    message = (
        f"CLINIQ Reminder: Hi {patient_name}, you have an appointment at {clinic_name} on {appointment_time}. "
        f"Confirm/Reschedule: {portal_url}"
    )
    return await send_sms(patient_phone, message)
