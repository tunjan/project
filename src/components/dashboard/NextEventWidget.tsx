import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCurrentUser, useEvents } from '@/store';
import { CubeEvent, EventStatus } from '@/types';
import { formatDistanceToNowStrict } from 'date-fns';
import { CalendarIcon, ClockIcon, MapPinIcon } from '@/icons';

const Countdown: React.FC<{ date: Date }> = ({ date }) => {
  const [countdown, setCountdown] = useState('');

  useEffect(() => {
    const calculateCountdown = () => {
      const distance = formatDistanceToNowStrict(date, { addSuffix: true });
      setCountdown(distance);
    };

    calculateCountdown();
    const interval = setInterval(calculateCountdown, 1000 * 60); // Update every minute

    return () => clearInterval(interval);
  }, [date]);

  return <span className="font-bold text-primary">{countdown}</span>;
};

const UpcomingEventCard: React.FC<{ event: CubeEvent; onManage: () => void; isNext?: boolean }> = ({ event, onManage, isNext }) => (
  <div className={`card-brutal card-padding ${isNext ? 'bg-primary-lightest' : ''}`}>
    {isNext && (
        <div className="mb-2 text-sm font-bold text-primary">
          NEXT EVENT <ClockIcon className="inline-block h-4 w-4 ml-1"/>
        </div>
    )}
    <div className="flex items-start justify-between">
      <div className="flex items-start gap-4">
        <CalendarIcon className="mt-1 h-6 w-6 flex-shrink-0 text-primary" />
        <div>
          <h3 className="h-card">{event.location}</h3>
          <div className="text-grey-600 mt-1 flex flex-col gap-1 text-sm sm:flex-row sm:gap-4">
            <span className="flex items-center gap-1">
              <ClockIcon className="h-4 w-4" />
              {new Date(event.startDate).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
            </span>
            <span className="flex items-center gap-1">
              <MapPinIcon className="h-4 w-4" />
              {event.city}
            </span>
          </div>
          <div className="mt-2 text-sm text-black">
            {isNext ? <Countdown date={new Date(event.startDate)} /> : `${event.participants.length} participants`}
          </div>
        </div>
      </div>
      <button onClick={onManage} className="btn-primary btn-sm self-center">
        Manage
      </button>
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
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  }, [allEvents, currentUser]);

  if (!currentUser || upcomingEvents.length === 0) {
    return <p className="text-grey-600 p-4">No upcoming events you are organizing.</p>;
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
            <h4 className="font-bold text-sm text-grey-500 uppercase px-2">Later Events</h4>
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
