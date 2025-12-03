import { describe, it, expect, beforeEach } from 'vitest';
import { api } from '@/services/api';

describe('API Service - Authentication', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      const response = await api.auth.login('snake@game.com', 'password123');
      expect(response.success).toBe(true);
      expect(response.user).toBeDefined();
      expect(response.user?.username).toBe('SnakeMaster');
      expect(response.user?.email).toBe('snake@game.com');
    });

    it('should return user id on successful login', async () => {
      const response = await api.auth.login('snake@game.com', 'password123');
      expect(response.user?.id).toBeDefined();
    });

    it('should fail with non-existent email', async () => {
      const response = await api.auth.login('nonexistent@email.com', 'password123');
      expect(response.success).toBe(false);
      expect(response.error).toBeDefined();
    });

    it('should fail with short password', async () => {
      const response = await api.auth.login('snake@game.com', '123');
      expect(response.success).toBe(false);
    });

    it('should persist user to localStorage on success', async () => {
      await api.auth.login('snake@game.com', 'password123');
      const stored = localStorage.getItem('snake_user');
      expect(stored).toBeDefined();
      expect(JSON.parse(stored!).email).toBe('snake@game.com');
    });
  });

  describe('signup', () => {
    it('should signup successfully with new credentials', async () => {
      const response = await api.auth.signup('NewPlayer', 'new@example.com', 'password123');
      expect(response.success).toBe(true);
      expect(response.user).toBeDefined();
      expect(response.user?.username).toBe('NewPlayer');
      expect(response.user?.email).toBe('new@example.com');
    });

    it('should fail with existing email', async () => {
      const response = await api.auth.signup('AnotherUser', 'snake@game.com', 'password123');
      expect(response.success).toBe(false);
      expect(response.error).toContain('Email already registered');
    });

    it('should fail with existing username', async () => {
      const response = await api.auth.signup('SnakeMaster', 'another@email.com', 'password123');
      expect(response.success).toBe(false);
      expect(response.error).toContain('Username already taken');
    });

    it('should fail with short password', async () => {
      const response = await api.auth.signup('NewUser', 'newuser@email.com', '123');
      expect(response.success).toBe(false);
      expect(response.error).toContain('Password must be at least 6 characters');
    });

    it('should assign unique id to new user', async () => {
      const response = await api.auth.signup('UniqueUser', 'unique@email.com', 'password123');
      expect(response.user?.id).toBeDefined();
      expect(parseInt(response.user!.id)).toBeGreaterThan(0);
    });
  });

  describe('logout', () => {
    it('should logout successfully', async () => {
      await api.auth.login('snake@game.com', 'password123');
      const response = await api.auth.logout();
      expect(response.success).toBe(true);
    });

    it('should clear localStorage on logout', async () => {
      await api.auth.login('snake@game.com', 'password123');
      await api.auth.logout();
      expect(localStorage.getItem('snake_user')).toBeNull();
    });
  });

  describe('getCurrentUser', () => {
    it('should return null when not logged in', async () => {
      localStorage.removeItem('snake_user');
      const response = await api.auth.getCurrentUser();
      expect(response.success).toBe(true);
      expect(response.data).toBeNull();
    });

    it('should return user when logged in', async () => {
      await api.auth.login('snake@game.com', 'password123');
      const response = await api.auth.getCurrentUser();
      expect(response.success).toBe(true);
      expect(response.data?.email).toBe('snake@game.com');
    });
  });
});

describe('API Service - Leaderboard', () => {
  describe('getLeaderboard', () => {
    it('should return all leaderboard entries', async () => {
      const response = await api.leaderboard.getLeaderboard();
      expect(response.success).toBe(true);
      expect(response.data).toBeDefined();
      expect(Array.isArray(response.data)).toBe(true);
      expect(response.data!.length).toBeGreaterThan(0);
    });

    it('should filter by walls mode', async () => {
      const response = await api.leaderboard.getLeaderboard('walls');
      expect(response.success).toBe(true);
      expect(response.data!.every(entry => entry.gameMode === 'walls')).toBe(true);
    });

    it('should filter by pass-through mode', async () => {
      const response = await api.leaderboard.getLeaderboard('pass-through');
      expect(response.success).toBe(true);
      expect(response.data!.every(entry => entry.gameMode === 'pass-through')).toBe(true);
    });

    it('should return entries sorted by score descending', async () => {
      const response = await api.leaderboard.getLeaderboard();
      const scores = response.data!.map(e => e.score);
      const sortedScores = [...scores].sort((a, b) => b - a);
      expect(scores).toEqual(sortedScores);
    });

    it('should include required fields in entries', async () => {
      const response = await api.leaderboard.getLeaderboard();
      const entry = response.data![0];
      expect(entry).toHaveProperty('id');
      expect(entry).toHaveProperty('username');
      expect(entry).toHaveProperty('score');
      expect(entry).toHaveProperty('gameMode');
      expect(entry).toHaveProperty('date');
    });
  });

  describe('submitScore', () => {
    it('should fail when not logged in', async () => {
      await api.auth.logout();
      const response = await api.leaderboard.submitScore(100, 'walls');
      expect(response.success).toBe(false);
      expect(response.error).toContain('logged in');
    });

    it('should succeed when logged in', async () => {
      await api.auth.login('snake@game.com', 'password123');
      const response = await api.leaderboard.submitScore(100, 'walls');
      expect(response.success).toBe(true);
      expect(response.data).toBeDefined();
      expect(response.data?.score).toBe(100);
      expect(response.data?.gameMode).toBe('walls');
    });

    it('should include username in submitted entry', async () => {
      await api.auth.login('snake@game.com', 'password123');
      const response = await api.leaderboard.submitScore(150, 'pass-through');
      expect(response.data?.username).toBe('SnakeMaster');
    });
  });
});

describe('API Service - Spectate', () => {
  describe('getActiveGames', () => {
    it('should return list of active games', async () => {
      const response = await api.spectate.getActiveGames();
      expect(response.success).toBe(true);
      expect(response.data).toBeDefined();
      expect(Array.isArray(response.data)).toBe(true);
    });

    it('should return games with required properties', async () => {
      const response = await api.spectate.getActiveGames();
      const game = response.data![0];
      expect(game).toHaveProperty('id');
      expect(game).toHaveProperty('username');
      expect(game).toHaveProperty('score');
      expect(game).toHaveProperty('gameMode');
      expect(game).toHaveProperty('snake');
      expect(game).toHaveProperty('food');
    });

    it('should return games with valid snake data', async () => {
      const response = await api.spectate.getActiveGames();
      const game = response.data![0];
      expect(Array.isArray(game.snake)).toBe(true);
      expect(game.snake.length).toBeGreaterThan(0);
      expect(game.snake[0]).toHaveProperty('x');
      expect(game.snake[0]).toHaveProperty('y');
      expect(game.snake[0]).toHaveProperty('dotSide');
    });

    it('should return games with valid food data', async () => {
      const response = await api.spectate.getActiveGames();
      const game = response.data![0];
      expect(game.food).toHaveProperty('x');
      expect(game.food).toHaveProperty('y');
    });
  });

  describe('getGameState', () => {
    it('should return game state for valid game id', async () => {
      const response = await api.spectate.getGameState('game1');
      expect(response.success).toBe(true);
      expect(response.data).toBeDefined();
    });

    it('should return updated game state on each call', async () => {
      const response1 = await api.spectate.getGameState('game1');
      const response2 = await api.spectate.getGameState('game1');
      
      // Snake should move between calls
      expect(response1.data?.snake).not.toEqual(response2.data?.snake);
    });

    it('should fail for invalid game id', async () => {
      const response = await api.spectate.getGameState('invalid-game-id');
      expect(response.success).toBe(false);
      expect(response.error).toContain('Game not found');
    });

    it('should fail for empty game id', async () => {
      const response = await api.spectate.getGameState('');
      expect(response.success).toBe(false);
    });
  });
});
