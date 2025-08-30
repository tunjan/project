import {
  type Chapter,
  type CubeEvent,
  type OutreachLog,
  type User,
} from '@/types';

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

/**
 * Calculates proper ranks for leaderboard entries, handling ties correctly.
 * Entries with the same value get the same rank, and subsequent ranks are adjusted accordingly.
 * @param entries - Array of leaderboard entries sorted by value (descending)
 * @returns Array of entries with calculated ranks
 */
export const calculateRanks = <T extends { value: number }>(
  entries: T[]
): (T & { rank: number })[] => {
  if (entries.length === 0) return [];

  const rankedEntries: (T & { rank: number })[] = [];
  let currentRank = 1;
  let currentValue = entries[0]?.value;

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];

    // If this entry has a different value than the previous, update the rank
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

const getConfirmedUsers = (users: User[]): User[] => {
  return users.filter((u) => u.onboardingStatus === 'Confirmed');
};

export const calculateLeaderboards = (
  users: User[],
  chapters: Chapter[],
  outreachLogs: OutreachLog[],
  events: CubeEvent[]
): LeaderboardData => {
  const confirmedUsers = getConfirmedUsers(users);
  const userMap = new Map<string, User>(confirmedUsers.map((u) => [u.id, u]));
  const chapterMap = new Map<string, Chapter>(chapters.map((c) => [c.name, c]));

  // Performance optimization: Create chapter-to-members map once
  const chapterToMembersMap = new Map<string, User[]>();
  chapters.forEach((chapter) => chapterToMembersMap.set(chapter.name, []));
  confirmedUsers.forEach((user) => {
    user.chapters.forEach((chapterName) => {
      if (chapterToMembersMap.has(chapterName)) {
        chapterToMembersMap.get(chapterName)!.push(user);
      }
    });
  });

  const eventToCityMap = new Map<string, string>();
  events.forEach((e) => eventToCityMap.set(e.id, e.city));

  // --- USER LEADERBOARDS ---
  const userHoursAllTime = [...confirmedUsers]
    .map((user) => ({
      user,
      value: Math.round(user.stats.totalHours),
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 50);

  // CRITICAL FIX: Optimize performance by processing all time periods in a single pass
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

    // Process all events once and bucket by time periods
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

      // Check which time periods this event falls into
      for (const period of periods) {
        if (eventDate >= periodStartDates[period]) {
          // Calculate hours per user based on attendance
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

    // Convert each period's results to leaderboard entries
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

    // Process all outreach logs once and bucket by time periods
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

      // Check which time periods this log falls into
      for (const period of periods) {
        if (logDate >= periodStartDates[period]) {
          const currentCount = periodLogCounts[period][log.userId] || 0;
          periodLogCounts[period][log.userId] = currentCount + 1;
        }
      }
    }

    // Convert each period's results to leaderboard entries
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

  // --- CHAPTER LEADERBOARDS ---
  // FIX: Optimize performance by building maps first instead of filtering for each chapter
  const chapterHoursAllTime = (() => {
    // Build a map of chapter hours efficiently
    const chapterHourMap = new Map<string, number>();

    // Process all events once to build chapter hours
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

    // Convert map to array and sort
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

    // Process all events once and bucket by time periods
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

      // Check which time periods this event falls into
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

    // Convert each period's results to leaderboard entries
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

  // Optimized: Use pre-computed eventToCityMap for O(1) lookup
  const chapterConversationsAllTime = (() => {
    // Build a map of chapter conversations efficiently
    const chapterConversationMap = new Map<string, number>();

    // Process all outreach logs once to build chapter conversation counts
    for (const log of outreachLogs) {
      const chapterName = eventToCityMap.get(log.eventId);
      if (chapterName) {
        const currentCount = chapterConversationMap.get(chapterName) || 0;
        chapterConversationMap.set(chapterName, currentCount + 1);
      }
    }

    // Convert map to array and sort
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

    // Process all outreach logs once and bucket by time periods
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

      // Check which time periods this log falls into
      for (const period of periods) {
        if (logDate >= periodStartDates[period]) {
          const currentCount = periodLogCounts[period][chapterName] || 0;
          periodLogCounts[period][chapterName] = currentCount + 1;
        }
      }
    }

    // Convert each period's results to leaderboard entries
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

  // CRITICAL FIX: Call optimized functions once to get all time periods
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
