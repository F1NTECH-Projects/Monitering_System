import razorpay
import logging
from app.core.config import settings

logger = logging.getLogger(__name__)

client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))

PLAN_AMOUNT_PAISE = 79900   
PLAN_CURRENCY = "INR"

def get_or_create_plan() -> str:
    """Return plan ID from env. Set RAZORPAY_PLAN_ID once and never recreate."""
    if not settings.RAZORPAY_PLAN_ID:
        raise RuntimeError("RAZORPAY_PLAN_ID must be set in environment. Create a plan once in Razorpay dashboard and paste the ID.")
    return settings.RAZORPAY_PLAN_ID


def create_subscription(clinic_name: str, owner_email: str, owner_phone: str) -> dict:
    """Create a subscription and return the short_url for payment."""
    plan_id = get_or_create_plan()
    try:
        sub = client.subscription.create({
            "plan_id": plan_id,
            "customer_notify": 1,
            "quantity": 1,
            "total_count": 12,   
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
        return sub["status"]   
    except Exception as e:
        logger.error(f"Razorpay fetch failed: {e}")
        return "unknown"
