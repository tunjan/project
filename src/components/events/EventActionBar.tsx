import React from 'react';

import {
  CheckCircleIcon,
  ClipboardCheckIcon,
  LogoutIcon,
  PencilIcon,
  XCircleIcon,
} from '@/icons';
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
      <div className="card-brutal mb-6 flex items-center justify-center bg-danger p-4 text-center font-bold text-white">
        <XCircleIcon className="mr-2 size-6" />
        This event has been cancelled.
      </div>
    );
  }

  if (isPastEvent) {
    return (
      <div className="card-brutal mb-6 flex items-center justify-between bg-white p-4">
        <p className="font-bold text-black">This event has ended.</p>
        {canManageEvent && (
          <button onClick={onManageEvent} className="btn-primary">
            <ClipboardCheckIcon className="mr-2 size-5" />
            Log Event Report
          </button>
        )}
      </div>
    );
  }

  if (isAttending) {
    return (
      <div className="card-brutal mb-6 flex flex-col items-center justify-between gap-4 bg-primary-lightest p-4 sm:flex-row">
        <div className="flex items-center font-bold text-black">
          <CheckCircleIcon className="mr-2 size-6 text-success" />
          You are attending this event!
        </div>
        <div className="flex w-full gap-2 sm:w-auto">
          {isRegionalEvent && (
            <button onClick={onRsvp} className="btn-primary flex-1">
              <PencilIcon className="mr-2 size-4" /> Update Duties
            </button>
          )}
          <button
            onClick={onCancelRsvp}
            className="btn-outline flex items-center"
          >
            <LogoutIcon className="mr-2 size-4" /> Cancel RSVP
          </button>
        </div>
      </div>
    );
  }

  if (isPending) {
    return (
      <div className="card-brutal mb-6 flex flex-col items-center justify-between gap-4 bg-yellow-100 p-4 sm:flex-row">
        <p className="font-bold text-black">
          Your request to join is pending approval.
        </p>
        <button onClick={onCancelRsvp} className="btn-outline">
          Cancel Request
        </button>
      </div>
    );
  }

  // Default state: Can RSVP
  const rsvpText = isRegionalEvent
    ? 'Sign Up for Duties'
    : isGuest
      ? 'Request to Join'
      : 'RSVP to this Cube';

  return (
    <div className="space-y-4">
      <div className="card-brutal bg-white p-4">
        <button onClick={onRsvp} className="btn-primary w-full">
          {rsvpText}
        </button>
      </div>

      {/* Event Management Buttons */}
      {canEditEvent && (
        <button onClick={onEditEvent} className="btn-outline w-full">
          Edit Event
        </button>
      )}
      {canCancelEvent && (
        <button onClick={onCancelEvent} className="btn-danger w-full">
          Cancel Event
        </button>
      )}
    </div>
  );
};

export default EventActionBar;
