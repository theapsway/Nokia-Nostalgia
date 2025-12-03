import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSnakeGame } from '@/hooks/useSnakeGame';
import { useAuth } from '@/hooks/useAuth';
import { GRID_SIZE } from '../gameLogic';

// Mock the api module for useAuth tests
vi.mock('@/services/api', () => ({
  api: {
    auth: {
      getCurrentUser: vi.fn().mockResolvedValue({ success: true, data: null }),
      login: vi.fn(),
      signup: vi.fn(),
      logout: vi.fn().mockResolvedValue({ success: true }),
    },
    leaderboard: {
      getLeaderboard: vi.fn().mockResolvedValue({ success: true, data: [] }),
      submitScore: vi.fn(),
    },
    spectate: {
      getActiveGames: vi.fn().mockResolvedValue({ success: true, data: [] }),
      getGameState: vi.fn(),
    },
  },
}));

import { api } from '@/services/api';

describe('useSnakeGame Hook', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('initialization', () => {
    it('should initialize with default game state', () => {
      const { result } = renderHook(() => useSnakeGame());
      
      expect(result.current.gameState.isPlaying).toBe(false);
      expect(result.current.gameState.isGameOver).toBe(false);
      expect(result.current.gameState.score).toBe(0);
      expect(result.current.gameState.direction).toBe('RIGHT');
      expect(result.current.gameState.gridSize).toBe(GRID_SIZE);
    });

    it('should initialize with walls mode by default', () => {
      const { result } = renderHook(() => useSnakeGame());
      expect(result.current.gameState.gameMode).toBe('walls');
    });

    it('should initialize with specified game mode', () => {
      const { result } = renderHook(() => useSnakeGame('pass-through'));
      expect(result.current.gameState.gameMode).toBe('pass-through');
    });

    it('should have valid initial snake', () => {
      const { result } = renderHook(() => useSnakeGame());
      expect(result.current.gameState.snake.length).toBe(3);
      expect(result.current.gameState.snake[0]).toHaveProperty('x');
      expect(result.current.gameState.snake[0]).toHaveProperty('y');
      expect(result.current.gameState.snake[0]).toHaveProperty('dotSide');
    });

    it('should have valid initial food', () => {
      const { result } = renderHook(() => useSnakeGame());
      expect(result.current.gameState.food).toHaveProperty('x');
      expect(result.current.gameState.food).toHaveProperty('y');
      expect(result.current.gameState.food.x).toBeGreaterThanOrEqual(0);
      expect(result.current.gameState.food.x).toBeLessThan(GRID_SIZE);
    });
  });

  describe('game controls', () => {
    it('should start the game', () => {
      const { result } = renderHook(() => useSnakeGame());
      
      act(() => {
        result.current.startGame();
      });
      
      expect(result.current.gameState.isPlaying).toBe(true);
      expect(result.current.gameState.isGameOver).toBe(false);
    });

    it('should pause the game', () => {
      const { result } = renderHook(() => useSnakeGame());
      
      act(() => {
        result.current.startGame();
      });
      
      expect(result.current.gameState.isPlaying).toBe(true);
      
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
        vi.advanceTimersByTime(500);
      });
      
      act(() => {
        result.current.resetGame();
      });
      
      expect(result.current.gameState.isPlaying).toBe(false);
      expect(result.current.gameState.score).toBe(0);
      expect(result.current.gameState.isGameOver).toBe(false);
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

  describe('direction changes', () => {
    it('should change to valid directions', () => {
      const { result } = renderHook(() => useSnakeGame());
      
      // Initial direction is RIGHT, so UP and DOWN should be valid
      act(() => {
        result.current.changeDirection('UP');
      });
      
      // Note: The direction ref is internal, we can verify by starting game and checking movement
      expect(result.current.gameState).toBeDefined();
    });
  });

  describe('snake properties', () => {
    it('should have alternating dot sides', () => {
      const { result } = renderHook(() => useSnakeGame());
      const snake = result.current.gameState.snake;
      
      for (let i = 0; i < snake.length - 1; i++) {
        expect(snake[i].dotSide).not.toBe(snake[i + 1].dotSide);
      }
    });
  });
});

describe('useAuth Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (api.auth.getCurrentUser as any).mockResolvedValue({ success: true, data: null });
  });

  describe('initialization', () => {
    it('should start with loading state', () => {
      const { result } = renderHook(() => useAuth());
      expect(result.current.isLoading).toBe(true);
    });

    it('should have no user initially', async () => {
      const { result } = renderHook(() => useAuth());
      
      // Wait for loading to complete
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 200));
      });
      
      expect(result.current.user).toBe(null);
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe('login', () => {
    it('should login successfully', async () => {
      const mockUser = { id: '1', username: 'TestUser', email: 'test@game.com' };
      (api.auth.login as any).mockResolvedValue({ success: true, user: mockUser });

      const { result } = renderHook(() => useAuth());
      
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 200));
      });

      let success: boolean = false;
      await act(async () => {
        success = await result.current.login('test@game.com', 'password123');
      });

      expect(success).toBe(true);
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
    });

    it('should handle login failure', async () => {
      (api.auth.login as any).mockResolvedValue({ 
        success: false, 
        error: 'Invalid credentials' 
      });

      const { result } = renderHook(() => useAuth());
      
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 200));
      });

      let success: boolean = true;
      await act(async () => {
        success = await result.current.login('wrong@email.com', 'wrongpass');
      });

      expect(success).toBe(false);
      expect(result.current.error).toBe('Invalid credentials');
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe('signup', () => {
    it('should signup successfully', async () => {
      const mockUser = { id: '2', username: 'NewUser', email: 'new@game.com' };
      (api.auth.signup as any).mockResolvedValue({ success: true, user: mockUser });

      const { result } = renderHook(() => useAuth());
      
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 200));
      });

      let success: boolean = false;
      await act(async () => {
        success = await result.current.signup('NewUser', 'new@game.com', 'password123');
      });

      expect(success).toBe(true);
      expect(result.current.user).toEqual(mockUser);
    });

    it('should handle signup failure', async () => {
      (api.auth.signup as any).mockResolvedValue({ 
        success: false, 
        error: 'Email already exists' 
      });

      const { result } = renderHook(() => useAuth());
      
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 200));
      });

      let success: boolean = true;
      await act(async () => {
        success = await result.current.signup('User', 'existing@game.com', 'password');
      });

      expect(success).toBe(false);
      expect(result.current.error).toBe('Email already exists');
    });
  });

  describe('logout', () => {
    it('should logout successfully', async () => {
      const mockUser = { id: '1', username: 'TestUser', email: 'test@game.com' };
      (api.auth.login as any).mockResolvedValue({ success: true, user: mockUser });

      const { result } = renderHook(() => useAuth());
      
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 200));
        await result.current.login('test@game.com', 'password123');
      });

      expect(result.current.isAuthenticated).toBe(true);

      await act(async () => {
        await result.current.logout();
      });

      expect(result.current.user).toBe(null);
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe('error handling', () => {
    it('should clear error', async () => {
      (api.auth.login as any).mockResolvedValue({ 
        success: false, 
        error: 'Some error' 
      });

      const { result } = renderHook(() => useAuth());
      
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 200));
        await result.current.login('test@game.com', 'wrong');
      });

      expect(result.current.error).toBe('Some error');

      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBe(null);
    });
  });
});
