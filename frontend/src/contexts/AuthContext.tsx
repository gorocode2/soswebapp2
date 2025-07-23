'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, RegisterData } from '../models/types';
import { authApi, AuthResponse, RegisterResponse } from '../lib/auth-api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  logout: () => void;
  register: (userData: RegisterData) => Promise<{ success: boolean; message?: string; error?: string }>;
  checkAuthStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Token management
const TOKEN_KEY = 'sharks_auth_token';
const USER_KEY = 'sharks_user_data';

export const getStoredToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
};

export const setStoredToken = (token: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
};

export const removeStoredToken = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

export const getStoredUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  const userData = localStorage.getItem(USER_KEY);
  return userData ? JSON.parse(userData) : null;
};

export const setStoredUser = (user: User): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check authentication status on app load
  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      const token = getStoredToken();
      const storedUser = getStoredUser();

      if (token && storedUser) {
        // For now, trust the stored token and user data
        // In a production app, you should verify the token with the backend
        setUser(storedUser);
        setIsLoggedIn(true);
      } else {
        setUser(null);
        setIsLoggedIn(false);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      removeStoredToken();
      setUser(null);
      setIsLoggedIn(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Login function
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      console.log('🦈 Attempting login for:', email);

      const result: AuthResponse = await authApi.login(email, password);

      if (result.success && result.data) {
        const { token, user: userData } = result.data;
        
        // Store token and user data
        setStoredToken(token);
        setStoredUser(userData);
        setUser(userData);
        setIsLoggedIn(true);

        console.log('✅ Login successful:', userData.email);
        return { success: true, message: 'Login successful!' };
      } else {
        console.log('❌ Login failed:', result.error);
        return { success: false, error: result.error || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Login failed. Please try again.' };
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (userData: RegisterData) => {
    try {
      setIsLoading(true);
      console.log('🦈 Attempting registration for:', userData.email);

      const result: RegisterResponse = await authApi.register(userData);

      if (result.success && result.data) {
        const { token, user: newUser } = result.data;
        
        // Store token and user data
        setStoredToken(token);
        setStoredUser(newUser);
        setUser(newUser);
        setIsLoggedIn(true);

        console.log('✅ Registration successful:', newUser.email);
        return { success: true, message: 'Registration successful!' };
      } else {
        console.log('❌ Registration failed:', result.error);
        return { success: false, error: result.error || 'Registration failed' };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: 'Registration failed. Please try again.' };
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    console.log('🦈 User logging out');
    removeStoredToken();
    setUser(null);
    setIsLoggedIn(false);
  };

  // Check auth status on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const value: AuthContextType = {
    user,
    isLoading,
    isLoggedIn,
    login,
    logout,
    register,
    checkAuthStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
