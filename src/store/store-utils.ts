import { useMemo } from 'react';
import { StoreApi, UseBoundStore } from 'zustand';

/**
 * Utility function to create stable action hooks that don't cause infinite loops.
 * This memoizes the returned object to prevent new object creation on every render.
 */
export function createStableActions<
  T extends Record<string, any>,
  K extends keyof T,
>(useStore: UseBoundStore<StoreApi<T>>, actionKeys: K[]) {
  return () => {
    // Get individual actions
    const actions = actionKeys.map((key) => useStore((s) => s[key]));

    // Memoize the returned object
    return useMemo(() => {
      const result = {} as Pick<T, K>;
      actionKeys.forEach((key, index) => {
        result[key] = actions[index];
      });
      return result;
    }, actions);
  };
}
