import { ChapterStats } from './analytics';

export interface ScorecardData extends ChapterStats {
    healthScore: number;
    metrics: {
        eventFrequency: number;
        avgTurnout: number;
        membershipTargetProgress: number; // Renamed from retention to be more accurate
    };
}

// These weights should be configurable in a real application
const WEIGHTS = {
    EVENT_FREQUENCY: 0.5,
    MEMBER_COUNT: 0.2,
    RETENTION_RATE: 0.3,
};

// These are target values for normalization.
const TARGETS = {
    EVENTS_PER_MONTH: 4, // Target 1 event per week
    MEMBER_COUNT: 50,
    RETENTION_RATE: 0.75, // Target 75% retention
};

export const calculateChapterScorecard = (
    chapterStats: ChapterStats[]
    // In a real app, you'd pass more complex data like retention rates per chapter
): ScorecardData[] => {
    return chapterStats.map((stat) => {
        // Normalize each metric to a 0-1 scale
        const eventScore = Math.min(stat.eventsHeld / (TARGETS.EVENTS_PER_MONTH * 3), 1); // Assuming 3 months
        const memberScore = Math.min(stat.memberCount / TARGETS.MEMBER_COUNT, 1);

        // FIX: This is not a true retention rate - it's just a placeholder
        // TODO: Implement proper cohort-based retention calculation
        // For now, using a placeholder calculation based on member count vs target
        // In a real implementation, this would track users who joined in specific periods
        // and measure how many are still active in later periods
        const retentionScore = Math.min(stat.memberCount / TARGETS.MEMBER_COUNT, 1);

        const weightedScore =
            eventScore * WEIGHTS.EVENT_FREQUENCY +
            memberScore * WEIGHTS.MEMBER_COUNT +
            retentionScore * WEIGHTS.RETENTION_RATE;

        const healthScore = Math.round(weightedScore * 100);

        return {
            ...stat,
            healthScore,
            metrics: {
                eventFrequency: stat.eventsHeld,
                // TODO: This is a placeholder calculation for average turnout.
                // A real implementation would require:
                // 1. Actual attendance data per event from event reports
                // 2. Iterating through the chapter's events and summing attendance
                // 3. Calculating the average across all events
                avgTurnout:
                    stat.eventsHeld > 0 ? stat.memberCount * 0.5 : 0, // Placeholder - needs real data
                membershipTargetProgress: retentionScore * 100,
            },
        };
    });
};