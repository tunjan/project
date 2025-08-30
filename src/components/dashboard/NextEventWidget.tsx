import { formatDistanceToNowStrict } from 'date-fns';
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { CalendarIcon, ClockIcon, MapPinIcon } from '@/icons';
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
  <div
    className={`card-brutal card-padding cursor-pointer hover:shadow-brutal-lg ${isNext ? 'bg-primary-lightest' : ''}`}
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
    {isNext && (
      <div className="mb-2 text-sm font-bold text-primary">
        NEXT EVENT <ClockIcon className="ml-1 inline-block size-4" />
      </div>
    )}
    <div className="flex justify-between">
      <div className="flex items-start gap-4">
        <CalendarIcon className="mt-1 size-6 shrink-0 text-primary" />
        <div>
          <h3 className="h-card">{event.location}</h3>
          <div className="text-grey-600 mt-1 flex flex-col gap-1 text-sm sm:gap-4">
            <span className="flex items-center gap-1">
              <ClockIcon className="size-4" />
              {new Date(event.startDate).toLocaleString([], {
                dateStyle: 'medium',
                timeStyle: 'short',
              })}
            </span>
            <span className="flex items-center gap-1">
              <MapPinIcon className="size-4" />
              {event.city}
            </span>
          </div>
          <div className="mt-4 text-sm text-black">
            {isNext ? (
              <Countdown date={new Date(event.startDate)} />
            ) : (
              `${event.participants.length} participants`
            )}
          </div>
        </div>
      </div>
    </div>
  </div>
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
      <p className="text-grey-600 p-4">
        No upcoming events you are organizing.
      </p>
    );
  }

  const [nextEvent, ...otherUpcomingEvents] = upcomingEvents;

  return (
    <div className="space-y-4">
      {nextEvent && (
        <UpcomingEventCard
          key={nextEvent.id}
          event={nextEvent}
          onManage={() => navigate(`/manage/event/${nextEvent.id}`)}
          isNext
        />
      )}
      {otherUpcomingEvents.length > 0 && (
        <div className="space-y-2 pt-2">
          <h4 className="text-grey-500 px-2 text-sm font-bold uppercase">
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
