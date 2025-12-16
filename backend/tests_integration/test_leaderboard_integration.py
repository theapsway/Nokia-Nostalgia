import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_leaderboard_flow(client: AsyncClient):
    # 1. Submit a score (The current API trusts the username in the body, no auth required for this endpoint yet)
    score_payload = {
        "username": "gamer1",
        "score": 100,
        "gameMode": "pass-through"
    }
    response = await client.post("/api/leaderboard", json=score_payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["data"]["username"] == "gamer1"
    assert data["data"]["score"] == 100
    assert data["data"]["gameMode"] == "pass-through"

    # 2. Get leaderboard
    response = await client.get("/api/leaderboard?gameMode=pass-through")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    entries = data["data"]
    assert isinstance(entries, list)
    assert len(entries) >= 1
    assert entries[0]["username"] == "gamer1"
    assert entries[0]["score"] == 100

@pytest.mark.asyncio
async def test_leaderboard_filter(client: AsyncClient):
    # Submit scores for different modes
    await client.post("/api/leaderboard", json={"username": "u1", "score": 10, "gameMode": "pass-through"})
    await client.post("/api/leaderboard", json={"username": "u2", "score": 20, "gameMode": "walls"})

    # Filter by pass-through
    response = await client.get("/api/leaderboard?gameMode=pass-through")
    data = response.json()
    entries = data["data"]
    assert all(e["gameMode"] == "pass-through" for e in entries)
    assert any(e["username"] == "u1" for e in entries)
    assert not any(e["username"] == "u2" for e in entries)

@pytest.mark.asyncio
async def test_leaderboard_invalid_gamemode(client: AsyncClient):
    # Submit score with invalid game mode
    # Pydantic validation should catch this and return 422
    score_payload = {
        "username": "hacker",
        "score": 9999,
        "gameMode": "invalid-mode"
    }
    response = await client.post("/api/leaderboard", json=score_payload)
    assert response.status_code == 422

