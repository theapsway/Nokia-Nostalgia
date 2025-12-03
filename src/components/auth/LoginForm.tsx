import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { validateLoginForm, sanitizeInput } from '@/lib/validation';

interface LoginFormProps {
  onLogin: (email: string, password: string) => Promise<boolean>;
  onSwitchToSignup: () => void;
  isLoading: boolean;
  error: string | null;
}

const LoginForm: React.FC<LoginFormProps> = ({
  onLogin,
  onSwitchToSignup,
  isLoading,
  error,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    const sanitizedEmail = sanitizeInput(email);
    const validation = validateLoginForm(sanitizedEmail, password);

    if (!validation.isValid) {
      setLocalError(validation.error || 'Validation failed');
      return;
    }

    await onLogin(sanitizedEmail, password);
  };

  const displayError = localError || error;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="snake@game.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={isLoading}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={isLoading}
        />
      </div>
      
      {displayError && (
        <p className="text-accent text-sm bg-accent/10 p-2 rounded">{displayError}</p>
      )}

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Logging in...
          </>
        ) : (
          'Log In'
        )}
      </Button>

      <p className="text-center text-muted-foreground text-sm">
        Don't have an account?{' '}
        <button
          type="button"
          onClick={onSwitchToSignup}
          className="text-primary hover:underline"
        >
          Sign up
        </button>
      </p>
    </form>
  );
};

export default LoginForm;
