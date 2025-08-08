export enum Role {
  ACTIVIST = 'Activist',
  CONFIRMED_ACTIVIST = 'Activist (Confirmed)',
  CHAPTER_ORGANISER = 'Chapter Organiser',
  REGIONAL_ORGANISER = 'Regional Organiser',
  GLOBAL_ADMIN = 'Global Admin',
  GODMODE = 'Godmode',
}

export type ProtectedRole = 'organizer';

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
  BADGE_AWARDED = 'Badge Awarded',
  BADGE_AWARD_ACCEPTED = 'Badge Award Accepted',
  BADGE_AWARD_REJECTED = 'Badge Award Rejected',
  NEW_APPLICANT = 'New Applicant', // NEW
}

export enum EventRole {
  ORGANIZER = 'Organizer',
  ACTIVIST = 'Activist',
  VOLUNTEER = 'Volunteer',
  OUTREACH = 'Outreach',
  TRANSPORT = 'Transport',
  EQUIPMENT = 'Equipment',
}

export type View =
  | 'cubes'
  | 'dashboard'
  | 'management'
  | 'login'
  | 'signup'
  | 'createCube'
  | 'memberProfile'
  | 'manageEvent'
  | 'announcements'
  | 'createAnnouncement'
  | 'resources'
  | 'security'
  | 'analytics'
  | 'outreach'
  | 'chapters'
  | 'chapterDetail';

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

export interface UserStats {
  totalHours: number;
  cubesAttended: number;
  veganConversions: number;
  totalConversations: number;
  cities: string[];
}

export enum OnboardingStatus {
  PENDING_APPLICATION_REVIEW = 'Pending Application Review',
  // REMOVED: PENDING_ONBOARDING_CALL = 'Pending Onboarding Call',
  AWAITING_VERIFICATION = 'Awaiting Verification',
  CONFIRMED = 'Confirmed',
  DENIED = 'Denied',
  INACTIVE = 'Inactive',
}
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

export interface OrganizerNote {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: Date;
}

export interface User {
  id: string;
  name: string;
  email: string; // NEW
  role: Role;
  instagram?: string;
  chapters: string[];
  organiserOf?: string[];
  managedCountry?: string;
  stats: UserStats;
  profilePictureUrl: string;
  badges: EarnedBadge[];
  hostingAvailability: boolean;
  hostingCapacity?: number;
  onboardingStatus: OnboardingStatus;
  onboardingAnswers?: OnboardingAnswers;
  joinDate?: Date;
  cryptoId?: {
    publicKey: string;
    secretKey: string;
  };
  organizerNotes?: OrganizerNote[];
}

export interface TourDuty {
  date: string; // YYYY-MM-DD format
  role: EventRole;
}

export enum ParticipantStatus {
  PENDING = 'Pending',
  ATTENDING = 'Attending',
}

export interface EventParticipant {
  user: User;
  eventRole: EventRole;
  status: ParticipantStatus;
  tourDuties?: TourDuty[];
}

export enum EventStatus {
  UPCOMING = 'Upcoming',
  ONGOING = 'Ongoing',
  FINISHED = 'Finished',
  CANCELLED = 'Cancelled',
}

export interface EventReport {
  hours: number;
  attendance: Record<string, 'Attended' | 'Absent'>;
}

export interface CubeEvent {
  id: string;
  city: string;
  location: string;
  startDate: Date;
  endDate?: Date;
  scope: 'Chapter' | 'Regional' | 'Global';
  targetRegion?: string;
  organizer: User;
  participants: EventParticipant[];
  status: EventStatus;
  report?: EventReport;
  cancellationReason?: string;
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

export interface EventComment {
  id: string;
  eventId: string;
  author: User;
  content: string;
  createdAt: Date;
  parentId?: string;
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

export interface AccommodationRequest {
  id: string;
  requester: User;
  host: User;
  event: CubeEvent;
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  message: string;
  status: 'Pending' | 'Accepted' | 'Denied';
  hostReply?: string;
}

export interface BadgeAward {
  id: string;
  awarder: User;
  recipient: User;
  badge: BadgeTemplate;
  status: 'Pending' | 'Accepted' | 'Rejected';
  createdAt: Date;
}