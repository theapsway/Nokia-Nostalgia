import React from 'react';
import useSnakeGame from '@/hooks/useSnakeGame';
import SnakeCanvas from '@/components/game/SnakeCanvas';
import GameControls from '@/components/game/GameControls';
import MobileControls from '@/components/game/MobileControls';
import BlockyTitle from '@/components/game/BlockyTitle';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/services/api';
import { toast } from 'sonner';

const Index: React.FC = () => {
  const {
    gameState,
    startGame,
    pauseGame,
    resetGame,
    changeDirection,
    setGameMode,
  } = useSnakeGame('walls');

  const { user } = useAuth();

  // Submit score when game ends
  React.useEffect(() => {
    if (gameState.isGameOver && user) {
      api.leaderboard.submitScore(user.username, gameState.score, gameState.gameMode)
        .then(res => {
          if (res.success) {
            toast.success("Score submitted!");
          }
        })
        .catch(console.error);
    }
  }, [gameState.isGameOver, gameState.score, gameState.gameMode, user]);

  // Sync game state for spectators
  React.useEffect(() => {
    if (gameState.isPlaying && user) {
      api.spectate.updateGameState(
        user.username,
        gameState.score,
        gameState.gameMode,
        gameState.snake,
        gameState.food
      ).catch(console.error);
    }
  }, [gameState.snake, user, gameState.isPlaying, gameState.score, gameState.gameMode, gameState.food]); // Sync every time snake moves

  return (
    <main className="flex-1 container mx-auto px-4 py-4 max-h-screen overflow-hidden">
      <div className="flex flex-col lg:flex-row gap-4 items-start justify-between h-full">
        {/* Left side: Title */}
        <div className="flex flex-col gap-2 lg:w-80 flex-shrink-0">
          <BlockyTitle />
          <p className="mt-3 text-sm font-semibold tracking-wide text-amber-300/90 drop-shadow-[0_0_6px_rgba(251,191,36,0.4)]">
            Classic arcade action with a modern twist
          </p>
        </div>

        {/* Center: Game Board */}
        <div className="flex flex-col items-center justify-center flex-1">
          <div className="game-container">
            <SnakeCanvas
              snake={gameState.snake}
              food={gameState.food}
              gridSize={gameState.gridSize}
              cellSize={20}
              direction={gameState.direction}
            />
            <MobileControls onDirectionChange={changeDirection} />
          </div>
        </div>

        {/* Right side: Game Controls */}
        <div className="lg:w-80 flex-shrink-0">
          <GameControls
            isPlaying={gameState.isPlaying}
            isGameOver={gameState.isGameOver}
            score={gameState.score}
            gameMode={gameState.gameMode}
            onStart={startGame}
            onPause={pauseGame}
            onReset={resetGame}
            onModeChange={setGameMode}
          />
        </div>
      </div>
    </main>
  );
};

export default Index;
