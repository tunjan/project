import React, { useState } from 'react';
import { type AccommodationRequest } from '@/types';
import { CheckCircleIcon, XCircleIcon } from '@/icons';
import { useCurrentUser } from '@/store/auth.store';
import { useAccommodationsActions } from '@/store';
import { safeParseDate, safeFormatLocaleDate } from '@/utils/date';
import Tag from '@/components/ui/Tag';

interface RequestCardProps {
  request: AccommodationRequest;
}

const StatusBadge: React.FC<{ status: AccommodationRequest['status'] }> = ({
  status,
}) => {
  const variantMap = {
    Pending: 'warning' as const,
    Accepted: 'success' as const,
    Denied: 'danger' as const,
  };

  return (
    <Tag variant={variantMap[status]} size="sm">
      {status.toUpperCase()}
    </Tag>
  );
};

const RequestCard: React.FC<RequestCardProps> = ({ request }) => {
  const currentUser = useCurrentUser();
  const { respondToAccommodationRequest } = useAccommodationsActions();

  const [reply, setReply] = useState('');

  if (!currentUser) return null;

  const isHostView = request.host.id === currentUser.id;
  const otherUser = isHostView ? request.requester : request.host;

  const handleRespond = (response: 'Accepted' | 'Denied') => {
    respondToAccommodationRequest(request.id, response, currentUser, reply);
  };

  const formatDateRange = (start: Date, end: Date) => {
    const startDate = safeParseDate(start);
    const endDate = safeParseDate(end);

    if (!startDate || !endDate) {
      return 'Invalid dates';
    }

    const options: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: 'numeric',
    };
    return `${safeFormatLocaleDate(startDate, options)} - ${safeFormatLocaleDate(endDate, options)}`;
  };

  return (
    <div className="border-2 border-black bg-white p-4">
      <div className="mb-3 flex flex-col justify-between border-b-2 border-black pb-3 sm:flex-row sm:items-center">
        <div className="mb-2 sm:mb-0">
          <p className="text-sm text-white">
            {isHostView ? 'Request From' : 'Request To'}
          </p>
          <div className="flex items-center space-x-2">
            <img
              src={otherUser.profilePictureUrl}
              alt={otherUser.name}
              className="h-8 w-8 object-cover"
            />
            <p className="font-bold text-black">{otherUser.name}</p>
          </div>
        </div>
        <div className="text-left sm:text-right">
          <p className="text-sm text-white">For Event</p>
          <p className="font-bold text-black">
            {request.event.location}, {request.event.city}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="md:col-span-2">
          <p className="mb-1 text-sm font-semibold text-black">Message:</p>
          <p className="border-2 border-black bg-white p-2 text-sm text-black">
            {request.message}
          </p>

          {request.hostReply && (
            <div className="mt-2">
              <p className="mb-1 text-sm font-semibold text-black">
                Host's Reply:
              </p>
              <p className="border-2 border-primary bg-primary/10 p-2 text-sm text-black">
                {request.hostReply}
              </p>
            </div>
          )}
        </div>
        <div className="space-y-3">
          <div>
            <p className="text-sm font-semibold text-black">Dates</p>
            <p className="text-sm text-red">
              {formatDateRange(request.startDate, request.endDate)}
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold text-black">Status</p>
            <StatusBadge status={request.status} />
          </div>
        </div>
      </div>

      {isHostView && request.status === 'Pending' && (
        <div className="mt-4 space-y-3 border-t-2 border-black pt-4">
          <textarea
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            placeholder="Optional: Reply with a message..."
            rows={2}
            className="block w-full border-2 border-black bg-white p-2 text-black placeholder:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 sm:text-sm"
          />
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleRespond('Denied')}
              className="btn-secondary flex w-full items-center justify-center"
            >
              <XCircleIcon className="mr-1.5 h-5 w-5" /> Deny
            </button>
            <button
              onClick={() => handleRespond('Accepted')}
              className="btn-primary flex w-full items-center justify-center"
            >
              <CheckCircleIcon className="mr-1.5 h-5 w-5" /> Accept
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RequestCard;
