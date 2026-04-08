from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    SUPABASE_URL: str
    SUPABASE_KEY: str

    WHATSAPP_TOKEN: str
    WHATSAPP_PHONE_ID: str

    RAZORPAY_KEY_ID: str
    RAZORPAY_KEY_SECRET: str
    RAZORPAY_WEBHOOK_SECRET: str = ""
    RAZORPAY_PLAN_ID: str = ""

    APP_ENV: str = "development"
    CORS_ALLOWED_ORIGINS: str = "http://localhost:3000,https://yourdomain.com"

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
validate_settings()


def validate_settings():
    if settings.APP_ENV == "production":
        if settings.JWT_SECRET == "change-this-to-a-long-random-secret" or len(settings.JWT_SECRET) < 32:
            raise RuntimeError("JWT_SECRET must be at least 32 characters in production")
        if not settings.RAZORPAY_WEBHOOK_SECRET:
            raise RuntimeError("RAZORPAY_WEBHOOK_SECRET must be set in production")
        if not settings.RAZORPAY_PLAN_ID:
            raise RuntimeError("RAZORPAY_PLAN_ID must be set in production")
        if settings.CORS_ALLOWED_ORIGINS == "*":
            raise RuntimeError("Wildcard CORS not allowed in production")


validate_settings()
