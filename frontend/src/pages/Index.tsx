import React from 'react';
import useSnakeGame from '@/hooks/useSnakeGame';
import SnakeCanvas from '@/components/game/SnakeCanvas';
import GameControls from '@/components/game/GameControls';
import MobileControls from '@/components/game/MobileControls';

const Index: React.FC = () => {
  const {
    gameState,
    startGame,
    pauseGame,
    resetGame,
    changeDirection,
    setGameMode,
  } = useSnakeGame('walls');

  return (
    <main className="flex-1 container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="font-arcade text-3xl md:text-4xl text-primary neon-text mb-2">
          SNAKE GAME
        </h1>
        <p className="text-muted-foreground">
          Classic arcade action with a modern twist
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-center justify-center">
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
    </main>
  );
};

export default Index;
