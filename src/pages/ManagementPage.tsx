import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCurrentUser } from '@/store/auth.store';
import { useUsers, useChapters, useEvents, useNotifications } from '@/store';
import OnboardingPipeline from '@/components/management/OnboardingPipeline';
import MemberDirectory from '@/components/management/MemberDirectory';
import ChapterManagement from '@/components/management/ChapterManagement';
import ChapterInventory from '@/components/management/ChapterInventory';
import {
  BuildingOfficeIcon,
  ClipboardCheckIcon,
  ShieldExclamationIcon,
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  TrendingUpIcon,
  UserGroupIcon,
  ClipboardListIcon,
  HomeIcon,
} from '@/icons';
import { useChapterInventory, useInventoryActions } from '@/store';
import {
  type User,
  Role,
  OnboardingStatus,
  type Chapter,
  EventStatus,
  NotificationType,
  type CubeEvent,
} from '@/types';
import { ROLE_HIERARCHY } from '@/utils/auth';

type ManagementView =
  | 'dashboard'
  | 'pipeline'
  | 'members'
  | 'chapters'
  | 'inventory';

interface ManagementTaskProps {
  icon: React.ReactNode;
  title: string;
  count: number;
  description: string;
  onClick: () => void;
  priority: 'high' | 'medium' | 'low';
}

const ManagementTask: React.FC<ManagementTaskProps> = ({
  icon,
  title,
  count,
  description,
  onClick,
  priority,
}) => {
  const priorityStyles = {
    high: 'border-l-4 border-red-500 bg-red-50',
    medium: 'border-l-4 border-orange-500 bg-orange-50',
    low: 'border-l-4 border-blue-500 bg-blue-50',
  };

  return (
    <div
      className={`card-brutal card-padding ${priorityStyles[priority]} hover:shadow-brutal-lg cursor-pointer transition-all hover:scale-[1.02]`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="text-2xl text-primary">{icon}</div>
          <div>
            <div className="mb-2 flex items-center gap-2">
              <h3 className="h-card">{title}</h3>
              <span className="tag-brutal">{count}</span>
            </div>
            <p className="text-sm text-neutral-600">{description}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

interface UpcomingEventCardProps {
  event: CubeEvent;
  onManage: () => void;
}

const UpcomingEventCard: React.FC<UpcomingEventCardProps> = ({
  event,
  onManage,
}) => (
  <div className="card-brutal card-padding">
    <div className="flex items-start justify-between">
      <div className="flex items-start gap-4">
        <CalendarIcon className="mt-1 h-6 w-6 flex-shrink-0 text-primary" />
        <div>
          <h3 className="h-card">{event.location}</h3>
          <div className="mt-1 flex items-center gap-4 text-sm text-neutral-600">
            <span className="flex items-center gap-1">
              <ClockIcon className="h-4 w-4" />
              {new Date(event.startDate).toLocaleDateString()}
            </span>
            <span className="flex items-center gap-1">
              <MapPinIcon className="h-4 w-4" />
              {event.city}
            </span>
          </div>
          <div className="mt-2 text-sm text-neutral-700">
            {event.participants.length} participants
          </div>
        </div>
      </div>
      <button onClick={onManage} className="btn-primary">
        Manage Event
      </button>
    </div>
  </div>
);

const TabButton: React.FC<{
  onClick: () => void;
  isActive: boolean;
  children: React.ReactNode;
}> = ({ onClick, isActive, children }) => (
  <button
    onClick={onClick}
    className={`flex w-full items-center space-x-3 border-l-4 p-4 text-left text-sm font-bold transition-colors duration-200 ${
      isActive
        ? 'border-primary bg-neutral-100 text-black'
        : 'border-transparent text-neutral-500 hover:border-neutral-300 hover:bg-neutral-50 hover:text-black'
    }`}
  >
    {children}
  </button>
);

const ManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const currentUser = useCurrentUser();
  const allUsers = useUsers();
  const allChapters = useChapters();
  const allEvents = useEvents();
  const notifications = useNotifications();
  const { updateChapterInventory } = useInventoryActions();

  const [view, setView] = useState<ManagementView>('dashboard');
  const [selectedChapterForInventory, setSelectedChapterForInventory] =
    useState<string>('');

  const manageableChapters = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === 'Global Admin') return allChapters;
    return allChapters.filter((c) => currentUser.organiserOf?.includes(c.name));
  }, [currentUser, allChapters]);

  // Set default chapter for inventory when manageable chapters are available
  const defaultChapter = useMemo(() => {
    if (manageableChapters.length > 0) {
      return manageableChapters[0].name;
    }
    return '';
  }, [manageableChapters]);

  React.useEffect(() => {
    if (!selectedChapterForInventory && defaultChapter) {
      setSelectedChapterForInventory(defaultChapter);
    }
  }, [selectedChapterForInventory, defaultChapter]);

  const chapterInventory = useChapterInventory(selectedChapterForInventory);

  const dashboardTasks: ManagementTaskProps[] = useMemo(() => {
    if (!currentUser) return [];

    const newApplicants = allUsers.filter(
      (u) => u.onboardingStatus === OnboardingStatus.PENDING_APPLICATION_REVIEW
    ).length;

    const accommodationRequests = notifications.filter(
      (n) => n.type === NotificationType.ACCOMMODATION_REQUEST
    ).length;

    const inactiveMembers = allUsers.filter((user) => {
      if (user.onboardingStatus !== OnboardingStatus.CONFIRMED) return false;
      const lastLogin = new Date(user.lastLogin);
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      if (lastLogin < threeMonthsAgo) return true;

      const recentEvents = allEvents.filter(
        (event) =>
          new Date(event.startDate) > threeMonthsAgo &&
          event.participants.some((p) => p.user.id === user.id)
      );

      return recentEvents.length === 0;
    }).length;

    return [
      {
        icon: <UserGroupIcon className="h-8 w-8" />,
        title: 'New Applicants to Review',
        count: newApplicants,
        description: 'Review and approve new applicants to the platform.',
        onClick: () => setView('pipeline'),
        priority: 'high',
      },
      {
        icon: <ShieldExclamationIcon className="h-8 w-8" />,
        title: 'Pending Accommodation Requests',
        count: accommodationRequests,
        description: 'Address accessibility needs for upcoming events.',
        onClick: () => {
          /* This should ideally link to a pre-filtered view */
        },
        priority: 'medium',
      },
      {
        icon: <TrendingUpIcon className="h-8 w-8" />,
        title: 'Inactive Members to Re-engage',
        count: inactiveMembers,
        description:
          'Reach out to members who have been inactive for over 3 months.',
        onClick: () => setView('members'),
        priority: 'low',
      },
    ];
  }, [currentUser, allUsers, notifications, allEvents]);

  const upcomingEvents = useMemo(() => {
    const now = new Date();
    return allEvents.filter(
      (event) =>
        event.organizer.id === currentUser?.id &&
        event.status === EventStatus.UPCOMING &&
        new Date(event.startDate) > now
    );
  }, [allEvents, currentUser]);

  const {
    visibleMembers,
    manageableChapters: manageableChaptersForDirectory,
    filterableChaptersForDirectory,
    onboardingUsers,
    canManageChapters,
  } = useMemo<{
    visibleMembers: User[];
    manageableChapters: Chapter[];
    filterableChaptersForDirectory: Chapter[];
    onboardingUsers: User[];
    canManageChapters: boolean;
  }>(() => {
    if (!currentUser) {
      return {
        visibleMembers: [],
        manageableChapters: [],
        filterableChaptersForDirectory: [],
        onboardingUsers: [],
        canManageChapters: false,
      };
    }

    const currentUserLevel = ROLE_HIERARCHY[currentUser.role];
    const canManageChapters =
      currentUserLevel >= ROLE_HIERARCHY[Role.REGIONAL_ORGANISER];

    const managedChapterNames = new Set<string>(
      currentUser.role === 'Global Admin'
        ? allChapters.map((c) => c.name)
        : currentUser.organiserOf || []
    );

    const visibleMembers: User[] =
      currentUser.role === 'Global Admin'
        ? allUsers
        : allUsers.filter((u) =>
            u.chapters.some((c) => managedChapterNames.has(c))
          );

    const filterableChaptersForDirectory: Chapter[] =
      currentUser.role === 'Global Admin'
        ? allChapters
        : allChapters.filter((c) => managedChapterNames.has(c.name));

    const onboardingUsers = allUsers.filter(
      (u) =>
        u.onboardingStatus === OnboardingStatus.PENDING_APPLICATION_REVIEW ||
        u.onboardingStatus === OnboardingStatus.AWAITING_VERIFICATION
    );

    return {
      visibleMembers,
      manageableChapters,
      filterableChaptersForDirectory,
      onboardingUsers,
      canManageChapters,
    };
  }, [currentUser, allUsers, allChapters, manageableChapters]);

  if (!currentUser) return null;

  const handleSelectUser = (user: User) =>
    navigate(`/manage/member/${user.id}`);

  const renderContent = () => {
    switch (view) {
      case 'dashboard':
        return (
          <div>
            <div className="mb-8">
              <h2 className="mb-4 text-2xl font-bold">Actionable Tasks</h2>
              <div className="space-y-4">
                {dashboardTasks.map((task) => (
                  <ManagementTask key={task.title} {...task} />
                ))}
              </div>
            </div>
            <div>
              <h2 className="mb-4 text-2xl font-bold">Upcoming Events</h2>
              <div className="space-y-4">
                {upcomingEvents.map((event) => (
                  <UpcomingEventCard
                    key={event.id}
                    event={event}
                    onManage={() => navigate(`/manage/event/${event.id}`)}
                  />
                ))}
              </div>
            </div>
          </div>
        );
      case 'pipeline':
        return (
          <OnboardingPipeline
            users={onboardingUsers}
            onNavigate={handleSelectUser}
          />
        );
      case 'members':
        return (
          <div>
            <h2 className="mb-4 border-b-2 border-primary pb-2 text-2xl font-bold text-black">
              Member Directory
            </h2>
            <MemberDirectory
              members={visibleMembers}
              onSelectUser={handleSelectUser}
              filterableChapters={filterableChaptersForDirectory}
            />
          </div>
        );
      case 'chapters':
        return (
          canManageChapters && (
            <div>
              <h2 className="mb-4 border-b-2 border-primary pb-2 text-2xl font-bold text-black">
                Chapter Administration
              </h2>
              <ChapterManagement
                chapters={manageableChaptersForDirectory}
                currentUser={currentUser}
              />
            </div>
          )
        );
      case 'inventory':
        return (
          <div>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="border-b-2 border-primary pb-2 text-2xl font-bold text-black">
                Chapter Inventory
              </h2>
              {(currentUser?.chapters.length || 0) > 1 && (
                <select
                  value={selectedChapterForInventory}
                  onChange={(e) =>
                    setSelectedChapterForInventory(e.target.value)
                  }
                  className="border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none"
                >
                  {currentUser?.chapters.map((chapterName) => (
                    <option key={chapterName} value={chapterName}>
                      {chapterName}
                    </option>
                  ))}
                  {currentUser?.role === 'Global Admin' &&
                    allChapters
                      .filter((ch) => !currentUser.chapters.includes(ch.name))
                      .map((chapter) => (
                        <option key={chapter.name} value={chapter.name}>
                          {chapter.name}
                        </option>
                      ))}
                </select>
              )}
            </div>
            {selectedChapterForInventory ? (
              <ChapterInventory
                chapterName={selectedChapterForInventory}
                inventory={chapterInventory}
                onUpdateInventory={(items) =>
                  updateChapterInventory(selectedChapterForInventory, items)
                }
              />
            ) : (
              <div className="border-2 border-gray-200 bg-gray-50 p-8 text-center">
                <h3 className="text-lg font-bold text-gray-900">
                  No Chapter Selected
                </h3>
                <p className="mt-1 text-gray-600">
                  You need to be part of a chapter to manage inventory.
                </p>
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="py-12">
      <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-black md:text-5xl">
            Management
          </h1>
          <p className="mt-2 max-w-2xl text-lg text-neutral-600">
            Oversee activists, chapters, and onboarding processes.
          </p>
        </div>
        {/* <Link to="/management/create-chapter">
          <button className="btn-primary">
            <PlusIcon className="mr-2 h-5 w-5" />
            Create Chapter
          </button>
        </Link> */}
      </div>

      <div className="mb-8 border-b-2 border-black">
        <nav className="flex flex-row space-x-2 overflow-x-auto border border-black bg-white p-2 md:flex-col md:space-x-0 md:space-y-1 md:p-2">
          <TabButton
            onClick={() => setView('dashboard')}
            isActive={view === 'dashboard'}
          >
            <HomeIcon className="h-5 w-5 flex-shrink-0" />
            <span className="flex-grow">Priority Tasks</span>
          </TabButton>
          <TabButton
            onClick={() => setView('pipeline')}
            isActive={view === 'pipeline'}
          >
            <ClipboardCheckIcon className="h-5 w-5 flex-shrink-0" />
            <span className="flex-grow">Onboarding & Requests</span>
          </TabButton>
          <TabButton
            onClick={() => setView('members')}
            isActive={view === 'members'}
          >
            <UserGroupIcon className="h-5 w-5 flex-shrink-0" />
            <span className="flex-grow">Member Directory</span>
          </TabButton>
          {canManageChapters && (
            <TabButton
              onClick={() => setView('chapters')}
              isActive={view === 'chapters'}
            >
              <BuildingOfficeIcon className="h-5 w-5 flex-shrink-0" />
              <span className="flex-grow">Chapters</span>
            </TabButton>
          )}
          <TabButton
            onClick={() => setView('inventory')}
            isActive={view === 'inventory'}
          >
            <ClipboardListIcon className="h-5 w-5 flex-shrink-0" />
            <span className="flex-grow">Inventory</span>
          </TabButton>
        </nav>
      </div>
      <div>{renderContent()}</div>
    </div>
  );
};

export default ManagementPage;
