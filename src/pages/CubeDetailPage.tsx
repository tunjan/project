import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  useEventById,
  useEventsActions,
  useChapters,
  useUsers,
  useAccommodationsActions,
} from '@/store';
import { useCurrentUser } from '@/store/auth.store';
import {
  TourDuty,
  ParticipantStatus,
  User,
  AccommodationRequest,
} from '@/types';
import { can, Permission } from '@/config/permissions';
import { toast } from 'sonner';

// Import the new components
import EventHeader from '@/components/events/EventHeader';
import EventActionBar from '@/components/events/EventActionBar';
import EventSidebar from '@/components/events/EventSidebar';
import EventRosterWrapper from '@/components/events/EventRosterWrapper';
import EventDiscussion from '@/components/events/EventDiscussion';
import InventoryDisplay from '@/components/charts/InventoryDisplay';
import TourOfDutyModal from '@/components/events/TourOfDutyModal';
import EditEventModal from '@/components/events/EditEventModal';
import CancelEventModal from '@/components/events/CancelEventModal';
import RequestAccommodationModal from '@/components/events/RequestAccommodationModal';
import { ChevronLeftIcon } from '@/icons';

const TabButton: React.FC<{
  onClick: () => void;
  isActive: boolean;
  children: React.ReactNode;
}> = ({ onClick, isActive, children }) => (
  <button
    onClick={onClick}
    className={`-mb-px border-b-4 px-4 py-3 text-sm font-bold uppercase tracking-wider transition-colors duration-200 ${
      isActive
        ? 'border-primary text-primary'
        : 'border-transparent text-neutral-500 hover:border-neutral-300 hover:text-black'
    }`}
  >
    {children}
  </button>
);

const CubeDetailPage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const currentUser = useCurrentUser();
  const allChapters = useChapters();
  const { rsvp, cancelRsvp, approveRsvp, denyRsvp, cancelEvent } =
    useEventsActions();
  const { createAccommodationRequest } = useAccommodationsActions();
  const allUsers = useUsers();

  const [activeTab, setActiveTab] = React.useState('discussion');
  const [isTourModalOpen, setIsTourModalOpen] = React.useState(false);
  const [isRequestModalOpen, setIsRequestModalOpen] = React.useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = React.useState(false);
  const [selectedHost, setSelectedHost] = React.useState<User | null>(null);

  const event = useEventById(eventId!);

  // Move useMemo before early return to follow React Hooks rules
  const availableHosts = React.useMemo(() => {
    if (!event) return [];
    return allUsers.filter(
      (u: User) =>
        u.id !== currentUser?.id &&
        u.chapters?.includes(event.city) &&
        u.hostingAvailability &&
        u.hostingCapacity &&
        u.hostingCapacity > 0
    );
  }, [allUsers, currentUser, event]);

  if (!event) {
    return (
      <div className="py-16 text-center">
        <h1 className="text-2xl font-bold">Event Not Found</h1>
        <p className="mt-2 text-neutral-600">
          The event you are looking for does not exist.
        </p>
        <button onClick={() => navigate('/cubes')} className="btn-primary mt-4">
          Back to All Cubes
        </button>
      </div>
    );
  }

  const currentUserParticipant = currentUser
    ? event.participants.find((p) => p.user.id === currentUser.id)
    : undefined;
  const isAttending =
    currentUserParticipant?.status === ParticipantStatus.ATTENDING;
  const isPending =
    currentUserParticipant?.status === ParticipantStatus.PENDING;
  const isGuest = currentUser
    ? !currentUser.chapters?.includes(event.city)
    : true;
  const canManageEvent = can(currentUser, Permission.LOG_EVENT_REPORT, {
    event,
  });
  const canEditEvent = can(currentUser, Permission.EDIT_EVENT, { event });
  const canCancelEvent = can(currentUser, Permission.CANCEL_EVENT, { event });
  const isRegionalEvent = event.scope === 'Regional' && !!event.endDate;

  const handleRsvpClick = () => {
    if (!currentUser) return navigate('/login');
    if (isRegionalEvent) {
      setIsTourModalOpen(true);
    } else {
      rsvp(event.id, currentUser, isGuest);
    }
  };

  const handleTourConfirm = (duties: TourDuty[]) => {
    if (!currentUser) return;
    rsvp(event.id, currentUser, isGuest, duties);
    setIsTourModalOpen(false);
    toast.success('Your duties have been registered!');
  };

  const handleCancelRsvp = () => {
    if (!currentUser) return;
    cancelRsvp(event.id, currentUser);
  };

  const handleManageEvent = () => navigate(`/manage/event/${event.id}`);
  const handleEditEvent = () => setIsEditModalOpen(true);
  const handleCancelEvent = () => setIsCancelModalOpen(true);

  const handleConfirmCancel = (reason: string) => {
    if (!currentUser) return;
    cancelEvent(event.id, reason, currentUser);
    setIsCancelModalOpen(false);
    toast.error('Event has been cancelled. Participants will be notified.');
  };

  const handleAcceptRsvp = (guestId: string) => {
    if (!currentUser) return;
    approveRsvp(event.id, guestId, currentUser);
    toast.success('Guest approved and added to the event.');
  };

  const handleDenyRsvp = (guestId: string) => {
    if (!currentUser) return;
    denyRsvp(event.id, guestId, currentUser);
    toast.error('Guest request has been denied.');
  };

  const handleRequestStay = (host: User) => {
    setSelectedHost(host);
    setIsRequestModalOpen(true);
  };

  const handleCreateRequest = (
    requestData: Omit<
      AccommodationRequest,
      'id' | 'requester' | 'host' | 'event' | 'status'
    >
  ) => {
    if (!selectedHost || !currentUser) return;
    createAccommodationRequest(
      {
        ...requestData,
        host: selectedHost,
        event: event,
      },
      currentUser
    );
    setIsRequestModalOpen(false);
    setSelectedHost(null);
    toast.success('Accommodation request sent', {
      description: `Your request was sent to ${selectedHost.name}. Track its status on your dashboard.`,
    });
  };

  return (
    <>
      {isTourModalOpen && isRegionalEvent && (
        <TourOfDutyModal
          event={event}
          existingDuties={currentUserParticipant?.tourDuties || []}
          onClose={() => setIsTourModalOpen(false)}
          onConfirm={handleTourConfirm}
        />
      )}
      {isRequestModalOpen && selectedHost && (
        <RequestAccommodationModal
          host={selectedHost}
          event={event}
          onClose={() => setIsRequestModalOpen(false)}
          onCreateRequest={handleCreateRequest}
        />
      )}
      {isEditModalOpen && canEditEvent && (
        <EditEventModal
          event={event}
          organizableChapters={allChapters}
          onClose={() => setIsEditModalOpen(false)}
        />
      )}
      {isCancelModalOpen && canCancelEvent && (
        <CancelEventModal
          event={event}
          onClose={() => setIsCancelModalOpen(false)}
          onConfirm={handleConfirmCancel}
        />
      )}
      <div className="py-8 md:py-12">
        <button
          onClick={() => navigate('/cubes')}
          className="mb-6 inline-flex items-center text-sm font-semibold text-primary transition hover:text-black"
        >
          <ChevronLeftIcon className="mr-1 h-5 w-5" />
          Back to all cubes
        </button>

        <EventHeader event={event} />
        <EventActionBar
          event={event}
          isAttending={isAttending}
          isPending={isPending}
          isGuest={isGuest}
          isRegionalEvent={isRegionalEvent}
          canManageEvent={canManageEvent}
          canEditEvent={canEditEvent}
          canCancelEvent={canCancelEvent}
          onRsvp={handleRsvpClick}
          onCancelRsvp={handleCancelRsvp}
          onManageEvent={handleManageEvent}
          onEditEvent={handleEditEvent}
          onCancelEvent={handleCancelEvent}
        />

        <div className="mt-4 grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="lg:col-span-1">
            <div className="border-b-2 border-black">
              <TabButton
                onClick={() => setActiveTab('discussion')}
                isActive={activeTab === 'discussion'}
              >
                Discussion
              </TabButton>
              {isRegionalEvent && (
                <TabButton
                  onClick={() => setActiveTab('roster')}
                  isActive={activeTab === 'roster'}
                >
                  Roster
                </TabButton>
              )}
              <TabButton
                onClick={() => setActiveTab('inventory')}
                isActive={activeTab === 'inventory'}
              >
                Inventory
              </TabButton>
            </div>
            <div className="pt-6">
              {activeTab === 'discussion' && (
                <EventDiscussion eventId={event.id} />
              )}
              {activeTab === 'roster' && isRegionalEvent && (
                <EventRosterWrapper event={event} />
              )}
              {activeTab === 'inventory' && (
                <InventoryDisplay chapterName={event.city} showTitle={false} />
              )}
            </div>
          </div>
          <div className="lg:col-span-1">
            <EventSidebar
              event={event}
              canManageParticipants={can(
                currentUser,
                Permission.MANAGE_EVENT_PARTICIPANTS,
                { event, allChapters }
              )}
              availableHosts={availableHosts}
              onAcceptRsvp={handleAcceptRsvp}
              onDenyRsvp={handleDenyRsvp}
              onRequestStay={handleRequestStay}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default CubeDetailPage;
