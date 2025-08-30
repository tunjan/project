import React, { useMemo, useState } from 'react';

import ChapterLeaderboard from '@/components/leaderboard/ChapterLeaderboard';
import Leaderboard from '@/components/leaderboard/Leaderboard';
import { TrophyIcon } from '@/icons';
import { useChapters, useEvents, useOutreachLogs, useUsers } from '@/store';
import { useCurrentUser } from '@/store/auth.store';
import type { Chapter } from '@/types';
import {
  calculateLeaderboards,
  type Timeframe,
  type UserLeaderboardEntry,
} from '@/utils/leaderboard';

const SectionTab: React.FC<{
  onClick: () => void;
  isActive: boolean;
  children: React.ReactNode;
}> = ({ onClick, isActive, children }) => (
  <button
    onClick={onClick}
    className={`h-10 border-r-2 border-black px-3 py-2 text-xs font-extrabold uppercase tracking-wider transition-colors last:border-r-0 ${
      isActive
        ? 'bg-black text-white'
        : 'bg-white text-black hover:bg-neutral-100'
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
    className={`h-10 border-r-2 border-black px-3 py-2 text-xs font-extrabold uppercase tracking-wider transition-colors last:border-r-0 ${
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

  // UI filters
  const [chapterFilter, setChapterFilter] = useState<string>('');

  const leaderboards = useMemo(
    () =>
      calculateLeaderboards(allUsers, allChapters, allOutreachLogs, allEvents),
    [allUsers, allChapters, allOutreachLogs, allEvents]
  );

  // Derived list of chapter names for the chapter filter select
  const chapterNames = useMemo(() => {
    // allChapters should be typed as Chapter[] from the store hooks
    return Array.from(
      new Set((allChapters as Chapter[]).map((c) => c.name))
    ).filter(Boolean);
  }, [allChapters]);

  // Apply chapter filter to user leaderboard data
  const userData = useMemo(() => {
    const base = (leaderboards.user?.[metric]?.[timeframe] ??
      []) as UserLeaderboardEntry[];

    return base.filter((entry) => {
      const matchesChapter = chapterFilter
        ? (entry.user.chapters || []).includes(chapterFilter)
        : true;
      return matchesChapter;
    });
  }, [leaderboards, metric, timeframe, chapterFilter]);

  return (
    <div className="py-8 md:py-12">
      <div className="mb-8 text-center md:mb-12">
        <TrophyIcon className="mx-auto size-12 text-primary" />
        <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-black md:text-5xl">
          Leaderboards
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-lg text-neutral-600">
          See who our most dedicated activists are. Your stats are highlighted.
        </p>
      </div>

      <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div className="inline-flex border-2 border-black bg-white">
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

        <select
          value={chapterFilter}
          onChange={(e) => setChapterFilter(e.target.value)}
          className="rounded-nonenone h-10 w-40 max-w-40 border-2 border-black bg-white px-3 py-2 text-sm"
          aria-label="Filter by chapter"
        >
          <option value="">All Chapters</option>
          {chapterNames.map((name) => (
            <option value={name} key={name}>
              {name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <Leaderboard
          title={
            metric === 'conversations'
              ? 'Most Conversations (Activists)'
              : 'Most Hours (Activists)'
          }
          data={userData}
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
