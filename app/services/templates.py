"""
Templates for WhatsApp, SMS, and Email in multiple languages.
Supported: 'en' (English), 'es' (Spanish), 'hi' (Hindi).
"""

TEMPLATES = {
    "en": {
        "reminder": "Hello {patient_name},\nThis is a reminder from {clinic_name} for your appointment on {appointment_time}.\n\nTo confirm or reschedule, please view your portal:\n{portal_link}",
        "noshow": "Hello {patient_name},\nYou missed your appointment with {clinic_name}. Please rebook by contacting us or visiting your portal.",
        "booking": "Hello {patient_name},\nYour appointment with {clinic_name} is confirmed for {appointment_time}. We look forward to seeing you!"
    },
    "es": {
         "reminder": "Hola {patient_name},\nEste es un recordatorio de {clinic_name} para su cita el {appointment_time}.\n\nPara confirmar o reprogramar, por favor vea su portal:\n{portal_link}",
         "noshow": "Hola {patient_name},\nPerdió su cita con {clinic_name}. Por favor, vuelva a reservar contactándonos o visitando su portal.",
         "booking": "Hola {patient_name},\nSu cita con {clinic_name} está confirmada para el {appointment_time}. ¡Esperamos verle!"
    },
    "hi": {
        "reminder": "नमस्ते {patient_name},\nयह {clinic_name} की ओर से {appointment_time} को आपकी नियुक्ति के लिए एक अनुस्मारक है।\nपोर्टल लिंक: {portal_link}",
        "noshow": "नमस्ते {patient_name},\nआप {clinic_name} के साथ अपनी नियुक्ति से चूक गए। कृपया पुनः बुक करें।",
        "booking": "नमस्ते {patient_name},\n{clinic_name} के साथ आपकी नियुक्ति {appointment_time} के लिए पक्की हो गई है।"
    }
}

def get_template(lang: str, template_type: str, **kwargs) -> str:
    lang = lang if lang in TEMPLATES else "en"
    template_str = TEMPLATES[lang].get(template_type, TEMPLATES["en"][template_type])
    return template_str.format(**kwargs)
