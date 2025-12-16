import pytest
import pytest_asyncio
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from typing import AsyncGenerator, Generator
from httpx import AsyncClient, ASGITransport
import os

from src.main import app
from src.db import get_db
from src.tables import Base

# Use a separate test database
TEST_DATABASE_URL = "sqlite+aiosqlite:///./test_integration.db"

@pytest_asyncio.fixture(scope="session")
async def engine():
    engine = create_async_engine(TEST_DATABASE_URL, echo=False)
    yield engine
    await engine.dispose()
    # Clean up the test database file after tests
    if os.path.exists("./test_integration.db"):
        os.remove("./test_integration.db")

@pytest_asyncio.fixture(scope="function")
async def db_session(engine) -> AsyncGenerator[AsyncSession, None]:
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    session_maker = async_sessionmaker(engine, expire_on_commit=False)
    async with session_maker() as session:
        yield session
    
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

@pytest_asyncio.fixture(scope="function")
async def client(db_session) -> AsyncGenerator[AsyncClient, None]:
    async def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db
    
    # Create a transport for the app
    transport = ASGITransport(app=app)
    
    async with AsyncClient(transport=transport, base_url="http://test") as c:
        yield c
    
    app.dependency_overrides.clear()
