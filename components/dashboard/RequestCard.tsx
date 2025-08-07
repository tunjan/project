import React, { useState } from 'react';
import { type AccommodationRequest } from '../../types';
import { HomeIcon, CheckCircleIcon, XCircleIcon } from '../icons';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';

interface RequestCardProps {
    request: AccommodationRequest;
}

const StatusBadge: React.FC<{ status: AccommodationRequest['status'] }> = ({ status }) => {
    const styles = {
        Pending: 'bg-yellow-100 text-yellow-800',
        Accepted: 'bg-green-100 text-green-800',
        Denied: 'bg-red-100 text-red-800',
    };
    return <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${styles[status]}`}>{status.toUpperCase()}</span>;
};

const RequestCard: React.FC<RequestCardProps> = ({ request }) => {
    const { currentUser } = useAuth();
    const { respondToAccommodationRequest } = useData();
    
    const [reply, setReply] = useState('');

    if (!currentUser) return null;

    const isHostView = request.host.id === currentUser.id;
    const otherUser = isHostView ? request.requester : request.host;

    const handleRespond = (response: 'Accepted' | 'Denied') => {
        respondToAccommodationRequest(request.id, response, currentUser, reply);
    };
    
    const formatDateRange = (start: Date, end: Date) => {
        const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
        return `${start.toLocaleDateString(undefined, options)} - ${end.toLocaleDateString(undefined, options)}`;
    }

    return (
        <div className="bg-white border border-black p-4">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-black pb-3 mb-3">
                <div className='mb-2 sm:mb-0'>
                    <p className="text-sm text-neutral-500">{isHostView ? 'Request From' : 'Request To'}</p>
                    <div className="flex items-center space-x-2">
                        <img src={otherUser.profilePictureUrl} alt={otherUser.name} className="w-8 h-8 object-cover"/>
                        <p className="font-bold text-black">{otherUser.name}</p>
                    </div>
                </div>
                <div className='text-left sm:text-right'>
                    <p className="text-sm text-neutral-500">For Event</p>
                    <p className="font-bold text-black">{request.event.location}, {request.event.city}</p>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                    <p className="text-sm font-semibold text-black mb-1">Message:</p>
                    <p className="text-sm bg-neutral-100 border border-neutral-300 p-2 text-neutral-700">{request.message}</p>
                    
                    {request.hostReply && (
                        <div className="mt-2">
                            <p className="text-sm font-semibold text-black mb-1">Host's Reply:</p>
                            <p className="text-sm bg-blue-100 border border-blue-300 p-2 text-blue-800">{request.hostReply}</p>
                        </div>
                    )}
                </div>
                <div className='space-y-3'>
                    <div>
                        <p className="text-sm font-semibold text-black">Dates</p>
                        <p className="text-sm text-neutral-600">{formatDateRange(request.startDate, request.endDate)}</p>
                    </div>
                     <div>
                        <p className="text-sm font-semibold text-black">Status</p>
                        <StatusBadge status={request.status} />
                    </div>
                </div>
            </div>

            {isHostView && request.status === 'Pending' && (
                <div className="border-t border-black mt-4 pt-4 space-y-3">
                    <textarea 
                        value={reply}
                        onChange={(e) => setReply(e.target.value)}
                        placeholder="Optional: Reply with a message..."
                        rows={2}
                        className="block w-full border border-black bg-white p-2 text-black placeholder:text-neutral-500 focus:ring-0 sm:text-sm"
                    />
                    <div className="flex items-center space-x-2">
                        <button onClick={() => handleRespond('Denied')} className="w-full flex items-center justify-center text-sm font-semibold bg-black text-white px-3 py-2 hover:bg-neutral-800">
                           <XCircleIcon className="w-5 h-5 mr-1.5" /> Deny
                        </button>
                         <button onClick={() => handleRespond('Accepted')} className="w-full flex items-center justify-center text-sm font-semibold bg-[#d81313] text-white px-3 py-2 hover:bg-[#b81010]">
                           <CheckCircleIcon className="w-5 h-5 mr-1.5" /> Accept
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RequestCard;
