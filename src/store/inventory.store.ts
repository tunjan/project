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
            inventory: initialInventory, // Start with initial inventory data

            updateChapterInventory: (chapterName: string, items: InventoryItem[]) => {
                set((state) => ({
                    inventory: [
                        ...state.inventory.filter(item => item.chapterName !== chapterName),
                        ...items.map(item => ({ ...item, chapterName }))
                    ]
                }));
            },
        }),
        { name: 'inventory-store' }
    )
);

export const useInventoryState = () => useInventoryStore((s) => s.inventory);
export const useInventoryActions = () => useInventoryStore((s) => ({
    updateChapterInventory: s.updateChapterInventory,
}));

export const useChapterInventory = (chapterName: string) =>
    useInventoryStore((state) =>
        state.inventory.filter(item => item.chapterName === chapterName)
    );
