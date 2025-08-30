import {
  accommodationRequests as rawAccommodationRequests,
  announcements as rawAnnouncements,
  badgeAwards as rawBadgeAwards,
  challenges as rawChallenges,
  chapters as rawChapters,
  eventComments as rawEventComments,
  events as rawEvents,
  inventory as rawInventory,
  notifications as rawNotifications,
  outreachLogs as rawOutreachLogs,
  resources as rawResources,
  users as rawUsers,
} from '@/data/mockData';
import {
  type AccommodationRequest,
  type Announcement,
  type BadgeAward,
  type Challenge,
  type Chapter,
  type CubeEvent,
  type EventComment,
  EventStatus,
  type InventoryItem,
  type Notification,
  NotificationType,
  OnboardingStatus,
  type OutreachLog,
  ParticipantStatus,
  type Resource,
  Role,
  type User,
} from '@/types';

// Process raw data with date strings into data with Date objects
export const processedUsers: User[] = rawUsers.map((user) => ({
  ...user,
  joinDate: user.joinDate ? new Date(user.joinDate) : undefined,
  organizerNotes: user.organizerNotes?.map((note) => ({
    ...note,
    createdAt: new Date(note.createdAt),
  })),
  badges: user.badges?.map((badge) => ({
    ...badge,
    awardedAt: new Date(badge.awardedAt),
  })),
}));

export const processedEvents: CubeEvent[] = rawEvents.map((event) => ({
  ...event,
  startDate: new Date(event.startDate),
  endDate: event.endDate ? new Date(event.endDate) : undefined,
  participants:
    event.participants?.map((p) => ({
      ...p,
      status: p.status || ParticipantStatus.ATTENDING,
    })) || [],
}));

export const processedAnnouncements: Announcement[] = rawAnnouncements.map(
  (ann) => ({
    ...ann,
    createdAt: new Date(ann.createdAt),
  })
);

export const processedAccommodationRequests: AccommodationRequest[] =
  rawAccommodationRequests.map((req) => ({
    ...req,
    startDate: new Date(req.startDate),
    endDate: new Date(req.endDate),
    createdAt: new Date(req.createdAt),
  }));

export const processedOutreachLogs: OutreachLog[] = rawOutreachLogs.map(
  (log) => ({
    ...log,
    createdAt: new Date(log.createdAt),
  })
);

export const processedEventComments: EventComment[] = rawEventComments.map(
  (comment) => ({
    ...comment,
    createdAt: new Date(comment.createdAt),
  })
);

export const processedChallenges: Challenge[] = rawChallenges.map(
  (challenge) => ({
    ...challenge,
    endDate: new Date(challenge.endDate),
  })
);

export const processedNotifications: Notification[] = rawNotifications.map(
  (n) => ({
    ...n,
    createdAt: new Date(n.createdAt),
  })
);

export const processedBadgeAwards: BadgeAward[] = rawBadgeAwards.map(
  (award) => ({
    ...award,
    createdAt: new Date(award.createdAt),
  })
);

export const initialChapters: Chapter[] = rawChapters;
export const initialResources: Resource[] = rawResources;
export const initialInventory: InventoryItem[] = rawInventory;

// Re-export enums used by actions for convenience
export {
  EventStatus,
  NotificationType,
  OnboardingStatus,
  ParticipantStatus,
  Role,
};
