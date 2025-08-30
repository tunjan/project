import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';

import Avatar from '@/components/ui/Avatar';
import { CubeEvent, TourDutyRole, User } from '@/types';
import { getDatesBetween } from '@/utils/date';

interface EventRosterProps {
  event: CubeEvent;
}

const EventRoster: React.FC<EventRosterProps> = ({ event }) => {
  const eventDays = useMemo(() => {
    if (!event.endDate) return [];
    return getDatesBetween(event.startDate, event.endDate);
  }, [event.startDate, event.endDate]);

  const rosterByDay = useMemo(() => {
    const roster: Record<string, Record<TourDutyRole, User[]>> = {};

    for (const day of eventDays) {
      const dateString = new Date(day).toISOString().split('T')[0];
      roster[dateString] = Object.values(TourDutyRole).reduce(
        (acc, role) => {
          acc[role] = [];
          return acc;
        },
        {} as Record<TourDutyRole, User[]>
      );
    }

    for (const participant of event.participants) {
      if (participant.tourDuties) {
        for (const duty of participant.tourDuties) {
          if (roster[duty.date] && roster[duty.date][duty.role]) {
            roster[duty.date][duty.role].push(participant.user);
          }
        }
      }
    }
    return roster;
  }, [eventDays, event.participants]);

  if (!event.endDate || event.scope !== 'Regional') return null;

  return (
    <div className="border-2 border-black bg-white">
      <div className="border-b-2 border-black p-6">
        <h2 className="text-xl font-bold text-black">Event Roster</h2>
        <p className="text-sm text-neutral-600">
          Daily breakdown of activist duties.
        </p>
      </div>
      <div className="space-y-4 p-6">
        {eventDays.map((day) => {
          const dateString = new Date(day).toISOString().split('T')[0];
          const dailyRoster = rosterByDay[dateString];

          return (
            <div key={dateString} className="border-2 border-black p-4">
              <h3 className="font-bold">
                {new Date(day).toLocaleDateString(undefined, {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                })}
              </h3>
              <div className="mt-2 space-y-3">
                {Object.entries(dailyRoster).map(([role, users]) => (
                  <div key={role}>
                    <p className="text-sm font-semibold uppercase tracking-wider text-neutral-600">
                      {role} ({users.length})
                    </p>
                    {users.length > 0 ? (
                      <div className="mt-1 flex flex-wrap gap-2">
                        {users.map((user) => (
                          <Link
                            key={user.id}
                            to={`/members/${user.id}`}
                            className="rounded-nonenone flex items-center space-x-1.5 bg-white p-1 transition-colors hover:bg-white"
                          >
                            <Avatar
                              src={user.profilePictureUrl}
                              alt={user.name}
                              className="size-5 object-cover"
                            />
                            <span className="text-xs font-semibold">
                              {user.name}
                            </span>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-neutral-500">
                        No volunteers for this role.
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EventRoster;
