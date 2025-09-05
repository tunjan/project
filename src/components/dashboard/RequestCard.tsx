import { CheckCircle, XCircle } from 'lucide-react';
import React, { useState } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useAccommodationsActions } from '@/store';
import { useCurrentUser } from '@/store/auth.store';
import { type AccommodationRequest } from '@/types';
import { formatDateSafe, safeParseDate } from '@/utils';

interface RequestCardProps {
  request: AccommodationRequest;
}

const StatusBadge: React.FC<{ status: AccommodationRequest['status'] }> = ({
  status,
}) => {
  const variantMap = {
    Pending: 'secondary' as const,
    Accepted: 'default' as const,
    Denied: 'destructive' as const,
  };

  return (
    <Badge variant={variantMap[status]} className="text-xs">
      {status.toUpperCase()}
    </Badge>
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
    return `${formatDateSafe(startDate, (d, o) => d.toLocaleDateString(undefined, o), options)} - ${formatDateSafe(endDate, (d, o) => d.toLocaleDateString(undefined, o), options)}`;
  };

  return (
    <Card className="p-4">
      <CardContent className="p-0">
        <div className="mb-3 flex flex-col justify-between border-b border-border pb-3 sm:flex-row sm:items-center">
          <div className="mb-2 sm:mb-0">
            <p className="text-sm text-muted-foreground">
              {isHostView ? 'Request From' : 'Request To'}
            </p>
            <div className="flex items-center space-x-2">
              <Avatar className="size-8">
                <AvatarImage
                  src={otherUser.profilePictureUrl}
                  alt={otherUser.name}
                  className="object-cover"
                />
                <AvatarFallback>{otherUser.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <p className="font-bold text-foreground">{otherUser.name}</p>
            </div>
          </div>
          <div className="text-left sm:text-right">
            <p className="text-sm text-muted-foreground">For Event</p>
            <p className="font-bold text-foreground">
              {request.event.location}, {request.event.city}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="md:col-span-2">
            <p className="mb-1 text-sm font-semibold text-foreground">
              Message:
            </p>
            <Card className="p-2">
              <p className="text-sm text-foreground">{request.message}</p>
            </Card>

            {request.hostReply && (
              <div className="mt-2">
                <p className="mb-1 text-sm font-semibold text-foreground">
                  Host's Reply:
                </p>
                <Card className="bg-primary/10 p-2">
                  <p className="text-sm text-foreground">{request.hostReply}</p>
                </Card>
              </div>
            )}
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-sm font-semibold text-foreground">Dates</p>
              <p className="text-sm text-muted-foreground">
                {formatDateRange(request.startDate, request.endDate)}
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Status</p>
              <StatusBadge status={request.status} />
            </div>
          </div>
        </div>

        {isHostView && request.status === 'Pending' && (
          <div className="mt-4 space-y-3 border-t border-border pt-4">
            <Textarea
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder="Optional: Reply with a message..."
              rows={2}
            />
            <div className="flex items-center space-x-2">
              <Button
                onClick={() => handleRespond('Denied')}
                variant="outline"
                className="w-full"
              >
                <XCircle className="mr-1.5 size-4" /> Deny
              </Button>
              <Button
                onClick={() => handleRespond('Accepted')}
                className="w-full"
              >
                <CheckCircle className="mr-1.5 size-4" /> Accept
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RequestCard;
