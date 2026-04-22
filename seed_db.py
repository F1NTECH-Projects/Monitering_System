"""
CLINIQ Database Seeder
======================
Creates sample data for testing and demo purposes.

Usage:
    python seed_db.py

Requirements:
    - MongoDB running
    - .env file with MONGODB_URL configured
"""
import asyncio
import os
import sys
from datetime import datetime, timezone, timedelta
from pathlib import Path

# Add project root to path
sys.path.insert(0, str(Path(__file__).parent))

from dotenv import load_dotenv
load_dotenv()

from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings
from app.core.security import hash_password, generate_portal_token


DEMO_CLINICS = [
    {
        "name": "Dr. Sharma Multi-Specialty Clinic",
        "phone": "919876543210",
        "owner_name": "Dr. Ravi Sharma",
        "owner_email": "demo@cliniq.io",
        "password": "Demo@12345",
        "address": "123 MG Road, Bengaluru, Karnataka",
        "is_active": True,
        "plan": "premium",
    },
    {
        "name": "Apollo Health Centre",
        "phone": "919876543220",
        "owner_name": "Dr. Priya Patel",
        "owner_email": "apollo@cliniq.io",
        "password": "Demo@12345",
        "address": "45 Bandra West, Mumbai, Maharashtra",
        "is_active": True,
        "plan": "free",
    },
]

DEMO_PATIENTS = [
    {"name": "Arjun Sharma",    "phone": "919811111111", "age": 34, "email": "arjun@example.com",   "language": "en"},
    {"name": "Priya Patel",     "phone": "919811111112", "age": 28, "email": "priya@example.com",   "language": "hi"},
    {"name": "Rahul Verma",     "phone": "919811111113", "age": 45, "email": "rahul@example.com",   "language": "en"},
    {"name": "Sneha Gupta",     "phone": "919811111114", "age": 31, "email": "sneha@example.com",   "language": "ta"},
    {"name": "Amit Singh",      "phone": "919811111115", "age": 52, "email": "amit@example.com",    "language": "en"},
    {"name": "Meera Reddy",     "phone": "919811111116", "age": 24, "email": "meera@example.com",   "language": "te"},
    {"name": "Vikram Malhotra", "phone": "919811111117", "age": 38, "email": "vikram@example.com",  "language": "en"},
    {"name": "Ananya Iyer",     "phone": "919811111118", "age": 29, "email": "ananya@example.com",  "language": "ta"},
    {"name": "Suresh Kumar",    "phone": "919811111119", "age": 61, "email": "suresh@example.com",  "language": "hi"},
    {"name": "Deepa Nair",      "phone": "919811111120", "age": 35, "email": "deepa@example.com",   "language": "en"},
]


async def seed():
    client = AsyncIOMotorClient(settings.MONGODB_URL)
    db = client[settings.MONGODB_DB_NAME]

    print(f"\n🌱 Seeding database: {settings.MONGODB_DB_NAME}")
    print("=" * 50)

    # Clear existing demo data
    await db.clinics.delete_many({"owner_email": {"$in": [c["owner_email"] for c in DEMO_CLINICS]}})
    print("🗑  Cleared existing demo clinics")

    now = datetime.now(timezone.utc)

    # ── Seed clinics ──────────────────────────────────────
    clinic_ids = []
    for c in DEMO_CLINICS:
        pwd = c.pop("password")
        c["password_hash"] = hash_password(pwd)
        c["created_at"] = now
        c["updated_at"] = now
        result = await db.clinics.insert_one(c)
        clinic_ids.append(str(result.inserted_id))
        print(f"✅ Clinic: {c['name']} ({c['owner_email']} / Demo@12345)")

    main_clinic_id = clinic_ids[0]

    # ── Seed patients ─────────────────────────────────────
    await db.patients.delete_many({"clinic_id": main_clinic_id})
    patient_ids = []
    for p in DEMO_PATIENTS:
        p["clinic_id"] = main_clinic_id
        p["notes"] = f"Demo patient — {p['name']}"
        p["created_at"] = now
        p["updated_at"] = now
        result = await db.patients.insert_one(p.copy())
        patient_ids.append(str(result.inserted_id))
    print(f"✅ Patients: {len(DEMO_PATIENTS)} added")

    # ── Seed appointments ─────────────────────────────────
    await db.appointments.delete_many({"clinic_id": main_clinic_id})
    appointments = []
    statuses = ["completed", "completed", "completed", "scheduled", "scheduled", "no_show", "cancelled", "scheduled", "completed", "scheduled"]
    for i, (pid, patient, status) in enumerate(zip(patient_ids, DEMO_PATIENTS, statuses)):
        days_offset = i - 5  # some past, some future
        appt_time = now + timedelta(days=days_offset, hours=(9 + i % 6))
        token = generate_portal_token()
        appointments.append({
            "clinic_id": main_clinic_id,
            "patient_id": pid,
            "patient_name": patient["name"],
            "patient_phone": patient["phone"],
            "clinic_name": DEMO_CLINICS[0]["name"],
            "appointment_time": appt_time,
            "status": status,
            "reminder_sent": status in ("completed", "no_show"),
            "portal_token": token,
            "portal_confirmed": status == "completed",
            "notes": "Regular checkup" if i % 2 == 0 else "Follow-up visit",
            "created_at": now,
            "updated_at": now,
        })
    result = await db.appointments.insert_many(appointments)
    print(f"✅ Appointments: {len(appointments)} added")
    appt_ids = [str(x) for x in result.inserted_ids]

    # ── Seed message logs ─────────────────────────────────
    await db.message_logs.delete_many({"clinic_id": main_clinic_id})
    logs = []
    channels = ["whatsapp", "sms", "email"]
    msg_types = ["reminder", "booking_confirmation", "no_show_rebook"]
    for i, (appt_id, patient) in enumerate(zip(appt_ids[:8], DEMO_PATIENTS[:8])):
        for ch_idx, channel in enumerate(channels[:2]):
            logs.append({
                "appointment_id": appt_id,
                "clinic_id": main_clinic_id,
                "patient_phone": patient["phone"],
                "message_type": msg_types[i % len(msg_types)],
                "channel": channel,
                "success": i % 5 != 0,  # ~80% success rate
                "sent_at": now - timedelta(hours=i * 3 + ch_idx),
            })
    await db.message_logs.insert_many(logs)
    print(f"✅ Message logs: {len(logs)} added")

    # ── Create indexes ────────────────────────────────────
    from app.db.mongodb import _db, create_indexes
    # Monkey-patch for seeder
    import app.db.mongodb as mdb
    mdb._db = db
    mdb._client = client
    await create_indexes()
    print("✅ Indexes created")

    print("\n" + "=" * 50)
    print("🎉 Seeding complete!")
    print(f"\n📧 Demo login: demo@cliniq.io")
    print(f"🔑 Password:   Demo@12345")
    print(f"🛡  Admin:     {settings.ADMIN_EMAIL} / {settings.ADMIN_PASSWORD}")
    print(f"\n🌐 Frontend: http://localhost:3000")
    print(f"📡 API Docs: http://localhost:8000/docs")
    print("=" * 50 + "\n")

    client.close()


if __name__ == "__main__":
    asyncio.run(seed())
