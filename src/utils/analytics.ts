// NOTE: In a production application, these complex data aggregations (getChapterStats, getGlobalStats, etc.)
// should be performed on the backend. The client should fetch pre-computed data to ensure performance and scalability.

import { type User, type CubeEvent, type Chapter, OutreachLog } from '@/types';

export interface ChapterStats {
    name: string;
    country: string;
    memberCount: number;
    totalHours: number;
    totalConversations: number;
    eventsHeld: number;
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
}

export interface MonthlyTrend {
    month: string;
    count: number;
}

const getConfirmedUsers = (users: User[]): User[] =>
    users.filter((u) => u.onboardingStatus === 'Confirmed');

export const getGlobalStats = (
    users: User[],
    events: CubeEvent[],
    chapters: Chapter[]
): GlobalStats => {
    const confirmedUsers = getConfirmedUsers(users);
    const totalHours = confirmedUsers.reduce(
        (sum, user) => sum + user.stats.totalHours,
        0
    );
    const totalConversations = confirmedUsers.reduce(
        (sum, user) => sum + user.stats.totalConversations,
        0
    );

    return {
        totalMembers: confirmedUsers.length,
        totalHours: Math.round(totalHours),
        totalConversations,
        totalEvents: events.length,
        chapterCount: chapters.length,
    };
};

export const getChapterStats = (
    users: User[],
    events: CubeEvent[],
    chapters: Chapter[],
    outreachLogs: OutreachLog[] // Add outreachLogs as a parameter
): ChapterStats[] => {
    const confirmedUsers = getConfirmedUsers(users);
    return chapters.map((chapter) => {
        const chapterUsers = confirmedUsers.filter((u) =>
            u.chapters.includes(chapter.name)
        );
        const chapterEvents = events.filter((e) => e.city === chapter.name);
        const chapterEventIds = new Set(chapterEvents.map((e) => e.id));

        const totalHours = chapterUsers.reduce(
            (sum, user) => sum + user.stats.totalHours,
            0
        );
        // Calculate from the source of truth (outreachLogs) instead of denormalized user stats
        const totalConversations = outreachLogs.filter((log) =>
            chapterEventIds.has(log.eventId)
        ).length;

        return {
            name: chapter.name,
            country: chapter.country,
            memberCount: chapterUsers.length,
            totalHours: Math.round(totalHours),
            totalConversations,
            eventsHeld: chapterEvents.length,
        };
    });
};

// NEW: Calculates total hours and conversations per chapter for the scatter plot
export const getChapterOutreachStats = (
    users: User[],
    events: CubeEvent[],
    chapters: Chapter[],
    outreachLogs: OutreachLog[]
): ChapterOutreachStats[] => {
    const confirmedUsers = getConfirmedUsers(users);
    return chapters.map((chapter) => {
        const chapterUsers = confirmedUsers.filter((u) =>
            u.chapters.includes(chapter.name)
        );
        const chapterEvents = events.filter((e) => e.city === chapter.name);
        const chapterEventIds = new Set(chapterEvents.map((e) => e.id));

        const totalHours = chapterUsers.reduce(
            (sum, user) => sum + user.stats.totalHours,
            0
        );
        const totalConversations = outreachLogs.filter((log) =>
            chapterEventIds.has(log.eventId)
        ).length;

        return {
            name: chapter.name,
            totalHours: Math.round(totalHours),
            totalConversations,
        };
    });
};

export const getEventTrendsByMonth = (
    events: CubeEvent[],
    months: number = 12
): MonthlyTrend[] => {
    const trends: Record<string, number> = {};
    const now = new Date();

    for (let i = 0; i < months; i++) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        trends[key] = 0;
    }

    events.forEach((event) => {
        const eventDate = new Date(event.startDate);
        const key = `${eventDate.getFullYear()}-${String(eventDate.getMonth() + 1).padStart(2, '0')}`;
        if (Object.prototype.hasOwnProperty.call(trends, key)) {
            trends[key]++;
        }
    });

    return Object.entries(trends)
        .map(([month, count]) => ({ month, count }))
        .reverse();
};

/**
 * NEW: Calculates the number of conversations logged per month.
 */
export const getConversationTrendsByMonth = (
    outreachLogs: OutreachLog[],
    months: number = 12
): MonthlyTrend[] => {
    const trends: Record<string, number> = {};
    const now = new Date();

    for (let i = 0; i < months; i++) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        trends[key] = 0;
    }

    outreachLogs.forEach((log) => {
        const logDate = new Date(log.createdAt);
        const key = `${logDate.getFullYear()}-${String(logDate.getMonth() + 1).padStart(2, '0')}`;
        if (Object.prototype.hasOwnProperty.call(trends, key)) {
            trends[key]++;
        }
    });

    return Object.entries(trends)
        .map(([month, count]) => ({ month, count }))
        .reverse();
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
        if (event.startDate >= retentionCutoff && event.participants) {
            event.participants.forEach((attendee) =>
                recentEventParticipantIds.add(attendee.user.id)
            );
        }
    });

    const retainedCount = confirmedUsers.filter((u) =>
        recentEventParticipantIds.has(u.id)
    ).length;

    return {
        retained: retainedCount,
        total: confirmedUsers.length,
        rate:
            confirmedUsers.length > 0 ? retainedCount / confirmedUsers.length : 0,
    };
};

export const getMemberGrowth = (
    users: User[],
    months: number = 12
): MonthlyTrend[] => {
    const trends: Record<string, number> = {};
    const now = new Date();

    for (let i = 0; i < months; i++) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        trends[key] = 0;
    }

    users.forEach((user) => {
        if (user.joinDate) {
            const joinDate = new Date(user.joinDate);
            const key = `${joinDate.getFullYear()}-${String(joinDate.getMonth() + 1).padStart(2, '0')}`;
            if (Object.prototype.hasOwnProperty.call(trends, key)) {
                trends[key]++;
            }
        }
    });

    return Object.entries(trends)
        .map(([month, count]) => ({ month, count }))
        .reverse();
};

export const getTopActivistsByHours = (
    users: User[],
    count: number = 5
): { name: string; value: number }[] => {
    return [...getConfirmedUsers(users)]
        .sort((a, b) => b.stats.totalHours - a.stats.totalHours)
        .slice(0, count)
        .map((u) => ({ name: u.name, value: Math.round(u.stats.totalHours) }));
};

export const getAverageActivistsPerEvent = (events: CubeEvent[]): number => {
    if (events.length === 0) return 0;
    const totalAttendees = events.reduce(
        (sum, event) => sum + (event.participants ? event.participants.length : 0),
        0
    );
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
        (event) =>
            event.report && event.report.attendance[userId] === 'Attended'
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