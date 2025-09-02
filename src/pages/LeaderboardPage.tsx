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
} from '@/utils';

const SectionTab: React.FC<{
  onClick: () => void;
  isActive: boolean;
  children: React.ReactNode;
}> = ({ onClick, isActive, children }) => (
  <button
    onClick={onClick}
    className={`flex min-h-[44px] flex-1 items-center justify-center space-x-1 border-r border-black px-3 py-2.5 text-xs font-semibold last:border-r-0 sm:flex-initial sm:space-x-2 sm:px-3 sm:py-2 sm:text-sm ${
      isActive
        ? 'bg-black text-white'
        : 'bg-white text-black hover:bg-gray-50 active:bg-gray-100'
    } touch-manipulation transition-colors duration-200`}
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
    className={`flex min-h-[44px] flex-1 items-center justify-center space-x-1 border-r-2 border-black px-3 py-2.5 text-xs font-semibold last:border-r-0 sm:flex-initial sm:space-x-2 sm:px-3 sm:py-2 sm:text-sm ${
      isActive
        ? 'bg-black text-white'
        : 'bg-white text-black hover:bg-gray-50 active:bg-gray-100'
    } touch-manipulation transition-colors duration-200`}
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
      {/* Enhanced Header Section */}
      <div className="mb-12 flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-2 bg-primary"></div>
            <h1 className="text-2xl font-extrabold tracking-tight text-black sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl">
              Leaderboards
            </h1>
          </div>
          <p className="text-md max-w-3xl px-4 leading-relaxed text-neutral-600 sm:px-0 sm:text-xl">
            See who our most dedicated activists are. Your stats are
            highlighted.
          </p>
        </div>
        <div className="shrink-0">
          <TrophyIcon className="size-6 text-primary sm:size-12" />
        </div>
      </div>

      <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div className="flex w-full justify-center md:w-auto md:justify-start">
          <div className="flex w-full items-center border-2 border-black bg-white md:w-auto">
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
        </div>

        <div className="flex w-full justify-center md:w-auto md:justify-start">
          <div className="flex w-full items-center border-2 border-black bg-white md:w-auto">
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

        <div className="flex w-full justify-center md:w-auto md:justify-start">
          <select
            value={chapterFilter}
            onChange={(e) => setChapterFilter(e.target.value)}
            className="block w-full border-black bg-white px-3 py-2.5 text-sm font-semibold text-black focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary md:w-40 md:border-2 md:py-2"
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
