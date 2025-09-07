import React, { useMemo, useState } from 'react';

import LogHistory from '@/components/outreach/LogHistory';
import OutreachTally from '@/components/outreach/OutreachTally';
import PersonalPerformance from '@/components/outreach/PersonalPerformance';
import QuickLogForm from '@/components/outreach/QuickLogForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
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

const OutreachViewToggle: React.FC<{
  view: 'personal' | 'team';
  onViewChange: (view: 'personal' | 'team') => void;
}> = ({ view, onViewChange }) => (
  <Tabs
    value={view}
    onValueChange={(v) => onViewChange(v as 'personal' | 'team')}
    className="w-[200px]"
  >
    <TabsList className="grid w-full grid-cols-2">
      <TabsTrigger value="personal">My Logs</TabsTrigger>
      <TabsTrigger value="team">Team View</TabsTrigger>
    </TabsList>
  </Tabs>
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
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-7xl px-4">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1 space-y-1">
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                {title}
              </h1>
              <p className="max-w-2xl text-muted-foreground">
                Track meaningful conversations and measure your impact.
              </p>
            </div>
            {canViewTeam && (
              <div className="shrink-0">
                <OutreachViewToggle view={view} onViewChange={setView} />
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          <QuickLogForm
            key={view}
            currentUser={currentUser}
            events={relevantEvents}
            users={relevantUsers}
            addOutreachLog={addOutreachLog}
            removeOutreachLog={removeOutreachLog}
            isTeamView={view === 'team'}
          />

          <Card>
            <CardHeader>
              <CardTitle>
                {view === 'personal' ? 'Your Impact' : 'Team Impact'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <OutreachTally logs={logsToShow} />
            </CardContent>
          </Card>

          {view === 'personal' && <PersonalPerformance logs={personalLogs} />}

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
