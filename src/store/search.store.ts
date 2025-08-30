import { create } from 'zustand';

interface SearchState {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

export const useSearchStore = create<SearchState>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
}));

export const useIsSearchOpen = () => useSearchStore((s) => s.isOpen);
export const useSearchActions = () =>
  useSearchStore((s) => ({ open: s.open, close: s.close, toggle: s.toggle }));
