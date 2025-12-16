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
    <div className="flex flex-col gap-6 items-stretch w-full max-w-xs">
      {/* Score Display */}
      <div className="bg-card p-6 rounded-lg border-4 border-primary shadow-lg shadow-primary/30 text-center">
        <p className="text-muted-foreground text-sm mb-2 tracking-wider">SCORE</p>
        <p className="mt-3 text-sm font-semibold tracking-wide text-amber-300/90 drop-shadow-[0_0_6px_rgba(251,191,36,0.4)]">{score}</p>
      </div>

      {/* Game Mode Toggle */}
      <div className="bg-card p-4 rounded-lg border-4 border-muted shadow-lg">
        <p className="text-muted-foreground text-xs mb-3 text-center tracking-wider">GAME MODE</p>
        <div className="flex gap-2">
          <Button
            variant={gameMode === 'walls' ? 'default' : 'secondary'}
            size="sm"
            onClick={() => onModeChange('walls')}
            disabled={isPlaying}
            className="text-xs flex-1 border-2"
          >
            Walls
          </Button>
          <Button
            variant={gameMode === 'pass-through' ? 'default' : 'secondary'}
            size="sm"
            onClick={() => onModeChange('pass-through')}
            disabled={isPlaying}
            className="text-xs flex-1 border-2"
          >
            Pass-through
          </Button>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex gap-3">
        {!isPlaying ? (
          <Button onClick={onStart} className="gap-2 flex-1 border-2 shadow-lg">
            <Play className="w-5 h-5" />
            {isGameOver ? 'Play Again' : 'Start'}
          </Button>
        ) : (
          <Button onClick={onPause} variant="secondary" className="gap-2 flex-1 border-2 shadow-lg">
            <Pause className="w-5 h-5" />
            Pause
          </Button>
        )}
        <Button onClick={onReset} variant="outline" className="gap-2 border-2 shadow-lg">
          <RotateCcw className="w-5 h-5" />
        </Button>
      </div>

      {/* Instructions */}
      <div className="bg-card/50 p-4 rounded-lg border-2 border-border/50 text-center">
        <p className="text-muted-foreground text-xs leading-relaxed">
          Use <span className="text-primary font-semibold">Arrow Keys</span> or <span className="text-primary font-semibold">WASD</span> to move
        </p>
        <p className="text-muted-foreground text-xs mt-2 leading-relaxed">
          Press <span className="text-primary font-semibold">Space</span> to pause
        </p>
      </div>

      {/* Game Over Message */}
      {isGameOver && (
        <div className="bg-accent/30 border-4 border-accent p-6 rounded-lg text-center animate-scale-in shadow-lg shadow-accent/40">
          <p className="font-arcade text-accent text-xl">GAME OVER</p>
          <p className="text-foreground mt-3 text-lg font-semibold">Final Score: {score}</p>
        </div>
      )}
    </div>
  );
};

export default GameControls;
