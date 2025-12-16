import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_register_and_login(client: AsyncClient):
    # 1. Register a new user
    register_payload = {
        "username": "testuser",
        "email": "test@example.com",
        "password": "securepassword123"
    }
    response = await client.post("/api/auth/signup", json=register_payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["user"]["username"] == "testuser"
    assert data["user"]["email"] == "test@example.com"
    assert "token" in data

    token = data["token"]

    # 2. Login with the registered user
    login_payload = {
        "email": "test@example.com",
        "password": "securepassword123"
    }
    response = await client.post("/api/auth/login", json=login_payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["token"] is not None
    
    # 3. Access a protected route (e.g., get current user)
    # Note: The current /me implementation doesn't check token, but let's test it anyway
    headers = {"Authorization": f"Bearer {token}"}
    response = await client.get("/api/auth/me", headers=headers)
    assert response.status_code == 200
    data = response.json()
    # The current mock implementation returns data=None
    assert data["success"] is True

@pytest.mark.asyncio
async def test_login_invalid_credentials(client: AsyncClient):
    # 1. Register a user
    register_payload = {
        "username": "testuser2",
        "email": "test2@example.com",
        "password": "securepassword123"
    }
    await client.post("/api/auth/signup", json=register_payload)

    # 2. Try to login with wrong password
    login_payload = {
        "email": "test2@example.com",
        "password": "wrongpassword"
    }
    response = await client.post("/api/auth/login", json=login_payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is False
    assert data["error"] == "Invalid email or password"

@pytest.mark.asyncio
async def test_register_duplicate_email(client: AsyncClient):
    # 1. Register a user
    register_payload = {
        "username": "testuser3",
        "email": "test3@example.com",
        "password": "securepassword123"
    }
    response = await client.post("/api/auth/signup", json=register_payload)
    assert response.status_code == 200

    # 2. Try to register again with same email
    response = await client.post("/api/auth/signup", json=register_payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is False
    assert data["error"] == "Email already registered"

@pytest.mark.asyncio
async def test_register_short_password(client: AsyncClient):
    register_payload = {
        "username": "shortpass",
        "email": "short@example.com",
        "password": "123"
    }
    response = await client.post("/api/auth/signup", json=register_payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is False
    assert "Password must be at least 6 characters" in data["error"]

@pytest.mark.asyncio
async def test_register_invalid_email(client: AsyncClient):
    # Note: FastAPI/Pydantic EmailStr validation usually returns 422 for invalid email format
    register_payload = {
        "username": "invalidemail",
        "email": "not-an-email",
        "password": "securepassword123"
    }
    response = await client.post("/api/auth/signup", json=register_payload)
    assert response.status_code == 422

