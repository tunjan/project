import { staticChallenges } from '@/data/staticData';
import { type Challenge } from '@/types';

/**
 * Hook to get static challenges data
 * This replaces the challenges store since the data is static
 */
export const useChallenges = (): Challenge[] => {
  return staticChallenges;
};
