import {
  type CubeEvent,
  EventReport,
  NotificationType,
  type User,
} from '@/types';

import { useNotificationsStore } from './notifications.store';
import { useUsersStore } from './users.store';

export const handleEventReportLogging = (
  event: CubeEvent,
  report?: EventReport
) => {
  const usersStore = useUsersStore.getState();
  const statsUpdates: { userId: string; newStats: Partial<User['stats']> }[] =
    [];

  event.participants.forEach((participant) => {
    if (report?.attendance[participant.user.id] === 'Attended') {
      const user = usersStore.users.find((u) => u.id === participant.user.id);
      if (user && user.stats) {
        const newCities = [...new Set([...user.stats.cities, event.city])];
        statsUpdates.push({
          userId: user.id,
          newStats: {
            totalHours: user.stats.totalHours + (report.hours || 0),
            cubesAttended: user.stats.cubesAttended + 1,
            cities: newCities,
          },
        });
      }
    }
  });

  if (statsUpdates.length > 0) {
    usersStore.batchUpdateUserStats(statsUpdates);

    statsUpdates.forEach((update) => {
      if (update.newStats.cubesAttended === 1) {
        usersStore.advanceOnboardingAfterEvent(update.userId);
      }
    });
  }

  const notificationsStore = useNotificationsStore.getState();
  const notificationsToCreate = [];

  if (report) {
    for (const participant of event.participants) {
      if (report.attendance[participant.user.id] === 'Attended') {
        notificationsToCreate.push({
          userId: participant.user.id,
          type: NotificationType.STATS_UPDATED,
          message: `Your stats have been updated from the event: "${event.location}".`,
          linkTo: `/members/${participant.user.id}`,
          relatedUser: event.organizer,
        });
      }
    }
  }

  if (notificationsToCreate.length > 0) {
    notificationsStore.addNotifications(notificationsToCreate);
  }
};

export const notifyEventUpdate = (event: CubeEvent, currentUser: User) => {
  const notificationsToCreate = event.participants
    .filter((p) => p.user.id !== currentUser.id)
    .map((p) => ({
      userId: p.user.id,
      type: NotificationType.EVENT_UPDATED,
      message: `Details for the event "${event.location}" have been updated by the organizer.`,
      linkTo: `/cubes/${event.id}`,
      relatedUser: currentUser,
    }));
  useNotificationsStore.getState().addNotifications(notificationsToCreate);
};
