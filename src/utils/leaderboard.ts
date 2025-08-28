import {
    type User,
    type OutreachLog,
    type Chapter,
    type CubeEvent,
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
            rank: currentRank
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
    const chapterMap = new Map<string, Chapter>(
        chapters.map((c) => [c.name, c])
    );

    // Performance optimization: Create chapter-to-members map once
    const chapterToMembersMap = new Map<string, User[]>();
    chapters.forEach(chapter => chapterToMembersMap.set(chapter.name, []));
    confirmedUsers.forEach(user => {
        user.chapters.forEach(chapterName => {
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

    const calculateTimedUserHours = (
        period: 'week' | 'month' | 'year'
    ): UserLeaderboardEntry[] => {
        const startDate = getStartDate(period);
        const hourCounts: Record<string, number> = {}; // Key: userId

        const relevantEvents = events.filter(
            (e) => new Date(e.startDate) >= startDate && e.report
        );

        for (const event of relevantEvents) {
            if (event.report) {
                // Calculate hours per user based on attendance
                for (const [userId, status] of Object.entries(event.report.attendance)) {
                    if (status === 'Attended' && userMap.has(userId)) {
                        hourCounts[userId] = (hourCounts[userId] || 0) + event.report.hours;
                    }
                }
            }
        }

        return Object.entries(hourCounts)
            .map(([userId, count]) => ({
                user: userMap.get(userId)!,
                value: Math.round(count),
            }))
            .filter((entry) => entry.user)
            .sort((a, b) => b.value - a.value)
            .slice(0, 50);
    };

    const userConversationsAllTime = [...confirmedUsers]
        .map((user) => ({
            user,
            value: user.stats.totalConversations,
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 50);

    const calculateTimedUserConversations = (
        period: 'week' | 'month' | 'year'
    ): UserLeaderboardEntry[] => {
        const startDate = getStartDate(period);
        const logCounts: Record<string, number> = {};

        outreachLogs.forEach((log) => {
            if (
                new Date(log.createdAt) >= startDate &&
                userMap.has(log.userId) // Only count logs from confirmed users
            ) {
                logCounts[log.userId] = (logCounts[log.userId] || 0) + 1;
            }
        });

        return Object.entries(logCounts)
            .map(([userId, count]) => ({
                user: userMap.get(userId)!,
                value: count,
            }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 50);
    };

    // --- CHAPTER LEADERBOARDS ---
    const chapterHoursAllTime = chapters
        .map((chapter) => {
            const relevantEvents = events.filter(e => e.city === chapter.name && e.report);
            let totalHours = 0;
            const chapterMembers = chapterToMembersMap.get(chapter.name) || [];
            for (const event of relevantEvents) {
                const attendingChapterMembers = chapterMembers.filter(
                    user => event.report!.attendance[user.id] === 'Attended'
                );
                totalHours += event.report!.hours * attendingChapterMembers.length;
            }
            return { chapter, value: Math.round(totalHours) };
        })
        .sort((a, b) => b.value - a.value)
        .slice(0, 50);

    const calculateTimedChapterHours = (
        period: 'week' | 'month' | 'year'
    ): ChapterLeaderboardEntry[] => {
        const startDate = getStartDate(period);
        const hourCounts: Record<string, number> = {}; // Key: chapter.name

        const relevantEvents = events.filter(
            (e) => new Date(e.startDate) >= startDate && e.report
        );

        for (const event of relevantEvents) {
            // The event's city is the chapter name.
            const chapterName = event.city;
            if (chapterMap.has(chapterName) && event.report) {
                // Get chapter members who attended this event using pre-built map
                const chapterMembers = chapterToMembersMap.get(chapterName) || [];
                const attendingChapterMembers = chapterMembers.filter(
                    user => event.report!.attendance[user.id] === 'Attended'
                );
                // Multiply event hours by number of attending chapter members
                const chapterHours = event.report.hours * attendingChapterMembers.length;
                hourCounts[chapterName] = (hourCounts[chapterName] || 0) + chapterHours;
            }
        }

        return Object.entries(hourCounts)
            .map(([chapterName, count]) => ({
                chapter: chapterMap.get(chapterName)!,
                value: Math.round(count),
            }))
            .filter((entry) => entry.chapter)
            .sort((a, b) => b.value - a.value)
            .slice(0, 50);
    };

    const chapterConversationsAllTime = chapters
        .map((chapter) => {
            let totalConvos = 0;
            const chapterEventIds = new Set(
                events.filter((e) => e.city === chapter.name).map((e) => e.id)
            );
            outreachLogs.forEach((log) => {
                if (chapterEventIds.has(log.eventId)) {
                    totalConvos++;
                }
            });
            return { chapter, value: totalConvos };
        })
        .sort((a, b) => b.value - a.value)
        .slice(0, 50);

    const calculateTimedChapterConversations = (
        period: 'week' | 'month' | 'year'
    ): ChapterLeaderboardEntry[] => {
        const startDate = getStartDate(period);
        const logCounts: Record<string, number> = {}; // Key: chapter.name

        outreachLogs.forEach((log) => {
            if (new Date(log.createdAt) >= startDate && userMap.has(log.userId)) {
                const chapterName = eventToCityMap.get(log.eventId);
                if (chapterName && chapterMap.has(chapterName)) {
                    logCounts[chapterName] = (logCounts[chapterName] || 0) + 1;
                }
            }
        });

        return Object.entries(logCounts)
            .map(([chapterName, count]) => ({
                chapter: chapterMap.get(chapterName)!,
                value: count,
            }))
            .filter((entry) => entry.chapter)
            .sort((a, b) => b.value - a.value)
            .slice(0, 50);
    };

    return {
        user: {
            hours: {
                week: calculateTimedUserHours('week'),
                month: calculateTimedUserHours('month'),
                year: calculateTimedUserHours('year'),
                allTime: userHoursAllTime,
            },
            conversations: {
                week: calculateTimedUserConversations('week'),
                month: calculateTimedUserConversations('month'),
                year: calculateTimedUserConversations('year'),
                allTime: userConversationsAllTime,
            },
        },
        chapter: {
            hours: {
                week: calculateTimedChapterHours('week'),
                month: calculateTimedChapterHours('month'),
                year: calculateTimedChapterHours('year'),
                allTime: chapterHoursAllTime,
            },
            conversations: {
                week: calculateTimedChapterConversations('week'),
                month: calculateTimedChapterConversations('month'),
                year: calculateTimedChapterConversations('year'),
                allTime: chapterConversationsAllTime,
            },
        },
    };
};