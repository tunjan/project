import React, { useState } from 'react';
import { type AccommodationRequest } from '@/types';
import { CheckCircleIcon, XCircleIcon } from '@/icons';
import { useCurrentUser } from '@/store/auth.store';
import { useAppActions } from '@/store/appStore';

interface RequestCardProps {
  request: AccommodationRequest;
}

const StatusBadge: React.FC<{ status: AccommodationRequest['status'] }> = ({
  status,
}) => {
  const styles = {
    Pending: 'bg-yellow-100 text-yellow-800',
    Accepted: 'bg-green-100 text-green-800',
    Denied: 'bg-red-100 text-red-800',
  };
  return (
    <span
      className={`rounded-none px-2 py-0.5 text-xs font-bold ${styles[status]}`}
    >
      {status.toUpperCase()}
    </span>
  );
};

const RequestCard: React.FC<RequestCardProps> = ({ request }) => {
  const currentUser = useCurrentUser();
  const { respondToAccommodationRequest } = useAppActions();

  const [reply, setReply] = useState('');

  if (!currentUser) return null;

  const isHostView = request.host.id === currentUser.id;
  const otherUser = isHostView ? request.requester : request.host;

  const handleRespond = (response: 'Accepted' | 'Denied') => {
    respondToAccommodationRequest(request.id, response, currentUser, reply);
  };

  const formatDateRange = (start: Date, end: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: 'numeric',
    };
    return `${start.toLocaleDateString(
      undefined,
      options
    )} - ${end.toLocaleDateString(undefined, options)}`;
  };

  return (
    <div className="border-2 border-black bg-white p-4">
      <div className="mb-3 flex flex-col justify-between border-b-2 border-black pb-3 sm:flex-row sm:items-center">
        <div className="mb-2 sm:mb-0">
          <p className="text-sm text-neutral-500">
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
          <p className="text-sm text-neutral-500">For Event</p>
          <p className="font-bold text-black">
            {request.event.location}, {request.event.city}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="md:col-span-2">
          <p className="mb-1 text-sm font-semibold text-black">Message:</p>
          <p className="border-2 border-black bg-white p-2 text-sm text-neutral-700">
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
            <p className="text-sm text-neutral-600">
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
            className="block w-full rounded-none border border-neutral-300 bg-white p-2 text-neutral-900 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 sm:text-sm"
          />
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleRespond('Denied')}
              className="flex w-full items-center justify-center bg-black px-3 py-2 text-sm font-semibold text-white hover:bg-neutral-800"
            >
              <XCircleIcon className="mr-1.5 h-5 w-5" /> Deny
            </button>
            <button
              onClick={() => handleRespond('Accepted')}
              className="flex w-full items-center justify-center bg-primary px-3 py-2 text-sm font-semibold text-white hover:bg-primary-hover"
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
