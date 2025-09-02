import { staticResources } from '@/data/staticData';
import { type Resource } from '@/types';

/**
 * Hook to get static resources data
 * This replaces the resources store since the data is static
 */
export const useResources = (): Resource[] => {
  return staticResources;
};
