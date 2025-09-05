import { formatDistanceToNowStrict } from 'date-fns';
import { Calendar, Clock, MapPin } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useCurrentUser, useEvents } from '@/store';
import { CubeEvent, EventStatus } from '@/types';

const Countdown: React.FC<{ date: Date }> = ({ date }) => {
  const [countdown, setCountdown] = useState('');

  useEffect(() => {
    const calculateCountdown = () => {
      const distance = formatDistanceToNowStrict(date, { addSuffix: true });
      setCountdown(distance);
    };

    // Calculate immediately
    calculateCountdown();

    // Set up interval
    const interval = setInterval(calculateCountdown, 1000 * 60); // Update every minute

    // CRITICAL FIX: Ensure interval is cleared on cleanup or when date changes
    return () => {
      clearInterval(interval);
    };
  }, [date]); // date dependency ensures effect runs when date changes

  return <span className="font-bold text-primary">{countdown}</span>;
};

const UpcomingEventCard: React.FC<{
  event: CubeEvent;
  onManage: () => void;
  isNext?: boolean;
}> = ({ event, onManage, isNext }) => (
  <Card
    className={`cursor-pointer hover:border-primary ${isNext ? 'border-primary bg-primary/10' : ''}`}
    onClick={onManage}
    onKeyDown={(e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onManage();
      }
    }}
    role="button"
    tabIndex={0}
    aria-label={`Manage event: ${event.location} in ${event.city}`}
  >
    <CardHeader className="flex-row items-start gap-4 space-y-0">
      <Calendar className="mt-1 size-6 shrink-0 text-primary" />
      <div className="flex-1">
        <CardTitle>{event.location}</CardTitle>
        <CardDescription className="mt-1 flex flex-col gap-1 text-sm sm:flex-row sm:gap-4">
          <span className="flex items-center gap-1">
            <Clock className="size-4" />
            {new Date(event.startDate).toLocaleString([], {
              dateStyle: 'medium',
              timeStyle: 'short',
            })}
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="size-4" />
            {event.city}
          </span>
        </CardDescription>
      </div>
    </CardHeader>
    <CardContent>
      <div className="text-sm">
        {isNext ? (
          <Countdown date={new Date(event.startDate)} />
        ) : (
          `${event.participants.length} participants`
        )}
      </div>
    </CardContent>
  </Card>
);

const NextEventWidget: React.FC = () => {
  const navigate = useNavigate();
  const currentUser = useCurrentUser();
  const allEvents = useEvents();

  const upcomingEvents = useMemo(() => {
    if (!currentUser) return [];
    const now = new Date();
    return allEvents
      .filter(
        (event) =>
          event.organizer.id === currentUser.id &&
          event.status === EventStatus.UPCOMING &&
          new Date(event.startDate) > now
      )
      .sort(
        (a, b) =>
          new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
      );
  }, [allEvents, currentUser]);

  if (!currentUser || upcomingEvents.length === 0) {
    return (
      <p className="p-4 text-muted-foreground">
        No upcoming events you are organizing.
      </p>
    );
  }

  const [nextEvent, ...otherUpcomingEvents] = upcomingEvents;

  return (
    <div className="space-y-4">
      {nextEvent && (
        <div className="relative">
          <div className="absolute -top-2 right-4 z-10 rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground">
            NEXT EVENT
          </div>
          <UpcomingEventCard
            key={nextEvent.id}
            event={nextEvent}
            onManage={() => navigate(`/manage/event/${nextEvent.id}`)}
            isNext
          />
        </div>
      )}
      {otherUpcomingEvents.length > 0 && (
        <div className="space-y-2 pt-2">
          <h4 className="px-2 text-sm font-bold uppercase text-muted-foreground">
            Later Events
          </h4>
          {otherUpcomingEvents.map((event) => (
            <UpcomingEventCard
              key={event.id}
              event={event}
              onManage={() => navigate(`/manage/event/${event.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default NextEventWidget;
