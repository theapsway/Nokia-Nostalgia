import pytest
import asyncio
from src.db import reset_db, AsyncSessionLocal
from src.tables import User, LeaderboardEntry, ActiveGame
from src.security import get_password_hash
from datetime import datetime
import uuid

@pytest.fixture(autouse=True)
def setup_db():
    """Reset database before each test."""
    asyncio.run(reset_db())
    yield

@pytest.fixture(scope="session", autouse=True)
def cleanup_db_connection():
    yield
    from src.db import close_db_connection
    asyncio.run(close_db_connection())

@pytest.fixture
def seed_db_sync():
    """Synchronous wrapper for seeding data."""
    asyncio.run(seed_data_async())

async def seed_data_async():
    """Async logic to seed data."""
    async with AsyncSessionLocal() as session:
        # Seed Users
        users = [
            User(id="1", username="SnakeMaster", email="snake@game.com", hashed_password=get_password_hash("password123")),
            User(id="2", username="PyPlayer", email="py@game.com", hashed_password=get_password_hash("password123")),
        ]
        session.add_all(users)
        
        # Seed Leaderboard
        entries = [
            LeaderboardEntry(id="1", username="SnakeMaster", score=250, gameMode="walls", date=datetime.now()),
            LeaderboardEntry(id="2", username="PyPlayer", score=180, gameMode="pass-through", date=datetime.now()),
        ]
        session.add_all(entries)
        
        # Seed Active Game
        game = ActiveGame(
            id="game1",
            username="SnakeMaster",
            score=45,
            gameMode="walls",
            snake=[{"x": 10, "y": 10, "dotSide": "left"}],
            food={"x": 5, "y": 5}
        )
        session.add(game)
        
        await session.commit()
