import React, { useState } from 'react';
import RequestCard from './RequestCard';
import { HomeIcon } from '@/icons';

import { useAccommodationRequests } from '@/store';

import { useCurrentUser } from '@/store/auth.store';

interface HostingDashboardProps {}

type HostingView = 'incoming' | 'sent';

const TabButton: React.FC<{
  onClick: () => void;
  isActive: boolean;
  count: number;
  children: React.ReactNode;
}> = ({ onClick, isActive, count, children }) => (
  <button
    onClick={onClick}
    className={`flex items-center space-x-2 px-4 py-2 text-sm font-semibold transition-colors duration-200 ${
      isActive
        ? 'text-black'
        : 'border-transparent text-white0 hover:text-black'
    }`}
  >
    {children}
    {count > 0 && (
      <span className="ml-1 bg-primary px-2 py-0.5 text-xs font-bold text-white">
        {count}
      </span>
    )}
  </button>
);

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
    <div className="border-2 border-black bg-white p-8 text-center">
      <HomeIcon className="mx-auto h-12 w-12 text-red" />
      <h3 className="mt-4 text-xl font-bold text-black">
        {view === 'incoming'
          ? 'No incoming requests.'
          : "You haven't sent any requests."}
      </h3>
      <p className="mt-2 text-white0">
        {view === 'incoming'
          ? 'When activists request to stay with you, they will appear here.'
          : 'Request accommodation from an event page.'}
      </p>
    </div>
  );

  return (
    <div>
      <div className="mb-4 flex items-center border-b border-black">
        <TabButton
          onClick={() => setView('incoming')}
          isActive={view === 'incoming'}
          count={incomingRequests.length}
        >
          <span>Incoming Requests</span>
        </TabButton>
        <TabButton
          onClick={() => setView('sent')}
          isActive={view === 'sent'}
          count={0}
        >
          <span>Sent Requests</span>
        </TabButton>
      </div>

      {sortedRequests.length > 0 ? (
        <div className="space-y-4">
          {sortedRequests.map((req) => (
            <RequestCard key={req.id} request={req} />
          ))}
        </div>
      ) : (
        <NoRequestsMessage />
      )}
    </div>
  );
};

export default HostingDashboard;
