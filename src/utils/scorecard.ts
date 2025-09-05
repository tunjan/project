import { TARGETS, WEIGHTS } from '@/config';

import { ChapterStats } from './analytics';

export interface ScorecardData extends ChapterStats {
  healthScore: number;
  metrics: {
    eventFrequency: number;
    avgTurnout: number;
    membershipTargetProgress: number;
  };
}

export const calculateChapterScorecard = (
  chapterStats: ChapterStats[]
): ScorecardData[] => {
  return chapterStats.map((stat) => {
    const eventScore = Math.min(
      stat.eventsHeld / (TARGETS.EVENTS_PER_MONTH * 3),
      1
    );
    const memberScore = Math.min(stat.memberCount / TARGETS.MEMBER_COUNT, 1);

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
        avgTurnout: 0,
        membershipTargetProgress: memberHealthScore * 100,
      },
    };
  });
};
