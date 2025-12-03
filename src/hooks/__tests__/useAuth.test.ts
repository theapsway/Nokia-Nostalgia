import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAuth } from '../useAuth';

const waitFor = async (callback: () => void, timeout = 1000) => {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try {
      callback();
      return;
    } catch {
      await new Promise(resolve => setTimeout(resolve, 50));
    }
  }
  callback();
};

// Mock the api module
vi.mock('@/services/api', () => ({
  api: {
    auth: {
      getCurrentUser: vi.fn().mockResolvedValue({ success: true, data: null }),
      login: vi.fn(),
      signup: vi.fn(),
      logout: vi.fn().mockResolvedValue({ success: true }),
    },
  },
}));

import { api } from '@/services/api';

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (api.auth.getCurrentUser as any).mockResolvedValue({ success: true, data: null });
  });

  describe('initial state', () => {
    it('should start with loading state', () => {
      const { result } = renderHook(() => useAuth());
      expect(result.current.isLoading).toBe(true);
    });

    it('should have no user initially', async () => {
      const { result } = renderHook(() => useAuth());
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
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
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let success: boolean;
      await act(async () => {
        success = await result.current.login('test@game.com', 'password123');
      });

      expect(success!).toBe(true);
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
    });

    it('should handle login failure', async () => {
      (api.auth.login as any).mockResolvedValue({ 
        success: false, 
        error: 'Invalid credentials' 
      });

      const { result } = renderHook(() => useAuth());
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let success: boolean;
      await act(async () => {
        success = await result.current.login('wrong@email.com', 'wrongpass');
      });

      expect(success!).toBe(false);
      expect(result.current.error).toBe('Invalid credentials');
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe('signup', () => {
    it('should signup successfully', async () => {
      const mockUser = { id: '2', username: 'NewUser', email: 'new@game.com' };
      (api.auth.signup as any).mockResolvedValue({ success: true, user: mockUser });

      const { result } = renderHook(() => useAuth());
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let success: boolean;
      await act(async () => {
        success = await result.current.signup('NewUser', 'new@game.com', 'password123');
      });

      expect(success!).toBe(true);
      expect(result.current.user).toEqual(mockUser);
    });

    it('should handle signup failure', async () => {
      (api.auth.signup as any).mockResolvedValue({ 
        success: false, 
        error: 'Email already exists' 
      });

      const { result } = renderHook(() => useAuth());
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let success: boolean;
      await act(async () => {
        success = await result.current.signup('User', 'existing@game.com', 'password');
      });

      expect(success!).toBe(false);
      expect(result.current.error).toBe('Email already exists');
    });
  });

  describe('logout', () => {
    it('should logout successfully', async () => {
      const mockUser = { id: '1', username: 'TestUser', email: 'test@game.com' };
      (api.auth.login as any).mockResolvedValue({ success: true, user: mockUser });

      const { result } = renderHook(() => useAuth());
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
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

  describe('clearError', () => {
    it('should clear error', async () => {
      (api.auth.login as any).mockResolvedValue({ 
        success: false, 
        error: 'Some error' 
      });

      const { result } = renderHook(() => useAuth());
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
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
