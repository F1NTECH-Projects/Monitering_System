import requests
import logging
import re
from app.core.config import settings

logger = logging.getLogger(__name__)

WHATSAPP_API_URL = f"https://graph.facebook.com/v18.0/{settings.WHATSAPP_PHONE_ID}/messages"
WHATSAPP_API_TIMEOUT = 10

def _headers():
    return {
        "Authorization": f"Bearer {settings.WHATSAPP_TOKEN}",
        "Content-Type": "application/json",
    }

def _sanitize_phone(phone: str) -> str:
    digits = re.sub(r'\D', '', phone)
    if not re.match(r'^91[6-9]\d{9}$', digits):
        logger.warning(f"Invalid phone format: {phone}")
        return None
    return digits

def send_text_message(to_phone: str, message: str) -> bool:
    phone = _sanitize_phone(to_phone)
    if not phone:
        logger.error(f"Invalid phone format: {to_phone}")
        return False
    
    if len(message) > 4096:
        logger.warning(f"Message truncated from {len(message)} chars")
        message = message[:4096]
    
    payload = {
        "messaging_product": "whatsapp",
        "recipient_type": "individual",
        "to": phone,
        "type": "text",
        "text": {"preview_url": False, "body": message},
    }
    
    try:
        resp = requests.post(
            WHATSAPP_API_URL,
            json=payload,
            headers=_headers(),
            timeout=WHATSAPP_API_TIMEOUT
        )
        resp.raise_for_status()
        
        logger.info(f"WhatsApp message sent to {phone}")
        return True
        
    except requests.exceptions.Timeout:
        logger.error(f"WhatsApp timeout for {phone} after {WHATSAPP_API_TIMEOUT}s")
        return False
    except requests.exceptions.HTTPError as e:
        logger.error(f"WhatsApp HTTP error for {phone}: {e.response.status_code}")
        return False
    except Exception as e:
        logger.error(f"WhatsApp error for {phone}: {e}", exc_info=True)
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
        f"Appointment Confirmed!\n\n"
        f"Hello {patient_name}, your appointment at *{clinic_name}* "
        f"is confirmed for *{appointment_time}*.\n\n"
        f"You'll receive a reminder 24 hours before. See you then!"
    )
    return send_text_message(patient_phone, message)
