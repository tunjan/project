import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  type User,
  type CubeEvent,
  type EventReport,
  type TourDuty,
  EventRole,
  EventStatus,
  ParticipantStatus,
  NotificationType,
} from '@/types';
import { processedEvents } from './initialData';
import { useNotificationsStore } from './notifications.store';
import { useUsersStore } from './users.store';
import { toast } from 'sonner';

export interface EventsState {
  events: CubeEvent[];
}

export interface EventsActions {
  createEvent: (
    eventData: Omit<CubeEvent, 'id' | 'organizer' | 'participants' | 'status' | 'report'>,
    organizer: User
  ) => void;
  updateEvent: (
    eventId: string,
    updateData: Partial<Pick<CubeEvent, 'city' | 'location' | 'startDate' | 'endDate' | 'roleRequirements'>>,
    currentUser?: User
  ) => void;
  cancelEvent: (eventId: string, reason: string, currentUser: User) => void;
  rsvp: (eventId: string, currentUser: User, isGuest: boolean, duties?: TourDuty[], eventRole?: EventRole) => void;
  cancelRsvp: (eventId: string, currentUser: User) => void;
  approveRsvp: (eventId: string, guestId: string, currentUser: User) => void;
  denyRsvp: (eventId: string, guestId: string, currentUser: User) => void;
  removeParticipant: (eventId: string, participantUserId: string, currentUser: User) => void;
  logEventReport: (eventId: string, report: EventReport) => void;
}

export const useEventsStore = create<EventsState & EventsActions>()(
  persist(
    (set, get) => ({
      events: processedEvents,

      createEvent: (eventData, organizer) => {
        const newEvent: CubeEvent = {
          id: `event_${Date.now()}`,
          ...eventData,
          organizer,
          participants: [
            { user: organizer, eventRole: EventRole.ORGANIZER, status: ParticipantStatus.ATTENDING },
          ],
          status: EventStatus.UPCOMING,
        };
        set((state) => ({ events: [newEvent, ...state.events] }));
      },

      updateEvent: (eventId, updateData, currentUser) => {
        set((state) => ({
          events: state.events.map((e) => (e.id === eventId ? { ...e, ...updateData } : e)),
        }));

        const event = get().events.find((e) => e.id === eventId);
        if (!event || !currentUser) return;

        // Only send notifications for non-role requirement updates
        if (!updateData.roleRequirements) {
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
        }
      },

      cancelEvent: (eventId, reason, currentUser) => {
        set((state) => ({
          events: state.events.map((e) =>
            e.id === eventId ? { ...e, status: EventStatus.CANCELLED, cancellationReason: reason } : e
          ),
        }));

        const event = get().events.find((e) => e.id === eventId);
        if (!event) return;

        const notificationsToCreate = event.participants
          .filter((p) => p.user.id !== currentUser.id)
          .map((p) => ({
            userId: p.user.id,
            type: NotificationType.EVENT_CANCELLED,
            message: `The event "${event.location}" has been cancelled by the organizer. Reason: ${reason}`,
            linkTo: `/cubes/${event.id}`,
            relatedUser: currentUser,
          }));
        useNotificationsStore.getState().addNotifications(notificationsToCreate);
      },

      rsvp: (eventId, currentUser, isGuest, duties, eventRole) => {
        const status = isGuest ? ParticipantStatus.PENDING : ParticipantStatus.ATTENDING;
        const roleToUse = eventRole || EventRole.ACTIVIST;
        set((state) => ({
          events: state.events.map((event) => {
            if (event.id !== eventId) return event;
            const idx = event.participants.findIndex((p) => p.user.id === currentUser.id);
            if (idx !== -1) {
              const participants = [...event.participants];
              participants[idx] = { ...participants[idx], eventRole: roleToUse, tourDuties: duties };
              return { ...event, participants };
            }
            return {
              ...event,
              participants: [
                ...event.participants,
                { user: currentUser, eventRole: roleToUse, status, tourDuties: duties },
              ],
            };
          }),
        }));

        if (isGuest) {
          const event = get().events.find((e) => e.id === eventId);
          if (event) {
            useNotificationsStore.getState().addNotification({
              userId: event.organizer.id,
              type: NotificationType.RSVP_REQUEST,
              message: `${currentUser.name} has requested to join your event: "${event.location}".`,
              linkTo: `/cubes/${eventId}`,
              relatedUser: currentUser,
            });
          }
        }
      },

      cancelRsvp: (eventId, currentUser) => {
        set((state) => ({
          events: state.events.map((e) =>
            e.id === eventId ? { ...e, participants: e.participants.filter((p) => p.user.id !== currentUser.id) } : e
          ),
        }));
      },

      approveRsvp: (eventId, guestId, currentUser) => {
        const event = get().events.find((e) => e.id === eventId);
        if (!event || event.organizer.id !== currentUser.id) return;

        set((state) => ({
          events: state.events.map((e) => {
            if (e.id !== eventId) return e;
            return {
              ...e,
              participants: e.participants.map((p) =>
                p.user.id === guestId ? { ...p, status: ParticipantStatus.ATTENDING } : p
              ),
            };
          }),
        }));

        useNotificationsStore.getState().addNotification({
          userId: guestId,
          type: NotificationType.RSVP_APPROVED,
          message: `Your request to join "${event.location}" has been approved!`,
          linkTo: `/cubes/${eventId}`,
          relatedUser: currentUser,
        });
      },

      denyRsvp: (eventId, guestId, currentUser) => {
        const event = get().events.find((e) => e.id === eventId);
        if (!event || event.organizer.id !== currentUser.id) return;

        set((state) => ({
          events: state.events.map((e) =>
            e.id === eventId ? { ...e, participants: e.participants.filter((p) => p.user.id !== guestId) } : e
          ),
        }));

        useNotificationsStore.getState().addNotification({
          userId: guestId,
          type: NotificationType.RSVP_DENIED,
          message: `Your request to join "${event.location}" has been denied.`,
          linkTo: `/cubes/${eventId}`,
          relatedUser: currentUser,
        });
      },

      removeParticipant: (eventId, participantUserId, currentUser) => {
        set((state) => ({
          events: state.events.map((e) => {
            if (e.id === eventId) {
              if (e.organizer.id === participantUserId) {
                toast.error('The event organizer cannot be removed.');
                return e;
              }
              return {
                ...e,
                participants: e.participants.filter((p) => p.user.id !== participantUserId),
              };
            }
            return e;
          }),
        }));

        const event = get().events.find((e) => e.id === eventId);
        const removedUser = useUsersStore.getState().users.find((u) => u.id === participantUserId);
        if (event && removedUser) {
          useNotificationsStore.getState().addNotification({
            userId: participantUserId,
            type: NotificationType.EVENT_UPDATED,
            message: `You have been removed from the event "${event.location}" by the organizer.`,
            linkTo: `/cubes/${event.id}`,
            relatedUser: currentUser,
          });
          toast.warning(`${removedUser.name} has been removed from the event.`);
        }
      },

      logEventReport: (eventId, report) => {
        set((state) => {
          const event = state.events.find((e) => e.id === eventId);
          if (!event) return state;

          const updatedEvents = state.events.map((e) =>
            e.id === eventId ? { ...e, report, status: EventStatus.FINISHED } : e
          );

          // Update user stats based on attendance
          const usersStore = useUsersStore.getState();
          event.participants.forEach((participant) => {
            if (participant.status === ParticipantStatus.ATTENDING &&
              report.attendance[participant.user.id] === 'Attended') {
              const user = usersStore.users.find(u => u.id === participant.user.id);
              if (user) {
                const newCities = [...new Set([...user.stats.cities, event.city])];
                usersStore.updateProfile(user.id, {
                  stats: {
                    ...user.stats,
                    totalHours: user.stats.totalHours + report.hours,
                    cubesAttended: user.stats.cubesAttended + 1,
                    cities: newCities,
                  },
                });
              }
            }
          });

          return { events: updatedEvents };
        });
      },
    }),
    { name: 'events-store' }
  )
);

export const useEventsState = () => useEventsStore((s) => s.events);
export const useEventsActions = () =>
  useEventsStore((s) => ({
    createEvent: s.createEvent,
    updateEvent: s.updateEvent,
    cancelEvent: s.cancelEvent,
    rsvp: s.rsvp,
    cancelRsvp: s.cancelRsvp,
    approveRsvp: s.approveRsvp,
    denyRsvp: s.denyRsvp,
    removeParticipant: s.removeParticipant,
    logEventReport: s.logEventReport,
  }));

// Selectors
export const useEventById = (eventId?: string) =>
  useEventsStore((s) => s.events.find((e) => e.id === eventId));


