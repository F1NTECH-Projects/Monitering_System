import hmac
import hashlib
import json
import logging
from fastapi import APIRouter, Request, HTTPException
from app.db.mongodb import get_collection
from app.core.config import settings
from datetime import datetime, timezone

router = APIRouter()
logger = logging.getLogger(__name__)
MAX_BODY = 10 * 1024 * 1024


@router.post("/razorpay")
async def razorpay_webhook(request: Request):
    if not settings.RAZORPAY_WEBHOOK_SECRET:
        raise HTTPException(status_code=503, detail="Webhook not configured")

    body = await request.body()
    if len(body) > MAX_BODY:
        raise HTTPException(status_code=413, detail="Payload too large")

    signature = request.headers.get("X-Razorpay-Signature", "")
    expected = hmac.new(
        key=settings.RAZORPAY_WEBHOOK_SECRET.encode(),
        msg=body,
        digestmod=hashlib.sha256,
    ).hexdigest()

    if not hmac.compare_digest(expected, signature):
        logger.warning("Razorpay: invalid signature")
        raise HTTPException(status_code=401, detail="Invalid signature")

    try:
        payload = json.loads(body)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON")

    event = payload.get("event", "")
    logger.info(f"Razorpay event: {event}")

    clinics = get_collection("clinics")

    if event == "subscription.activated":
        sub_id = payload["payload"]["subscription"]["entity"]["id"]
        await clinics.update_one(
            {"razorpay_subscription_id": sub_id},
            {"$set": {"is_active": True, "plan": "premium", "updated_at": datetime.now(timezone.utc)}}
        )
        logger.info(f"Clinic activated via Razorpay: {sub_id}")

    elif event == "subscription.halted" or event == "subscription.cancelled":
        sub_id = payload["payload"]["subscription"]["entity"]["id"]
        await clinics.update_one(
            {"razorpay_subscription_id": sub_id},
            {"$set": {"is_active": False, "plan": "free", "updated_at": datetime.now(timezone.utc)}}
        )
        logger.warning(f"Clinic subscription halted: {sub_id}")

    return {"status": "ok"}


@router.get("/whatsapp")
async def whatsapp_verify(request: Request):
    """WhatsApp webhook verification handshake."""
    params = dict(request.query_params)
    mode      = params.get("hub.mode")
    token     = params.get("hub.verify_token")
    challenge = params.get("hub.challenge")

    verify_token = settings.WHATSAPP_TOKEN[:16] if settings.WHATSAPP_TOKEN else "cliniq_verify"

    if mode == "subscribe" and token == verify_token:
        logger.info("WhatsApp webhook verified")
        from fastapi.responses import PlainTextResponse
        return PlainTextResponse(challenge or "")
    raise HTTPException(status_code=403, detail="Verification failed")


@router.post("/whatsapp")
async def whatsapp_incoming(request: Request):
    """Handle incoming WhatsApp messages (patient replies)."""
    try:
        body = await request.json()
        entries = body.get("entry", [])
        for entry in entries:
            for change in entry.get("changes", []):
                messages = change.get("value", {}).get("messages", [])
                for msg in messages:
                    from_phone = msg.get("from", "")
                    text_body  = msg.get("text", {}).get("body", "").strip().upper()
                    logger.info(f"WhatsApp reply from {from_phone}: {text_body}")

                    # Handle CONFIRM / CANCEL replies
                    appointments = get_collection("appointments")
                    if text_body in ("CONFIRM", "YES", "OK"):
                        await appointments.update_many(
                            {"patient_phone": from_phone, "status": "scheduled"},
                            {"$set": {"portal_confirmed": True}}
                        )
                    elif text_body in ("CANCEL", "NO"):
                        await appointments.update_many(
                            {"patient_phone": from_phone, "status": "scheduled"},
                            {"$set": {"status": "cancelled"}}
                        )
        return {"status": "ok"}
    except Exception as e:
        logger.error(f"WhatsApp webhook error: {e}", exc_info=True)
        return {"status": "error"}
