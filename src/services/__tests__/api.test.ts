import { describe, it, expect, beforeEach, vi } from 'vitest';
import { api } from '../api';

describe('Auth API', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      const response = await api.auth.login('snake@game.com', 'password123');
      expect(response.success).toBe(true);
      expect(response.user).toBeDefined();
      expect(response.user?.username).toBe('SnakeMaster');
    });

    it('should fail with invalid email', async () => {
      const response = await api.auth.login('invalid@email.com', 'password123');
      expect(response.success).toBe(false);
      expect(response.error).toBeDefined();
    });

    it('should fail with short password', async () => {
      const response = await api.auth.login('snake@game.com', '123');
      expect(response.success).toBe(false);
    });
  });

  describe('signup', () => {
    it('should signup successfully with new credentials', async () => {
      const response = await api.auth.signup('NewPlayer', 'new@game.com', 'password123');
      expect(response.success).toBe(true);
      expect(response.user).toBeDefined();
      expect(response.user?.username).toBe('NewPlayer');
    });

    it('should fail with existing email', async () => {
      const response = await api.auth.signup('AnotherSnake', 'snake@game.com', 'password123');
      expect(response.success).toBe(false);
      expect(response.error).toContain('Email already registered');
    });

    it('should fail with short password', async () => {
      const response = await api.auth.signup('NewPlayer2', 'new2@game.com', '123');
      expect(response.success).toBe(false);
      expect(response.error).toContain('Password must be at least 6 characters');
    });
  });

  describe('logout', () => {
    it('should logout successfully', async () => {
      await api.auth.login('snake@game.com', 'password123');
      const response = await api.auth.logout();
      expect(response.success).toBe(true);
    });
  });
});

describe('Leaderboard API', () => {
  describe('getLeaderboard', () => {
    it('should return all leaderboard entries', async () => {
      const response = await api.leaderboard.getLeaderboard();
      expect(response.success).toBe(true);
      expect(response.data).toBeDefined();
      expect(Array.isArray(response.data)).toBe(true);
      expect(response.data!.length).toBeGreaterThan(0);
    });

    it('should filter by game mode', async () => {
      const response = await api.leaderboard.getLeaderboard('walls');
      expect(response.success).toBe(true);
      expect(response.data!.every(entry => entry.gameMode === 'walls')).toBe(true);
    });

    it('should return entries sorted by score descending', async () => {
      const response = await api.leaderboard.getLeaderboard();
      const scores = response.data!.map(e => e.score);
      expect(scores).toEqual([...scores].sort((a, b) => b - a));
    });
  });
});

describe('Spectate API', () => {
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
  });

  describe('getGameState', () => {
    it('should return game state for valid game id', async () => {
      const response = await api.spectate.getGameState('game1');
      expect(response.success).toBe(true);
      expect(response.data).toBeDefined();
    });

    it('should fail for invalid game id', async () => {
      const response = await api.spectate.getGameState('invalid-id');
      expect(response.success).toBe(false);
      expect(response.error).toContain('Game not found');
    });
  });
});
