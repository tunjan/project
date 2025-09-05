import { useMemo } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { type User } from '@/types';

interface AuthState {
  currentUser: User | null;
}

interface AuthActions {
  login: (user: User) => void;
  logout: () => void;
  updateCurrentUser: (updatedData: Partial<User>) => void;
}

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set) => ({
      currentUser: null,
      login: (user) => set({ currentUser: user }),
      logout: () => set({ currentUser: null }),
      updateCurrentUser: (updatedData) =>
        set((state) => ({
          currentUser: state.currentUser
            ? { ...state.currentUser, ...updatedData }
            : null,
        })),
    }),
    {
      name: 'auth-storage',
    }
  )
);

export const useCurrentUser = () => {
  const currentUser = useAuthStore((state) => state.currentUser);
  return currentUser;
};

export const useLogin = () => useAuthStore((state) => state.login);
export const useLogout = () => useAuthStore((state) => state.logout);
export const useUpdateCurrentUser = () =>
  useAuthStore((state) => state.updateCurrentUser);

// Keep the old hook for backward compatibility but make it stable
export const useAuthActions = () => {
  const login = useAuthStore((state) => state.login);
  const logout = useAuthStore((state) => state.logout);
  const updateCurrentUser = useAuthStore((state) => state.updateCurrentUser);

  // Return a memoized object to prevent new object creation
  return useMemo(
    () => ({ login, logout, updateCurrentUser }),
    [login, logout, updateCurrentUser]
  );
};
