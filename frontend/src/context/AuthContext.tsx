import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from '@/types/game';
import { api } from '@/services/api';

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    error: string | null;
    login: (email: string, password: string) => Promise<boolean>;
    signup: (username: string, email: string, password: string) => Promise<boolean>;
    logout: () => Promise<void>;
    clearError: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadUser = async () => {
            // Try to restore user from local storage first for immediate UI feedback
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                try {
                    setUser(JSON.parse(storedUser));
                } catch (e) {
                    console.error("Failed to parse stored user", e);
                    localStorage.removeItem('user');
                }
            }

            // Then verify with backend
            try {
                const response = await api.auth.getCurrentUser();
                if (response.success && response.data) {
                    setUser(response.data);
                    localStorage.setItem('user', JSON.stringify(response.data));
                } else {
                    // If backend says not logged in, clear local state
                    // But only if we actually got a response (not network error)
                    if (response.success === true && response.data === null) {
                        setUser(null);
                        localStorage.removeItem('user');
                    }
                }
            } catch (e) {
                console.error("Failed to verify user with backend", e);
            } finally {
                setIsLoading(false);
            }
        };
        loadUser();
    }, []);

    const login = useCallback(async (email: string, password: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await api.auth.login(email, password);

            if (response.success && response.user) {
                setUser(response.user);
                localStorage.setItem('user', JSON.stringify(response.user));
                return true;
            }
            setError(response.error || 'Login failed');
            return false;
        } catch (e) {
            setError('An unexpected error occurred');
            return false;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const signup = useCallback(async (username: string, email: string, password: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await api.auth.signup(username, email, password);

            if (response.success && response.user) {
                setUser(response.user);
                localStorage.setItem('user', JSON.stringify(response.user));
                return true;
            }
            setError(response.error || 'Signup failed');
            return false;
        } catch (e) {
            setError('An unexpected error occurred');
            return false;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const logout = useCallback(async () => {
        try {
            await api.auth.logout();
        } catch (e) {
            console.error("Logout failed", e);
        } finally {
            setUser(null);
            localStorage.removeItem('user');
        }
    }, []);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                error,
                login,
                signup,
                logout,
                clearError,
                isAuthenticated: !!user,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuthContext = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuthContext must be used within an AuthProvider');
    }
    return context;
};
