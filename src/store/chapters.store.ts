import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { type Chapter } from '@/types';
import { initialChapters } from './initialData';

export interface ChaptersState {
  chapters: Chapter[];
}

export interface ChaptersActions {
  createChapter: (newChapterData: Chapter) => void;
  updateChapter: (chapterName: string, updatedData: Partial<Chapter>) => void;
  deleteChapter: (chapterName: string) => void;
}

export const useChaptersStore = create<ChaptersState & ChaptersActions>()(
  persist(
    (set) => ({
      chapters: initialChapters,
      createChapter: (newChapterData) =>
        set((state) => ({ chapters: [...state.chapters, newChapterData] })),
      updateChapter: (chapterName, updatedData) =>
        set((state) => ({
          chapters: state.chapters.map((c) =>
            c.name === chapterName ? { ...c, ...updatedData } : c
          ),
        })),
      deleteChapter: (chapterName) =>
        set((state) => ({
          chapters: state.chapters.filter((c) => c.name !== chapterName),
        })),
    }),
    { name: 'chapters-store' }
  )
);

export const useChaptersState = () => useChaptersStore((s) => s.chapters);
export const useChaptersActions = () =>
  useChaptersStore((s) => ({
    createChapter: s.createChapter,
    updateChapter: s.updateChapter,
    deleteChapter: s.deleteChapter,
  }));


