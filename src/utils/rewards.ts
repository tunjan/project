import { type User, DiscountTierLevel } from '@/types';

const TIER_CONFIG = [
  {
    level: DiscountTierLevel.TIER_3,
    requirements: { cubes: 50, cities: 10, hours: 100 }
  },
  {
    level: DiscountTierLevel.TIER_2,
    requirements: { cubes: 25, cities: 5 }
  },
  {
    level: DiscountTierLevel.TIER_1,
    requirements: { cubes: 10, cities: 2 }
  },
];

export const calculateDiscountTier = (user: User) => {
  const { stats } = user;
  const cubes = stats.cubesAttended;
  const cities = new Set(stats.cities).size;
  const hours = stats.totalHours;

  const currentTier = TIER_CONFIG.find(tier =>
    Object.entries(tier.requirements).every(([key, requiredValue]) => {
      const userValue = { cubes, cities, hours }[key as keyof typeof tier.requirements];
      return userValue !== undefined && userValue >= requiredValue;
    })
  );

  const level = currentTier?.level || DiscountTierLevel.NONE;

  if (level === DiscountTierLevel.TIER_3) {
    return { level, nextTier: null, progress: null };
  }

  const currentTierIndex = TIER_CONFIG.findIndex(t => t.level === level);
  const nextTierConfig = TIER_CONFIG[currentTierIndex === -1 ? TIER_CONFIG.length - 1 : currentTierIndex - 1];

  const progress = Object.entries(nextTierConfig.requirements).reduce((acc, [key, requiredValue]) => {
    const userValue = { cubes, cities, hours }[key as keyof typeof nextTierConfig.requirements];
    acc[key as keyof typeof nextTierConfig.requirements] = { current: Math.round(userValue || 0), required: requiredValue };
    return acc;
  }, {} as any);


  return { level, nextTier: nextTierConfig.level, progress };
};