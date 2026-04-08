from app.core.logging import setup_logging
setup_logging(app_name="clinic-reminder", level="INFO")

from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi import FastAPI
from contextlib import asynccontextmanager

from app.scheduler.reminder_scheduler import start_scheduler, stop_scheduler
from app.api.routes import clinics, patients, appointments, webhooks, auth
from app.core.config import settings
from app.middleware.cors import add_cors_middleware
from app.middleware.security_headers import SecurityHeadersMiddleware
from app.middleware.request_id import RequestIDMiddleware

limiter = Limiter(key_func=get_remote_address)

@asynccontextmanager
async def lifespan(app: FastAPI):
    start_scheduler()
    yield
    stop_scheduler()

app = FastAPI(
    title="Clinic Reminder System",
    description="Automated WhatsApp appointment reminders for clinics",
    version="1.0.0",
    lifespan=lifespan,
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

add_cors_middleware(app)
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(RequestIDMiddleware)   # outermost — runs first

app.include_router(auth.router, prefix="/api/v1/auth", tags=["Auth"])
app.include_router(clinics.router, prefix="/api/v1/clinics", tags=["Clinics"])
app.include_router(patients.router, prefix="/api/v1/patients", tags=["Patients"])
app.include_router(appointments.router, prefix="/api/v1/appointments", tags=["Appointments"])
app.include_router(webhooks.router, prefix="/api/v1/webhooks", tags=["Webhooks"])

@app.get("/", tags=["Health"])
def root():
    return {"status": "running", "message": "Clinic Reminder System API"}

@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "healthy"}

@app.get("/health/detailed", tags=["Health"])
def detailed_health_check():
    try:
        from app.db.supabase_client import get_supabase
        supabase = get_supabase()
        supabase.table("clinics").select("id").limit(1).execute()
        db_status = "healthy"
    except Exception as e:
        db_status = f"unhealthy: {str(e)}"
    return {
        "status": "healthy" if db_status == "healthy" else "degraded",
        "database": db_status,
    }
