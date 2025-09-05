import { useMemo } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import {
  type BadgeAward,
  type BadgeTemplate,
  type EarnedBadge,
  NotificationType,
  type User,
} from '@/types';

import { processedBadgeAwards } from './initialData';
import { useNotificationsStore } from './notifications.store';

export interface AwardsState {
  badgeAwards: BadgeAward[];
}

export interface AwardsActions {
  awardBadge: (
    awarder: User,
    recipient: User,
    badgeTemplate: BadgeTemplate
  ) => void;
  respondToBadgeAward: (
    awardId: string,
    response: 'Accepted' | 'Rejected'
  ) => void;
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

        useNotificationsStore.getState().addNotification({
          userId: recipient.id,
          type: NotificationType.BADGE_AWARDED,
          message: `${awarder.name} has recognized your contribution with the "${badgeTemplate.name}" badge.`,
          linkTo: '/dashboard',
          relatedUser: awarder,
        });
      },
      respondToBadgeAward: (awardId, response) => {
        let award: BadgeAward | undefined;

        set((state) => {
          award = state.badgeAwards.find((a) => a.id === awardId);
          if (!award) return state;

          const updatedAwards = state.badgeAwards.map((a) =>
            a.id === awardId ? { ...a, status: response } : a
          );

          if (response === 'Accepted') {
            import('./users.store').then(({ useUsersStore }) => {
              const usersStore = useUsersStore.getState();
              const user = usersStore.users.find(
                (u) => u.id === award!.recipient.id
              );
              if (user) {
                const newBadge: EarnedBadge = {
                  id: `badge_${Date.now()}`,
                  ...award!.badge,
                  awardedAt: new Date(),
                };
                usersStore.updateProfile(user.id, {
                  badges: [...user.badges, newBadge],
                });
              }
            });
          }

          return { badgeAwards: updatedAwards };
        });

        if (award) {
          useNotificationsStore.getState().addNotification({
            userId: award.awarder.id,
            type:
              response === 'Accepted'
                ? NotificationType.BADGE_AWARD_ACCEPTED
                : NotificationType.BADGE_AWARD_REJECTED,
            message: `${award.recipient.name} has ${response.toLowerCase()} the "${award.badge.name}" recognition.`,
            linkTo: `/members/${award.recipient.id}`,
            relatedUser: award.recipient,
          });
        }
      },
    }),
    { name: 'awards-store' }
  )
);

export const useAwardsState = () => useAwardsStore((s) => s.badgeAwards);
export const useAwardsActions = () => {
  const store = useAwardsStore();
  return useMemo(
    () => ({
      awardBadge: store.awardBadge,
      respondToBadgeAward: store.respondToBadgeAward,
    }),
    [store.awardBadge, store.respondToBadgeAward]
  );
};

export const useBadgeAwardsForUser = (userId?: string) =>
  useAwardsStore((s) => {
    if (!userId) return [];
    return s.badgeAwards;
  });
