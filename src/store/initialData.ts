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
  type InventoryItem,
  Role,
  OnboardingStatus,
  NotificationType,
  EventStatus,
  ParticipantStatus,
} from '@/types';
import {
  users as rawUsers,
  events as rawEvents,
  chapters as rawChapters,
  announcements as rawAnnouncements,
  resources as rawResources,
  outreachLogs as rawOutreachLogs,
  eventComments as rawEventComments,
  challenges as rawChallenges,
  notifications as rawNotifications,
  badgeAwards as rawBadgeAwards,
  inventory as rawInventory,
  accommodationRequests as rawAccommodationRequests,
} from '@/data/mockData';

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
  participants: event.participants?.map((p) => ({
    ...p,
    status: p.status || ParticipantStatus.ATTENDING,
  })) || [],
}));

export const processedAnnouncements: Announcement[] = rawAnnouncements.map((ann) => ({
  ...ann,
  createdAt: new Date(ann.createdAt),
}));

export const processedAccommodationRequests: AccommodationRequest[] =
  rawAccommodationRequests.map((req) => ({
    ...req,
    startDate: new Date(req.startDate),
    endDate: new Date(req.endDate),
    createdAt: new Date(req.createdAt),
  }));

export const processedOutreachLogs: OutreachLog[] = rawOutreachLogs.map((log) => ({
  ...log,
  createdAt: new Date(log.createdAt),
}));

export const processedEventComments: EventComment[] = rawEventComments.map(
  (comment) => ({
    ...comment,
    createdAt: new Date(comment.createdAt),
  })
);

export const processedChallenges: Challenge[] = rawChallenges.map((challenge) => ({
  ...challenge,
  endDate: new Date(challenge.endDate),
}));

export const processedNotifications: Notification[] = rawNotifications.map((n) => ({
  ...n,
  createdAt: new Date(n.createdAt),
}));

export const processedBadgeAwards: BadgeAward[] = rawBadgeAwards.map((award) => ({
  ...award,
  createdAt: new Date(award.createdAt),
}));

export const initialChapters: Chapter[] = rawChapters;
export const initialResources: Resource[] = rawResources;
export const initialInventory: InventoryItem[] = rawInventory;



// Re-export enums used by actions for convenience
export {
  Role,
  OnboardingStatus,
  NotificationType,
  EventStatus,
  ParticipantStatus,
};


