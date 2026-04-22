import asyncio
from app.db.mongo_client import get_database

async def main():
    db = await get_database()
    users = await db.users.find({}).to_list(20)
    print(f"Total users: {len(users)}")
    for u in users:
        print(f"  - email: {u.get('email')}, role: {u.get('role')}, clinic: {u.get('clinic_id')}")

asyncio.run(main())
