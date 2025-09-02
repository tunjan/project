import React, { useMemo, useState } from 'react';

import LogHistory from '@/components/outreach/LogHistory';
import OutreachTally from '@/components/outreach/OutreachTally';
import PersonalPerformance from '@/components/outreach/PersonalPerformance';
// Import the new components
import QuickLogForm from '@/components/outreach/QuickLogForm';
import { ROLE_HIERARCHY } from '@/constants';
import {
  useEvents,
  useOutreachActions,
  useOutreachLogs,
  useOutreachLogsForUser,
  useUsers,
} from '@/store';
import { useCurrentUser } from '@/store/auth.store';
import { OnboardingStatus, Role } from '@/types';

// Enhanced toggle with better visual hierarchy and mobile optimization
const OutreachViewToggle: React.FC<{
  view: 'personal' | 'team';
  onViewChange: (view: 'personal' | 'team') => void;
}> = ({ view, onViewChange }) => (
  <div className="inline-flex overflow-hidden rounded-none border-black bg-white dark:border-white dark:bg-black md:border-2">
    <button
      onClick={() => onViewChange('personal')}
      className={`px-6 py-3 text-sm font-bold ${
        view === 'personal'
          ? 'bg-black text-white shadow-inner'
          : 'hover:bg-neutral-100 active:bg-neutral-200'
      }`}
    >
      My Logs
    </button>
    <button
      onClick={() => onViewChange('team')}
      className={`px-6 py-3 text-sm font-bold ${
        view === 'team'
          ? 'bg-black text-white shadow-inner'
          : 'hover:bg-neutral-100 active:bg-neutral-200'
      }`}
    >
      Team View
    </button>
  </div>
);

const OutreachLogPage: React.FC = () => {
  const currentUser = useCurrentUser();
  const { addOutreachLog, removeOutreachLog, updateOutreachLog } =
    useOutreachActions();
  const allEvents = useEvents();
  const allLogs = useOutreachLogs();
  const allUsers = useUsers();
  const personalLogs = useOutreachLogsForUser(currentUser?.id);

  const [view, setView] = useState<'personal' | 'team'>('personal');

  const canViewTeam = useMemo(
    () =>
      currentUser &&
      ROLE_HIERARCHY[currentUser.role] >=
        ROLE_HIERARCHY[Role.CHAPTER_ORGANISER],
    [currentUser]
  );

  const { logsToShow, relevantUsers, relevantEvents, title } = useMemo(() => {
    if (!currentUser) {
      return {
        logsToShow: [],
        relevantUsers: [],
        relevantEvents: [],
        title: 'Outreach Log',
      };
    }

    if (view === 'team' && canViewTeam) {
      const managedChapterNames = new Set(currentUser.organiserOf || []);
      const teamMembers = allUsers.filter(
        (u) =>
          u.onboardingStatus === OnboardingStatus.CONFIRMED &&
          u.chapters.some((c) => managedChapterNames.has(c))
      );
      const teamMemberIds = new Set(teamMembers.map((u) => u.id));
      const teamLogs = allLogs.filter((log) => teamMemberIds.has(log.userId));
      const teamEventIds = new Set(teamLogs.map((log) => log.eventId));
      const teamEvents = allEvents.filter((event) =>
        teamEventIds.has(event.id)
      );

      return {
        logsToShow: teamLogs,
        relevantUsers: teamMembers,
        relevantEvents: teamEvents,
        title: 'Team Outreach Log',
      };
    }

    // Default to personal view
    const personalEventIds = new Set(personalLogs.map((log) => log.eventId));
    const userEvents = allEvents.filter(
      (e) =>
        personalEventIds.has(e.id) ||
        e.participants.some((p) => p.user.id === currentUser.id)
    );
    return {
      logsToShow: personalLogs,
      relevantUsers: [currentUser],
      relevantEvents: userEvents,
      title: 'My Outreach Log',
    };
  }, [
    currentUser,
    view,
    canViewTeam,
    allUsers,
    allLogs,
    allEvents,
    personalLogs,
  ]);

  if (!currentUser) return null;

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <div className="mx-auto max-w-7xl py-8 lg:px-8 lg:py-12">
        {/* Enhanced Header Section */}
        <div className="mb-12 flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-2 bg-primary"></div>
              <h1 className="text-2xl font-extrabold tracking-tight text-black sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl">
                {title}
              </h1>
            </div>
            <p className="text-md max-w-3xl px-4 leading-relaxed text-neutral-600 sm:px-0 sm:text-xl">
              Track your impact and contribute to global statistics by logging
              meaningful conversations. Every interaction counts towards
              building a more compassionate world.
            </p>
          </div>

          {canViewTeam && (
            <div className="shrink-0">
              <OutreachViewToggle view={view} onViewChange={setView} />
            </div>
          )}
        </div>

        {/* Enhanced Grid Layout with Better Mobile Responsiveness */}
        <div className="grid grid-cols-1 gap-8 xl:grid-cols-12 xl:gap-12">
          {/* Left Column: Actions & Personal Stats - Enhanced spacing and mobile layout */}
          <div className="space-y-8 xl:col-span-7">
            <QuickLogForm
              key={view} // Force re-render on view change to reset form
              currentUser={currentUser}
              events={relevantEvents}
              users={relevantUsers}
              addOutreachLog={addOutreachLog}
              removeOutreachLog={removeOutreachLog}
              isTeamView={view === 'team'}
            />

            {view === 'personal' && (
              <div>
                <PersonalPerformance logs={personalLogs} />
              </div>
            )}
          </div>

          {/* Right Column: Data & History - Better visual separation */}
          <div className="space-y-8 xl:col-span-5">
            <div className="sticky top-8 space-y-8">
              <section>
                <h2 className="mb-6 border-b-4 border-primary pb-3 text-2xl font-extrabold tracking-tight text-black">
                  {view === 'personal'
                    ? 'Your Impact Tally'
                    : 'Team Impact Tally'}
                </h2>
                <OutreachTally logs={logsToShow} />
              </section>

              <div>
                <LogHistory
                  logs={logsToShow}
                  events={allEvents}
                  updateOutreachLog={updateOutreachLog}
                  removeOutreachLog={removeOutreachLog}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OutreachLogPage;
