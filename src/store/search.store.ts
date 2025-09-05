import { useMemo } from 'react';
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

export const useSearchActions = () => {
  const open = useSearchStore((s) => s.open);
  const close = useSearchStore((s) => s.close);
  const toggle = useSearchStore((s) => s.toggle);

  return useMemo(() => ({ open, close, toggle }), [open, close, toggle]);
};
