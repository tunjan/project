import {
  CheckCircle,
  ClipboardCheck,
  LogOut,
  Pencil,
  XCircle,
} from 'lucide-react';
import React from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CubeEvent, EventStatus } from '@/types';

interface EventActionBarProps {
  event: CubeEvent;
  isAttending: boolean;
  isPending: boolean;
  isGuest: boolean;
  isRegionalEvent: boolean;
  canManageEvent: boolean;
  canEditEvent: boolean;
  canCancelEvent: boolean;
  onRsvp: () => void;
  onCancelRsvp: () => void;
  onManageEvent: () => void;
  onEditEvent: () => void;
  onCancelEvent: () => void;
}

const EventActionBar: React.FC<EventActionBarProps> = ({
  event,
  isAttending,
  isPending,
  isGuest,
  isRegionalEvent,
  canManageEvent,
  canEditEvent,
  canCancelEvent,
  onRsvp,
  onCancelRsvp,
  onManageEvent,
  onEditEvent,
  onCancelEvent,
}) => {
  const isPastEvent = new Date(event.startDate) < new Date();
  const isCancelled = event.status === EventStatus.CANCELLED;

  if (isCancelled) {
    return (
      <Card className="mb-6 border-destructive bg-destructive/10">
        <CardContent className="flex items-center justify-center p-4 text-center">
          <XCircle className="mr-2 size-6 text-destructive" />
          <span className="font-semibold text-destructive">
            This event has been cancelled.
          </span>
        </CardContent>
      </Card>
    );
  }

  if (isPastEvent) {
    return (
      <Card className="mb-6">
        <CardContent className="flex items-center justify-between p-4">
          <p className="font-semibold">This event has ended.</p>
          {canManageEvent && (
            <Button onClick={onManageEvent}>
              <ClipboardCheck className="mr-2 size-4" />
              Log Event Report
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  if (isAttending) {
    return (
      <Card className="mb-6 border-primary bg-primary/10">
        <CardContent className="flex flex-col items-center justify-between gap-4 p-4 sm:flex-row">
          <div className="flex items-center font-semibold">
            <CheckCircle className="mr-2 size-6 text-primary" />
            You are attending this event!
          </div>
          <div className="flex w-full gap-2 sm:w-auto">
            {isRegionalEvent && (
              <Button onClick={onRsvp} className="flex-1">
                <Pencil className="mr-2 size-4" /> Update Duties
              </Button>
            )}
            <Button
              onClick={onCancelRsvp}
              variant="outline"
              className="flex items-center"
            >
              <LogOut className="mr-2 size-4" /> Cancel RSVP
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isPending) {
    return (
      <Card className="mb-6 border-warning bg-warning/10">
        <CardContent className="flex flex-col items-center justify-between gap-4 p-4 sm:flex-row">
          <p className="font-semibold">
            Your request to join is pending approval.
          </p>
          <Button onClick={onCancelRsvp} variant="outline">
            Cancel Request
          </Button>
        </CardContent>
      </Card>
    );
  }

  const rsvpText = isRegionalEvent
    ? 'Sign Up for Duties'
    : isGuest
      ? 'Request to Join'
      : 'RSVP to this Cube';

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4">
          <Button onClick={onRsvp} className="w-full">
            {rsvpText}
          </Button>
        </CardContent>
      </Card>

      {/* Event Management Buttons */}
      {canEditEvent && (
        <Button onClick={onEditEvent} variant="outline" className="w-full">
          Edit Event
        </Button>
      )}
      {canCancelEvent && (
        <Button
          onClick={onCancelEvent}
          variant="destructive"
          className="w-full"
        >
          Cancel Event
        </Button>
      )}
    </div>
  );
};

export default EventActionBar;
