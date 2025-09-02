import React, { useMemo } from 'react';

import {
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  MapIcon,
  MinusIcon,
  UserGroupIcon,
  XCircleIcon,
} from '@/icons';
import { useEvents } from '@/store';
import { EventStatus, ParticipantStatus, type User } from '@/types';

interface EventParticipationHistoryProps {
  user: User;
}

const EventParticipationHistory: React.FC<EventParticipationHistoryProps> = ({
  user,
}) => {
  const allEvents = useEvents();

  const eventHistory = useMemo(() => {
    const userEvents = allEvents.filter(
      (event) =>
        event.participants.some((p) => p.user.id === user.id) ||
        event.organizer.id === user.id
    );

    return userEvents
      .map((event) => {
        const participation = event.participants.find(
          (p) => p.user.id === user.id
        );
        const isOrganizer = event.organizer.id === user.id;
        const status = isOrganizer
          ? 'Organizer'
          : participation?.status || 'Unknown';
        const attended = event.report?.attendance[user.id] === 'Attended';

        return {
          event,
          participation,
          isOrganizer,
          status,
          attended,
          role: isOrganizer
            ? 'Organizer'
            : participation?.tourDuties?.[0]?.role || 'Participant',
        };
      })
      .sort(
        (a, b) =>
          new Date(b.event.startDate).getTime() -
          new Date(a.event.startDate).getTime()
      );
  }, [user, allEvents]);

  const getStatusIcon = (status: string, attended?: boolean) => {
    if (status === 'Organizer') {
      return <UserGroupIcon className="size-5 text-primary" />;
    }
    if (attended) {
      return <CheckCircleIcon className="size-5 text-success" />;
    }
    if (status === ParticipantStatus.DECLINED) {
      return <XCircleIcon className="size-5 text-danger" />;
    }
    return <MinusIcon className="size-5 text-neutral-400" />;
  };

  const getStatusColor = (status: string, attended?: boolean) => {
    if (status === 'Organizer') return 'text-primary';
    if (attended) return 'text-success';
    if (status === ParticipantStatus.DECLINED) return 'text-danger';
    return 'text-neutral-500';
  };

  if (eventHistory.length === 0) {
    return (
      <div className="rounded-none border-black bg-white p-8 text-center shadow-brutal md:border-2">
        <div className="mx-auto mb-4 size-16 rounded-full bg-neutral-100 p-4">
          <CalendarIcon className="size-8 text-neutral-400" />
        </div>
        <h3 className="text-xl font-bold text-black">No Event History</h3>
        <p className="mt-2 text-neutral-600">
          This member hasn't participated in any events yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-4 text-xl font-bold text-black">
          Event Participation History
        </h3>
        <div className="space-y-4">
          {eventHistory.map(
            ({ event, participation, status, attended, role }) => (
              <div
                key={event.id}
                className="rounded-none border-black bg-white p-6 md:border-2"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="mb-3 flex items-center gap-3">
                      {getStatusIcon(status, attended)}
                      <div>
                        <h4 className="text-lg font-bold text-black">
                          {event.name}
                        </h4>
                        <div className="flex items-center gap-4 text-sm text-neutral-600">
                          <span className="flex items-center gap-1">
                            <MapIcon className="size-4" />
                            {event.city}, {event.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <CalendarIcon className="size-4" />
                            {new Date(event.startDate).toLocaleDateString()}
                          </span>
                          {event.report?.hours && (
                            <span className="flex items-center gap-1">
                              <ClockIcon className="size-4" />
                              {event.report.hours}h
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      <div>
                        <p className="text-sm font-bold text-neutral-600">
                          Role
                        </p>
                        <p
                          className={`font-semibold ${getStatusColor(status, attended)}`}
                        >
                          {role}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm font-bold text-neutral-600">
                          Status
                        </p>
                        <p
                          className={`font-semibold ${getStatusColor(status, attended)}`}
                        >
                          {status}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm font-bold text-neutral-600">
                          Event Status
                        </p>
                        <p
                          className={`font-semibold ${
                            event.status === EventStatus.FINISHED
                              ? 'text-success'
                              : event.status === EventStatus.UPCOMING
                                ? 'text-warning'
                                : event.status === EventStatus.ONGOING
                                  ? 'text-info'
                                  : 'text-neutral-500'
                          }`}
                        >
                          {event.status}
                        </p>
                      </div>
                    </div>

                    {/* Tour Duties */}
                    {participation?.tourDuties &&
                      participation.tourDuties.length > 0 && (
                        <div className="mt-4">
                          <p className="text-sm font-bold text-neutral-600">
                            Tour Duties
                          </p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {participation.tourDuties.map((duty, index) => (
                              <span
                                key={index}
                                className="rounded bg-neutral-100 px-2 py-1 text-xs font-medium text-neutral-700"
                              >
                                {duty.role} - {duty.date}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                    {/* Event Scope */}
                    <div className="mt-4">
                      <p className="text-sm font-bold text-neutral-600">
                        Event Scope
                      </p>
                      <p className="font-semibold text-black">{event.scope}</p>
                      {event.targetRegion && (
                        <p className="text-sm text-neutral-600">
                          Target: {event.targetRegion}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="rounded-none border-black bg-white p-6 md:border-2">
        <h4 className="mb-4 text-lg font-bold text-black">
          Participation Summary
        </h4>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-black">
              {eventHistory.length}
            </p>
            <p className="text-sm text-neutral-600">Total Events</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-success">
              {eventHistory.filter((e) => e.attended).length}
            </p>
            <p className="text-sm text-neutral-600">Attended</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">
              {eventHistory.filter((e) => e.isOrganizer).length}
            </p>
            <p className="text-sm text-neutral-600">Organized</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-warning">
              {
                eventHistory.filter(
                  (e) => e.event.status === EventStatus.UPCOMING
                ).length
              }
            </p>
            <p className="text-sm text-neutral-600">Upcoming</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventParticipationHistory;
