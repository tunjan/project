import { useMemo } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import {
  type Chapter,
  type ChapterJoinRequest,
  NotificationType,
  type User,
} from '@/types';

import { initialChapters } from './initialData';
import { useNotificationsStore } from './notifications.store';
import { useUsersStore } from './users.store';

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
  resetToInitialData: () => void;
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
      deleteChapter: (chapterName) => {
        set((state) => ({
          chapters: state.chapters.filter((c) => c.name !== chapterName),
        }));

        const usersStore = useUsersStore.getState();
        const usersToUpdate = usersStore.users.filter(
          (u) =>
            u.chapters.includes(chapterName) ||
            u.organiserOf?.includes(chapterName)
        );

        usersToUpdate.forEach((user) => {
          const updatedChapters = user.chapters.filter(
            (c) => c !== chapterName
          );
          usersStore.updateUserChapters(user.id, updatedChapters);

          if (user.organiserOf && user.organiserOf.includes(chapterName)) {
            const updatedOrganiserOf = user.organiserOf.filter(
              (c) => c !== chapterName
            );
            usersStore.updateUserOrganiserOf(user.id, updatedOrganiserOf);
          }
        });
      },

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

        const allUsers = useUsersStore.getState().users;
        const chapterOrganizers = allUsers.filter(
          (u) =>
            u.role === 'Chapter Organiser' &&
            u.organiserOf?.includes(chapterName)
        );

        const notificationsToCreate = chapterOrganizers.map((org) => ({
          userId: org.id,
          type: NotificationType.CHAPTER_JOIN_REQUEST,
          message: `${user.name} has requested to join the ${chapterName} chapter.`,
          linkTo: '/manage',
          relatedUser: user,
        }));

        if (notificationsToCreate.length > 0) {
          useNotificationsStore
            .getState()
            .addNotifications(notificationsToCreate);
        }
      },

      approveChapterJoinRequest: (requestId, approver) => {
        const request = get().chapterJoinRequests.find(
          (r) => r.id === requestId
        );
        if (!request) return;

        set((state) => ({
          chapterJoinRequests: state.chapterJoinRequests.filter(
            (r) => r.id !== requestId
          ),
        }));

        const usersStore = useUsersStore.getState();
        const user = usersStore.users.find((u) => u.id === request.user.id);
        if (user) {
          const newChapters = [
            ...new Set([...user.chapters, request.chapterName]),
          ];
          usersStore.updateUserChapters(user.id, newChapters);
        }

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

      resetToInitialData: () => {
        set({ chapters: initialChapters, chapterJoinRequests: [] });
      },
    }),
    { name: 'chapters-store' }
  )
);

export const useChaptersState = () => useChaptersStore((s) => s.chapters);
export const useChapterJoinRequests = () =>
  useChaptersStore((s) => s.chapterJoinRequests);
export const useChaptersActions = () => {
  const store = useChaptersStore();
  return useMemo(
    () => ({
      createChapter: store.createChapter,
      updateChapter: store.updateChapter,
      deleteChapter: store.deleteChapter,
      requestToJoinChapter: store.requestToJoinChapter,
      approveChapterJoinRequest: store.approveChapterJoinRequest,
      denyChapterJoinRequest: store.denyChapterJoinRequest,
      resetToInitialData: store.resetToInitialData,
    }),
    [
      store.createChapter,
      store.updateChapter,
      store.deleteChapter,
      store.requestToJoinChapter,
      store.approveChapterJoinRequest,
      store.denyChapterJoinRequest,
      store.resetToInitialData,
    ]
  );
};

export const useChapterByName = (_chapterName?: string) =>
  useChaptersStore((s) => {
    return s.chapters;
  });
