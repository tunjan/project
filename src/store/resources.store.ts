import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { type Resource } from '@/types';

import { initialResources } from './initialData';

export interface ResourcesState {
  resources: Resource[];
}

export interface ResourcesActions {
  // Placeholder: extend with CRUD if needed
}

export const useResourcesStore = create<ResourcesState & ResourcesActions>()(
  persist(
    () => ({
      resources: initialResources,
    }),
    { name: 'resources-store' }
  )
);

export const useResourcesState = () => useResourcesStore((s) => s.resources);
