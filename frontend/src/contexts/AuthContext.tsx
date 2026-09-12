import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; user?: User; error?: string }>;
  switchScenario: (personaTag: string) => Promise<boolean>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('finpulse_token'));
  const [loading, setLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    const storedToken = localStorage.getItem('finpulse_token');
    if (!storedToken) {
      setUser(null);
      setToken(null);
      setLoading(false);
      return;
    }

    try {
      const res = await api.get('/auth/me');
      if (res.data.success && res.data.user) {
        setUser(res.data.user);
        setToken(storedToken);
      } else {
        localStorage.removeItem('finpulse_token');
        setToken(null);
        setUser(null);
      }
    } catch (err) {
      console.warn('Session expired or invalid token:', err);
      localStorage.removeItem('finpulse_token');
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> => {
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        localStorage.setItem('finpulse_token', res.data.token);
        setToken(res.data.token);
        setUser(res.data.user);
        return { success: true, user: res.data.user };
      } else {
        return { success: false, error: res.data.error || 'Authentication failed.' };
      }
    } catch (err: any) {
      console.error('Login error:', err);
      const errMsg = err.response?.data?.error || 'Invalid credentials or network failure.';
      return { success: false, error: errMsg };
    } finally {
      setLoading(false);
    }
  };

  const switchScenario = async (personaTag: string): Promise<boolean> => {
    setLoading(true);
    try {
      const res = await api.post('/auth/switch-scenario', { personaTag });
      if (res.data.success) {
        localStorage.setItem('finpulse_token', res.data.token);
        setToken(res.data.token);
        setUser(res.data.user);
        return true;
      }
    } catch (err) {
      console.error('Scenario switch failed:', err);
    } finally {
      setLoading(false);
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem('finpulse_token');
    setToken(null);
    setUser(null);
    setLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, switchScenario, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
