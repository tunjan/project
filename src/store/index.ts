// Individual store exports with state, actions, and selectors
export * from './accommodations.store';
export * from './announcements.store';
export * from './auth.store';
export * from './awards.store';
// export * from './challenges.store'; // Replaced with hook
export * from './chapters.store';
export * from './comments.store';
export * from './events.store';
export * from './inventory.store';
export * from './notifications.store';
export * from './outreach.store';
// export * from './resources.store'; // Replaced with hook
export * from './users.store';

// Import action hooks for useAppActions
import { useAccommodationsActions } from './accommodations.store';
import { useAnnouncementsActions } from './announcements.store';
import { useAwardsActions } from './awards.store';
import { useChaptersActions } from './chapters.store';
import { useCommentsActions } from './comments.store';
import { useEventsActions } from './events.store';
import { useNotificationsActions } from './notifications.store';
import { useOutreachActions } from './outreach.store';
import { useUsersActions } from './users.store';

// Convenience re-exports for backward compatibility with appStore hooks
export { useChallenges } from '../hooks/useChallenges';
export { useResources } from '../hooks/useResources';
export { useAccommodationsState as useAccommodationRequests } from './accommodations.store';
export { useBadgeAwardsForUser } from './awards.store';
export { useChaptersState as useChapters } from './chapters.store';
export { useChapterByName, useChapterJoinRequests } from './chapters.store';
export { useEventCommentsState as useEventComments } from './comments.store';
export { useEventsState as useEvents } from './events.store';
export { useEventById } from './events.store';
export { useNotificationsState as useNotifications } from './notifications.store';
export {
  useNotificationsForUser,
  useUnreadNotificationCount,
} from './notifications.store';
export { useOutreachLogs } from './outreach.store';
export { useLogsForEvent } from './outreach.store';
export { useUsersState as useUsers } from './users.store';
export { useUserById, useUsersActions } from './users.store';

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
