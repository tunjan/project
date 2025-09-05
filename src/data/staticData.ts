import { type Challenge, type Resource } from '@/types';

import { initialResources, processedChallenges } from '../store/initialData';

export const staticResources: Resource[] = initialResources;
export const staticChallenges: Challenge[] = processedChallenges;
