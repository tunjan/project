import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CubeEvent, TourDutyRole, User } from '@/types';
import { getDatesBetween } from '@/utils';

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
    <Card>
      <CardHeader>
        <CardTitle>Event Roster</CardTitle>
        <p className="text-sm text-muted-foreground">
          Daily breakdown of activist duties.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {eventDays.map((day) => {
          const dateString = new Date(day).toISOString().split('T')[0];
          const dailyRoster = rosterByDay[dateString];

          return (
            <Card key={dateString}>
              <CardContent className="p-4">
                <h3 className="mb-2 text-lg font-bold text-foreground">
                  {new Date(day).toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                  })}
                </h3>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {Object.entries(dailyRoster || {}).map(
                    ([role, assignedUsers]) => {
                      const usersForRole = assignedUsers as User[];
                      if (usersForRole.length === 0) return null;

                      return usersForRole.map((user) => (
                        <div key={`${role}-${user.id}`} className="text-center">
                          <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                            {role}
                          </p>
                          <Link to={`/members/${user.id}`} className="mt-1">
                            <div className="flex items-center space-x-1.5 rounded bg-background p-1 transition-colors hover:bg-accent">
                              <Avatar className="size-8">
                                <AvatarImage
                                  src={user.profilePictureUrl}
                                  alt={user.name}
                                  className="object-cover"
                                />
                                <AvatarFallback className="text-xs">
                                  {user.name
                                    .split(' ')
                                    .map((n: string) => n[0])
                                    .join('')}
                                </AvatarFallback>
                              </Avatar>
                              <div className="text-left">
                                <p className="text-sm font-medium text-foreground">
                                  {user.name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {user.email}
                                </p>
                              </div>
                            </div>
                          </Link>
                        </div>
                      ));
                    }
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default EventRoster;
