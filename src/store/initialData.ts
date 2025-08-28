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
import { mockDataService } from '@/services/mockDataService';

// Mock inventory data for chapters (static data that doesn't need to be generated)
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

// Async functions to get processed data from the mock data service
export const getProcessedUsers = async (): Promise<User[]> => {
  const users = await mockDataService.getUsers();
  return users.map((user) => ({
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
};

export const getProcessedEvents = async (): Promise<CubeEvent[]> => {
  const events = await mockDataService.getEvents();
  return events.map((event) => ({
    ...event,
    startDate: new Date(event.startDate),
    endDate: event.endDate ? new Date(event.endDate) : undefined,
    participants: event.participants?.map((p) => ({
      ...p,
      status: p.status || ParticipantStatus.ATTENDING,
    })) || [],
  })) as CubeEvent[];
};

export const getProcessedAnnouncements = async (): Promise<Announcement[]> => {
  const announcements = await mockDataService.getAnnouncements();
  return announcements.map((ann) => ({
    ...ann,
    createdAt: new Date(ann.createdAt),
  }));
};

export const getProcessedOutreachLogs = async (): Promise<OutreachLog[]> => {
  const logs = await mockDataService.getOutreachLogs();
  return logs.map((log) => ({
    ...log,
    createdAt: new Date(log.createdAt),
  }));
};

export const getProcessedChallenges = async (): Promise<Challenge[]> => {
  const challenges = await mockDataService.getChallenges();
  return challenges.map((challenge) => ({
    ...challenge,
    endDate: new Date(challenge.endDate),
  }));
};

export const getProcessedNotifications = async (): Promise<Notification[]> => {
  const notifications = await mockDataService.getNotifications();
  return notifications.map((n) => ({
    ...n,
    createdAt: new Date(n.createdAt),
  }));
};

export const getProcessedBadgeAwards = async (): Promise<BadgeAward[]> => {
  const badges = await mockDataService.getBadges();
  return badges.map((award) => ({
    ...award,
    createdAt: new Date(award.createdAt),
  }));
};

export const getInitialChapters = async (): Promise<Chapter[]> => {
  return await mockDataService.getChapters();
};

export const getInitialResources = async (): Promise<Resource[]> => {
  return await mockDataService.getResources();
};

export const getProcessedAccommodationRequests = async (): Promise<AccommodationRequest[]> => {
  // For now, return empty array since accommodation requests might not be in the mock data service
  // This can be enhanced later when accommodation data is added to the service
  return [];
};

// Legacy synchronous functions that return empty arrays (for backward compatibility)
// These should be replaced with the async versions above
export const processedUsers: User[] = [];
export const processedEvents: CubeEvent[] = [];
export const processedAnnouncements: Announcement[] = [];
export const processedAccommodationRequests: AccommodationRequest[] = [];
export const processedOutreachLogs: OutreachLog[] = [];
export const processedEventComments: EventComment[] = [];
export const processedChallenges: Challenge[] = [];
export const processedNotifications: Notification[] = [];
export const processedBadgeAwards: BadgeAward[] = [];
export const initialChapters: Chapter[] = [];
export const initialResources: Resource[] = [];

// Re-export enums used by actions for convenience
export {
  Role,
  OnboardingStatus,
  NotificationType,
  EventStatus,
  ParticipantStatus,
};


