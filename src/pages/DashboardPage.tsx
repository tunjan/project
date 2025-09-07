import { formatDistanceToNowStrict } from 'date-fns';
import {
  Calendar,
  CheckCircle,
  Clock,
  MapPin,
  Megaphone,
  Pencil,
  ShieldAlert,
  Users,
} from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import StatsGrid from '@/components/dashboard/StatsGrid';
import CityAttendanceModal from '@/components/profile/CityAttendanceModal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DatePicker } from '@/components/ui/date-picker';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useUsers, useUsersActions } from '@/store';
import {
  useAnnouncementsState,
  useChapters,
  useEvents,
  useNotificationsState,
} from '@/store';
import { useCurrentUser } from '@/store/auth.store';
import {
  EventStatus,
  NotificationType,
  OnboardingStatus,
  ParticipantStatus,
} from '@/types';
import { getCityAttendanceForUser } from '@/utils';
import { formatDateSafe } from '@/utils';

interface TaskItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  count?: number;
  action?: () => void;
  actionText?: string;
  urgent?: boolean;
}

const TaskItem: React.FC<TaskItemProps> = ({
  icon,
  title,
  description,
  count,
  action,
  actionText = 'View',
  urgent = false,
}) => (
  <div
    className={`group rounded-lg border bg-card p-4 transition-all duration-200 hover:shadow-md ${
      urgent
        ? 'border-destructive/30 bg-destructive/5 hover:border-destructive/50'
        : 'border-border hover:border-primary/30'
    }`}
  >
    <div className="flex items-center justify-between gap-4">
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <div
          className={`shrink-0 rounded-full p-2 ${
            urgent
              ? 'bg-destructive/10 text-destructive'
              : 'bg-primary/10 text-primary'
          }`}
        >
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex items-center gap-2">
            <h3 className="line-clamp-1 font-semibold text-foreground">
              {title}
            </h3>
            {count !== undefined && (
              <div
                className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                  urgent
                    ? 'bg-destructive text-destructive-foreground'
                    : 'bg-primary text-primary-foreground'
                }`}
              >
                {count}
              </div>
            )}
          </div>
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {description}
          </p>
        </div>
      </div>
      {action && (
        <Button
          onClick={action}
          variant={urgent ? 'destructive' : 'outline'}
          size="sm"
          className="shrink-0"
        >
          {actionText}
        </Button>
      )}
    </div>
  </div>
);

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const currentUser = useCurrentUser();
  const allUsers = useUsers();
  const {
    confirmWatchedMasterclass,
    scheduleRevisionCall,
    scheduleOnboardingCall,
  } = useUsersActions();
  const allEvents = useEvents();
  const announcements = useAnnouncementsState();
  const notifications = useNotificationsState();
  const allChapters = useChapters();

  const [showMasterclassModal, setShowMasterclassModal] = useState(false);
  const [showScheduleCallModal, setShowScheduleCallModal] = useState(false);
  const [selectedOrganiserId, setSelectedOrganiserId] = useState<string>('');
  const [callWhen, setCallWhen] = useState<Date | undefined>();
  const [callTime, setCallTime] = useState<string>('');
  const [contactInfo, setContactInfo] = useState('');
  const [showCityAttendanceModal, setShowCityAttendanceModal] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      navigate('/login', { replace: true });
    }
  }, [currentUser, navigate]);

  useEffect(() => {
    if (!currentUser) return;
    const progress = currentUser.onboardingProgress || {};

    if (
      currentUser.onboardingStatus === OnboardingStatus.AWAITING_FIRST_CUBE &&
      !progress.watchedMasterclass
    ) {
      setShowMasterclassModal(true);
      return;
    }

    if (
      (currentUser.onboardingStatus ===
        OnboardingStatus.AWAITING_REVISION_CALL &&
        !progress.revisionCallScheduledAt) ||
      (currentUser.onboardingStatus ===
        OnboardingStatus.PENDING_ONBOARDING_CALL &&
        !progress.onboardingCallScheduledAt)
    ) {
      setShowScheduleCallModal(true);
      return;
    }

    if (
      currentUser.onboardingStatus === OnboardingStatus.AWAITING_MASTERCLASS &&
      !progress.watchedMasterclass
    ) {
      setShowMasterclassModal(true);
      return;
    }

    setShowMasterclassModal(false);
    setShowScheduleCallModal(false);
  }, [currentUser]);

  const cityAttendanceData = useMemo(
    () => getCityAttendanceForUser(currentUser?.id || '', allEvents),
    [currentUser?.id, allEvents]
  );

  const dashboardData = useMemo(() => {
    if (!currentUser) return null;

    const userEvents = allEvents.filter(
      (event) =>
        event.participants.some((p) => p.user.id === currentUser.id) &&
        event.status === EventStatus.UPCOMING &&
        new Date(event.startDate) > new Date()
    );
    const nextEvent = userEvents.sort(
      (a, b) =>
        new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    )[0];

    const tasks = [];

    if (
      currentUser.role === 'Chapter Organiser' ||
      currentUser.role === 'Regional Organiser' ||
      currentUser.role === 'Global Admin'
    ) {
      const pendingAccommodations = notifications.filter(
        (n) =>
          n.userId === currentUser.id &&
          !n.isRead &&
          n.type === NotificationType.ACCOMMODATION_REQUEST
      );

      if (pendingAccommodations.length > 0) {
        tasks.push({
          icon: <ShieldAlert className="size-5" />,
          title: 'Accommodation Requests',
          description: 'Pending requests need your attention',
          count: pendingAccommodations.length,
          action: () => navigate('/manage'),
          urgent: true,
        });
      }

      const newApplicants = notifications.filter(
        (n) =>
          n.userId === currentUser.id &&
          !n.isRead &&
          n.type === NotificationType.NEW_APPLICANT
      );

      if (newApplicants.length > 0) {
        tasks.push({
          icon: <Users className="size-5" />,
          title: 'New Applicants',
          description: 'New members awaiting approval',
          count: newApplicants.length,
          action: () => navigate('/manage'),
          urgent: true,
        });
      }
    }

    const userOrganizedEvents = allEvents.filter(
      (event) =>
        event.organizer.id === currentUser.id &&
        event.status === EventStatus.UPCOMING
    );

    const pendingRSVPs = userOrganizedEvents.reduce((total, event) => {
      return (
        total +
        event.participants.filter((p) => p.status === ParticipantStatus.PENDING)
          .length
      );
    }, 0);

    if (pendingRSVPs > 0) {
      tasks.push({
        icon: <CheckCircle className="size-5" />,
        title: 'RSVP Approvals',
        description: 'People waiting to attend your events',
        count: pendingRSVPs,
        action: () => navigate('/manage'),
        urgent: false,
      });
    }

    const userCountries = new Set(
      currentUser.chapters
        ?.map((chName) => allChapters.find((c) => c.name === chName)?.country)
        .filter(Boolean) || []
    );

    const relevantAnnouncements = announcements
      .filter((ann) => {
        if (ann.scope === 'Global') return true;
        if (
          ann.scope === 'Regional' &&
          ann.country &&
          userCountries.has(ann.country)
        ) {
          return true;
        }
        if (
          ann.scope === 'Chapter' &&
          ann.chapter &&
          currentUser.chapters?.includes(ann.chapter)
        )
          return true;
        return false;
      })
      .slice(0, 3);

    return {
      nextEvent,
      tasks,
      relevantAnnouncements,
    };
  }, [
    currentUser,
    allEvents,
    announcements,
    notifications,
    navigate,
    allChapters,
  ]);

  if (!currentUser) {
    return (
      <div className="py-16 text-center">
        <p>Redirecting...</p>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="py-16 text-center">
        <p>Loading...</p>
      </div>
    );
  }

  const { nextEvent, tasks, relevantAnnouncements } = dashboardData;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-7xl px-4">
        {/* Header Section */}
        <div className="mb-8">
          <div className="mb-6 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                Welcome back, {currentUser.name.split(' ')[0]}!
              </h1>
              <p className="mt-2 text-muted-foreground">
                Here's what needs your attention today. Use the search bar in
                the sidebar to find anything on the platform.
              </p>
            </div>
          </div>
          <Separator />
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Onboarding Modals */}
          {showMasterclassModal && currentUser && (
            <Dialog
              open={showMasterclassModal}
              onOpenChange={setShowMasterclassModal}
            >
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Masterclass</DialogTitle>
                  <DialogDescription>
                    Confirm you've completed the AV Masterclass to proceed.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <p className="text-sm text-foreground">
                    Have you watched the AV Masterclass? You can pre-confirm
                    even before your first Cube, and we'll automatically advance
                    you after your first Cube.
                  </p>
                  <div className="flex items-center gap-3">
                    <Button
                      onClick={() => {
                        confirmWatchedMasterclass(currentUser.id);
                        setShowMasterclassModal(false);
                        setTimeout(() => {
                          if (
                            currentUser?.onboardingStatus ===
                            OnboardingStatus.AWAITING_REVISION_CALL
                          ) {
                            setShowScheduleCallModal(true);
                          }
                        }, 0);
                      }}
                    >
                      I watched it
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => setShowMasterclassModal(false)}
                    >
                      Not yet
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}

          {showScheduleCallModal && currentUser && (
            <Dialog
              open={showScheduleCallModal}
              onOpenChange={setShowScheduleCallModal}
            >
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {currentUser.onboardingStatus ===
                    OnboardingStatus.AWAITING_REVISION_CALL
                      ? 'Schedule Revision Call'
                      : 'Schedule Onboarding Call'}
                  </DialogTitle>
                  <DialogDescription>
                    Pick an organiser and time for your call.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label
                      htmlFor="organiser-select"
                      className="mb-1 block text-sm font-semibold text-foreground"
                    >
                      Organiser
                    </Label>
                    <Select
                      value={selectedOrganiserId}
                      onValueChange={setSelectedOrganiserId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select organiser…" />
                      </SelectTrigger>
                      <SelectContent>
                        {allUsers
                          .filter(
                            (u) =>
                              u.role === 'Chapter Organiser' &&
                              u.organiserOf?.some((ch) =>
                                currentUser.chapters.includes(ch)
                              )
                          )
                          .map((u) => (
                            <SelectItem key={u.id} value={u.id}>
                              {u.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label
                      htmlFor="call-datetime"
                      className="mb-1 block text-sm font-semibold text-foreground"
                    >
                      Date & Time
                    </Label>
                    <div className="grid grid-cols-2 gap-2">
                      <DatePicker
                        date={callWhen}
                        onDateChange={setCallWhen}
                        placeholder="Select date"
                      />
                      <Input
                        id="call-time"
                        type="time"
                        value={callTime}
                        onChange={(e) => setCallTime(e.target.value)}
                        className="w-full"
                      />
                    </div>
                  </div>
                  <div>
                    <Label
                      htmlFor="contact-info"
                      className="mb-1 block text-sm font-semibold text-foreground"
                    >
                      Contact Info (e.g., WhatsApp, Instagram, Zoom Link)
                    </Label>
                    <Input
                      id="contact-info"
                      type="text"
                      value={contactInfo}
                      onChange={(e) => setContactInfo(e.target.value)}
                      className="w-full"
                      placeholder="How can the organizer reach you?"
                      required
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <Button
                      onClick={() => {
                        if (
                          !selectedOrganiserId ||
                          !callWhen ||
                          !callTime ||
                          !contactInfo
                        ) {
                          toast.error(
                            'Please fill all fields to schedule the call.'
                          );
                          return;
                        }

                        // Combine date and time into a single Date object
                        const [hours, minutes] = callTime
                          .split(':')
                          .map(Number);
                        const combinedDateTime = new Date(callWhen);
                        combinedDateTime.setHours(hours, minutes, 0, 0);

                        if (
                          currentUser.onboardingStatus ===
                          OnboardingStatus.AWAITING_REVISION_CALL
                        ) {
                          scheduleRevisionCall(
                            currentUser.id,
                            selectedOrganiserId,
                            combinedDateTime,
                            contactInfo
                          );
                        } else {
                          scheduleOnboardingCall(
                            currentUser.id,
                            selectedOrganiserId,
                            combinedDateTime,
                            contactInfo
                          );
                        }
                        setShowScheduleCallModal(false);
                        setContactInfo('');
                        setCallWhen(undefined);
                        setCallTime('');
                      }}
                      disabled={
                        !selectedOrganiserId ||
                        !callWhen ||
                        !callTime ||
                        !contactInfo
                      }
                    >
                      Schedule
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => setShowScheduleCallModal(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
          {/* Main Content */}
          <div className="space-y-8 lg:col-span-2">
            {/* Next Event */}
            <section>
              <h2 className="mb-6 text-xl font-semibold text-foreground">
                Your Next Event
              </h2>
              {nextEvent ? (
                <div
                  className="group relative cursor-pointer overflow-hidden rounded-lg border border-primary/30 bg-card p-6 transition-all duration-200 hover:border-primary/50 hover:shadow-lg"
                  onClick={() => navigate(`/cubes/${nextEvent.id}`)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      navigate(`/cubes/${nextEvent.id}`);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label={`View your next event: ${nextEvent.location} in ${nextEvent.city}`}
                >
                  <div className="space-y-4">
                    {/* Event Title */}
                    <div>
                      <h3 className="line-clamp-1 text-xl font-bold text-foreground">
                        {nextEvent.location}
                      </h3>
                    </div>

                    {/* Event Details */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <div className="shrink-0 rounded-full bg-primary/10 p-1.5">
                          <Clock className="size-4 text-primary" />
                        </div>
                        <span className="font-medium">
                          {new Date(nextEvent.startDate).toLocaleDateString(
                            [],
                            {
                              weekday: 'long',
                              month: 'long',
                              day: 'numeric',
                              year: 'numeric',
                            }
                          )}{' '}
                          at{' '}
                          {new Date(nextEvent.startDate).toLocaleTimeString(
                            [],
                            {
                              hour: 'numeric',
                              minute: '2-digit',
                            }
                          )}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <div className="shrink-0 rounded-full bg-primary/10 p-1.5">
                          <MapPin className="size-4 text-primary" />
                        </div>
                        <span className="font-medium">{nextEvent.city}</span>
                      </div>
                    </div>

                    {/* Countdown */}
                    <div className="flex items-center gap-3 border-t border-border pt-3">
                      <div className="shrink-0 rounded-full bg-primary/10 p-1.5">
                        <Calendar className="size-4 text-primary" />
                      </div>
                      <span className="text-sm font-semibold text-primary">
                        {formatDistanceToNowStrict(
                          new Date(nextEvent.startDate),
                          { addSuffix: true }
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Calendar className="mx-auto mb-4 size-12 text-muted-foreground" />
                    <h3 className="mb-3 text-lg font-semibold text-foreground">
                      No upcoming events
                    </h3>
                    <p className="mb-6 text-muted-foreground">
                      Find a cube near you or create one yourself.
                    </p>
                    <Button onClick={() => navigate('/cubes')}>
                      Find Events
                    </Button>
                  </CardContent>
                </Card>
              )}
            </section>

            {/* Pending Tasks */}
            <section>
              <h2 className="mb-6 text-xl font-semibold text-foreground">
                Pending Tasks
              </h2>
              {tasks.length > 0 ? (
                <div className="space-y-4">
                  {tasks.map((task, index) => (
                    <TaskItem key={index} {...task} />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-6 text-center">
                    <CheckCircle className="mx-auto mb-3 size-12 text-muted-foreground" />
                    <h3 className="mb-2 font-semibold text-foreground">
                      All caught up!
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      No pending tasks require your attention.
                    </p>
                  </CardContent>
                </Card>
              )}
            </section>

            {/* Quick Stats */}
            <section>
              <h2 className="mb-6 text-xl font-semibold text-foreground">
                Your Impact
              </h2>
              <StatsGrid
                stats={currentUser.stats}
                showPrivateStats={true}
                onCityClick={() => {
                  setShowCityAttendanceModal(true);
                }}
              />
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Recent Announcements */}
            <section>
              <h2 className="mb-6 text-xl font-semibold text-foreground">
                Announcements
              </h2>
              {relevantAnnouncements.length > 0 ? (
                <div className="space-y-4">
                  {relevantAnnouncements.map((announcement) => (
                    <Card key={announcement.id}>
                      <CardContent className="p-4">
                        <div>
                          <h3 className="text-sm font-semibold text-foreground">
                            {announcement.title}
                          </h3>
                          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                            {announcement.content}
                          </p>
                          <div className="mt-4 flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">
                              {formatDateSafe(announcement.createdAt, (d, o) =>
                                d.toLocaleDateString(undefined, o)
                              )}
                            </span>
                            <Badge variant="secondary" className="text-xs">
                              {announcement.scope}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  <Button
                    onClick={() => navigate('/announcements')}
                    variant="outline"
                    className="w-full"
                  >
                    View All Announcements
                  </Button>
                </div>
              ) : (
                <Card>
                  <CardContent className="p-6 text-center">
                    <Megaphone className="mx-auto mb-2 size-8 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      No recent announcements
                    </p>
                  </CardContent>
                </Card>
              )}
            </section>

            {/* Quick Actions */}
            <section>
              <h2 className="mb-6 text-xl font-semibold text-foreground">
                Quick Actions
              </h2>
              <div className="space-y-3">
                <Button
                  onClick={() => navigate('/cubes')}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <MapPin className="mr-3 size-5 text-primary" />
                  Find a Cube
                </Button>
                <Button
                  onClick={() => navigate('/outreach')}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <Pencil className="mr-3 size-5 text-primary" />
                  Log Outreach
                </Button>
                <Button
                  onClick={() => navigate(`/members/${currentUser.id}`)}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <Users className="mr-3 size-5 text-primary" />
                  View Profile
                </Button>
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* City Attendance Modal */}
      {showCityAttendanceModal && currentUser && (
        <CityAttendanceModal
          userName={currentUser.name}
          attendanceData={cityAttendanceData}
          onClose={() => setShowCityAttendanceModal(false)}
        />
      )}
    </div>
  );
};

export default DashboardPage;
