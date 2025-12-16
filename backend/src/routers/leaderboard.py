from fastapi import APIRouter, HTTPException, Depends
from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from ..models import ApiResponse, LeaderboardEntry, SubmitScoreRequest, GameMode
from ..database import get_leaderboard, submit_score
from ..db import get_db

router = APIRouter(prefix="/leaderboard", tags=["Leaderboard"])

@router.get("", response_model=ApiResponse)
async def get_leaderboard_route(gameMode: Optional[GameMode] = None, db: AsyncSession = Depends(get_db)):
    entries = await get_leaderboard(db, gameMode)
    return ApiResponse(success=True, data=entries)

@router.post("", response_model=ApiResponse)
async def submit_score_route(request: SubmitScoreRequest, db: AsyncSession = Depends(get_db)):
    entry = await submit_score(db, request.username, request.score, request.gameMode)
    return ApiResponse(success=True, data=entry)
