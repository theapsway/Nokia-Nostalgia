from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional, Literal
from datetime import datetime

GameMode = Literal['pass-through', 'walls']

class User(BaseModel):
    id: str
    username: str
    email: EmailStr

class Position(BaseModel):
    x: int
    y: int

class SnakeSegment(Position):
    dotSide: Literal['left', 'right']

class LeaderboardEntry(BaseModel):
    id: str
    username: str
    score: int
    gameMode: GameMode
    date: datetime

class ActiveGame(BaseModel):
    id: str
    username: str
    score: int
    gameMode: GameMode
    snake: List[SnakeSegment]
    food: Position

class AuthResponse(BaseModel):
    success: bool
    user: Optional[User] = None
    token: Optional[str] = None
    error: Optional[str] = None

class ApiResponse(BaseModel):
    success: bool
    data: Optional[object] = None
    error: Optional[str] = None

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class SignupRequest(BaseModel):
    username: str
    email: EmailStr
    password: str

class SubmitScoreRequest(BaseModel):
    score: int
    gameMode: GameMode
