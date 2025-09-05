import { create } from 'zustand';
import React from 'react';
import { persist, subscribeWithSelector } from 'zustand/middleware';

import { ROLE_HIERARCHY } from '@/constants';
import {
  createNewUser,
  determineNextStatusAfterFirstCube,
  finalizeOnboarding as finalizeOnboardingService,
  handleNewApplicationNotifications,
  isValidStatusTransition,
  validateOnboardingState,
} from '@/services/onboardingService';
import {
  NotificationType,
  OnboardingStatus,
  type OrganizerNote,
  Role,
  type User,
} from '@/types';
import { type OnboardingAnswers } from '@/types';

import { useAuthStore } from './auth.store';
import { processedUsers } from './initialData';
import { useNotificationsStore } from './notifications.store';

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
  scheduleOnboardingCall: (
    userId: string,
    organiserId: string,
    when: Date,
    contactInfo: string
  ) => void;
  confirmWatchedMasterclass: (userId: string) => void;
  scheduleRevisionCall: (
    userId: string,
    organiserId: string,
    when: Date,
    contactInfo: string
  ) => void;
  deleteUser: (userIdToDelete: string) => Promise<void>;
  addOrganizerNote: (
    targetUserId: string,
    noteContent: string,
    author: User
  ) => void;
  editOrganizerNote: (
    targetUserId: string,
    noteId: string,
    newContent: string
  ) => void;
  deleteOrganizerNote: (targetUserId: string, noteId: string) => void;
  batchUpdateUserStats: (
    updates: { userId: string; newStats: Partial<User['stats']> }[]
  ) => void;
  confirmFirstCubeAttended: (userId: string) => void;
  validateUserOnboarding: (userId: string) => {
    isValid: boolean;
    issues: string[];
  };
  autoAdvanceOnboarding: (userId: string) => void;
  fixOnboardingIssues: () => void;
  resetToInitialData: () => void;
  clearPersistedData: () => void;
  init: () => void;
  advanceOnboardingAfterEvent: (userId: string) => void;
}

export const useUsersStore = create<UsersState & UsersActions>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        users: processedUsers,

        init: () => {},

        register: (formData) => {
          const newUser = createNewUser(formData);
          set((state) => ({ users: [...state.users, newUser] }));
          handleNewApplicationNotifications(newUser, get().users);
        },

        updateUserStatus: (userId, status, approver) => {
          const currentUser = get().users.find((u) => u.id === userId);
          if (!currentUser) {
            console.error(`User ${userId} not found`);
            return;
          }

          if (!isValidStatusTransition(currentUser.onboardingStatus, status)) {
            console.error(
              `Invalid status transition from ${currentUser.onboardingStatus} to ${status}`
            );
            return;
          }

          set((state) => {
            const updatedUsers = state.users.map((u) =>
              u.id === userId ? { ...u, onboardingStatus: status } : u
            );

            if (useAuthStore.getState().currentUser?.id === userId) {
              useAuthStore
                .getState()
                .updateCurrentUser({ onboardingStatus: status });
            }

            return { users: updatedUsers };
          });

          const user = get().users.find((u) => u.id === userId);
          if (user && approver) {
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

          const result = finalizeOnboardingService(currentUser);
          if (!result.success) {
            console.warn(
              `User ${userId} cannot be finalized: ${result.issues.join(', ')}`
            );
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
              if (useAuthStore.getState().currentUser?.id === userId) {
                useAuthStore.getState().updateCurrentUser(userToUpdate);
              }
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

        confirmWatchedMasterclass: (userId: string) => {
          const currentUser = get().users.find((u) => u.id === userId);
          if (!currentUser) {
            console.error(`User ${userId} not found`);
            return;
          }

          if (
            currentUser.onboardingStatus !==
              OnboardingStatus.AWAITING_FIRST_CUBE &&
            currentUser.onboardingStatus !==
              OnboardingStatus.AWAITING_MASTERCLASS
          ) {
            console.warn(
              `User ${userId} cannot confirm masterclass in status ${currentUser.onboardingStatus}`
            );
            return;
          }

          set((state) => {
            const updatedUsers = state.users.map((u) => {
              if (u.id !== userId) return u;
              const progress = {
                ...(u.onboardingProgress || {}),
                watchedMasterclass: true,
              };

              const onboardingStatus = determineNextStatusAfterFirstCube(u);

              const updatedUser = {
                ...u,
                onboardingProgress: progress,
                onboardingStatus,
              };

              if (useAuthStore.getState().currentUser?.id === userId) {
                useAuthStore.getState().updateCurrentUser({
                  onboardingProgress: progress,
                  onboardingStatus,
                });
              }
              return updatedUser;
            });
            return { users: updatedUsers };
          });

          useNotificationsStore.getState().addNotification({
            userId: userId,
            type: NotificationType.REQUEST_ACCEPTED,
            message: `Great! You completed the masterclass. Next: schedule your revision call to get verified.`,
            linkTo: '/dashboard',
          });
        },
        validateUserOnboarding: (userId: string) => {
          const user = get().users.find((u) => u.id === userId);
          if (!user) {
            return { isValid: false, issues: ['User not found'] };
          }
          return validateOnboardingState(user);
        },

        autoAdvanceOnboarding: (userId: string) => {
          const currentUser = get().users.find((u) => u.id === userId);
          if (!currentUser) {
            console.error(`User ${userId} not found`);
            return;
          }

          let newStatus: OnboardingStatus | null = null;

          if (
            currentUser.onboardingStatus ===
              OnboardingStatus.AWAITING_FIRST_CUBE &&
            currentUser.stats.cubesAttended > 0
          ) {
            if (currentUser.onboardingProgress?.watchedMasterclass) {
              newStatus = OnboardingStatus.AWAITING_REVISION_CALL;
            } else {
              newStatus = OnboardingStatus.AWAITING_MASTERCLASS;
            }
          }

          if (
            currentUser.onboardingStatus ===
              OnboardingStatus.AWAITING_REVISION_CALL &&
            currentUser.onboardingProgress?.revisionCallScheduledAt
          ) {
            newStatus = OnboardingStatus.CONFIRMED;
          }

          if (newStatus && newStatus !== currentUser.onboardingStatus) {
            get().updateUserStatus(userId, newStatus);
          }
        },

        fixOnboardingIssues: () => {
          const users = get().users;

          users.forEach((user) => {
            const validation = validateOnboardingState(user);
            if (!validation.isValid) {
              console.warn(
                `User ${user.name} has onboarding issues: ${validation.issues.join(', ')}`
              );

              get().autoAdvanceOnboarding(user.id);
            }
          });
        },

        scheduleRevisionCall: (
          userId: string,
          organiserId: string,
          when: Date,
          contactInfo: string
        ) => {
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

          if (
            currentUser.onboardingStatus !==
            OnboardingStatus.AWAITING_REVISION_CALL
          ) {
            console.warn(
              `User ${userId} cannot schedule revision call in status ${currentUser.onboardingStatus}`
            );
            return;
          }

          set((state) => {
            const updatedUsers = state.users.map((u) => {
              if (u.id !== userId) return u;
              const progress = {
                ...(u.onboardingProgress || {}),
                selectedOrganiserId: organiserId,
                revisionCallScheduledAt: when,
                revisionCallContactInfo: contactInfo,
              };
              const updatedUser = { ...u, onboardingProgress: progress };
              if (useAuthStore.getState().currentUser?.id === userId) {
                useAuthStore
                  .getState()
                  .updateCurrentUser({ onboardingProgress: progress });
              }
              return updatedUser;
            });
            return { users: updatedUsers };
          });

          useNotificationsStore.getState().addNotification({
            userId: userId,
            type: NotificationType.REQUEST_ACCEPTED,
            message: `Revision call scheduled! Please attend the call to complete your onboarding.`,
            linkTo: '/dashboard',
          });

          useNotificationsStore.getState().addNotification({
            userId: organiserId,
            type: NotificationType.EVENT_UPDATED,
            message: `${currentUser.name} scheduled a revision call for ${when.toLocaleString()}. Contact: ${contactInfo}`,
            linkTo: `/manage/member/${userId}`,
            relatedUser: currentUser,
          });
        },

        scheduleOnboardingCall: (userId, organiserId, when, contactInfo) => {
          const currentUser = get().users.find((u) => u.id === userId);
          const organiser = get().users.find((u) => u.id === organiserId);
          if (
            !currentUser ||
            !organiser ||
            currentUser.onboardingStatus !==
              OnboardingStatus.PENDING_ONBOARDING_CALL
          ) {
            return;
          }

          set((state) => {
            const updatedUsers = state.users.map((u) => {
              if (u.id !== userId) return u;
              const progress = {
                ...(u.onboardingProgress || {}),
                selectedOrganiserId: organiserId,
                onboardingCallScheduledAt: when,
                onboardingCallContactInfo: contactInfo,
              };
              const updatedUser = { ...u, onboardingProgress: progress };
              if (useAuthStore.getState().currentUser?.id === userId) {
                useAuthStore
                  .getState()
                  .updateCurrentUser({ onboardingProgress: progress });
              }
              return updatedUser;
            });
            return { users: updatedUsers };
          });

          useNotificationsStore.getState().addNotification({
            userId: userId,
            type: NotificationType.REQUEST_ACCEPTED,
            message: `Onboarding call scheduled! Please attend to continue your onboarding.`,
            linkTo: '/dashboard',
          });

          useNotificationsStore.getState().addNotification({
            userId: organiserId,
            type: NotificationType.EVENT_UPDATED,
            message: `${currentUser.name} scheduled an onboarding call for ${when.toLocaleString()}. Contact: ${contactInfo}`,
            linkTo: `/manage/member/${userId}`,
            relatedUser: currentUser,
          });
        },

        confirmFirstCubeAttended: (userId: string) => {
          const currentUser = get().users.find((u) => u.id === userId);
          if (
            !currentUser ||
            currentUser.onboardingStatus !==
              OnboardingStatus.AWAITING_FIRST_CUBE
          ) {
            return;
          }

          set((state) => {
            const watchedMasterclass =
              currentUser.onboardingProgress?.watchedMasterclass;
            const nextStatus = watchedMasterclass
              ? OnboardingStatus.AWAITING_REVISION_CALL
              : OnboardingStatus.AWAITING_MASTERCLASS;

            const updatedUsers = state.users.map((u) =>
              u.id === userId ? { ...u, onboardingStatus: nextStatus } : u
            );

            if (useAuthStore.getState().currentUser?.id === userId) {
              useAuthStore
                .getState()
                .updateCurrentUser({ onboardingStatus: nextStatus });
            }

            const message = watchedMasterclass
              ? `Great! Your first Cube attendance is confirmed. Next: schedule your revision call.`
              : `Nice! You completed your first Cube. Next: complete the masterclass.`;

            useNotificationsStore.getState().addNotification({
              userId: userId,
              type: NotificationType.REQUEST_ACCEPTED,
              message,
              linkTo: '/dashboard',
            });

            return { users: updatedUsers };
          });
        },

        updateUserRole: (userId, role) => {
          set((state) => ({
            users: state.users.map((u) => {
              if (u.id !== userId) return u;
              const changes: Partial<User> = { role };
              if (ROLE_HIERARCHY[role] < ROLE_HIERARCHY[Role.CHAPTER_ORGANISER])
                changes.organiserOf = [];

              const updatedUser = { ...u, ...changes };

              if (useAuthStore.getState().currentUser?.id === updatedUser.id) {
                useAuthStore.getState().updateCurrentUser(updatedUser);
              }

              return updatedUser;
            }),
          }));

          const currentUser = useAuthStore.getState().currentUser;
          const user = get().users.find((u) => u.id === userId);
          if (currentUser && user) {
            useNotificationsStore.getState().addNotification({
              userId: userId,
              type: NotificationType.ROLE_UPDATED,
              message: `Your role has been updated to ${role} by ${currentUser.name}.`,
              linkTo: `/members/${userId}`,
              relatedUser: currentUser,
            });
          }
        },

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

        updateUserChapters: (userId, newChapters) => {
          const userBeforeUpdate = get().users.find((u) => u.id === userId);
          set((state) => {
            const updatedUsers = state.users.map((u) =>
              u.id === userId ? { ...u, chapters: newChapters } : u
            );
            if (useAuthStore.getState().currentUser?.id === userId) {
              useAuthStore
                .getState()
                .updateCurrentUser({ chapters: newChapters });
            }
            return { users: updatedUsers };
          });

          if (userBeforeUpdate) {
            const oldChapters = new Set(userBeforeUpdate.chapters);
            const addedChapters = newChapters.filter(
              (ch) => !oldChapters.has(ch)
            );
            const removedChapters = userBeforeUpdate.chapters.filter(
              (ch) => !newChapters.includes(ch)
            );

            let message = 'Your chapter memberships have been updated.';
            if (addedChapters.length > 0) {
              message = `You have been added to the ${addedChapters.join(', ')} chapter(s).`;
            } else if (removedChapters.length > 0) {
              message = `You have been removed from the ${removedChapters.join(', ')} chapter(s).`;
            }

            const currentUser = useAuthStore.getState().currentUser;
            if (
              currentUser &&
              (addedChapters.length > 0 || removedChapters.length > 0)
            ) {
              useNotificationsStore.getState().addNotification({
                userId: userId,
                type: NotificationType.CHAPTER_MEMBERSHIP_UPDATED,
                message: message,
                linkTo: `/members/${userId}`,
                relatedUser: currentUser,
              });
            }
          }
        },

        updateUserOrganiserOf: (userId, newOrganiserOf) =>
          set((state) => {
            const updatedUsers = state.users.map((u) =>
              u.id === userId ? { ...u, organiserOf: newOrganiserOf } : u
            );
            if (useAuthStore.getState().currentUser?.id === userId) {
              useAuthStore
                .getState()
                .updateCurrentUser({ organiserOf: newOrganiserOf });
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
              const userToDelete = get().users.find(
                (u) => u.id === userIdToDelete
              );
              if (!userToDelete) {
                console.error('User to delete not found');
                return resolve();
              }

              if (useAuthStore.getState().currentUser?.id === userIdToDelete) {
                useAuthStore.getState().logout();
              }

              if (
                userToDelete.role === Role.CHAPTER_ORGANISER &&
                userToDelete.organiserOf &&
                userToDelete.organiserOf.length > 0
              ) {
                const chaptersToReassign = userToDelete.organiserOf;
                chaptersToReassign.forEach((chapterName) => {
                  const otherOrganiser = get().users.find(
                    (u) =>
                      u.id !== userIdToDelete &&
                      u.role === Role.CHAPTER_ORGANISER &&
                      u.organiserOf?.includes(chapterName)
                  );

                  if (!otherOrganiser) {
                    const fallbackOrganiser = get().users.find(
                      (u) =>
                        u.role === Role.REGIONAL_ORGANISER ||
                        u.role === Role.GLOBAL_ADMIN
                    );
                    if (fallbackOrganiser) {
                      get().updateUserOrganiserOf(fallbackOrganiser.id, [
                        ...(fallbackOrganiser.organiserOf || []),
                        chapterName,
                      ]);
                      if (fallbackOrganiser.role !== Role.CHAPTER_ORGANISER) {
                        get().updateUserRole(
                          fallbackOrganiser.id,
                          Role.CHAPTER_ORGANISER
                        );
                      }
                    } else {
                      console.warn(
                        `No fallback organizer found for chapter ${chapterName}.`
                      );
                    }
                  }
                });
              }

              set((state) => ({
                users: state.users.filter((u) => u.id !== userIdToDelete),
              }));
              resolve();
            }, 500);
          });
        },

        addOrganizerNote: (
          targetUserId: string,
          noteContent: string,
          author: User
        ) => {
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
                ? {
                    ...u,
                    organizerNotes: [...(u.organizerNotes || []), newNote],
                  }
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
              const updatedNotes = u.organizerNotes?.filter(
                (n) => n.id !== noteId
              );
              return { ...u, organizerNotes: updatedNotes };
            }),
          }));
        },
        batchUpdateUserStats: (updates) => {
          set((state) => {
            const updatedUsers = state.users.map((user) => {
              const update = updates.find((u) => u.userId === user.id);
              if (!update) return user;

              const newStats = { ...user.stats, ...update.newStats };

              const updatedUser = {
                ...user,
                stats: newStats,
              };

              if (useAuthStore.getState().currentUser?.id === user.id) {
                useAuthStore.getState().updateCurrentUser({ stats: newStats });
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

        advanceOnboardingAfterEvent: (userId: string) => {
          set((state) => {
            const user = state.users.find((u) => u.id === userId);
            if (!user) return state;

            const prevCubes = user.stats?.cubesAttended ?? 0;
            const newCubes = prevCubes + 1;

            if (prevCubes === 0 && newCubes === 1) {
              const watched =
                user.onboardingProgress?.watchedMasterclass === true;
              let newOnboardingStatus = user.onboardingStatus;

              if (watched) {
                newOnboardingStatus = OnboardingStatus.AWAITING_REVISION_CALL;
                useNotificationsStore.getState().addNotification({
                  userId: user.id,
                  type: NotificationType.REQUEST_ACCEPTED,
                  message: `Nice! You completed your first Cube and already watched the masterclass. Next: schedule your revision call.`,
                  linkTo: '/dashboard',
                });
              } else {
                newOnboardingStatus = OnboardingStatus.AWAITING_MASTERCLASS;
                useNotificationsStore.getState().addNotification({
                  userId: user.id,
                  type: NotificationType.REQUEST_ACCEPTED,
                  message: `Nice! You completed your first Cube. Next: complete the masterclass.`,
                  linkTo: '/dashboard',
                });
              }

              const updatedUser = {
                ...user,
                stats: { ...user.stats, cubesAttended: newCubes },
                onboardingStatus: newOnboardingStatus,
              };

              if (useAuthStore.getState().currentUser?.id === user.id) {
                useAuthStore.getState().updateCurrentUser({
                  stats: updatedUser.stats,
                  onboardingStatus: newOnboardingStatus,
                });
              }

              return {
                users: state.users.map((u) =>
                  u.id === userId ? updatedUser : u
                ),
              };
            }

            return state;
          });
        },
      }),
      {
        name: 'users-store',
      }
    )
  )
);

export const useUsersState = () => useUsersStore((s) => s.users);

export const useUsersActions = () => {
  const register = useUsersStore((s) => s.register);
  const updateUserStatus = useUsersStore((s) => s.updateUserStatus);
  const finalizeOnboarding = useUsersStore((s) => s.finalizeOnboarding);
  const confirmWatchedMasterclass = useUsersStore(
    (s) => s.confirmWatchedMasterclass
  );
  const confirmFirstCubeAttended = useUsersStore(
    (s) => s.confirmFirstCubeAttended
  );
  const validateUserOnboarding = useUsersStore((s) => s.validateUserOnboarding);
  const autoAdvanceOnboarding = useUsersStore((s) => s.autoAdvanceOnboarding);
  const fixOnboardingIssues = useUsersStore((s) => s.fixOnboardingIssues);
  const scheduleOnboardingCall = useUsersStore((s) => s.scheduleOnboardingCall);
  const scheduleRevisionCall = useUsersStore((s) => s.scheduleRevisionCall);
  const updateUserRole = useUsersStore((s) => s.updateUserRole);
  const setChapterOrganiser = useUsersStore((s) => s.setChapterOrganiser);
  const updateUserChapters = useUsersStore((s) => s.updateUserChapters);
  const updateUserOrganiserOf = useUsersStore((s) => s.updateUserOrganiserOf);
  const updateProfile = useUsersStore((s) => s.updateProfile);
  const deleteUser = useUsersStore((s) => s.deleteUser);
  const addOrganizerNote = useUsersStore((s) => s.addOrganizerNote);
  const editOrganizerNote = useUsersStore((s) => s.editOrganizerNote);
  const deleteOrganizerNote = useUsersStore((s) => s.deleteOrganizerNote);
  const batchUpdateUserStats = useUsersStore((s) => s.batchUpdateUserStats);
  const resetToInitialData = useUsersStore((s) => s.resetToInitialData);
  const clearPersistedData = useUsersStore((s) => s.clearPersistedData);
  const init = useUsersStore((s) => s.init);
  const advanceOnboardingAfterEvent = useUsersStore(
    (s) => s.advanceOnboardingAfterEvent
  );

  return React.useMemo(
    () => ({
      register,
      updateUserStatus,
      finalizeOnboarding,
      confirmWatchedMasterclass,
      confirmFirstCubeAttended,
      validateUserOnboarding,
      autoAdvanceOnboarding,
      fixOnboardingIssues,
      scheduleOnboardingCall,
      scheduleRevisionCall,
      updateUserRole,
      setChapterOrganiser,
      updateUserChapters,
      updateUserOrganiserOf,
      updateProfile,
      deleteUser,
      addOrganizerNote,
      editOrganizerNote,
      deleteOrganizerNote,
      batchUpdateUserStats,
      resetToInitialData,
      clearPersistedData,
      init,
      advanceOnboardingAfterEvent,
    }),
    [
      register,
      updateUserStatus,
      finalizeOnboarding,
      confirmWatchedMasterclass,
      confirmFirstCubeAttended,
      validateUserOnboarding,
      autoAdvanceOnboarding,
      fixOnboardingIssues,
      scheduleOnboardingCall,
      scheduleRevisionCall,
      updateUserRole,
      setChapterOrganiser,
      updateUserChapters,
      updateUserOrganiserOf,
      updateProfile,
      deleteUser,
      addOrganizerNote,
      editOrganizerNote,
      deleteOrganizerNote,
      batchUpdateUserStats,
      resetToInitialData,
      clearPersistedData,
      init,
      advanceOnboardingAfterEvent,
    ]
  );
};

export const useUserById = (userId?: string) => {
  return useUsersStore((s) => {
    if (!userId) return undefined;
    return s.users.find((user) => user.id === userId);
  });
};
