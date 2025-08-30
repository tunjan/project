import { DiscountTierLevel, type User } from '@/types';

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

// FIX: Cache the reversed array to avoid recreating it on every function call
const REVERSED_TIER_CONFIG = [...TIER_CONFIG].reverse();

// CRITICAL FIX: Pre-compute tier progression to avoid repeated filtering/sorting
const TIER_PROGRESSION = new Map<DiscountTierLevel, DiscountTierLevel | null>();
TIER_CONFIG.forEach((tier, index) => {
  const nextTier =
    index < TIER_CONFIG.length - 1 ? TIER_CONFIG[index + 1].level : null;
  TIER_PROGRESSION.set(tier.level, nextTier);
});

export const calculateDiscountTier = (user: User) => {
  const { stats } = user;
  const userStats = {
    cubes: stats.cubesAttended,
    cities: new Set(stats.cities).size,
    hours: stats.totalHours,
  };

  // FIX: Use cached reversed array instead of creating new one each time
  const currentTier = REVERSED_TIER_CONFIG.find((tier) =>
    Object.entries(tier.requirements).every(([key, requiredValue]) => {
      const userValue = userStats[key as RequirementKey];
      return userValue !== undefined && userValue >= requiredValue;
    })
  );

  const level = currentTier?.level || DiscountTierLevel.NONE;

  if (level === DiscountTierLevel.TIER_3) {
    return { level, nextTier: null, progress: null };
  }

  // CRITICAL FIX: Use pre-computed tier progression instead of filtering/sorting
  const nextTierLevel = TIER_PROGRESSION.get(level);
  if (!nextTierLevel) {
    return { level, nextTier: null, progress: null }; // Already at the highest tier
  }

  const nextTierConfig = TIER_CONFIG.find((t) => t.level === nextTierLevel);
  if (!nextTierConfig) {
    return { level, nextTier: null, progress: null };
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
