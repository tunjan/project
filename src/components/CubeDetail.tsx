import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

import EditEventModal from '@/components/events/EditEventModal';
import EventDiscussion from '@/components/events/EventDiscussion';
import RequestAccommodationModal from '@/components/events/RequestAccommodationModal';
import { Avatar } from '@/components/ui';
import { ConfirmationModal } from '@/components/ui';
import { useEventDetails } from '@/hooks/useEventDetails';
import {
  CalendarIcon,
  ChevronLeftIcon,
  ClipboardCheckIcon,
  ClockIcon,
  HomeIcon,
  MapPinIcon,
  PencilIcon,
  TagIcon,
  TrashIcon,
  UsersIcon,
  XCircleIcon,
} from '@/icons';
import {
  useAccommodationsActions,
  useChapters,
  useEventsActions,
  useUsers,
} from '@/store';
import { useCurrentUser } from '@/store/auth.store';
import {
  type AccommodationRequest,
  Chapter,
  type CubeEvent,
  type EventParticipant,
  EventStatus,
  ParticipantStatus,
  Role,
  TourDuty,
  type User,
} from '@/types';
import { formatDateSafe, safeParseDate } from '@/utils';

import InventoryDisplay from './charts/InventoryDisplay';
import CancelEventModal from './events/CancelEventModal';
import EventRoster from './events/EventRoster';
import TourOfDutyModal from './events/TourOfDutyModal';

interface CubeDetailProps {
  event: CubeEvent;
  onBack: () => void;
  onRsvp: (eventId: string, duties?: TourDuty[]) => void;
  onCancelRsvp: (eventId: string) => void;
  onManageEvent: (event: CubeEvent) => void;
  readOnlyPublic?: boolean;
}

const ParticipantCard: React.FC<{
  participant: EventParticipant;
  isOrganizerView: boolean;
  onRemove: (participantUserId: string) => void;
}> = ({ participant, isOrganizerView, onRemove }) => {
  const [showConfirmation, setShowConfirmation] = useState(false);

  if (!participant?.user) {
    return null;
  }

  const handleRemoveClick = () => {
    setShowConfirmation(true);
  };

  const handleConfirmRemove = () => {
    onRemove(participant.user.id);
    setShowConfirmation(false);
  };

  const handleCancelRemove = () => {
    setShowConfirmation(false);
  };

  return (
    <div className="group relative overflow-hidden p-2">
      <div className="flex items-center justify-between">
        <Link
          to={`/members/${participant.user.id}`}
          className="flex min-w-0 flex-1 items-center"
        >
          <Avatar
            src={participant.user.profilePictureUrl}
            alt={participant.user.name}
            className="rounded-nonefull size-12 shrink-0 object-cover ring-2 ring-neutral-100 group-hover:ring-primary/20"
          />
          <div className="ml-4 min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-black dark:text-white">
              {participant.user.name}
            </p>
            <p className="truncate text-sm text-neutral-500 dark:text-gray-400">
              {participant.user.role}
            </p>
          </div>
        </Link>

        {isOrganizerView && (
          <div className="ml-4 flex shrink-0 items-center">
            {!showConfirmation ? (
              <button
                onClick={handleRemoveClick}
                className="rounded-nonefull p-2 text-neutral-400 hover:bg-red-50 hover:text-red-600"
                aria-label={`Remove ${participant.user.name}`}
              >
                <TrashIcon className="size-4" />
              </button>
            ) : (
              <div className="rounded-nonelg flex items-center space-x-2 border border-red-200 bg-red-50 px-3 py-2">
                <span className="text-xs font-medium text-red-700">
                  Remove?
                </span>
                <button
                  onClick={handleConfirmRemove}
                  className="rounded px-2 py-1 text-xs font-semibold text-red-700 transition-colors hover:bg-red-100"
                  aria-label="Confirm removal"
                >
                  Yes
                </button>
                <button
                  onClick={handleCancelRemove}
                  className="rounded px-2 py-1 text-xs text-neutral-600 transition-colors hover:bg-neutral-100"
                  aria-label="Cancel removal"
                >
                  No
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const PendingRequestCard: React.FC<{
  participant: EventParticipant;
  onAccept: () => void;
  onDeny: () => void;
}> = ({ participant, onAccept, onDeny }) => {
  if (!participant?.user) {
    return null;
  }

  return (
    <div className="rounded-nonelg border border-yellow-200 bg-yellow-50 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Avatar
            src={participant.user.profilePictureUrl}
            alt={participant.user.name}
            className="rounded-nonefull size-12 object-cover ring-2 ring-yellow-200"
          />
          <div className="ml-4">
            <p className="text-sm font-semibold text-black dark:text-white">
              {participant.user.name}
            </p>
            <p className="text-sm text-neutral-600 dark:text-gray-300">
              {participant.user.chapters?.join(', ') || 'No chapters assigned'}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={onDeny}
            className="rounded-nonelg bg-neutral-800 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-neutral-700"
          >
            Deny
          </button>
          <button
            onClick={onAccept}
            className="rounded-nonelg bg-primary px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-primary-hover"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
};

const HostCard: React.FC<{ host: User; onRequest: (host: User) => void }> = ({
  host,
  onRequest,
}) => {
  if (!host) {
    return null;
  }

  return (
    <div className="p-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Avatar
            src={host.profilePictureUrl}
            alt={host.name}
            className="rounded-nonefull size-12 object-cover ring-2 ring-neutral-100"
          />
          <div className="ml-4">
            <p className="text-sm font-semibold text-black dark:text-white">
              {host.name}
            </p>
            <p className="text-sm text-neutral-600 dark:text-gray-300">
              Can host {host.hostingCapacity}{' '}
              {host.hostingCapacity === 1 ? 'person' : 'people'}
            </p>
          </div>
        </div>
        <button
          onClick={() => onRequest(host)}
          className="rounded-nonelg bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
        >
          Request Stay
        </button>
      </div>
    </div>
  );
};

const StatusBadge: React.FC<{ status: EventStatus; isCancelled?: boolean }> = ({
  status,
  isCancelled,
}) => {
  if (isCancelled) {
    return (
      <span className="rounded-nonefull inline-flex items-center bg-red-100 px-3 py-1 text-xs font-semibold text-red-800">
        <XCircleIcon className="mr-1 size-3" />
        Cancelled
      </span>
    );
  }

  if (status === EventStatus.FINISHED) {
    return (
      <span className="rounded-nonefull inline-flex items-center bg-green-100 px-3 py-1 text-xs font-semibold text-green-800">
        <ClipboardCheckIcon className="mr-1 size-3" />
        Finished
      </span>
    );
  }

  return (
    <span className="rounded-nonefull inline-flex items-center bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800">
      <ClockIcon className="mr-1 size-3" />
      Upcoming
    </span>
  );
};

const CubeDetail: React.FC<CubeDetailProps> = ({
  event,
  onBack,
  onRsvp,
  onCancelRsvp,
  onManageEvent,
  readOnlyPublic = false,
}) => {
  const currentUser = useCurrentUser();
  const allUsers = useUsers();
  const allChapters = useChapters();
  const { cancelEvent, approveRsvp, denyRsvp, removeParticipant } =
    useEventsActions();
  const { createAccommodationRequest } = useAccommodationsActions();
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isTourModalOpen, setIsTourModalOpen] = useState(false);
  const [selectedHost, setSelectedHost] = useState<User | null>(null);
  const [removeParticipantModalOpen, setRemoveParticipantModalOpen] =
    useState(false);
  const [participantToRemove, setParticipantToRemove] = useState<string | null>(
    null
  );

  // Ensure dates are valid Date objects
  const startDate = safeParseDate(event.startDate);
  const endDate = safeParseDate(event.endDate);

  const formattedDate = formatDateSafe(
    startDate,
    (d, o) => new Intl.DateTimeFormat(undefined, o).format(d),
    {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }
  );

  const formattedTime = formatDateSafe(
    startDate,
    (d, o) => new Intl.DateTimeFormat(undefined, o).format(d),
    {
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short',
    }
  );

  const formattedDateRange =
    startDate && endDate
      ? `${formatDateSafe(startDate, (d, o) => new Intl.DateTimeFormat(undefined, o).format(d), { dateStyle: 'full' })} to ${formatDateSafe(endDate, (d, o) => new Intl.DateTimeFormat(undefined, o).format(d), { dateStyle: 'full' })}`
      : formattedDate;

  // ✨ REFACTORING: Use the custom hook to get all derived state
  const {
    isAttending,
    isPending,
    isGuest,
    isPastEvent,
    isCancelled,
    canManageEvent: baseCanManageEvent,
    canEditEvent: baseCanEditEvent,
    canCancelEvent: baseCanCancelEvent,
    canManageParticipants: baseCanManageParticipants,
    isRegionalEvent,
    currentUserParticipant,
  } = useEventDetails(event, currentUser);

  // Apply readOnlyPublic restrictions
  const canManageEvent = !readOnlyPublic && baseCanManageEvent;
  const canEditEvent = !readOnlyPublic && baseCanEditEvent;
  const canCancelEvent = !readOnlyPublic && baseCanCancelEvent;
  const canManageParticipants = !readOnlyPublic && baseCanManageParticipants;
  const canParticipateInDiscussion =
    !readOnlyPublic && currentUser && isAttending;

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
      onRsvp(event.id);
    }
  };

  const handleTourConfirm = (duties: TourDuty[]) => {
    onRsvp(event.id, duties);
    setIsTourModalOpen(false);
    toast.success('Your duties have been registered!');
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
      {!readOnlyPublic && isCancelModalOpen && canCancelEvent && (
        <CancelEventModal
          event={event}
          onClose={() => setIsCancelModalOpen(false)}
          onConfirm={handleConfirmCancel}
        />
      )}
      {!readOnlyPublic && isTourModalOpen && isRegionalEvent && (
        <TourOfDutyModal
          event={event}
          existingDuties={currentUserParticipant?.tourDuties || []}
          onClose={() => setIsTourModalOpen(false)}
          onConfirm={handleTourConfirm}
        />
      )}
      {!readOnlyPublic && isEditModalOpen && canEditEvent && (
        <EditEventModal
          event={event}
          organizableChapters={organizableChapters}
          onClose={() => setIsEditModalOpen(false)}
          isOpen={isEditModalOpen}
        />
      )}

      <div className="min-h-screen">
        <div className="mx-auto max-w-7xl py-8 lg:px-8">
          {/* Header Navigation */}
          <div className="mb-8">
            <button
              onClick={onBack}
              className="rounded-nonelg inline-flex items-center bg-white text-sm font-semibold text-neutral-700 hover:text-black dark:bg-black dark:text-gray-300 dark:hover:text-white"
            >
              <ChevronLeftIcon className="mr-2 size-5" />
              Back to all cubes
            </button>
          </div>

          {/* Cancellation Alert */}
          {isCancelled && (
            <div
              className="rounded-nonexl mb-8 border-red-200 bg-red-50 p-6 md:md:border-2"
              role="alert"
            >
              <div className="flex items-start">
                <XCircleIcon className="size-6 shrink-0 text-red-600" />
                <div className="ml-3">
                  <h3 className="text-lg font-bold text-red-800">
                    This event has been cancelled
                  </h3>
                  {event.cancellationReason && (
                    <p className="mt-1 text-sm text-red-700">
                      Reason: {event.cancellationReason}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="gap-8 lg:grid lg:grid-cols-3">
            {/* Main Content Area */}
            <div className="space-y-8 lg:col-span-2">
              {/* Hero Section */}
              <div className="rounded-none2xl overflow-hidden border-black bg-white shadow-lg dark:border-white dark:bg-black md:md:border-2">
                <div className="relative">
                  <img
                    src="/default-cube-image.svg"
                    alt="Default cube event"
                    className="h-64 w-full object-cover sm:h-80"
                  />
                  <div className="absolute right-4 top-4">
                    <StatusBadge
                      status={event.status}
                      isCancelled={isCancelled}
                    />
                  </div>
                  {event.scope === 'Regional' && (
                    <div className="absolute left-4 top-4">
                      <span className="rounded-nonefull inline-flex items-center bg-black px-3 py-1 text-sm font-bold uppercase tracking-wider text-white">
                        <TagIcon className="mr-1 size-4" />
                        {event.targetRegion} Regional
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-8">
                  <div className="mb-6">
                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <MapPinIcon className="size-5 text-primary" />
                        <span className="text-lg font-semibold text-primary">
                          {event.city}
                        </span>
                      </div>
                    </div>
                    <h1 className="text-4xl font-extrabold text-black dark:text-white sm:text-5xl">
                      {event.location}
                    </h1>
                  </div>

                  {/* Event Details */}
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="flex items-start space-x-4">
                      <div className="rounded-nonelg flex size-12 items-center justify-center bg-primary/10">
                        <CalendarIcon className="size-6 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-neutral-600">
                          Date
                        </p>
                        <p className="text-lg font-semibold text-black">
                          {formattedDateRange}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div className="rounded-nonelg flex size-12 items-center justify-center bg-primary/10">
                        <ClockIcon className="size-6 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-neutral-600">
                          Start Time
                        </p>
                        <p className="text-lg font-semibold text-black">
                          {formattedTime}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Organizer Section */}
                  <div className="rounded-nonexl mt-8 border border-neutral-200 bg-neutral-50 p-6">
                    <h3 className="mb-4 text-lg font-bold text-black dark:text-white">
                      Event Organizer
                    </h3>
                    <div className="flex items-center">
                      <Avatar
                        src={event.organizer.profilePictureUrl}
                        alt={event.organizer.name}
                        className="rounded-nonefull size-16 object-cover ring-4 ring-white"
                      />
                      <div className="ml-4">
                        <p className="text-lg font-semibold text-black">
                          {event.organizer.name}
                        </p>
                        <p className="text-sm text-neutral-600 dark:text-gray-300">
                          {event.organizer.role}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Regional Event Roster */}
              {isRegionalEvent && !readOnlyPublic && (
                <div className="rounded-none2xl border-black bg-white p-8 shadow-lg dark:border-white dark:bg-black md:border-2">
                  <EventRoster event={event} />
                </div>
              )}

              {/* Pending Requests */}
              {canManageParticipants && pendingParticipants.length > 0 && (
                <div className="rounded-none2xl border-yellow-200 bg-yellow-50 p-8 shadow-lg md:border-2">
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-black dark:text-white">
                      Pending Join Requests ({pendingParticipants.length})
                    </h2>
                    <p className="mt-2 text-neutral-700">
                      These activists are not from your chapter and require your
                      approval to attend.
                    </p>
                  </div>
                  <div className="space-y-4">
                    {pendingParticipants
                      .filter((p) => p?.user)
                      .map((p) => (
                        <PendingRequestCard
                          key={p.user.id}
                          participant={p}
                          onAccept={() => handleAcceptRsvp(p.user.id)}
                          onDeny={() => handleDenyRsvp(p.user.id)}
                        />
                      ))}
                  </div>
                </div>
              )}

              {/* Available Hosts */}
              {!readOnlyPublic &&
                !isPastEvent &&
                currentUser &&
                !isRegionalEvent && (
                  <div className="rounded-none2xl border-black bg-white p-8 shadow-lg dark:border-white dark:bg-black md:border-2">
                    <div className="mb-6 flex items-center border-b border-neutral-200 pb-4">
                      <div className="rounded-nonelg flex size-12 items-center justify-center bg-primary/10">
                        <HomeIcon className="size-6 text-primary" />
                      </div>
                      <h2 className="ml-4 text-2xl font-bold text-black dark:text-white">
                        Available Hosts
                      </h2>
                    </div>
                    {availableHosts.length > 0 ? (
                      <div className="space-y-4">
                        {availableHosts
                          .filter((host) => host)
                          .map((host: User) => (
                            <HostCard
                              key={host.id}
                              host={host}
                              onRequest={handleRequestStay}
                            />
                          ))}
                      </div>
                    ) : (
                      <div className="py-12 text-center">
                        <HomeIcon className="mx-auto size-12 text-neutral-400" />
                        <p className="mt-4 text-lg font-medium text-neutral-600">
                          No hosts available yet
                        </p>
                        <p className="mt-2 text-sm text-neutral-500">
                          Check back later for accommodation options!
                        </p>
                      </div>
                    )}
                  </div>
                )}

              {/* Event Discussion */}
              {canParticipateInDiscussion && (
                <div className="rounded-none2xl border-black bg-white p-8 shadow-lg dark:border-white dark:bg-black md:border-2">
                  <EventDiscussion eventId={event.id} />
                </div>
              )}

              {/* Chapter Inventory */}
              <div className="rounded-none2xl border-black bg-white p-8 shadow-lg dark:border-white dark:bg-black md:border-2">
                <InventoryDisplay
                  chapterName={event.city}
                  showTitle={true}
                  compact={false}
                />
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Participants Card */}
              <div className="rounded-none2xl border-black bg-white p-6 shadow-lg dark:border-white dark:bg-black md:border-2">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-xl font-bold text-black dark:text-white">
                    Participants
                  </h2>
                  <div className="rounded-nonefull flex items-center bg-primary px-4 py-2 text-sm font-semibold text-white">
                    <UsersIcon className="mr-2 size-4" />
                    {attendingParticipants.length}
                  </div>
                </div>

                <div className="space-y-3">
                  {attendingParticipants
                    .filter((p) => p?.user)
                    .map((p: EventParticipant) => (
                      <ParticipantCard
                        key={p.user.id}
                        participant={p}
                        isOrganizerView={canManageParticipants && !isPastEvent}
                        onRemove={openRemoveParticipantModal}
                      />
                    ))}
                </div>

                {/* Status Display */}
                <div className="mt-6 space-y-3">
                  {!readOnlyPublic && isAttending && (
                    <div className="rounded-nonelg flex items-center justify-center border-green-200 bg-green-50 px-4 py-3 md:border-2">
                      <ClipboardCheckIcon className="mr-2 size-5 text-green-600" />
                      <span className="font-semibold text-green-800">
                        Status: Attending
                      </span>
                    </div>
                  )}

                  {!readOnlyPublic && isPending && (
                    <div className="rounded-nonelg flex items-center justify-center border-yellow-200 bg-yellow-50 px-4 py-3 md:border-2">
                      <ClockIcon className="mr-2 size-5 text-yellow-600" />
                      <span className="font-semibold text-yellow-800">
                        Status: Request Pending
                      </span>
                    </div>
                  )}

                  {isPastEvent || event.status === EventStatus.FINISHED ? (
                    <div className="rounded-nonelg flex items-center justify-center border-neutral-200 bg-neutral-50 px-4 py-3 md:border-2">
                      <span className="font-semibold text-neutral-700">
                        Event has ended
                      </span>
                    </div>
                  ) : null}
                </div>

                {/* Action Buttons */}
                <div className="mt-6 space-y-3">
                  {!readOnlyPublic && canManageEvent ? (
                    <button
                      onClick={() => onManageEvent(event)}
                      className="rounded-nonelg flex w-full items-center justify-center bg-primary px-4 py-3 font-bold text-white hover:bg-primary-hover hover:shadow-brutal"
                    >
                      <ClipboardCheckIcon className="mr-2 size-5" />
                      Log Event Report
                    </button>
                  ) : (
                    !readOnlyPublic &&
                    !isPastEvent &&
                    !isCancelled &&
                    currentUser && (
                      <>
                        {!isAttending && !isPending && (
                          <button
                            onClick={handleRsvpClick}
                            className="rounded-nonelg w-full bg-primary px-4 py-3 font-bold text-white hover:bg-primary-hover hover:shadow-brutal"
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
                            className="rounded-nonelg w-full bg-primary px-4 py-3 font-bold text-white hover:bg-primary-hover hover:shadow-brutal"
                          >
                            Update Duties
                          </button>
                        )}
                      </>
                    )
                  )}

                  {/* Cancel RSVP Button */}
                  {!readOnlyPublic &&
                    (isAttending || isPending) &&
                    !isPastEvent &&
                    !isCancelled && (
                      <button
                        onClick={() => onCancelRsvp(event.id)}
                        className="rounded-nonelg w-full border-neutral-800 bg-neutral-800 px-4 py-3 font-bold text-white transition-all hover:bg-neutral-700 hover:shadow-brutal md:border-2"
                      >
                        Cancel RSVP
                      </button>
                    )}

                  {/* Event Management Buttons */}
                  {!readOnlyPublic && canEditEvent && (
                    <button
                      onClick={() => setIsEditModalOpen(true)}
                      className="rounded-nonelg w-full border-black bg-black px-4 py-3 font-bold text-white transition-all hover:bg-neutral-800 hover:shadow-brutal md:border-2"
                    >
                      <PencilIcon className="mr-2 size-5" />
                      Edit Event
                    </button>
                  )}

                  {!readOnlyPublic && canCancelEvent && (
                    <button
                      onClick={() => setIsCancelModalOpen(true)}
                      className="rounded-nonelg w-full border-red-600 bg-red-600 px-4 py-3 font-bold text-white transition-all duration-200 hover:bg-red-700 md:border-2"
                    >
                      <XCircleIcon className="mr-2 size-5" />
                      Cancel Event
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CubeDetail;
