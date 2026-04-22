import logging

logger = logging.getLogger(__name__)

def send_sms(phone: str, message: str) -> bool:
    """
    Mock SMS Gateway (e.g. Twilio)
    In a real market-ready app, this would use Twilio or AWS SNS:
    
    from twilio.rest import Client
    client = Client(TWILIO_SID, TWILIO_AUTH_TOKEN)
    message = client.messages.create(body=message, from_=TWILIO_PHONE, to=phone)
    return message.sid is not None
    """
    try:
        logger.info(f"[SMS MOCK] Sending SMS to {phone}")
        logger.debug(f"[SMS MOCK] Content: {message}")
        return True
    except Exception as e:
        logger.error(f"[SMS MOCK] Failed to send SMS to {phone}: {e}")
        return False
