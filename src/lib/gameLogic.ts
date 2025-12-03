import { Direction, Position, SnakeSegment, GameMode, GameState } from '@/types/game';

export const GRID_SIZE = 20;
export const INITIAL_SPEED = 150;
export const SPEED_INCREMENT = 5;
export const MIN_SPEED = 50;
export const SCORE_PER_FOOD = 10;

/**
 * Get the opposite direction for a given direction
 */
export const getOppositeDirection = (dir: Direction): Direction => {
  const opposites: Record<Direction, Direction> = {
    UP: 'DOWN',
    DOWN: 'UP',
    LEFT: 'RIGHT',
    RIGHT: 'LEFT',
  };
  return opposites[dir];
};

/**
 * Check if a direction change is valid (not opposite to current direction)
 */
export const isValidDirectionChange = (current: Direction, next: Direction): boolean => {
  return next !== getOppositeDirection(current);
};

/**
 * Calculate new position after moving in a direction
 */
export const calculateNewPosition = (
  head: Position,
  direction: Direction,
  gridSize: number,
  gameMode: GameMode
): { position: Position; hitWall: boolean } => {
  let newX = head.x;
  let newY = head.y;

  switch (direction) {
    case 'UP': newY -= 1; break;
    case 'DOWN': newY += 1; break;
    case 'LEFT': newX -= 1; break;
    case 'RIGHT': newX += 1; break;
  }

  if (gameMode === 'walls') {
    if (newX < 0 || newX >= gridSize || newY < 0 || newY >= gridSize) {
      return { position: { x: newX, y: newY }, hitWall: true };
    }
  } else {
    // Pass-through mode - wrap around
    newX = (newX + gridSize) % gridSize;
    newY = (newY + gridSize) % gridSize;
  }

  return { position: { x: newX, y: newY }, hitWall: false };
};

/**
 * Check if the snake collides with itself
 */
export const checkSelfCollision = (head: Position, body: Position[]): boolean => {
  return body.some(segment => segment.x === head.x && segment.y === head.y);
};

/**
 * Check if the snake head collides with food
 */
export const checkFoodCollision = (head: Position, food: Position): boolean => {
  return head.x === food.x && head.y === food.y;
};

/**
 * Generate a new food position that doesn't overlap with the snake
 */
export const generateFoodPosition = (snake: Position[], gridSize: number): Position => {
  let food: Position;
  let attempts = 0;
  const maxAttempts = gridSize * gridSize;

  do {
    food = {
      x: Math.floor(Math.random() * gridSize),
      y: Math.floor(Math.random() * gridSize),
    };
    attempts++;
  } while (
    snake.some(seg => seg.x === food.x && seg.y === food.y) && 
    attempts < maxAttempts
  );

  return food;
};

/**
 * Create initial snake at the center of the grid
 */
export const createInitialSnake = (gridSize: number): SnakeSegment[] => {
  const centerX = Math.floor(gridSize / 2);
  const centerY = Math.floor(gridSize / 2);
  
  return [
    { x: centerX, y: centerY, dotSide: 'left' },
    { x: centerX - 1, y: centerY, dotSide: 'right' },
    { x: centerX - 2, y: centerY, dotSide: 'left' },
  ];
};

/**
 * Create a new snake segment with alternating dot side
 */
export const createNewHead = (
  position: Position,
  previousHead: SnakeSegment
): SnakeSegment => {
  return {
    x: position.x,
    y: position.y,
    dotSide: previousHead.dotSide === 'left' ? 'right' : 'left',
  };
};

/**
 * Calculate game speed based on score
 */
export const calculateSpeed = (score: number): number => {
  const speedReduction = Math.floor(score / 50) * SPEED_INCREMENT;
  return Math.max(MIN_SPEED, INITIAL_SPEED - speedReduction);
};

/**
 * Get initial game state
 */
export const getInitialGameState = (gameMode: GameMode): GameState => {
  const snake = createInitialSnake(GRID_SIZE);
  return {
    snake,
    food: generateFoodPosition(snake, GRID_SIZE),
    direction: 'RIGHT',
    score: 0,
    isPlaying: false,
    isGameOver: false,
    gameMode,
    gridSize: GRID_SIZE,
  };
};

/**
 * Process a single game tick and return the new state
 */
export const processGameTick = (
  state: GameState,
  direction: Direction
): GameState => {
  if (!state.isPlaying || state.isGameOver) {
    return state;
  }

  const head = state.snake[0];
  const { position: newPosition, hitWall } = calculateNewPosition(
    head,
    direction,
    state.gridSize,
    state.gameMode
  );

  // Check wall collision in walls mode
  if (hitWall) {
    return { ...state, isPlaying: false, isGameOver: true };
  }

  // Check self collision (excluding the tail that will be removed)
  const bodyWithoutTail = state.snake.slice(0, -1);
  if (checkSelfCollision(newPosition, bodyWithoutTail)) {
    return { ...state, isPlaying: false, isGameOver: true };
  }

  const newHead = createNewHead(newPosition, head);
  const newSnake = [newHead, ...state.snake];
  
  let newFood = state.food;
  let newScore = state.score;

  // Check food collision
  if (checkFoodCollision(newPosition, state.food)) {
    newScore += SCORE_PER_FOOD;
    newFood = generateFoodPosition(newSnake, state.gridSize);
  } else {
    newSnake.pop(); // Remove tail if no food eaten
  }

  return {
    ...state,
    snake: newSnake,
    food: newFood,
    score: newScore,
    direction,
  };
};

/**
 * Check if a position is within grid bounds
 */
export const isWithinBounds = (position: Position, gridSize: number): boolean => {
  return position.x >= 0 && position.x < gridSize && 
         position.y >= 0 && position.y < gridSize;
};

/**
 * Calculate snake length from score (initial length + food eaten)
 */
export const calculateSnakeLength = (score: number, initialLength: number = 3): number => {
  return initialLength + Math.floor(score / SCORE_PER_FOOD);
};
