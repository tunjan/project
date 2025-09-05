import {
  Calendar,
  CheckCircle,
  Clock,
  Map,
  Minus,
  Users,
  XCircle,
} from 'lucide-react';
import React, { useMemo } from 'react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
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
      return <Users className="size-5 text-primary" />;
    }
    if (attended) {
      return <CheckCircle className="size-5 text-primary" />;
    }
    if (status === ParticipantStatus.DECLINED) {
      return <XCircle className="size-5 text-destructive" />;
    }
    return <Minus className="size-5 text-muted-foreground" />;
  };

  const getStatusColor = (status: string, attended?: boolean) => {
    if (status === 'Organizer') return 'text-primary';
    if (attended) return 'text-primary';
    if (status === ParticipantStatus.DECLINED) return 'text-destructive';
    return 'text-muted-foreground';
  };

  if (eventHistory.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="mx-auto mb-4 size-16 rounded-full bg-muted p-4">
            <Calendar className="size-8 text-muted-foreground" />
          </div>
          <CardTitle>No Event History</CardTitle>
          <p className="mt-2 text-muted-foreground">
            This member hasn't participated in any events yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Event Participation History</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {eventHistory.map(
            ({ event, participation, status, attended, role }) => (
              <Card key={event.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="mb-3 flex items-center gap-3">
                        {getStatusIcon(status, attended)}
                        <div>
                          <h4 className="text-lg font-bold">{event.name}</h4>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Map className="size-4" />
                              {event.city}, {event.location}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="size-4" />
                              {new Date(event.startDate).toLocaleDateString()}
                            </span>
                            {event.report?.hours && (
                              <span className="flex items-center gap-1">
                                <Clock className="size-4" />
                                {event.report.hours}h
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <div>
                          <Label className="text-sm font-bold">Role</Label>
                          <p
                            className={`font-semibold ${getStatusColor(status, attended)}`}
                          >
                            {role}
                          </p>
                        </div>

                        <div>
                          <Label className="text-sm font-bold">Status</Label>
                          <p
                            className={`font-semibold ${getStatusColor(status, attended)}`}
                          >
                            {status}
                          </p>
                        </div>

                        <div>
                          <Label className="text-sm font-bold">
                            Event Status
                          </Label>
                          <p
                            className={`font-semibold ${
                              event.status === EventStatus.FINISHED
                                ? 'text-primary'
                                : event.status === EventStatus.UPCOMING
                                  ? 'text-warning'
                                  : event.status === EventStatus.ONGOING
                                    ? 'text-primary'
                                    : 'text-muted-foreground'
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
                            <Label className="text-sm font-bold">
                              Tour Duties
                            </Label>
                            <div className="mt-2 flex flex-wrap gap-2">
                              {participation.tourDuties.map((duty, index) => (
                                <Badge key={index} variant="secondary">
                                  {duty.role} - {duty.date}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                      {/* Event Scope */}
                      <div className="mt-4">
                        <Label className="text-sm font-bold">Event Scope</Label>
                        <p className="font-semibold">{event.scope}</p>
                        {event.targetRegion && (
                          <p className="text-sm text-muted-foreground">
                            Target: {event.targetRegion}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          )}
        </CardContent>
      </Card>

      {/* Summary Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Participation Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{eventHistory.length}</p>
              <p className="text-sm text-muted-foreground">Total Events</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">
                {eventHistory.filter((e) => e.attended).length}
              </p>
              <p className="text-sm text-muted-foreground">Attended</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">
                {eventHistory.filter((e) => e.isOrganizer).length}
              </p>
              <p className="text-sm text-muted-foreground">Organized</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-warning">
                {
                  eventHistory.filter(
                    (e) => e.event.status === EventStatus.UPCOMING
                  ).length
                }
              </p>
              <p className="text-sm text-muted-foreground">Upcoming</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EventParticipationHistory;
