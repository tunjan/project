import { Calendar, Clock, MapPin } from 'lucide-react';
import React from 'react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { CubeEvent, EventStatus } from '@/types';
import { formatDateSafe, safeParseDate } from '@/utils';

interface EventHeaderProps {
  event: CubeEvent;
}

const EventHeader: React.FC<EventHeaderProps> = ({ event }) => {
  const startDate = safeParseDate(event.startDate);
  const endDate = safeParseDate(event.endDate);

  const formattedDate = formatDateSafe(
    startDate,
    (d, o) => new Intl.DateTimeFormat(undefined, o).format(d),
    {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }
  );
  const formattedTime = formatDateSafe(
    startDate,
    (d, o) => new Intl.DateTimeFormat(undefined, o).format(d),
    {
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short',
    }
  );
  const formattedDateRange =
    startDate && endDate
      ? `${formatDateSafe(startDate, (d, o) => new Intl.DateTimeFormat(undefined, o).format(d), { dateStyle: 'full' })} to ${formatDateSafe(endDate, (d, o) => new Intl.DateTimeFormat(undefined, o).format(d), { dateStyle: 'full' })}`
      : formattedDate;

  return (
    <Card className="mb-6 overflow-hidden">
      <img
        src="/default-cube-image.svg"
        alt="Default cube event"
        className="h-48 w-full object-cover sm:h-64"
      />
      <CardContent className="p-6 md:p-8">
        {event.scope === 'Regional' && (
          <Badge variant="default" className="mb-2">
            {event.targetRegion} Regional Event
          </Badge>
        )}
        <div className="flex justify-between">
          <p className="font-semibold uppercase tracking-wide text-primary">
            <MapPin className="mr-1 inline-block size-4" />
            {event.city}
          </p>
          {event.status === EventStatus.FINISHED && (
            <Badge variant="default">FINISHED</Badge>
          )}
          {event.status === EventStatus.CANCELLED && (
            <Badge variant="destructive">CANCELLED</Badge>
          )}
        </div>
        <h1 className="mt-1 text-3xl font-extrabold text-foreground md:text-4xl">
          {event.location}
        </h1>

        <div className="mt-6 space-y-3 text-foreground">
          <div className="flex items-center gap-3">
            <Calendar className="size-6 shrink-0 text-muted-foreground" />
            <span className="font-semibold">{formattedDateRange}</span>
          </div>
          <div className="flex items-center gap-3">
            <Clock className="size-6 shrink-0 text-muted-foreground" />
            <span className="font-semibold">{formattedTime} (Start time)</span>
          </div>
        </div>

        <div className="mt-8 border-t border-border pt-6">
          <h3 className="mb-2 text-lg font-bold text-foreground">Organizer</h3>
          <div className="flex items-center">
            <img
              className="size-12 rounded-full object-cover"
              src={event.organizer.profilePictureUrl}
              alt={event.organizer.name}
            />
            <div className="ml-4">
              <p className="text-base font-semibold text-foreground">
                {event.organizer.name}
              </p>
              <p className="text-sm text-muted-foreground">
                {event.organizer.role}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EventHeader;
