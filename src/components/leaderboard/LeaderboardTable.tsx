import React from 'react';
import { LeaderboardEntry, GameMode } from '@/types/game';
import { Trophy, Medal } from 'lucide-react';

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  currentUsername?: string;
}

const LeaderboardTable: React.FC<LeaderboardTableProps> = ({ entries, currentUsername }) => {
  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-5 h-5 text-yellow-400" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" />;
    return <span className="text-muted-foreground">{rank}</span>;
  };

  const getModeLabel = (mode: GameMode) => {
    return mode === 'walls' ? 'Walls' : 'Pass-through';
  };

  if (entries.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No scores yet. Be the first to play!
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-3 px-4 text-muted-foreground font-medium">Rank</th>
            <th className="text-left py-3 px-4 text-muted-foreground font-medium">Player</th>
            <th className="text-left py-3 px-4 text-muted-foreground font-medium">Score</th>
            <th className="text-left py-3 px-4 text-muted-foreground font-medium">Mode</th>
            <th className="text-left py-3 px-4 text-muted-foreground font-medium">Date</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, index) => {
            const isCurrentUser = entry.username === currentUsername;
            return (
              <tr
                key={entry.id}
                className={`border-b border-border/50 transition-colors ${
                  isCurrentUser ? 'bg-primary/10' : 'hover:bg-secondary/50'
                }`}
              >
                <td className="py-3 px-4">
                  <div className="flex items-center justify-center w-8">
                    {getRankIcon(index + 1)}
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span className={isCurrentUser ? 'text-primary font-semibold' : ''}>
                    {entry.username}
                    {isCurrentUser && ' (You)'}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className="font-arcade text-primary">{entry.score}</span>
                </td>
                <td className="py-3 px-4">
                  <span className="text-sm px-2 py-1 rounded bg-secondary text-secondary-foreground">
                    {getModeLabel(entry.gameMode)}
                  </span>
                </td>
                <td className="py-3 px-4 text-muted-foreground">{entry.date}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default LeaderboardTable;
