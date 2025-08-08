import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  type User,
  type CubeEvent,
  type EventReport,
  EventRole,
  EventStatus,
  ParticipantStatus,
} from '@/types';
import { processedEvents } from './initialData';

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
    updateData: Partial<Pick<CubeEvent, 'city' | 'location' | 'startDate' | 'endDate'>>
  ) => void;
  cancelEvent: (eventId: string, reason: string) => void;
  rsvp: (eventId: string, currentUser: User, isGuest: boolean) => void;
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

      updateEvent: (eventId, updateData) => {
        set((state) => ({
          events: state.events.map((e) => (e.id === eventId ? { ...e, ...updateData } : e)),
        }));
      },

      cancelEvent: (eventId, reason) => {
        set((state) => ({
          events: state.events.map((e) =>
            e.id === eventId ? { ...e, status: EventStatus.CANCELLED, cancellationReason: reason } : e
          ),
        }));
      },

      rsvp: (eventId, currentUser, isGuest) => {
        const status = isGuest ? ParticipantStatus.PENDING : ParticipantStatus.ATTENDING;
        set((state) => ({
          events: state.events.map((event) => {
            if (event.id !== eventId) return event;
            const idx = event.participants.findIndex((p) => p.user.id === currentUser.id);
            if (idx !== -1) {
              const participants = [...event.participants];
              participants[idx] = { ...participants[idx] };
              return { ...event, participants };
            }
            return {
              ...event,
              participants: [
                ...event.participants,
                { user: currentUser, eventRole: EventRole.ACTIVIST, status },
              ],
            };
          }),
        }));
      },

      cancelRsvp: (eventId, currentUser) => {
        set((state) => ({
          events: state.events.map((e) =>
            e.id === eventId ? { ...e, participants: e.participants.filter((p) => p.user.id !== currentUser.id) } : e
          ),
        }));
      },

      approveRsvp: (eventId, guestId) => {
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
      },

      denyRsvp: (eventId, guestId) => {
        set((state) => ({
          events: state.events.map((e) =>
            e.id === eventId ? { ...e, participants: e.participants.filter((p) => p.user.id !== guestId) } : e
          ),
        }));
      },

      removeParticipant: (eventId, participantUserId) => {
        set((state) => ({
          events: state.events.map((e) =>
            e.id === eventId
              ? {
                  ...e,
                  participants: e.participants.filter((p) => p.user.id !== participantUserId),
                }
              : e
          ),
        }));
      },

      logEventReport: (eventId, report) => {
        set((state) => ({
          events: state.events.map((e) => (e.id === eventId ? { ...e, report, status: EventStatus.FINISHED } : e)),
        }));
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


