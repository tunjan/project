import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCurrentUser } from '@/store/auth.store';
import {
  useUsers,
  useChapters,
  useChapterJoinRequests,
} from '@/store/appStore';
import OnboardingPipeline from '@/components/management/OnboardingPipeline';
import MemberDirectory from '@/components/management/MemberDirectory';
import ChapterManagement from '@/components/management/ChapterManagement';
import ChapterRequestQueue from '@/components/management/ChapterRequestQueue';
import { UserGroupIcon, BuildingOfficeIcon, ClipboardCheckIcon } from '@/icons';
import { type User, Role, OnboardingStatus, type Chapter } from '@/types';
import { ROLE_HIERARCHY } from '@/utils/auth';

type ManagementView = 'pipeline' | 'members' | 'chapters';

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
  const allChapterJoinRequests = useChapterJoinRequests();

  const [view, setView] = useState<ManagementView>('pipeline');

  const {
    visibleMembers,
    manageableChapters,
    filterableChaptersForDirectory,
    pendingChapterRequests,
    pendingOnboardingUsers,
  } = useMemo(() => {
    const result: {
      visibleMembers: User[];
      manageableChapters: Chapter[];
      filterableChaptersForDirectory: Chapter[];
      pendingChapterRequests: any[];
      pendingApplicationUsers: User[];
      pendingOnboardingUsers: User[];
    } = {
      visibleMembers: [],
      manageableChapters: [],
      filterableChaptersForDirectory: [],
      pendingChapterRequests: [],
      pendingApplicationUsers: [],
      pendingOnboardingUsers: [],
    };

    if (!currentUser) return result;

    const currentUserLevel = ROLE_HIERARCHY[currentUser.role];
    let managedChapterNames = new Set<string>();

    if (currentUserLevel >= ROLE_HIERARCHY[Role.GLOBAL_ADMIN]) {
      result.manageableChapters = allChapters;
      result.filterableChaptersForDirectory = allChapters;
      managedChapterNames = new Set(allChapters.map((c) => c.name));
    } else if (
      currentUser.role === Role.REGIONAL_ORGANISER &&
      currentUser.managedCountry
    ) {
      const countryChapters = allChapters.filter(
        (c) => c.country === currentUser.managedCountry
      );
      managedChapterNames = new Set(countryChapters.map((c) => c.name));
      result.manageableChapters = countryChapters;
      result.filterableChaptersForDirectory = countryChapters;
    } else if (
      currentUser.role === Role.CHAPTER_ORGANISER &&
      currentUser.organiserOf
    ) {
      managedChapterNames = new Set(currentUser.organiserOf);
      result.manageableChapters = [];
      result.filterableChaptersForDirectory = allChapters.filter((c) =>
        managedChapterNames.has(c.name)
      );
    }

    result.visibleMembers = allUsers.filter(
      (u) =>
        (u.onboardingStatus === OnboardingStatus.CONFIRMED ||
          u.onboardingStatus === OnboardingStatus.AWAITING_VERIFICATION) &&
        u.chapters.some((c) => managedChapterNames.has(c))
    );

    result.pendingChapterRequests = allChapterJoinRequests.filter(
      (req) =>
        managedChapterNames.has(req.chapterName) && req.status === 'Pending'
    );

    result.pendingApplicationUsers = allUsers.filter(
      (u) =>
        u.onboardingStatus === OnboardingStatus.PENDING_APPLICATION_REVIEW &&
        u.chapters.some((c) => managedChapterNames.has(c))
    );

    result.pendingOnboardingUsers = allUsers.filter(
      (u) =>
        [
          OnboardingStatus.PENDING_APPLICATION_REVIEW,
          OnboardingStatus.AWAITING_VERIFICATION,
        ].includes(u.onboardingStatus) &&
        u.chapters.some((c) => managedChapterNames.has(c))
    );

    return result;
  }, [allUsers, currentUser, allChapters, allChapterJoinRequests]);

  if (!currentUser) return null;

  const currentUserLevel = ROLE_HIERARCHY[currentUser.role];
  const canManageChapters =
    currentUserLevel >= ROLE_HIERARCHY[Role.REGIONAL_ORGANISER];

  const handleSelectUser = (user: User) =>
    navigate(`/manage/member/${user.id}`);

  return (
    <div className="py-8 md:py-12">
      <div className="mb-8 border-b-4 border-black pb-4">
        <h1 className="text-5xl font-extrabold tracking-tight text-black">
          Management
        </h1>
        <p className="mt-2 max-w-2xl text-lg text-neutral-600">
          Oversee activists, chapters, and onboarding processes.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
        {}
        <aside className="md:col-span-1">
          <nav className="flex flex-row space-x-2 overflow-x-auto border border-black bg-white p-2 md:flex-col md:space-x-0 md:space-y-1 md:p-2">
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
          </nav>
        </aside>

        {}
        <main className="md:col-span-3">
          {view === 'pipeline' && (
            <div className="space-y-12">
              <ChapterRequestQueue
                requests={pendingChapterRequests}
                currentUser={currentUser}
              />
              <div>
                <h2 className="mb-4 border-b-2 border-primary pb-2 text-2xl font-bold text-black">
                  Onboarding Pipeline
                </h2>
                <OnboardingPipeline
                  users={pendingOnboardingUsers}
                  onNavigate={handleSelectUser}
                />
              </div>
            </div>
          )}
          {view === 'members' && (
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
          )}
          {view === 'chapters' && canManageChapters && (
            <div>
              <h2 className="mb-4 border-b-2 border-primary pb-2 text-2xl font-bold text-black">
                Chapter Administration
              </h2>
              <ChapterManagement
                chapters={manageableChapters}
                currentUser={currentUser}
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ManagementPage;
