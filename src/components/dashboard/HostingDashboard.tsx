import { Home } from 'lucide-react';
import React, { useState } from 'react';

import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAccommodationRequests } from '@/store';
import { useCurrentUser } from '@/store/auth.store';

import RequestCard from './RequestCard';

type HostingDashboardProps = Record<string, never>;

type HostingView = 'incoming' | 'sent';

const HostingDashboard: React.FC<HostingDashboardProps> = () => {
  const currentUser = useCurrentUser();

  const accommodationRequests = useAccommodationRequests();

  const [view, setView] = useState<HostingView>('incoming');

  if (!currentUser) return null;

  const incomingRequests = accommodationRequests.filter(
    (r) => r.host.id === currentUser.id && r.status === 'Pending'
  );
  const sentRequests = accommodationRequests.filter(
    (r) => r.requester.id === currentUser.id
  );

  const requestsToDisplay =
    view === 'incoming'
      ? accommodationRequests.filter((r) => r.host.id === currentUser.id)
      : sentRequests;

  const sortedRequests = requestsToDisplay.sort((a, b) => {
    if (a.status === 'Pending' && b.status !== 'Pending') return -1;
    if (a.status !== 'Pending' && b.status === 'Pending') return 1;

    return (
      new Date(a.event.startDate).getTime() -
      new Date(b.event.startDate).getTime()
    );
  });

  const NoRequestsMessage = () => (
    <Card>
      <CardContent className="p-8 text-center">
        <Home className="mx-auto size-12 text-destructive" />
        <h3 className="mt-4 text-xl font-bold">
          {view === 'incoming'
            ? 'No incoming requests.'
            : "You haven't sent any requests."}
        </h3>
        <p className="mt-2 text-muted-foreground">
          {view === 'incoming'
            ? 'When activists request to stay with you, they will appear here.'
            : 'Request accommodation from an event page.'}
        </p>
      </CardContent>
    </Card>
  );

  return (
    <div>
      <Tabs
        value={view}
        onValueChange={(value) => setView(value as 'incoming' | 'sent')}
      >
        <TabsList className="mb-4">
          <TabsTrigger value="incoming">
            Incoming Requests ({incomingRequests.length})
          </TabsTrigger>
          <TabsTrigger value="sent">
            Sent Requests ({sentRequests.length})
          </TabsTrigger>
        </TabsList>
        <TabsContent value="incoming">
          {sortedRequests.length > 0 ? (
            <div className="space-y-4">
              {sortedRequests.map((req) => (
                <RequestCard key={req.id} request={req} />
              ))}
            </div>
          ) : (
            <NoRequestsMessage />
          )}
        </TabsContent>
        <TabsContent value="sent">
          {sentRequests.length > 0 ? (
            <div className="space-y-4">
              {sortedRequests.map((req) => (
                <RequestCard key={req.id} request={req} />
              ))}
            </div>
          ) : (
            <NoRequestsMessage />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HostingDashboard;
