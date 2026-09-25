import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { LoginCredentials, User } from '../types/auth';
import { authApi } from '../api/authApi';
import { AUTH_TOKEN_KEY, USER_DATA_KEY } from '../api/axiosClient';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginError: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem(USER_DATA_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem(AUTH_TOKEN_KEY);
    } catch {
      return null;
    }
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    setLoginError(null);
    try {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(USER_DATA_KEY);
    } catch {
      // Ignore storage errors
    }
  }, []);

  // Listen for unauthorized events emitted by the axios interceptor
  useEffect(() => {
    const handleUnauthorized = () => {
      logout();
    };
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, [logout]);

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    setLoginError(null);
    try {
      const response = await authApi.login(credentials);
      const userPayload: User = {
        id: response.id,
        username: response.username,
        email: response.email,
        firstName: response.firstName,
        lastName: response.lastName,
        gender: response.gender,
        image: response.image,
        token: response.accessToken,
        refreshToken: response.refreshToken,
      };

      setToken(response.accessToken);
      setUser(userPayload);

      try {
        localStorage.setItem(AUTH_TOKEN_KEY, response.accessToken);
        localStorage.setItem(USER_DATA_KEY, JSON.stringify(userPayload));
      } catch {
        // Storage failed
      }
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : 'Invalid credentials. Please verify username and password.';
      setLoginError(errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => setLoginError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        loginError,
        login,
        logout,
        clearError,
      }}
    >
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
