from fastapi.testclient import TestClient
from src.main import app

client = TestClient(app)

def test_full_flow():
    # 1. Signup
    username = "FlowUser"
    email = "flow@game.com"
    password = "password123"
    
    response = client.post("/api/auth/signup", json={"username": username, "email": email, "password": password})
    assert response.status_code == 200
    data = response.json()
    assert data["success"] == True
    assert data["user"]["username"] == username
    
    # 2. Login
    response = client.post("/api/auth/login", json={"email": email, "password": password})
    assert response.status_code == 200
    data = response.json()
    assert data["success"] == True
    token = data["token"]
    
    # 3. Submit Score
    score = 500
    game_mode = "walls"
    response = client.post("/api/leaderboard", json={"username": username, "score": score, "gameMode": game_mode})
    assert response.status_code == 200
    data = response.json()
    assert data["success"] == True
    assert data["data"]["score"] == score
    
    # 4. Get Leaderboard
    response = client.get(f"/api/leaderboard?gameMode={game_mode}")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] == True
    # Find our entry
    found = False
    for entry in data["data"]:
        if entry["username"] == username and entry["score"] == score:
            found = True
            break
    assert found
    
    # 5. Spectate (Create/Update game)
    # Update game state
    snake = [{"x": 10, "y": 10, "dotSide": "left"}]
    food = {"x": 5, "y": 5}
    response = client.post("/api/spectate/update", json={
        "username": username,
        "score": 10,
        "gameMode": game_mode,
        "snake": snake,
        "food": food
    })
    assert response.status_code == 200
    assert response.json()["success"] == True
    
    # Get active games
    response = client.get("/api/spectate/active")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] == True
    # Find our game
    found_game = False
    for game in data["data"]:
        if game["username"] == username:
            found_game = True
            assert game["score"] == 10
            break
    assert found_game
