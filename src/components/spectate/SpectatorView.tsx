import React, { useEffect, useState } from 'react';
import { ActiveGame } from '@/types/game';
import { api } from '@/services/api';
import SnakeCanvas from '@/components/game/SnakeCanvas';
import { Users, Eye } from 'lucide-react';

interface SpectatorViewProps {
  game: ActiveGame;
}

const SpectatorView: React.FC<SpectatorViewProps> = ({ game: initialGame }) => {
  const [game, setGame] = useState<ActiveGame>(initialGame);

  useEffect(() => {
    const interval = setInterval(async () => {
      const response = await api.spectate.getGameState(game.id);
      if (response.success && response.data) {
        setGame(response.data);
      }
    }, 200);

    return () => clearInterval(interval);
  }, [game.id]);

  return (
    <div className="game-container">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-primary" />
          <span className="text-primary font-medium">{game.username}</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            Mode: {game.gameMode === 'walls' ? 'Walls' : 'Pass-through'}
          </span>
          <span className="font-arcade text-primary">{game.score}</span>
        </div>
      </div>
      <div className="flex justify-center">
        <SnakeCanvas
          snake={game.snake}
          food={game.food}
          gridSize={20}
          cellSize={15}
        />
      </div>
    </div>
  );
};

interface SpectatorListProps {
  games: ActiveGame[];
  onSelectGame: (game: ActiveGame) => void;
  selectedGameId?: string;
}

export const SpectatorList: React.FC<SpectatorListProps> = ({
  games,
  onSelectGame,
  selectedGameId,
}) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-5 h-5 text-primary" />
        <h3 className="font-semibold">Active Games</h3>
      </div>
      {games.length === 0 ? (
        <p className="text-muted-foreground text-sm">No active games right now</p>
      ) : (
        games.map((game) => (
          <button
            key={game.id}
            onClick={() => onSelectGame(game)}
            className={`w-full p-3 rounded-lg border transition-all text-left ${
              selectedGameId === game.id
                ? 'border-primary bg-primary/10'
                : 'border-border hover:border-primary/50 hover:bg-secondary/50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-medium">{game.username}</span>
              <span className="font-arcade text-primary text-sm">{game.score}</span>
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {game.gameMode === 'walls' ? 'Walls Mode' : 'Pass-through Mode'}
            </div>
          </button>
        ))
      )}
    </div>
  );
};

export default SpectatorView;
