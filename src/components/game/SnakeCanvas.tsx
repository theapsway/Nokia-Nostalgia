import React, { useMemo } from 'react';
import { Position, SnakeSegment, Direction } from '@/types/game';

interface SnakeCanvasProps {
  snake: SnakeSegment[];
  food: Position;
  gridSize: number;
  cellSize?: number;
  direction?: Direction;
}

const SnakeCanvas: React.FC<SnakeCanvasProps> = ({
  snake,
  food,
  gridSize,
  cellSize = 20,
  direction = 'RIGHT',
}) => {
  const canvasSize = gridSize * cellSize;

  const gridLines = useMemo(() => {
    const lines = [];
    for (let i = 0; i <= gridSize; i++) {
      // Vertical lines
      lines.push(
        <line
          key={`v-${i}`}
          x1={i * cellSize}
          y1={0}
          x2={i * cellSize}
          y2={canvasSize}
          stroke="hsl(var(--game-grid))"
          strokeWidth="0.5"
        />
      );
      // Horizontal lines
      lines.push(
        <line
          key={`h-${i}`}
          x1={0}
          y1={i * cellSize}
          x2={canvasSize}
          y2={i * cellSize}
          stroke="hsl(var(--game-grid))"
          strokeWidth="0.5"
        />
      );
    }
    return lines;
  }, [gridSize, cellSize, canvasSize]);

  const getDotPosition = (segment: SnakeSegment, index: number) => {
    const offset = cellSize * 0.25;
    const centerX = segment.x * cellSize + cellSize / 2;
    const centerY = segment.y * cellSize + cellSize / 2;
    
    // Determine direction for this segment based on next segment
    let segDirection = direction;
    if (index < snake.length - 1) {
      const next = snake[index + 1];
      if (segment.x > next.x) segDirection = 'RIGHT';
      else if (segment.x < next.x) segDirection = 'LEFT';
      else if (segment.y > next.y) segDirection = 'DOWN';
      else if (segment.y < next.y) segDirection = 'UP';
    }

    let dotX = centerX;
    let dotY = centerY;

    if (segDirection === 'UP' || segDirection === 'DOWN') {
      dotX = segment.dotSide === 'left' ? centerX - offset : centerX + offset;
    } else {
      dotY = segment.dotSide === 'left' ? centerY - offset : centerY + offset;
    }

    return { dotX, dotY };
  };

  return (
    <svg
      width={canvasSize}
      height={canvasSize}
      className="bg-background rounded-lg"
      style={{
        boxShadow: 'inset 0 0 20px hsl(var(--muted))',
      }}
    >
      {/* Grid */}
      {gridLines}

      {/* Food */}
      <circle
        cx={food.x * cellSize + cellSize / 2}
        cy={food.y * cellSize + cellSize / 2}
        r={cellSize / 2 - 2}
        fill="hsl(var(--accent))"
        className="animate-pulse-neon"
        style={{
          filter: 'drop-shadow(0 0 8px hsl(var(--accent)))',
        }}
      />

      {/* Snake */}
      {snake.map((segment, index) => {
        const { dotX, dotY } = getDotPosition(segment, index);
        const isHead = index === 0;

        return (
          <g key={`${segment.x}-${segment.y}-${index}`}>
            {/* Snake body segment */}
            <rect
              x={segment.x * cellSize + 1}
              y={segment.y * cellSize + 1}
              width={cellSize - 2}
              height={cellSize - 2}
              rx={isHead ? 4 : 2}
              fill="hsl(var(--primary))"
              style={{
                filter: isHead
                  ? 'drop-shadow(0 0 10px hsl(var(--primary)))'
                  : 'drop-shadow(0 0 4px hsl(var(--primary) / 0.5))',
              }}
            />
            
            {/* Black dot */}
            <circle
              cx={dotX}
              cy={dotY}
              r={cellSize / 6}
              fill="hsl(var(--snake-dot))"
            />

            {/* Eyes for head */}
            {isHead && (
              <>
                {direction === 'RIGHT' && (
                  <>
                    <circle cx={segment.x * cellSize + cellSize - 5} cy={segment.y * cellSize + 6} r={2} fill="white" />
                    <circle cx={segment.x * cellSize + cellSize - 5} cy={segment.y * cellSize + cellSize - 6} r={2} fill="white" />
                  </>
                )}
                {direction === 'LEFT' && (
                  <>
                    <circle cx={segment.x * cellSize + 5} cy={segment.y * cellSize + 6} r={2} fill="white" />
                    <circle cx={segment.x * cellSize + 5} cy={segment.y * cellSize + cellSize - 6} r={2} fill="white" />
                  </>
                )}
                {direction === 'UP' && (
                  <>
                    <circle cx={segment.x * cellSize + 6} cy={segment.y * cellSize + 5} r={2} fill="white" />
                    <circle cx={segment.x * cellSize + cellSize - 6} cy={segment.y * cellSize + 5} r={2} fill="white" />
                  </>
                )}
                {direction === 'DOWN' && (
                  <>
                    <circle cx={segment.x * cellSize + 6} cy={segment.y * cellSize + cellSize - 5} r={2} fill="white" />
                    <circle cx={segment.x * cellSize + cellSize - 6} cy={segment.y * cellSize + cellSize - 5} r={2} fill="white" />
                  </>
                )}
              </>
            )}
          </g>
        );
      })}
    </svg>
  );
};

export default SnakeCanvas;
