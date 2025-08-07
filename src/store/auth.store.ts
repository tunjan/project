import { create } from 'zustand';
import { type User } from '@/types';

interface AuthState {
    currentUser: User | null;
}

interface AuthActions {
    login: (user: User) => void;
    logout: () => void;
    updateCurrentUser: (updatedData: Partial<User>) => void;
}

export const useAuthStore = create<AuthState & AuthActions>((set) => ({
    currentUser: null,
    login: (user) => set({ currentUser: user }),
    logout: () => set({ currentUser: null }),
    updateCurrentUser: (updatedData) =>
        set((state) => ({
            currentUser: state.currentUser
                ? { ...state.currentUser, ...updatedData }
                : null,
        })),
}));

export const useCurrentUser = () => useAuthStore((state) => state.currentUser);
export const useAuthActions = () => useAuthStore((state) => ({
    login: state.login,
    logout: state.logout,
    updateCurrentUser: state.updateCurrentUser,
}));