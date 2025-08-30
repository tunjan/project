import React from 'react';
import { type ChapterJoinRequest, type User } from '@/types';
import { useChaptersActions } from '@/store';
import { toast } from 'sonner';
import Avatar from '@/components/ui/Avatar';

interface ChapterRequestQueueProps {
  requests: ChapterJoinRequest[];
  currentUser: User;
}

const RequestCard: React.FC<{
  request: ChapterJoinRequest;
  onApprove: (requestId: string) => void;
  onDeny: (requestId: string) => void;
}> = ({ request, onApprove, onDeny }) => {
  return (
    <div className="border border-black bg-white">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-4">
          <Avatar
            src={request.user.profilePictureUrl}
            alt={request.user.name}
            className="h-12 w-12 object-cover"
          />
          <div>
            <p className="font-bold text-black">{request.user.name}</p>
            <p className="text-sm text-neutral-500">
              Wants to join:
              <span className="font-semibold text-black">
                {' '}
                {request.chapterName}
              </span>
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onDeny(request.id)}
            className="bg-black px-3 py-2 text-sm font-semibold text-white hover:bg-black"
          >
            Deny
          </button>
          <button
            onClick={() => onApprove(request.id)}
            className="bg-primary px-3 py-2 text-sm font-semibold text-white hover:bg-primary-hover"
          >
            Approve
          </button>
        </div>
      </div>
    </div>
  );
};

const ChapterRequestQueue: React.FC<ChapterRequestQueueProps> = ({
  requests,
  currentUser,
}) => {
  const { approveChapterJoinRequest, denyChapterJoinRequest } =
    useChaptersActions();

  const handleApprove = (requestId: string) => {
    approveChapterJoinRequest(requestId, currentUser);
    toast.success('Member approved and added to the chapter.');
  };

  const handleDeny = (requestId: string) => {
    denyChapterJoinRequest(requestId);
    toast.error('Join request has been denied.');
  };

  if (requests.length === 0) {
    return null;
  }

  return (
    <div>
      <h2 className="mb-4 border-b-2 border-black pb-2 text-2xl font-bold text-black">
        Chapter Join Requests ({requests.length})
      </h2>
      <div className="space-y-4">
        {requests.map((request) => (
          <RequestCard
            key={request.id}
            request={request}
            onApprove={handleApprove}
            onDeny={handleDeny}
          />
        ))}
      </div>
    </div>
  );
};

export default ChapterRequestQueue;
