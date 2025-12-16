from fastapi.testclient import TestClient
from src.main import app

client = TestClient(app)

def test_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Welcome to Nokia Nostalgia Snake API"}

# Auth Tests
def test_login_success():
    response = client.post("/api/auth/login", json={"email": "snake@game.com", "password": "password123"})
    assert response.status_code == 200
    data = response.json()
    assert data["success"] == True
    assert data["user"]["email"] == "snake@game.com"

def test_login_failure():
    response = client.post("/api/auth/login", json={"email": "snake@game.com", "password": "wrongpassword"})
    assert response.status_code == 200
    data = response.json()
    assert data["success"] == False
    assert data["error"] == "Invalid email or password"

def test_signup_success():
    response = client.post("/api/auth/signup", json={"username": "NewUser", "email": "new@game.com", "password": "password123"})
    assert response.status_code == 200
    data = response.json()
    assert data["success"] == True
    assert data["user"]["username"] == "NewUser"

def test_signup_existing_email():
    response = client.post("/api/auth/signup", json={"username": "AnotherUser", "email": "snake@game.com", "password": "password123"})
    assert response.status_code == 200
    data = response.json()
    assert data["success"] == False
    assert "already registered" in data["error"]

# Leaderboard Tests
def test_get_leaderboard():
    response = client.get("/api/leaderboard")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] == True
    assert len(data["data"]) > 0

def test_get_leaderboard_filter():
    response = client.get("/api/leaderboard?gameMode=walls")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] == True
    assert all(entry["gameMode"] == "walls" for entry in data["data"])

def test_submit_score():
    response = client.post("/api/leaderboard", json={"username": "TestUser", "score": 999, "gameMode": "walls"})
    assert response.status_code == 200
    data = response.json()
    assert data["success"] == True
    assert data["data"]["score"] == 999

# Spectate Tests
def test_get_active_games():
    response = client.get("/api/spectate/active")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] == True
    assert len(data["data"]) > 0

def test_get_game_state():
    response = client.get("/api/spectate/game1")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] == True
    assert data["data"]["id"] == "game1"

def test_get_game_state_invalid():
    response = client.get("/api/spectate/invalid_id")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] == False
    assert data["error"] == "Game not found"
