import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { type OutreachLog } from '@/types';
import { processedOutreachLogs } from './initialData';
import { v4 as uuidv4 } from 'uuid';

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
export const useOutreachActions = () =>
  useOutreachStore((s) => ({
    addOutreachLog: s.addOutreachLog,
    removeOutreachLog: s.removeOutreachLog,
    updateOutreachLog: s.updateOutreachLog,
  }));

// Selectors
export const useLogsForEvent = (eventId: string) =>
  useOutreachStore((s) =>
    s.outreachLogs.filter((log) => log.eventId === eventId)
  );

export const useOutreachLogsForUser = (userId?: string) =>
  useOutreachStore((s) =>
    userId ? s.outreachLogs.filter((log) => log.userId === userId) : []
  );
