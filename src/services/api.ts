import { User, LeaderboardEntry, ActiveGame, AuthResponse, ApiResponse, GameMode, SnakeSegment, Position } from '@/types/game';

// Simulated delay for API calls
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock data storage
let mockUsers: User[] = [
  { id: '1', username: 'SnakeMaster', email: 'snake@game.com' },
  { id: '2', username: 'PyPlayer', email: 'py@game.com' },
  { id: '3', username: 'VenomKing', email: 'venom@game.com' },
];

let mockLeaderboard: LeaderboardEntry[] = [
  { id: '1', username: 'SnakeMaster', score: 250, gameMode: 'walls', date: '2024-01-15' },
  { id: '2', username: 'PyPlayer', score: 180, gameMode: 'pass-through', date: '2024-01-14' },
  { id: '3', username: 'VenomKing', score: 150, gameMode: 'walls', date: '2024-01-13' },
  { id: '4', username: 'CobraCommander', score: 120, gameMode: 'pass-through', date: '2024-01-12' },
  { id: '5', username: 'ViperVince', score: 100, gameMode: 'walls', date: '2024-01-11' },
];

let currentUser: User | null = null;

// Helper to generate mock snake for spectating
const generateMockSnake = (length: number): SnakeSegment[] => {
  const snake: SnakeSegment[] = [];
  const startX = Math.floor(Math.random() * 10) + 5;
  const startY = Math.floor(Math.random() * 10) + 5;
  
  for (let i = 0; i < length; i++) {
    snake.push({
      x: startX - i,
      y: startY,
      dotSide: i % 2 === 0 ? 'left' : 'right',
    });
  }
  return snake;
};

const generateMockFood = (): Position => ({
  x: Math.floor(Math.random() * 20),
  y: Math.floor(Math.random() * 20),
});

let mockActiveGames: ActiveGame[] = [
  { id: 'game1', username: 'SnakeMaster', score: 45, gameMode: 'walls', snake: generateMockSnake(5), food: generateMockFood() },
  { id: 'game2', username: 'PyPlayer', score: 30, gameMode: 'pass-through', snake: generateMockSnake(4), food: generateMockFood() },
  { id: 'game3', username: 'VenomKing', score: 60, gameMode: 'walls', snake: generateMockSnake(7), food: generateMockFood() },
];

// Auth API
export const authApi = {
  async login(email: string, password: string): Promise<AuthResponse> {
    await delay(500);
    
    const user = mockUsers.find(u => u.email === email);
    if (user && password.length >= 6) {
      currentUser = user;
      localStorage.setItem('snake_user', JSON.stringify(user));
      return { success: true, user };
    }
    return { success: false, error: 'Invalid email or password' };
  },

  async signup(username: string, email: string, password: string): Promise<AuthResponse> {
    await delay(500);
    
    if (mockUsers.find(u => u.email === email)) {
      return { success: false, error: 'Email already registered' };
    }
    if (mockUsers.find(u => u.username === username)) {
      return { success: false, error: 'Username already taken' };
    }
    if (password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters' };
    }
    
    const newUser: User = {
      id: String(mockUsers.length + 1),
      username,
      email,
    };
    mockUsers.push(newUser);
    currentUser = newUser;
    localStorage.setItem('snake_user', JSON.stringify(newUser));
    return { success: true, user: newUser };
  },

  async logout(): Promise<ApiResponse<null>> {
    await delay(200);
    currentUser = null;
    localStorage.removeItem('snake_user');
    return { success: true };
  },

  async getCurrentUser(): Promise<ApiResponse<User | null>> {
    await delay(100);
    const storedUser = localStorage.getItem('snake_user');
    if (storedUser) {
      currentUser = JSON.parse(storedUser);
      return { success: true, data: currentUser };
    }
    return { success: true, data: null };
  },
};

// Leaderboard API
export const leaderboardApi = {
  async getLeaderboard(gameMode?: GameMode): Promise<ApiResponse<LeaderboardEntry[]>> {
    await delay(300);
    let entries = [...mockLeaderboard];
    if (gameMode) {
      entries = entries.filter(e => e.gameMode === gameMode);
    }
    entries.sort((a, b) => b.score - a.score);
    return { success: true, data: entries };
  },

  async submitScore(score: number, gameMode: GameMode): Promise<ApiResponse<LeaderboardEntry>> {
    await delay(300);
    if (!currentUser) {
      return { success: false, error: 'Must be logged in to submit score' };
    }
    
    const entry: LeaderboardEntry = {
      id: String(mockLeaderboard.length + 1),
      username: currentUser.username,
      score,
      gameMode,
      date: new Date().toISOString().split('T')[0],
    };
    mockLeaderboard.push(entry);
    mockLeaderboard.sort((a, b) => b.score - a.score);
    return { success: true, data: entry };
  },
};

// Spectate API
export const spectateApi = {
  async getActiveGames(): Promise<ApiResponse<ActiveGame[]>> {
    await delay(300);
    return { success: true, data: mockActiveGames };
  },

  async getGameState(gameId: string): Promise<ApiResponse<ActiveGame | null>> {
    await delay(100);
    const game = mockActiveGames.find(g => g.id === gameId);
    if (game) {
      // Simulate game progress
      const newSnake = [...game.snake];
      const head = newSnake[0];
      const directions = [
        { x: 1, y: 0 },
        { x: -1, y: 0 },
        { x: 0, y: 1 },
        { x: 0, y: -1 },
      ];
      const dir = directions[Math.floor(Math.random() * 4)];
      const newHead: SnakeSegment = {
        x: (head.x + dir.x + 20) % 20,
        y: (head.y + dir.y + 20) % 20,
        dotSide: head.dotSide === 'left' ? 'right' : 'left',
      };
      newSnake.unshift(newHead);
      
      // Check if food eaten
      if (newHead.x === game.food.x && newHead.y === game.food.y) {
        game.food = generateMockFood();
        game.score += 10;
      } else {
        newSnake.pop();
      }
      
      game.snake = newSnake;
      return { success: true, data: { ...game } };
    }
    return { success: false, error: 'Game not found' };
  },
};

// Combined API object for centralized access
export const api = {
  auth: authApi,
  leaderboard: leaderboardApi,
  spectate: spectateApi,
};

export default api;
