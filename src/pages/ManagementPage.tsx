import {
  Building2,
  ClipboardCheck,
  ClipboardList,
  Home,
  TrendingUp,
  Users,
} from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import AtRiskMembersSnapshot from '@/components/dashboard/AtRiskMembersSnapshot';
import ChapterHealthSnapshot from '@/components/dashboard/ChapterHealthSnapshot';
import LeaderboardSnapshot from '@/components/dashboard/LeaderboardSnapshot';
import NextEventWidget from '@/components/dashboard/NextEventWidget';
import Widget from '@/components/dashboard/Widget';
import ChapterInventory from '@/components/management/ChapterInventory';
import ChapterManagement from '@/components/management/ChapterManagement';
import ChapterRequestQueue from '@/components/management/ChapterRequestQueue';
import ManagementTask from '@/components/management/ManagementTask';
import MemberDirectory from '@/components/management/MemberDirectory';
import OnboardingHealthCheck from '@/components/management/OnboardingHealthCheck';
import OnboardingPipeline from '@/components/management/OnboardingPipeline';
import ReviewApplicantModal from '@/components/management/ReviewApplicantModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ROLE_HIERARCHY } from '@/constants';
import { generateInactivityNotifications } from '@/services/notificationService';
import {
  useChapterJoinRequests,
  useChapters,
  useEvents,
  useNotificationsActions,
  useNotificationsStore,
  useUsers,
} from '@/store';
import { useChapterInventory, useInventoryActions } from '@/store';
import { useCurrentUser } from '@/store/auth.store';
import {
  type Chapter,
  type ChapterJoinRequest,
  OnboardingStatus,
  Role,
  type User,
} from '@/types';
import { isUserInactive } from '@/utils';

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

const Dashboard: React.FC<{
  tasks: ManagementTaskProps[];
  showChapterHealth: boolean;
}> = ({ tasks, showChapterHealth }) => {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="lg:col-span-1">
        <Widget title="Actionable Tasks">
          <div className="space-y-4">
            {tasks.length > 0 ? (
              tasks.map((task) => <ManagementTask key={task.title} {...task} />)
            ) : (
              <p className="text-muted-foreground">
                No actionable tasks at the moment.
              </p>
            )}
          </div>
        </Widget>
      </div>
      <div className="lg:col-span-1">
        <Widget title="Upcoming Events">
          <NextEventWidget />
        </Widget>
      </div>
      <div className="lg:col-span-1">
        <Widget title="Leaderboard Snapshot">
          <LeaderboardSnapshot />
        </Widget>
      </div>
      {showChapterHealth && (
        <>
          <div className="lg:col-span-1">
            <Widget title="Chapter Health">
              <ChapterHealthSnapshot />
            </Widget>
          </div>
          <div className="lg:col-span-2">
            <Widget title="At-Risk Members">
              <AtRiskMembersSnapshot />
            </Widget>
          </div>
        </>
      )}
    </div>
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

  // ✅ FIX: Use a ref to track if we've already set the initial value
  const hasSetInitialChapter = React.useRef(false);
  const [selectedChapterForInventory, setSelectedChapterForInventory] =
    useState<string>('');

  // Update selected chapter when default changes, but only once
  useEffect(() => {
    if (defaultChapter && !hasSetInitialChapter.current) {
      setSelectedChapterForInventory(defaultChapter);
      hasSetInitialChapter.current = true;
    }
  }, [defaultChapter]);

  // Get notifications actions at component level
  const notificationsActions = useNotificationsActions();

  // Memoize addNotifications to avoid re-running effect
  const addNotifications = useMemo(
    () => notificationsActions.addNotifications,
    [notificationsActions.addNotifications]
  );

  // Simulate a periodic check for inactive members when the dashboard is loaded
  useEffect(() => {
    if (view === 'dashboard' && currentUser) {
      const existingNotifications =
        useNotificationsStore.getState().notifications;
      const newInactivityNotifications = generateInactivityNotifications(
        allUsers,
        allEvents,
        existingNotifications,
        currentUser
      );
      if (newInactivityNotifications.length > 0) {
        addNotifications(newInactivityNotifications);
      }
    }
  }, [view, currentUser, allUsers, allEvents, addNotifications]);

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

    return filteredApplicants;
  }, [currentUser, allUsers, allChapters]);

  const dashboardTasks: ManagementTaskProps[] = useMemo(() => {
    if (!currentUser) return [];

    const tasks: ManagementTaskProps[] = [];

    // New applicants task
    if (newApplicants.length > 0) {
      tasks.push({
        icon: <Users className="size-8" />,
        title: 'New Applicants to Review',
        count: newApplicants.length,
        description: 'Review and approve new applicants to the platform.',
        onClick: () => setReviewModalOpen(true),
        priority: 'high',
      });
    }

    // Chapter join requests task (only for chapters the user can manage)
    const managedChapterNames = new Set<string>(
      currentUser.role === 'Global Admin'
        ? allChapters.map((c) => c.name)
        : currentUser.organiserOf || []
    );
    if (
      currentUser.role === Role.REGIONAL_ORGANISER &&
      currentUser.managedCountry
    ) {
      allChapters
        .filter((c) => c.country === currentUser.managedCountry)
        .forEach((c) => managedChapterNames.add(c.name));
    }
    const pendingJoinRequestsCount = chapterJoinRequests.filter((req) =>
      managedChapterNames.has(req.chapterName)
    ).length;

    if (pendingJoinRequestsCount > 0) {
      tasks.push({
        icon: <ClipboardCheck className="size-8" />,
        title: 'Chapter Join Requests',
        count: pendingJoinRequestsCount,
        description: 'Activists are waiting to join your chapter(s).',
        onClick: () => setView('pipeline'),
        priority: 'high',
      });
    }

    return tasks;
  }, [currentUser, newApplicants, allChapters, chapterJoinRequests]);

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
        ...dashboardTasks,
        {
          icon: <TrendingUp className="size-8" />,
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
          <div className="space-y-8">
            <ChapterRequestQueue
              requests={visibleChapterJoinRequests}
              currentUser={currentUser}
            />
            <OnboardingPipeline
              users={onboardingUsers}
              onNavigate={handleSelectUser}
            />
          </div>
        );
      case 'members':
        return (
          <MemberDirectory
            members={
              memberFilter.showInactiveOnly ? inactiveMembers : visibleMembers
            }
            onSelectUser={handleSelectUser}
            filterableChapters={filterableChaptersForDirectory}
            pendingRequests={visibleChapterJoinRequests}
          />
        );
      case 'chapters':
        return (
          canManageChapters && (
            <ChapterManagement
              chapters={manageableChaptersForDirectory}
              currentUser={currentUser}
            />
          )
        );
      case 'inventory':
        return (
          <div>
            <div className="mb-6 flex items-center justify-between">
              {manageableChapters.length > 1 && (
                <Select
                  value={selectedChapterForInventory}
                  onValueChange={setSelectedChapterForInventory}
                >
                  <SelectTrigger className="w-64">
                    <SelectValue placeholder="Select a chapter" />
                  </SelectTrigger>
                  <SelectContent>
                    {manageableChapters.map((chapter) => (
                      <SelectItem key={chapter.name} value={chapter.name}>
                        {chapter.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
              <Card>
                <CardContent className="p-8 text-center">
                  <h3 className="text-lg font-bold text-foreground">
                    No Manageable Chapters
                  </h3>
                  <p className="mt-1 text-destructive">
                    You don't have permission to manage inventory for any
                    chapters.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <h3 className="text-lg font-bold text-foreground">
                    No Chapter Selected
                  </h3>
                  <p className="mt-1 text-destructive">
                    Please select a chapter to manage its inventory.
                  </p>
                </CardContent>
              </Card>
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
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-7xl px-4">
        {/* Header Section */}
        <div className="mb-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                Management Hub
              </h1>
              <p className="mt-2 text-muted-foreground">
                Manage your chapters, review applications, and oversee member
                activities from one central location.
              </p>
            </div>
          </div>
          <Separator className="mt-6" />
        </div>

        <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-4">
          <aside className="md:col-span-1">
            <Card>
              <CardContent className="p-4">
                <nav className="flex flex-row justify-between gap-2 md:flex-col">
                  <Button
                    onClick={() => handleViewChange('dashboard')}
                    variant={view === 'dashboard' ? 'default' : 'ghost'}
                    className="justify-start"
                  >
                    <Home className="size-4 md:mr-4" />
                    <span className="hidden md:inline">Priority Tasks</span>
                  </Button>
                  <Button
                    onClick={() => handleViewChange('pipeline')}
                    variant={view === 'pipeline' ? 'default' : 'ghost'}
                    className="justify-start"
                  >
                    <ClipboardCheck className="size-4 md:mr-4" />
                    <span className="hidden truncate md:inline">
                      Onboarding & Requests
                    </span>
                  </Button>
                  <Button
                    onClick={() => handleViewChange('members')}
                    variant={view === 'members' ? 'default' : 'ghost'}
                    className="justify-start"
                  >
                    <Users className="size-4 md:mr-4" />
                    <span className="hidden md:inline">Member Directory</span>
                  </Button>
                  {canManageChapters && (
                    <Button
                      onClick={() => handleViewChange('chapters')}
                      variant={view === 'chapters' ? 'default' : 'ghost'}
                      className="justify-start"
                    >
                      <Building2 className="size-4 md:mr-4" />
                      <span className="hidden md:inline">Chapters</span>
                    </Button>
                  )}
                  <Button
                    onClick={() => handleViewChange('inventory')}
                    variant={view === 'inventory' ? 'default' : 'ghost'}
                    className="justify-start"
                  >
                    <ClipboardList className="size-4 md:mr-4" />
                    <span className="hidden md:inline">Inventory</span>
                  </Button>
                  <Button
                    onClick={() => handleViewChange('onboarding-health')}
                    variant={view === 'onboarding-health' ? 'default' : 'ghost'}
                    className="justify-start"
                  >
                    <ClipboardCheck className="size-4 md:mr-4" />
                    <span className="hidden md:inline">Onboarding Health</span>
                  </Button>
                </nav>
              </CardContent>
            </Card>
          </aside>
          <main className="md:col-span-3">
            {renderContent()}
            {isReviewModalOpen && (
              <ReviewApplicantModal
                applicants={newApplicants}
                onClose={() => setReviewModalOpen(false)}
                isOpen={isReviewModalOpen}
              />
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default ManagementPage;
