import hmac
import hashlib
import json
import logging
from fastapi import APIRouter, Request, HTTPException
from app.db.supabase_client import get_supabase
from app.core.config import settings

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/razorpay")
async def razorpay_webhook(request: Request):
    """
    Razorpay sends a POST here when a subscription is activated.
    This activates the clinic's account automatically.
    """
    body = await request.body()
    signature = request.headers.get("X-Razorpay-Signature", "")

    # Verify webhook signature
    expected = hmac.new(
        settings.RAZORPAY_KEY_SECRET.encode(),
        body,
        hashlib.sha256
    ).hexdigest()

    if not hmac.compare_digest(expected, signature):
        logger.warning("Razorpay webhook: invalid signature")
        raise HTTPException(status_code=400, detail="Invalid signature")

    payload = json.loads(body)
    event   = payload.get("event")

    logger.info(f"Razorpay webhook received: {event}")

    if event == "subscription.activated":
        sub_id = payload["payload"]["subscription"]["entity"]["id"]
        supabase = get_supabase()
        supabase.table("clinics").update({"is_active": True})\
            .eq("razorpay_subscription_id", sub_id).execute()
        logger.info(f"Clinic activated for subscription: {sub_id}")

    elif event == "subscription.halted":
        sub_id = payload["payload"]["subscription"]["entity"]["id"]
        supabase = get_supabase()
        supabase.table("clinics").update({"is_active": False})\
            .eq("razorpay_subscription_id", sub_id).execute()
        logger.warning(f"Clinic deactivated (payment halted): {sub_id}")

    return {"status": "ok"}
