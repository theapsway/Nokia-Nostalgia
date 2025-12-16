from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete
from .models import User as PydanticUser, LeaderboardEntry as PydanticLeaderboardEntry, ActiveGame as PydanticActiveGame, SnakeSegment, Position
from .tables import User, LeaderboardEntry, ActiveGame
from datetime import datetime
import uuid

# User Methods
async def get_user_by_email(session: AsyncSession, email: str) -> Optional[PydanticUser]:
    result = await session.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()
    if user:
        return PydanticUser(id=user.id, username=user.username, email=user.email)
    return None

async def get_user_by_username(session: AsyncSession, username: str) -> Optional[PydanticUser]:
    result = await session.execute(select(User).where(User.username == username))
    user = result.scalar_one_or_none()
    if user:
        return PydanticUser(id=user.id, username=user.username, email=user.email)
    return None

async def get_user_with_password(session: AsyncSession, email: str) -> Optional[User]:
    result = await session.execute(select(User).where(User.email == email))
    return result.scalar_one_or_none()

async def create_user(session: AsyncSession, username: str, email: str, hashed_password: str) -> PydanticUser:
    new_user = User(
        id=str(uuid.uuid4()),
        username=username,
        email=email,
        hashed_password=hashed_password
    )
    session.add(new_user)
    await session.commit()
    await session.refresh(new_user)
    return PydanticUser(id=new_user.id, username=new_user.username, email=new_user.email)

# Leaderboard Methods
async def get_leaderboard(session: AsyncSession, game_mode: Optional[str] = None) -> List[PydanticLeaderboardEntry]:
    query = select(LeaderboardEntry)
    if game_mode:
        query = query.where(LeaderboardEntry.gameMode == game_mode)
    query = query.order_by(LeaderboardEntry.score.desc())
    
    result = await session.execute(query)
    entries = result.scalars().all()
    
    return [
        PydanticLeaderboardEntry(
            id=e.id,
            username=e.username,
            score=e.score,
            gameMode=e.gameMode,
            date=e.date
        ) for e in entries
    ]

async def submit_score(session: AsyncSession, username: str, score: int, game_mode: str) -> PydanticLeaderboardEntry:
    entry = LeaderboardEntry(
        id=str(uuid.uuid4()),
        username=username,
        score=score,
        gameMode=game_mode,
        date=datetime.now()
    )
    session.add(entry)
    await session.commit()
    await session.refresh(entry)
    return PydanticLeaderboardEntry(
        id=entry.id,
        username=entry.username,
        score=entry.score,
        gameMode=entry.gameMode,
        date=entry.date
    )

# Spectate Methods
async def get_active_games(session: AsyncSession) -> List[PydanticActiveGame]:
    result = await session.execute(select(ActiveGame))
    games = result.scalars().all()
    return [
        PydanticActiveGame(
            id=g.id,
            username=g.username,
            score=g.score,
            gameMode=g.gameMode,
            snake=[SnakeSegment(**s) for s in g.snake] if g.snake else [],
            food=Position(**g.food) if g.food else Position(x=0, y=0)
        ) for g in games
    ]

async def get_game_state(session: AsyncSession, game_id: str) -> Optional[PydanticActiveGame]:
    result = await session.execute(select(ActiveGame).where(ActiveGame.id == game_id))
    game = result.scalar_one_or_none()
    if game:
        # We are not simulating movement here anymore as it should be client driven or handled differently
        # But for compatibility with previous logic, we just return the state
        return PydanticActiveGame(
            id=game.id,
            username=game.username,
            score=game.score,
            gameMode=game.gameMode,
            snake=[SnakeSegment(**s) for s in game.snake] if game.snake else [],
            food=Position(**game.food) if game.food else Position(x=0, y=0)
        )
    return None

async def update_active_game(session: AsyncSession, username: str, score: int, game_mode: str, snake: List[SnakeSegment], food: Position):
    # Find existing game for user
    result = await session.execute(select(ActiveGame).where(ActiveGame.username == username))
    game = result.scalar_one_or_none()
    
    snake_dicts = [s.model_dump() for s in snake]
    food_dict = food.model_dump()

    if game:
        game.score = score
        game.gameMode = game_mode
        game.snake = snake_dicts
        game.food = food_dict
    else:
        new_game = ActiveGame(
            id=f"game-{username}-{uuid.uuid4()}", # Using uuid to ensure uniqueness if needed, but keeping format similar
            username=username,
            score=score,
            gameMode=game_mode,
            snake=snake_dicts,
            food=food_dict
        )
        session.add(new_game)
    
    await session.commit()

