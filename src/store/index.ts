import React from 'react';

export * from './accommodations.store';
export * from './announcements.store';
export * from './auth.store';
export * from './awards.store';
export * from './chapters.store';
export * from './comments.store';
export * from './events.store';
export * from './inventory.store';
export * from './notifications.store';
export * from './outreach.store';
export * from './users.store';

import { useAccommodationsActions } from './accommodations.store';
import { useAnnouncementsActions } from './announcements.store';
import { useAwardsActions } from './awards.store';
import { useChaptersActions } from './chapters.store';
import { useCommentsActions } from './comments.store';
import { useEventsActions } from './events.store';
import { useNotificationsActions } from './notifications.store';
import { useOutreachActions } from './outreach.store';
import { useUsersActions } from './users.store';

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
export { useNotificationsForUser } from './notifications.store';
export { useOutreachLogs } from './outreach.store';
export { useLogsForEvent } from './outreach.store';
export { useUsersState as useUsers } from './users.store';
export { useUserById, useUsersActions } from './users.store';

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

  return React.useMemo(
    () => ({
      ...usersActions,
      ...eventsActions,
      ...chaptersActions,
      ...announcementsActions,
      ...notificationsActions,
      ...outreachActions,
      ...awardsActions,
      ...accommodationsActions,
      ...commentsActions,
    }),
    [
      usersActions,
      eventsActions,
      chaptersActions,
      announcementsActions,
      notificationsActions,
      outreachActions,
      awardsActions,
      accommodationsActions,
      commentsActions,
    ]
  );
};
