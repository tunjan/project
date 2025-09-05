import React from 'react';
import { toast } from 'sonner';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useChaptersActions } from '@/store';
import { type ChapterJoinRequest, type User } from '@/types';

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
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Avatar className="size-12">
              <AvatarImage
                src={request.user.profilePictureUrl}
                alt={request.user.name}
                className="object-cover"
              />
              <AvatarFallback>{request.user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-bold text-foreground">{request.user.name}</p>
              <p className="text-sm text-muted-foreground">
                Wants to join:
                <span className="font-semibold text-foreground">
                  {' '}
                  {request.chapterName}
                </span>
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              onClick={() => onDeny(request.id)}
              variant="destructive"
              size="sm"
            >
              Deny
            </Button>
            <Button onClick={() => onApprove(request.id)} size="sm">
              Approve
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
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
      <h2 className="mb-4 text-2xl font-bold tracking-tight text-foreground">
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
