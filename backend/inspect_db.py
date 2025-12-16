import asyncio
from sqlalchemy import text, select, func
from src.db import AsyncSessionLocal
from src.tables import User, LeaderboardEntry

async def inspect():
    async with AsyncSessionLocal() as session:
        # List Tables
        print("\n--- Tables ---")
        result = await session.execute(text("SELECT name FROM sqlite_master WHERE type='table';"))
        tables = result.fetchall()
        for table in tables:
            print(f"- {table[0]}")

        # Count and List Users
        print("\n--- Users ---")
        result = await session.execute(select(func.count(User.id)))
        count = result.scalar()
        print(f"Total Users: {count}")
        
        result = await session.execute(select(User))
        users = result.scalars().all()
        for user in users:
            print(f"  ID: {user.id}, Username: {user.username}, Email: {user.email}")

        # List Leaderboard
        print("\n--- Leaderboard Entries ---")
        result = await session.execute(select(LeaderboardEntry).order_by(LeaderboardEntry.score.desc()))
        entries = result.scalars().all()
        for entry in entries:
            print(f"  User: {entry.username}, Score: {entry.score}, Mode: {entry.gameMode}, Date: {entry.date}")

if __name__ == "__main__":
    asyncio.run(inspect())
