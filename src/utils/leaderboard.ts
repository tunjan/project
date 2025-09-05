import {
  type Chapter,
  type CubeEvent,
  type OutreachLog,
  type User,
} from '@/types';

import { calculateAllMetrics } from './metrics';

export interface UserLeaderboardEntry {
  user: User;
  value: number;
}

export interface ChapterLeaderboardEntry {
  chapter: Chapter;
  value: number;
}

export type Timeframe = 'week' | 'month' | 'year' | 'allTime';

export interface LeaderboardData {
  user: {
    hours: {
      week: UserLeaderboardEntry[];
      month: UserLeaderboardEntry[];
      year: UserLeaderboardEntry[];
      allTime: UserLeaderboardEntry[];
    };
    conversations: {
      week: UserLeaderboardEntry[];
      month: UserLeaderboardEntry[];
      year: UserLeaderboardEntry[];
      allTime: UserLeaderboardEntry[];
    };
  };
  chapter: {
    hours: {
      week: ChapterLeaderboardEntry[];
      month: ChapterLeaderboardEntry[];
      year: ChapterLeaderboardEntry[];
      allTime: ChapterLeaderboardEntry[];
    };
    conversations: {
      week: ChapterLeaderboardEntry[];
      month: ChapterLeaderboardEntry[];
      year: ChapterLeaderboardEntry[];
      allTime: ChapterLeaderboardEntry[];
    };
  };
}

export const calculateRanks = <T extends { value: number }>(
  entries: T[]
): (T & { rank: number })[] => {
  if (entries.length === 0) return [];

  const rankedEntries: (T & { rank: number })[] = [];
  let currentRank = 1;
  let currentValue = entries[0]?.value;

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];

    if (entry.value !== currentValue) {
      currentRank = i + 1;
      currentValue = entry.value;
    }

    rankedEntries.push({
      ...entry,
      rank: currentRank,
    });
  }

  return rankedEntries;
};

const getStartDate = (period: 'week' | 'month' | 'year'): Date => {
  const date = new Date();
  switch (period) {
    case 'week':
      date.setDate(date.getDate() - 7);
      break;
    case 'month':
      date.setMonth(date.getMonth() - 1);
      break;
    case 'year':
      date.setFullYear(date.getFullYear() - 1);
      break;
  }
  return date;
};

export const calculateLeaderboards = (
  users: User[],
  chapters: Chapter[],
  outreachLogs: OutreachLog[],
  events: CubeEvent[]
): LeaderboardData => {
  const metrics = calculateAllMetrics(users, events, chapters, outreachLogs);
  const confirmedUsers = metrics.users.confirmed;
  const userMap = new Map<string, User>(confirmedUsers.map((u) => [u.id, u]));
  const chapterMap = new Map<string, Chapter>(chapters.map((c) => [c.name, c]));

  const chapterToMembersMap = metrics.users.byChapter;

  const eventToCityMap = new Map<string, string>();
  events.forEach((e) => eventToCityMap.set(e.id, e.city));

  const userHoursAllTime = [...confirmedUsers]
    .map((user) => {
      const userStats = metrics.users.stats.get(user.id);
      return {
        user,
        value: Math.round(userStats?.totalHours || 0),
      };
    })
    .sort((a, b) => b.value - a.value)
    .slice(0, 50);

  const calculateTimedUserHours = (
    periods: ('week' | 'month' | 'year')[]
  ): Record<'week' | 'month' | 'year', UserLeaderboardEntry[]> => {
    const results: Record<'week' | 'month' | 'year', UserLeaderboardEntry[]> = {
      week: [],
      month: [],
      year: [],
    };

    const periodStartDates = {
      week: getStartDate('week'),
      month: getStartDate('month'),
      year: getStartDate('year'),
    };

    const periodHourCounts: Record<
      'week' | 'month' | 'year',
      Record<string, number>
    > = {
      week: {},
      month: {},
      year: {},
    };

    for (const event of events) {
      if (!event.report) continue;

      const eventDate = new Date(event.startDate);

      for (const period of periods) {
        if (eventDate >= periodStartDates[period]) {
          for (const [userId, status] of Object.entries(
            event.report.attendance
          )) {
            if (status === 'Attended' && userMap.has(userId)) {
              const currentHours = periodHourCounts[period][userId] || 0;
              periodHourCounts[period][userId] =
                currentHours + event.report.hours;
            }
          }
        }
      }
    }

    for (const period of periods) {
      results[period] = Object.entries(periodHourCounts[period])
        .map(([userId, count]) => ({
          user: userMap.get(userId)!,
          value: Math.round(count),
        }))
        .filter((entry) => entry.user)
        .sort((a, b) => b.value - a.value)
        .slice(0, 50);
    }

    return results;
  };

  const userConversationsAllTime = [...confirmedUsers]
    .map((user) => ({
      user,
      value: user.stats.totalConversations,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 50);

  const calculateTimedUserConversations = (
    periods: ('week' | 'month' | 'year')[]
  ): Record<'week' | 'month' | 'year', UserLeaderboardEntry[]> => {
    const results: Record<'week' | 'month' | 'year', UserLeaderboardEntry[]> = {
      week: [],
      month: [],
      year: [],
    };

    const periodStartDates = {
      week: getStartDate('week'),
      month: getStartDate('month'),
      year: getStartDate('year'),
    };

    const periodLogCounts: Record<
      'week' | 'month' | 'year',
      Record<string, number>
    > = {
      week: {},
      month: {},
      year: {},
    };

    for (const log of outreachLogs) {
      if (!userMap.has(log.userId)) continue;

      const logDate = new Date(log.createdAt);

      for (const period of periods) {
        if (logDate >= periodStartDates[period]) {
          const currentCount = periodLogCounts[period][log.userId] || 0;
          periodLogCounts[period][log.userId] = currentCount + 1;
        }
      }
    }

    for (const period of periods) {
      results[period] = Object.entries(periodLogCounts[period])
        .map(([userId, count]) => ({
          user: userMap.get(userId)!,
          value: count,
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 50);
    }

    return results;
  };

  const chapterHoursAllTime = (() => {
    const chapterHourMap = new Map<string, number>();

    for (const event of events) {
      if (event.report) {
        const chapterName = event.city;
        const chapterMembers = chapterToMembersMap.get(chapterName) || [];
        const attendingMembers = chapterMembers.filter(
          (user) => event.report!.attendance[user.id] === 'Attended'
        );
        const chapterHours = event.report.hours * attendingMembers.length;

        const currentHours = chapterHourMap.get(chapterName) || 0;
        chapterHourMap.set(chapterName, currentHours + chapterHours);
      }
    }

    return Array.from(chapterHourMap.entries())
      .map(([chapterName, hours]) => ({
        chapter: chapterMap.get(chapterName)!,
        value: Math.round(hours),
      }))
      .filter((entry) => entry.chapter)
      .sort((a, b) => b.value - a.value)
      .slice(0, 50);
  })();

  const calculateTimedChapterHours = (
    periods: ('week' | 'month' | 'year')[]
  ): Record<'week' | 'month' | 'year', ChapterLeaderboardEntry[]> => {
    const results: Record<
      'week' | 'month' | 'year',
      ChapterLeaderboardEntry[]
    > = {
      week: [],
      month: [],
      year: [],
    };

    const periodStartDates = {
      week: getStartDate('week'),
      month: getStartDate('month'),
      year: getStartDate('year'),
    };

    const periodHourCounts: Record<
      'week' | 'month' | 'year',
      Record<string, number>
    > = {
      week: {},
      month: {},
      year: {},
    };

    for (const event of events) {
      if (!event.report) continue;

      const eventDate = new Date(event.startDate);
      const chapterName = event.city;

      if (!chapterMap.has(chapterName)) continue;

      for (const period of periods) {
        if (eventDate >= periodStartDates[period]) {
          const chapterMembers = chapterToMembersMap.get(chapterName) || [];
          const attendingChapterMembers = chapterMembers.filter(
            (user) => event.report!.attendance[user.id] === 'Attended'
          );
          const chapterHours =
            event.report.hours * attendingChapterMembers.length;

          const currentHours = periodHourCounts[period][chapterName] || 0;
          periodHourCounts[period][chapterName] = currentHours + chapterHours;
        }
      }
    }

    for (const period of periods) {
      results[period] = Object.entries(periodHourCounts[period])
        .map(([chapterName, count]) => ({
          chapter: chapterMap.get(chapterName)!,
          value: Math.round(count),
        }))
        .filter((entry) => entry.chapter)
        .sort((a, b) => b.value - a.value)
        .slice(0, 50);
    }

    return results;
  };

  const chapterConversationsAllTime = (() => {
    const chapterConversationMap = new Map<string, number>();

    for (const log of outreachLogs) {
      const chapterName = eventToCityMap.get(log.eventId);
      if (chapterName) {
        const currentCount = chapterConversationMap.get(chapterName) || 0;
        chapterConversationMap.set(chapterName, currentCount + 1);
      }
    }

    return Array.from(chapterConversationMap.entries())
      .map(([chapterName, count]) => ({
        chapter: chapterMap.get(chapterName)!,
        value: count,
      }))
      .filter((entry) => entry.chapter)
      .sort((a, b) => b.value - a.value)
      .slice(0, 50);
  })();

  const calculateTimedChapterConversations = (
    periods: ('week' | 'month' | 'year')[]
  ): Record<'week' | 'month' | 'year', ChapterLeaderboardEntry[]> => {
    const results: Record<
      'week' | 'month' | 'year',
      ChapterLeaderboardEntry[]
    > = {
      week: [],
      month: [],
      year: [],
    };

    const periodStartDates = {
      week: getStartDate('week'),
      month: getStartDate('month'),
      year: getStartDate('year'),
    };

    const periodLogCounts: Record<
      'week' | 'month' | 'year',
      Record<string, number>
    > = {
      week: {},
      month: {},
      year: {},
    };

    for (const log of outreachLogs) {
      const chapterName = eventToCityMap.get(log.eventId);
      if (!chapterName || !chapterMap.has(chapterName)) continue;

      const logDate = new Date(log.createdAt);

      for (const period of periods) {
        if (logDate >= periodStartDates[period]) {
          const currentCount = periodLogCounts[period][chapterName] || 0;
          periodLogCounts[period][chapterName] = currentCount + 1;
        }
      }
    }

    for (const period of periods) {
      results[period] = Object.entries(periodLogCounts[period])
        .map(([chapterName, count]) => ({
          chapter: chapterMap.get(chapterName)!,
          value: count,
        }))
        .filter((entry) => entry.chapter)
        .sort((a, b) => b.value - a.value)
        .slice(0, 50);
    }

    return results;
  };

  const userHoursByPeriod = calculateTimedUserHours(['week', 'month', 'year']);
  const userConversationsByPeriod = calculateTimedUserConversations([
    'week',
    'month',
    'year',
  ]);
  const chapterHoursByPeriod = calculateTimedChapterHours([
    'week',
    'month',
    'year',
  ]);
  const chapterConversationsByPeriod = calculateTimedChapterConversations([
    'week',
    'month',
    'year',
  ]);

  return {
    user: {
      hours: {
        week: userHoursByPeriod.week,
        month: userHoursByPeriod.month,
        year: userHoursByPeriod.year,
        allTime: userHoursAllTime,
      },
      conversations: {
        week: userConversationsByPeriod.week,
        month: userConversationsByPeriod.month,
        year: userConversationsByPeriod.year,
        allTime: userConversationsAllTime,
      },
    },
    chapter: {
      hours: {
        week: chapterHoursByPeriod.week,
        month: chapterHoursByPeriod.month,
        year: chapterHoursByPeriod.year,
        allTime: chapterHoursAllTime,
      },
      conversations: {
        week: chapterConversationsByPeriod.week,
        month: chapterConversationsByPeriod.month,
        year: chapterConversationsByPeriod.year,
        allTime: chapterConversationsAllTime,
      },
    },
  };
};
