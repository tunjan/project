import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { type OutreachLog, OutreachOutcome, type User } from '@/types';
import { processedOutreachLogs } from './initialData';

export interface OutreachState {
  outreachLogs: OutreachLog[];
}

export interface OutreachActions {
  logOutreach: (data: { eventId: string; outcome: OutreachOutcome; notes?: string }, currentUser: User) => void;
}

export const useOutreachStore = create<OutreachState & OutreachActions>()(
  persist(
    (set) => ({
      outreachLogs: processedOutreachLogs,
      logOutreach: (data, currentUser) => {
        const newLog: OutreachLog = {
          id: `log_${Date.now()}`,
          userId: currentUser.id,
          createdAt: new Date(),
          ...data,
        };
        set((state) => ({ outreachLogs: [...state.outreachLogs, newLog] }));
      },
    }),
    { name: 'outreach-store' }
  )
);

export const useOutreachState = () => useOutreachStore((s) => s.outreachLogs);
export const useOutreachActions = () => useOutreachStore((s) => ({ logOutreach: s.logOutreach }));


