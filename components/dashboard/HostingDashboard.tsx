import React, { useState } from 'react';
import RequestCard from './RequestCard';
import { HomeIcon } from '../icons';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';

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
    className={`flex items-center space-x-2 px-4 py-2 text-sm font-semibold transition-colors duration-200 border-b-2 ${
      isActive
        ? 'border-[#d81313] text-black'
        : 'border-transparent text-neutral-500 hover:text-black'
    }`}
  >
    {children}
    {count > 0 && (
        <span className="ml-1 bg-[#d81313] text-white text-xs font-bold px-2 py-0.5 rounded-full">{count}</span>
    )}
  </button>
);


const HostingDashboard: React.FC<HostingDashboardProps> = () => {
    const { currentUser } = useAuth();
    const { accommodationRequests } = useData();

    const [view, setView] = useState<HostingView>('incoming');

    if (!currentUser) return null;

    const incomingRequests = accommodationRequests.filter(r => r.host.id === currentUser.id && r.status === 'Pending');
    const sentRequests = accommodationRequests.filter(r => r.requester.id === currentUser.id);
    
    const requestsToDisplay = view === 'incoming' 
        ? accommodationRequests.filter(r => r.host.id === currentUser.id)
        : sentRequests;

    const sortedRequests = requestsToDisplay.sort((a,b) => {
        // Show pending requests first
        if (a.status === 'Pending' && b.status !== 'Pending') return -1;
        if (a.status !== 'Pending' && b.status === 'Pending') return 1;
        // Then sort by event date
        return a.event.dateTime.getTime() - b.event.dateTime.getTime();
    });

    const NoRequestsMessage = () => (
        <div className="border border-black p-8 text-center bg-white">
            <HomeIcon className="w-12 h-12 mx-auto text-neutral-300"/>
            <h3 className="text-xl font-bold text-black mt-4">
                {view === 'incoming' ? 'No incoming requests.' : 'You haven\'t sent any requests.'}
            </h3>
            <p className="mt-2 text-neutral-500">
                 {view === 'incoming' ? 'When activists request to stay with you, they will appear here.' : 'Request accommodation from an event page.'}
            </p>
        </div>
    );
    

    return (
        <div>
            <div className="border-b border-black flex items-center mb-4">
                <TabButton onClick={() => setView('incoming')} isActive={view === 'incoming'} count={incomingRequests.length}>
                    <span>Incoming Requests</span>
                </TabButton>
                <TabButton onClick={() => setView('sent')} isActive={view === 'sent'} count={0}>
                    <span>Sent Requests</span>
                </TabButton>
            </div>

            {sortedRequests.length > 0 ? (
                <div className="space-y-4">
                    {sortedRequests.map(req => (
                        <RequestCard 
                            key={req.id}
                            request={req}
                        />
                    ))}
                </div>
            ) : (
                <NoRequestsMessage />
            )}
        </div>
    );
};

export default HostingDashboard;
