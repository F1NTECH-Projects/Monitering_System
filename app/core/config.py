from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # MongoDB
    MONGODB_URL: str = "mongodb://localhost:27017"
    MONGODB_DB_NAME: str = "cliniq"

    # JWT
    JWT_SECRET: str = "change-this-to-a-64-char-random-secret-minimum-64-characters"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_HOURS: int = 24

    # Admin JWT
    ADMIN_JWT_SECRET: str = "separate-admin-jwt-secret-also-64-chars-minimum-required-!!"
    ADMIN_EMAIL: str = "admin@cliniq.io"
    ADMIN_PASSWORD: str = "SecureAdminPassword123!"

    # WhatsApp
    WHATSAPP_TOKEN: str = ""
    WHATSAPP_PHONE_ID: str = ""

    # Twilio SMS
    TWILIO_ACCOUNT_SID: str = ""
    TWILIO_AUTH_TOKEN: str = ""
    TWILIO_FROM_NUMBER: str = ""

    # Email
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    EMAIL_FROM_NAME: str = "CLINIQ Reminders"

    # Razorpay
    RAZORPAY_KEY_ID: str = ""
    RAZORPAY_KEY_SECRET: str = ""
    RAZORPAY_WEBHOOK_SECRET: str = ""
    RAZORPAY_PLAN_ID: str = ""

    # App
    APP_ENV: str = "development"
    CORS_ALLOWED_ORIGINS: str = "http://localhost:3000"
    REMINDER_INTERVAL_HOURS: int = 1
    REMINDER_BEFORE_HOURS: int = 24
    NOSHOW_CHECK_MINUTES: int = 30

    # Portal
    PORTAL_BASE_URL: str = "http://localhost:3000/portal"
    PORTAL_TOKEN_EXPIRE_HOURS: int = 72

    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"

    @property
    def sms_enabled(self) -> bool:
        return bool(self.TWILIO_ACCOUNT_SID and self.TWILIO_AUTH_TOKEN)

    @property
    def email_enabled(self) -> bool:
        return bool(self.SMTP_USER and self.SMTP_PASSWORD)

    @property
    def whatsapp_enabled(self) -> bool:
        return bool(self.WHATSAPP_TOKEN and self.WHATSAPP_PHONE_ID)


settings = Settings()
