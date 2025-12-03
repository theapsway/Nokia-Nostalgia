import { describe, it, expect } from 'vitest';
import { Direction, Position, SnakeSegment, GameMode } from '@/types/game';

// Game logic utility functions for testing
const getOppositeDirection = (dir: Direction): Direction => {
  const opposites: Record<Direction, Direction> = {
    UP: 'DOWN',
    DOWN: 'UP',
    LEFT: 'RIGHT',
    RIGHT: 'LEFT',
  };
  return opposites[dir];
};

const isValidMove = (current: Direction, next: Direction): boolean => {
  return next !== getOppositeDirection(current);
};

const moveHead = (
  head: Position,
  direction: Direction,
  gridSize: number,
  gameMode: GameMode
): { newPos: Position; hitWall: boolean } => {
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
      return { newPos: { x: newX, y: newY }, hitWall: true };
    }
  } else {
    newX = (newX + gridSize) % gridSize;
    newY = (newY + gridSize) % gridSize;
  }

  return { newPos: { x: newX, y: newY }, hitWall: false };
};

const checkSelfCollision = (head: Position, snake: Position[]): boolean => {
  return snake.some(seg => seg.x === head.x && seg.y === head.y);
};

const checkFoodCollision = (head: Position, food: Position): boolean => {
  return head.x === food.x && head.y === food.y;
};

describe('Game Logic', () => {
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

  describe('isValidMove', () => {
    it('should allow perpendicular moves', () => {
      expect(isValidMove('UP', 'LEFT')).toBe(true);
      expect(isValidMove('UP', 'RIGHT')).toBe(true);
      expect(isValidMove('LEFT', 'UP')).toBe(true);
      expect(isValidMove('LEFT', 'DOWN')).toBe(true);
    });

    it('should not allow opposite moves', () => {
      expect(isValidMove('UP', 'DOWN')).toBe(false);
      expect(isValidMove('DOWN', 'UP')).toBe(false);
      expect(isValidMove('LEFT', 'RIGHT')).toBe(false);
      expect(isValidMove('RIGHT', 'LEFT')).toBe(false);
    });

    it('should allow same direction', () => {
      expect(isValidMove('UP', 'UP')).toBe(true);
      expect(isValidMove('DOWN', 'DOWN')).toBe(true);
    });
  });

  describe('moveHead', () => {
    const gridSize = 20;

    describe('walls mode', () => {
      it('should move up correctly', () => {
        const result = moveHead({ x: 10, y: 10 }, 'UP', gridSize, 'walls');
        expect(result.newPos).toEqual({ x: 10, y: 9 });
        expect(result.hitWall).toBe(false);
      });

      it('should move down correctly', () => {
        const result = moveHead({ x: 10, y: 10 }, 'DOWN', gridSize, 'walls');
        expect(result.newPos).toEqual({ x: 10, y: 11 });
        expect(result.hitWall).toBe(false);
      });

      it('should move left correctly', () => {
        const result = moveHead({ x: 10, y: 10 }, 'LEFT', gridSize, 'walls');
        expect(result.newPos).toEqual({ x: 9, y: 10 });
        expect(result.hitWall).toBe(false);
      });

      it('should move right correctly', () => {
        const result = moveHead({ x: 10, y: 10 }, 'RIGHT', gridSize, 'walls');
        expect(result.newPos).toEqual({ x: 11, y: 10 });
        expect(result.hitWall).toBe(false);
      });

      it('should detect wall collision at top', () => {
        const result = moveHead({ x: 10, y: 0 }, 'UP', gridSize, 'walls');
        expect(result.hitWall).toBe(true);
      });

      it('should detect wall collision at bottom', () => {
        const result = moveHead({ x: 10, y: 19 }, 'DOWN', gridSize, 'walls');
        expect(result.hitWall).toBe(true);
      });

      it('should detect wall collision at left', () => {
        const result = moveHead({ x: 0, y: 10 }, 'LEFT', gridSize, 'walls');
        expect(result.hitWall).toBe(true);
      });

      it('should detect wall collision at right', () => {
        const result = moveHead({ x: 19, y: 10 }, 'RIGHT', gridSize, 'walls');
        expect(result.hitWall).toBe(true);
      });
    });

    describe('pass-through mode', () => {
      it('should wrap from top to bottom', () => {
        const result = moveHead({ x: 10, y: 0 }, 'UP', gridSize, 'pass-through');
        expect(result.newPos).toEqual({ x: 10, y: 19 });
        expect(result.hitWall).toBe(false);
      });

      it('should wrap from bottom to top', () => {
        const result = moveHead({ x: 10, y: 19 }, 'DOWN', gridSize, 'pass-through');
        expect(result.newPos).toEqual({ x: 10, y: 0 });
        expect(result.hitWall).toBe(false);
      });

      it('should wrap from left to right', () => {
        const result = moveHead({ x: 0, y: 10 }, 'LEFT', gridSize, 'pass-through');
        expect(result.newPos).toEqual({ x: 19, y: 10 });
        expect(result.hitWall).toBe(false);
      });

      it('should wrap from right to left', () => {
        const result = moveHead({ x: 19, y: 10 }, 'RIGHT', gridSize, 'pass-through');
        expect(result.newPos).toEqual({ x: 0, y: 10 });
        expect(result.hitWall).toBe(false);
      });
    });
  });

  describe('checkSelfCollision', () => {
    const snake: Position[] = [
      { x: 5, y: 5 },
      { x: 4, y: 5 },
      { x: 3, y: 5 },
    ];

    it('should detect collision with body', () => {
      expect(checkSelfCollision({ x: 4, y: 5 }, snake)).toBe(true);
    });

    it('should not detect collision when no overlap', () => {
      expect(checkSelfCollision({ x: 6, y: 5 }, snake)).toBe(false);
    });

    it('should detect collision with tail', () => {
      expect(checkSelfCollision({ x: 3, y: 5 }, snake)).toBe(true);
    });
  });

  describe('checkFoodCollision', () => {
    it('should detect food collision', () => {
      expect(checkFoodCollision({ x: 10, y: 10 }, { x: 10, y: 10 })).toBe(true);
    });

    it('should not detect collision when different positions', () => {
      expect(checkFoodCollision({ x: 10, y: 10 }, { x: 5, y: 5 })).toBe(false);
    });
  });

  describe('snake segment dot sides', () => {
    it('should alternate dot sides', () => {
      const segments: SnakeSegment[] = [
        { x: 10, y: 10, dotSide: 'left' },
        { x: 9, y: 10, dotSide: 'right' },
        { x: 8, y: 10, dotSide: 'left' },
        { x: 7, y: 10, dotSide: 'right' },
      ];

      for (let i = 0; i < segments.length - 1; i++) {
        expect(segments[i].dotSide).not.toBe(segments[i + 1].dotSide);
      }
    });

    it('should have new segment with opposite dot side of previous head', () => {
      const currentHead: SnakeSegment = { x: 10, y: 10, dotSide: 'left' };
      const newHead: SnakeSegment = {
        x: 11,
        y: 10,
        dotSide: currentHead.dotSide === 'left' ? 'right' : 'left',
      };

      expect(newHead.dotSide).toBe('right');
    });
  });
});
