import {
  type User,
  OnboardingStatus,
  type OnboardingAnswers,
  Role,
  NotificationType,
} from '@/types';
import { useNotificationsStore } from '@/store/notifications.store';
import { useChaptersStore } from '@/store/chapters.store';
import { generateRandomAvatarUrl } from '../utils/user';

// Helper function to validate onboarding status transitions
export const isValidStatusTransition = (
  fromStatus: OnboardingStatus,
  toStatus: OnboardingStatus
): boolean => {
  const validTransitions: Record<OnboardingStatus, OnboardingStatus[]> = {
    [OnboardingStatus.PENDING_APPLICATION_REVIEW]: [
      OnboardingStatus.PENDING_ONBOARDING_CALL,
      OnboardingStatus.DENIED,
    ],
    [OnboardingStatus.PENDING_ONBOARDING_CALL]: [
      OnboardingStatus.AWAITING_FIRST_CUBE,
      OnboardingStatus.DENIED,
    ],
    [OnboardingStatus.AWAITING_FIRST_CUBE]: [
      OnboardingStatus.AWAITING_MASTERCLASS,
      OnboardingStatus.AWAITING_REVISION_CALL,
    ],
    [OnboardingStatus.AWAITING_MASTERCLASS]: [
      OnboardingStatus.AWAITING_REVISION_CALL,
    ],
    [OnboardingStatus.AWAITING_REVISION_CALL]: [OnboardingStatus.CONFIRMED],
    [OnboardingStatus.CONFIRMED]: [],
    [OnboardingStatus.COMPLETED]: [], // FIX: Added missing property
    [OnboardingStatus.DENIED]: [],
    [OnboardingStatus.INACTIVE]: [],
  };

  return validTransitions[fromStatus]?.includes(toStatus) ?? false;
};

// Helper function to validate onboarding state
export const validateOnboardingState = (
  user: User
): { isValid: boolean; issues: string[] } => {
  const issues: string[] = [];

  // Check for invalid status combinations
  if (
    user.onboardingStatus === OnboardingStatus.CONFIRMED &&
    !user.onboardingProgress?.watchedMasterclass
  ) {
    issues.push('Confirmed user has not watched masterclass');
  }

  if (
    user.onboardingStatus === OnboardingStatus.AWAITING_REVISION_CALL &&
    user.stats.cubesAttended === 0
  ) {
    issues.push('User awaiting revision call has not attended any cubes');
  }

  if (
    user.onboardingStatus === OnboardingStatus.AWAITING_MASTERCLASS &&
    user.onboardingProgress?.watchedMasterclass
  ) {
    issues.push('User awaiting masterclass has already watched it');
  }

  return { isValid: issues.length === 0, issues };
};

// Create a new user for registration
export const createNewUser = (formData: {
  name: string;
  instagram: string;
  chapter: string;
  email: string;
  answers: OnboardingAnswers;
}): User => {
  return {
    id: `user_${Date.now()}`,
    email: formData.email,
    name: formData.name,
    instagram: formData.instagram || undefined,
    chapters: [formData.chapter],
    onboardingAnswers: formData.answers,
    role: Role.APPLICANT,
    onboardingStatus: OnboardingStatus.PENDING_APPLICATION_REVIEW,
    stats: {
      totalHours: 0,
      cubesAttended: 0,
      veganConversions: 0,
      totalConversations: 0,
      cities: [],
    },
    profilePictureUrl: generateRandomAvatarUrl(100),
    badges: [],
    hostingAvailability: false,
    joinDate: new Date(),
    lastLogin: new Date(),
  };
};

// Handle notifications for new applications
export const handleNewApplicationNotifications = (
  newUser: User,
  users: User[]
): void => {
  // Find organizers of the chapter and notify them
  let organizersToNotify = users.filter(
    (u) =>
      u.role === Role.CHAPTER_ORGANISER &&
      u.organiserOf?.includes(newUser.chapters[0])
  );

  // **FIX: Application Black Hole Escalation Logic**
  if (organizersToNotify.length === 0) {
    const allChapters = useChaptersStore.getState().chapters;
    const chapterData = allChapters.find((c) => c.name === newUser.chapters[0]);
    if (chapterData) {
      // Escalate to Regional Organiser
      organizersToNotify = users.filter(
        (u) =>
          u.role === Role.REGIONAL_ORGANISER &&
          u.managedCountry === chapterData.country
      );
    }
  }

  if (organizersToNotify.length === 0) {
    // Escalate to Global Admins if no regional organizer is found
    organizersToNotify = users.filter((u) => u.role === Role.GLOBAL_ADMIN);
  }

  const notificationsToCreate = organizersToNotify.map((org) => ({
    userId: org.id,
    type: NotificationType.NEW_APPLICANT,
    message: `${newUser.name} has applied to join the ${newUser.chapters[0]} chapter.`,
    linkTo: '/manage',
    relatedUser: newUser,
  }));

  useNotificationsStore.getState().addNotifications(notificationsToCreate);

  // Add notification for the newly registered user
  useNotificationsStore.getState().addNotification({
    userId: newUser.id,
    type: NotificationType.NEW_ANNOUNCEMENT, // Using existing type for now
    message: `Welcome, ${newUser.name}! Your application for ${newUser.chapters[0]} has been submitted for review.`,
    linkTo: '/onboarding-status',
  });
};

// Auto-advance onboarding logic
export const autoAdvanceOnboarding = (user: User): OnboardingStatus | null => {
  if (
    user.onboardingStatus === OnboardingStatus.AWAITING_FIRST_CUBE &&
    user.stats.cubesAttended > 0
  ) {
    return OnboardingStatus.AWAITING_MASTERCLASS;
  }

  if (
    user.onboardingStatus === OnboardingStatus.AWAITING_MASTERCLASS &&
    user.onboardingProgress?.watchedMasterclass
  ) {
    return OnboardingStatus.AWAITING_REVISION_CALL;
  }

  return null;
};
