// Individual store exports with state, actions, and selectors
export * from './users.store';
export * from './events.store';
export * from './chapters.store';
export * from './announcements.store';
export * from './notifications.store';
export * from './outreach.store';
export * from './resources.store';
export * from './awards.store';
export * from './accommodations.store';
export * from './comments.store';
export * from './challenges.store';
export * from './inventory.store';
export * from './auth.store';

// Import action hooks for useAppActions
import { useUsersActions } from './users.store';
import { useEventsActions } from './events.store';
import { useChaptersActions } from './chapters.store';
import { useAnnouncementsActions } from './announcements.store';
import { useNotificationsActions } from './notifications.store';
import { useOutreachActions } from './outreach.store';
import { useAwardsActions } from './awards.store';
import { useAccommodationsActions } from './accommodations.store';
import { useCommentsActions } from './comments.store';

// Convenience re-exports for backward compatibility with appStore hooks
export { useUsersState as useUsers } from './users.store';
export { useEventsState as useEvents } from './events.store';
export { useChaptersState as useChapters } from './chapters.store';
export { useResourcesState as useResources } from './resources.store';
export { useOutreachLogs } from './outreach.store';
export { useEventCommentsState as useEventComments } from './comments.store';
export { useAccommodationsState as useAccommodationRequests } from './accommodations.store';
export { useChallengesState as useChallenges } from './challenges.store';
export { useNotificationsState as useNotifications } from './notifications.store';
export { useChapterJoinRequests, useChapterByName } from './chapters.store';
export { useBadgeAwardsForUser } from './awards.store';
export { useEventById } from './events.store';
export { useUserById, useUsersActions } from './users.store';
export { useNotificationsForUser, useUnreadNotificationCount } from './notifications.store';
export { useLogsForEvent } from './outreach.store';

// Combined actions hook for backward compatibility
export const useAppActions = () => {
    const usersActions = useUsersActions();
    const eventsActions = useEventsActions();
    const chaptersActions = useChaptersActions();
    const announcementsActions = useAnnouncementsActions();
    const notificationsActions = useNotificationsActions();
    const outreachActions = useOutreachActions();
    const awardsActions = useAwardsActions();
    const accommodationsActions = useAccommodationsActions();
    const commentsActions = useCommentsActions();

    return {
        ...usersActions,
        ...eventsActions,
        ...chaptersActions,
        ...announcementsActions,
        ...notificationsActions,
        ...outreachActions,
        ...awardsActions,
        ...accommodationsActions,
        ...commentsActions,
    };
};


