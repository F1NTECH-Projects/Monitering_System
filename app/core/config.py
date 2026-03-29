from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):

    SUPABASE_URL: str
    SUPABASE_KEY: str


    WHATSAPP_TOKEN: str
    WHATSAPP_PHONE_ID: str


    RAZORPAY_KEY_ID: str
    RAZORPAY_KEY_SECRET: str


    APP_ENV: str = "development"
    REMINDER_INTERVAL_HOURS: int = 1           
    REMINDER_BEFORE_HOURS: int = 24           
    NOSHOW_CHECK_MINUTES: int = 30            

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
