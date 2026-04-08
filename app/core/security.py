from datetime import datetime, timedelta, timezone
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from app.core.config import settings
import secrets
import string

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def validate_jwt_secret():
    if len(settings.JWT_SECRET) < 64:
        raise ValueError("JWT_SECRET must be at least 64 characters")
    
    char_types = sum([
        any(c in string.ascii_lowercase for c in settings.JWT_SECRET),
        any(c in string.ascii_uppercase for c in settings.JWT_SECRET),
        any(c in string.digits for c in settings.JWT_SECRET),
        any(c in string.punctuation for c in settings.JWT_SECRET),
    ])
    
    if char_types < 3:
        raise ValueError("JWT_SECRET must include mixed character types")

def hash_password(password: str) -> str:
    return pwd_context.hash(password, rounds=12)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    validate_jwt_secret()
    to_encode = data.copy()
    now = datetime.now(timezone.utc)
    expire = now + (expires_delta or timedelta(hours=settings.JWT_EXPIRE_HOURS))
    
    to_encode.update({
        "exp": expire,
        "iat": now,
        "type": "access"
    })
    
    return jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)

def decode_token(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(
            token, 
            settings.JWT_SECRET, 
            algorithms=[settings.JWT_ALGORITHM],
            options={"leeway": 0}
        )
        
        if payload.get("type") != "access":
            return None
            
        return payload
    except JWTError:
        return None

def generate_secure_token(length: int = 32) -> str:
    return secrets.token_urlsafe(length)
