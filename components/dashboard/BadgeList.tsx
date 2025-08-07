import React from 'react';
import { type Badge } from '../../types';

interface BadgeListProps {
  badges: Badge[];
}

const BadgeList: React.FC<BadgeListProps> = ({ badges }) => {
  if (badges.length === 0) {
    return (
      <div className="border border-black p-6 text-center bg-white">
        <p className="text-neutral-500">No recognitions earned yet. Keep up the great work!</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-black">
      <ul className="divide-y divide-black">
        {badges.map((badge) => (
          <li key={badge.id} className="p-4 flex items-center space-x-4">
            <div className="flex-shrink-0 bg-black p-3">
              <badge.icon className="w-6 h-6 text-[#d81313]" />
            </div>
            <div>
              <h4 className="text-base font-bold text-black">{badge.name}</h4>
              <p className="text-sm text-neutral-600">{badge.description}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default BadgeList;
