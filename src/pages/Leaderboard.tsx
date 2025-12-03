import React, { useEffect, useState } from 'react';
import { LeaderboardEntry, GameMode } from '@/types/game';
import { api } from '@/services/api';
import LeaderboardTable from '@/components/leaderboard/LeaderboardTable';
import { Button } from '@/components/ui/button';
import { Trophy, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const Leaderboard: React.FC = () => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<GameMode | 'all'>('all');
  const { user } = useAuth();

  useEffect(() => {
    const loadLeaderboard = async () => {
      setIsLoading(true);
      const response = await api.leaderboard.getLeaderboard(
        filter === 'all' ? undefined : filter
      );
      if (response.success && response.data) {
        setEntries(response.data);
      }
      setIsLoading(false);
    };
    loadLeaderboard();
  }, [filter]);

  return (
    <main className="flex-1 container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="p-4 bg-primary/20 rounded-full">
            <Trophy className="w-12 h-12 text-primary" />
          </div>
        </div>
        <h1 className="font-arcade text-3xl text-primary neon-text mb-2">
          LEADERBOARD
        </h1>
        <p className="text-muted-foreground">
          Top snake masters from around the world
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="flex justify-center gap-2 mb-6">
          <Button
            variant={filter === 'all' ? 'default' : 'secondary'}
            onClick={() => setFilter('all')}
          >
            All Modes
          </Button>
          <Button
            variant={filter === 'walls' ? 'default' : 'secondary'}
            onClick={() => setFilter('walls')}
          >
            Walls
          </Button>
          <Button
            variant={filter === 'pass-through' ? 'default' : 'secondary'}
            onClick={() => setFilter('pass-through')}
          >
            Pass-through
          </Button>
        </div>

        <div className="bg-card rounded-lg border border-border overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <LeaderboardTable
              entries={entries}
              currentUsername={user?.username}
            />
          )}
        </div>
      </div>
    </main>
  );
};

export default Leaderboard;
