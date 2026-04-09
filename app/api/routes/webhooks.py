import hmac
import hashlib
import json
import logging
from fastapi import APIRouter, Request, HTTPException
from app.db.supabase_client import get_supabase
from app.core.config import settings

router = APIRouter()
logger = logging.getLogger(__name__)

MAX_WEBHOOK_BODY_SIZE = 10 * 1024 * 1024

@router.post("/razorpay")
async def razorpay_webhook(request: Request):
    if not settings.RAZORPAY_WEBHOOK_SECRET:
        raise HTTPException(status_code=503, detail="Webhook not configured")
    try:
        body = await request.body()
        
        if len(body) > MAX_WEBHOOK_BODY_SIZE:
            logger.warning("Webhook body too large")
            raise HTTPException(status_code=413, detail="Payload too large")
        
        signature = request.headers.get("X-Razorpay-Signature", "")
        
        expected = hmac.new(
            key=settings.RAZORPAY_WEBHOOK_SECRET.encode(),
            msg=body,
            digestmod=hashlib.sha256
        ).hexdigest()
        
        if not hmac.compare_digest(expected, signature):
            logger.warning("Razorpay webhook: invalid signature")
            raise HTTPException(status_code=401, detail="Invalid signature")
        
        try:
            payload = json.loads(body)
        except json.JSONDecodeError:
            logger.warning("Razorpay webhook: invalid JSON")
            raise HTTPException(status_code=400, detail="Invalid JSON")
        
        event = payload.get("event", "")
        logger.info(f"Razorpay webhook received: {event}")
        
        supabase = get_supabase()
        
        if event == "subscription.activated":
            try:
                sub_id = payload["payload"]["subscription"]["entity"]["id"]
                supabase.table("clinics").update({"is_active": True}).eq(
                    "razorpay_subscription_id", sub_id
                ).execute()
                logger.info(f"Clinic activated: {sub_id}")
            except KeyError as e:
                logger.error(f"Missing payload field: {e}")
                raise HTTPException(status_code=400, detail="Invalid payload structure")
        
        elif event == "subscription.halted":
            try:
                sub_id = payload["payload"]["subscription"]["entity"]["id"]
                supabase.table("clinics").update({"is_active": False}).eq(
                    "razorpay_subscription_id", sub_id
                ).execute()
                logger.warning(f"Clinic deactivated: {sub_id}")
            except KeyError as e:
                logger.error(f"Missing payload field: {e}")
                raise HTTPException(status_code=400, detail="Invalid payload structure")
        
        return {"status": "ok"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Webhook processing failed: {e}", exc_info=True)
        return {"status": "error", "detail": str(e)}
