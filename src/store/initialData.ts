import {
  type User,
  type CubeEvent,
  type Chapter,
  type Announcement,
  type Resource,
  type AccommodationRequest,
  type OutreachLog,
  type EventComment,
  type Challenge,
  type Notification,
  type BadgeAward,
  Role,
  OnboardingStatus,
  NotificationType,
  EventRole,
  EventStatus,
  ParticipantStatus,
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
} from '@/mockData';

// Preprocess mock data into typed domain models used by the stores

export const processedUsers: User[] = MOCK_USERS.map((user: any) => ({
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

export const processedEvents: CubeEvent[] = MOCK_CUBE_EVENTS.map(
  (event: any) => ({
    ...event,
    startDate: new Date(event.startDate),
    endDate: event.endDate ? new Date(event.endDate) : undefined,
    participants: event.participants.map((p: any) => ({
      ...p,
      status: p.status || ParticipantStatus.ATTENDING,
    })),
  })
);

export const processedAnnouncements: Announcement[] = MOCK_ANNOUNCEMENTS.map(
  (ann: any) => ({
    ...ann,
    createdAt: new Date(ann.createdAt),
  })
);

export const processedAccommodationRequests: AccommodationRequest[] =
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

export const processedOutreachLogs: OutreachLog[] = MOCK_OUTREACH_LOGS.map(
  (log: any) => ({
    ...log,
    createdAt: new Date(log.createdAt),
  })
);

export const processedEventComments: EventComment[] = MOCK_EVENT_COMMENTS.map(
  (comment: any) => ({
    ...comment,
    createdAt: new Date(comment.createdAt),
  })
);

export const processedChallenges: Challenge[] = MOCK_CHALLENGES.map(
  (challenge: any) => ({
    ...challenge,
    endDate: new Date(challenge.endDate),
  })
);

export const processedNotifications: Notification[] = MOCK_NOTIFICATIONS.map(
  (n: any) => ({
    ...n,
    createdAt: new Date(n.createdAt),
  })
);

export const processedBadgeAwards: BadgeAward[] = MOCK_BADGE_AWARDS.map(
  (award: any) => ({
    ...award,
    createdAt: new Date(award.createdAt),
  })
);

export const initialChapters: Chapter[] = MOCK_CHAPTERS;
export const initialResources: Resource[] = MOCK_RESOURCES;

// Re-export enums used by actions for convenience
export {
  Role,
  OnboardingStatus,
  NotificationType,
  EventRole,
  EventStatus,
  ParticipantStatus,
};


