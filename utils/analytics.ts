import { type User, type CubeEvent, type Chapter, type OutreachLog, OutreachOutcome } from '../types';

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
    month: string; // e.g., "Jan 2023"
    count: number;
}

export const getGlobalStats = (users: User[], events: CubeEvent[], chapters: Chapter[], outreachLogs: OutreachLog[]): GlobalStats => {
    const confirmedUsers = users.filter(u => u.onboardingStatus === 'Confirmed');
    const totalHours = confirmedUsers.reduce((sum, user) => sum + user.stats.totalHours, 0);

    const veganOutcomes = [OutreachOutcome.BECAME_VEGAN, OutreachOutcome.BECAME_VEGAN_ACTIVIST];
    const eventIdsInScope = new Set(events.map(e => e.id));
    const totalConversions = outreachLogs.filter(log => 
        veganOutcomes.includes(log.outcome) && eventIdsInScope.has(log.eventId)
    ).length;

    return {
        totalMembers: confirmedUsers.length,
        totalHours: Math.round(totalHours),
        totalConversions,
        totalEvents: events.length,
        chapterCount: chapters.length,
    };
};

export const getChapterStats = (users: User[], events: CubeEvent[], chapters: Chapter[], outreachLogs: OutreachLog[]): ChapterStats[] => {
    const veganOutcomes = [OutreachOutcome.BECAME_VEGAN, OutreachOutcome.BECAME_VEGAN_ACTIVIST];

    return chapters.map(chapter => {
        const chapterUsers = users.filter(u => u.chapters.includes(chapter.name) && u.onboardingStatus === 'Confirmed');
        const chapterEvents = events.filter(e => e.city === chapter.name);

        const totalHours = chapterUsers.reduce((sum, user) => sum + user.stats.totalHours, 0);
        
        const chapterEventIds = new Set(chapterEvents.map(e => e.id));
        const totalConversions = outreachLogs.filter(log =>
            veganOutcomes.includes(log.outcome) && chapterEventIds.has(log.eventId)
        ).length;

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
        const key = event.dateTime.toLocaleString('default', { month: 'short', year: 'numeric' });
        if (trends.hasOwnProperty(key)) {
            trends[key]++;
        }
    });

    return Object.entries(trends)
                .map(([month, count]) => ({ month, count }))
        .reverse();
};

// New advanced analytics functions to be added here

/**
 * Calculates the conversion rate (number of "Became Vegan" outcomes per hour of outreach).
 * This can be a key performance indicator for outreach effectiveness.
 */
export const getConversionRate = (outreachLogs: OutreachLog[], totalHours: number): number => {
    if (totalHours === 0) return 0;
    const veganOutcomes = [OutreachOutcome.BECAME_VEGAN, OutreachOutcome.BECAME_VEGAN_ACTIVIST];
    const conversions = outreachLogs.filter(log => veganOutcomes.includes(log.outcome)).length;
    return conversions / totalHours;
};

/**
 * Tracks the retention of activists by comparing new members vs. members who have been active recently.
 * A member is considered "retained" if they have participated in an event in the last `retentionMonths` months.
 */
export const getActivistRetention = (users: User[], events: CubeEvent[], retentionMonths: number = 3): { retained: number; total: number; rate: number } => {
    const now = new Date();
    const retentionCutoff = new Date();
    retentionCutoff.setMonth(now.getMonth() - retentionMonths);

    const confirmedUsers = users.filter(u => u.onboardingStatus === 'Confirmed');
    if (confirmedUsers.length === 0) return { retained: 0, total: 0, rate: 0 };

    const recentEventParticipantIds = new Set<string>();
    events.forEach(event => {
        if (event.dateTime >= retentionCutoff && event.attendees) {
            event.attendees.forEach(attendee => recentEventParticipantIds.add(attendee.userId));
        }
    });

    const retainedCount = confirmedUsers.filter(u => recentEventParticipantIds.has(u.id)).length;
    
    return {
        retained: retainedCount,
        total: confirmedUsers.length,
        rate: confirmedUsers.length > 0 ? retainedCount / confirmedUsers.length : 0,
    };
};

/**
 * Analyzes the growth of new members over a specified period.
 */
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
            const key = user.joinDate.toLocaleString('default', { month: 'short', year: 'numeric' });
            if (trends.hasOwnProperty(key)) {
                trends[key]++;
            }
        }
    });

    return Object.entries(trends)
        .map(([month, count]) => ({ month, count }))
        .reverse();
};

/**
 * Identifies the most active activists based on hours contributed.
 */
export const getTopActivistsByHours = (users: User[], count: number = 5): { name: string; value: number }[] => {
    return [...users]
        .filter(u => u.onboardingStatus === 'Confirmed')
        .sort((a, b) => b.stats.totalHours - a.stats.totalHours)
        .slice(0, count)
        .map(u => ({ name: u.username, value: Math.round(u.stats.totalHours) }));
};

/**
 * Calculates the average number of activists per event.
 */
export const getAverageActivistsPerEvent = (events: CubeEvent[]): number => {
    if (events.length === 0) return 0;
    const totalAttendees = events.reduce((sum, event) => sum + (event.attendees ? event.attendees.length : 0), 0);
    return totalAttendees / events.length;
};
