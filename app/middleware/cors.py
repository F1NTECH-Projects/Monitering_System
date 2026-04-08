from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings

def add_cors_middleware(app):
    origins = settings.CORS_ALLOWED_ORIGINS.split(",") if settings.CORS_ALLOWED_ORIGINS else []
    
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PATCH", "DELETE"],
        allow_headers=["Content-Type", "Authorization"],
        max_age=3600,
        expose_headers=["X-Total-Count"],
    )
