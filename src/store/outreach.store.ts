import { useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { type OutreachLog } from '@/types';

import { processedOutreachLogs } from './initialData';

export interface OutreachState {
  outreachLogs: OutreachLog[];
}

export interface OutreachActions {
  addOutreachLog: (log: Omit<OutreachLog, 'id'>) => string;
  removeOutreachLog: (logId: string) => void;
  updateOutreachLog: (logId: string, updates: Partial<OutreachLog>) => void;
}

export const useOutreachStore = create<OutreachState & OutreachActions>()(
  persist(
    (set) => ({
      outreachLogs: processedOutreachLogs,
      addOutreachLog: (log) => {
        const newLog = { ...log, id: uuidv4() };
        set((state) => ({
          outreachLogs: [...state.outreachLogs, newLog],
        }));
        return newLog.id;
      },
      removeOutreachLog: (logId) => {
        set((state) => ({
          outreachLogs: state.outreachLogs.filter((log) => log.id !== logId),
        }));
      },
      updateOutreachLog: (logId, updates) => {
        set((state) => ({
          outreachLogs: state.outreachLogs.map((log) =>
            log.id === logId ? { ...log, ...updates } : log
          ),
        }));
      },
    }),
    { name: 'outreach-store' }
  )
);

export const useOutreachLogs = () => useOutreachStore((s) => s.outreachLogs);
export const useOutreachActions = () => {
  const store = useOutreachStore();
  return useMemo(
    () => ({
      addOutreachLog: store.addOutreachLog,
      removeOutreachLog: store.removeOutreachLog,
      updateOutreachLog: store.updateOutreachLog,
    }),
    [store.addOutreachLog, store.removeOutreachLog, store.updateOutreachLog]
  );
};

export const useLogsForEvent = (eventId: string) => {
  const logs = useOutreachStore((s) => s.outreachLogs);
  return useMemo(() => {
    if (!eventId) return [];
    return logs.filter((log) => log.eventId === eventId);
  }, [logs, eventId]);
};

export const useOutreachLogsForUser = (userId?: string) => {
  const logs = useOutreachStore((s) => s.outreachLogs);
  return useMemo(() => {
    if (!userId) return [];
    return logs.filter((log) => log.userId === userId);
  }, [logs, userId]);
};
