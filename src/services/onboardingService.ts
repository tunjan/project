import { useChaptersStore } from '@/store/chapters.store';
import { useNotificationsStore } from '@/store/notifications.store';
import {
  NotificationType,
  type OnboardingAnswers,
  OnboardingStatus,
  Role,
  type User,
} from '@/types';

import { generateRandomAvatarUrl } from '../utils/user';

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
    [OnboardingStatus.COMPLETED]: [],
    [OnboardingStatus.DENIED]: [],
    [OnboardingStatus.INACTIVE]: [],
  };

  return validTransitions[fromStatus]?.includes(toStatus) ?? false;
};

export const validateOnboardingState = (
  user: User
): { isValid: boolean; issues: string[] } => {
  const issues: string[] = [];

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

export const handleNewApplicationNotifications = (
  newUser: User,
  users: User[]
): void => {
  let organizersToNotify = users.filter(
    (u) =>
      u.role === Role.CHAPTER_ORGANISER &&
      u.organiserOf?.includes(newUser.chapters[0])
  );

  if (organizersToNotify.length === 0) {
    const allChapters = useChaptersStore.getState().chapters;
    const chapterData = allChapters.find((c) => c.name === newUser.chapters[0]);
    if (chapterData) {
      organizersToNotify = users.filter(
        (u) =>
          u.role === Role.REGIONAL_ORGANISER &&
          u.managedCountry === chapterData.country
      );
    }
  }

  if (organizersToNotify.length === 0) {
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

  useNotificationsStore.getState().addNotification({
    userId: newUser.id,
    type: NotificationType.NEW_ANNOUNCEMENT,
    message: `Welcome, ${newUser.name}! Your application for ${newUser.chapters[0]} has been submitted for review.`,
    linkTo: '/onboarding-status',
  });
};

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

export const determineNextStatusAfterFirstCube = (
  user: User
): OnboardingStatus => {
  if (user.onboardingProgress?.watchedMasterclass) {
    return OnboardingStatus.AWAITING_REVISION_CALL;
  }

  return OnboardingStatus.AWAITING_MASTERCLASS;
};

export const finalizeOnboarding = (
  user: User
): { success: boolean; issues: string[] } => {
  if (user.onboardingStatus !== OnboardingStatus.AWAITING_REVISION_CALL) {
    return {
      success: false,
      issues: [`User cannot be finalized from status ${user.onboardingStatus}`],
    };
  }

  const validation = validateOnboardingState(user);
  if (!validation.isValid) {
    return {
      success: false,
      issues: validation.issues,
    };
  }

  return {
    success: true,
    issues: [],
  };
};
