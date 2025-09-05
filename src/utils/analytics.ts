// NOTE: In a production application, these complex data aggregations (getChapterStats, getGlobalStats, etc.)
// should be performed on the backend. The client should fetch pre-computed data to ensure performance and scalability.

import { type Chapter, type CubeEvent, OutreachLog, type User } from '@/types';
import { safeParseDate } from './date';
import { getConfirmedUsers } from './user';

import { calculateAllMetrics } from './metrics';

export interface ChapterStats {
  name: string;
  country: string;
  memberCount: number;
  totalHours: number;
  totalConversations: number;
  eventsHeld: number;
  conversationsPerHour: number;
}

// NEW: A dedicated type for our new efficiency metric
export interface ChapterOutreachStats {
  name: string;
  totalHours: number;
  totalConversations: number;
}

export interface GlobalStats {
  totalMembers: number;
  totalHours: number;
  totalConversations: number;
  totalEvents: number;
  chapterCount: number;
  conversationsPerHour: number;
}

export interface MonthlyTrend {
  month: string;
  count: number;
}

export const getGlobalStats = (
  users: User[],
  events: CubeEvent[],
  chapters: Chapter[],
  outreachLogs: OutreachLog[]
): GlobalStats => {
  const metrics = calculateAllMetrics(users, events, chapters, outreachLogs);
  return metrics.global;
};

export const getChapterStats = (
  users: User[],
  events: CubeEvent[],
  chapters: Chapter[],
  outreachLogs: OutreachLog[]
): ChapterStats[] => {
  const metrics = calculateAllMetrics(users, events, chapters, outreachLogs);
  return Array.from(metrics.chapters.stats.values());
};

// NEW: Calculates total hours and conversations per chapter for the scatter plot
export const getChapterOutreachStats = (
  users: User[],
  events: CubeEvent[],
  chapters: Chapter[],
  outreachLogs: OutreachLog[]
): ChapterOutreachStats[] => {
  const metrics = calculateAllMetrics(users, events, chapters, outreachLogs);
  return Array.from(metrics.chapters.outreachStats.values());
};

// Generic helper for generating monthly trends
const generateMonthlyTrend = <T>(
  items: T[],
  getDate: (item: T) => Date | undefined,
  months: number = 12
): MonthlyTrend[] => {
  const trends: Record<string, number> = {};
  const now = new Date();

  // Initialize all months with 0
  for (let i = 0; i < months; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    trends[key] = 0;
  }

  // Count items per month
  items.forEach((item) => {
    const itemDate = getDate(item);
    if (itemDate) {
      const key = `${itemDate.getFullYear()}-${String(itemDate.getMonth() + 1).padStart(2, '0')}`;
      if (Object.prototype.hasOwnProperty.call(trends, key)) {
        trends[key]++;
      }
    }
  });

  return Object.entries(trends)
    .map(([month, count]) => ({ month, count }))
    .reverse();
};

export const getEventTrendsByMonth = (
  events: CubeEvent[],
  months: number = 12
): MonthlyTrend[] => {
  return generateMonthlyTrend(
    events,
    (e) => safeParseDate(e.startDate) || undefined,
    months
  );
};

/**
 * NEW: Calculates the number of conversations logged per month.
 */
export const getConversationTrendsByMonth = (
  outreachLogs: OutreachLog[],
  months: number = 12
): MonthlyTrend[] => {
  return generateMonthlyTrend(
    outreachLogs,
    (log) => safeParseDate(log.createdAt) || undefined,
    months
  );
};

export const getActivistRetention = (
  users: User[],
  events: CubeEvent[],
  retentionMonths: number = 3
): { retained: number; total: number; rate: number } => {
  const now = new Date();
  const retentionCutoff = new Date();
  retentionCutoff.setMonth(now.getMonth() - retentionMonths);

  const confirmedUsers = getConfirmedUsers(users);
  if (confirmedUsers.length === 0) return { retained: 0, total: 0, rate: 0 };

  const recentEventParticipantIds = new Set<string>();
  events.forEach((event) => {
    if (new Date(event.startDate) >= retentionCutoff && event.report) {
      for (const userId in event.report.attendance) {
        if (event.report.attendance[userId] === 'Attended') {
          recentEventParticipantIds.add(userId);
        }
      }
    }
  });

  const retainedCount = confirmedUsers.filter((u) =>
    recentEventParticipantIds.has(u.id)
  ).length;

  return {
    retained: retainedCount,
    total: confirmedUsers.length,
    rate: confirmedUsers.length > 0 ? retainedCount / confirmedUsers.length : 0,
  };
};

export const getMemberGrowth = (
  users: User[],
  months: number = 12
): MonthlyTrend[] => {
  return generateMonthlyTrend(
    users,
    (user) => (user.joinDate ? new Date(user.joinDate) : undefined),
    months
  );
};

export const getTotalMembersByMonth = (
  users: User[],
  months: number = 12
): MonthlyTrend[] => {
  const trends: Record<string, number> = {};
  const now = new Date();
  const confirmedUsers = getConfirmedUsers(users);

  // Initialize all months with 0
  for (let i = 0; i < months; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    trends[key] = 0;
  }

  // CRITICAL FIX: Optimize from O(N*M) to O(N+M) by processing users once
  // and calculating their active months efficiently
  for (const user of confirmedUsers) {
    if (!user.joinDate) continue;

    const joinDate = new Date(user.joinDate);
    const leaveDate = user.leaveDate ? new Date(user.leaveDate) : null;

    // Calculate the range of months this user was active
    const joinMonth = new Date(joinDate.getFullYear(), joinDate.getMonth(), 1);
    const leaveMonth = leaveDate
      ? new Date(leaveDate.getFullYear(), leaveDate.getMonth(), 1)
      : null;

    // Find the earliest month we care about
    const earliestMonth = new Date(
      now.getFullYear(),
      now.getMonth() - months + 1,
      1
    );

    // Determine start and end months for this user's activity
    const startMonth = joinMonth > earliestMonth ? joinMonth : earliestMonth;
    const endMonth = leaveMonth && leaveMonth < now ? leaveMonth : now;

    // Add 1 to each month in the user's active range
    const currentMonth = new Date(startMonth);
    while (currentMonth <= endMonth && currentMonth <= now) {
      const key = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}`;
      if (Object.prototype.hasOwnProperty.call(trends, key)) {
        trends[key]++;
      }
      currentMonth.setMonth(currentMonth.getMonth() + 1);
    }
  }

  return Object.entries(trends)
    .map(([month, count]) => ({ month, count }))
    .reverse();
};

export const getTopActivistsByHours = (
  users: User[],
  allEvents: CubeEvent[],
  count: number = 5
): { name: string; value: number }[] => {
  const confirmedUsers = getConfirmedUsers(users);

  // FIX: Optimize performance by iterating through events only once
  // Build a map of user hours instead of filtering events for each user
  const userHours = new Map<string, number>();

  // Iterate through events once to build the map
  for (const event of allEvents) {
    if (event.report) {
      for (const [userId, status] of Object.entries(event.report.attendance)) {
        if (status === 'Attended') {
          const currentHours = userHours.get(userId) || 0;
          userHours.set(userId, currentHours + (event.report.hours || 0));
        }
      }
    }
  }

  const usersWithHours = confirmedUsers.map((user) => ({
    ...user,
    totalHours: userHours.get(user.id) || 0,
  }));

  return usersWithHours
    .sort((a, b) => b.totalHours - a.totalHours)
    .slice(0, count)
    .map((u) => ({ name: u.name, value: Math.round(u.totalHours) }));
};

export const getAverageActivistsPerEvent = (events: CubeEvent[]): number => {
  if (events.length === 0) return 0;
  const totalAttendees = events.reduce((sum, event) => {
    if (!event.report) return sum;
    const attendedCount = Object.values(event.report.attendance).filter(
      (status) => status === 'Attended'
    ).length;
    return sum + attendedCount;
  }, 0);
  return totalAttendees / events.length;
};

/**
 * Aggregates a specific user's hours per month.
 */
export const getUserHoursByMonth = (
  userId: string,
  allEvents: CubeEvent[]
): { month: string; count: number }[] => {
  const trends: Record<string, number> = {};

  const userAttendedEvents = allEvents.filter(
    (event) => event.report && event.report.attendance[userId] === 'Attended'
  );

  for (const event of userAttendedEvents) {
    const eventDate = new Date(event.startDate);
    const key = `${eventDate.getFullYear()}-${String(
      eventDate.getMonth() + 1
    ).padStart(2, '0')}`;
    trends[key] = (trends[key] || 0) + (event.report?.hours || 0);
  }

  return Object.entries(trends)
    .map(([month, count]) => ({ month, count }))
    .sort((a, b) => a.month.localeCompare(b.month));
};

/**
 * Aggregates a specific user's conversations per month.
 */
export const getUserConversationsByMonth = (
  userId: string,
  allLogs: OutreachLog[]
): { month: string; count: number }[] => {
  const trends: Record<string, number> = {};
  const userLogs = allLogs.filter((log) => log.userId === userId);

  for (const log of userLogs) {
    const logDate = new Date(log.createdAt);
    const key = `${logDate.getFullYear()}-${String(
      logDate.getMonth() + 1
    ).padStart(2, '0')}`;
    trends[key] = (trends[key] || 0) + 1;
  }

  return Object.entries(trends)
    .map(([month, count]) => ({ month, count }))
    .sort((a, b) => a.month.localeCompare(b.month));
};

/**
 * NEW: Calculates the number of times a user has attended an event in each city.
 */
export const getCityAttendanceForUser = (
  userId: string,
  allEvents: CubeEvent[]
): { city: string; count: number }[] => {
  const cityCounts: Record<string, number> = {};

  const attendedEvents = allEvents.filter(
    (event) => event.report?.attendance[userId] === 'Attended'
  );

  for (const event of attendedEvents) {
    cityCounts[event.city] = (cityCounts[event.city] || 0) + 1;
  }

  return Object.entries(cityCounts)
    .map(([city, count]) => ({ city, count }))
    .sort((a, b) => b.count - a.count); // Sort by most visited
};

// A helper function to create bins for histogram data.
const createHistogramData = (
  values: number[],
  numBins: number = 10
): { range: string; count: number }[] => {
  if (values.length === 0) return [];

  const maxVal = Math.max(...values, 0);
  if (maxVal === 0) return [{ range: '0', count: values.length }];

  const binSize = Math.ceil(maxVal / numBins) || 1;

  const bins: number[] = Array(numBins).fill(0);

  values.forEach((value) => {
    const binIndex = Math.min(Math.floor(value / binSize), numBins - 1);
    bins[binIndex]++;
  });

  return bins.map((count, i) => {
    const lower = i * binSize;
    const upper = (i + 1) * binSize - 1;
    return {
      range: `${lower}-${upper}`,
      count,
    };
  });
};

/**
 * NEW: Generates data for activist hours distribution histogram.
 */
export const getActivistHoursDistribution = (
  users: User[],
  allEvents: CubeEvent[]
): { name: string; value: number }[] => {
  const confirmedUsers = getConfirmedUsers(users);

  // Build a map of user hours from events
  const userHours = new Map<string, number>();

  // Process all events once to build user hours map
  for (const event of allEvents) {
    if (event.report) {
      for (const [userId, status] of Object.entries(event.report.attendance)) {
        if (status === 'Attended') {
          const currentHours = userHours.get(userId) || 0;
          userHours.set(userId, currentHours + (event.report.hours || 0));
        }
      }
    }
  }

  // Calculate hours for each user
  const usersWithHours = confirmedUsers.map((user) => ({
    ...user,
    totalHours: userHours.get(user.id) || 0,
  }));

  return usersWithHours
    .sort((a, b) => b.totalHours - a.totalHours)
    .slice(0, 10)
    .map((u) => ({ name: u.name, value: Math.round(u.totalHours) }));
};

/**
 * NEW: Generates data for activist conversations distribution histogram.
 */
export const getActivistConversationsDistribution = (
  users: User[],
  allLogs: OutreachLog[]
): { name: string; value: number }[] => {
  const confirmedUsers = getConfirmedUsers(users);

  // Build a map of user conversations from logs
  const userConversations = new Map<string, number>();

  // Process all logs once to build user conversations map
  for (const log of allLogs) {
    const currentCount = userConversations.get(log.userId) || 0;
    userConversations.set(log.userId, currentCount + 1);
  }

  // Calculate conversations for each user
  const usersWithConversations = confirmedUsers.map((user) => ({
    ...user,
    totalConversations: userConversations.get(user.id) || 0,
  }));

  return usersWithConversations
    .sort((a, b) => b.totalConversations - a.totalConversations)
    .slice(0, 10)
    .map((u) => ({ name: u.name, value: u.totalConversations }));
};

/**
 * NEW: Generates data for event turnout distribution histogram.
 */
export const getEventTurnoutDistribution = (
  events: CubeEvent[],
  numBins: number = 10
): { range: string; count: number }[] => {
  const values = events.map((e) => {
    if (!e.report) return 0;
    return Object.values(e.report.attendance).filter(
      (status) => status === 'Attended'
    ).length;
  });
  return createHistogramData(values, numBins);
};
