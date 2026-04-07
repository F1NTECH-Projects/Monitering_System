import re
from html import escape

def sanitize_text(text: str, max_length: int = 500) -> str:
    """Remove dangerous characters and limit length."""
    if not text:
        return ""
    
    # Remove null bytes
    text = text.replace('\x00', '')
    # HTML escape
    text = escape(text)
    # Truncate
    return text[:max_length]

def sanitize_phone(phone: str) -> str:
    """Sanitize phone number (digits only)."""
    digits = re.sub(r'\D', '', phone)
    if not re.match(r'^91[6-9]\d{9}$', digits):
        raise ValueError("Invalid Indian phone number")
    return digits

def sanitize_email(email: str) -> str:
    """Basic email validation."""
    email = email.lower().strip()
    if not re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', email):
        raise ValueError("Invalid email")
    return email
