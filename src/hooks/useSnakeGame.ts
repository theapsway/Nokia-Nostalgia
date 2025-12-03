import { useState, useCallback, useEffect, useRef } from 'react';
import { Direction, GameMode, GameState } from '@/types/game';
import {
  getOppositeDirection,
  getInitialGameState,
  calculateNewPosition,
  checkSelfCollision,
  checkFoodCollision,
  generateFoodPosition,
  createNewHead,
  calculateSpeed,
  INITIAL_SPEED,
  SCORE_PER_FOOD,
} from '@/lib/gameLogic';

export const useSnakeGame = (initialMode: GameMode = 'walls') => {
  const [gameState, setGameState] = useState<GameState>(() => getInitialGameState(initialMode));
  const [speed, setSpeed] = useState(INITIAL_SPEED);
  const directionRef = useRef<Direction>('RIGHT');
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);

  const resetGame = useCallback(() => {
    if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
      gameLoopRef.current = null;
    }
    setGameState(getInitialGameState(gameState.gameMode));
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
      
      const { position: newPosition, hitWall } = calculateNewPosition(
        head,
        direction,
        prev.gridSize,
        prev.gameMode
      );

      // Handle wall collision
      if (hitWall) {
        return { ...prev, isPlaying: false, isGameOver: true };
      }

      // Check self collision
      if (checkSelfCollision(newPosition, prev.snake)) {
        return { ...prev, isPlaying: false, isGameOver: true };
      }

      const newHead = createNewHead(newPosition, head);
      const newSnake = [newHead, ...prev.snake];
      let newFood = prev.food;
      let newScore = prev.score;

      // Check food collision
      if (checkFoodCollision(newPosition, prev.food)) {
        newScore += SCORE_PER_FOOD;
        newFood = generateFoodPosition(newSnake, prev.gridSize);
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
    setSpeed(calculateSpeed(gameState.score));
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
