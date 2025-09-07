import { formatDistanceToNowStrict } from 'date-fns';
import { Calendar, Clock, MapPin } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useCurrentUser, useEvents } from '@/store';
import { CubeEvent, EventStatus } from '@/types';

const Countdown: React.FC<{ date: Date }> = ({ date }) => {
  const [countdown, setCountdown] = useState(() =>
    formatDistanceToNowStrict(date, { addSuffix: true })
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(formatDistanceToNowStrict(date, { addSuffix: true }));
    }, 1000 * 60); // Update every minute
    return () => clearInterval(interval);
  }, [date]);

  return <span className="font-bold text-primary">{countdown}</span>;
};

const UpcomingEventCard: React.FC<{
  event: CubeEvent;
  onManage: () => void;
  isNext?: boolean;
}> = ({ event, onManage, isNext }) => {
  const startDate = new Date(event.startDate);

  if (isNext) {
    return (
      <div
        className="group relative cursor-pointer overflow-hidden rounded-lg border border-primary/30 bg-card p-4 transition-all duration-200 hover:border-primary/50 hover:shadow-lg"
        onClick={onManage}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onManage();
          }
        }}
        role="button"
        tabIndex={0}
        aria-label={`Manage next event: ${event.location} in ${event.city}`}
      >
        {/* Next Event Badge */}
        <div className="absolute right-3 top-3 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
          NEXT EVENT
        </div>

        <div className="space-y-3">
          {/* Event Title */}
          <div>
            <h3 className="line-clamp-1 text-lg font-semibold text-foreground">
              {event.location}
            </h3>
          </div>

          {/* Event Details */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="size-4 shrink-0" />
              <span>
                {startDate.toLocaleDateString([], {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}{' '}
                at{' '}
                {startDate.toLocaleTimeString([], {
                  hour: 'numeric',
                  minute: '2-digit',
                })}
              </span>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="size-4 shrink-0" />
              <span>{event.city}</span>
            </div>
          </div>

          {/* Countdown */}
          <div className="flex items-center gap-2 border-t border-border pt-2">
            <Calendar className="size-4 text-primary" />
            <span className="text-sm font-medium text-primary">
              {/* Pass the memoized startDate object */}
              <Countdown date={startDate} />
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="group cursor-pointer rounded-lg border border-border bg-card p-4 transition-all duration-200 hover:border-primary/30 hover:bg-accent/30 hover:shadow-md"
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
      <div className="flex items-start gap-3">
        <div className="shrink-0 rounded-full bg-primary/10 p-2">
          <Calendar className="size-4 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="mb-2 line-clamp-1 font-semibold text-foreground">
            {event.location}
          </h4>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="size-3 shrink-0" />
              <span>
                {startDate.toLocaleDateString([], {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                })}{' '}
                at{' '}
                {startDate.toLocaleTimeString([], {
                  hour: 'numeric',
                  minute: '2-digit',
                })}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="size-3 shrink-0" />
              <span>{event.city}</span>
            </div>
            <div className="flex items-center gap-2 pt-1 text-xs text-muted-foreground/80">
              <div className="size-2 rounded-full bg-green-500"></div>
              <span>{event.participants.length} participants</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

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
      <div className="flex flex-col items-center justify-center px-4 py-8 text-center">
        <div className="mb-3 rounded-full bg-muted p-3">
          <Calendar className="size-6 text-muted-foreground" />
        </div>
        <h3 className="mb-1 font-medium text-foreground">No upcoming events</h3>
        <p className="text-sm text-muted-foreground">
          You don't have any events scheduled as an organizer.
        </p>
      </div>
    );
  }

  const [nextEvent, ...otherUpcomingEvents] = upcomingEvents;

  return (
    <div className="space-y-4">
      {/* Next Event - Featured */}
      {nextEvent && (
        <UpcomingEventCard
          event={nextEvent}
          onManage={() => navigate(`/manage/event/${nextEvent.id}`)}
          isNext
        />
      )}

      {/* Other Upcoming Events */}
      {otherUpcomingEvents.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Later Events
            </span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <div className="space-y-2">
            {otherUpcomingEvents.slice(0, 3).map((event) => (
              <UpcomingEventCard
                key={event.id}
                event={event}
                onManage={() => navigate(`/manage/event/${event.id}`)}
              />
            ))}

            {otherUpcomingEvents.length > 3 && (
              <div className="pt-2 text-center">
                <button
                  className="text-xs text-muted-foreground transition-colors hover:text-foreground"
                  onClick={() => navigate('/events')}
                >
                  +{otherUpcomingEvents.length - 3} more events
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NextEventWidget;
