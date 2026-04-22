import logging
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from app.core.config import settings

logger = logging.getLogger(__name__)


async def send_email(to_email: str, subject: str, html_body: str, text_body: str = "") -> bool:
    if not settings.email_enabled:
        logger.info(f"[EMAIL MOCK] To: {to_email} | Subject: {subject}")
        return True

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = f"{settings.EMAIL_FROM_NAME} <{settings.SMTP_USER}>"
        msg["To"] = to_email

        if text_body:
            msg.attach(MIMEText(text_body, "plain"))
        msg.attach(MIMEText(html_body, "html"))

        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            server.starttls()
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.sendmail(settings.SMTP_USER, to_email, msg.as_string())

        logger.info(f"Email sent to {to_email}")
        return True
    except Exception as e:
        logger.error(f"Email error for {to_email}: {e}")
        return False


async def send_email_reminder(
    patient_name: str,
    patient_email: str,
    clinic_name: str,
    appointment_time: str,
    portal_url: str = "",
) -> bool:
    subject = f"Appointment Reminder - {clinic_name}"
    html = f"""
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#07091a;color:#e2e8f9;border-radius:16px;overflow:hidden;">
      <div style="background:linear-gradient(135deg,#7c3aed,#06b6d4);padding:32px;text-align:center;">
        <h1 style="margin:0;font-size:28px;font-weight:900;color:white;">CLINIQ</h1>
        <p style="margin:8px 0 0;color:rgba(255,255,255,0.8);">Appointment Reminder</p>
      </div>
      <div style="padding:32px;">
        <p style="font-size:18px;">Hello <strong>{patient_name}</strong>,</p>
        <p>This is a reminder for your upcoming appointment:</p>
        <div style="background:rgba(124,58,237,0.15);border:1px solid rgba(124,58,237,0.3);border-radius:12px;padding:20px;margin:20px 0;">
          <p style="margin:0;font-size:20px;font-weight:700;">🏥 {clinic_name}</p>
          <p style="margin:8px 0 0;font-size:16px;color:#a78bfa;">📅 {appointment_time}</p>
        </div>
        <div style="text-align:center;margin:24px 0;">
          <a href="{portal_url}" style="display:inline-block;background:linear-gradient(135deg,#7c3aed,#06b6d4);color:white;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:700;">
            Confirm / Reschedule Appointment
          </a>
        </div>
        <p style="color:#6b7280;font-size:14px;">If you have questions, please contact the clinic directly.</p>
      </div>
      <div style="background:rgba(255,255,255,0.03);padding:16px;text-align:center;">
        <p style="margin:0;color:#6b7280;font-size:12px;">Powered by CLINIQ Healthcare Management</p>
      </div>
    </div>
    """
    return await send_email(patient_email, subject, html)


async def send_email_confirmation(
    patient_name: str,
    patient_email: str,
    clinic_name: str,
    appointment_time: str,
    portal_url: str = "",
) -> bool:
    subject = f"Appointment Confirmed - {clinic_name}"
    html = f"""
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#07091a;color:#e2e8f9;border-radius:16px;overflow:hidden;">
      <div style="background:linear-gradient(135deg,#059669,#06b6d4);padding:32px;text-align:center;">
        <h1 style="margin:0;font-size:28px;font-weight:900;color:white;">✅ Confirmed!</h1>
      </div>
      <div style="padding:32px;">
        <p>Hello <strong>{patient_name}</strong>,</p>
        <p>Your appointment at <strong>{clinic_name}</strong> is confirmed for <strong>{appointment_time}</strong>.</p>
        <div style="text-align:center;margin:24px 0;">
          <a href="{portal_url}" style="display:inline-block;background:linear-gradient(135deg,#059669,#06b6d4);color:white;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:700;">
            Manage Appointment
          </a>
        </div>
      </div>
    </div>
    """
    return await send_email(patient_email, subject, html)
