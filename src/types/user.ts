export enum Role {
  APPLICANT = 'Applicant',
  ACTIVIST = 'Activist',
  CHAPTER_ORGANISER = 'Chapter Organiser',
  REGIONAL_ORGANISER = 'Regional Organiser',
  GLOBAL_ADMIN = 'Global Admin',
  GODMODE = 'Godmode',
}

export type ProtectedRole = 'organizer';

export interface UserStats {
  totalHours: number;
  cubesAttended: number;
  veganConversions: number;
  totalConversations: number;
  cities: string[];
}

export enum OnboardingStatus {
  PENDING_APPLICATION_REVIEW = 'Pending Application Review',
  PENDING_ONBOARDING_CALL = 'Pending Onboarding Call',
  AWAITING_FIRST_CUBE = 'Awaiting First Cube',
  AWAITING_MASTERCLASS = 'Awaiting Masterclass',
  AWAITING_REVISION_CALL = 'Awaiting Revision Call',
  CONFIRMED = 'Confirmed',
  COMPLETED = 'Completed',
  DENIED = 'Denied',
  INACTIVE = 'Inactive',
}

export interface OnboardingAnswers {
  veganReason: string;
  abolitionistAlignment: boolean;
  customAnswer: string;
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
  email: string;
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
  // Onboarding progress flags
  onboardingProgress?: {
    watchedMasterclass?: boolean;
    selectedOrganiserId?: string;
    onboardingCallScheduledAt?: Date;
    revisionCallScheduledAt?: Date;
    onboardingCallContactInfo?: string;
    revisionCallContactInfo?: string;
  };
  joinDate?: Date;
  organizerNotes?: OrganizerNote[];
  lastLogin: Date;
  activityLevel?: 'high' | 'medium' | 'low';
  leaveDate?: Date;
}

// Re-export from entities for circular dependency
export interface EarnedBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  awardedAt: Date;
}
