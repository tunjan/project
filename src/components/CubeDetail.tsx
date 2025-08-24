import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  type CubeEvent,
  type EventParticipant,
  type User,
  EventStatus,
  type AccommodationRequest,
  Role,
  Chapter,
  TourDuty,
  ParticipantStatus,
  EventRole,
  type EventRoleRequirement,
} from '@/types';
import {
  CalendarIcon,
  ClockIcon,
  UsersIcon,
  ChevronLeftIcon,
  ClipboardCheckIcon,
  HomeIcon,
  PencilIcon,
  XCircleIcon,
  TrashIcon,
} from '@/icons';
import RequestAccommodationModal from '@/components/events/RequestAccommodationModal';
import EditEventModal from '@/components/events/EditEventModal';
import EventDiscussion from '@/components/events/EventDiscussion';
import EventRoster from './events/EventRoster';
import TourOfDutyModal from './events/TourOfDutyModal';
import EventRoleManagement from './events/EventRoleManagement';
import RoleSignupModal from './events/RoleSignupModal';
import InventoryDisplay from './charts/InventoryDisplay';
import { useCurrentUser } from '@/store/auth.store';
import {
  useEventsActions,
  useAccommodationsActions,
  useUsers,
  useChapters,
} from '@/store';
import { toast } from 'sonner';
import CancelEventModal from './events/CancelEventModal';
import { safeFormatDate, safeParseDate } from '@/utils/date';
import ConfirmationModal from '@/components/ui/ConfirmationModal';

interface CubeDetailProps {
  event: CubeEvent;
  onBack: () => void;
  onRsvp: (eventId: string, duties?: TourDuty[], eventRole?: EventRole) => void;
  onCancelRsvp: (eventId: string) => void;
  onManageEvent: (event: CubeEvent) => void;
}

const RoleBadge: React.FC<{ role: string }> = ({ role }) => {
  const roleClasses =
    role === 'Organizer' ? 'bg-primary text-white' : 'bg-black text-white';

  return (
    <span className={`px-2 py-1 text-xs font-medium ${roleClasses}`}>
      {role}
    </span>
  );
};

const ParticipantCard: React.FC<{
  participant: EventParticipant;
  isOrganizerView: boolean;
  onRemove: (userId: string) => void;
}> = ({ participant, isOrganizerView, onRemove }) => {
  // Add safety check for participant and user
  if (!participant?.user) {
    return null;
  }

  return (
    <li>
      <div className="flex items-center justify-between p-3 transition-colors hover:bg-neutral-100">
        <Link
          to={`/members/${participant.user.id}`}
          className="flex min-w-0 items-center"
        >
          <img
            className="h-10 w-10 flex-shrink-0 object-cover"
            src={participant.user.profilePictureUrl}
            alt={participant.user.name}
          />
          <div className="ml-4 min-w-0">
            <p className="truncate text-sm font-semibold text-black">
              {participant.user.name}
            </p>
            <p className="truncate text-sm text-neutral-500">
              {participant.user.role}
            </p>
          </div>
        </Link>
        <div className="flex flex-shrink-0 items-center space-x-2">
          <RoleBadge role={participant.eventRole} />
          {isOrganizerView && (
            <button
              onClick={() => onRemove(participant.user.id)}
              className="p-1 text-neutral-400 hover:text-primary"
              aria-label={`Remove ${participant.user.name}`}
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </li>
  );
};

const PendingRequestCard: React.FC<{
  participant: EventParticipant;
  onAccept: () => void;
  onDeny: () => void;
}> = ({ participant, onAccept, onDeny }) => {
  // Add safety check for participant and user
  if (!participant?.user) {
    return null;
  }

  return (
    <li className="flex items-center justify-between p-3">
      <div className="flex items-center">
        <img
          className="h-10 w-10 object-cover"
          src={participant.user.profilePictureUrl}
          alt={participant.user.name}
        />
        <div className="ml-4">
          <p className="text-sm font-semibold text-black">
            {participant.user.name}
          </p>
          <p className="text-sm text-neutral-500">
            {participant.user.chapters?.join(', ') || 'No chapters assigned'}
          </p>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <button
          onClick={onDeny}
          className="bg-black px-3 py-1 text-xs font-semibold text-white hover:bg-neutral-800"
        >
          Deny
        </button>
        <button
          onClick={onAccept}
          className="bg-primary px-3 py-1 text-xs font-semibold text-white hover:bg-primary-hover"
        >
          Accept
        </button>
      </div>
    </li>
  );
};

const HostCard: React.FC<{ host: User; onRequest: (host: User) => void }> = ({
  host,
  onRequest,
}) => {
  // Add safety check for host
  if (!host) {
    return null;
  }

  return (
    <li className="flex items-center justify-between py-3">
      <div className="flex items-center">
        <img
          className="h-10 w-10 object-cover"
          src={host.profilePictureUrl}
          alt={host.name}
        />
        <div className="ml-4">
          <p className="text-sm font-semibold text-black">{host.name}</p>
          <p className="text-sm text-neutral-500">
            Can host {host.hostingCapacity}{' '}
            {host.hostingCapacity === 1 ? 'person' : 'people'}
          </p>
        </div>
      </div>
      <button
        onClick={() => onRequest(host)}
        className="bg-primary px-3 py-2 text-sm font-semibold text-white hover:bg-primary-hover"
      >
        Request Stay
      </button>
    </li>
  );
};

const CubeDetail: React.FC<CubeDetailProps> = ({
  event,
  onBack,
  onRsvp,
  onCancelRsvp,
  onManageEvent,
}) => {
  const currentUser = useCurrentUser();
  const allUsers = useUsers();
  const allChapters = useChapters();
  const { cancelEvent, approveRsvp, denyRsvp, removeParticipant, updateEvent } =
    useEventsActions();
  const { createAccommodationRequest } = useAccommodationsActions();
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isTourModalOpen, setIsTourModalOpen] = useState(false);
  const [isRoleSignupModalOpen, setIsRoleSignupModalOpen] = useState(false);
  const [selectedHost, setSelectedHost] = useState<User | null>(null);
  const [removeParticipantModalOpen, setRemoveParticipantModalOpen] =
    useState(false);
  const [participantToRemove, setParticipantToRemove] = useState<string | null>(
    null
  );

  // Ensure dates are valid Date objects
  const startDate = safeParseDate(event.startDate);
  const endDate = safeParseDate(event.endDate);

  const formattedDate = safeFormatDate(startDate, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const formattedTime = safeFormatDate(startDate, {
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  });

  const formattedDateRange =
    startDate && endDate
      ? `${safeFormatDate(startDate, { dateStyle: 'full' })} to ${safeFormatDate(endDate, { dateStyle: 'full' })}`
      : formattedDate;

  const currentUserParticipant = useMemo(
    () =>
      currentUser
        ? event.participants.find((p) => p.user.id === currentUser.id)
        : undefined,
    [currentUser, event.participants]
  );

  const isAttending =
    currentUserParticipant?.status === ParticipantStatus.ATTENDING;
  const isPending =
    currentUserParticipant?.status === ParticipantStatus.PENDING;
  const isGuest = currentUser
    ? !currentUser.chapters?.includes(event.city)
    : true;

  const isPastEvent = startDate ? new Date() > startDate : false;
  const isCancelled = event.status === EventStatus.CANCELLED;
  const isOrganizer = currentUser?.id === event.organizer.id;
  const canManageEvent =
    isOrganizer &&
    isPastEvent &&
    event.status !== EventStatus.FINISHED &&
    !isCancelled;
  const canParticipateInDiscussion = currentUser && isAttending;
  const canEditEvent = isOrganizer && !isPastEvent && !isCancelled;
  const canCancelEvent = isOrganizer && !isPastEvent && !isCancelled;
  const isRegionalEvent = event.scope === 'Regional' && endDate !== null;

  const attendingParticipants = useMemo(
    () =>
      event.participants.filter(
        (p) => p.status === ParticipantStatus.ATTENDING
      ),
    [event.participants]
  );

  const pendingParticipants = useMemo(
    () =>
      event.participants.filter((p) => p.status === ParticipantStatus.PENDING),
    [event.participants]
  );

  const availableHosts = useMemo(() => {
    return allUsers.filter(
      (u: User) =>
        u.id !== currentUser?.id &&
        u.chapters?.includes(event.city) &&
        u.hostingAvailability &&
        u.hostingCapacity &&
        u.hostingCapacity > 0
    );
  }, [allUsers, event.city, currentUser]);

  const organizableChapters = useMemo((): Chapter[] => {
    if (!currentUser) return [];

    switch (currentUser.role) {
      case Role.GODMODE:
      case Role.GLOBAL_ADMIN:
        return allChapters;
      case Role.REGIONAL_ORGANISER:
        if (!currentUser.managedCountry) return [];
        return allChapters.filter(
          (c) => c.country === currentUser.managedCountry
        );
      case Role.CHAPTER_ORGANISER:
        return (
          allChapters.filter((c) =>
            currentUser.organiserOf?.includes(c.name)
          ) || []
        );
      default:
        return [];
    }
  }, [currentUser, allChapters]);

  const handleRsvpClick = () => {
    if (isRegionalEvent) {
      setIsTourModalOpen(true);
    } else {
      // Show role selection modal for non-regional events
      setIsRoleSignupModalOpen(true);
    }
  };

  const handleTourConfirm = (duties: TourDuty[]) => {
    onRsvp(event.id, duties, EventRole.ACTIVIST);
    setIsTourModalOpen(false);
    toast.success('Your duties have been registered!');
  };

  const handleRoleSignup = (role: EventRole) => {
    onRsvp(event.id, undefined, role);
    setIsRoleSignupModalOpen(false);
    toast.success(`You've signed up as ${role}!`);
  };

  const handleUpdateRoleRequirements = (
    requirements: EventRoleRequirement[]
  ) => {
    updateEvent(
      event.id,
      { roleRequirements: requirements },
      currentUser || undefined
    );
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

  const handleRemoveParticipant = (participantUserId: string) => {
    if (!currentUser) return;
    removeParticipant(event.id, participantUserId, currentUser);
  };

  const openRemoveParticipantModal = (participantUserId: string) => {
    setParticipantToRemove(participantUserId);
    setRemoveParticipantModalOpen(true);
  };

  return (
    <>
      <ConfirmationModal
        isOpen={removeParticipantModalOpen}
        onClose={() => setRemoveParticipantModalOpen(false)}
        onConfirm={() => {
          if (participantToRemove) {
            handleRemoveParticipant(participantToRemove);
          }
        }}
        title="Remove Participant"
        message="Are you sure you want to remove this participant?"
        confirmText="Remove"
        variant="danger"
      />
      {isRequestModalOpen && selectedHost && (
        <RequestAccommodationModal
          host={selectedHost}
          event={event}
          onClose={() => setIsRequestModalOpen(false)}
          onCreateRequest={handleCreateRequest}
        />
      )}
      {isCancelModalOpen && canCancelEvent && (
        <CancelEventModal
          event={event}
          onClose={() => setIsCancelModalOpen(false)}
          onConfirm={handleConfirmCancel}
        />
      )}
      {isTourModalOpen && isRegionalEvent && (
        <TourOfDutyModal
          event={event}
          existingDuties={currentUserParticipant?.tourDuties || []}
          onClose={() => setIsTourModalOpen(false)}
          onConfirm={handleTourConfirm}
        />
      )}
      {isEditModalOpen && canEditEvent && (
        <EditEventModal
          event={event}
          organizableChapters={organizableChapters}
          onClose={() => setIsEditModalOpen(false)}
        />
      )}
      {isRoleSignupModalOpen && (
        <RoleSignupModal
          event={event}
          currentRole={currentUserParticipant?.eventRole}
          onClose={() => setIsRoleSignupModalOpen(false)}
          onConfirm={handleRoleSignup}
        />
      )}
      <div className="animate-fade-in py-8 md:py-12">
        <div className="mb-6">
          <button
            onClick={onBack}
            className="inline-flex items-center text-sm font-semibold text-primary transition hover:text-black"
          >
            <ChevronLeftIcon className="mr-1 h-5 w-5" />
            Back to all cubes
          </button>
        </div>

        {isCancelled && (
          <div
            className="mb-8 flex items-center border-2 border-red-500 bg-red-100 p-4 text-red-800"
            role="alert"
          >
            <XCircleIcon className="h-6 w-6" />
            <div className="ml-3">
              <p className="font-bold">This event has been cancelled.</p>
              {event.cancellationReason && (
                <p className="text-sm">Reason: {event.cancellationReason}</p>
              )}
            </div>
          </div>
        )}

        <div className="lg:grid lg:grid-cols-3 lg:gap-8">
          <div className="space-y-8 lg:col-span-2">
            <div className="overflow-hidden border border-black bg-white">
              <img
                src={`https://picsum.photos/seed/${event.id}/1200/400`}
                alt="Event location photo"
                className="h-48 w-full object-cover sm:h-64"
              />
              <div className="p-6 md:p-8">
                {event.scope === 'Regional' && (
                  <div className="mb-2 inline-block bg-black px-3 py-1 text-sm font-bold uppercase tracking-wider text-white">
                    {event.targetRegion} Regional Event
                  </div>
                )}
                <div className="flex items-start justify-between">
                  <p className="text-base font-semibold uppercase tracking-wide text-primary">
                    {event.city}
                  </p>
                  {event.status === EventStatus.FINISHED && (
                    <span className="bg-black px-3 py-1 text-sm font-bold text-white">
                      Finished
                    </span>
                  )}
                  {event.status === EventStatus.CANCELLED && (
                    <span className="bg-red-600 px-3 py-1 text-sm font-bold text-white">
                      Cancelled
                    </span>
                  )}
                </div>
                <h1 className="mt-1 text-3xl font-extrabold text-black md:text-4xl">
                  {event.location}
                </h1>

                <div className="mt-6 space-y-4 text-neutral-700">
                  <div className="flex items-start">
                    <CalendarIcon className="mr-4 mt-1 h-6 w-6 flex-shrink-0 text-neutral-400" />
                    <span className="text-lg">{formattedDateRange}</span>
                  </div>
                  <div className="flex items-center">
                    <ClockIcon className="mr-4 h-6 w-6 text-neutral-400" />
                    <span className="text-lg">
                      {formattedTime} (Start time)
                    </span>
                  </div>
                </div>

                <div className="mt-8 border-t border-neutral-200 pt-6">
                  <h3 className="mb-2 text-lg font-bold text-black">
                    Organizer
                  </h3>
                  <div className="flex items-center">
                    <img
                      className="h-12 w-12 object-cover"
                      src={event.organizer.profilePictureUrl}
                      alt={event.organizer.name}
                    />
                    <div className="ml-4">
                      <p className="text-base font-semibold text-black">
                        {event.organizer.name}
                      </p>
                      <p className="text-sm text-neutral-500">
                        {event.organizer.role}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <EventRoleManagement
              event={event}
              onUpdateRoleRequirements={handleUpdateRoleRequirements}
              canEdit={canEditEvent}
            />
            {isRegionalEvent && <EventRoster event={event} />}
            {isOrganizer && pendingParticipants.length > 0 && (
              <div className="border border-yellow-500 bg-yellow-50">
                <div className="border-b border-yellow-400 p-6 md:p-8">
                  <h2 className="text-xl font-bold text-black">
                    Pending Join Requests ({pendingParticipants.length})
                  </h2>
                  <p className="mt-1 text-sm text-yellow-800">
                    These activists are not from your chapter and require your
                    approval to attend.
                  </p>
                </div>
                <ul className="divide-y divide-yellow-300 px-6">
                  {pendingParticipants
                    .filter((p) => p?.user) // Filter out invalid participants
                    .map((p) => (
                      <PendingRequestCard
                        key={p.user.id}
                        participant={p}
                        onAccept={() => handleAcceptRsvp(p.user.id)}
                        onDeny={() => handleDenyRsvp(p.user.id)}
                      />
                    ))}
                </ul>
              </div>
            )}
            {!isPastEvent && currentUser && !isRegionalEvent && (
              <div className="border border-black bg-white">
                <div className="p-6 md:p-8">
                  <div className="mb-2 flex items-center border-b border-black pb-4">
                    <HomeIcon className="mr-3 h-6 w-6 text-black" />
                    <h2 className="text-xl font-bold text-black">
                      Available Hosts
                    </h2>
                  </div>
                  {availableHosts.length > 0 ? (
                    <ul className="divide-y divide-neutral-200">
                      {availableHosts
                        .filter((host) => host) // Filter out invalid hosts
                        .map((host: User) => (
                          <HostCard
                            key={host.id}
                            host={host}
                            onRequest={handleRequestStay}
                          />
                        ))}
                    </ul>
                  ) : (
                    <p className="py-4 text-center text-sm text-neutral-500">
                      No hosts are available for this event yet. Check back
                      later!
                    </p>
                  )}
                </div>
              </div>
            )}
            {canParticipateInDiscussion && (
              <EventDiscussion eventId={event.id} />
            )}

            {/* Chapter Inventory */}
            <div className="border border-black bg-white">
              <div className="p-6 md:p-8">
                <InventoryDisplay
                  chapterName={event.city}
                  showTitle={true}
                  compact={false}
                />
              </div>
            </div>
          </div>

          <div className="mt-8 lg:mt-0">
            <div className="border-2 border-black bg-white p-6 md:p-8">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-black">Participants</h2>
                <div className="flex items-center bg-black px-3 py-1 text-sm font-semibold text-white">
                  <UsersIcon className="mr-1.5 h-5 w-5" />
                  {attendingParticipants.length}
                </div>
              </div>
              <ul className="-mx-3 divide-y divide-neutral-200">
                {attendingParticipants
                  .filter((p) => p?.user) // Filter out invalid participants
                  .map((p: EventParticipant) => (
                    <ParticipantCard
                      key={p.user.id}
                      participant={p}
                      isOrganizerView={isOrganizer && !isPastEvent}
                      onRemove={openRemoveParticipantModal}
                    />
                  ))}
              </ul>
              <div className="mt-6 space-y-2">
                {/* Status Display */}
                {isAttending && (
                  <div className="flex items-center justify-center border-2 border-green-600 bg-green-100 px-4 py-3 font-semibold text-green-800">
                    <ClipboardCheckIcon className="mr-2 h-5 w-5" />
                    Status: Attending
                  </div>
                )}
                {isPending && (
                  <div className="flex items-center justify-center border-2 border-yellow-600 bg-yellow-100 px-4 py-3 font-semibold text-yellow-800">
                    <ClockIcon className="mr-2 h-5 w-5" />
                    Status: Request Pending
                  </div>
                )}
                {isPastEvent || event.status === EventStatus.FINISHED ? (
                  <div className="flex items-center justify-center border-2 border-neutral-600 bg-neutral-100 px-4 py-3 font-semibold text-neutral-800">
                    Event has ended
                  </div>
                ) : isCancelled ? (
                  <div className="flex items-center justify-center border-2 border-red-600 bg-red-100 px-4 py-3 font-semibold text-red-800">
                    Event Cancelled
                  </div>
                ) : null}

                {/* Action Buttons */}
                {canManageEvent ? (
                  <button
                    onClick={() => onManageEvent(event)}
                    className="flex w-full items-center justify-center bg-primary px-4 py-3 font-bold text-white transition-colors duration-300 hover:bg-primary-hover"
                  >
                    <ClipboardCheckIcon className="mr-2 h-5 w-5" />
                    Log Event Report
                  </button>
                ) : (
                  !isPastEvent &&
                  !isCancelled &&
                  currentUser && (
                    <>
                      {!isAttending && !isPending && (
                        <button
                          onClick={handleRsvpClick}
                          className="w-full bg-primary px-4 py-3 font-bold text-white transition-colors duration-300 hover:bg-primary-hover"
                        >
                          {isRegionalEvent
                            ? 'Sign Up for Duties'
                            : isGuest
                              ? 'Request to Join'
                              : 'RSVP to this Cube'}
                        </button>
                      )}
                      {isAttending && isRegionalEvent && (
                        <button
                          onClick={handleRsvpClick}
                          className="w-full bg-primary px-4 py-3 font-bold text-white transition-colors duration-300 hover:bg-primary-hover"
                        >
                          Update Duties
                        </button>
                      )}
                    </>
                  )
                )}

                {/* Cancel RSVP Button */}
                {(isAttending || isPending) && !isPastEvent && !isCancelled && (
                  <button
                    onClick={() => onCancelRsvp(event.id)}
                    className="flex w-full items-center justify-center bg-black px-4 py-3 font-bold text-white transition-colors hover:bg-neutral-800"
                  >
                    Cancel RSVP
                  </button>
                )}

                {/* Event Management Buttons */}
                {canEditEvent && (
                  <button
                    onClick={() => setIsEditModalOpen(true)}
                    className="flex w-full items-center justify-center border border-black bg-black px-4 py-3 font-bold text-white transition-colors duration-300 hover:bg-neutral-800"
                  >
                    <PencilIcon className="mr-2 h-5 w-5" />
                    Edit Event
                  </button>
                )}
                {canCancelEvent && (
                  <button
                    onClick={() => setIsCancelModalOpen(true)}
                    className="btn-danger flex w-full items-center justify-center"
                  >
                    <XCircleIcon className="mr-2 h-5 w-5" />
                    Cancel Event
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CubeDetail;
