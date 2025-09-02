import { User } from './user';

export interface ChallengeParticipant {
  id: string;
  name: string;
  progress: number;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  metric: string;
  goal: number;
  participants: ChallengeParticipant[];
  endDate: Date;
}

export enum NotificationType {
  NEW_ANNOUNCEMENT = 'New Announcement',
  ACCOMMODATION_REQUEST = 'Accommodation Request',
  REQUEST_ACCEPTED = 'Request Accepted',
  REQUEST_DENIED = 'Request Denied',
  INACTIVITY_ALERT = 'Inactivity Alert',
  EVENT_CANCELLED = 'Event Cancelled',
  EVENT_UPDATED = 'Event Updated',
  RSVP_REQUEST = 'RSVP Request',
  RSVP_APPROVED = 'RSVP Approved',
  RSVP_DENIED = 'RSVP Denied',
  CHAPTER_JOIN_REQUEST = 'Chapter Join Request',
  CHAPTER_JOIN_APPROVED = 'Chapter Join Approved',
  BADGE_AWARDED = 'Recognition Awarded',
  BADGE_AWARD_ACCEPTED = 'Recognition Accepted',
  BADGE_AWARD_REJECTED = 'Recognition Declined',
  NEW_APPLICANT = 'New Applicant',
  STATS_UPDATED = 'Stats Updated',
  ROLE_UPDATED = 'Role Updated',
  REMOVED_FROM_EVENT = 'Removed From Event',
  CHAPTER_MEMBERSHIP_UPDATED = 'Chapter Membership Updated',
}

export interface BadgeTemplate {
  name: string;
  description: string;
  icon: string;
}

export interface EarnedBadge extends BadgeTemplate {
  id: string;
  awardedAt: Date;
}

export enum DiscountTierLevel {
  NONE = 'None',
  TIER_1 = 'Tier 1 (5%)',
  TIER_2 = 'Tier 2 (10%)',
  TIER_3 = 'Tier 3 (15%)',
}

export interface Chapter {
  name: string;
  country: string;
  lat: number;
  lng: number;
  instagram?: string;
}

export enum AnnouncementScope {
  GLOBAL = 'Global',
  REGIONAL = 'Regional',
  CHAPTER = 'Chapter',
}

export interface Announcement {
  id: string;
  author: User;
  scope: AnnouncementScope;
  title: string;
  content: string;
  createdAt: Date;
  chapter?: string;
  country?: string;
  ctaLink?: string;
  ctaText?: string;
}

export enum ResourceType {
  DOCUMENT = 'Document',
  VIDEO = 'Video',
  GUIDE = 'Guide',
  LINK = 'Link',
}

export enum SkillLevel {
  BEGINNER = 'Beginner',
  INTERMEDIATE = 'Intermediate',
  ADVANCED = 'Advanced',
}

export interface Resource {
  id: string;
  title: string;
  description: string;
  type: ResourceType;
  skillLevel: SkillLevel;
  language: string;
  url: string;
  icon: string;
}

export enum OutreachOutcome {
  BECAME_VEGAN_ACTIVIST = 'Became vegan and activist',
  BECAME_VEGAN = 'Became vegan',
  ALREADY_VEGAN_NOW_ACTIVIST = 'Already vegan, now activist',
  MOSTLY_SURE = 'Mostly sure',
  NOT_SURE = 'Not sure',
  NO_CHANGE = 'No change / Dismissive',
}

export interface OutreachLog {
  id: string;
  userId: string;
  eventId: string;
  outcome: OutreachOutcome;
  notes?: string;
  createdAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  message: string;
  linkTo: string;
  isRead: boolean;
  createdAt: Date;
  relatedUser?: User;
}

export interface ChapterJoinRequest {
  id: string;
  user: User;
  chapterName: string;
  status: 'Pending' | 'Approved' | 'Denied';
  createdAt: Date;
}

export interface BadgeAward {
  id: string;
  awarder: User;
  recipient: User;
  badge: BadgeTemplate;
  status: 'Pending' | 'Accepted' | 'Rejected';
  createdAt: Date;
}

export interface InventoryItem {
  id: string;
  chapterName: string;
  category: 'Masks' | 'TVs' | 'Signs';
  quantity: number;
}
