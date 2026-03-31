from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):

    SUPABASE_URL: str
    SUPABASE_KEY: str


    WHATSAPP_TOKEN: str
    WHATSAPP_PHONE_ID: str


    RAZORPAY_KEY_ID: str
    RAZORPAY_KEY_SECRET: str
    RAZORPAY_WEBHOOK_SECRET: str = ""


    APP_ENV: str = "development"

    # JWT
    JWT_SECRET: str = "change-this-to-a-long-random-secret"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_HOURS: int = 24
    REMINDER_INTERVAL_HOURS: int = 1           
    REMINDER_BEFORE_HOURS: int = 24           
    NOSHOW_CHECK_MINUTES: int = 30            

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()


# Add these lines inside the Settings class manually - see next command


def validate_settings():
    if settings.APP_ENV == "production" and settings.JWT_SECRET == "change-this-to-a-long-random-secret":
        raise RuntimeError("JWT_SECRET must be set in production")

validate_settings()
