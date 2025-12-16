from fastapi import APIRouter, HTTPException, status, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from ..models import AuthResponse, LoginRequest, SignupRequest, ApiResponse, User
from ..database import get_user_by_email, get_user_by_username, create_user, get_user_with_password
from ..db import get_db
from ..security import get_password_hash, verify_password

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/login", response_model=AuthResponse)
async def login(request: LoginRequest, db: AsyncSession = Depends(get_db)):
    user_db = await get_user_with_password(db, request.email)
    if user_db and verify_password(request.password, user_db.hashed_password):
        user = User(id=user_db.id, username=user_db.username, email=user_db.email)
        token = f"mock-token-{user.id}-{user.username}"
        return AuthResponse(success=True, user=user, token=token)
    return AuthResponse(success=False, error="Invalid email or password") # Return 200 with error as per frontend expectation, or 401 if strict REST. Frontend expects 200 with success: false

@router.post("/signup", response_model=AuthResponse)
async def signup(request: SignupRequest, db: AsyncSession = Depends(get_db)):
    if await get_user_by_email(db, request.email):
        return AuthResponse(success=False, error="Email already registered")
    if await get_user_by_username(db, request.username):
        return AuthResponse(success=False, error="Username already taken")
    
    if len(request.password) < 6:
        return AuthResponse(success=False, error="Password must be at least 6 characters")

    hashed_password = get_password_hash(request.password)
    user = await create_user(db, request.username, request.email, hashed_password)
    token = f"mock-token-{user.id}-{user.username}"
    return AuthResponse(success=True, user=user, token=token)

@router.post("/logout", response_model=ApiResponse)
async def logout():
    return ApiResponse(success=True)

@router.get("/me", response_model=ApiResponse)
async def get_current_user():
    # In a real app, we'd check session/token. 
    # For mock, we'll just return the first user or null
    # Frontend expects null if not logged in.
    # We can't easily know who is logged in without a token.
    # For this mock, let's assume no one is logged in by default on server side, 
    # as state is client-side in the current frontend implementation.
    return ApiResponse(success=True, data=None)
