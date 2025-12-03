import { describe, it, expect } from 'vitest';
import {
  getOppositeDirection,
  isValidDirectionChange,
  calculateNewPosition,
  checkSelfCollision,
  checkFoodCollision,
  generateFoodPosition,
  createInitialSnake,
  createNewHead,
  calculateSpeed,
  getInitialGameState,
  processGameTick,
  isWithinBounds,
  calculateSnakeLength,
  GRID_SIZE,
  INITIAL_SPEED,
  MIN_SPEED,
  SCORE_PER_FOOD,
} from '../gameLogic';
import { Direction, Position, SnakeSegment, GameState } from '@/types/game';

describe('Game Logic - Direction Utilities', () => {
  describe('getOppositeDirection', () => {
    it('should return DOWN for UP', () => {
      expect(getOppositeDirection('UP')).toBe('DOWN');
    });

    it('should return UP for DOWN', () => {
      expect(getOppositeDirection('DOWN')).toBe('UP');
    });

    it('should return RIGHT for LEFT', () => {
      expect(getOppositeDirection('LEFT')).toBe('RIGHT');
    });

    it('should return LEFT for RIGHT', () => {
      expect(getOppositeDirection('RIGHT')).toBe('LEFT');
    });
  });

  describe('isValidDirectionChange', () => {
    it('should allow perpendicular direction changes', () => {
      expect(isValidDirectionChange('UP', 'LEFT')).toBe(true);
      expect(isValidDirectionChange('UP', 'RIGHT')).toBe(true);
      expect(isValidDirectionChange('DOWN', 'LEFT')).toBe(true);
      expect(isValidDirectionChange('DOWN', 'RIGHT')).toBe(true);
      expect(isValidDirectionChange('LEFT', 'UP')).toBe(true);
      expect(isValidDirectionChange('LEFT', 'DOWN')).toBe(true);
      expect(isValidDirectionChange('RIGHT', 'UP')).toBe(true);
      expect(isValidDirectionChange('RIGHT', 'DOWN')).toBe(true);
    });

    it('should not allow opposite direction changes', () => {
      expect(isValidDirectionChange('UP', 'DOWN')).toBe(false);
      expect(isValidDirectionChange('DOWN', 'UP')).toBe(false);
      expect(isValidDirectionChange('LEFT', 'RIGHT')).toBe(false);
      expect(isValidDirectionChange('RIGHT', 'LEFT')).toBe(false);
    });

    it('should allow same direction', () => {
      expect(isValidDirectionChange('UP', 'UP')).toBe(true);
      expect(isValidDirectionChange('DOWN', 'DOWN')).toBe(true);
      expect(isValidDirectionChange('LEFT', 'LEFT')).toBe(true);
      expect(isValidDirectionChange('RIGHT', 'RIGHT')).toBe(true);
    });
  });
});

describe('Game Logic - Position Calculations', () => {
  describe('calculateNewPosition', () => {
    const gridSize = 20;

    describe('walls mode', () => {
      it('should move up correctly', () => {
        const result = calculateNewPosition({ x: 10, y: 10 }, 'UP', gridSize, 'walls');
        expect(result.position).toEqual({ x: 10, y: 9 });
        expect(result.hitWall).toBe(false);
      });

      it('should move down correctly', () => {
        const result = calculateNewPosition({ x: 10, y: 10 }, 'DOWN', gridSize, 'walls');
        expect(result.position).toEqual({ x: 10, y: 11 });
        expect(result.hitWall).toBe(false);
      });

      it('should move left correctly', () => {
        const result = calculateNewPosition({ x: 10, y: 10 }, 'LEFT', gridSize, 'walls');
        expect(result.position).toEqual({ x: 9, y: 10 });
        expect(result.hitWall).toBe(false);
      });

      it('should move right correctly', () => {
        const result = calculateNewPosition({ x: 10, y: 10 }, 'RIGHT', gridSize, 'walls');
        expect(result.position).toEqual({ x: 11, y: 10 });
        expect(result.hitWall).toBe(false);
      });

      it('should detect wall collision at top', () => {
        const result = calculateNewPosition({ x: 10, y: 0 }, 'UP', gridSize, 'walls');
        expect(result.hitWall).toBe(true);
      });

      it('should detect wall collision at bottom', () => {
        const result = calculateNewPosition({ x: 10, y: 19 }, 'DOWN', gridSize, 'walls');
        expect(result.hitWall).toBe(true);
      });

      it('should detect wall collision at left', () => {
        const result = calculateNewPosition({ x: 0, y: 10 }, 'LEFT', gridSize, 'walls');
        expect(result.hitWall).toBe(true);
      });

      it('should detect wall collision at right', () => {
        const result = calculateNewPosition({ x: 19, y: 10 }, 'RIGHT', gridSize, 'walls');
        expect(result.hitWall).toBe(true);
      });
    });

    describe('pass-through mode', () => {
      it('should wrap from top to bottom', () => {
        const result = calculateNewPosition({ x: 10, y: 0 }, 'UP', gridSize, 'pass-through');
        expect(result.position).toEqual({ x: 10, y: 19 });
        expect(result.hitWall).toBe(false);
      });

      it('should wrap from bottom to top', () => {
        const result = calculateNewPosition({ x: 10, y: 19 }, 'DOWN', gridSize, 'pass-through');
        expect(result.position).toEqual({ x: 10, y: 0 });
        expect(result.hitWall).toBe(false);
      });

      it('should wrap from left to right', () => {
        const result = calculateNewPosition({ x: 0, y: 10 }, 'LEFT', gridSize, 'pass-through');
        expect(result.position).toEqual({ x: 19, y: 10 });
        expect(result.hitWall).toBe(false);
      });

      it('should wrap from right to left', () => {
        const result = calculateNewPosition({ x: 19, y: 10 }, 'RIGHT', gridSize, 'pass-through');
        expect(result.position).toEqual({ x: 0, y: 10 });
        expect(result.hitWall).toBe(false);
      });

      it('should never hit wall in pass-through mode', () => {
        const positions = [
          { pos: { x: 0, y: 0 }, dir: 'UP' as Direction },
          { pos: { x: 0, y: 0 }, dir: 'LEFT' as Direction },
          { pos: { x: 19, y: 19 }, dir: 'DOWN' as Direction },
          { pos: { x: 19, y: 19 }, dir: 'RIGHT' as Direction },
        ];

        positions.forEach(({ pos, dir }) => {
          const result = calculateNewPosition(pos, dir, gridSize, 'pass-through');
          expect(result.hitWall).toBe(false);
        });
      });
    });
  });

  describe('isWithinBounds', () => {
    it('should return true for positions within grid', () => {
      expect(isWithinBounds({ x: 0, y: 0 }, 20)).toBe(true);
      expect(isWithinBounds({ x: 10, y: 10 }, 20)).toBe(true);
      expect(isWithinBounds({ x: 19, y: 19 }, 20)).toBe(true);
    });

    it('should return false for positions outside grid', () => {
      expect(isWithinBounds({ x: -1, y: 0 }, 20)).toBe(false);
      expect(isWithinBounds({ x: 0, y: -1 }, 20)).toBe(false);
      expect(isWithinBounds({ x: 20, y: 0 }, 20)).toBe(false);
      expect(isWithinBounds({ x: 0, y: 20 }, 20)).toBe(false);
    });
  });
});

describe('Game Logic - Collision Detection', () => {
  describe('checkSelfCollision', () => {
    const snake: Position[] = [
      { x: 5, y: 5 },
      { x: 4, y: 5 },
      { x: 3, y: 5 },
      { x: 2, y: 5 },
    ];

    it('should detect collision with body segment', () => {
      expect(checkSelfCollision({ x: 4, y: 5 }, snake)).toBe(true);
      expect(checkSelfCollision({ x: 3, y: 5 }, snake)).toBe(true);
    });

    it('should detect collision with tail', () => {
      expect(checkSelfCollision({ x: 2, y: 5 }, snake)).toBe(true);
    });

    it('should not detect collision when position is clear', () => {
      expect(checkSelfCollision({ x: 6, y: 5 }, snake)).toBe(false);
      expect(checkSelfCollision({ x: 5, y: 6 }, snake)).toBe(false);
      expect(checkSelfCollision({ x: 0, y: 0 }, snake)).toBe(false);
    });
  });

  describe('checkFoodCollision', () => {
    it('should detect collision when positions match', () => {
      expect(checkFoodCollision({ x: 10, y: 10 }, { x: 10, y: 10 })).toBe(true);
      expect(checkFoodCollision({ x: 0, y: 0 }, { x: 0, y: 0 })).toBe(true);
    });

    it('should not detect collision when positions differ', () => {
      expect(checkFoodCollision({ x: 10, y: 10 }, { x: 10, y: 11 })).toBe(false);
      expect(checkFoodCollision({ x: 10, y: 10 }, { x: 11, y: 10 })).toBe(false);
      expect(checkFoodCollision({ x: 5, y: 5 }, { x: 15, y: 15 })).toBe(false);
    });
  });
});

describe('Game Logic - Snake Creation', () => {
  describe('createInitialSnake', () => {
    it('should create snake with 3 segments', () => {
      const snake = createInitialSnake(20);
      expect(snake.length).toBe(3);
    });

    it('should create snake at center of grid', () => {
      const snake = createInitialSnake(20);
      expect(snake[0].x).toBe(10);
      expect(snake[0].y).toBe(10);
    });

    it('should create horizontal snake facing right', () => {
      const snake = createInitialSnake(20);
      expect(snake[0].x).toBeGreaterThan(snake[1].x);
      expect(snake[1].x).toBeGreaterThan(snake[2].x);
      expect(snake[0].y).toBe(snake[1].y);
      expect(snake[1].y).toBe(snake[2].y);
    });

    it('should have alternating dot sides', () => {
      const snake = createInitialSnake(20);
      for (let i = 0; i < snake.length - 1; i++) {
        expect(snake[i].dotSide).not.toBe(snake[i + 1].dotSide);
      }
    });
  });

  describe('createNewHead', () => {
    it('should create head at specified position', () => {
      const previousHead: SnakeSegment = { x: 10, y: 10, dotSide: 'left' };
      const newHead = createNewHead({ x: 11, y: 10 }, previousHead);
      expect(newHead.x).toBe(11);
      expect(newHead.y).toBe(10);
    });

    it('should alternate dot side from previous head', () => {
      const leftHead: SnakeSegment = { x: 10, y: 10, dotSide: 'left' };
      const rightHead: SnakeSegment = { x: 10, y: 10, dotSide: 'right' };

      expect(createNewHead({ x: 11, y: 10 }, leftHead).dotSide).toBe('right');
      expect(createNewHead({ x: 11, y: 10 }, rightHead).dotSide).toBe('left');
    });
  });
});

describe('Game Logic - Food Generation', () => {
  describe('generateFoodPosition', () => {
    it('should generate position within grid bounds', () => {
      const snake = createInitialSnake(20);
      const food = generateFoodPosition(snake, 20);
      
      expect(food.x).toBeGreaterThanOrEqual(0);
      expect(food.x).toBeLessThan(20);
      expect(food.y).toBeGreaterThanOrEqual(0);
      expect(food.y).toBeLessThan(20);
    });

    it('should not generate food on snake', () => {
      const snake = createInitialSnake(20);
      
      // Run multiple times to ensure randomness works
      for (let i = 0; i < 100; i++) {
        const food = generateFoodPosition(snake, 20);
        const onSnake = snake.some(seg => seg.x === food.x && seg.y === food.y);
        expect(onSnake).toBe(false);
      }
    });
  });
});

describe('Game Logic - Speed Calculation', () => {
  describe('calculateSpeed', () => {
    it('should return initial speed for score 0', () => {
      expect(calculateSpeed(0)).toBe(INITIAL_SPEED);
    });

    it('should decrease speed as score increases', () => {
      const speed0 = calculateSpeed(0);
      const speed50 = calculateSpeed(50);
      const speed100 = calculateSpeed(100);

      expect(speed50).toBeLessThan(speed0);
      expect(speed100).toBeLessThan(speed50);
    });

    it('should not go below minimum speed', () => {
      expect(calculateSpeed(1000)).toBe(MIN_SPEED);
      expect(calculateSpeed(10000)).toBe(MIN_SPEED);
    });

    it('should decrease by SPEED_INCREMENT for every 50 points', () => {
      const speed0 = calculateSpeed(0);
      const speed50 = calculateSpeed(50);
      expect(speed0 - speed50).toBe(5); // SPEED_INCREMENT
    });
  });

  describe('calculateSnakeLength', () => {
    it('should return initial length for score 0', () => {
      expect(calculateSnakeLength(0)).toBe(3);
    });

    it('should increase by 1 for each food eaten', () => {
      expect(calculateSnakeLength(SCORE_PER_FOOD)).toBe(4);
      expect(calculateSnakeLength(SCORE_PER_FOOD * 2)).toBe(5);
      expect(calculateSnakeLength(SCORE_PER_FOOD * 5)).toBe(8);
    });

    it('should work with custom initial length', () => {
      expect(calculateSnakeLength(0, 5)).toBe(5);
      expect(calculateSnakeLength(SCORE_PER_FOOD, 5)).toBe(6);
    });
  });
});

describe('Game Logic - Game State', () => {
  describe('getInitialGameState', () => {
    it('should create initial state with walls mode', () => {
      const state = getInitialGameState('walls');
      expect(state.gameMode).toBe('walls');
      expect(state.isPlaying).toBe(false);
      expect(state.isGameOver).toBe(false);
      expect(state.score).toBe(0);
      expect(state.direction).toBe('RIGHT');
      expect(state.gridSize).toBe(GRID_SIZE);
    });

    it('should create initial state with pass-through mode', () => {
      const state = getInitialGameState('pass-through');
      expect(state.gameMode).toBe('pass-through');
    });

    it('should have valid snake and food', () => {
      const state = getInitialGameState('walls');
      expect(state.snake.length).toBe(3);
      expect(state.food).toBeDefined();
      expect(state.food.x).toBeGreaterThanOrEqual(0);
      expect(state.food.y).toBeGreaterThanOrEqual(0);
    });
  });

  describe('processGameTick', () => {
    it('should not process tick when game is not playing', () => {
      const state = getInitialGameState('walls');
      const newState = processGameTick(state, 'RIGHT');
      expect(newState).toEqual(state);
    });

    it('should not process tick when game is over', () => {
      const state: GameState = {
        ...getInitialGameState('walls'),
        isPlaying: false,
        isGameOver: true,
      };
      const newState = processGameTick(state, 'RIGHT');
      expect(newState).toEqual(state);
    });

    it('should move snake forward when playing', () => {
      const state: GameState = {
        ...getInitialGameState('walls'),
        isPlaying: true,
      };
      const initialHeadX = state.snake[0].x;
      const newState = processGameTick(state, 'RIGHT');
      
      expect(newState.snake[0].x).toBe(initialHeadX + 1);
    });

    it('should end game on wall collision in walls mode', () => {
      const state: GameState = {
        ...getInitialGameState('walls'),
        isPlaying: true,
        snake: [
          { x: 19, y: 10, dotSide: 'left' },
          { x: 18, y: 10, dotSide: 'right' },
          { x: 17, y: 10, dotSide: 'left' },
        ],
      };
      const newState = processGameTick(state, 'RIGHT');
      
      expect(newState.isGameOver).toBe(true);
      expect(newState.isPlaying).toBe(false);
    });

    it('should wrap around in pass-through mode', () => {
      const state: GameState = {
        ...getInitialGameState('pass-through'),
        isPlaying: true,
        snake: [
          { x: 19, y: 10, dotSide: 'left' },
          { x: 18, y: 10, dotSide: 'right' },
          { x: 17, y: 10, dotSide: 'left' },
        ],
      };
      const newState = processGameTick(state, 'RIGHT');
      
      expect(newState.isGameOver).toBe(false);
      expect(newState.snake[0].x).toBe(0);
    });

    it('should increase score when eating food', () => {
      const state: GameState = {
        ...getInitialGameState('walls'),
        isPlaying: true,
        food: { x: 11, y: 10 }, // Place food in front of snake
      };
      const newState = processGameTick(state, 'RIGHT');
      
      expect(newState.score).toBe(SCORE_PER_FOOD);
    });

    it('should grow snake when eating food', () => {
      const state: GameState = {
        ...getInitialGameState('walls'),
        isPlaying: true,
        food: { x: 11, y: 10 },
      };
      const initialLength = state.snake.length;
      const newState = processGameTick(state, 'RIGHT');
      
      expect(newState.snake.length).toBe(initialLength + 1);
    });

    it('should generate new food after eating', () => {
      const state: GameState = {
        ...getInitialGameState('walls'),
        isPlaying: true,
        food: { x: 11, y: 10 },
      };
      const newState = processGameTick(state, 'RIGHT');
      
      expect(newState.food).not.toEqual({ x: 11, y: 10 });
    });
  });
});
