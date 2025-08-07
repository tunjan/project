import React, { createContext, useState, useContext, useCallback } from 'react';
import { type User } from '../types';

interface AuthContextType {
  currentUser: User | null;
  login: (user: User) => void;
  logout: () => void;
  updateCurrentUser: (updatedData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const login = useCallback((user: User) => {
    setCurrentUser(user);
  }, []);

  const logout = useCallback(() => {
    setCurrentUser(null);
  }, []);

  const updateCurrentUser = useCallback((updatedData: Partial<User>) => {
    setCurrentUser(prev => prev ? { ...prev, ...updatedData } : null);
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, updateCurrentUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
