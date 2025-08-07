import React from 'react';
import { type CubeEvent } from '../../types';
import { useData } from '../../contexts/DataContext';

interface ParticipationHistoryProps {
    userId: string;
}

const ParticipationHistory: React.FC<ParticipationHistoryProps> = ({ userId }) => {
    const { events: allEvents } = useData();
    const userHistory = allEvents
        .filter(event => event.participants.some(p => p.user.id === userId))
        .sort((a, b) => b.dateTime.getTime() - a.dateTime.getTime());

    if (userHistory.length === 0) {
        return (
            <div className="border border-black p-6 text-center bg-white">
                <p className="text-neutral-500">No participation history found. Attend a Cube to get started!</p>
            </div>
        );
    }

    return (
        <div className="bg-white border border-black">
            <ul className="divide-y divide-black">
                {userHistory.map(event => {
                    const participation = event.participants.find(p => p.user.id === userId)!;
                    const formattedDate = event.dateTime.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

                    return (
                        <li key={event.id} className="p-4 flex items-center justify-between space-x-4">
                            <div className="flex-grow">
                                <p className="font-bold text-black">{event.location}</p>
                                <p className="text-sm text-neutral-500">{event.city} &middot; {formattedDate}</p>
                            </div>
                            <div className="flex-shrink-0">
                                <span className="px-2 py-1 text-xs font-semibold rounded-none bg-neutral-200 text-black">
                                    {participation.eventRole}
                                </span>
                            </div>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};

export default ParticipationHistory;
