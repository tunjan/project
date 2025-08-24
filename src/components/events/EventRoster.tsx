import React, { useState, useMemo } from 'react';
import { EventRole, EventRoleRequirement, User, CubeEvent } from '@/types';
import { useUsers } from '@/store';
import { Badge } from '@/components/ui/Tag';
import { ClockIcon, UsersIcon } from '@/icons';
import { Link } from 'react-router-dom';

interface EventRosterProps {
  event: CubeEvent;
}

const getDatesBetween = (start: Date, end: Date): Date[] => {
  const dates = [];
  let currentDate = new Date(new Date(start).toISOString().split('T')[0]);
  const lastDate = new Date(new Date(end).toISOString().split('T')[0]);
  while (currentDate <= lastDate) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return dates;
};

const EventRoster: React.FC<EventRosterProps> = ({ event }) => {
  const eventDays = useMemo(() => {
    if (!event.endDate) return [];
    return getDatesBetween(event.startDate, event.endDate);
  }, [event.startDate, event.endDate]);

  const rosterByDay = useMemo(() => {
    const roster: Record<string, Record<EventRole, User[]>> = {};

    for (const day of eventDays) {
      const dateString = new Date(day).toISOString().split('T')[0];
      roster[dateString] = {
        [EventRole.OUTREACH]: [],
        [EventRole.EQUIPMENT]: [],
        [EventRole.TRANSPORT]: [],
      } as Record<EventRole, User[]>;
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
                    <p className="text-sm font-semibold uppercase tracking-wider text-neutral-500">
                      {role} ({users.length})
                    </p>
                    {users.length > 0 ? (
                      <div className="mt-1 flex flex-wrap gap-2">
                        {users.map((user) => (
                          <Link
                            key={user.id}
                            to={`/members/${user.id}`}
                            className="flex items-center space-x-1.5 rounded-none bg-neutral-100 p-1 transition-colors hover:bg-neutral-200"
                          >
                            <img
                              src={user.profilePictureUrl}
                              alt={user.name}
                              className="h-5 w-5 object-cover"
                            />
                            <span className="text-xs font-semibold">
                              {user.name}
                            </span>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-neutral-400">
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
