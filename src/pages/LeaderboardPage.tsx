import React, { useState, useMemo } from 'react';
import { useUsers, useChapters, useOutreachLogs, useEvents } from '@/store';
import { useCurrentUser } from '@/store/auth.store';
import { calculateLeaderboards, type Timeframe } from '@/utils/leaderboard';
import Leaderboard from '@/components/leaderboard/Leaderboard';
import ChapterLeaderboard from '@/components/leaderboard/ChapterLeaderboard';
import { TrophyIcon } from '@/icons';

const TabButton: React.FC<{
  onClick: () => void;
  isActive: boolean;
  children: React.ReactNode;
}> = ({ onClick, isActive, children }) => (
  <button
    onClick={onClick}
    className={`w-full border-r-2 border-black px-4 py-3 text-sm font-extrabold uppercase tracking-wider transition-colors duration-200 last:border-b-0 last:border-r-0 md:w-auto md:last:border-b-0 ${
      isActive ? 'bg-black text-white' : 'bg-white text-black hover:bg-white'
    }`}
  >
    {children}
  </button>
);

const LeaderboardPage: React.FC = () => {
  const allUsers = useUsers();
  const allChapters = useChapters();
  const allOutreachLogs = useOutreachLogs();
  const allEvents = useEvents();
  const currentUser = useCurrentUser();

  const [timeframe, setTimeframe] = useState<Timeframe>('month');

  const leaderboards = useMemo(
    () =>
      calculateLeaderboards(allUsers, allChapters, allOutreachLogs, allEvents),
    [allUsers, allChapters, allOutreachLogs, allEvents]
  );

  return (
    <div className="py-8 md:py-12">
      <div className="mb-8 text-center md:mb-12">
        <TrophyIcon className="mx-auto h-12 w-12 text-primary" />
        <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-black md:text-5xl">
          Leaderboards
        </h1>
        <p className="text-grey-500 mx-auto mt-3 max-w-2xl text-lg">
          See who our most dedicated activists are. Your stats are highlighted.
        </p>
      </div>

      <div className="mb-8 inline-block border-2 border-black bg-white">
        <div className="flex flex-row">
          <TabButton
            onClick={() => setTimeframe('week')}
            isActive={timeframe === 'week'}
          >
            Past Week
          </TabButton>
          <TabButton
            onClick={() => setTimeframe('month')}
            isActive={timeframe === 'month'}
          >
            Past Month
          </TabButton>
          <TabButton
            onClick={() => setTimeframe('year')}
            isActive={timeframe === 'year'}
          >
            Past Year
          </TabButton>
          <TabButton
            onClick={() => setTimeframe('allTime')}
            isActive={timeframe === 'allTime'}
          >
            All Time
          </TabButton>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="space-y-8">
          {}
          <Leaderboard
            title="Most Conversations (Users)"
            data={leaderboards.user.conversations[timeframe]}
            unit="Conversations"
            currentUser={currentUser}
          />
          {}
          <ChapterLeaderboard
            title="Most Conversations (Chapters)"
            data={leaderboards.chapter.conversations[timeframe]}
            unit="Conversations"
          />
        </div>
        <div className="space-y-8">
          {}
          <Leaderboard
            title="Most Hours (Users)"
            data={leaderboards.user.hours[timeframe]}
            unit="Hours"
            currentUser={currentUser}
          />
          {}
          <ChapterLeaderboard
            title="Most Hours (Chapters)"
            data={leaderboards.chapter.hours[timeframe]}
            unit="Hours"
          />
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage;
