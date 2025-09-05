import { Calendar, Clock, Users } from 'lucide-react';
import React from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { type CubeEvent, EventStatus } from '@/types';
import { formatDateSafe, safeParseDate } from '@/utils';

interface CubeCardProps {
  event: CubeEvent;
  onSelect: (event: CubeEvent) => void;
  isUserAffiliated?: boolean;
}

const CubeCard = ({ event, onSelect, isUserAffiliated }: CubeCardProps) => {
  const startDate = safeParseDate(event.startDate);

  const formattedDate = formatDateSafe(
    startDate,
    (d, o) => new Intl.DateTimeFormat(undefined, o).format(d),
    {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    }
  );

  const formattedTime = formatDateSafe(
    startDate,
    (d, o) => new Intl.DateTimeFormat(undefined, o).format(d),
    {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }
  );

  const handleSelect = () => {
    if (!isCancelled) {
      onSelect(event);
    }
  };

  const isCancelled = event.status === EventStatus.CANCELLED;
  const isFinished = event.status === EventStatus.FINISHED;

  const getStatusBadge = () => {
    if (isCancelled) {
      return (
        <Badge
          variant="destructive"
          className="border border-destructive-foreground/20 text-xs"
        >
          Cancelled
        </Badge>
      );
    }
    if (isFinished) {
      return (
        <Badge
          variant="secondary"
          className="border border-border text-xs backdrop-blur-sm"
        >
          Completed
        </Badge>
      );
    }
    return null;
  };

  return (
    <Card
      className={cn(
        'group relative w-full overflow-hidden transition-shadow duration-300 ease-out',
        !isCancelled && 'cursor-pointer hover:shadow-lg',
        isCancelled && 'cursor-not-allowed opacity-50'
      )}
      onClick={handleSelect}
    >
      {isUserAffiliated && (
        <span
          className="absolute right-3 top-3 block size-2 rounded-full bg-primary"
          aria-label="Affiliated event"
        />
      )}

      {/* Card header using shadcn components */}
      <CardHeader className="p-4">
        <CardTitle className="text-lg">{event.city}</CardTitle>
        <CardDescription className="mt-1 text-sm">
          {event.location}
        </CardDescription>
        <div className="mt-2">{getStatusBadge()}</div>
      </CardHeader>

      {/* Content Section */}
      <CardContent className="space-y-4 p-4">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="size-4" />
            <span className="font-medium">{formattedDate}</span>
          </div>
          {!event.endDate && (
            <div className="flex items-center gap-2">
              <Clock className="size-4" />
              <span className="font-medium">{formattedTime}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          {/* Organizer Info */}
          <div className="flex items-center gap-3">
            <Avatar className="size-9">
              <AvatarImage
                src={event.organizer.profilePictureUrl}
                alt={event.organizer.name}
                className="object-cover"
              />
              <AvatarFallback>{event.organizer.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-semibold text-foreground">
                {event.organizer.name}
              </p>
              <p className="text-xs text-muted-foreground">Organizer</p>
            </div>
          </div>

          {/* Participants */}
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-1.5">
              <Users className="size-4 text-muted-foreground" />
              <span className="text-base font-bold text-foreground">
                {event.participants.length}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">ATTENDING</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CubeCard;
