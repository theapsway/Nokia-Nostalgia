import React from 'react';
import { Button } from '@/components/ui/button';
import { GameMode } from '@/types/game';
import { Play, Pause, RotateCcw } from 'lucide-react';

interface GameControlsProps {
  isPlaying: boolean;
  isGameOver: boolean;
  score: number;
  gameMode: GameMode;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onModeChange: (mode: GameMode) => void;
}

const GameControls: React.FC<GameControlsProps> = ({
  isPlaying,
  isGameOver,
  score,
  gameMode,
  onStart,
  onPause,
  onReset,
  onModeChange,
}) => {
  return (
    <div className="flex flex-col gap-4 items-center">
      {/* Score Display */}
      <div className="bg-card p-4 rounded-lg border border-border min-w-[200px] text-center">
        <p className="text-muted-foreground text-sm mb-1">SCORE</p>
        <p className="font-arcade text-2xl text-primary neon-text">{score}</p>
      </div>

      {/* Game Mode Toggle */}
      <div className="bg-card p-3 rounded-lg border border-border">
        <p className="text-muted-foreground text-xs mb-2 text-center">GAME MODE</p>
        <div className="flex gap-2">
          <Button
            variant={gameMode === 'walls' ? 'default' : 'secondary'}
            size="sm"
            onClick={() => onModeChange('walls')}
            disabled={isPlaying}
            className="text-xs"
          >
            Walls
          </Button>
          <Button
            variant={gameMode === 'pass-through' ? 'default' : 'secondary'}
            size="sm"
            onClick={() => onModeChange('pass-through')}
            disabled={isPlaying}
            className="text-xs"
          >
            Pass-through
          </Button>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex gap-2">
        {!isPlaying ? (
          <Button onClick={onStart} className="gap-2">
            <Play className="w-4 h-4" />
            {isGameOver ? 'Play Again' : 'Start'}
          </Button>
        ) : (
          <Button onClick={onPause} variant="secondary" className="gap-2">
            <Pause className="w-4 h-4" />
            Pause
          </Button>
        )}
        <Button onClick={onReset} variant="outline" className="gap-2">
          <RotateCcw className="w-4 h-4" />
          Reset
        </Button>
      </div>

      {/* Instructions */}
      <div className="bg-card/50 p-3 rounded-lg border border-border/50 text-center">
        <p className="text-muted-foreground text-xs">
          Use <span className="text-primary">Arrow Keys</span> or <span className="text-primary">WASD</span> to move
        </p>
        <p className="text-muted-foreground text-xs mt-1">
          Press <span className="text-primary">Space</span> to pause
        </p>
      </div>

      {/* Game Over Message */}
      {isGameOver && (
        <div className="bg-accent/20 border border-accent p-4 rounded-lg text-center animate-scale-in">
          <p className="font-arcade text-accent text-lg">GAME OVER</p>
          <p className="text-muted-foreground mt-2">Final Score: {score}</p>
        </div>
      )}
    </div>
  );
};

export default GameControls;
