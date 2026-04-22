import stripe
import logging
from app.core.config import settings

logger = logging.getLogger(__name__)

stripe.api_key = settings.STRIPE_SECRET_KEY

def get_or_create_price() -> str:
    """Return price ID from env."""
    if not settings.STRIPE_PRICE_ID:
        raise RuntimeError("STRIPE_PRICE_ID must be set in environment.")
    return settings.STRIPE_PRICE_ID

def create_checkout_session(clinic_id: str, clinic_name: str, owner_email: str) -> dict:
    """Create a checkout session and return the URL for payment."""
    price_id = get_or_create_price()
    try:
        session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[{
                'price': price_id,
                'quantity': 1,
            }],
            mode='subscription',
            success_url=f"http://localhost:3000/portal/{clinic_id}?success=true&session_id={{CHECKOUT_SESSION_ID}}",
            cancel_url=f"http://localhost:3000/portal/{clinic_id}?canceled=true",
            customer_email=owner_email,
            client_reference_id=clinic_id,
            metadata={
                "clinic_name": clinic_name,
                "clinic_id": clinic_id,
            }
        )
        return {
            "session_id": session.id,
            "payment_url": session.url,
        }
    except Exception as e:
        logger.error(f"Stripe session creation failed: {e}")
        raise
