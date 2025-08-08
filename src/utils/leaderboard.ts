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
        const hourCounts: Record<string, number> = {};

        const relevantEvents = events.filter(
            (e) => new Date(e.startDate) >= startDate && e.report
        );

        for (const event of relevantEvents) {
            if (event.report) {
                for (const [userId, status] of Object.entries(
                    event.report.attendance
                )) {
                    if (status === 'Attended' && userMap.has(userId)) {
                        hourCounts[userId] =
                            (hourCounts[userId] || 0) + event.report.hours;
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
            const chapterMembers = confirmedUsers.filter((u) =>
                u.chapters.includes(chapter.name)
            );
            const totalHours = chapterMembers.reduce(
                (sum, u) => sum + u.stats.totalHours,
                0
            );
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
            const chapterName = eventToCityMap.get(event.id);
            if (chapterName && chapterMap.has(chapterName) && event.report) {
                let totalHoursContributedInEvent = 0;
                for (const [userId, status] of Object.entries(
                    event.report.attendance
                )) {
                    if (status === 'Attended' && userMap.has(userId)) {
                        totalHoursContributedInEvent += event.report.hours;
                    }
                }
                hourCounts[chapterName] =
                    (hourCounts[chapterName] || 0) + totalHoursContributedInEvent;
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