import React, { useMemo, useState } from 'react';

import ChapterLeaderboard from '@/components/leaderboard/ChapterLeaderboard';
import Leaderboard from '@/components/leaderboard/Leaderboard';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useChapters, useEvents, useOutreachLogs, useUsers } from '@/store';
import { useCurrentUser } from '@/store/auth.store';
import type { Chapter } from '@/types';
import {
  calculateLeaderboards,
  type Timeframe,
  type UserLeaderboardEntry,
} from '@/utils';

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

  const [chapterFilter, setChapterFilter] = useState<string>('');

  const leaderboards = useMemo(
    () =>
      calculateLeaderboards(allUsers, allChapters, allOutreachLogs, allEvents),
    [allUsers, allChapters, allOutreachLogs, allEvents]
  );

  const chapterNames = useMemo(() => {
    return Array.from(
      new Set((allChapters as Chapter[]).map((c) => c.name))
    ).filter(Boolean);
  }, [allChapters]);

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
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-7xl px-4">
        {/* Header Section */}
        <div className="mb-8">
          <div className="mb-6 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                Leaderboards
              </h1>
              <p className="mt-2 text-muted-foreground">
                See who our most dedicated activists are. Your stats are
                highlighted.
              </p>
            </div>
          </div>
          <Separator />
        </div>

        <Card className="mb-8">
          <CardContent className="p-4 md:p-6">
            <div className="grid grid-cols-1 items-center gap-4 md:grid-cols-3">
              <div className="flex flex-col gap-2">
                <div className="text-sm font-medium text-foreground">
                  Metric
                </div>
                <Tabs
                  value={metric}
                  onValueChange={(value) => {
                    if (value) setMetric(value as 'conversations' | 'hours');
                  }}
                  className="w-full"
                >
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="conversations">
                      Conversations
                    </TabsTrigger>
                    <TabsTrigger value="hours">Hours</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              <div className="flex flex-col gap-2">
                <div className="text-sm font-medium text-foreground">
                  Timeframe
                </div>
                <Tabs
                  value={timeframe}
                  onValueChange={(value) => {
                    if (value) setTimeframe(value as Timeframe);
                  }}
                  className="w-full"
                >
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="week">Week</TabsTrigger>
                    <TabsTrigger value="month">Month</TabsTrigger>
                    <TabsTrigger value="year">Year</TabsTrigger>
                    <TabsTrigger value="allTime">All Time</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              <div className="flex flex-col gap-2">
                <div className="text-sm font-medium text-foreground">
                  Chapter
                </div>
                <Select
                  value={chapterFilter}
                  onValueChange={(value) =>
                    setChapterFilter(value === 'all' ? '' : value)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All Chapters" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Chapters</SelectItem>
                    {chapterNames.map((name) => (
                      <SelectItem value={name} key={name}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

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
    </div>
  );
};

export default LeaderboardPage;
