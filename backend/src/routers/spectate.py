from fastapi import APIRouter, HTTPException
from ..models import ApiResponse, ActiveGame, UpdateGameRequest
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

@router.post("/update", response_model=ApiResponse)
async def update_game_state(request: UpdateGameRequest):
    db.update_active_game(request.username, request.score, request.gameMode, request.snake, request.food)
    return ApiResponse(success=True)
