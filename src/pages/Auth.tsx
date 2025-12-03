import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import LoginForm from '@/components/auth/LoginForm';
import SignupForm from '@/components/auth/SignupForm';
import { Gamepad2 } from 'lucide-react';

const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const { login, signup, isLoading, error, clearError, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleSwitchForm = () => {
    clearError();
    setIsLogin(!isLogin);
  };

  return (
    <main className="flex-1 container mx-auto px-4 py-8 flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-primary/20 rounded-full">
              <Gamepad2 className="w-12 h-12 text-primary" />
            </div>
          </div>
          <h1 className="font-arcade text-2xl text-primary neon-text mb-2">
            {isLogin ? 'WELCOME BACK' : 'JOIN THE GAME'}
          </h1>
          <p className="text-muted-foreground">
            {isLogin
              ? 'Log in to save your scores'
              : 'Create an account to compete'}
          </p>
        </div>

        <div className="bg-card p-6 rounded-lg border border-border">
          {isLogin ? (
            <LoginForm
              onLogin={login}
              onSwitchToSignup={handleSwitchForm}
              isLoading={isLoading}
              error={error}
            />
          ) : (
            <SignupForm
              onSignup={signup}
              onSwitchToLogin={handleSwitchForm}
              isLoading={isLoading}
              error={error}
            />
          )}
        </div>

        <div className="mt-4 text-center">
          <p className="text-muted-foreground text-sm">
            Demo accounts: snake@game.com, py@game.com (any password 6+ chars)
          </p>
        </div>
      </div>
    </main>
  );
};

export default Auth;
