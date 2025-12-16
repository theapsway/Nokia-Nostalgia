from sqlalchemy import Column, Integer, String, DateTime, JSON
from sqlalchemy.orm import DeclarativeBase
from datetime import datetime

class Base(DeclarativeBase):
    pass

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)

class LeaderboardEntry(Base):
    __tablename__ = "leaderboard"

    id = Column(String, primary_key=True)
    username = Column(String, index=True)
    score = Column(Integer)
    gameMode = Column(String)
    date = Column(DateTime, default=datetime.now)

class ActiveGame(Base):
    __tablename__ = "active_games"

    id = Column(String, primary_key=True)
    username = Column(String, index=True)
    score = Column(Integer)
    gameMode = Column(String)
    snake = Column(JSON)  # Storing list of snake segments as JSON
    food = Column(JSON)   # Storing food position as JSON
