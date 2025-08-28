import React, { useState, useMemo } from 'react';
import { useUsers, useChapters, useOutreachLogs, useEvents } from '@/store';
import { useCurrentUser } from '@/store/auth.store';
import { calculateLeaderboards, type Timeframe } from '@/utils/leaderboard';
import Leaderboard from '@/components/leaderboard/Leaderboard';
import ChapterLeaderboard from '@/components/leaderboard/ChapterLeaderboard';
import { TrophyIcon } from '@/icons';

const SectionTab: React.FC<{
  onClick: () => void;
  isActive: boolean;
  children: React.ReactNode;
}> = ({ onClick, isActive, children }) => (
  <button
    onClick={onClick}
    className={`-mb-px border-b-4 px-4 py-3 text-sm font-bold uppercase tracking-wider transition-colors duration-200 ${
      isActive
        ? 'border-primary text-primary'
        : 'border-transparent text-neutral-500 hover:border-neutral-300 hover:text-black'
    }`}
  >
    {children}
  </button>
);

const TimeframeTab: React.FC<{
  onClick: () => void;
  isActive: boolean;
  children: React.ReactNode;
}> = ({ onClick, isActive, children }) => (
  <button
    onClick={onClick}
    className={`border-r-2 border-black px-3 py-2 text-xs font-extrabold uppercase tracking-wider transition-colors last:border-r-0 ${
      isActive
        ? 'bg-black text-white'
        : 'bg-white text-black hover:bg-neutral-100'
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
  const [metric, setMetric] = useState<'conversations' | 'hours'>(
    'conversations'
  );

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
        <p className="mx-auto mt-3 max-w-2xl text-lg text-neutral-600">
          See who our most dedicated activists are. Your stats are highlighted.
        </p>
      </div>

      <div className="mb-8 flex flex-col items-center justify-between gap-4 md:flex-row">
        <div className="border-b-2 border-black">
          <SectionTab
            onClick={() => setMetric('conversations')}
            isActive={metric === 'conversations'}
          >
            Conversations
          </SectionTab>
          <SectionTab
            onClick={() => setMetric('hours')}
            isActive={metric === 'hours'}
          >
            Hours
          </SectionTab>
        </div>
        <div className="inline-flex border-2 border-black bg-white">
          <TimeframeTab
            onClick={() => setTimeframe('week')}
            isActive={timeframe === 'week'}
          >
            Week
          </TimeframeTab>
          <TimeframeTab
            onClick={() => setTimeframe('month')}
            isActive={timeframe === 'month'}
          >
            Month
          </TimeframeTab>
          <TimeframeTab
            onClick={() => setTimeframe('year')}
            isActive={timeframe === 'year'}
          >
            Year
          </TimeframeTab>
          <TimeframeTab
            onClick={() => setTimeframe('allTime')}
            isActive={timeframe === 'allTime'}
          >
            All Time
          </TimeframeTab>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <Leaderboard
          title={
            metric === 'conversations'
              ? 'Most Conversations (Activists)'
              : 'Most Hours (Activists)'
          }
          data={leaderboards.user[metric][timeframe]}
          unit={metric === 'conversations' ? 'Convos' : 'Hours'}
          currentUser={currentUser}
        />
        <ChapterLeaderboard
          title={
            metric === 'conversations'
              ? 'Most Conversations (Chapters)'
              : 'Most Hours (Chapters)'
          }
          data={leaderboards.chapter[metric][timeframe]}
          unit={metric === 'conversations' ? 'Convos' : 'Hours'}
        />
      </div>
    </div>
  );
};

export default LeaderboardPage;
