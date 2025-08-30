import React from 'react';
import { toast } from 'sonner';

import * as Icons from '@/icons';
import { UsersIcon, XIcon } from '@/icons';
import { useAwardsActions } from '@/store';
import { type BadgeAward } from '@/types';

interface BadgeAwardCardProps {
  award: BadgeAward;
  onRespond: (awardId: string, response: 'Accepted' | 'Rejected') => void;
}

const BadgeAwardCard: React.FC<BadgeAwardCardProps> = ({
  award,
  onRespond,
}) => {
  const IconComponent =
    Icons[award.badge.icon as keyof typeof Icons] || Icons.TrophyIcon;

  return (
    <div className="border-2 border-black bg-white p-4">
      <div className="flex items-start space-x-4">
        <div className="flex size-12 shrink-0 items-center justify-center bg-black text-white">
          <IconComponent className="size-7" />
        </div>
        <div className="grow">
          <p className="text-sm text-neutral-600">
            Awarded by{' '}
            <span className="font-bold text-black">{award.awarder.name}</span>
          </p>
          <p className="text-lg font-bold text-black">{award.badge.name}</p>
          <p className="text-sm text-neutral-600">{award.badge.description}</p>
        </div>
      </div>
      <div className="mt-4 flex items-center space-x-2 border-t border-black pt-3">
        <button
          onClick={() => onRespond(award.id, 'Rejected')}
          className="flex w-full items-center justify-center bg-black px-3 py-2 text-sm font-semibold text-white hover:bg-black"
        >
          <XIcon className="mr-1.5 size-4" /> Decline
        </button>
        <button
          onClick={() => onRespond(award.id, 'Accepted')}
          className="flex w-full items-center justify-center bg-primary px-3 py-2 text-sm font-semibold text-white hover:bg-primary-hover"
        >
          <UsersIcon className="mr-1.5 size-4" /> Accept
        </button>
      </div>
    </div>
  );
};

interface BadgeAwardsDashboardProps {
  pendingAwards: BadgeAward[];
}

const BadgeAwardsDashboard: React.FC<BadgeAwardsDashboardProps> = ({
  pendingAwards,
}) => {
  const { respondToBadgeAward } = useAwardsActions();

  const handleRespond = (
    awardId: string,
    response: 'Accepted' | 'Rejected'
  ) => {
    respondToBadgeAward(awardId, response);
    toast.success(
      `Recognition ${response.toLowerCase()}. It will now appear on your profile.`
    );
  };

  if (pendingAwards.length === 0) {
    return null;
  }

  return (
    <section>
      <h2 className="h-section">Pending Recognitions</h2>
      <div className="space-y-4">
        {pendingAwards.map((award) => (
          <BadgeAwardCard
            key={award.id}
            award={award}
            onRespond={handleRespond}
          />
        ))}
      </div>
    </section>
  );
};

export default BadgeAwardsDashboard;
