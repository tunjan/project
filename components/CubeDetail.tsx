import React, { useState, useMemo } from 'react';
import { type CubeEvent, type EventParticipant, type User, EventStatus, type AccommodationRequest, type EventComment } from '../types';
import { MapPinIcon, CalendarIcon, ClockIcon, UsersIcon, ChevronLeftIcon, ClipboardCheckIcon, HomeIcon } from './icons';
import RequestAccommodationModal from './events/RequestAccommodationModal';
import EventDiscussion from './events/EventDiscussion';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';

interface CubeDetailProps {
  event: CubeEvent;
  onBack: () => void;
  onRsvp: (eventId: string) => void;
  onCancelRsvp: (eventId: string) => void;
  onManageEvent: (event: CubeEvent) => void;
}

const RoleBadge: React.FC<{ role: string }> = ({ role }) => {
  const roleClasses = role === 'Organizer'
    ? 'bg-[#d81313] text-white'
    : 'bg-black text-white';

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-none ${roleClasses}`}>
      {role}
    </span>
  );
};

const ParticipantCard: React.FC<{ participant: EventParticipant }> = ({ participant }) => (
  <li className="flex items-center justify-between py-3">
    <div className="flex items-center">
      <img className="h-10 w-10 rounded-none object-cover" src={participant.user.profilePictureUrl} alt={participant.user.name} />
      <div className="ml-4">
        <p className="text-sm font-semibold text-black">{participant.user.name}</p>
        <p className="text-sm text-neutral-500">{participant.user.role}</p>
      </div>
    </div>
    <RoleBadge role={participant.eventRole} />
  </li>
);

const HostCard: React.FC<{ host: User; onRequest: (host: User) => void }> = ({ host, onRequest }) => (
    <li className="flex items-center justify-between py-3">
        <div className="flex items-center">
            <img className="h-10 w-10 rounded-none object-cover" src={host.profilePictureUrl} alt={host.name} />
            <div className="ml-4">
                <p className="text-sm font-semibold text-black">{host.name}</p>
                <p className="text-sm text-neutral-500">Can host {host.hostingCapacity} {host.hostingCapacity === 1 ? 'person' : 'people'}</p>
            </div>
        </div>
        <button 
            onClick={() => onRequest(host)}
            className="text-sm font-semibold bg-[#d81313] text-white px-3 py-2 hover:bg-[#b81010]"
        >
            Request Stay
        </button>
    </li>
);


import { AddToCalendarButton } from 'add-to-calendar-button-react';

const CubeDetail: React.FC<CubeDetailProps> = ({ event, onBack, onRsvp, onCancelRsvp, onManageEvent }) => {
  const { currentUser } = useAuth();
  const { users: allUsers, createAccommodationRequest } = useData();
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [selectedHost, setSelectedHost] = useState<User | null>(null);
  
  const formattedDate = event.dateTime.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  const formattedTime = event.dateTime.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', timeZoneName: 'short' });

  const isAttending = currentUser ? event.participants.some(p => p.user.id === currentUser.id) : false;
  const isPastEvent = new Date() > event.dateTime;
  const isOrganizer = currentUser?.id === event.organizer.id;
  const canManageEvent = isOrganizer && isPastEvent && event.status !== EventStatus.FINISHED;
  const canParticipateInDiscussion = currentUser && isAttending;

  const availableHosts = useMemo(() => {
    return allUsers.filter(u => 
        u.id !== currentUser?.id && // Can't request from yourself
        u.chapters.includes(event.city) && 
        u.hostingAvailability && 
        u.hostingCapacity && u.hostingCapacity > 0
    );
  }, [allUsers, event.city, currentUser]);


  const handleRsvpClick = () => {
    if (isAttending) {
      onCancelRsvp(event.id);
    } else {
      onRsvp(event.id);
    }
  };

  const handleRequestStay = (host: User) => {
    setSelectedHost(host);
    setIsRequestModalOpen(true);
  };

  const handleCreateRequest = (requestData: Omit<AccommodationRequest, 'id'|'requester'|'host'|'event'|'status'>) => {
    if (!selectedHost || !currentUser) return;
    createAccommodationRequest({
        ...requestData,
        host: selectedHost,
        event: event,
    }, currentUser);
    setIsRequestModalOpen(false);
    setSelectedHost(null);
    alert(`Accommodation request sent to ${selectedHost.name}. You can track its status on your dashboard.`);
  }

  return (
    <>
    {isRequestModalOpen && selectedHost && (
        <RequestAccommodationModal 
            host={selectedHost}
            event={event}
            onClose={() => setIsRequestModalOpen(false)}
            onCreateRequest={handleCreateRequest}
        />
    )}
    <div className="py-8 md:py-12 animate-fade-in">
      <div className="mb-6">
        <button onClick={onBack} className="inline-flex items-center text-sm font-semibold text-[#d81313] hover:text-black transition">
          <ChevronLeftIcon className="w-5 h-5 mr-1" />
          Back to all cubes
        </button>
      </div>

      <div className="lg:grid lg:grid-cols-3 lg:gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-none border border-black overflow-hidden">
            <img src={`https://picsum.photos/seed/${event.id}/1200/400`} alt="Event location photo" className="w-full h-64 object-cover" />
            <div className="p-6 md:p-8">
              <div className="flex justify-between items-start">
                  <p className="text-base font-semibold text-[#d81313] uppercase tracking-wide">{event.city}</p>
                   {event.status === EventStatus.FINISHED && (
                        <span className="text-sm font-bold bg-black text-white px-3 py-1">Finished</span>
                   )}
              </div>
              <h1 className="mt-1 text-3xl md:text-4xl font-extrabold text-black">{event.location}</h1>
              
              <div className="mt-6 space-y-4 text-neutral-700">
                <div className="flex items-center">
                  <CalendarIcon className="w-6 h-6 mr-4 text-neutral-400" />
                  <span className="text-lg">{formattedDate}</span>
                </div>
                <div className="flex items-center">
                  <ClockIcon className="w-6 h-6 mr-4 text-neutral-400" />
                  <span className="text-lg">{formattedTime}</span>
                </div>

                <div className="mt-4">
                    <AddToCalendarButton
                        name={event.location}
                        startDate={event.dateTime.toISOString().split('T')[0]}
                        startTime={event.dateTime.toTimeString().split(' ')[0]}
                        endTime={new Date(event.dateTime.getTime() + 2 * 60 * 60 * 1000).toTimeString().split(' ')[0]}
                        timeZone="currentBrowser"
                        location={event.location}
                        options={['Apple', 'Google', 'Outlook.com']}
                        buttonStyle="date"
                        size="3"
                    />
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-neutral-200">
                  <h3 className="text-lg font-bold text-black mb-2">Organizer</h3>
                   <div className="flex items-center">
                    <img className="h-12 w-12 rounded-none object-cover" src={event.organizer.profilePictureUrl} alt={event.organizer.name} />
                    <div className="ml-4">
                      <p className="text-base font-semibold text-black">{event.organizer.name}</p>
                      <p className="text-sm text-neutral-500">{event.organizer.role}</p>
                    </div>
                  </div>
              </div>
            </div>
          </div>
            {/* Hosts Section */}
            {!isPastEvent && currentUser && (
                 <div className="bg-white rounded-none border border-black">
                    <div className="p-6 md:p-8">
                        <div className="flex items-center border-b border-black pb-4 mb-2">
                           <HomeIcon className="w-6 h-6 mr-3 text-black" />
                           <h2 className="text-xl font-bold text-black">Available Hosts</h2>
                        </div>
                        {availableHosts.length > 0 ? (
                            <ul className="divide-y divide-neutral-200">
                                {availableHosts.map(host => (
                                    <HostCard key={host.id} host={host} onRequest={handleRequestStay} />
                                ))}
                            </ul>
                        ) : (
                            <p className="text-center text-sm text-neutral-500 py-4">
                                No hosts are available for this event yet. Check back later!
                            </p>
                        )}
                    </div>
                </div>
            )}
            {/* Discussion Section */}
            {canParticipateInDiscussion && (
              <EventDiscussion 
                  eventId={event.id}
              />
            )}
        </div>

        {/* Right Column */}
        <div className="mt-8 lg:mt-0">
            <div className="bg-white rounded-none border border-black p-6 md:p-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-black">Participants</h2>
                  <div className="flex items-center bg-black text-white text-sm font-semibold px-3 py-1 rounded-none">
                    <UsersIcon className="w-5 h-5 mr-1.5" />
                    {event.participants.length}
                  </div>
                </div>
                <ul className="divide-y divide-neutral-200">
                    {event.participants.map(p => (
                        <ParticipantCard key={p.user.id} participant={p} />
                    ))}
                </ul>

                {canManageEvent ? (
                    <button 
                      onClick={() => onManageEvent(event)}
                      className="w-full mt-6 font-bold py-3 px-4 rounded-none transition-colors duration-300 bg-black text-white hover:bg-neutral-800 flex items-center justify-center"
                    >
                       <ClipboardCheckIcon className="w-5 h-5 mr-2" />
                        Log Event Report
                    </button>
                ) : (
                    <button 
                      onClick={handleRsvpClick}
                      disabled={isPastEvent || event.status === EventStatus.FINISHED}
                      className={`w-full mt-6 font-bold py-3 px-4 rounded-none transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#d81313] ${
                        isAttending 
                        ? 'bg-black text-white hover:bg-neutral-800' 
                        : 'bg-[#d81313] text-white hover:bg-[#b81010]'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        {isPastEvent || event.status === EventStatus.FINISHED 
                            ? 'Event has ended'
                            : (isAttending ? 'Cancel RSVP' : (currentUser ? 'RSVP to this Cube' : 'Log in to RSVP'))
                        }
                    </button>
                )}
            </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default CubeDetail;
