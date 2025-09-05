import { useMemo } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { type InventoryItem } from '@/types';

import { initialInventory } from './initialData';

interface InventoryState {
  inventory: InventoryItem[];
}

interface InventoryActions {
  updateChapterInventory: (chapterName: string, items: InventoryItem[]) => void;
}

export const useInventoryStore = create<InventoryState & InventoryActions>()(
  persist(
    (set) => ({
      inventory: initialInventory,
      updateChapterInventory: (chapterName: string, items: InventoryItem[]) => {
        set((state) => ({
          inventory: [
            ...state.inventory.filter(
              (item) => item.chapterName !== chapterName
            ),
            ...items.map((item) => ({ ...item, chapterName })),
          ],
        }));
      },
    }),
    { name: 'inventory-store' }
  )
);

export const useInventoryState = () => useInventoryStore((s) => s.inventory);
export const useInventoryActions = () => {
  const store = useInventoryStore();
  return useMemo(
    () => ({
      updateChapterInventory: store.updateChapterInventory,
    }),
    [store.updateChapterInventory]
  );
};

export const useChapterInventory = (chapterName: string) => {
  const inventory = useInventoryStore((state) => state.inventory);
  return useMemo(() => {
    if (!chapterName) return [];
    return inventory.filter((item) => item.chapterName === chapterName);
  }, [inventory, chapterName]);
};
