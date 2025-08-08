import React from 'react';
import { type BadgeAward } from '@/types';
import * as Icons from '@/icons';
import { toast } from 'sonner';
import { useAppActions } from '@/store/appStore';
import { UsersIcon, XIcon } from '@/icons';

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
    <div className="border border-black bg-white p-4">
      <div className="flex items-start space-x-4">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center bg-black text-white">
          <IconComponent className="h-7 w-7" />
        </div>
        <div className="flex-grow">
          <p className="text-sm text-neutral-500">
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
          className="flex w-full items-center justify-center bg-black px-3 py-2 text-sm font-semibold text-white hover:bg-neutral-800"
        >
          <XIcon className="mr-1.5 h-4 w-4" /> Decline
        </button>
        <button
          onClick={() => onRespond(award.id, 'Accepted')}
          className="flex w-full items-center justify-center bg-primary px-3 py-2 text-sm font-semibold text-white hover:bg-primary-hover"
        >
          <UsersIcon className="mr-1.5 h-4 w-4" /> Accept
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
  const { respondToBadgeAward } = useAppActions();

  const handleRespond = (
    awardId: string,
    response: 'Accepted' | 'Rejected'
  ) => {
    respondToBadgeAward(awardId, response);
    toast.success(
      `Badge ${response.toLowerCase()}. It will now appear on your profile!`
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
