import {
    type User,
    type CubeEvent,
    type Notification,
    Role,
    OnboardingStatus,
    NotificationType,
} from '@/types';

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
    const twoMonthsAgo = new Date();
    twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);

    const chaptersToManage = new Set(currentUser.organiserOf);


    const managedMembers = allUsers.filter(
        (user) =>
            user.id !== currentUser.id &&
            user.onboardingStatus === OnboardingStatus.CONFIRMED &&
            user.chapters.some((chapter) => chaptersToManage.has(chapter))
    );

    for (const member of managedMembers) {

        const attendedEvents = allEvents
            .filter((event) =>
                event.participants.some((p) => p.user.id === member.id)
            )
            .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());

        const lastAttendedDate =
            attendedEvents.length > 0 ? attendedEvents[0].startDate : null;
        let isInactive = false;

        if (lastAttendedDate) {

            if (new Date(lastAttendedDate) < twoMonthsAgo) {
                isInactive = true;
            }
        } else if (member.joinDate) {

            if (new Date(member.joinDate) < twoMonthsAgo) {
                isInactive = true;
            }
        }

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
                    message: `${member.name} has not attended an event in over two months. Consider reaching out.`,
                    linkTo: `/manage/member/${member.id}`,
                    relatedUser: member,
                });
            }
        }
    }

    return newNotifications;
};