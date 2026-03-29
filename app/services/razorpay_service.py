import razorpay
import logging
from app.core.config import settings

logger = logging.getLogger(__name__)

client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))

PLAN_AMOUNT_PAISE = 79900   # Rs. 799 in paise
PLAN_CURRENCY = "INR"

_plan_id: str = None  # cached after first creation


def get_or_create_plan() -> str:
    """Get existing plan ID or create one. Call once at startup."""
    global _plan_id
    if _plan_id:
        return _plan_id
    try:
        plan = client.plan.create({
            "period": "monthly",
            "interval": 1,
            "item": {
                "name": "Clinic Reminder - Monthly",
                "amount": PLAN_AMOUNT_PAISE,
                "currency": PLAN_CURRENCY,
                "description": "Automated WhatsApp appointment reminders",
            },
        })
        _plan_id = plan["id"]
        logger.info(f"Razorpay plan created: {_plan_id}")
        return _plan_id
    except Exception as e:
        logger.error(f"Razorpay plan creation failed: {e}")
        raise


def create_subscription(clinic_name: str, owner_email: str, owner_phone: str) -> dict:
    """Create a subscription and return the short_url for payment."""
    plan_id = get_or_create_plan()
    try:
        sub = client.subscription.create({
            "plan_id": plan_id,
            "customer_notify": 1,
            "quantity": 1,
            "total_count": 12,   # 12 months
            "notes": {
                "clinic_name": clinic_name,
                "owner_email": owner_email,
            },
        })
        return {
            "subscription_id": sub["id"],
            "payment_url": sub.get("short_url", ""),
            "status": sub["status"],
        }
    except Exception as e:
        logger.error(f"Razorpay subscription failed: {e}")
        raise


def get_subscription_status(subscription_id: str) -> str:
    try:
        sub = client.subscription.fetch(subscription_id)
        return sub["status"]   # created | authenticated | active | halted | cancelled
    except Exception as e:
        logger.error(f"Razorpay fetch failed: {e}")
        return "unknown"
