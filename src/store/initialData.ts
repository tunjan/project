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

export const processedUsers: User[] = MOCK_USERS.map((user) => ({
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
})) as User[];

// Debug logging
console.log('initialData - MOCK_USERS length:', MOCK_USERS.length);
console.log('initialData - processedUsers length:', processedUsers.length);
console.log('initialData - processedUsers first user:', processedUsers[0]);

export const processedEvents: CubeEvent[] = MOCK_CUBE_EVENTS.map(
  (event) => ({
    ...event,
    startDate: new Date(event.startDate),
    endDate: event.endDate ? new Date(event.endDate) : undefined,
    participants: event.participants.map((p) => ({
      ...p,
      status: p.status || ParticipantStatus.ATTENDING,
    })),
  })
) as CubeEvent[];

export const processedAnnouncements: Announcement[] = MOCK_ANNOUNCEMENTS.map(
  (ann) => ({
    ...ann,
    createdAt: new Date(ann.createdAt),
  })
) as Announcement[];

export const processedAccommodationRequests: AccommodationRequest[] =
  MOCK_ACCOMMODATION_REQUESTS.map((req) => ({
    ...req,
    startDate: new Date(req.startDate),
    endDate: new Date(req.endDate),
    createdAt: new Date(req.createdAt),
    event: {
      ...req.event,
      startDate: new Date(req.event.startDate),
    },
  })) as AccommodationRequest[];

export const processedOutreachLogs: OutreachLog[] = MOCK_OUTREACH_LOGS.map(
  (log) => ({
    ...log,
    createdAt: new Date(log.createdAt),
  })
) as OutreachLog[];

export const processedEventComments: EventComment[] = MOCK_EVENT_COMMENTS.map(
  (comment) => ({
    ...comment,
    createdAt: new Date(comment.createdAt),
  })
) as EventComment[];

export const processedChallenges: Challenge[] = MOCK_CHALLENGES.map(
  (challenge) => ({
    ...challenge,
    endDate: new Date(challenge.endDate),
  })
) as Challenge[];

export const processedNotifications: Notification[] = MOCK_NOTIFICATIONS.map(
  (n) => ({
    ...n,
    createdAt: new Date(n.createdAt),
  })
) as Notification[];

export const processedBadgeAwards: BadgeAward[] = MOCK_BADGE_AWARDS.map(
  (award) => ({
    ...award,
    createdAt: new Date(award.createdAt),
  })
) as BadgeAward[];

// Mock inventory data for chapters
export const initialInventory: InventoryItem[] = [
  {
    id: 'inv_1',
    chapterName: 'London',
    category: 'Masks',
    quantity: 25,
  },
  {
    id: 'inv_2',
    chapterName: 'London',
    category: 'TVs',
    quantity: 3,
  },
  {
    id: 'inv_3',
    chapterName: 'London',
    category: 'Signs',
    quantity: 15,
  },
  {
    id: 'inv_4',
    chapterName: 'Manchester',
    category: 'Masks',
    quantity: 18,
  },
  {
    id: 'inv_5',
    chapterName: 'Manchester',
    category: 'TVs',
    quantity: 2,
  },
  {
    id: 'inv_6',
    chapterName: 'Manchester',
    category: 'Signs',
    quantity: 8,
  },
  {
    id: 'inv_7',
    chapterName: 'Birmingham',
    category: 'Masks',
    quantity: 12,
  },
  {
    id: 'inv_8',
    chapterName: 'Birmingham',
    category: 'TVs',
    quantity: 1,
  },
  {
    id: 'inv_9',
    chapterName: 'Birmingham',
    category: 'Signs',
    quantity: 8,
  },
];

export const initialChapters: Chapter[] = MOCK_CHAPTERS;
export const initialResources: Resource[] = MOCK_RESOURCES;

// Re-export enums used by actions for convenience
export {
  Role,
  OnboardingStatus,
  NotificationType,
  EventStatus,
  ParticipantStatus,
};


