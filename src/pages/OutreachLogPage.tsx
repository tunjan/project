import React, { useMemo, useState } from 'react';
import { Role, OnboardingStatus } from '@/types';
import { useCurrentUser } from '@/store/auth.store';
import {
  useEvents,
  useOutreachLogsForUser,
  useOutreachActions,
  useOutreachLogs,
  useUsers,
} from '@/store';
import { ROLE_HIERARCHY } from '@/utils/auth';

// Import the new components
import QuickLogForm from '@/components/outreach/QuickLogForm';
import PersonalPerformance from '@/components/outreach/PersonalPerformance';
import LogHistory from '@/components/outreach/LogHistory';
import OutreachTally from '@/components/outreach/OutreachTally';

// A toggle for organizers to switch between personal and team views
const OutreachViewToggle: React.FC<{
  view: 'personal' | 'team';
  onViewChange: (view: 'personal' | 'team') => void;
}> = ({ view, onViewChange }) => (
  <div className="inline-flex border-2 border-black bg-white">
    <button
      onClick={() => onViewChange('personal')}
      className={`px-4 py-2 text-sm font-bold transition-colors ${
        view === 'personal' ? 'bg-black text-white' : 'hover:bg-neutral-100'
      }`}
    >
      My Logs
    </button>
    <button
      onClick={() => onViewChange('team')}
      className={`px-4 py-2 text-sm font-bold transition-colors ${
        view === 'team' ? 'bg-black text-white' : 'hover:bg-neutral-100'
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
    <div className="py-8 md:py-12">
      <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-black md:text-5xl">
            {title}
          </h1>
          <p className="mt-3 max-w-2xl text-lg text-neutral-600">
            Log conversations to track your impact and contribute to global
            stats.
          </p>
        </div>
        {canViewTeam && (
          <OutreachViewToggle view={view} onViewChange={setView} />
        )}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-12 lg:grid-cols-2">
        {/* --- Left Column: Actions & Personal Stats --- */}
        <div className="space-y-8 lg:col-span-1">
          <QuickLogForm
            key={view} // Force re-render on view change to reset form
            currentUser={currentUser}
            events={relevantEvents}
            users={relevantUsers}
            addOutreachLog={addOutreachLog}
            removeOutreachLog={removeOutreachLog}
            isTeamView={view === 'team'}
          />
          {view === 'personal' && <PersonalPerformance logs={personalLogs} />}
        </div>

        {/* --- Right Column: Data & History --- */}
        <div className="space-y-8 lg:col-span-1">
          <section>
            <h2 className="h-section">
              {view === 'personal' ? 'Your Tally' : 'Team Tally'}
            </h2>
            <OutreachTally logs={logsToShow} />
          </section>

          <LogHistory
            logs={logsToShow}
            events={allEvents}
            updateOutreachLog={updateOutreachLog}
            removeOutreachLog={removeOutreachLog}
          />
        </div>
      </div>
    </div>
  );
};

export default OutreachLogPage;
