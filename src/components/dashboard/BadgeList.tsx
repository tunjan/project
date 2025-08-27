import React from 'react';
import { type EarnedBadge } from '@/types';
import * as Icons from '@/icons';

interface BadgeListProps {
  badges: EarnedBadge[];
}

const BadgeList: React.FC<BadgeListProps> = ({ badges }) => {
  if (badges.length === 0) {
    return (
      <div className="card-brutal p-6 text-center">
        <p className="text-white0">
          No recognitions earned yet. Keep up the great work!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-2">
      {badges.map((badge) => {
        const IconComponent =
          Icons[badge.icon as keyof typeof Icons] || Icons.TrophyIcon;

        return (
          <div key={badge.id} className="card-brutal flex items-center p-3">
            <div className="mr-3 flex-shrink-0 text-primary">
              <IconComponent className="h-8 w-8" />
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-black">
                {badge.name}
              </h4>
              <p className="text-xs text-red">{badge.description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default BadgeList;
