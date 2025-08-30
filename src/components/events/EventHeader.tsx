import React from 'react';

import { CalendarIcon, ClockIcon, MapPinIcon } from '@/icons';
import { CubeEvent, EventStatus } from '@/types';
import { safeFormatDate, safeParseDate } from '@/utils/date';

interface EventHeaderProps {
  event: CubeEvent;
}

const EventHeader: React.FC<EventHeaderProps> = ({ event }) => {
  const startDate = safeParseDate(event.startDate);
  const endDate = safeParseDate(event.endDate);

  const formattedDate = safeFormatDate(startDate, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
  const formattedTime = safeFormatDate(startDate, {
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  });
  const formattedDateRange =
    startDate && endDate
      ? `${safeFormatDate(startDate, { dateStyle: 'full' })} to ${safeFormatDate(endDate, { dateStyle: 'full' })}`
      : formattedDate;

  return (
    <div className="card-brutal mb-6 overflow-hidden">
      <img
        src="/default-cube-image.svg"
        alt="Default cube event"
        className="h-48 w-full object-cover sm:h-64"
      />
      <div className="p-6 md:p-8">
        {event.scope === 'Regional' && (
          <div className="tag-brutal mb-2 inline-block bg-black text-white">
            {event.targetRegion} Regional Event
          </div>
        )}
        <div className="flex justify-between">
          <p className="font-semibold uppercase tracking-wide text-primary">
            <MapPinIcon className="mr-1 inline-block size-4" />
            {event.city}
          </p>
          {event.status === EventStatus.FINISHED && (
            <span className="tag-brutal bg-black text-white">FINISHED</span>
          )}
          {event.status === EventStatus.CANCELLED && (
            <span className="tag-brutal bg-danger text-white">CANCELLED</span>
          )}
        </div>
        <h1 className="mt-1 text-3xl font-extrabold text-black md:text-4xl">
          {event.location}
        </h1>

        <div className="mt-6 space-y-3 text-black">
          <div className="flex items-center gap-3">
            <CalendarIcon className="size-6 shrink-0 text-neutral-500" />
            <span className="font-semibold">{formattedDateRange}</span>
          </div>
          <div className="flex items-center gap-3">
            <ClockIcon className="size-6 shrink-0 text-neutral-500" />
            <span className="font-semibold">{formattedTime} (Start time)</span>
          </div>
        </div>

        <div className="mt-8 border-t border-neutral-200 pt-6">
          <h3 className="mb-2 text-lg font-bold text-black">Organizer</h3>
          <div className="flex items-center">
            <img
              className="size-12 object-cover"
              src={event.organizer.profilePictureUrl}
              alt={event.organizer.name}
            />
            <div className="ml-4">
              <p className="text-base font-semibold text-black">
                {event.organizer.name}
              </p>
              <p className="text-sm text-neutral-500">{event.organizer.role}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventHeader;
