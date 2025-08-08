import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { type BadgeAward, type BadgeTemplate, type User } from '@/types';
import { processedBadgeAwards } from './initialData';

export interface AwardsState {
  badgeAwards: BadgeAward[];
}

export interface AwardsActions {
  awardBadge: (awarder: User, recipient: User, badgeTemplate: BadgeTemplate) => void;
  respondToBadgeAward: (awardId: string, response: 'Accepted' | 'Rejected') => void;
}

export const useAwardsStore = create<AwardsState & AwardsActions>()(
  persist(
    (set) => ({
      badgeAwards: processedBadgeAwards,
      awardBadge: (awarder, recipient, badgeTemplate) => {
        const newAward: BadgeAward = {
          id: `badge_award_${Date.now()}`,
          awarder,
          recipient,
          badge: badgeTemplate,
          status: 'Pending',
          createdAt: new Date(),
        };
        set((state) => ({ badgeAwards: [...state.badgeAwards, newAward] }));
      },
      respondToBadgeAward: (awardId, response) => {
        set((state) => ({
          badgeAwards: state.badgeAwards.map((a) => (a.id === awardId ? { ...a, status: response } : a)),
        }));
      },
    }),
    { name: 'awards-store' }
  )
);

export const useAwardsState = () => useAwardsStore((s) => s.badgeAwards);
export const useAwardsActions = () =>
  useAwardsStore((s) => ({ awardBadge: s.awardBadge, respondToBadgeAward: s.respondToBadgeAward }));


