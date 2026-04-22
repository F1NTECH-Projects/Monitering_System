from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from pymongo import ASCENDING, DESCENDING
import logging

from app.core.config import settings

logger = logging.getLogger(__name__)

_client: AsyncIOMotorClient = None
_db: AsyncIOMotorDatabase = None


async def connect_db():
    global _client, _db
    _client = AsyncIOMotorClient(settings.MONGODB_URL)
    _db = _client[settings.MONGODB_DB_NAME]
    logger.info(f"Connected to MongoDB: {settings.MONGODB_DB_NAME}")


async def close_db():
    global _client
    if _client:
        _client.close()
        logger.info("MongoDB connection closed")


def get_database() -> AsyncIOMotorDatabase:
    return _db


def get_collection(name: str):
    return _db[name]


async def create_indexes():
    db = get_database()

    # Clinics
    await db.clinics.create_index("owner_email", unique=True)
    await db.clinics.create_index("phone", unique=True)

    # Patients
    await db.patients.create_index([("clinic_id", ASCENDING), ("phone", ASCENDING)], unique=True)
    await db.patients.create_index("clinic_id")

    # Appointments
    await db.appointments.create_index("clinic_id")
    await db.appointments.create_index("patient_id")
    await db.appointments.create_index("appointment_time")
    await db.appointments.create_index("status")
    await db.appointments.create_index("reminder_sent")
    await db.appointments.create_index("portal_token", sparse=True)

    # Message logs
    await db.message_logs.create_index("appointment_id")
    await db.message_logs.create_index([("sent_at", DESCENDING)])
    await db.message_logs.create_index("clinic_id")

    # Scheduler locks
    await db.scheduler_locks.create_index("job_name", unique=True)
    await db.scheduler_locks.create_index("expires_at", expireAfterSeconds=0)

    logger.info("MongoDB indexes created")
