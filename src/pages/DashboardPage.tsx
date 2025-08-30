import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import StatsGrid from '@/components/dashboard/StatsGrid';
import CityAttendanceModal from '@/components/profile/CityAttendanceModal';
import Modal from '@/components/ui/Modal';
import {
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  MapPinIcon,
  MegaphoneIcon,
  PencilIcon,
  ShieldExclamationIcon,
  UsersIcon,
} from '@/icons';
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
import { getCityAttendanceForUser } from '@/utils/analytics';
import { safeFormatLocaleDate } from '@/utils/date';

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
    className={`border-2 border-black bg-white p-4 ${urgent ? 'border-red bg-white' : ''}`}
  >
    <div className="flex justify-between">
      <div className="flex items-start gap-3">
        <div className={`${urgent ? 'text-red' : 'text-primary'}`}>{icon}</div>
        <div className="flex-1">
          <h3 className="flex items-center gap-2 font-bold text-black">
            {title}
            {count !== undefined && (
              <span
                className={`rounded-nonenone px-2 py-0.5 text-xs font-bold ${
                  urgent ? 'bg-red text-black' : 'bg-white text-black'
                }`}
              >
                {count}
              </span>
            )}
          </h3>
          <p className="mt-1 text-sm text-neutral-600">{description}</p>
        </div>
      </div>
      {action && (
        <button
          onClick={action}
          className="bg-black px-3 py-1 text-sm font-semibold text-white hover:bg-primary-hover hover:shadow-brutal"
        >
          {actionText}
        </button>
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

  // Local UI state for onboarding modals
  const [showMasterclassModal, setShowMasterclassModal] = useState(false);
  const [showScheduleCallModal, setShowScheduleCallModal] = useState(false);
  const [selectedOrganiserId, setSelectedOrganiserId] = useState<string>('');
  const [callWhen, setCallWhen] = useState<string>(''); // datetime-local string
  const [contactInfo, setContactInfo] = useState('');
  const [showCityAttendanceModal, setShowCityAttendanceModal] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      navigate('/login', { replace: true });
    }
  }, [currentUser, navigate]);

  // Auto-open onboarding modals based on status/progress
  useEffect(() => {
    if (!currentUser) return;
    const progress = currentUser.onboardingProgress || {};

    // After onboarding call => status AWAITING_FIRST_CUBE: allow pre-confirming masterclass
    if (
      currentUser.onboardingStatus === OnboardingStatus.AWAITING_FIRST_CUBE &&
      !progress.watchedMasterclass
    ) {
      setShowMasterclassModal(true);
      return;
    }

    // After first cube and masterclass confirmed => prompt to schedule revision call
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

    // If awaiting masterclass and haven't confirmed yet, you may still confirm from dashboard
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

    // Get next event for the user
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

    // Get pending tasks based on user role
    const tasks = [];

    // Accommodation requests if organizer
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
          icon: <ShieldExclamationIcon className="size-5" />,
          title: 'Accommodation Requests',
          description: 'Pending requests need your attention',
          count: pendingAccommodations.length,
          action: () => navigate('/manage'),
          urgent: true,
        });
      }

      // New applicants
      const newApplicants = notifications.filter(
        (n) =>
          n.userId === currentUser.id &&
          !n.isRead &&
          n.type === NotificationType.NEW_APPLICANT
      );

      if (newApplicants.length > 0) {
        tasks.push({
          icon: <UsersIcon className="size-5" />,
          title: 'New Applicants',
          description: 'New members awaiting approval',
          count: newApplicants.length,
          action: () => navigate('/manage'),
          urgent: true,
        });
      }
    }

    // RSVP requests if event organizer
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
        icon: <CheckCircleIcon className="size-5" />,
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

    // Get recent announcements relevant to user
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
    <div className="py-8 md:py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold tracking-tight text-black md:text-5xl">
          Welcome back, {currentUser.name.split(' ')[0]}!
        </h1>
        <p className="mt-3 max-w-2xl text-lg text-neutral-600">
          Here's what needs your attention today. Use the search bar in the
          sidebar to find anything on the platform.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Onboarding Modals */}
        {showMasterclassModal && currentUser && (
          <Modal
            title="Masterclass"
            description="Confirm you've completed the AV Masterclass to proceed."
            onClose={() => setShowMasterclassModal(false)}
            size="md"
          >
            <div className="space-y-4">
              <p className="text-sm text-black">
                Have you watched the AV Masterclass? You can pre-confirm even
                before your first Cube, and we'll automatically advance you
                after your first Cube.
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    confirmWatchedMasterclass(currentUser.id);
                    setShowMasterclassModal(false);
                    // If this advances to revision phase, open scheduling
                    setTimeout(() => {
                      if (
                        currentUser?.onboardingStatus ===
                        OnboardingStatus.AWAITING_REVISION_CALL
                      ) {
                        setShowScheduleCallModal(true);
                      }
                    }, 0);
                  }}
                  className="bg-primary px-4 py-2 font-semibold text-white hover:bg-primary-hover hover:shadow-brutal"
                >
                  I watched it
                </button>
                <button
                  onClick={() => setShowMasterclassModal(false)}
                  className="border-2 border-black bg-white px-4 py-2 font-semibold"
                >
                  Not yet
                </button>
              </div>
            </div>
          </Modal>
        )}

        {showScheduleCallModal && currentUser && (
          <Modal
            title={
              currentUser.onboardingStatus ===
              OnboardingStatus.AWAITING_REVISION_CALL
                ? 'Schedule Revision Call'
                : 'Schedule Onboarding Call'
            }
            description="Pick an organiser and time for your call."
            onClose={() => setShowScheduleCallModal(false)}
            size="md"
          >
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="organiser-select"
                  className="mb-1 block text-sm font-semibold text-black"
                >
                  Organiser
                </label>
                <select
                  id="organiser-select"
                  value={selectedOrganiserId}
                  onChange={(e) => setSelectedOrganiserId(e.target.value)}
                  className="w-full border-2 border-black bg-white p-2"
                >
                  <option value="">Select organiser…</option>
                  {allUsers
                    .filter(
                      (u) =>
                        u.role === 'Chapter Organiser' &&
                        u.organiserOf?.some((ch) =>
                          currentUser.chapters.includes(ch)
                        )
                    )
                    .map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name}
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor="call-datetime"
                  className="mb-1 block text-sm font-semibold text-black"
                >
                  Date & Time
                </label>
                <input
                  id="call-datetime"
                  type="datetime-local"
                  value={callWhen}
                  onChange={(e) => setCallWhen(e.target.value)}
                  className="w-full border-2 border-black bg-white p-2"
                />
              </div>
              <div>
                <label
                  htmlFor="contact-info"
                  className="mb-1 block text-sm font-semibold text-black"
                >
                  Contact Info (e.g., WhatsApp, Instagram, Zoom Link)
                </label>
                <input
                  id="contact-info"
                  type="text"
                  value={contactInfo}
                  onChange={(e) => setContactInfo(e.target.value)}
                  className="w-full border-2 border-black bg-white p-2"
                  placeholder="How can the organizer reach you?"
                  required
                />
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    if (!selectedOrganiserId || !callWhen || !contactInfo) {
                      toast.error(
                        'Please fill all fields to schedule the call.'
                      );
                      return;
                    }
                    if (
                      currentUser.onboardingStatus ===
                      OnboardingStatus.AWAITING_REVISION_CALL
                    ) {
                      scheduleRevisionCall(
                        currentUser.id,
                        selectedOrganiserId,
                        new Date(callWhen),
                        contactInfo
                      );
                    } else {
                      scheduleOnboardingCall(
                        currentUser.id,
                        selectedOrganiserId,
                        new Date(callWhen),
                        contactInfo
                      );
                    }
                    setShowScheduleCallModal(false);
                    setContactInfo('');
                  }}
                  disabled={!selectedOrganiserId || !callWhen || !contactInfo}
                  className="bg-primary px-4 py-2 font-semibold text-white transition-all hover:bg-primary-hover hover:shadow-brutal disabled:opacity-50"
                >
                  Schedule
                </button>
                <button
                  onClick={() => setShowScheduleCallModal(false)}
                  className="border-2 border-black bg-white px-4 py-2 font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          </Modal>
        )}
        {/* Main Content */}
        <div className="space-y-8 lg:col-span-2">
          {/* Next Event */}
          <section>
            <h2 className="mb-4 border-b-2 border-primary pb-2 text-xl font-bold text-black">
              Your Next Event
            </h2>
            {nextEvent ? (
              <div
                onClick={() => navigate(`/cubes/${nextEvent.id}`)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    navigate(`/cubes/${nextEvent.id}`);
                  }
                }}
                role="button"
                tabIndex={0}
                className="cursor-pointer border-2 border-black bg-white p-6 transition-all hover:shadow-brutal"
              >
                <div className="flex items-start gap-4">
                  <CalendarIcon className="mt-1 size-6 shrink-0 text-primary" />
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-black">
                      {nextEvent.location}
                    </h3>
                    <div className="mt-1 flex items-center gap-4 text-sm text-neutral-600">
                      <span className="flex items-center gap-1">
                        <ClockIcon className="size-4" />
                        {safeFormatLocaleDate(nextEvent.startDate)}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPinIcon className="size-4" />
                        {nextEvent.city}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="border-2 border-black bg-white p-6 text-center">
                <CalendarIcon className="mx-auto mb-3 size-12 text-neutral-500" />
                <h3 className="mb-2 font-bold text-black">
                  No upcoming events
                </h3>
                <p className="mb-4 text-sm text-neutral-600">
                  Find a cube near you or create one yourself.
                </p>
                <button
                  onClick={() => navigate('/cubes')}
                  className="bg-primary px-4 py-2 font-semibold text-white transition-all hover:bg-primary-hover hover:shadow-brutal"
                >
                  Find Events
                </button>
              </div>
            )}
          </section>

          {/* Pending Tasks */}
          <section>
            <h2 className="mb-4 border-b-2 border-primary pb-2 text-xl font-bold text-black">
              Pending Tasks
            </h2>
            {tasks.length > 0 ? (
              <div className="space-y-4">
                {tasks.map((task, index) => (
                  <TaskItem key={index} {...task} />
                ))}
              </div>
            ) : (
              <div className="border-2 border-black bg-white p-6 text-center">
                <CheckCircleIcon className="mx-auto mb-3 size-12 text-neutral-400" />
                <h3 className="mb-2 font-bold text-black">All caught up!</h3>
                <p className="text-sm text-neutral-600">
                  No pending tasks require your attention.
                </p>
              </div>
            )}
          </section>

          {/* Quick Stats */}
          <section>
            <h2 className="mb-4 border-b-2 border-primary pb-2 text-xl font-bold text-black">
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
            <h2 className="mb-4 border-b-2 border-primary pb-2 text-xl font-bold text-black">
              Announcements
            </h2>
            {relevantAnnouncements.length > 0 ? (
              <div className="space-y-4">
                {relevantAnnouncements.map((announcement) => (
                  <div
                    key={announcement.id}
                    className="border-2 border-black bg-white p-4"
                  >
                    <div className="flex items-start gap-3">
                      <MegaphoneIcon className="mt-0.5 size-5 shrink-0 text-primary" />
                      <div>
                        <h3 className="text-sm font-semibold text-black">
                          {announcement.title}
                        </h3>
                        <p className="mt-1 line-clamp-2 text-xs text-neutral-600">
                          {announcement.content}
                        </p>
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-xs text-neutral-500">
                            {safeFormatLocaleDate(announcement.createdAt)}
                          </span>
                          <span className="rounded bg-white px-2 py-0.5 text-xs font-medium">
                            {announcement.scope}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  onClick={() => navigate('/announcements')}
                  className="w-full py-2 text-center text-sm font-semibold text-primary transition-all hover:text-primary-hover hover:shadow-brutal"
                >
                  View All Announcements
                </button>
              </div>
            ) : (
              <div className="border-2 border-black bg-white p-6 text-center">
                <MegaphoneIcon className="mx-auto mb-2 size-8 text-neutral-500" />
                <p className="text-sm text-neutral-600">
                  No recent announcements
                </p>
              </div>
            )}
          </section>

          {/* Quick Actions */}
          <section>
            <h2 className="mb-4 border-b-2 border-primary pb-2 text-xl font-bold text-black">
              Quick Actions
            </h2>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/cubes')}
                className="w-full border-2 border-black bg-white p-4 text-left transition-all hover:shadow-brutal"
              >
                <div className="flex items-center gap-3">
                  <MapPinIcon className="size-5 text-primary" />
                  <span className="font-semibold">Find a Cube</span>
                </div>
              </button>
              <button
                onClick={() => navigate('/outreach')}
                className="w-full border-2 border-black bg-white p-4 text-left transition-all hover:shadow-brutal"
              >
                <div className="flex items-center gap-3">
                  <PencilIcon className="size-5 text-primary" />
                  <span className="font-semibold">Log Outreach</span>
                </div>
              </button>
              <button
                onClick={() => navigate(`/members/${currentUser.id}`)}
                className="w-full border-2 border-black bg-white p-4 text-left transition-all hover:shadow-brutal"
              >
                <div className="flex items-center gap-3">
                  <UsersIcon className="size-5 text-primary" />
                  <span className="font-semibold">View Profile</span>
                </div>
              </button>
            </div>
          </section>
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
