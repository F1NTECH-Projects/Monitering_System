import requests
import logging
import re
from app.core.config import settings

logger = logging.getLogger(__name__)
TIMEOUT = 8

TEMPLATES = {
    "reminder": {
        "en": "Hello {name}! 👋\n\nReminder: You have an appointment at *{clinic}* on *{time}*.\n\n✅ Confirm: {portal_url}\n❌ Reschedule: {portal_url}\n\nSee you soon!",
        "hi": "नमस्ते {name}! 👋\n\n*{clinic}* में आपकी अपॉइंटमेंट *{time}* को है।\n\n✅ पुष्टि करें: {portal_url}\n\nमिलते हैं!",
        "ta": "வணக்கம் {name}! 👋\n\n*{clinic}* இல் உங்கள் நேரம் *{time}* ஆகும்.\n\n✅ உறுதிப்படுத்தவும்: {portal_url}",
        "te": "నమస్కారం {name}! 👋\n\n*{clinic}* లో మీ అపాయింట్మెంట్ *{time}* కి ఉంది.\n\n✅ నిర్ధారించండి: {portal_url}",
    },
    "confirmation": {
        "en": "🎉 Appointment Confirmed!\n\nHello {name}, your appointment at *{clinic}* is confirmed for *{time}*.\n\nManage your appointment: {portal_url}\n\nYou'll receive a reminder before your visit. See you then!",
        "hi": "🎉 अपॉइंटमेंट कन्फर्म!\n\nनमस्ते {name}, *{clinic}* में आपकी अपॉइंटमेंट *{time}* के लिए पक्की है।\n\nप्रबंधन: {portal_url}",
        "ta": "🎉 நேரம் உறுதிப்படுத்தப்பட்டது!\n\n{name}, *{clinic}* இல் உங்கள் நேரம் *{time}* க்கு உறுதி.\n\nநிர்வகி: {portal_url}",
        "te": "🎉 అపాయింట్మెంట్ నిర్ధారించబడింది!\n\n{name}, *{clinic}* లో *{time}* కి మీ అపాయింట్మెంట్ నిర్ధారించబడింది.\n\nనిర్వహించండి: {portal_url}",
    },
    "noshow": {
        "en": "Hi {name}, we missed you today at *{clinic}*! 😊\n\nWe'd love to reschedule. Reply with your preferred date/time or call us directly.\n\nSee you soon!",
        "hi": "नमस्ते {name}, आज *{clinic}* में आपसे मुलाकात नहीं हो पाई! 😊\n\nकृपया नई तारीख बताएं।",
        "ta": "வணக்கம் {name}, இன்று *{clinic}* இல் உங்களை பார்க்கவில்லை! 😊\n\nவேறு நேரம் பதிவு செய்யலாம்.",
        "te": "నమస్కారం {name}, ఈరోజు *{clinic}* లో మీరు రాలేదు! 😊\n\nమళ్ళీ అపాయింట్మెంట్ పెట్టుకోండి.",
    },
}


def _headers():
    return {
        "Authorization": f"Bearer {settings.WHATSAPP_TOKEN}",
        "Content-Type": "application/json",
    }


def _sanitize_phone(phone: str):
    digits = re.sub(r'\D', '', phone or "")
    if not re.match(r'^91[6-9]\d{9}$', digits):
        return None
    return digits


async def send_text_message(to_phone: str, message: str) -> bool:
    if not settings.whatsapp_enabled:
        logger.info(f"[WhatsApp MOCK] To: {to_phone} | {message[:60]}...")
        return True

    phone = _sanitize_phone(to_phone)
    if not phone:
        logger.error(f"Invalid phone: {to_phone}")
        return False

    url = f"https://graph.facebook.com/v18.0/{settings.WHATSAPP_PHONE_ID}/messages"
    payload = {
        "messaging_product": "whatsapp",
        "recipient_type": "individual",
        "to": phone,
        "type": "text",
        "text": {"preview_url": False, "body": message[:4096]},
    }
    try:
        resp = requests.post(url, json=payload, headers=_headers(), timeout=TIMEOUT)
        resp.raise_for_status()
        logger.info(f"WhatsApp sent to {phone}")
        return True
    except requests.exceptions.Timeout:
        logger.error(f"WhatsApp timeout for {phone}")
        return False
    except Exception as e:
        logger.error(f"WhatsApp error for {phone}: {e}")
        return False


async def send_reminder(
    patient_name: str,
    patient_phone: str,
    clinic_name: str,
    appointment_time: str,
    portal_url: str = "",
    language: str = "en",
) -> bool:
    lang = language if language in TEMPLATES["reminder"] else "en"
    template = TEMPLATES["reminder"][lang]
    message = template.format(
        name=patient_name,
        clinic=clinic_name,
        time=appointment_time,
        portal_url=portal_url or "N/A"
    )
    return await send_text_message(patient_phone, message)


async def send_booking_confirmation(
    patient_name: str,
    patient_phone: str,
    clinic_name: str,
    appointment_time: str,
    portal_url: str = "",
    language: str = "en",
) -> bool:
    lang = language if language in TEMPLATES["confirmation"] else "en"
    template = TEMPLATES["confirmation"][lang]
    message = template.format(
        name=patient_name,
        clinic=clinic_name,
        time=appointment_time,
        portal_url=portal_url or "N/A"
    )
    return await send_text_message(patient_phone, message)


async def send_noshow_rebook(
    patient_name: str,
    patient_phone: str,
    clinic_name: str,
    language: str = "en",
) -> bool:
    lang = language if language in TEMPLATES["noshow"] else "en"
    message = TEMPLATES["noshow"][lang].format(name=patient_name, clinic=clinic_name)
    return await send_text_message(patient_phone, message)
