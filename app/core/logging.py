import logging
import json
from pythonjsonlogger import jsonlogger
import contextvars

request_id_var = contextvars.ContextVar("request_id", default=None)

class RequestIDFilter(logging.Filter):
    def filter(self, record):
        record.request_id = request_id_var.get()
        return True

def setup_logging(app_name: str, level: str = "INFO"):
    """Setup structured JSON logging."""
    logger = logging.getLogger()
    logger.setLevel(level)
    
    # JSON formatter
    handler = logging.StreamHandler()
    formatter = jsonlogger.JsonFormatter(
        "%(timestamp)s %(level)s %(name)s %(message)s %(request_id)s"
    )
    handler.setFormatter(formatter)
    handler.addFilter(RequestIDFilter())
    logger.addHandler(handler)
    
    return logger
