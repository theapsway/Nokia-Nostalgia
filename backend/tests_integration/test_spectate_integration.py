import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_spectate_flow(client: AsyncClient):
    # 1. Update game state (Simulate a user playing)
    update_payload = {
        "username": "player1",
        "score": 50,
        "gameMode": "pass-through",
        "snake": [{"x": 10, "y": 10, "dotSide": "left"}],
        "food": {"x": 5, "y": 5}
    }
    response = await client.post("/api/spectate/update", json=update_payload)
    assert response.status_code == 200
    assert response.json()["success"] is True

    # 2. Get active games
    response = await client.get("/api/spectate/active")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    games = data["data"]
    assert isinstance(games, list)
    assert len(games) >= 1
    
    # Find our game
    game = next((g for g in games if g["username"] == "player1"), None)
    assert game is not None
    assert game["score"] == 50
    assert game["gameMode"] == "pass-through"
    
    game_id = game["id"]

    # 3. Get specific game state
    response = await client.get(f"/api/spectate/{game_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    game_state = data["data"]
    assert game_state["username"] == "player1"
    assert game_state["score"] == 50
    assert len(game_state["snake"]) == 1
    assert game_state["snake"][0]["x"] == 10

@pytest.mark.asyncio
async def test_spectate_game_not_found(client: AsyncClient):
    response = await client.get("/api/spectate/non-existent-id")
    assert response.status_code == 200 # The API returns 200 with success=False for errors usually
    data = response.json()
    assert data["success"] is False
    assert data["error"] == "Game not found"
