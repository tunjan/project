import React from 'react';
import { type CubeEvent, EventStatus } from '../types';
import { MapPinIcon, CalendarIcon, ClockIcon, UsersIcon } from './icons';

interface CubeCardProps {
  event: CubeEvent;
  onSelect: (event: CubeEvent) => void;
}

const CubeCard: React.FC<CubeCardProps> = ({ event, onSelect }) => {
  const formattedDate = event.dateTime.toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const formattedTime = event.dateTime.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div 
      onClick={() => onSelect(event)}
      className="bg-white rounded-none border border-black overflow-hidden transform hover:-translate-y-1 transition-all duration-300 cursor-pointer"
    >
      <div className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-semibold text-[#d81313] uppercase tracking-wide">{event.city}</p>
            <h3 className="mt-1 text-2xl font-bold text-black">{event.location}</h3>
          </div>
          <div className="flex items-center space-x-2">
            {event.status === EventStatus.FINISHED && (
                <span className="text-xs font-bold bg-black text-white px-2 py-1">FINISHED</span>
            )}
            <div className="flex items-center bg-black text-white text-xs font-semibold px-2.5 py-1 rounded-none">
              <UsersIcon className="w-4 h-4 mr-1.5" />
              {event.participants.length}
            </div>
          </div>
        </div>
        
        <div className="mt-4 space-y-3 text-neutral-600">
          <div className="flex items-center">
            <CalendarIcon className="w-5 h-5 mr-3 text-neutral-400" />
            <span>{formattedDate}</span>
          </div>
          <div className="flex items-center">
            <ClockIcon className="w-5 h-5 mr-3 text-neutral-400" />
            <span>{formattedTime}</span>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-neutral-200 flex items-center">
          <img className="h-10 w-10 rounded-none object-cover" src={event.organizer.profilePictureUrl} alt={event.organizer.name} />
          <div className="ml-3">
            <p className="text-sm font-semibold text-black">{event.organizer.name}</p>
            <p className="text-xs text-neutral-500">Organizer</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CubeCard;
