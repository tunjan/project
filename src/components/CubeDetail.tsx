import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

import EditEventModal from '@/components/events/EditEventModal';
import EventDiscussion from '@/components/events/EventDiscussion';
import RequestAccommodationModal from '@/components/events/RequestAccommodationModal';
import { ConfirmationModal } from '@/components/ui';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import CubeMap from './CubeMap';
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
  if (!participant?.user) {
    return null;
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <Link
            to={`/members/${participant.user.id}`}
            className="flex min-w-0 flex-1 items-center"
          >
            <Avatar className="size-12 shrink-0">
              <AvatarImage
                src={participant.user.profilePictureUrl}
                alt={participant.user.name}
              />
              <AvatarFallback>
                {participant.user.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div className="ml-4 min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">
                {participant.user.name}
              </p>
              <p className="truncate text-sm text-muted-foreground">
                {participant.user.role}
              </p>
            </div>
          </Link>

          {isOrganizerView && (
            <div className="ml-4 flex shrink-0 items-center">
              <Button
                onClick={() => onRemove(participant.user.id)}
                variant="ghost"
                size="sm"
                className="size-8 p-0 text-muted-foreground hover:text-destructive"
                aria-label={`Remove ${participant.user.name}`}
              >
                <TrashIcon className="size-4" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
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
    <Card className="border-warning">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Avatar className="size-12">
              <AvatarImage
                src={participant.user.profilePictureUrl}
                alt={participant.user.name}
              />
              <AvatarFallback>
                {participant.user.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div className="ml-4">
              <p className="text-sm font-semibold">{participant.user.name}</p>
              <p className="text-sm text-muted-foreground">
                {participant.user.chapters?.join(', ') ||
                  'No chapters assigned'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button onClick={onDeny} variant="destructive" size="sm">
              Deny
            </Button>
            <Button onClick={onAccept} size="sm">
              Accept
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
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
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Avatar className="size-12">
              <AvatarImage src={host.profilePictureUrl} alt={host.name} />
              <AvatarFallback>
                {host.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div className="ml-4">
              <p className="text-sm font-semibold">{host.name}</p>
              <p className="text-sm text-muted-foreground">
                Can host {host.hostingCapacity}{' '}
                {host.hostingCapacity === 1 ? 'person' : 'people'}
              </p>
            </div>
          </div>
          <Button onClick={() => onRequest(host)} variant="default" size="sm">
            Request Stay
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const StatusBadge: React.FC<{ status: EventStatus; isCancelled?: boolean }> = ({
  status,
  isCancelled,
}) => {
  if (isCancelled) {
    return (
      <Badge variant="destructive">
        <XCircleIcon className="mr-1 size-3" />
        Cancelled
      </Badge>
    );
  }

  if (status === EventStatus.FINISHED) {
    return (
      <Badge variant="secondary">
        <ClipboardCheckIcon className="mr-1 size-3" />
        Finished
      </Badge>
    );
  }

  return (
    <Badge variant="default">
      <ClockIcon className="mr-1 size-3" />
      Upcoming
    </Badge>
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

  const chapterForEvent = allChapters.find((c) => c.name === event.city);

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
        description="Are you sure you want to remove this participant?"
        confirmText="Remove"
        variant="destructive"
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
            <Button
              onClick={onBack}
              variant="ghost"
              className="inline-flex items-center"
            >
              <ChevronLeftIcon className="mr-2 size-5" />
              Back to all cubes
            </Button>
          </div>

          {/* Cancellation Alert */}
          {isCancelled && (
            <Card className="border-destructive bg-destructive/10">
              <CardContent className="p-6">
                <div className="flex items-start">
                  <XCircleIcon className="size-6 shrink-0 text-destructive" />
                  <div className="ml-3">
                    <h3 className="text-lg font-bold text-destructive">
                      This event has been cancelled
                    </h3>
                    {event.cancellationReason && (
                      <p className="mt-1 text-sm text-destructive/80">
                        Reason: {event.cancellationReason}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="gap-8 lg:grid lg:grid-cols-3">
            {/* Main Content Area */}
            <div className="space-y-8 lg:col-span-2">
              {/* Hero Section */}
              <Card>
                <div className="relative">
                  <img
                    src="/default-cube-image.svg"
                    alt="Default cube event"
                    className="h-64 w-full rounded-t-lg object-cover sm:h-80"
                  />
                  <div className="absolute right-4 top-4">
                    <StatusBadge
                      status={event.status}
                      isCancelled={isCancelled}
                    />
                  </div>
                  {event.scope === 'Regional' && (
                    <div className="absolute left-4 top-4">
                      <Badge
                        variant="secondary"
                        className="text-sm font-bold uppercase tracking-wider"
                      >
                        <TagIcon className="mr-1 size-4" />
                        {event.targetRegion} Regional
                      </Badge>
                    </div>
                  )}
                </div>

                <CardContent className="p-8">
                  <div className="mb-6">
                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <MapPinIcon className="size-5 text-primary" />
                        <span className="text-lg font-semibold text-primary">
                          {event.city}
                        </span>
                      </div>
                    </div>
                    <h1 className="text-4xl font-extrabold sm:text-5xl">
                      {event.location}
                    </h1>
                  </div>

                  {/* Event Details */}
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="flex items-start space-x-4">
                      <div className="flex size-12 items-center justify-center rounded-lg bg-primary/10">
                        <CalendarIcon className="size-6 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Date
                        </p>
                        <p className="text-lg font-semibold">
                          {formattedDateRange}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div className="flex size-12 items-center justify-center rounded-lg bg-primary/10">
                        <ClockIcon className="size-6 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Start Time
                        </p>
                        <p className="text-lg font-semibold">{formattedTime}</p>
                      </div>
                    </div>
                  </div>

                  {/* Organizer Section */}
                  <div className="mt-8">
                    <Card>
                      <CardHeader>
                        <CardTitle>Event Organizer</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center">
                          <Avatar className="size-16">
                            <AvatarImage
                              src={event.organizer.profilePictureUrl}
                              alt={event.organizer.name}
                            />
                            <AvatarFallback>
                              {event.organizer.name
                                .split(' ')
                                .map((n) => n[0])
                                .join('')
                                .slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="ml-4">
                            <p className="text-lg font-semibold">
                              {event.organizer.name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {event.organizer.role}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  {chapterForEvent && (
                    <div className="mt-8">
                      <CubeMap
                        events={[event]}
                        chapters={allChapters}
                        onSelectCube={() => {}}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>

              <Tabs defaultValue="discussion" className="w-full">
                <TabsList>
                  {canParticipateInDiscussion && (
                    <TabsTrigger value="discussion">Discussion</TabsTrigger>
                  )}
                  {!readOnlyPublic &&
                    !isPastEvent &&
                    currentUser &&
                    !isRegionalEvent && (
                      <TabsTrigger value="hosts">Available Hosts</TabsTrigger>
                    )}
                  <TabsTrigger value="inventory">Chapter Inventory</TabsTrigger>
                  {isRegionalEvent && !readOnlyPublic && (
                    <TabsTrigger value="roster">Regional Roster</TabsTrigger>
                  )}
                  {canManageParticipants && pendingParticipants.length > 0 && (
                    <TabsTrigger value="pending">
                      Pending Requests ({pendingParticipants.length})
                    </TabsTrigger>
                  )}
                </TabsList>
                <TabsContent value="discussion">
                  {canParticipateInDiscussion && (
                    <Card>
                      <CardContent className="p-8">
                        <EventDiscussion eventId={event.id} />
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
                <TabsContent value="hosts">
                  {!readOnlyPublic &&
                    !isPastEvent &&
                    currentUser &&
                    !isRegionalEvent && (
                      <Card>
                        <CardHeader>
                          <div className="flex items-center space-x-3">
                            <div className="flex size-12 items-center justify-center rounded-lg bg-primary/10">
                              <HomeIcon className="size-6 text-primary" />
                            </div>
                            <CardTitle>Available Hosts</CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent>
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
                              <HomeIcon className="mx-auto size-12 text-muted-foreground" />
                              <p className="mt-4 text-lg font-medium text-muted-foreground">
                                No hosts available yet
                              </p>
                              <p className="mt-2 text-sm text-muted-foreground">
                                Check back later for accommodation options!
                              </p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )}
                </TabsContent>
                <TabsContent value="inventory">
                  <Card>
                    <CardContent className="p-8">
                      <InventoryDisplay
                        chapterName={event.city}
                        showTitle={true}
                        compact={false}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="roster">
                  {isRegionalEvent && !readOnlyPublic && (
                    <Card>
                      <CardContent className="p-8">
                        <EventRoster event={event} />
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
                <TabsContent value="pending">
                  {canManageParticipants && pendingParticipants.length > 0 && (
                    <Card className="border-warning">
                      <CardContent className="p-8">
                        <div className="mb-6">
                          <CardTitle>
                            Pending Join Requests ({pendingParticipants.length})
                          </CardTitle>
                          <p className="mt-2 text-muted-foreground">
                            These activists are not from your chapter and
                            require your approval to attend.
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
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
              </Tabs>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Participants Card */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Participants</CardTitle>
                    <Badge variant="secondary" className="text-sm">
                      <UsersIcon className="mr-2 size-4" />
                      {attendingParticipants.length}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {attendingParticipants
                      .filter((p) => p?.user)
                      .map((p: EventParticipant) => (
                        <ParticipantCard
                          key={p.user.id}
                          participant={p}
                          isOrganizerView={
                            canManageParticipants && !isPastEvent
                          }
                          onRemove={openRemoveParticipantModal}
                        />
                      ))}
                  </div>

                  {/* Status Display */}
                  <div className="mt-6 space-y-3">
                    {!readOnlyPublic && isAttending && (
                      <div className="flex items-center justify-center">
                        <Badge variant="default" className="px-4 py-2 text-sm">
                          <ClipboardCheckIcon className="mr-2 size-4" />
                          Status: Attending
                        </Badge>
                      </div>
                    )}

                    {!readOnlyPublic && isPending && (
                      <div className="flex items-center justify-center">
                        <Badge
                          variant="secondary"
                          className="px-4 py-2 text-sm"
                        >
                          <ClockIcon className="mr-2 size-4" />
                          Status: Request Pending
                        </Badge>
                      </div>
                    )}

                    {isPastEvent || event.status === EventStatus.FINISHED ? (
                      <div className="flex items-center justify-center">
                        <Badge variant="outline" className="px-4 py-2 text-sm">
                          Event has ended
                        </Badge>
                      </div>
                    ) : null}
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-6 space-y-3">
                    {!readOnlyPublic && canManageEvent ? (
                      <Button
                        onClick={() => onManageEvent(event)}
                        className="w-full"
                        size="lg"
                      >
                        <ClipboardCheckIcon className="mr-2 size-5" />
                        Log Event Report
                      </Button>
                    ) : (
                      !readOnlyPublic &&
                      !isPastEvent &&
                      !isCancelled &&
                      currentUser && (
                        <>
                          {!isAttending && !isPending && (
                            <Button
                              onClick={handleRsvpClick}
                              className="w-full"
                              size="lg"
                            >
                              {isRegionalEvent
                                ? 'Sign Up for Duties'
                                : isGuest
                                  ? 'Request to Join'
                                  : 'RSVP to this Cube'}
                            </Button>
                          )}
                          {isAttending && isRegionalEvent && (
                            <Button
                              onClick={handleRsvpClick}
                              className="w-full"
                              size="lg"
                            >
                              Update Duties
                            </Button>
                          )}
                        </>
                      )
                    )}

                    {/* Cancel RSVP Button */}
                    {!readOnlyPublic &&
                      (isAttending || isPending) &&
                      !isPastEvent &&
                      !isCancelled && (
                        <Button
                          onClick={() => onCancelRsvp(event.id)}
                          variant="secondary"
                          size="lg"
                          className="w-full"
                        >
                          Cancel RSVP
                        </Button>
                      )}

                    {/* Event Management Buttons */}
                    {!readOnlyPublic && canEditEvent && (
                      <Button
                        onClick={() => setIsEditModalOpen(true)}
                        variant="outline"
                        size="lg"
                        className="w-full"
                      >
                        <PencilIcon className="mr-2 size-5" />
                        Edit Event
                      </Button>
                    )}

                    {!readOnlyPublic && canCancelEvent && (
                      <Button
                        onClick={() => setIsCancelModalOpen(true)}
                        variant="destructive"
                        size="lg"
                        className="w-full"
                      >
                        <XCircleIcon className="mr-2 size-5" />
                        Cancel Event
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CubeDetail;
