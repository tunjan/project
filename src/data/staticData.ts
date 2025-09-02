import { type Challenge, type Resource } from '@/types';

import { initialResources, processedChallenges } from '../store/initialData';

// Static data that doesn't change during runtime
export const staticResources: Resource[] = initialResources;
export const staticChallenges: Challenge[] = processedChallenges;
