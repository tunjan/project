import {
  type CubeEvent,
  type Notification,
  NotificationType,
  OnboardingStatus,
  Role,
  type User,
} from '@/types';
import { INACTIVITY_PERIOD_MONTHS } from '@/utils';

export const generateInactivityNotifications = (
  allUsers: User[],
  allEvents: CubeEvent[],
  existingNotifications: Notification[],
  currentUser: User
): Omit<Notification, 'id' | 'createdAt' | 'isRead'>[] => {
  if (
    (currentUser.role !== Role.CHAPTER_ORGANISER &&
      currentUser.role !== Role.GLOBAL_ADMIN) ||
    !currentUser.organiserOf?.length
  ) {
    return [];
  }

  const newNotifications: Omit<Notification, 'id' | 'createdAt' | 'isRead'>[] =
    [];
  const inactivityCutoff = new Date();
  inactivityCutoff.setMonth(
    inactivityCutoff.getMonth() - INACTIVITY_PERIOD_MONTHS
  );

  const chaptersToManage = new Set(currentUser.organiserOf);

  const managedMembers = allUsers.filter(
    (user) =>
      user.id !== currentUser.id &&
      user.onboardingStatus === OnboardingStatus.CONFIRMED &&
      user.chapters.some((chapter) => chaptersToManage.has(chapter))
  );

  for (const member of managedMembers) {
    const hasRecentLogin =
      member.lastLogin && new Date(member.lastLogin) > inactivityCutoff;

    const hasRecentAttendance = allEvents.some(
      (event) =>
        new Date(event.startDate) > inactivityCutoff &&
        event.report?.attendance[member.id] === 'Attended'
    );

    const isInactive = !hasRecentLogin && !hasRecentAttendance;

    if (isInactive) {
      const alreadyNotified = existingNotifications.some(
        (n) =>
          n.type === NotificationType.INACTIVITY_ALERT &&
          n.userId === currentUser.id &&
          n.relatedUser?.id === member.id
      );

      if (!alreadyNotified) {
        newNotifications.push({
          userId: currentUser.id,
          type: NotificationType.INACTIVITY_ALERT,
          message: `${member.name} has not been active for over ${INACTIVITY_PERIOD_MONTHS} months. Consider reaching out.`,
          linkTo: `/manage/member/${member.id}`,
          relatedUser: member,
        });
      }
    }
  }

  return newNotifications;
};
