import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from fastapi import Request
import uuid

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

from app.db.mongodb import connect_db, close_db, create_indexes
from app.scheduler.reminder_scheduler import start_scheduler, stop_scheduler
from app.api.routes import auth, clinics, patients, appointments, analytics, admin, portal, webhooks, chat
from app.core.config import settings

limiter = Limiter(key_func=get_remote_address)


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        return response


class RequestIDMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        request_id = str(uuid.uuid4())
        request.state.request_id = request_id
        response = await call_next(request)
        response.headers["X-Request-ID"] = request_id
        return response


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting CLINIQ API...")
    await connect_db()
    await create_indexes()
    start_scheduler()
    yield
    stop_scheduler()
    await close_db()
    logger.info("CLINIQ API shutdown complete")


app = FastAPI(
    title="CLINIQ - Healthcare Management API",
    description="Automated WhatsApp clinic reminder system with analytics, SMS fallback, email reminders, and patient portal",
    version="2.0.0",
    lifespan=lifespan,
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

origins = settings.CORS_ALLOWED_ORIGINS.split(",") if settings.CORS_ALLOWED_ORIGINS else ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "DELETE", "PUT"],
    allow_headers=["Content-Type", "Authorization", "X-Request-ID"],
    expose_headers=["X-Request-ID"],
)
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(RequestIDMiddleware)

app.include_router(auth.router,         prefix="/api/v1/auth",         tags=["Auth"])
app.include_router(clinics.router,      prefix="/api/v1/clinics",      tags=["Clinics"])
app.include_router(patients.router,     prefix="/api/v1/patients",     tags=["Patients"])
app.include_router(appointments.router, prefix="/api/v1/appointments", tags=["Appointments"])
app.include_router(analytics.router,    prefix="/api/v1/analytics",    tags=["Analytics"])
app.include_router(admin.router,        prefix="/api/v1/admin",        tags=["Admin"])
app.include_router(portal.router,       prefix="/api/v1/portal",       tags=["Portal"])
app.include_router(webhooks.router,     prefix="/api/v1/webhooks",     tags=["Webhooks"])
app.include_router(chat.router,         prefix="/api/v1/chat",         tags=["Chat"])


@app.get("/", tags=["Health"])
async def root():
    return {"status": "running", "version": "2.0.0", "service": "CLINIQ API"}


@app.get("/health", tags=["Health"])
async def health():
    return {"status": "healthy"}


@app.get("/health/detailed", tags=["Health"])
async def detailed_health():
    from app.db.mongodb import get_database
    try:
        db = get_database()
        await db.command("ping")
        db_status = "connected"
    except Exception as e:
        db_status = f"error: {e}"
    return {
        "status": "healthy" if db_status == "connected" else "degraded",
        "database": db_status,
        "channels": {
            "whatsapp": settings.whatsapp_enabled,
            "sms": settings.sms_enabled,
            "email": settings.email_enabled,
        }
    }
