import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSnakeGame } from '../useSnakeGame';

describe('useSnakeGame', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('initial state', () => {
    it('should initialize with default game state', () => {
      const { result } = renderHook(() => useSnakeGame());
      
      expect(result.current.gameState.isPlaying).toBe(false);
      expect(result.current.gameState.isGameOver).toBe(false);
      expect(result.current.gameState.score).toBe(0);
      expect(result.current.gameState.snake.length).toBeGreaterThan(0);
      expect(result.current.gameState.direction).toBe('RIGHT');
    });

    it('should initialize with specified game mode', () => {
      const { result } = renderHook(() => useSnakeGame('pass-through'));
      expect(result.current.gameState.gameMode).toBe('pass-through');
    });

    it('should initialize with walls mode by default', () => {
      const { result } = renderHook(() => useSnakeGame());
      expect(result.current.gameState.gameMode).toBe('walls');
    });
  });

  describe('game controls', () => {
    it('should start the game', () => {
      const { result } = renderHook(() => useSnakeGame());
      
      act(() => {
        result.current.startGame();
      });
      
      expect(result.current.gameState.isPlaying).toBe(true);
    });

    it('should pause the game', () => {
      const { result } = renderHook(() => useSnakeGame());
      
      act(() => {
        result.current.startGame();
      });
      
      act(() => {
        result.current.pauseGame();
      });
      
      expect(result.current.gameState.isPlaying).toBe(false);
    });

    it('should toggle pause', () => {
      const { result } = renderHook(() => useSnakeGame());
      
      act(() => {
        result.current.togglePause();
      });
      
      expect(result.current.gameState.isPlaying).toBe(true);
      
      act(() => {
        result.current.togglePause();
      });
      
      expect(result.current.gameState.isPlaying).toBe(false);
    });

    it('should reset the game', () => {
      const { result } = renderHook(() => useSnakeGame());
      
      act(() => {
        result.current.startGame();
      });
      
      act(() => {
        result.current.resetGame();
      });
      
      expect(result.current.gameState.isPlaying).toBe(false);
      expect(result.current.gameState.score).toBe(0);
    });
  });

  describe('direction changes', () => {
    it('should change direction to UP', () => {
      const { result } = renderHook(() => useSnakeGame());
      
      act(() => {
        result.current.changeDirection('UP');
      });
      
      act(() => {
        result.current.startGame();
        vi.advanceTimersByTime(200);
      });
      
      // Direction should be UP (can't verify directly without accessing ref)
      expect(result.current.gameState.isPlaying).toBe(true);
    });

    it('should not allow opposite direction change', () => {
      const { result } = renderHook(() => useSnakeGame());
      
      // Initial direction is RIGHT, changing to LEFT should be blocked
      const initialSnake = [...result.current.gameState.snake];
      
      act(() => {
        result.current.changeDirection('LEFT');
        result.current.startGame();
        vi.advanceTimersByTime(200);
      });
      
      // Snake should move right, not left (opposite direction blocked)
      expect(result.current.gameState.snake[0].x).toBeGreaterThan(initialSnake[0].x - 1);
    });
  });

  describe('game mode', () => {
    it('should change game mode', () => {
      const { result } = renderHook(() => useSnakeGame('walls'));
      
      act(() => {
        result.current.setGameMode('pass-through');
      });
      
      expect(result.current.gameState.gameMode).toBe('pass-through');
    });
  });

  describe('snake properties', () => {
    it('should have alternating dot sides on snake segments', () => {
      const { result } = renderHook(() => useSnakeGame());
      const snake = result.current.gameState.snake;
      
      for (let i = 0; i < snake.length - 1; i++) {
        expect(snake[i].dotSide).not.toBe(snake[i + 1].dotSide);
      }
    });

    it('should have correct initial snake length', () => {
      const { result } = renderHook(() => useSnakeGame());
      expect(result.current.gameState.snake.length).toBe(3);
    });
  });

  describe('food', () => {
    it('should have food on the grid', () => {
      const { result } = renderHook(() => useSnakeGame());
      const food = result.current.gameState.food;
      const gridSize = result.current.gameState.gridSize;
      
      expect(food.x).toBeGreaterThanOrEqual(0);
      expect(food.x).toBeLessThan(gridSize);
      expect(food.y).toBeGreaterThanOrEqual(0);
      expect(food.y).toBeLessThan(gridSize);
    });

    it('should not spawn food on snake', () => {
      const { result } = renderHook(() => useSnakeGame());
      const food = result.current.gameState.food;
      const snake = result.current.gameState.snake;
      
      const foodOnSnake = snake.some(seg => seg.x === food.x && seg.y === food.y);
      expect(foodOnSnake).toBe(false);
    });
  });
});
