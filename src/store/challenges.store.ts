import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { type Challenge } from '@/types';
import { processedChallenges } from './initialData';

export interface ChallengesState {
  challenges: Challenge[];
}

export const useChallengesStore = create<ChallengesState>()(
  persist(
    () => ({ challenges: processedChallenges }),
    { name: 'challenges-store' }
  )
);

export const useChallengesState = () => useChallengesStore((s) => s.challenges);


