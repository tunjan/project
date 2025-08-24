import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCurrentUser } from '@/store/auth.store';
import {
  useUsers,
  useChapters,
  useEvents,
  useChapterJoinRequests,
} from '@/store';
import OnboardingPipeline from '@/components/management/OnboardingPipeline';
import MemberDirectory from '@/components/management/MemberDirectory';
import ChapterManagement from '@/components/management/ChapterManagement';
import ChapterInventory from '@/components/management/ChapterInventory';
import {
  BuildingOfficeIcon,
  ClipboardCheckIcon,
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
  type CubeEvent,
  type ChapterJoinRequest,
} from '@/types';
import { ROLE_HIERARCHY } from '@/utils/auth';
import { isUserInactive } from '@/utils/user';

type ManagementView =
  | 'dashboard'
  | 'pipeline'
  | 'members'
  | 'chapters'
  | 'inventory';

interface MemberFilter {
  status?: OnboardingStatus;
  showInactiveOnly?: boolean;
}

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
      className={`card-brutal card-padding ${priorityStyles[priority]} cursor-pointer transition-all hover:scale-[1.02] hover:shadow-brutal-lg`}
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
  const chapterJoinRequests = useChapterJoinRequests();
  const { updateChapterInventory } = useInventoryActions();

  const [view, setView] = useState<ManagementView>('dashboard');
  const [selectedChapterForInventory, setSelectedChapterForInventory] =
    useState<string>('');
  const [memberFilter, setMemberFilter] = useState<MemberFilter>({});

  const manageableChapters = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === 'Global Admin') return allChapters;

    // For Chapter Organisers, they can manage chapters they organize
    if (currentUser.role === 'Chapter Organiser') {
      return allChapters.filter((c) =>
        currentUser.organiserOf?.includes(c.name)
      );
    }

    // For Regional Organisers, they can manage chapters in their region
    if (
      currentUser.role === 'Regional Organiser' &&
      currentUser.managedCountry
    ) {
      return allChapters.filter(
        (c) => c.country === currentUser.managedCountry
      );
    }

    // For other roles, they can only manage chapters they organize
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

    return [
      {
        icon: <UserGroupIcon className="h-8 w-8" />,
        title: 'New Applicants to Review',
        count: newApplicants,
        description: 'Review and approve new applicants to the platform.',
        onClick: () => {
          handleViewChange('pipeline');
          // The OnboardingPipeline already filters to show only PENDING_APPLICATION_REVIEW users
        },
        priority: 'high',
      },
    ];
  }, [currentUser, allUsers]);

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
    visibleChapterJoinRequests,
  } = useMemo<{
    visibleMembers: User[];
    manageableChapters: Chapter[];
    filterableChaptersForDirectory: Chapter[];
    onboardingUsers: User[];
    canManageChapters: boolean;
    visibleChapterJoinRequests: ChapterJoinRequest[];
  }>(() => {
    if (!currentUser) {
      return {
        visibleMembers: [],
        manageableChapters: [],
        filterableChaptersForDirectory: [],
        onboardingUsers: [],
        canManageChapters: false,
        visibleChapterJoinRequests: [],
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

    // Add chapters from managed country for Regional Organisers
    if (
      currentUser.role === Role.REGIONAL_ORGANISER &&
      currentUser.managedCountry
    ) {
      allChapters
        .filter((c) => c.country === currentUser.managedCountry)
        .forEach((c) => managedChapterNames.add(c.name));
    }

    const visibleMembers: User[] = (() => {
      let members =
        currentUser.role === 'Global Admin'
          ? allUsers
          : allUsers.filter((u) =>
              u.chapters?.some((c) => managedChapterNames.has(c))
            );

      // Apply member filter if set
      if (memberFilter.status) {
        members = members.filter(
          (u) => u.onboardingStatus === memberFilter.status
        );
      }

      return members;
    })();

    const filterableChaptersForDirectory: Chapter[] =
      currentUser.role === 'Global Admin'
        ? allChapters
        : allChapters.filter((c) => managedChapterNames.has(c.name));

    const onboardingUsers = allUsers.filter(
      (u) =>
        (u.onboardingStatus === OnboardingStatus.PENDING_APPLICATION_REVIEW ||
          u.onboardingStatus === OnboardingStatus.AWAITING_VERIFICATION) &&
        // Ensure onboarding users are also within the current user's scope
        (currentUserLevel >= ROLE_HIERARCHY[Role.GLOBAL_ADMIN] ||
          u.chapters?.some((c) => managedChapterNames.has(c)))
    );

    // Filter chapter join requests to only show requests for chapters the current user can manage
    const visibleChapterJoinRequests = chapterJoinRequests.filter((req) =>
      managedChapterNames.has(req.chapterName)
    );

    return {
      visibleMembers,
      manageableChapters,
      filterableChaptersForDirectory,
      onboardingUsers,
      canManageChapters,
      visibleChapterJoinRequests,
    };
  }, [
    currentUser,
    allUsers,
    allChapters,
    manageableChapters,
    memberFilter,
    chapterJoinRequests,
  ]);

  // Calculate inactive count based on the members the organizer can actually see
  const inactiveMembersCount = useMemo(() => {
    return visibleMembers.filter((user) => isUserInactive(user, allEvents))
      .length;
  }, [visibleMembers, allEvents]);
  const inactiveMembers = useMemo(() => {
    return visibleMembers.filter((user) => isUserInactive(user, allEvents));
  }, [visibleMembers, allEvents]);

  // Add inactive members task if there are any inactive members
  const dashboardTasksWithInactive: ManagementTaskProps[] = useMemo(() => {
    if (inactiveMembersCount > 0) {
      return [
        {
          icon: <TrendingUpIcon className="h-8 w-8" />,
          title: 'Inactive Members to Re-engage',
          count: inactiveMembersCount,
          description:
            'Reach out to members who have been inactive for over 3 months.',
          onClick: () => {
            handleViewChange('members');
            // Pre-filter to show only inactive members
            setMemberFilter({
              status: OnboardingStatus.CONFIRMED,
              showInactiveOnly: true,
            });
          },
          priority: 'low',
        },
      ];
    } else {
      return [...dashboardTasks];
    }
  }, [dashboardTasks, inactiveMembersCount]);

  if (!currentUser) return null;

  const handleSelectUser = (user: User) =>
    navigate(`/manage/member/${user.id}`);

  const handleViewChange = (newView: ManagementView) => {
    setView(newView);
    // Clear member filter when switching views
    if (newView !== 'members') {
      setMemberFilter({});
    }
  };

  const renderContent = () => {
    switch (view) {
      case 'dashboard':
        return (
          <div>
            <div className="mb-8">
              <h2 className="mb-4 text-2xl font-bold">Actionable Tasks</h2>
              <div className="space-y-4">
                {dashboardTasksWithInactive.map((task) => (
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
              members={
                memberFilter.showInactiveOnly ? inactiveMembers : visibleMembers
              }
              onSelectUser={handleSelectUser}
              filterableChapters={filterableChaptersForDirectory}
              pendingRequests={visibleChapterJoinRequests}
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
              {manageableChapters.length > 1 && (
                <select
                  value={selectedChapterForInventory}
                  onChange={(e) =>
                    setSelectedChapterForInventory(e.target.value)
                  }
                  className="border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none"
                >
                  {manageableChapters.map((chapter) => (
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
            ) : manageableChapters.length === 0 ? (
              <div className="border-2 border-gray-200 bg-gray-50 p-8 text-center">
                <h3 className="text-lg font-bold text-gray-900">
                  No Manageable Chapters
                </h3>
                <p className="mt-1 text-gray-600">
                  You don't have permission to manage inventory for any
                  chapters.
                </p>
              </div>
            ) : (
              <div className="border-2 border-gray-200 bg-gray-50 p-8 text-center">
                <h3 className="text-lg font-bold text-gray-900">
                  No Chapter Selected
                </h3>
                <p className="mt-1 text-gray-600">
                  Please select a chapter to manage its inventory.
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

      <div className="mb-8 border-2 border-black">
        <nav className="flex flex-row space-x-2 overflow-x-auto border border-black bg-white p-2 md:flex-col md:space-x-0 md:space-y-1 md:p-2">
          <TabButton
            onClick={() => handleViewChange('dashboard')}
            isActive={view === 'dashboard'}
          >
            <HomeIcon className="h-5 w-5 flex-shrink-0" />
            <span className="flex-grow">Priority Tasks</span>
          </TabButton>
          <TabButton
            onClick={() => handleViewChange('pipeline')}
            isActive={view === 'pipeline'}
          >
            <ClipboardCheckIcon className="h-5 w-5 flex-shrink-0" />
            <span className="flex-grow">Onboarding & Requests</span>
          </TabButton>
          <TabButton
            onClick={() => handleViewChange('members')}
            isActive={view === 'members'}
          >
            <UserGroupIcon className="h-5 w-5 flex-shrink-0" />
            <span className="flex-grow">Member Directory</span>
          </TabButton>
          {canManageChapters && (
            <TabButton
              onClick={() => handleViewChange('chapters')}
              isActive={view === 'chapters'}
            >
              <BuildingOfficeIcon className="h-5 w-5 flex-shrink-0" />
              <span className="flex-grow">Chapters</span>
            </TabButton>
          )}
          <TabButton
            onClick={() => handleViewChange('inventory')}
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
