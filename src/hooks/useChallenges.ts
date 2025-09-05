import { staticChallenges } from '@/data/staticData';
import { type Challenge } from '@/types';

export const useChallenges = (): Challenge[] => {
  return staticChallenges;
};
