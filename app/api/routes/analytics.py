from fastapi import APIRouter, Depends, Query
from datetime import datetime, timezone, timedelta
from app.db.mongodb import get_collection
from app.core.dependencies import get_current_clinic

router = APIRouter()


@router.get("/clinic/{clinic_id}/overview")
async def get_overview(clinic_id: str, current_clinic=Depends(get_current_clinic)):
    from fastapi import HTTPException
    if clinic_id != current_clinic["id"]:
        raise HTTPException(status_code=403, detail="Access denied")

    patients = get_collection("patients")
    appointments = get_collection("appointments")
    message_logs = get_collection("message_logs")

    now = datetime.now(timezone.utc)
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    today_end = now.replace(hour=23, minute=59, second=59, microsecond=0)
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

    total_patients = await patients.count_documents({"clinic_id": clinic_id})
    today_appts = await appointments.count_documents({
        "clinic_id": clinic_id,
        "appointment_time": {"$gte": today_start, "$lte": today_end}
    })
    month_appts = await appointments.count_documents({
        "clinic_id": clinic_id,
        "appointment_time": {"$gte": month_start}
    })
    completed_month = await appointments.count_documents({
        "clinic_id": clinic_id,
        "appointment_time": {"$gte": month_start},
        "status": "completed"
    })
    total_noshows = await appointments.count_documents({"clinic_id": clinic_id, "status": "no_show"})
    msgs_sent = await message_logs.count_documents({"clinic_id": clinic_id})
    msgs_success = await message_logs.count_documents({"clinic_id": clinic_id, "success": True})

    completion_rate = round((completed_month / month_appts * 100), 1) if month_appts > 0 else 0
    delivery_rate = round((msgs_success / msgs_sent * 100), 1) if msgs_sent > 0 else 0

    return {
        "total_patients": total_patients,
        "today_appointments": today_appts,
        "month_appointments": month_appts,
        "completion_rate": completion_rate,
        "total_no_shows": total_noshows,
        "messages_sent": msgs_sent,
        "delivery_rate": delivery_rate,
    }


@router.get("/clinic/{clinic_id}/trends")
async def get_trends(
    clinic_id: str,
    days: int = Query(7, ge=1, le=90),
    current_clinic=Depends(get_current_clinic),
):
    from fastapi import HTTPException
    if clinic_id != current_clinic["id"]:
        raise HTTPException(status_code=403, detail="Access denied")

    appointments = get_collection("appointments")
    now = datetime.now(timezone.utc)
    since = now - timedelta(days=days)

    pipeline = [
        {"$match": {"clinic_id": clinic_id, "appointment_time": {"$gte": since}}},
        {"$group": {
            "_id": {
                "year": {"$year": "$appointment_time"},
                "month": {"$month": "$appointment_time"},
                "day": {"$dayOfMonth": "$appointment_time"},
                "status": "$status",
            },
            "count": {"$sum": 1}
        }},
        {"$sort": {"_id.year": 1, "_id.month": 1, "_id.day": 1}},
    ]
    results = await appointments.aggregate(pipeline).to_list(1000)

    # Reshape into daily buckets
    daily: dict = {}
    for r in results:
        d = r["_id"]
        key = f"{d['year']}-{d['month']:02d}-{d['day']:02d}"
        if key not in daily:
            daily[key] = {"date": key, "scheduled": 0, "completed": 0, "no_show": 0, "cancelled": 0}
        daily[key][d.get("status", "scheduled")] += r["count"]

    return {"trends": list(daily.values()), "days": days}


@router.get("/clinic/{clinic_id}/messages")
async def get_message_analytics(clinic_id: str, current_clinic=Depends(get_current_clinic)):
    from fastapi import HTTPException
    if clinic_id != current_clinic["id"]:
        raise HTTPException(status_code=403, detail="Access denied")

    logs = get_collection("message_logs")
    now = datetime.now(timezone.utc)

    pipeline = [
        {"$match": {"clinic_id": clinic_id}},
        {"$group": {
            "_id": {"channel": "$channel", "message_type": "$message_type", "success": "$success"},
            "count": {"$sum": 1}
        }}
    ]
    results = await logs.aggregate(pipeline).to_list(100)

    # Weekly trend for last 4 weeks
    weekly = []
    for week_offset in range(3, -1, -1):
        week_start = (now - timedelta(weeks=week_offset + 1)).replace(hour=0, minute=0, second=0, microsecond=0)
        week_end = (now - timedelta(weeks=week_offset)).replace(hour=23, minute=59, second=59, microsecond=0)
        sent = await logs.count_documents({"clinic_id": clinic_id, "sent_at": {"$gte": week_start, "$lte": week_end}})
        delivered = await logs.count_documents({"clinic_id": clinic_id, "sent_at": {"$gte": week_start, "$lte": week_end}, "success": True})
        week_label = f"W{4 - week_offset}"
        weekly.append({"week": week_label, "sent": sent, "delivered": delivered, "failed": sent - delivered})

    return {"breakdown": results, "weekly_trend": weekly}


@router.get("/clinic/{clinic_id}/noshow-rate")
async def get_noshow_rate(clinic_id: str, current_clinic=Depends(get_current_clinic)):
    from fastapi import HTTPException
    if clinic_id != current_clinic["id"]:
        raise HTTPException(status_code=403, detail="Access denied")

    appointments = get_collection("appointments")
    now = datetime.now(timezone.utc)

    monthly = []
    for m_offset in range(5, -1, -1):
        month = now.month - m_offset
        year = now.year
        while month <= 0:
            month += 12
            year -= 1
        import calendar
        _, days_in_month = calendar.monthrange(year, month)
        start = datetime(year, month, 1, tzinfo=timezone.utc)
        end = datetime(year, month, days_in_month, 23, 59, 59, tzinfo=timezone.utc)

        total = await appointments.count_documents({"clinic_id": clinic_id, "appointment_time": {"$gte": start, "$lte": end}})
        noshows = await appointments.count_documents({"clinic_id": clinic_id, "appointment_time": {"$gte": start, "$lte": end}, "status": "no_show"})
        rate = round(noshows / total * 100, 1) if total > 0 else 0
        monthly.append({"month": start.strftime("%b %Y"), "total": total, "no_shows": noshows, "rate": rate})

    return {"monthly": monthly}
