import { create } from 'zustand';
import { type User, Role, OnboardingStatus, type OrganizerNote, NotificationType } from '@/types';
import { persist } from 'zustand/middleware';
import nacl from 'tweetnacl';
import naclUtil from 'tweetnacl-util';
import {
  processedUsers,
} from './initialData';
import { ROLE_HIERARCHY } from '@/utils/auth';
import { type OnboardingAnswers } from '@/types';
import { useNotificationsStore } from './notifications.store';
import { useAuthStore } from './auth.store';

export interface UsersState {
  users: User[];
}

export interface UsersActions {
  register: (formData: {
    name: string;
    instagram: string;
    chapter: string;
    email: string;
    answers: OnboardingAnswers;
  }) => void;
  updateUserStatus: (
    userId: string,
    status: OnboardingStatus,
    approver?: User
  ) => void;
  completeOnboardingCall: (userId: string) => void;
  confirmUserIdentity: (userId: string) => void;
  updateUserRole: (userId: string, role: Role) => void;
  setChapterOrganiser: (userId: string, chaptersToOrganise: string[]) => void;
  updateUserChapters: (userId: string, newChapters: string[]) => void;
  updateUserOrganiserOf: (userId: string, newOrganiserOf: string[]) => void;
  updateProfile: (userId: string, updatedData: Partial<User>) => void;
  deleteUser: (userIdToDelete: string) => void;
  addOrganizerNote: (targetUserId: string, noteContent: string, author: User) => void;
  editOrganizerNote: (
    targetUserId: string,
    noteId: string,
    newContent: string
  ) => void;
  deleteOrganizerNote: (targetUserId: string, noteId: string) => void;
  batchUpdateUserStats: (
    updates: { userId: string; newStats: Partial<User['stats']> }[]
  ) => void;
  resetToInitialData: () => void;
}

export const useUsersStore = create<UsersState & UsersActions>()(
  persist(
    (set, get) => ({
      users: processedUsers,

      // Debug logging
      ...(() => {
        console.log('Users store initialized with users:', processedUsers);
        console.log('Users store - processedUsers length:', processedUsers.length);
        return {};
      })(),

      register: (formData) => {
        const newUser: User = {
          id: `user_${Date.now()}`,
          email: formData.email,
          name: formData.name,
          instagram: formData.instagram || undefined,
          chapters: [formData.chapter],
          onboardingAnswers: formData.answers,
          role: Role.ACTIVIST,
          onboardingStatus: OnboardingStatus.PENDING_APPLICATION_REVIEW,
          stats: {
            totalHours: 0,
            cubesAttended: 0,
            veganConversions: 0,
            totalConversations: 0,
            cities: [],
          },
          profilePictureUrl: `https://i.pravatar.cc/100?u=${Date.now()}`,
          badges: [],
          hostingAvailability: false,
          joinDate: new Date(),
          lastLogin: new Date(),
        };
        set((state) => ({ users: [...state.users, newUser] }));

        // Find organizers of the chapter and notify them
        const chapterOrganizers = get().users.filter(
          (u) =>
            u.role === Role.CHAPTER_ORGANISER &&
            u.organiserOf?.includes(formData.chapter)
        );

        const notificationsToCreate = chapterOrganizers.map((org) => ({
          userId: org.id,
          type: NotificationType.NEW_APPLICANT,
          message: `${formData.name} has applied to join the ${formData.chapter} chapter.`,
          linkTo: '/manage',
          relatedUser: newUser,
        }));
        useNotificationsStore.getState().addNotifications(notificationsToCreate);
      },

      updateUserStatus: (userId, status, approver) => {
        set((state) => ({
          users: state.users.map((u) =>
            u.id === userId ? { ...u, onboardingStatus: status } : u
          ),
        }));

        const user = get().users.find((u) => u.id === userId);
        if (user && approver) {
          if (status === OnboardingStatus.AWAITING_VERIFICATION) {
            useNotificationsStore.getState().addNotification({
              userId: user.id,
              type: NotificationType.REQUEST_ACCEPTED,
              message: `Your application for ${user.chapters[0]} was approved by ${approver.name}! Get verified in person.`,
              linkTo: '/dashboard',
            });
          }
        }
      },

      completeOnboardingCall: (userId) => {
        set((state) => ({
          users: state.users.map((u) =>
            u.id === userId
              ? { ...u, onboardingStatus: OnboardingStatus.AWAITING_VERIFICATION }
              : u
          ),
        }));
      },

      confirmUserIdentity: (userId) => {
        const keyPair = nacl.box.keyPair();
        const secretKey = naclUtil.encodeBase64(keyPair.secretKey);
        const publicKey = naclUtil.encodeBase64(keyPair.publicKey);

        set((state) => ({
          users: state.users.map((u) =>
            u.id === userId
              ? {
                ...u,
                onboardingStatus: OnboardingStatus.CONFIRMED,
                role: Role.CONFIRMED_ACTIVIST,
                cryptoId: { publicKey, secretKey },
              }
              : u
          ),
        }));
      },

      updateUserRole: (userId, role) =>
        set((state) => ({
          users: state.users.map((u) => {
            if (u.id !== userId) return u;
            const changes: Partial<User> = { role };
            if (ROLE_HIERARCHY[role] < ROLE_HIERARCHY[Role.CHAPTER_ORGANISER])
              changes.organiserOf = [];

            const updatedUser = { ...u, ...changes };

            // If the updated user is the current logged-in user, update auth store as well
            if (useAuthStore.getState().currentUser?.id === updatedUser.id) {
              useAuthStore.getState().updateCurrentUser(updatedUser);
            }

            return updatedUser;
          }),
        })),

      setChapterOrganiser: (userId, chaptersToOrganise) =>
        set((state) => ({
          users: state.users.map((u) =>
            u.id === userId
              ? {
                ...u,
                role: Role.CHAPTER_ORGANISER,
                organiserOf: [...new Set(chaptersToOrganise)],
              }
              : u
          ),
        })),

      updateUserChapters: (userId, newChapters) =>
        set((state) => {
          const updatedUsers = state.users.map((u) =>
            u.id === userId ? { ...u, chapters: newChapters } : u
          );
          // If this is the current user, also update the auth store
          if (useAuthStore.getState().currentUser?.id === userId) {
            useAuthStore.getState().updateCurrentUser({ chapters: newChapters });
          }
          return { users: updatedUsers };
        }),

      updateUserOrganiserOf: (userId, newOrganiserOf) =>
        set((state) => ({
          users: state.users.map((u) => (u.id === userId ? { ...u, organiserOf: newOrganiserOf } : u)),
        })),

      updateProfile: (userId, updatedData) => {
        const fullUpdate = {
          ...updatedData,
          instagram: updatedData.instagram || undefined,
        } as Partial<User>;
        set((state) => ({
          users: state.users.map((u) => (u.id === userId ? { ...u, ...fullUpdate } : u)),
        }));
        useAuthStore.getState().updateCurrentUser(fullUpdate);
      },

      deleteUser: (userIdToDelete) => {
        set((state) => ({
          users: state.users.filter((u) => u.id !== userIdToDelete),
        }));
        // Log out the user if they delete their own account
        if (useAuthStore.getState().currentUser?.id === userIdToDelete) {
          useAuthStore.getState().logout();
        }
      },

      addOrganizerNote: (targetUserId, noteContent, author) => {
        const newNote: OrganizerNote = {
          id: `note_${Date.now()}`,
          authorName: author.name,
          authorId: author.id,
          content: noteContent,
          createdAt: new Date(),
        };
        set((state) => ({
          users: state.users.map((u) =>
            u.id === targetUserId
              ? { ...u, organizerNotes: [...(u.organizerNotes || []), newNote] }
              : u
          ),
        }));
      },

      editOrganizerNote: (targetUserId, noteId, newContent) => {
        set((state) => ({
          users: state.users.map((u) => {
            if (u.id !== targetUserId) return u;
            const updatedNotes = u.organizerNotes?.map((n) =>
              n.id === noteId ? { ...n, content: newContent } : n
            );
            return { ...u, organizerNotes: updatedNotes };
          }),
        }));
      },

      deleteOrganizerNote: (targetUserId, noteId) => {
        set((state) => ({
          users: state.users.map((u) => {
            if (u.id !== targetUserId) return u;
            const updatedNotes = u.organizerNotes?.filter((n) => n.id !== noteId);
            return { ...u, organizerNotes: updatedNotes };
          }),
        }));
      },
      batchUpdateUserStats: (updates) => {
        set((state) => ({
          users: state.users.map((user) => {
            const update = updates.find((u) => u.userId === user.id);
            if (update) {
              return {
                ...user,
                stats: { ...user.stats, ...update.newStats },
              };
            }
            return user;
          }),
        }));
      },

      resetToInitialData: () => {
        set({ users: processedUsers });
      },
    }),
    {
      name: 'users-store', onRehydrateStorage: () => (rehydrated, error) => {
        if (rehydrated) {
          console.log('Users store rehydrated successfully');
        } else {
          console.log('Users store rehydration failed', error);
        }
      }
    }
  )
);

export const useUsersState = () => useUsersStore((s) => s.users);
export const useUsersActions = () =>
  useUsersStore((s) => ({
    register: s.register,
    updateUserStatus: s.updateUserStatus,
    completeOnboardingCall: s.completeOnboardingCall,
    confirmUserIdentity: s.confirmUserIdentity,
    updateUserRole: s.updateUserRole,
    setChapterOrganiser: s.setChapterOrganiser,
    updateUserChapters: s.updateUserChapters,
    updateUserOrganiserOf: s.updateUserOrganiserOf,
    updateProfile: s.updateProfile,
    deleteUser: s.deleteUser,
    addOrganizerNote: s.addOrganizerNote,
    editOrganizerNote: s.editOrganizerNote,
    deleteOrganizerNote: s.deleteOrganizerNote,
    batchUpdateUserStats: s.batchUpdateUserStats,
    resetToInitialData: s.resetToInitialData,
  }));

// Selectors
export const useUserById = (userId?: string) => {
  const user = useUsersStore((s) => {
    console.log('useUserById called with userId:', userId);
    console.log('useUserById - store users:', s.users);
    console.log('useUserById - users length:', s.users.length);
    const foundUser = s.users.find((u) => u.id === userId);
    console.log('useUserById - found user:', foundUser);
    return foundUser;
  });
  return user;
};


