import requests
import logging
from app.core.config import settings

logger = logging.getLogger(__name__)

WHATSAPP_API_URL = f"https://graph.facebook.com/v18.0/{settings.WHATSAPP_PHONE_ID}/messages"


def _headers():
    return {
        "Authorization": f"Bearer {settings.WHATSAPP_TOKEN}",
        "Content-Type": "application/json",
    }


def send_text_message(to_phone: str, message: str) -> bool:
    """Send a plain text WhatsApp message. Phone format: 919876543210"""
    payload = {
        "messaging_product": "whatsapp",
        "recipient_type": "individual",
        "to": to_phone,
        "type": "text",
        "text": {"preview_url": False, "body": message},
    }
    try:
        resp = requests.post(WHATSAPP_API_URL, json=payload, headers=_headers(), timeout=10)
        resp.raise_for_status()
        logger.info(f"WhatsApp sent to {to_phone}")
        return True
    except Exception as e:
        logger.error(f"WhatsApp failed to {to_phone}: {e}")
        return False


def send_reminder(patient_name: str, patient_phone: str, clinic_name: str, appointment_time: str) -> bool:
    message = (
        f"Hello {patient_name}! 👋\n\n"
        f"This is a reminder for your appointment at *{clinic_name}* "
        f"tomorrow at *{appointment_time}*.\n\n"
        f"Please reply CONFIRM to confirm or CANCEL to cancel.\n\n"
        f"See you soon! 😊"
    )
    return send_text_message(patient_phone, message)


def send_noshow_rebook(patient_name: str, patient_phone: str, clinic_name: str) -> bool:
    message = (
        f"Hi {patient_name}, we missed you today at *{clinic_name}*! 😊\n\n"
        f"We'd love to reschedule your appointment. "
        f"Please reply with your preferred date and time, or call us directly.\n\n"
        f"We look forward to seeing you soon!"
    )
    return send_text_message(patient_phone, message)


def send_booking_confirmation(patient_name: str, patient_phone: str, clinic_name: str, appointment_time: str) -> bool:
    message = (
        f"✅ Appointment Confirmed!\n\n"
        f"Hello {patient_name}, your appointment at *{clinic_name}* "
        f"is confirmed for *{appointment_time}*.\n\n"
        f"You'll receive a reminder 24 hours before. See you then!"
    )
    return send_text_message(patient_phone, message)
