from motor.motor_asyncio import AsyncIOMotorClient
import logging
from app.core.config import settings

logger = logging.getLogger(__name__)

class MongoDB:
    client: AsyncIOMotorClient = None
    db = None

mongo = MongoDB()

async def connect_to_mongo():
    logger.info("Connecting to MongoDB...")
    mongo.client = AsyncIOMotorClient(settings.MONGO_URI)
    mongo.db = mongo.client[settings.MONGO_DB_NAME]
    logger.info("Connected to MongoDB.")

async def close_mongo_connection():
    if mongo.client:
        logger.info("Closing MongoDB connection...")
        mongo.client.close()
        logger.info("MongoDB connection closed.")

def get_database():
    return mongo.db
