import { create } from 'zustand';
import { toast } from 'sonner';

import {
  User,
  CubeEvent,
  Chapter,
  Announcement,
  Resource,
  AccommodationRequest,
  OutreachLog,
  EventComment,
  Challenge,
  Role,
  OnboardingStatus,
  OnboardingAnswers,
  EventRole,
  EventStatus,
  EventReport,
  AnnouncementScope,
  Notification,
  NotificationType,
  OutreachOutcome,
  OrganizerNote,
  TourDuty,
  ParticipantStatus,
  ChapterJoinRequest,
  BadgeAward,
  BadgeTemplate,
  EarnedBadge,
} from '@/types';
import {
  MOCK_USERS,
  MOCK_CUBE_EVENTS,
  MOCK_CHAPTERS,
  MOCK_ANNOUNCEMENTS,
  MOCK_RESOURCES,
  MOCK_ACCOMMODATION_REQUESTS,
  MOCK_OUTREACH_LOGS,
  MOCK_EVENT_COMMENTS,
  MOCK_CHALLENGES,
  MOCK_NOTIFICATIONS,
  MOCK_BADGE_AWARDS,
} from '@/mockData'; // This assumes you have an index file or have renamed mockData.ts to constants.ts
import { ROLE_HIERARCHY } from '@/utils/auth';
import { useAuthStore } from './auth.store';
import nacl from 'tweetnacl';
import naclUtil from 'tweetnacl-util';

// --- DATA PRE-PROCESSING ---
const processedUsers: User[] = MOCK_USERS.map((user: any) => ({
  ...user,
  joinDate: user.joinDate ? new Date(user.joinDate) : undefined,
  organizerNotes: user.organizerNotes?.map((note: any) => ({
    ...note,
    createdAt: new Date(note.createdAt),
  })),
  badges: user.badges?.map((badge: any) => ({
    ...badge,
    awardedAt: new Date(badge.awardedAt),
  })),
}));

const processedEvents: CubeEvent[] = MOCK_CUBE_EVENTS.map((event: any) => ({
  ...event,
  startDate: new Date(event.startDate),
  endDate: event.endDate ? new Date(event.endDate) : undefined,
  participants: event.participants.map((p: any) => ({
    ...p,
    status: p.status || ParticipantStatus.ATTENDING,
  })),
}));

const processedAnnouncements: Announcement[] = MOCK_ANNOUNCEMENTS.map(
  (ann: any) => ({
    ...ann,
    createdAt: new Date(ann.createdAt),
  })
);

const processedAccommodationRequests: AccommodationRequest[] =
  MOCK_ACCOMMODATION_REQUESTS.map((req: any) => ({
    ...req,
    startDate: new Date(req.startDate),
    endDate: new Date(req.endDate),
    createdAt: new Date(req.createdAt),
    event: {
      ...req.event,
      startDate: new Date(req.event.startDate),
    },
  }));

const processedOutreachLogs: OutreachLog[] = MOCK_OUTREACH_LOGS.map(
  (log: any) => ({
    ...log,
    createdAt: new Date(log.createdAt),
  })
);

const processedEventComments: EventComment[] = MOCK_EVENT_COMMENTS.map(
  (comment: any) => ({
    ...comment,
    createdAt: new Date(comment.createdAt),
  })
);

const processedChallenges: Challenge[] = MOCK_CHALLENGES.map(
  (challenge: any) => ({
    ...challenge,
    endDate: new Date(challenge.endDate),
  })
);

const processedNotifications: Notification[] = MOCK_NOTIFICATIONS.map(
  (n: any) => ({
    ...n,
    createdAt: new Date(n.createdAt),
  })
);

const processedBadgeAwards: BadgeAward[] = MOCK_BADGE_AWARDS.map(
  (award: any) => ({
    ...award,
    createdAt: new Date(award.createdAt),
  })
);

// --- STATE AND ACTIONS INTERFACE ---
export interface AppState {
  // State
  users: User[];
  events: CubeEvent[];
  chapters: Chapter[];
  announcements: Announcement[];
  resources: Resource[];
  accommodationRequests: AccommodationRequest[];
  outreachLogs: OutreachLog[];
  eventComments: EventComment[];
  challenges: Challenge[];
  notifications: Notification[];
  chapterJoinRequests: ChapterJoinRequest[];
  badgeAwards: BadgeAward[];

  // Selectors
  getLogsForEvent: (eventId: string) => OutreachLog[];

  // Actions
  register: (formData: {
    name: string;
    instagram: string;
    chapter: string;
    answers: OnboardingAnswers;
  }) => void;
  updateUserStatus: (
    userId: string,
    status: OnboardingStatus,
    approver?: User
  ) => void;
  completeOnboardingCall: (userId: string) => void;
  confirmUserIdentity: (userId: string) => void;
  createEvent: (
    eventData: Omit<
      CubeEvent,
      'id' | 'organizer' | 'participants' | 'status' | 'report'
    >,
    organizer: User
  ) => void;
  updateEvent: (
    eventId: string,
    updateData: Partial<
      Pick<CubeEvent, 'city' | 'location' | 'startDate' | 'endDate'>
    >,
    currentUser: User
  ) => void;
  cancelEvent: (eventId: string, reason: string, currentUser: User) => void;
  rsvp: (
    eventId: string,
    currentUser: User,
    isGuest: boolean,
    duties?: TourDuty[]
  ) => void;
  approveRsvp: (eventId: string, guestId: string, currentUser: User) => void;
  denyRsvp: (eventId: string, guestId: string, currentUser: User) => void;
  cancelRsvp: (eventId: string, currentUser: User) => void;
  logEventReport: (eventId: string, report: EventReport) => void;
  updateUserRole: (userId: string, role: Role) => void;
  setChapterOrganiser: (userId: string, chaptersToOrganise: string[]) => void;
  updateUserChapters: (userId: string, newChapters: string[]) => void;
  updateProfile: (
    userId: string,
    updatedData: Partial<
      Pick<
        User,
        | 'name'
        | 'instagram'
        | 'hostingAvailability'
        | 'hostingCapacity'
        | 'profilePictureUrl' // Add this
      >
    >
  ) => void;
  deleteUser: (userIdToDelete: string) => void;
  addOrganizerNote: (
    targetUserId: string,
    noteContent: string,
    author: User
  ) => void;
  editOrganizerNote: (
    // Add this new action
    targetUserId: string,
    noteId: string,
    newContent: string
  ) => void;
  deleteOrganizerNote: (targetUserId: string, noteId: string) => void;
  createChapter: (newChapterData: Chapter) => void;
  updateChapter: (chapterName: string, updatedData: Partial<Chapter>) => void;
  deleteChapter: (chapterName: string) => void;
  requestToJoinChapter: (chapterName: string, user: User) => void;
  approveChapterJoinRequest: (requestId: string, approver: User) => void;
  denyChapterJoinRequest: (requestId: string) => void;
  createAnnouncement: (
    data: {
      title: string;
      content: string;
      scope: AnnouncementScope;
      target?: string;
    },
    author: User
  ) => void;
  updateAnnouncement: (
    announcementId: string,
    updateData: Partial<Pick<Announcement, 'title' | 'content'>>
  ) => void;
  deleteAnnouncement: (announcementId: string) => void;
  createAccommodationRequest: (
    requestData: Omit<AccommodationRequest, 'id' | 'requester' | 'status'>,
    requester: User
  ) => void;
  removeParticipant: ( // Add this new action
    eventId: string,
    participantUserId: string,
    currentUser: User
  ) => void;
  respondToAccommodationRequest: (
    requestId: string,
    response: 'Accepted' | 'Denied',
    host: User,
    replyMessage?: string
  ) => void;
  postComment: (eventId: string, content: string, author: User) => void;
  logOutreach: (
    data: { eventId: string; outcome: OutreachOutcome; notes?: string },
    currentUser: User
  ) => void;
  awardBadge: (
    awarder: User,
    recipient: User,
    badgeTemplate: BadgeTemplate
  ) => void;
  respondToBadgeAward: (
    awardId: string,
    response: 'Accepted' | 'Rejected'
  ) => void;
  addNotification: (
    notification: Omit<Notification, 'id' | 'createdAt' | 'isRead'>
  ) => void;
  addNotifications: (
    notifications: Omit<Notification, 'id' | 'createdAt' | 'isRead'>[]
  ) => void;
  markNotificationAsRead: (notificationId: string) => void;
  markAllNotificationsAsRead: (userId: string) => void;
}

// --- STORE IMPLEMENTATION ---
export const useAppStore = create<AppState>((set, get) => ({
  // --- INITIAL STATE ---
  users: processedUsers,
  events: processedEvents,
  chapters: MOCK_CHAPTERS,
  announcements: processedAnnouncements,
  resources: MOCK_RESOURCES,
  accommodationRequests: processedAccommodationRequests,
  outreachLogs: processedOutreachLogs,
  eventComments: processedEventComments,
  challenges: processedChallenges,
  notifications: processedNotifications,
  chapterJoinRequests: [],
  badgeAwards: processedBadgeAwards,

  // --- SELECTORS ---
  getLogsForEvent: (eventId: string) => {
    return get().outreachLogs.filter((log) => log.eventId === eventId);
  },

  // --- ACTIONS ---

  // USER ACTIONS
  register: (formData) => {
    const newUser: User = {
      id: `user_${Date.now()}`,
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

  updateUserStatus: (userId, status, approver) => {
    set((state) => ({
      users: state.users.map((user) =>
        user.id === userId ? { ...user, onboardingStatus: status } : user
      ),
    }));

    const user = get().users.find((u) => u.id === userId);
    if (user && approver) {
      if (status === OnboardingStatus.PENDING_ONBOARDING_CALL) {
        get().addNotification({
          userId: user.id,
          type: NotificationType.REQUEST_ACCEPTED,
          message: `Your application for ${user.chapters[0]} was approved by ${approver.name}! Get verified in person.`,
          linkTo: '/dashboard',
        });
      }
    }
  },

  completeOnboardingCall: (userId: string) => {
    set((state) => ({
      users: state.users.map((user) =>
        user.id === userId
          ? {
              ...user,
              onboardingStatus: OnboardingStatus.AWAITING_VERIFICATION,
            }
          : user
      ),
    }));
  },

  confirmUserIdentity: (userId: string) => {
    const keyPair = nacl.box.keyPair();
    const secretKey = naclUtil.encodeBase64(keyPair.secretKey);
    const publicKey = naclUtil.encodeBase64(keyPair.publicKey);

    set((state) => ({
      users: state.users.map((user) =>
        user.id === userId
          ? {
              ...user,
              onboardingStatus: OnboardingStatus.CONFIRMED,
              role: Role.CONFIRMED_ACTIVIST,
              cryptoId: { publicKey, secretKey },
            }
          : user
      ),
    }));
  },

  updateUserRole: (userId, role) =>
    set((state) => ({
      users: state.users.map((user) => {
        if (user.id !== userId) return user;
        const changes: Partial<User> = { role };
        if (ROLE_HIERARCHY[role] < ROLE_HIERARCHY[Role.CHAPTER_ORGANISER])
          changes.organiserOf = [];
        if (ROLE_HIERARCHY[role] < ROLE_HIERARCHY[Role.REGIONAL_ORGANISER])
          delete changes.managedCountry;
        return { ...user, ...changes };
      }),
    })),

  setChapterOrganiser: (userId, chaptersToOrganise) =>
    set((state) => ({
      users: state.users.map((user) =>
        user.id === userId
          ? {
              ...user,
              role: Role.CHAPTER_ORGANISER,
              organiserOf: [...new Set(chaptersToOrganise)],
            }
          : user
      ),
    })),

  updateUserChapters: (userId, newChapters) =>
    set((state) => ({
      users: state.users.map((user) =>
        user.id === userId ? { ...user, chapters: newChapters } : user
      ),
    })),

  updateProfile: (userId, updatedData) => {
    const fullUpdate = {
      ...updatedData,
      instagram: updatedData.instagram || undefined,
    };
    set((state) => ({
      users: state.users.map((user) =>
        user.id === userId ? { ...user, ...fullUpdate } : user
      ),
    }));
    useAuthStore.getState().updateCurrentUser(fullUpdate);
  },

  deleteUser: (userIdToDelete) => {
    set((state) => ({
      users: state.users.filter((u) => u.id !== userIdToDelete),
      outreachLogs: state.outreachLogs.filter(
        (l) => l.userId !== userIdToDelete
      ),
      accommodationRequests: state.accommodationRequests.filter(
        (r) => r.requester.id !== userIdToDelete && r.host.id !== userIdToDelete
      ),
      notifications: state.notifications.filter(
        (n) =>
          n.userId !== userIdToDelete && n.relatedUser?.id !== userIdToDelete
      ),
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
      users: state.users.map((user) => {
        if (user.id === targetUserId) {
          const updatedNotes = [...(user.organizerNotes || []), newNote];
          return { ...user, organizerNotes: updatedNotes };
        }
        return user;
      }),
    }));
  },

  // EVENT ACTIONS
  createEvent: (eventData, organizer) => {
    const newEvent: CubeEvent = {
      id: `event_${Date.now()}`,
      ...eventData,
      organizer,
      participants: [
        {
          user: organizer,
          eventRole: EventRole.ORGANIZER,
          status: ParticipantStatus.ATTENDING,
        },
      ],
      status: EventStatus.UPCOMING,
    };
    set((state) => ({ events: [newEvent, ...state.events] }));
  },

  updateEvent: (eventId, updateData, currentUser) => {
    set((state) => ({
      events: state.events.map((event) =>
        event.id === eventId ? { ...event, ...updateData } : event
      ),
    }));

    const event = get().events.find((e) => e.id === eventId);
    if (!event) return;

    const notificationsToCreate = event.participants
      .filter((p) => p.user.id !== currentUser.id)
      .map((p) => ({
        userId: p.user.id,
        type: NotificationType.EVENT_UPDATED,
        message: `Details for the event "${event.location}" have been updated by the organizer.`,
        linkTo: `/cubes/${event.id}`,
        relatedUser: currentUser,
      }));
    get().addNotifications(notificationsToCreate);
  },

  cancelEvent: (eventId: string, reason: string, currentUser: User) => {
    set((state) => ({
      events: state.events.map((event) =>
        event.id === eventId
          ? {
              ...event,
              status: EventStatus.CANCELLED,
              cancellationReason: reason,
            }
          : event
      ),
    }));

    const event = get().events.find((e) => e.id === eventId);
    if (!event) return;

    const notificationsToCreate = event.participants
      .filter((p) => p.user.id !== currentUser.id)
      .map((p) => ({
        userId: p.user.id,
        type: NotificationType.EVENT_CANCELLED,
        message: `The event "${event.location}" has been cancelled by the organizer. Reason: ${reason}`,
        linkTo: `/cubes/${event.id}`,
        relatedUser: currentUser,
      }));
    get().addNotifications(notificationsToCreate);
  },

  rsvp: (eventId, currentUser, isGuest, duties) => {
    const status = isGuest
      ? ParticipantStatus.PENDING
      : ParticipantStatus.ATTENDING;
    set((state) => ({
      events: state.events.map((event) => {
        if (event.id === eventId) {
          const existingParticipantIndex = event.participants.findIndex(
            (p) => p.user.id === currentUser.id
          );

          if (existingParticipantIndex !== -1) {
            const updatedParticipants = [...event.participants];
            updatedParticipants[existingParticipantIndex] = {
              ...updatedParticipants[existingParticipantIndex],
              tourDuties: duties,
            };
            return { ...event, participants: updatedParticipants };
          } else {
            const newParticipant = {
              user: currentUser,
              eventRole: EventRole.ACTIVIST,
              status,
              tourDuties: duties,
            };
            return {
              ...event,
              participants: [...event.participants, newParticipant],
            };
          }
        }
        return event;
      }),
    }));

    if (isGuest) {
      const event = get().events.find((e) => e.id === eventId);
      if (event) {
        get().addNotification({
          userId: event.organizer.id,
          type: NotificationType.RSVP_REQUEST,
          message: `${currentUser.name} has requested to join your event: "${event.location}".`,
          linkTo: `/cubes/${eventId}`,
          relatedUser: currentUser,
        });
      }
    }
  },

  editOrganizerNote: (targetUserId, noteId, newContent) => {
  set((state) => ({
    users: state.users.map((user) => {
      if (user.id === targetUserId) {
        const updatedNotes = user.organizerNotes?.map((note) =>
          note.id === noteId ? { ...note, content: newContent } : note
        );
        return { ...user, organizerNotes: updatedNotes };
      }
      return user;
    }),
  }));
},

deleteOrganizerNote: (targetUserId, noteId) => {
  set((state) => ({
    users: state.users.map((user) => {
      if (user.id === targetUserId) {
        const updatedNotes = user.organizerNotes?.filter(
          (note) => note.id !== noteId
        );
        return { ...user, organizerNotes: updatedNotes };
      }
      return user;
    }),
  }));
},

// ADD this new action after `cancelRsvp`
removeParticipant: (eventId, participantUserId, currentUser) => {
  set((state) => ({
    events: state.events.map((event) => {
      if (event.id === eventId) {
        // Ensure the organizer isn't removing themselves
        if (event.organizer.id === participantUserId) {
          toast.error('The event organizer cannot be removed.');
          return event;
        }
        return {
          ...event,
          participants: event.participants.filter(
            (p) => p.user.id !== participantUserId
          ),
        };
      }
      return event;
    }),
  }));

  const event = get().events.find((e) => e.id === eventId);
  const removedUser = get().users.find((u) => u.id === participantUserId);
  if (event && removedUser) {
    get().addNotification({
      userId: participantUserId,
      type: NotificationType.EVENT_UPDATED, // Re-using a generic type
      message: `You have been removed from the event "${event.location}" by the organizer.`,
      linkTo: `/cubes/${event.id}`,
      relatedUser: currentUser,
    });
    toast.warning(`${removedUser.name} has been removed from the event.`);
  }
},

  approveRsvp: (eventId, guestId, currentUser) => {
    const event = get().events.find((e) => e.id === eventId);
    if (!event || event.organizer.id !== currentUser.id) return;

    set((state) => ({
      events: state.events.map((e) => {
        if (e.id === eventId) {
          return {
            ...e,
            participants: e.participants.map((p) =>
              p.user.id === guestId
                ? { ...p, status: ParticipantStatus.ATTENDING }
                : p
            ),
          };
        }
        return e;
      }),
    }));

    const guest = get().users.find((u) => u.id === guestId);
    if (guest) {
      get().addNotification({
        userId: guestId,
        type: NotificationType.RSVP_APPROVED,
        message: `Your request to join "${event.location}" has been approved!`,
        linkTo: `/cubes/${eventId}`,
        relatedUser: currentUser,
      });
    }
  },

  denyRsvp: (eventId, guestId, currentUser) => {
    const event = get().events.find((e) => e.id === eventId);
    if (!event || event.organizer.id !== currentUser.id) return;

    set((state) => ({
      events: state.events.map((e) => {
        if (e.id === eventId) {
          return {
            ...e,
            participants: e.participants.filter((p) => p.user.id !== guestId),
          };
        }
        return e;
      }),
    }));

    const guest = get().users.find((u) => u.id === guestId);
    if (guest) {
      get().addNotification({
        userId: guestId,
        type: NotificationType.RSVP_DENIED,
        message: `Your request to join "${event.location}" has been denied.`,
        linkTo: `/cubes/${eventId}`,
        relatedUser: currentUser,
      });
    }
  },

  cancelRsvp: (eventId, currentUser) =>
    set((state) => ({
      events: state.events.map((event) =>
        event.id === eventId
          ? {
              ...event,
              participants: event.participants.filter(
                (p) => p.user.id !== currentUser.id
              ),
            }
          : event
      ),
    })),

  logEventReport: (eventId, report) => {
    set((state) => {
      const event = state.events.find((e) => e.id === eventId);
      if (!event) return state;

      const updatedEvents = state.events.map((e) =>
        e.id === eventId ? { ...e, report, status: EventStatus.FINISHED } : e
      );

      const updatedUsers = state.users.map((user) => {
        const participant = event.participants.find(
          (p) =>
            p.user.id === user.id && p.status === ParticipantStatus.ATTENDING
        );
        if (participant && report.attendance[user.id] === 'Attended') {
          const newCities = [...new Set([...user.stats.cities, event.city])];
          return {
            ...user,
            stats: {
              ...user.stats,
              totalHours: user.stats.totalHours + report.hours,
              cubesAttended: user.stats.cubesAttended + 1,
              cities: newCities,
            },
          };
        }
        return user;
      });
      return { events: updatedEvents, users: updatedUsers };
    });
  },

  postComment: (eventId, content, author) => {
    const newComment: EventComment = {
      id: `comment_${Date.now()}`,
      eventId,
      content,
      author,
      createdAt: new Date(),
    };
    set((state) => ({ eventComments: [...state.eventComments, newComment] }));
  },

  // CHAPTER ACTIONS
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

    const chapterOrganizers = get().users.filter(
      (u) =>
        u.role === Role.CHAPTER_ORGANISER &&
        u.organiserOf?.includes(chapterName)
    );

    const notificationsToCreate = chapterOrganizers.map((org) => ({
      userId: org.id,
      type: NotificationType.CHAPTER_JOIN_REQUEST,
      message: `${user.name} has requested to join the ${chapterName} chapter.`,
      linkTo: '/manage',
      relatedUser: user,
    }));
    get().addNotifications(notificationsToCreate);
  },

  approveChapterJoinRequest: (requestId, approver) => {
    const request = get().chapterJoinRequests.find((r) => r.id === requestId);
    if (!request) return;

    set((state) => ({
      chapterJoinRequests: state.chapterJoinRequests.map((r) =>
        r.id === requestId ? { ...r, status: 'Approved' } : r
      ),
      users: state.users.map((user) => {
        if (user.id === request.user.id) {
          const newChapters = [
            ...new Set([...user.chapters, request.chapterName]),
          ];
          return { ...user, chapters: newChapters };
        }
        return user;
      }),
    }));

    const currentUser = useAuthStore.getState().currentUser;
    if (currentUser && currentUser.id === request.user.id) {
      const updatedUser = get().users.find((u) => u.id === request.user.id);
      if (updatedUser) {
        useAuthStore
          .getState()
          .updateCurrentUser({ chapters: updatedUser.chapters });
      }
    }

    get().addNotification({
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

  // ANNOUNCEMENT ACTIONS
  createAnnouncement: (data, author) => {
    const newAnnouncement: Announcement = {
      id: `ann_${Date.now()}`,
      createdAt: new Date(),
      author,
      ...data,
    };
    set((state) => ({
      announcements: [newAnnouncement, ...state.announcements],
    }));
  },

  updateAnnouncement: (announcementId, updateData) => {
    set((state) => ({
      announcements: state.announcements.map((ann) =>
        ann.id === announcementId ? { ...ann, ...updateData } : ann
      ),
    }));
  },

  deleteAnnouncement: (announcementId) => {
    set((state) => ({
      announcements: state.announcements.filter(
        (ann) => ann.id !== announcementId
      ),
    }));
  },

  // ACCOMMODATION ACTIONS
  createAccommodationRequest: (requestData, requester) => {
    const newRequest: AccommodationRequest = {
      id: `req_${Date.now()}`,
      requester,
      status: 'Pending',
      ...requestData,
    };
    set((state) => ({
      accommodationRequests: [newRequest, ...state.accommodationRequests],
    }));
    get().addNotification({
      userId: requestData.host.id,
      type: NotificationType.ACCOMMODATION_REQUEST,
      message: `${requester.name} requested accommodation for the ${requestData.event.location} event.`,
      linkTo: '/dashboard',
      relatedUser: requester,
    });
  },

  respondToAccommodationRequest: (requestId, response, host, replyMessage) => {
    set((state) => ({
      accommodationRequests: state.accommodationRequests.map((req) =>
        req.id === requestId
          ? { ...req, status: response, hostReply: replyMessage }
          : req
      ),
    }));
    const request = get().accommodationRequests.find((r) => r.id === requestId);
    if (request) {
      const notifType =
        response === 'Accepted'
          ? NotificationType.REQUEST_ACCEPTED
          : NotificationType.REQUEST_DENIED;
      get().addNotification({
        userId: request.requester.id,
        type: notifType,
        message: `${
          host.name
        } ${response.toLowerCase()} your accommodation request for ${
          request.event.location
        }.`,
        linkTo: '/dashboard',
        relatedUser: host,
      });
    }
  },

  // OUTREACH ACTIONS
  logOutreach: (data, currentUser) => {
    const newLog: OutreachLog = {
      id: `log_${Date.now()}`,
      userId: currentUser.id,
      createdAt: new Date(),
      ...data,
    };
    set((state) => ({
      outreachLogs: [...state.outreachLogs, newLog],
      users: state.users.map((user) => {
        if (user.id === currentUser.id) {
          const isConversion =
            data.outcome === OutreachOutcome.BECAME_VEGAN ||
            data.outcome === OutreachOutcome.BECAME_VEGAN_ACTIVIST;

          return {
            ...user,
            stats: {
              ...user.stats,
              totalConversations: user.stats.totalConversations + 1,
              veganConversions:
                user.stats.veganConversions + (isConversion ? 1 : 0),
            },
          };
        }
        return user;
      }),
    }));
  },

  // BADGE ACTIONS
  awardBadge: (awarder, recipient, badgeTemplate) => {
    const newAward: BadgeAward = {
      id: `badge_award_${Date.now()}`,
      awarder,
      recipient,
      badge: badgeTemplate,
      status: 'Pending',
      createdAt: new Date(),
    };

    set((state) => ({
      badgeAwards: [...state.badgeAwards, newAward],
    }));

    get().addNotification({
      userId: recipient.id,
      type: NotificationType.BADGE_AWARDED,
      message: `${awarder.name} has awarded you the "${badgeTemplate.name}" badge!`,
      linkTo: '/dashboard',
      relatedUser: awarder,
    });
  },

  respondToBadgeAward: (awardId, response) => {
    let award: BadgeAward | undefined;

    set((state) => {
      award = state.badgeAwards.find((a) => a.id === awardId);
      if (!award) return state;

      const updatedAwards = state.badgeAwards.map((a) =>
        a.id === awardId ? { ...a, status: response } : a
      );

      let updatedUsers = state.users;
      if (response === 'Accepted') {
        updatedUsers = state.users.map((user) => {
          if (user.id === award!.recipient.id) {
            const newBadge: EarnedBadge = {
              id: `badge_${Date.now()}`,
              ...award!.badge,
              awardedAt: new Date(),
            };
            return {
              ...user,
              badges: [...user.badges, newBadge],
            };
          }
          return user;
        });

        const currentUser = useAuthStore.getState().currentUser;
        if (currentUser && currentUser.id === award.recipient.id) {
          const updatedUser = updatedUsers.find(
            (u) => u.id === award!.recipient.id
          );
          if (updatedUser) {
            useAuthStore
              .getState()
              .updateCurrentUser({ badges: updatedUser.badges });
          }
        }
      }

      return {
        badgeAwards: updatedAwards,
        users: updatedUsers,
      };
    });

    if (award) {
      get().addNotification({
        userId: award.awarder.id,
        type:
          response === 'Accepted'
            ? NotificationType.BADGE_AWARD_ACCEPTED
            : NotificationType.BADGE_AWARD_REJECTED,
        message: `${award.recipient.name} has ${response.toLowerCase()} the "${
          award.badge.name
        }" badge.`,
        linkTo: `/members/${award.recipient.id}`,
        relatedUser: award.recipient,
      });
    }
  },

  // NOTIFICATION ACTIONS
  addNotification: (notificationData) => {
    const newNotification: Notification = {
      id: `notif_${Date.now()}`,
      createdAt: new Date(),
      isRead: false,
      ...notificationData,
    };
    set((state) => ({
      notifications: [newNotification, ...state.notifications],
    }));
  },

  addNotifications: (notificationsData) => {
    const newNotifications: Notification[] = notificationsData.map(
      (data, index) => ({
        id: `notif_${Date.now()}_${index}`,
        createdAt: new Date(),
        isRead: false,
        ...data,
      })
    );
    if (newNotifications.length > 0) {
      set((state) => ({
        notifications: [...newNotifications, ...state.notifications],
      }));
    }
  },

  markNotificationAsRead: (notificationId) => {
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === notificationId ? { ...n, isRead: true } : n
      ),
    }));
  },

  markAllNotificationsAsRead: (userId) => {
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.userId === userId && !n.isRead ? { ...n, isRead: true } : n
      ),
    }));
  },
}));

// --- SELECTOR HOOKS for convenience ---
export const useUsers = () => useAppStore((state) => state.users);
export const useEvents = () => useAppStore((state) => state.events);
export const useChapters = () => useAppStore((state) => state.chapters);
export const useAnnouncements = () =>
  useAppStore((state) => state.announcements);
export const useResources = () => useAppStore((state) => state.resources);
export const useOutreachLogs = () => useAppStore((state) => state.outreachLogs);
export const useEventComments = () =>
  useAppStore((state) => state.eventComments);
export const useAccommodationRequests = () =>
  useAppStore((state) => state.accommodationRequests);
export const useChallenges = () => useAppStore((state) => state.challenges);
export const useNotifications = () =>
  useAppStore((state) => state.notifications);
export const useChapterJoinRequests = () =>
  useAppStore((state) => state.chapterJoinRequests);
export const useBadgeAwardsForUser = (userId?: string) =>
  useAppStore((state) => {
    if (!userId) return [];
    return state.badgeAwards.filter(
      (award) => award.recipient.id === userId && award.status === 'Pending'
    );
  });

export const useEventById = (eventId?: string) =>
  useAppStore((state) => state.events.find((e) => e.id === eventId));
export const useChapterByName = (chapterName?: string) =>
  useAppStore((state) =>
    chapterName
      ? state.chapters.find(
          (c) => c.name.toLowerCase() === chapterName.toLowerCase()
        )
      : undefined
  );
export const useUserById = (userId?: string) =>
  useAppStore((state) => state.users.find((u) => u.id === userId));

export const useNotificationsForUser = (userId?: string) =>
  useAppStore((state) => {
    if (!userId) return [];
    return state.notifications
      .filter((n) => n.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  });

export const useUnreadNotificationCount = (userId?: string) =>
  useAppStore((state) => {
    if (!userId) return 0;
    return state.notifications.filter((n) => n.userId === userId && !n.isRead)
      .length;
  });

// --- ACTION HOOKS for convenience ---
export const useAppActions = () => useAppStore((state) => state);
