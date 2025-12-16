from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from ..models import ApiResponse, ActiveGame, UpdateGameRequest
from ..database import get_active_games, get_game_state, update_active_game
from ..db import get_db

router = APIRouter(prefix="/spectate", tags=["Spectate"])

@router.get("/active", response_model=ApiResponse)
async def get_active_games_route(db: AsyncSession = Depends(get_db)):
    games = await get_active_games(db)
    return ApiResponse(success=True, data=games)

@router.get("/{game_id}", response_model=ApiResponse)
async def get_game_state_route(game_id: str, db: AsyncSession = Depends(get_db)):
    game = await get_game_state(db, game_id)
    if not game:
        return ApiResponse(success=False, error="Game not found")
    # print(f"Returning state for {game_id}: Score={game.score}, Head={game.snake[0] if game.snake else 'None'}")
    return ApiResponse(success=True, data=game)

@router.post("/update", response_model=ApiResponse)
async def update_game_state_route(request: UpdateGameRequest, db: AsyncSession = Depends(get_db)):
    # print(f"Received update for {request.username}: Score={request.score}, Head={request.snake[0] if request.snake else 'None'}")
    await update_active_game(db, request.username, request.score, request.gameMode, request.snake, request.food)
    return ApiResponse(success=True)
