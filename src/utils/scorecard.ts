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
): ScorecardData[] => {
  return chapterStats.map((stat) => {
    // Normalize each metric to a 0-1 scale
    const eventScore = Math.min(
      stat.eventsHeld / (TARGETS.EVENTS_PER_MONTH * 3),
      1
    ); // Assuming 3 months
    const memberScore = Math.min(stat.memberCount / TARGETS.MEMBER_COUNT, 1);

    // Use member count as a proxy for chapter health since we don't have retention data
    const memberHealthScore = Math.min(
      stat.memberCount / TARGETS.MEMBER_COUNT,
      1
    );

    const weightedScore =
      eventScore * WEIGHTS.EVENT_FREQUENCY +
      memberScore * WEIGHTS.MEMBER_COUNT +
      memberHealthScore * WEIGHTS.RETENTION_RATE;

    const healthScore = Math.round(weightedScore * 100);

    return {
      ...stat,
      healthScore,
      metrics: {
        eventFrequency: stat.eventsHeld,
        avgTurnout: 0, // TODO: Implement when event attendance data is available
        membershipTargetProgress: memberHealthScore * 100,
      },
    };
  });
};
