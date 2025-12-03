import { useState, useEffect, useCallback } from 'react';
import { User } from '@/types/game';
import { api } from '@/services/api';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      const response = await api.auth.getCurrentUser();
      if (response.success && response.data) {
        setUser(response.data);
      }
      setIsLoading(false);
    };
    loadUser();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    const response = await api.auth.login(email, password);
    setIsLoading(false);
    
    if (response.success && response.user) {
      setUser(response.user);
      return true;
    }
    setError(response.error || 'Login failed');
    return false;
  }, []);

  const signup = useCallback(async (username: string, email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    const response = await api.auth.signup(username, email, password);
    setIsLoading(false);
    
    if (response.success && response.user) {
      setUser(response.user);
      return true;
    }
    setError(response.error || 'Signup failed');
    return false;
  }, []);

  const logout = useCallback(async () => {
    await api.auth.logout();
    setUser(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    user,
    isLoading,
    error,
    login,
    signup,
    logout,
    clearError,
    isAuthenticated: !!user,
  };
};
