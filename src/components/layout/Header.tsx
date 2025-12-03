import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User } from '@/types/game';
import { Button } from '@/components/ui/button';
import { Gamepad2, Trophy, Eye, LogIn, LogOut, User as UserIcon } from 'lucide-react';

interface HeaderProps {
  user: User | null;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout }) => {
  const location = useLocation();

  const navLinks = [
    { path: '/', label: 'Play', icon: Gamepad2 },
    { path: '/leaderboard', label: 'Leaderboard', icon: Trophy },
    { path: '/spectate', label: 'Watch', icon: Eye },
  ];

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="font-arcade text-xl text-primary neon-text">SNAKE</span>
          </Link>

          <nav className="flex items-center gap-1">
            {navLinks.map(({ path, label, icon: Icon }) => (
              <Link key={path} to={path}>
                <Button
                  variant={location.pathname === path ? 'default' : 'ghost'}
                  size="sm"
                  className="gap-2"
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{label}</span>
                </Button>
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {user ? (
              <>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary rounded-lg">
                  <UserIcon className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">{user.username}</span>
                </div>
                <Button variant="ghost" size="sm" onClick={onLogout}>
                  <LogOut className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <Link to="/auth">
                <Button variant="outline" size="sm" className="gap-2">
                  <LogIn className="w-4 h-4" />
                  <span className="hidden sm:inline">Log In</span>
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
