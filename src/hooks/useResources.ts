import { staticResources } from '@/data/staticData';
import { type Resource } from '@/types';

export const useResources = (): Resource[] => {
  return staticResources;
};
