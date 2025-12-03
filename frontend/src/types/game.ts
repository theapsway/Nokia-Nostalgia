export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export type GameMode = 'pass-through' | 'walls';

export interface Position {
  x: number;
  y: number;
}

export interface SnakeSegment extends Position {
  dotSide: 'left' | 'right';
}

export interface GameState {
  snake: SnakeSegment[];
  food: Position;
  direction: Direction;
  score: number;
  isPlaying: boolean;
  isGameOver: boolean;
  gameMode: GameMode;
  gridSize: number;
}

export interface User {
  id: string;
  username: string;
  email: string;
}

export interface LeaderboardEntry {
  id: string;
  username: string;
  score: number;
  gameMode: GameMode;
  date: string;
}

export interface ActiveGame {
  id: string;
  username: string;
  score: number;
  gameMode: GameMode;
  snake: SnakeSegment[];
  food: Position;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  error?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
