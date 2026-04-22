from datetime import datetime, timedelta, timezone
from typing import Optional, Literal
from jose import JWTError, jwt
from passlib.context import CryptContext
import secrets

from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)

def create_access_token(
    data: dict,
    token_type: Literal["clinic", "admin", "portal"] = "clinic",
    expires_delta: Optional[timedelta] = None,
) -> str:
    secret = settings.ADMIN_JWT_SECRET if token_type == "admin" else settings.JWT_SECRET
    to_encode = data.copy()
    now = datetime.now(timezone.utc)

    if token_type == "portal":
        expire = now + timedelta(hours=settings.PORTAL_TOKEN_EXPIRE_HOURS)
    else:
        expire = now + (expires_delta or timedelta(hours=settings.JWT_EXPIRE_HOURS))

    to_encode.update({"exp": expire, "iat": now, "type": token_type})
    return jwt.encode(to_encode, secret, algorithm=settings.JWT_ALGORITHM)


def decode_token(token: str, token_type: Literal["clinic", "admin", "portal"] = "clinic") -> Optional[dict]:
    try:
        secret = settings.ADMIN_JWT_SECRET if token_type == "admin" else settings.JWT_SECRET
        payload = jwt.decode(token, secret, algorithms=[settings.JWT_ALGORITHM])
        if payload.get("type") != token_type:
            return None
        return payload
    except JWTError:
        return None


def generate_portal_token() -> str:
    return secrets.token_urlsafe(32)
