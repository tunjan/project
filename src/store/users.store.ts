import { create } from 'zustand';
import { type User, Role, OnboardingStatus, type OrganizerNote } from '@/types';
import { persist } from 'zustand/middleware';
import {
  processedUsers,
  Role as RoleEnum,
} from './initialData';

export interface UsersState {
  users: User[];
}

export interface UsersActions {
  register: (formData: {
    name: string;
    instagram: string;
    chapter: string;
    email: string;
    answers: any; // keep typed through types if needed
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
  updateProfile: (userId: string, updatedData: Partial<User>) => void;
  deleteUser: (userIdToDelete: string) => void;
  addOrganizerNote: (targetUserId: string, noteContent: string, author: User) => void;
  editOrganizerNote: (
    targetUserId: string,
    noteId: string,
    newContent: string
  ) => void;
  deleteOrganizerNote: (targetUserId: string, noteId: string) => void;
}

export const useUsersStore = create<UsersState & UsersActions>()(
  persist(
    (set, get) => ({
      users: processedUsers,

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
        };
        set((state) => ({ users: [...state.users, newUser] }));
      },

      updateUserStatus: (userId, status) => {
        set((state) => ({
          users: state.users.map((u) =>
            u.id === userId ? { ...u, onboardingStatus: status } : u
          ),
        }));
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
        // Keep behavior minimal in slice; complex logic can be handled in a service if needed
        set((state) => ({
          users: state.users.map((u) =>
            u.id === userId
              ? {
                  ...u,
                  onboardingStatus: OnboardingStatus.CONFIRMED,
                  role: Role.CONFIRMED_ACTIVIST,
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
            if ((RoleEnum as any)[role] < (RoleEnum as any)[Role.CHAPTER_ORGANISER])
              (changes as any).organiserOf = [];
            return { ...u, ...changes };
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
        set((state) => ({
          users: state.users.map((u) => (u.id === userId ? { ...u, chapters: newChapters } : u)),
        })),

      updateProfile: (userId, updatedData) => {
        const fullUpdate = {
          ...updatedData,
          instagram: updatedData.instagram || undefined,
        } as Partial<User>;
        set((state) => ({
          users: state.users.map((u) => (u.id === userId ? { ...u, ...fullUpdate } : u)),
        }));
      },

      deleteUser: (userIdToDelete) => {
        set((state) => ({
          users: state.users.filter((u) => u.id !== userIdToDelete),
        }));
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
    }),
    { name: 'users-store' }
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
    updateProfile: s.updateProfile,
    deleteUser: s.deleteUser,
    addOrganizerNote: s.addOrganizerNote,
    editOrganizerNote: s.editOrganizerNote,
    deleteOrganizerNote: s.deleteOrganizerNote,
  }));

export const useUserById = (userId?: string) =>
  useUsersStore((s) => s.users.find((u) => u.id === userId));


