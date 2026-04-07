import logging
import json
from pythonjsonlogger import jsonlogger

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
    logger.addHandler(handler)
    
    return logger
