import React, { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCurrentUser } from '@/store/auth.store';
import {
  OnboardingStatus,
  EventStatus,
  ParticipantStatus,
  NotificationType,
} from '@/types';
import {
  useEvents,
  useAnnouncementsState,
  useNotificationsState,
  useChapters,
} from '@/store';
import StatsGrid from '@/components/dashboard/StatsGrid';
import {
  CalendarIcon,
  CheckCircleIcon,
  ShieldExclamationIcon,
  MegaphoneIcon,
  ClockIcon,
  MapPinIcon,
  UsersIcon,
  PencilIcon,
} from '@/icons';
import DashboardSearch from '@/components/dashboard/DashboardSearch';
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
    <div className="flex items-start justify-between">
      <div className="flex items-start gap-3">
        <div className={`${urgent ? 'text-red' : 'text-primary'}`}>{icon}</div>
        <div className="flex-1">
          <h3 className="flex items-center gap-2 font-bold text-black">
            {title}
            {count !== undefined && (
              <span
                className={`rounded-none px-2 py-0.5 text-xs font-bold ${
                  urgent ? 'bg-red text-black' : 'bg-white text-black'
                }`}
              >
                {count}
              </span>
            )}
          </h3>
          <p className="text-grey-600 mt-1 text-sm">{description}</p>
        </div>
      </div>
      {action && (
        <button
          onClick={action}
          className="bg-primary px-3 py-1 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
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
  const allEvents = useEvents();
  const announcements = useAnnouncementsState();
  const notifications = useNotificationsState();
  const allChapters = useChapters();

  useEffect(() => {
    if (!currentUser) {
      navigate('/login', { replace: true });
    } else if (currentUser.onboardingStatus !== OnboardingStatus.CONFIRMED) {
      navigate('/onboarding-status', { replace: true });
    }
  }, [currentUser, navigate]);

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
          icon: <ShieldExclamationIcon className="h-5 w-5" />,
          title: 'Accommodation Requests',
          description: 'Pending requests need your attention',
          count: pendingAccommodations.length,
          action: () => navigate('/management'),
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
          icon: <UsersIcon className="h-5 w-5" />,
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
        icon: <CheckCircleIcon className="h-5 w-5" />,
        title: 'RSVP Approvals',
        description: 'People waiting to attend your events',
        count: pendingRSVPs,
        action: () => navigate('/manage-events'),
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
        <p className="text-grey-600 mt-3 max-w-2xl text-lg">
          Here's what needs your attention today. Use the search bar below to
          find anything on the platform.
        </p>
        <div className="mt-6">
          <DashboardSearch />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="space-y-8 lg:col-span-2">
          {/* Next Event */}
          <section>
            <h2 className="mb-4 border-b-2 border-primary pb-2 text-xl font-bold text-black">
              Your Next Event
            </h2>
            {nextEvent ? (
              <div className="border-2 border-black bg-white p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <CalendarIcon className="mt-1 h-6 w-6 flex-shrink-0 text-primary" />
                    <div>
                      <h3 className="text-lg font-bold text-black">
                        {nextEvent.location}
                      </h3>
                      <div className="text-grey-600 mt-1 flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1">
                          <ClockIcon className="h-4 w-4" />
                          {safeFormatLocaleDate(nextEvent.startDate)}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPinIcon className="h-4 w-4" />
                          {nextEvent.city}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate(`/cubes/${nextEvent.id}`)}
                    className="bg-primary px-4 py-2 font-semibold text-white transition-colors hover:bg-primary-hover"
                  >
                    View Event
                  </button>
                </div>
              </div>
            ) : (
              <div className="border-2 border-black bg-white p-6 text-center">
                <CalendarIcon className="text-grey-500 mx-auto mb-3 h-12 w-12" />
                <h3 className="mb-2 font-bold text-black">
                  No upcoming events
                </h3>
                <p className="text-grey-600 mb-4 text-sm">
                  Find a cube near you or create one yourself.
                </p>
                <button
                  onClick={() => navigate('/cubes')}
                  className="bg-primary px-4 py-2 font-semibold text-white transition-colors hover:bg-primary-hover"
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
                <CheckCircleIcon className="text-white0 mx-auto mb-3 h-12 w-12" />
                <h3 className="mb-2 font-bold text-black">All caught up!</h3>
                <p className="text-grey-600 text-sm">
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
              onCityClick={() => navigate(`/members/${currentUser.id}`)}
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
                      <MegaphoneIcon className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
                      <div>
                        <h3 className="text-sm font-semibold text-black">
                          {announcement.title}
                        </h3>
                        <p className="text-grey-600 mt-1 line-clamp-2 text-xs">
                          {announcement.content}
                        </p>
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-white0 text-xs">
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
                  className="w-full py-2 text-center text-sm font-semibold text-primary hover:text-primary-hover"
                >
                  View All Announcements
                </button>
              </div>
            ) : (
              <div className="border-2 border-black bg-white p-6 text-center">
                <MegaphoneIcon className="text-grey-500 mx-auto mb-2 h-8 w-8" />
                <p className="text-grey-600 text-sm">No recent announcements</p>
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
                className="w-full border-2 border-black bg-white p-4 text-left transition-colors hover:bg-white"
              >
                <div className="flex items-center gap-3">
                  <MapPinIcon className="h-5 w-5 text-primary" />
                  <span className="font-semibold">Find a Cube</span>
                </div>
              </button>
              <button
                onClick={() => navigate('/outreach')}
                className="w-full border-2 border-black bg-white p-4 text-left transition-colors hover:bg-white"
              >
                <div className="flex items-center gap-3">
                  <PencilIcon className="h-5 w-5 text-primary" />
                  <span className="font-semibold">Log Outreach</span>
                </div>
              </button>
              <button
                onClick={() => navigate(`/members/${currentUser.id}`)}
                className="w-full border-2 border-black bg-white p-4 text-left transition-colors hover:bg-white"
              >
                <div className="flex items-center gap-3">
                  <UsersIcon className="h-5 w-5 text-primary" />
                  <span className="font-semibold">View Profile</span>
                </div>
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
