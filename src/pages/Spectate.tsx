import React, { useEffect, useState } from 'react';
import { ActiveGame } from '@/types/game';
import { api } from '@/services/api';
import SpectatorView, { SpectatorList } from '@/components/spectate/SpectatorView';
import { Eye, Loader2 } from 'lucide-react';

const Spectate: React.FC = () => {
  const [games, setGames] = useState<ActiveGame[]>([]);
  const [selectedGame, setSelectedGame] = useState<ActiveGame | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadGames = async () => {
      setIsLoading(true);
      const response = await api.spectate.getActiveGames();
      if (response.success && response.data) {
        setGames(response.data);
        if (response.data.length > 0 && !selectedGame) {
          setSelectedGame(response.data[0]);
        }
      }
      setIsLoading(false);
    };
    loadGames();

    const interval = setInterval(loadGames, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="flex-1 container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="p-4 bg-primary/20 rounded-full">
            <Eye className="w-12 h-12 text-primary" />
          </div>
        </div>
        <h1 className="font-arcade text-3xl text-primary neon-text mb-2">
          SPECTATE
        </h1>
        <p className="text-muted-foreground">
          Watch other players in real-time
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8 max-w-5xl mx-auto">
          <div className="lg:w-80">
            <div className="bg-card rounded-lg border border-border p-4 sticky top-24">
              <SpectatorList
                games={games}
                onSelectGame={setSelectedGame}
                selectedGameId={selectedGame?.id}
              />
            </div>
          </div>

          <div className="flex-1">
            {selectedGame ? (
              <SpectatorView game={selectedGame} />
            ) : (
              <div className="game-container text-center py-12">
                <p className="text-muted-foreground">
                  Select a game to spectate
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
};

export default Spectate;
