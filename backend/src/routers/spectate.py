from fastapi import APIRouter, HTTPException
from ..models import ApiResponse, ActiveGame
from ..database import db

router = APIRouter(prefix="/spectate", tags=["Spectate"])

@router.get("/active", response_model=ApiResponse)
async def get_active_games():
    games = db.get_active_games()
    return ApiResponse(success=True, data=games)

@router.get("/{game_id}", response_model=ApiResponse)
async def get_game_state(game_id: str):
    game = db.get_game_state(game_id)
    if not game:
        return ApiResponse(success=False, error="Game not found")
    return ApiResponse(success=True, data=game)
