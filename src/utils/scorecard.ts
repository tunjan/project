import { ChapterStats } from './analytics';

export interface ScorecardData extends ChapterStats {
    healthScore: number;
    metrics: {
        eventFrequency: number;
        avgTurnout: number;
        retention: number; // For simplicity, this will be mocked/passed in
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
        // This is a simplified, placeholder calculation for retention
        const retentionScore = Math.min(
            stat.memberCount > 0 ? (stat.memberCount * 0.5) / TARGETS.RETENTION_RATE : 0,
            1
        );

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
                // This is a simplified, placeholder calculation for average turnout
                avgTurnout:
                    stat.eventsHeld > 0 ? stat.totalHours / 3 / stat.eventsHeld : 0,
                retention: retentionScore * 100,
            },
        };
    });
};