from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.scheduler.reminder_scheduler import start_scheduler, stop_scheduler
from app.api.routes import clinics, patients, appointments, webhooks, auth
from app.core.config import settings


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

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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

