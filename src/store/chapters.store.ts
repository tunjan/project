import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { type Chapter, type ChapterJoinRequest, type User, NotificationType } from '@/types';
import { initialChapters } from './initialData';
import { useNotificationsStore } from './notifications.store';

export interface ChaptersState {
  chapters: Chapter[];
  chapterJoinRequests: ChapterJoinRequest[];
}

export interface ChaptersActions {
  createChapter: (newChapterData: Chapter) => void;
  updateChapter: (chapterName: string, updatedData: Partial<Chapter>) => void;
  deleteChapter: (chapterName: string) => void;
  requestToJoinChapter: (chapterName: string, user: User) => void;
  approveChapterJoinRequest: (requestId: string, approver: User) => void;
  denyChapterJoinRequest: (requestId: string) => void;
}

export const useChaptersStore = create<ChaptersState & ChaptersActions>()(
  persist(
    (set, get) => ({
      chapters: initialChapters,
      chapterJoinRequests: [],

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

      requestToJoinChapter: (chapterName, user) => {
        const existingRequest = get().chapterJoinRequests.find(
          (req) => req.user.id === user.id && req.chapterName === chapterName
        );
        if (existingRequest) return;

        const newRequest: ChapterJoinRequest = {
          id: `cjr_${Date.now()}`,
          user,
          chapterName,
          status: 'Pending',
          createdAt: new Date(),
        };

        set((state) => ({
          chapterJoinRequests: [...state.chapterJoinRequests, newRequest],
        }));

        // Notify chapter organizers
        useNotificationsStore.getState().addNotification({
          userId: user.id, // This will be updated when we have users store access
          type: NotificationType.CHAPTER_JOIN_REQUEST,
          message: `${user.name} has requested to join the ${chapterName} chapter.`,
          linkTo: '/manage',
          relatedUser: user,
        });
      },

      approveChapterJoinRequest: (requestId, approver) => {
        const request = get().chapterJoinRequests.find((r) => r.id === requestId);
        if (!request) return;

        set((state) => ({
          chapterJoinRequests: state.chapterJoinRequests.map((r) =>
            r.id === requestId ? { ...r, status: 'Approved' } : r
          ),
        }));

        // Update user's chapters
        import('./users.store').then(({ useUsersStore }) => {
          const usersStore = useUsersStore.getState();
          const user = usersStore.users.find(u => u.id === request.user.id);
          if (user) {
            const newChapters = [...new Set([...user.chapters, request.chapterName])];
            usersStore.updateUserChapters(user.id, newChapters);
          }
        });

        useNotificationsStore.getState().addNotification({
          userId: request.user.id,
          type: NotificationType.CHAPTER_JOIN_APPROVED,
          message: `Your request to join the ${request.chapterName} chapter has been approved by ${approver.name}.`,
          linkTo: `/chapters/${request.chapterName}`,
          relatedUser: approver,
        });
      },

      denyChapterJoinRequest: (requestId) => {
        set((state) => ({
          chapterJoinRequests: state.chapterJoinRequests.filter(
            (r) => r.id !== requestId
          ),
        }));
      },
    }),
    { name: 'chapters-store' }
  )
);

export const useChaptersState = () => useChaptersStore((s) => s.chapters);
export const useChapterJoinRequests = () => useChaptersStore((s) => s.chapterJoinRequests);
export const useChaptersActions = () =>
  useChaptersStore((s) => ({
    createChapter: s.createChapter,
    updateChapter: s.updateChapter,
    deleteChapter: s.deleteChapter,
    requestToJoinChapter: s.requestToJoinChapter,
    approveChapterJoinRequest: s.approveChapterJoinRequest,
    denyChapterJoinRequest: s.denyChapterJoinRequest,
  }));

// Selectors
export const useChapterByName = (chapterName?: string) =>
  useChaptersStore((s) =>
    chapterName
      ? s.chapters.find(
        (c) => c.name.toLowerCase() === chapterName.toLowerCase()
      )
      : undefined
  );


