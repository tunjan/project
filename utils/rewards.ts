import { type User, DiscountTierLevel } from '../types';

const TIER_REQUIREMENTS = {
  [DiscountTierLevel.TIER_1]: { cubes: 10, cities: 2 },
  [DiscountTierLevel.TIER_2]: { cubes: 25, cities: 5 },
  [DiscountTierLevel.TIER_3]: { cubes: 50, cities: 10, hours: 100 },
};

export const calculateDiscountTier = (user: User) => {
  const { stats } = user;
  const cubes = stats.cubesAttended;
  const cities = stats.cities.length;
  const hours = stats.totalHours;

  let level = DiscountTierLevel.NONE;
  if (cubes >= TIER_REQUIREMENTS[DiscountTierLevel.TIER_3].cubes && cities >= TIER_REQUIREMENTS[DiscountTierLevel.TIER_3].cities && hours >= TIER_REQUIREMENTS[DiscountTierLevel.TIER_3].hours) {
    level = DiscountTierLevel.TIER_3;
  } else if (cubes >= TIER_REQUIREMENTS[DiscountTierLevel.TIER_2].cubes && cities >= TIER_REQUIREMENTS[DiscountTierLevel.TIER_2].cities) {
    level = DiscountTierLevel.TIER_2;
  } else if (cubes >= TIER_REQUIREMENTS[DiscountTierLevel.TIER_1].cubes && cities >= TIER_REQUIREMENTS[DiscountTierLevel.TIER_1].cities) {
    level = DiscountTierLevel.TIER_1;
  }

  let nextTier;
  let progress = null;

  if (level === DiscountTierLevel.NONE) {
    nextTier = DiscountTierLevel.TIER_1;
    progress = {
      cubes: { current: cubes, required: TIER_REQUIREMENTS[nextTier].cubes },
      cities: { current: cities, required: TIER_REQUIREMENTS[nextTier].cities },
    };
  } else if (level === DiscountTierLevel.TIER_1) {
    nextTier = DiscountTierLevel.TIER_2;
    progress = {
      cubes: { current: cubes, required: TIER_REQUIREMENTS[nextTier].cubes },
      cities: { current: cities, required: TIER_REQUIREMENTS[nextTier].cities },
    };
  } else if (level === DiscountTierLevel.TIER_2) {
    nextTier = DiscountTierLevel.TIER_3;
    progress = {
      cubes: { current: cubes, required: TIER_REQUIREMENTS[nextTier].cubes },
      cities: { current: cities, required: TIER_REQUIREMENTS[nextTier].cities },
      hours: { current: hours, required: TIER_REQUIREMENTS[nextTier].hours },
    };
  }

  return { level, nextTier, progress };
};
