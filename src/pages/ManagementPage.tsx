import React, { useState, useMemo } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
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
import OnboardingHealthCheck from '@/components/management/OnboardingHealthCheck';
import {
  BuildingOfficeIcon,
  ClipboardCheckIcon,
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
  type ChapterJoinRequest,
} from '@/types';
import { ROLE_HIERARCHY } from '@/utils/auth';
import { isUserInactive } from '@/utils/user';
import Widget from '@/components/dashboard/Widget';

import LeaderboardSnapshot from '@/components/dashboard/LeaderboardSnapshot';
import ChapterHealthSnapshot from '@/components/dashboard/ChapterHealthSnapshot';
import AtRiskMembersSnapshot from '@/components/dashboard/AtRiskMembersSnapshot';
import ReviewApplicantModal from '@/components/management/ReviewApplicantModal';
import NextEventWidget from '@/components/dashboard/NextEventWidget';

type ManagementView =
  | 'dashboard'
  | 'pipeline'
  | 'members'
  | 'chapters'
  | 'inventory'
  | 'onboarding-health';

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
    high: 'border-l-4 border-red bg-white',
    medium: 'border-l-4 border-gray-500 bg-white',
    low: 'border-l-4 border-black bg-white',
  };

  return (
    <button
      className={`card-brutal card-padding ${priorityStyles[priority]} w-full cursor-pointer text-left transition-all hover:scale-[1.02] hover:shadow-brutal-lg`}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="text-2xl text-primary">{icon}</div>
          <div>
            <div className="mb-2 flex items-center gap-2">
              <h3 className="h-card">{title}</h3>
              <span className="tag-brutal">{count}</span>
            </div>
            <p className="text-grey-600 text-sm">{description}</p>
          </div>
        </div>
      </div>
    </button>
  );
};

const TabButton: React.FC<{
  onClick: () => void;
  isActive: boolean;
  children: React.ReactNode;
}> = ({ onClick, isActive, children }) => (
  <button
    onClick={onClick}
    className={`flex w-full items-center space-x-3 border-l-4 p-4 text-left text-sm font-bold transition-colors duration-200 ${
      isActive
        ? 'border-primary bg-white text-black'
        : 'border-transparent hover:border-black hover:bg-white hover:text-black'
    }`}
  >
    {children}
  </button>
);

const ResponsiveGridLayout = WidthProvider(Responsive);

const Dashboard: React.FC<{
  tasks: ManagementTaskProps[];
  showChapterHealth: boolean;
}> = ({ tasks, showChapterHealth }) => {
  const layout = useMemo(() => {
    const baseLayout = [
      { i: 'tasks', x: 0, y: 0, w: 1, h: 2, minH: 2, minW: 1 },
      { i: 'events', x: 1, y: 0, w: 1, h: 2, minH: 2, minW: 1 },
      { i: 'leaderboard', x: 0, y: 2, w: 1, h: 2, minH: 2, minW: 1 },
    ];

    if (showChapterHealth) {
      baseLayout.push({
        i: 'chapterHealth',
        x: 1,
        y: 2,
        w: 1,
        h: 2,
        minH: 2,
        minW: 1,
      });
      baseLayout.push({
        i: 'atRiskMembers',
        x: 0,
        y: 3,
        w: 2,
        h: 2,
        minH: 2,
        minW: 1,
      });
    }

    return baseLayout;
  }, [showChapterHealth]);

  return (
    <ResponsiveGridLayout
      className="layout"
      layouts={{ lg: layout }}
      breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
      cols={{ lg: 2, md: 2, sm: 1, xs: 1, xxs: 1 }}
      rowHeight={200}
      draggableHandle=".h-card-brutal"
    >
      <div key="tasks">
        <Widget title="Actionable Tasks">
          <div className="space-y-4">
            {tasks.length > 0 ? (
              tasks.map((task) => <ManagementTask key={task.title} {...task} />)
            ) : (
              <p className="text-grey-600">
                No actionable tasks at the moment.
              </p>
            )}
          </div>
        </Widget>
      </div>
      <div key="events">
        <Widget title="Upcoming Events">
          <NextEventWidget />
        </Widget>
      </div>
      <div key="leaderboard">
        <Widget title="Leaderboard">
          <LeaderboardSnapshot />
        </Widget>
      </div>
      {showChapterHealth && (
        <div key="chapterHealth">
          <Widget title="Chapter Health">
            <ChapterHealthSnapshot />
          </Widget>
        </div>
      )}
      {showChapterHealth && (
        <div key="atRiskMembers">
          <Widget title="At-Risk Members">
            <AtRiskMembersSnapshot />
          </Widget>
        </div>
      )}
    </ResponsiveGridLayout>
  );
};

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
  const [isReviewModalOpen, setReviewModalOpen] = useState(false);

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

  const newApplicants = useMemo(() => {
    if (!currentUser) return [];

    // Get the chapters this user can manage
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

    const filteredApplicants = allUsers.filter(
      (u) =>
        u.onboardingStatus === OnboardingStatus.PENDING_APPLICATION_REVIEW &&
        // Only show applicants for chapters the current user can manage
        u.chapters?.some((c) => managedChapterNames.has(c))
    );

    // Debug logging
    console.log('New Applicants Debug:', {
      currentUser: currentUser.name,
      role: currentUser.role,
      managedChapters: Array.from(managedChapterNames),
      totalUsers: allUsers.length,
      pendingReviewUsers: allUsers.filter(
        (u) =>
          u.onboardingStatus === OnboardingStatus.PENDING_APPLICATION_REVIEW
      ),
      filteredApplicants: filteredApplicants,
    });

    return filteredApplicants;
  }, [currentUser, allUsers, allChapters]);

  const dashboardTasks: ManagementTaskProps[] = useMemo(() => {
    if (!currentUser || newApplicants.length === 0) return [];

    return [
      {
        icon: <UserGroupIcon className="h-8 w-8" />,
        title: 'New Applicants to Review',
        count: newApplicants.length,
        description: 'Review and approve new applicants to the platform.',
        onClick: () => setReviewModalOpen(true),
        priority: 'high',
      },
    ];
  }, [currentUser, newApplicants.length]);

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
        u.onboardingStatus !== OnboardingStatus.CONFIRMED &&
        u.onboardingStatus !== OnboardingStatus.INACTIVE &&
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
          <Dashboard
            tasks={dashboardTasksWithInactive}
            showChapterHealth={manageableChapters.length > 0}
          />
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
              {manageableChapters.length > 1 && (
                <select
                  value={selectedChapterForInventory}
                  onChange={(e) =>
                    setSelectedChapterForInventory(e.target.value)
                  }
                  className="border border-black px-3 py-2 focus:border-primary focus:outline-none"
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
              <div className="border-2 border-white bg-white p-8 text-center">
                <h3 className="text-lg font-bold text-black">
                  No Manageable Chapters
                </h3>
                <p className="text-red mt-1">
                  You don't have permission to manage inventory for any
                  chapters.
                </p>
              </div>
            ) : (
              <div className="border-2 border-white bg-white p-8 text-center">
                <h3 className="text-lg font-bold text-black">
                  No Chapter Selected
                </h3>
                <p className="text-red mt-1">
                  Please select a chapter to manage its inventory.
                </p>
              </div>
            )}
          </div>
        );
      case 'onboarding-health':
        return (
          <div className="space-y-6">
            <OnboardingHealthCheck />
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
          <p className="text-red mt-2 max-w-2xl text-lg">
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
          <TabButton
            onClick={() => handleViewChange('onboarding-health')}
            isActive={view === 'onboarding-health'}
          >
            <ClipboardCheckIcon className="h-5 w-5 flex-shrink-0" />
            <span className="flex-grow">Onboarding Health</span>
          </TabButton>
        </nav>
      </div>
      <div>
        {renderContent()}
        {isReviewModalOpen && (
          <ReviewApplicantModal
            applicants={newApplicants}
            onClose={() => setReviewModalOpen(false)}
          />
        )}
      </div>
    </div>
  );
};

export default ManagementPage;
