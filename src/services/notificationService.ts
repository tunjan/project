import {
    type User,
    type CubeEvent,
    type Notification,
    Role,
    OnboardingStatus,
    NotificationType,
} from '@/types';
import { INACTIVITY_PERIOD_MONTHS } from '@/utils/user';

/**
 * Simulates a backend job to generate inactivity notifications for chapter organisers.
 *
 * @param allUsers - The complete list of users.
 * @param allEvents - The complete list of events.
 * @param existingNotifications - The current list of notifications to prevent duplicates.
 * @param currentUser - The organiser for whom to generate notifications.
 * @returns An array of new notification objects to be added to the store.
 */
export const generateInactivityNotifications = (
    allUsers: User[],
    allEvents: CubeEvent[],
    existingNotifications: Notification[],
    currentUser: User
): Omit<Notification, 'id' | 'createdAt' | 'isRead'>[] => {

    if (
        currentUser.role !== Role.CHAPTER_ORGANISER ||
        !currentUser.organiserOf?.length
    ) {
        return [];
    }

    const newNotifications: Omit<
        Notification,
        'id' | 'createdAt' | 'isRead'
    >[] = [];
    const inactivityCutoff = new Date();
    inactivityCutoff.setMonth(inactivityCutoff.getMonth() - INACTIVITY_PERIOD_MONTHS);

    const chaptersToManage = new Set(currentUser.organiserOf);

    const managedMembers = allUsers.filter(
        (user) =>
            user.id !== currentUser.id &&
            user.onboardingStatus === OnboardingStatus.CONFIRMED &&
            user.chapters.some((chapter) => chaptersToManage.has(chapter))
    );

    for (const member of managedMembers) {
        // Check both login and attendance activity (consistent with isUserInactive)
        const hasRecentLogin = member.lastLogin && new Date(member.lastLogin) > inactivityCutoff;

        const hasRecentAttendance = allEvents.some(
            (event) =>
                new Date(event.startDate) > inactivityCutoff &&
                event.report?.attendance[member.id] === 'Attended'
        );

        // User is inactive if both conditions are false (consistent with isUserInactive)
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