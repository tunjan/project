import { useUsersStore } from './users.store';
import { useNotificationsStore } from './notifications.store';
import { type User, type CubeEvent, NotificationType } from '@/types';

/**
 * Handles the logic for logging an event report, including updating user stats.
 * This function is designed to be called from the events store to avoid circular dependencies.
 * @param event - The event that has finished.
 * @param report - The event report containing attendance and hours.
 */
export const handleEventReportLogging = (
  event: CubeEvent,
  report: CubeEvent['report']
) => {
  // Prepare batch update for user stats
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
    // FIX: First update stats, then handle onboarding logic separately
    usersStore.batchUpdateUserStats(statsUpdates);

    // Check for users who just completed their first cube and advance their onboarding
    statsUpdates.forEach((update) => {
      if (update.newStats.cubesAttended === 1) {
        usersStore.advanceOnboardingAfterEvent(update.userId);
      }
    });
  }
};

/**
 * Creates and adds notifications for event updates.
 * @param event - The updated event.
 * @param currentUser - The user who initiated the update.
 */
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
