import { create } from 'zustand';
import { type User, Role, OnboardingStatus, type OrganizerNote, NotificationType } from '@/types';
import { persist } from 'zustand/middleware';
import {
  processedUsers,
} from './initialData';
import { ROLE_HIERARCHY } from '@/utils/auth';
import { type OnboardingAnswers } from '@/types';
import { useNotificationsStore } from './notifications.store';
import { useChaptersStore } from './chapters.store';
import { useAuthStore } from './auth.store';

// Helper function to validate onboarding status transitions
const isValidStatusTransition = (fromStatus: OnboardingStatus, toStatus: OnboardingStatus): boolean => {
  const validTransitions: Record<OnboardingStatus, OnboardingStatus[]> = {
    [OnboardingStatus.PENDING_APPLICATION_REVIEW]: [
      OnboardingStatus.PENDING_ONBOARDING_CALL,
      OnboardingStatus.DENIED
    ],
    [OnboardingStatus.PENDING_ONBOARDING_CALL]: [
      OnboardingStatus.AWAITING_FIRST_CUBE,
      OnboardingStatus.DENIED
    ],
    [OnboardingStatus.AWAITING_FIRST_CUBE]: [
      OnboardingStatus.AWAITING_MASTERCLASS,
      OnboardingStatus.AWAITING_REVISION_CALL
    ],
    [OnboardingStatus.AWAITING_MASTERCLASS]: [
      OnboardingStatus.AWAITING_REVISION_CALL
    ],
    [OnboardingStatus.AWAITING_REVISION_CALL]: [
      OnboardingStatus.CONFIRMED
    ],
    [OnboardingStatus.CONFIRMED]: [],
    [OnboardingStatus.DENIED]: [],
    [OnboardingStatus.INACTIVE]: []
  };

  return validTransitions[fromStatus]?.includes(toStatus) ?? false;
};

// Helper function to validate onboarding state
const validateOnboardingState = (user: User): { isValid: boolean; issues: string[] } => {
  const issues: string[] = [];

  // Check for invalid status combinations
  if (user.onboardingStatus === OnboardingStatus.CONFIRMED && !user.onboardingProgress?.watchedMasterclass) {
    issues.push('Confirmed user has not watched masterclass');
  }

  if (user.onboardingStatus === OnboardingStatus.AWAITING_REVISION_CALL && user.stats.cubesAttended === 0) {
    issues.push('User awaiting revision call has not attended any cubes');
  }

  if (user.onboardingStatus === OnboardingStatus.AWAITING_MASTERCLASS && user.onboardingProgress?.watchedMasterclass) {
    issues.push('User awaiting masterclass has already watched it');
  }

  return { isValid: issues.length === 0, issues };
};

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
  finalizeOnboarding: (userId: string) => void;
  updateUserRole: (userId: string, role: Role) => void;
  setChapterOrganiser: (userId: string, chaptersToOrganise: string[]) => void;
  updateUserChapters: (userId: string, newChapters: string[]) => void;
  updateUserOrganiserOf: (userId: string, newOrganiserOf: string[]) => void;
  updateProfile: (userId: string, updatedData: Partial<User>) => void;
  // Onboarding progress actions
  confirmWatchedMasterclass: (userId: string) => void;
  scheduleRevisionCall: (userId: string, organiserId: string, when: Date) => void;
  deleteUser: (userIdToDelete: string) => Promise<void>;
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
  validateUserOnboarding: (userId: string) => { isValid: boolean; issues: string[] };
  autoAdvanceOnboarding: (userId: string) => void;
  fixOnboardingIssues: () => void;
  resetToInitialData: () => void;
  getUsers: () => User[];
  clearPersistedData: () => void;
  init: () => void;
}

export const useUsersStore = create<UsersState & UsersActions>()(
  persist(
    (set, get) => ({
      users: processedUsers,

      // Ensure users are always available
      getUsers: () => {
        const state = get();
        if (!state.users || state.users.length === 0) {
          set({ users: processedUsers });
          return processedUsers;
        }
        return state.users;
      },

      init: () => { },

      register: (formData) => {
        const newUser: User = {
          id: `user_${Date.now()}`,
          email: formData.email,
          name: formData.name,
          instagram: formData.instagram || undefined,
          chapters: [formData.chapter],
          onboardingAnswers: formData.answers,
          role: Role.APPLICANT,
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
        let organizersToNotify = get().users.filter(
          (u) =>
            u.role === Role.CHAPTER_ORGANISER &&
            u.organiserOf?.includes(formData.chapter)
        );

        // **FIX: Application Black Hole Escalation Logic**
        if (organizersToNotify.length === 0) {
          const allChapters = useChaptersStore.getState().chapters;
          const chapterData = allChapters.find(c => c.name === formData.chapter);
          if (chapterData) {
            // Escalate to Regional Organiser
            organizersToNotify = get().users.filter(u => u.role === Role.REGIONAL_ORGANISER && u.managedCountry === chapterData.country);
          }
        }

        if (organizersToNotify.length === 0) {
          // Escalate to Global Admins if no regional organizer is found
          organizersToNotify = get().users.filter(u => u.role === Role.GLOBAL_ADMIN);
        }

        const notificationsToCreate = organizersToNotify.map((org) => ({
          userId: org.id,
          type: NotificationType.NEW_APPLICANT,
          message: `${formData.name} has applied to join the ${formData.chapter} chapter.`,
          linkTo: '/manage',
          relatedUser: newUser,
        }));
        useNotificationsStore.getState().addNotifications(notificationsToCreate);
      },

      updateUserStatus: (userId, status, approver) => {
        const currentUser = get().users.find((u) => u.id === userId);
        if (!currentUser) {
          console.error(`User ${userId} not found`);
          return;
        }

        // Validate the status transition
        if (!isValidStatusTransition(currentUser.onboardingStatus, status)) {
          console.error(`Invalid status transition from ${currentUser.onboardingStatus} to ${status}`);
          return;
        }

        set((state) => {
          const updatedUsers = state.users.map((u) =>
            u.id === userId ? { ...u, onboardingStatus: status } : u
          );

          if (useAuthStore.getState().currentUser?.id === userId) {
            useAuthStore.getState().updateCurrentUser({ onboardingStatus: status });
          }

          return { users: updatedUsers };
        });

        const user = get().users.find((u) => u.id === userId);
        if (user && approver) {
          // Notify on key stage transitions
          if (status === OnboardingStatus.PENDING_ONBOARDING_CALL) {
            useNotificationsStore.getState().addNotification({
              userId: user.id,
              type: NotificationType.REQUEST_ACCEPTED,
              message: `Your application for ${user.chapters[0]} was approved by ${approver.name}! Next: schedule your onboarding call.`,
              linkTo: '/dashboard',
            });
          }
          if (status === OnboardingStatus.AWAITING_FIRST_CUBE) {
            useNotificationsStore.getState().addNotification({
              userId: user.id,
              type: NotificationType.REQUEST_ACCEPTED,
              message: `Great progress! Next: attend your first Cube with your chapter.`,
              linkTo: '/dashboard',
            });
          }
          if (status === OnboardingStatus.AWAITING_MASTERCLASS) {
            useNotificationsStore.getState().addNotification({
              userId: user.id,
              type: NotificationType.REQUEST_ACCEPTED,
              message: `Nice! You completed your first Cube. Next: complete the masterclass.`,
              linkTo: '/dashboard',
            });
          }
          if (status === OnboardingStatus.AWAITING_REVISION_CALL) {
            useNotificationsStore.getState().addNotification({
              userId: user.id,
              type: NotificationType.REQUEST_ACCEPTED,
              message: `Great! You completed the masterclass. Next: pass the revision call to get verified.`,
              linkTo: '/dashboard',
            });
          }
          if (status === OnboardingStatus.DENIED) {
            useNotificationsStore.getState().addNotification({
              userId: user.id,
              type: NotificationType.REQUEST_DENIED,
              message: `Your application for ${user.chapters[0]} was not approved at this time.`,
              linkTo: '/onboarding-status',
              relatedUser: approver,
            });
          }
        }
      },

      finalizeOnboarding: (userId) => {
        const currentUser = get().users.find((u) => u.id === userId);
        if (!currentUser) {
          console.error(`User ${userId} not found`);
          return;
        }

        // Validate that user can be finalized
        if (currentUser.onboardingStatus !== OnboardingStatus.AWAITING_REVISION_CALL) {
          console.warn(`User ${userId} cannot be finalized from status ${currentUser.onboardingStatus}`);
          return;
        }

        // Validate onboarding state
        const validation = validateOnboardingState(currentUser);
        if (!validation.isValid) {
          console.warn(`Cannot finalize user ${userId}: ${validation.issues.join(', ')}`);
          return;
        }

        set((state) => {
          let userToUpdate: User | undefined;
          const updatedUsers = state.users.map((u) => {
            if (u.id === userId) {
              userToUpdate = {
                ...u,
                onboardingStatus: OnboardingStatus.CONFIRMED,
                role: Role.ACTIVIST,
              };
              return userToUpdate;
            }
            return u;
          });

          if (userToUpdate) {
            // Update auth store if verifying current user
            if (useAuthStore.getState().currentUser?.id === userId) {
              useAuthStore.getState().updateCurrentUser(userToUpdate);
            }
            // Notify user of confirmation
            useNotificationsStore.getState().addNotification({
              userId: userToUpdate.id,
              type: NotificationType.REQUEST_ACCEPTED,
              message: `You're fully confirmed! Welcome aboard.`,
              linkTo: '/dashboard',
            });
          }

          return { users: updatedUsers };
        });
      },

      // Mark that the user has watched the masterclass. If they're already in
      // AWAITING_MASTERCLASS, advance them to AWAITING_REVISION_CALL immediately.
      confirmWatchedMasterclass: (userId: string) => {
        const currentUser = get().users.find((u) => u.id === userId);
        if (!currentUser) {
          console.error(`User ${userId} not found`);
          return;
        }

        // Only allow this if user is in appropriate status
        if (currentUser.onboardingStatus !== OnboardingStatus.AWAITING_MASTERCLASS) {
          console.warn(`User ${userId} cannot confirm masterclass in status ${currentUser.onboardingStatus}`);
          return;
        }

        set((state) => {
          const updatedUsers = state.users.map((u) => {
            if (u.id !== userId) return u;
            const progress = {
              ...(u.onboardingProgress || {}),
              watchedMasterclass: true,
            };

            const onboardingStatus = OnboardingStatus.AWAITING_REVISION_CALL;

            const updatedUser = { ...u, onboardingProgress: progress, onboardingStatus };

            if (useAuthStore.getState().currentUser?.id === userId) {
              useAuthStore.getState().updateCurrentUser({ onboardingProgress: progress, onboardingStatus });
            }
            return updatedUser;
          });
          return { users: updatedUsers };
        });

        // Add notification
        useNotificationsStore.getState().addNotification({
          userId: userId,
          type: NotificationType.REQUEST_ACCEPTED,
          message: `Great! You completed the masterclass. Next: pass the revision call to get verified.`,
          linkTo: '/dashboard',
        });
      },

      // Validate a user's onboarding state
      validateUserOnboarding: (userId: string) => {
        const user = get().users.find((u) => u.id === userId);
        if (!user) {
          return { isValid: false, issues: ['User not found'] };
        }
        return validateOnboardingState(user);
      },

      // Auto-advance user when they meet requirements for next status
      autoAdvanceOnboarding: (userId: string) => {
        const currentUser = get().users.find((u) => u.id === userId);
        if (!currentUser) {
          console.error(`User ${userId} not found`);
          return;
        }

        let newStatus: OnboardingStatus | null = null;

        // Check if user can advance from AWAITING_FIRST_CUBE
        if (currentUser.onboardingStatus === OnboardingStatus.AWAITING_FIRST_CUBE &&
          currentUser.stats.cubesAttended > 0) {
          if (currentUser.onboardingProgress?.watchedMasterclass) {
            newStatus = OnboardingStatus.AWAITING_REVISION_CALL;
          } else {
            newStatus = OnboardingStatus.AWAITING_MASTERCLASS;
          }
        }

        // Check if user can advance from AWAITING_REVISION_CALL
        if (currentUser.onboardingStatus === OnboardingStatus.AWAITING_REVISION_CALL &&
          currentUser.onboardingProgress?.revisionCallScheduledAt) {
          newStatus = OnboardingStatus.CONFIRMED;
        }

        if (newStatus && newStatus !== currentUser.onboardingStatus) {
          // Use updateUserStatus to ensure proper validation and notifications
          get().updateUserStatus(userId, newStatus);
        }
      },

      // Fix common onboarding issues across all users
      fixOnboardingIssues: () => {
        const users = get().users;
        let fixedCount = 0;

        users.forEach((user) => {
          const validation = validateOnboardingState(user);
          if (!validation.isValid) {
            console.warn(`User ${user.name} has onboarding issues: ${validation.issues.join(', ')}`);

            // Try to auto-advance the user
            get().autoAdvanceOnboarding(user.id);
            fixedCount++;
          }
        });

        if (fixedCount > 0) {
          console.log(`Fixed onboarding issues for ${fixedCount} users`);
        }
      },

      // Schedule a revision call with selected organiser and time
      scheduleRevisionCall: (userId: string, organiserId: string, when: Date) => {
        const currentUser = get().users.find((u) => u.id === userId);
        const organiser = get().users.find((u) => u.id === organiserId);
        
        if (!currentUser) {
          console.error(`User ${userId} not found`);
          return;
        }
        if (!organiser) {
          console.error(`Organiser ${organiserId} not found`);
          return;
        }

        // Only allow this if user is in appropriate status
        if (currentUser.onboardingStatus !== OnboardingStatus.AWAITING_REVISION_CALL) {
          console.warn(`User ${userId} cannot schedule revision call in status ${currentUser.onboardingStatus}`);
          return;
        }

        set((state) => {
          const updatedUsers = state.users.map((u) => {
            if (u.id !== userId) return u;
            const progress = {
              ...(u.onboardingProgress || {}),
              selectedOrganiserId: organiserId,
              revisionCallScheduledAt: when,
            };
            const updatedUser = { ...u, onboardingProgress: progress };
            if (useAuthStore.getState().currentUser?.id === userId) {
              useAuthStore.getState().updateCurrentUser({ onboardingProgress: progress });
            }
            return updatedUser;
          });
          return { users: updatedUsers };
        });

        // Add notification
        useNotificationsStore.getState().addNotification({
          userId: userId,
          type: NotificationType.REQUEST_ACCEPTED,
          message: `Revision call scheduled! Please attend the call to complete your onboarding.`,
          linkTo: '/dashboard',
        });

        // **FIX: Notify the selected organizer**
        useNotificationsStore.getState().addNotification({
          userId: organiserId,
          type: NotificationType.EVENT_UPDATED, // Re-using a relevant type
          message: `${currentUser.name} has scheduled a revision call with you for ${when.toLocaleString()}.`,
          linkTo: `/manage/member/${userId}`,
          relatedUser: currentUser,
        });
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
        set((state) => {
          const updatedUsers = state.users.map((u) =>
            u.id === userId ? { ...u, organiserOf: newOrganiserOf } : u
          );
          if (useAuthStore.getState().currentUser?.id === userId) {
            useAuthStore.getState().updateCurrentUser({ organiserOf: newOrganiserOf });
          }
          return { users: updatedUsers };
        }),

      updateProfile: (userId, updatedData) => {
        set((state) => {
          const fullUpdate = {
            ...updatedData,
            instagram: updatedData.instagram || undefined,
          } as Partial<User>;
          const updatedUsers = state.users.map((u) =>
            u.id === userId ? { ...u, ...fullUpdate } : u
          );

          if (useAuthStore.getState().currentUser?.id === userId) {
            useAuthStore.getState().updateCurrentUser(fullUpdate);
          }

          return { users: updatedUsers };
        });
      },

      deleteUser: (userIdToDelete: string): Promise<void> => {
        return new Promise((resolve) => {
          setTimeout(() => {
            const userToDelete = get().users.find((u) => u.id === userIdToDelete);
            if (!userToDelete) {
              console.error('User to delete not found');
              return resolve();
            }

            // If the deleted user is the current user, log them out
            if (useAuthStore.getState().currentUser?.id === userIdToDelete) {
              useAuthStore.getState().logout();
            }

            // If the user is a chapter organizer, handle chapter re-assignment
            if (userToDelete.role === Role.CHAPTER_ORGANISER && userToDelete.organiserOf && userToDelete.organiserOf.length > 0) {
              const chaptersToReassign = userToDelete.organiserOf;
              chaptersToReassign.forEach(chapterName => {
                // Find another organizer for this chapter
                const otherOrganiser = get().users.find(u =>
                  u.id !== userIdToDelete &&
                  u.role === Role.CHAPTER_ORGANISER &&
                  u.organiserOf?.includes(chapterName)
                );

                if (!otherOrganiser) {
                  // If no other organizer, find a global organizer or admin
                  const fallbackOrganiser = get().users.find(u => u.role === Role.REGIONAL_ORGANISER || u.role === Role.GLOBAL_ADMIN);
                  if (fallbackOrganiser) {
                    // This is a simplified reassignment. A real app might have more complex logic.
                    get().updateUserOrganiserOf(fallbackOrganiser.id, [...(fallbackOrganiser.organiserOf || []), chapterName]);
                    // Also promote them to Chapter Organiser if they aren't already one
                    if (fallbackOrganiser.role !== Role.CHAPTER_ORGANISER) {
                      get().updateUserRole(fallbackOrganiser.id, Role.CHAPTER_ORGANISER);
                    }
                    console.log(`Chapter ${chapterName} has been reassigned to ${fallbackOrganiser.name}.`);
                  } else {
                    console.warn(`No fallback organizer found for chapter ${chapterName}.`);
                  }
                }
              });
            }

            set((state) => ({
              users: state.users.filter((u) => u.id !== userIdToDelete),
            }));
            resolve();
          }, 500); // Simulate network delay for mock API
        });
      },

      addOrganizerNote: (targetUserId: string, noteContent: string, author: User) => {
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
        set((state) => {
          const updatedUsers = state.users.map((user) => {
            const update = updates.find((u) => u.userId === user.id);
            if (!update) return user;

            const prevCubes = user.stats?.cubesAttended ?? 0;
            const newStats = { ...user.stats, ...update.newStats };

            let onboardingStatus = user.onboardingStatus;
            // Auto-transition: first Cube attended
            if (
              user.onboardingStatus === OnboardingStatus.AWAITING_FIRST_CUBE &&
              prevCubes === 0 &&
              (newStats.cubesAttended ?? 0) >= 1
            ) {
              const watched = user.onboardingProgress?.watchedMasterclass === true;
              if (watched) {
                onboardingStatus = OnboardingStatus.AWAITING_REVISION_CALL;
                useNotificationsStore.getState().addNotification({
                  userId: user.id,
                  type: NotificationType.REQUEST_ACCEPTED,
                  message: `Nice! You completed your first Cube and already watched the masterclass. Next: schedule your revision call.`,
                  linkTo: '/dashboard',
                });
              } else {
                onboardingStatus = OnboardingStatus.AWAITING_MASTERCLASS;
                useNotificationsStore.getState().addNotification({
                  userId: user.id,
                  type: NotificationType.REQUEST_ACCEPTED,
                  message: `Nice! You completed your first Cube. Next: complete the masterclass.`,
                  linkTo: '/dashboard',
                });
              }
            }

            const updatedUser = {
              ...user,
              stats: newStats,
              onboardingStatus,
            };

            // Keep auth store in sync if this is the current user
            if (useAuthStore.getState().currentUser?.id === user.id) {
              useAuthStore.getState().updateCurrentUser({ stats: newStats, onboardingStatus });
            }

            return updatedUser;
          });
          return { users: updatedUsers };
        });
      },

      resetToInitialData: () => {
        set({ users: processedUsers });
      },

      clearPersistedData: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('users-store');
        }
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

export const useUsersState = () => useUsersStore((s) => {
  // Ensure users are available
  return s.users && s.users.length > 0 ? s.users : s.getUsers();
});
export const useUsersActions = () =>
  useUsersStore((s) => ({
    register: s.register,
    updateUserStatus: s.updateUserStatus,
    finalizeOnboarding: s.finalizeOnboarding,
    confirmWatchedMasterclass: s.confirmWatchedMasterclass,
    validateUserOnboarding: s.validateUserOnboarding,
    autoAdvanceOnboarding: s.autoAdvanceOnboarding,
    fixOnboardingIssues: s.fixOnboardingIssues,
    scheduleRevisionCall: s.scheduleRevisionCall,
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
    clearPersistedData: s.clearPersistedData,
    init: s.init
  }));

// Selectors
export const useUserById = (userId?: string) => {
  const user = useUsersStore((s) => {
    // Ensure users are available
    const users = s.users && s.users.length > 0 ? s.users : s.getUsers();

    return users.find((u) => u.id === userId);
  });
  return user;
};


