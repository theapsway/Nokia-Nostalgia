import { User, LeaderboardEntry, ActiveGame, AuthResponse, ApiResponse, GameMode } from '@/types/game';

// Helper for making API requests
// T is the full response body type
const request = async <T>(endpoint: string, options?: RequestInit): Promise<T> => {
  try {
    const response = await fetch(`/api${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      // If the backend returns an error structure, use it.
      // Otherwise construct a generic error.
      if (data && typeof data === 'object' && ('error' in data || 'detail' in data)) {
        return data as T;
      }
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    return data as T;
  } catch (error) {
    console.error(`API Error at ${endpoint}:`, error);
    // Return a fallback error object matching the expected shape if possible
    // This is tricky with generics, but for our app, most responses have success/error fields.
    return { success: false, error: 'Network error or server unreachable' } as unknown as T;
  }
};

// Auth API
export const authApi = {
  async login(email: string, password: string): Promise<AuthResponse> {
    return request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  async signup(username: string, email: string, password: string): Promise<AuthResponse> {
    return request<AuthResponse>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    });
  },

  async logout(): Promise<ApiResponse<null>> {
    return request<ApiResponse<null>>('/auth/logout', {
      method: 'POST',
    });
  },

  async getCurrentUser(): Promise<ApiResponse<User | null>> {
    return request<ApiResponse<User | null>>('/auth/me');
  },
};

// Leaderboard API
export const leaderboardApi = {
  async getLeaderboard(gameMode?: GameMode): Promise<ApiResponse<LeaderboardEntry[]>> {
    const query = gameMode ? `?gameMode=${gameMode}` : '';
    return request<ApiResponse<LeaderboardEntry[]>>(`/leaderboard${query}`);
  },

  async submitScore(score: number, gameMode: GameMode): Promise<ApiResponse<LeaderboardEntry>> {
    return request<ApiResponse<LeaderboardEntry>>('/leaderboard', {
      method: 'POST',
      body: JSON.stringify({ score, gameMode }),
    });
  },
};

// Spectate API
export const spectateApi = {
  async getActiveGames(): Promise<ApiResponse<ActiveGame[]>> {
    return request<ApiResponse<ActiveGame[]>>('/spectate/active');
  },

  async getGameState(gameId: string): Promise<ApiResponse<ActiveGame | null>> {
    return request<ApiResponse<ActiveGame | null>>(`/spectate/${gameId}`);
  },
};

// Combined API object for centralized access
export const api = {
  auth: authApi,
  leaderboard: leaderboardApi,
  spectate: spectateApi,
};

export default api;
