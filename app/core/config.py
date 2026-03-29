from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # Supabase
    SUPABASE_URL: str
    SUPABASE_KEY: str

    # WhatsApp
    WHATSAPP_TOKEN: str
    WHATSAPP_PHONE_ID: str

    # Razorpay
    RAZORPAY_KEY_ID: str
    RAZORPAY_KEY_SECRET: str

    # App
    APP_ENV: str = "development"
    REMINDER_INTERVAL_HOURS: int = 1          # How often scheduler checks
    REMINDER_BEFORE_HOURS: int = 24           # Send reminder X hours before appointment
    NOSHOW_CHECK_MINUTES: int = 30            # Mark no-show X mins after appointment time

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
