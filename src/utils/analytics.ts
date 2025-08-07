import { type User, type CubeEvent, type Chapter } from '@/types';

export interface ChapterStats {
    name: string;
    country: string;
    memberCount: number;
    totalHours: number;
    totalConversions: number;
    eventsHeld: number;
}

export interface GlobalStats {
    totalMembers: number;
    totalHours: number;
    totalConversions: number;
    totalEvents: number;
    chapterCount: number;
}

export interface MonthlyTrend {
    month: string;
    count: number;
}

const getConfirmedUsers = (users: User[]): User[] => users.filter(u => u.onboardingStatus === 'Confirmed');

export const getGlobalStats = (users: User[], events: CubeEvent[], chapters: Chapter[]): GlobalStats => {
    const confirmedUsers = getConfirmedUsers(users);
    const totalHours = confirmedUsers.reduce((sum, user) => sum + user.stats.totalHours, 0);
    const totalConversions = confirmedUsers.reduce((sum, user) => sum + user.stats.veganConversions, 0);

    return {
        totalMembers: confirmedUsers.length,
        totalHours: Math.round(totalHours),
        totalConversions,
        totalEvents: events.length,
        chapterCount: chapters.length,
    };
};

export const getChapterStats = (users: User[], events: CubeEvent[], chapters: Chapter[]): ChapterStats[] => {
    return chapters.map(chapter => {
        const chapterUsers = getConfirmedUsers(users).filter(u => u.chapters.includes(chapter.name));
        const chapterEvents = events.filter(e => e.city === chapter.name);

        const totalHours = chapterUsers.reduce((sum, user) => sum + user.stats.totalHours, 0);
        const totalConversions = chapterUsers.reduce((sum, user) => sum + user.stats.veganConversions, 0);

        return {
            name: chapter.name,
            country: chapter.country,
            memberCount: chapterUsers.length,
            totalHours: Math.round(totalHours),
            totalConversions,
            eventsHeld: chapterEvents.length,
        };
    });
};

export const getEventTrendsByMonth = (events: CubeEvent[], months: number = 12): MonthlyTrend[] => {
    const trends: Record<string, number> = {};
    const now = new Date();

    for (let i = 0; i < months; i++) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = d.toLocaleString('default', { month: 'short', year: 'numeric' });
        trends[key] = 0;
    }

    events.forEach(event => {
        const eventDate = new Date(event.dateTime);
        const key = eventDate.toLocaleString('default', { month: 'short', year: 'numeric' });
        if (trends.hasOwnProperty(key)) {
            trends[key]++;
        }
    });

    return Object.entries(trends)
        .map(([month, count]) => ({ month, count }))
        .reverse();
};

export const getConversionRate = (totalConversions: number, totalHours: number): number => {
    if (totalHours === 0) return 0;
    return totalConversions / totalHours;
};

export const getActivistRetention = (users: User[], events: CubeEvent[], retentionMonths: number = 3): { retained: number; total: number; rate: number } => {
    const now = new Date();
    const retentionCutoff = new Date();
    retentionCutoff.setMonth(now.getMonth() - retentionMonths);

    const confirmedUsers = getConfirmedUsers(users);
    if (confirmedUsers.length === 0) return { retained: 0, total: 0, rate: 0 };

    const recentEventParticipantIds = new Set<string>();
    events.forEach(event => {
        if (new Date(event.dateTime) >= retentionCutoff && event.participants) {
            event.participants.forEach(attendee => recentEventParticipantIds.add(attendee.user.id));
        }
    });

    const retainedCount = confirmedUsers.filter(u => recentEventParticipantIds.has(u.id)).length;

    return {
        retained: retainedCount,
        total: confirmedUsers.length,
        rate: confirmedUsers.length > 0 ? retainedCount / confirmedUsers.length : 0,
    };
};

export const getMemberGrowth = (users: User[], months: number = 12): MonthlyTrend[] => {
    const trends: Record<string, number> = {};
    const now = new Date();

    for (let i = 0; i < months; i++) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = d.toLocaleString('default', { month: 'short', year: 'numeric' });
        trends[key] = 0;
    }

    users.forEach(user => {
        if (user.joinDate) {
            const joinDate = new Date(user.joinDate);
            const key = joinDate.toLocaleString('default', { month: 'short', year: 'numeric' });
            if (trends.hasOwnProperty(key)) {
                trends[key]++;
            }
        }
    });

    return Object.entries(trends)
        .map(([month, count]) => ({ month, count }))
        .reverse();
};

export const getTopActivistsByHours = (users: User[], count: number = 5): { name: string; value: number }[] => {
    return [...getConfirmedUsers(users)]
        .sort((a, b) => b.stats.totalHours - a.stats.totalHours)
        .slice(0, count)
        .map(u => ({ name: u.name, value: Math.round(u.stats.totalHours) }));
};

export const getAverageActivistsPerEvent = (events: CubeEvent[]): number => {
    if (events.length === 0) return 0;
    const totalAttendees = events.reduce((sum, event) => sum + (event.participants ? event.participants.length : 0), 0);
    return totalAttendees / events.length;
};