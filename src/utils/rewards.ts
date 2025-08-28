import { type User, DiscountTierLevel } from '@/types';

type RequirementKey = 'cubes' | 'cities' | 'hours';

interface TierConfig {
  level: DiscountTierLevel;
  rank: number;
  requirements: Partial<Record<RequirementKey, number>>;
}

interface ProgressDetail {
  current: number;
  required: number;
}

export type TierProgress = Partial<Record<RequirementKey, ProgressDetail>>;

const TIER_CONFIG: TierConfig[] = [
  {
    level: DiscountTierLevel.TIER_1,
    rank: 1,
    requirements: { cubes: 10, cities: 2 },
  },
  {
    level: DiscountTierLevel.TIER_2,
    rank: 2,
    requirements: { cubes: 25, cities: 5 },
  },
  {
    level: DiscountTierLevel.TIER_3,
    rank: 3,
    requirements: { cubes: 50, cities: 10, hours: 100 },
  },
];

export const calculateDiscountTier = (user: User) => {
  const { stats } = user;
  const userStats = {
    cubes: stats.cubesAttended,
    cities: new Set(stats.cities).size,
    hours: stats.totalHours,
  };

  const currentTier = TIER_CONFIG.find((tier) =>
    Object.entries(tier.requirements).every(([key, requiredValue]) => {
      const userValue = userStats[key as RequirementKey];
      return userValue !== undefined && userValue >= requiredValue;
    })
  );

  const level = currentTier?.level || DiscountTierLevel.NONE;

  if (level === DiscountTierLevel.TIER_3) {
    return { level, nextTier: null, progress: null };
  }

  // Find the next tier using explicit rank system
  const currentTierRank = TIER_CONFIG.find(t => t.level === level)?.rank || 0;
  const nextTierConfig = TIER_CONFIG
    .filter(t => t.rank > currentTierRank)
    .sort((a, b) => a.rank - b.rank)[0];

  if (!nextTierConfig) {
    return { level, nextTier: null, progress: null }; // Already at the highest tier
  }

  const progress = Object.entries(nextTierConfig.requirements).reduce(
    (acc, [key, requiredValue]) => {
      const userValue = userStats[key as RequirementKey];
      acc[key as RequirementKey] = {
        current: Math.round(userValue || 0),
        required: requiredValue,
      };
      return acc;
    },
    {} as TierProgress
  );

  return { level, nextTier: nextTierConfig.level, progress };
};