from typing import List, Optional
from .models import User, LeaderboardEntry, ActiveGame, SnakeSegment, Position
from datetime import datetime
import random

class MockDatabase:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(MockDatabase, cls).__new__(cls)
            cls._instance.users = []
            cls._instance.leaderboard = []
            cls._instance.active_games = []
            cls._instance._initialize_data()
        return cls._instance

    def _initialize_data(self):
        # Mock Users
        self.users = [
            User(id="1", username="SnakeMaster", email="snake@game.com"),
            User(id="2", username="PyPlayer", email="py@game.com"),
            User(id="3", username="VenomKing", email="venom@game.com"),
            User(id="4", username="CobraCommander", email="cobra@game.com"),
            User(id="5", username="ViperVince", email="viper@game.com"),
            User(id="6", username="AnacondaAnnie", email="annie@game.com"),
            User(id="7", username="BoaBob", email="bob@game.com"),
            User(id="8", username="MambaMike", email="mike@game.com"),
        ]

        # Mock Leaderboard
        self.leaderboard = [
            LeaderboardEntry(id="1", username="SnakeMaster", score=250, gameMode="walls", date=datetime.now()),
            LeaderboardEntry(id="2", username="PyPlayer", score=180, gameMode="pass-through", date=datetime.now()),
            LeaderboardEntry(id="3", username="VenomKing", score=150, gameMode="walls", date=datetime.now()),
            LeaderboardEntry(id="4", username="CobraCommander", score=120, gameMode="pass-through", date=datetime.now()),
            LeaderboardEntry(id="5", username="ViperVince", score=100, gameMode="walls", date=datetime.now()),
            LeaderboardEntry(id="6", username="AnacondaAnnie", score=90, gameMode="pass-through", date=datetime.now()),
            LeaderboardEntry(id="7", username="BoaBob", score=80, gameMode="walls", date=datetime.now()),
            LeaderboardEntry(id="8", username="MambaMike", score=70, gameMode="pass-through", date=datetime.now()),
            LeaderboardEntry(id="9", username="PythonPete", score=60, gameMode="walls", date=datetime.now()),
            LeaderboardEntry(id="10", username="RattleRick", score=50, gameMode="pass-through", date=datetime.now()),
        ]

        # Mock Active Games
        self.active_games = [
            ActiveGame(
                id="game1",
                username="SnakeMaster",
                score=45,
                gameMode="walls",
                snake=self._generate_mock_snake(5),
                food=self._generate_mock_food()
            ),
            ActiveGame(
                id="game2",
                username="PyPlayer",
                score=30,
                gameMode="pass-through",
                snake=self._generate_mock_snake(4),
                food=self._generate_mock_food()
            ),
            ActiveGame(
                id="game3",
                username="VenomKing",
                score=60,
                gameMode="walls",
                snake=self._generate_mock_snake(7),
                food=self._generate_mock_food()
            )
        ]

    def _generate_mock_snake(self, length: int) -> List[SnakeSegment]:
        snake = []
        start_x = random.randint(5, 15)
        start_y = random.randint(5, 15)
        for i in range(length):
            snake.append(SnakeSegment(
                x=start_x - i,
                y=start_y,
                dotSide="left" if i % 2 == 0 else "right"
            ))
        return snake

    def _generate_mock_food(self) -> Position:
        return Position(x=random.randint(0, 19), y=random.randint(0, 19))

    # User Methods
    def get_user_by_email(self, email: str) -> Optional[User]:
        return next((u for u in self.users if u.email == email), None)

    def get_user_by_username(self, username: str) -> Optional[User]:
        return next((u for u in self.users if u.username == username), None)

    def create_user(self, username: str, email: str) -> User:
        new_user = User(
            id=str(len(self.users) + 1),
            username=username,
            email=email
        )
        self.users.append(new_user)
        return new_user

    # Leaderboard Methods
    def get_leaderboard(self, game_mode: Optional[str] = None) -> List[LeaderboardEntry]:
        entries = self.leaderboard
        if game_mode:
            entries = [e for e in entries if e.gameMode == game_mode]
        return sorted(entries, key=lambda x: x.score, reverse=True)

    def submit_score(self, username: str, score: int, game_mode: str) -> LeaderboardEntry:
        entry = LeaderboardEntry(
            id=str(len(self.leaderboard) + 1),
            username=username,
            score=score,
            gameMode=game_mode,
            date=datetime.now()
        )
        self.leaderboard.append(entry)
        return entry

    # Spectate Methods
    def get_active_games(self) -> List[ActiveGame]:
        return self.active_games

    def get_game_state(self, game_id: str) -> Optional[ActiveGame]:
        game = next((g for g in self.active_games if g.id == game_id), None)
        if game:
            # Simulate movement
            self._update_game_state(game)
        return game

    def _update_game_state(self, game: ActiveGame):
        # Simple simulation: move head randomly
        head = game.snake[0]
        directions = [(0, 1), (0, -1), (1, 0), (-1, 0)]
        dx, dy = random.choice(directions)
        
        new_head = SnakeSegment(
            x=(head.x + dx + 20) % 20,
            y=(head.y + dy + 20) % 20,
            dotSide="right" if head.dotSide == "left" else "left"
        )
        
        game.snake.insert(0, new_head)
        
        if new_head.x == game.food.x and new_head.y == game.food.y:
            game.score += 10
            game.food = self._generate_mock_food()
        else:
            game.snake.pop()

db = MockDatabase()
