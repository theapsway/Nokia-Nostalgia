import { useState, useCallback, useEffect, useRef } from 'react';
import { Direction, GameMode, GameState, Position, SnakeSegment } from '@/types/game';

const GRID_SIZE = 20;
const INITIAL_SPEED = 150;
const SPEED_INCREMENT = 5;
const MIN_SPEED = 50;

const getOppositeDirection = (dir: Direction): Direction => {
  const opposites: Record<Direction, Direction> = {
    UP: 'DOWN',
    DOWN: 'UP',
    LEFT: 'RIGHT',
    RIGHT: 'LEFT',
  };
  return opposites[dir];
};

const getInitialSnake = (): SnakeSegment[] => [
  { x: 10, y: 10, dotSide: 'left' },
  { x: 9, y: 10, dotSide: 'right' },
  { x: 8, y: 10, dotSide: 'left' },
];

const generateFood = (snake: SnakeSegment[]): Position => {
  let food: Position;
  do {
    food = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
  } while (snake.some(seg => seg.x === food.x && seg.y === food.y));
  return food;
};

const getInitialState = (gameMode: GameMode): GameState => {
  const snake = getInitialSnake();
  return {
    snake,
    food: generateFood(snake),
    direction: 'RIGHT',
    score: 0,
    isPlaying: false,
    isGameOver: false,
    gameMode,
    gridSize: GRID_SIZE,
  };
};

export const useSnakeGame = (initialMode: GameMode = 'walls') => {
  const [gameState, setGameState] = useState<GameState>(() => getInitialState(initialMode));
  const [speed, setSpeed] = useState(INITIAL_SPEED);
  const directionRef = useRef<Direction>('RIGHT');
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);

  const resetGame = useCallback(() => {
    if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
      gameLoopRef.current = null;
    }
    setGameState(getInitialState(gameState.gameMode));
    setSpeed(INITIAL_SPEED);
    directionRef.current = 'RIGHT';
  }, [gameState.gameMode]);

  const setGameMode = useCallback((mode: GameMode) => {
    setGameState(prev => ({ ...prev, gameMode: mode }));
  }, []);

  const moveSnake = useCallback(() => {
    setGameState(prev => {
      if (!prev.isPlaying || prev.isGameOver) return prev;

      const head = prev.snake[0];
      const direction = directionRef.current;
      let newX = head.x;
      let newY = head.y;

      switch (direction) {
        case 'UP': newY -= 1; break;
        case 'DOWN': newY += 1; break;
        case 'LEFT': newX -= 1; break;
        case 'RIGHT': newX += 1; break;
      }

      // Handle wall collision based on game mode
      if (prev.gameMode === 'walls') {
        if (newX < 0 || newX >= GRID_SIZE || newY < 0 || newY >= GRID_SIZE) {
          return { ...prev, isPlaying: false, isGameOver: true };
        }
      } else {
        // Pass-through mode
        newX = (newX + GRID_SIZE) % GRID_SIZE;
        newY = (newY + GRID_SIZE) % GRID_SIZE;
      }

      // Check self collision
      if (prev.snake.some(seg => seg.x === newX && seg.y === newY)) {
        return { ...prev, isPlaying: false, isGameOver: true };
      }

      const newHead: SnakeSegment = {
        x: newX,
        y: newY,
        dotSide: head.dotSide === 'left' ? 'right' : 'left',
      };

      const newSnake = [newHead, ...prev.snake];
      let newFood = prev.food;
      let newScore = prev.score;

      // Check food collision
      if (newX === prev.food.x && newY === prev.food.y) {
        newScore += 10;
        newFood = generateFood(newSnake);
      } else {
        newSnake.pop();
      }

      return {
        ...prev,
        snake: newSnake,
        food: newFood,
        score: newScore,
        direction,
      };
    });
  }, []);

  const changeDirection = useCallback((newDirection: Direction) => {
    const currentDirection = directionRef.current;
    if (newDirection !== getOppositeDirection(currentDirection)) {
      directionRef.current = newDirection;
    }
  }, []);

  const startGame = useCallback(() => {
    if (gameState.isGameOver) {
      resetGame();
    }
    setGameState(prev => ({ ...prev, isPlaying: true, isGameOver: false }));
  }, [gameState.isGameOver, resetGame]);

  const pauseGame = useCallback(() => {
    setGameState(prev => ({ ...prev, isPlaying: false }));
  }, []);

  const togglePause = useCallback(() => {
    if (gameState.isGameOver) {
      startGame();
    } else {
      setGameState(prev => ({ ...prev, isPlaying: !prev.isPlaying }));
    }
  }, [gameState.isGameOver, startGame]);

  // Game loop
  useEffect(() => {
    if (gameState.isPlaying && !gameState.isGameOver) {
      gameLoopRef.current = setInterval(moveSnake, speed);
    } else if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
      gameLoopRef.current = null;
    }

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, [gameState.isPlaying, gameState.isGameOver, speed, moveSnake]);

  // Speed increase based on score
  useEffect(() => {
    const newSpeed = Math.max(MIN_SPEED, INITIAL_SPEED - Math.floor(gameState.score / 50) * SPEED_INCREMENT);
    setSpeed(newSpeed);
  }, [gameState.score]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault();
          changeDirection('UP');
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault();
          changeDirection('DOWN');
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault();
          changeDirection('LEFT');
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault();
          changeDirection('RIGHT');
          break;
        case ' ':
          e.preventDefault();
          togglePause();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [changeDirection, togglePause]);

  return {
    gameState,
    startGame,
    pauseGame,
    togglePause,
    resetGame,
    changeDirection,
    setGameMode,
  };
};

export default useSnakeGame;
