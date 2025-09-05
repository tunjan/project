import {
  type Chapter,
  type CubeEvent,
  type OutreachLog,
  type User,
} from '@/types';
import { getConfirmedUsers } from '@/utils';

// Comprehensive metrics data structure
export interface MetricsData {
  // User metrics
  users: {
    confirmed: User[];
    byChapter: Map<string, User[]>;
    byRole: Map<string, User[]>;
    stats: Map<string, UserStats>;
  };

  // Chapter metrics
  chapters: {
    stats: Map<string, ChapterStats>;
    outreachStats: Map<string, ChapterOutreachStats>;
  };

  // Event metrics
  events: {
    byChapter: Map<string, CubeEvent[]>;
    byMonth: Map<string, CubeEvent[]>;
    byStatus: Map<string, CubeEvent[]>;
  };

  // Outreach metrics
  outreach: {
    byUser: Map<string, OutreachLog[]>;
    byEvent: Map<string, OutreachLog[]>;
    byMonth: Map<string, OutreachLog[]>;
  };

  // Time-bucketed data
  timeBuckets: {
    weekly: Map<string, OutreachLog[]>;
    monthly: Map<string, OutreachLog[]>;
    yearly: Map<string, OutreachLog[]>;
  };

  // Global aggregated stats
  global: GlobalStats;
}

export interface UserStats {
  totalHours: number;
  cubesAttended: number;
  veganConversions: number;
  totalConversations: number;
  cities: string[];
}

export interface ChapterStats {
  name: string;
  country: string;
  memberCount: number;
  totalHours: number;
  totalConversations: number;
  eventsHeld: number;
  conversationsPerHour: number;
}

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

/**
 * Primary function to calculate all metrics from raw data
 * This runs once and generates a comprehensive, structured object
 * containing all necessary pre-computed data
 */
export const calculateAllMetrics = (
  users: User[],
  events: CubeEvent[],
  chapters: Chapter[],
  outreachLogs: OutreachLog[]
): MetricsData => {
  const confirmedUsers = getConfirmedUsers(users);

  // Initialize data structures
  const metrics: MetricsData = {
    users: {
      confirmed: confirmedUsers,
      byChapter: new Map(),
      byRole: new Map(),
      stats: new Map(),
    },
    chapters: {
      stats: new Map(),
      outreachStats: new Map(),
    },
    events: {
      byChapter: new Map(),
      byMonth: new Map(),
      byStatus: new Map(),
    },
    outreach: {
      byUser: new Map(),
      byEvent: new Map(),
      byMonth: new Map(),
    },
    timeBuckets: {
      weekly: new Map(),
      monthly: new Map(),
      yearly: new Map(),
    },
    global: {
      totalMembers: 0,
      totalHours: 0,
      totalConversations: 0,
      totalEvents: 0,
      chapterCount: 0,
      conversationsPerHour: 0,
    },
  };

  // FIX: Optimize performance by building user attendance and outreach maps first
  const userAttendance = new Map<string, Set<string>>(); // userId -> Set of attended eventIds
  const userOutreachCount = new Map<string, number>(); // userId -> conversation count

  // Build attendance map from events
  events.forEach((event) => {
    if (event.report) {
      for (const [userId, status] of Object.entries(event.report.attendance)) {
        if (status === 'Attended') {
          if (!userAttendance.has(userId)) {
            userAttendance.set(userId, new Set());
          }
          userAttendance.get(userId)!.add(event.id);
        }
      }
    }
  });

  // Build outreach map from logs
  outreachLogs.forEach((log) => {
    const currentCount = userOutreachCount.get(log.userId) || 0;
    userOutreachCount.set(log.userId, currentCount + 1);
  });

  // Process users with optimized data
  confirmedUsers.forEach((user) => {
    // Group by chapter
    user.chapters.forEach((chapterName) => {
      if (!metrics.users.byChapter.has(chapterName)) {
        metrics.users.byChapter.set(chapterName, []);
      }
      metrics.users.byChapter.get(chapterName)!.push(user);
    });

    // Group by role
    if (!metrics.users.byRole.has(user.role)) {
      metrics.users.byRole.set(user.role, []);
    }
    metrics.users.byRole.get(user.role)!.push(user);

    // Calculate user stats using pre-built maps
    const userStats = calculateUserStatsOptimized(
      user,
      events,
      userAttendance.get(user.id) || new Set(),
      userOutreachCount.get(user.id) || 0,
      outreachLogs
    );
    metrics.users.stats.set(user.id, userStats);
  });

  // Process chapters
  chapters.forEach((chapter) => {
    const chapterUsers = metrics.users.byChapter.get(chapter.name) || [];
    const chapterEvents = events.filter((e) => e.city === chapter.name);
    const chapterOutreachLogs = outreachLogs.filter((log) => {
      const event = events.find((e) => e.id === log.eventId);
      return event?.city === chapter.name;
    });

    const chapterStats = calculateChapterStats(
      chapter,
      chapterUsers,
      chapterEvents,
      chapterOutreachLogs
    );
    metrics.chapters.stats.set(chapter.name, chapterStats);

    const outreachStats = calculateChapterOutreachStats(
      chapter,
      chapterEvents,
      chapterOutreachLogs
    );
    metrics.chapters.outreachStats.set(chapter.name, outreachStats);
  });

  // Process events
  events.forEach((event) => {
    // Group by chapter
    if (!metrics.events.byChapter.has(event.city)) {
      metrics.events.byChapter.set(event.city, []);
    }
    metrics.events.byChapter.get(event.city)!.push(event);

    // Group by month
    const startDate = new Date(event.startDate);
    const monthKey = `${startDate.getFullYear()}-${String(
      startDate.getMonth() + 1
    ).padStart(2, '0')}`;
    if (!metrics.events.byMonth.has(monthKey)) {
      metrics.events.byMonth.set(monthKey, []);
    }
    metrics.events.byMonth.get(monthKey)!.push(event);

    // Group by status
    if (!metrics.events.byStatus.has(event.status)) {
      metrics.events.byStatus.set(event.status, []);
    }
    metrics.events.byStatus.get(event.status)!.push(event);
  });

  // Process outreach logs
  outreachLogs.forEach((log) => {
    // Group by user
    if (!metrics.outreach.byUser.has(log.userId)) {
      metrics.outreach.byUser.set(log.userId, []);
    }
    metrics.outreach.byUser.get(log.userId)!.push(log);

    // Group by event
    if (!metrics.outreach.byEvent.has(log.eventId)) {
      metrics.outreach.byEvent.set(log.eventId, []);
    }
    metrics.outreach.byEvent.get(log.eventId)!.push(log);

    // Group by month - ensure createdAt is a Date object
    const createdAt =
      log.createdAt instanceof Date ? log.createdAt : new Date(log.createdAt);
    const monthKey = `${createdAt.getFullYear()}-${String(createdAt.getMonth() + 1).padStart(2, '0')}`;
    if (!metrics.outreach.byMonth.has(monthKey)) {
      metrics.outreach.byMonth.set(monthKey, []);
    }
    metrics.outreach.byMonth.get(monthKey)!.push(log);
  });

  // Calculate global stats
  metrics.global = calculateGlobalStats(metrics);

  return metrics;
};

// Optimized helper function using pre-built maps
const calculateUserStatsOptimized = (
  user: User,
  events: CubeEvent[],
  attendedEventIds: Set<string>,
  outreachCount: number,
  allOutreachLogs: OutreachLog[]
): UserStats => {
  const userEvents = events.filter((e) => attendedEventIds.has(e.id));
  const userOutreachLogs = allOutreachLogs.filter(
    (log) => log.userId === user.id
  );

  const totalHours = userEvents.reduce(
    (sum, event) => sum + (event.report?.hours || 0),
    0
  );

  const veganConversions = userOutreachLogs.filter(
    (log) =>
      log.outcome === 'Became vegan and activist' ||
      log.outcome === 'Became vegan'
  ).length;

  const cities = [...new Set(userEvents.map((e) => e.city))];

  return {
    totalHours,
    cubesAttended: userEvents.length,
    veganConversions,
    totalConversations: outreachCount,
    cities,
  };
};

const calculateChapterStats = (
  chapter: Chapter,
  users: User[],
  events: CubeEvent[],
  outreachLogs: OutreachLog[]
): ChapterStats => {
  const totalHours = events.reduce(
    (sum, event) => sum + (event.report?.hours || 0),
    0
  );
  const totalConversations = outreachLogs.length;
  const conversationsPerHour =
    totalHours > 0 ? totalConversations / totalHours : 0;

  return {
    name: chapter.name,
    country: chapter.country,
    memberCount: users.length,
    totalHours,
    totalConversations,
    eventsHeld: events.length,
    conversationsPerHour,
  };
};

const calculateChapterOutreachStats = (
  chapter: Chapter,
  events: CubeEvent[],
  outreachLogs: OutreachLog[]
): ChapterOutreachStats => {
  const totalHours = events.reduce(
    (sum, event) => sum + (event.report?.hours || 0),
    0
  );
  const totalConversations = outreachLogs.length;

  return {
    name: chapter.name,
    totalHours,
    totalConversations,
  };
};

const calculateGlobalStats = (metrics: MetricsData): GlobalStats => {
  const totalMembers = metrics.users.confirmed.length;
  const totalHours = Array.from(metrics.chapters.stats.values()).reduce(
    (sum, stats) => sum + stats.totalHours,
    0
  );
  const totalConversations = Array.from(metrics.chapters.stats.values()).reduce(
    (sum, stats) => sum + stats.totalConversations,
    0
  );
  const totalEvents = Array.from(metrics.events.byChapter.values()).reduce(
    (sum, events) => sum + events.length,
    0
  );
  const chapterCount = metrics.chapters.stats.size;
  const conversationsPerHour =
    totalHours > 0 ? totalConversations / totalHours : 0;

  return {
    totalMembers,
    totalHours,
    totalConversations,
    totalEvents,
    chapterCount,
    conversationsPerHour,
  };
};
