from fastapi import APIRouter, HTTPException
from typing import Optional, List
from ..models import ApiResponse, LeaderboardEntry, SubmitScoreRequest, GameMode
from ..database import db

router = APIRouter(prefix="/leaderboard", tags=["Leaderboard"])

@router.get("", response_model=ApiResponse)
async def get_leaderboard(gameMode: Optional[GameMode] = None):
    entries = db.get_leaderboard(gameMode)
    return ApiResponse(success=True, data=entries)

@router.post("", response_model=ApiResponse)
async def submit_score(request: SubmitScoreRequest):
    entry = db.submit_score(request.username, request.score, request.gameMode)
    return ApiResponse(success=True, data=entry)
