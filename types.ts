import React from 'react';

export enum Role {
  ACTIVIST = 'Activist',
  CONFIRMED_ACTIVIST = 'Activist (Confirmed)',
  CHAPTER_ORGANISER = 'Chapter Organiser',
  REGIONAL_ORGANISER = 'Regional Organiser',
  GLOBAL_ADMIN = 'Global Admin',
  GODMODE = 'Godmode',
}

export enum EventRole {
  ORGANIZER = 'Organizer',
  VOLUNTEER = 'Volunteer',
  OUTREACH = 'Outreach',
  SECURITY = 'Security',
}

export type View = 'cubes' | 'dashboard' | 'management' | 'login' | 'signup' | 'createCube' | 'memberProfile' | 'manageEvent' | 'announcements' | 'createAnnouncement' | 'resources' | 'security' | 'analytics' | 'outreach' | 'chapters' | 'chapterDetail';

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: React.FC<{ className?: string }>;
}

export enum DiscountTierLevel {
  NONE = 'None',
  TIER_1 = 'Tier 1 (5%)',
  TIER_2 = 'Tier 2 (10%)',
  TIER_3 = 'Tier 3 (15%)',
}

export interface UserStats {
  totalHours: number;
  cubesAttended: number;
  veganConversions: number;
  cities: string[];
}

export type OnboardingStatus = 'Pending' | 'Awaiting Verification' | 'Confirmed' | 'Denied';

export interface OnboardingAnswers {
    veganReason: string;
    abolitionistAlignment: boolean;
    customAnswer: string;
}

export interface Chapter {
    name: string;
    country: string;
    lat: number;
    lng: number;
    instagram?: string;
}

export interface IdentityTokenPayload {
    userId: string;
    name: string;
    role: Role;
    chapters: string[];
    issuedAt: string;
}

export interface SignedIdentityToken {
    payload: IdentityTokenPayload;
    signature: string; // base64 encoded
    publicKey: string; // base64 encoded
}

export interface User {
  id: string;
  name: string;
  role: Role;
  instagram?: string;
  chapters: string[]; // Chapters user is a member of
  organiserOf?: string[]; // Chapters user is an organizer of
  managedCountry?: string; // Country a Regional Organiser manages
  stats: UserStats;
  profilePictureUrl: string;
  badges: Badge[];
  hostingAvailability: boolean;
  hostingCapacity?: number;
  onboardingStatus: OnboardingStatus;
  onboardingAnswers?: OnboardingAnswers;
  identityToken?: SignedIdentityToken;
}

export interface EventParticipant {
  user: User;
  eventRole: EventRole;
}

export enum EventStatus {
  UPCOMING = 'Upcoming',
  ONGOING = 'Ongoing',
  FINISHED = 'Finished',
}

export interface EventReport {
    hours: number;
    attendance: Record<string, 'Attended' | 'Absent'>;
}

export interface CubeEvent {
  id: string;
  city: string;
  location: string;
  dateTime: Date;
  organizer: User;
  participants: EventParticipant[];
  status: EventStatus;
  report?: EventReport;
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
    chapter?: string; // name of chapter if scope is CHAPTER
    country?: string; // name of country if scope is REGIONAL
}

export enum ResourceType {
    DOCUMENT = 'Document',
    VIDEO = 'Video',
    GUIDE = 'Guide',
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
    icon: React.FC<{ className?: string }>;
}

export interface AccommodationRequest {
    id: string;
    requester: User;
    host: User;
    event: CubeEvent;
    startDate: Date;
    endDate: Date;
    message: string;
    status: 'Pending' | 'Accepted' | 'Denied';
    hostReply?: string;
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

export interface EventComment {
    id: string;
    eventId: string;
    author: User;
    content: string;
    createdAt: Date;
    parentId?: string; // for threaded replies
}

export enum NotificationType {
    NEW_ANNOUNCEMENT = 'New Announcement',
    ACCOMMODATION_REQUEST = 'Accommodation Request',
    REQUEST_ACCEPTED = 'Request Accepted',
    REQUEST_DENIED = 'Request Denied',
}

export interface Notification {
    id: string;
    userId: string; // The user who receives it
    type: NotificationType;
    message: string;
    linkTo: View;
    isRead: boolean;
    createdAt: Date;
    relatedUser?: User; // e.g., who sent the request
}