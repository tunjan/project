import React from 'react';
import { type ChapterStats } from '@/utils/analytics';
import { UsersIcon, BuildingOfficeIcon } from '@/icons';

interface ChapterCardProps {
  chapterStats: ChapterStats;
  onSelect: () => void;
}

const ChapterCard: React.FC<ChapterCardProps> = ({
  chapterStats,
  onSelect,
}) => {
  return (
    <button
      onClick={onSelect}
      className="w-full transform cursor-pointer overflow-hidden border border-black bg-white text-left transition-all duration-300 hover:-translate-y-1"
    >
      <div className="p-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">
          {chapterStats.country}
        </p>
        <h3 className="mt-1 text-2xl font-bold text-black">
          {chapterStats.name}
        </h3>

        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center">
            <UsersIcon className="mr-2 h-5 w-5 text-neutral-400" />
            <div>
              <p className="font-bold">{chapterStats.memberCount}</p>
              <p className="text-neutral-600">Members</p>
            </div>
          </div>
          <div className="flex items-center">
            <BuildingOfficeIcon className="mr-2 h-5 w-5 text-neutral-400" />
            <div>
              <p className="font-bold">{chapterStats.eventsHeld}</p>
              <p className="text-neutral-600">Events Held</p>
            </div>
          </div>
        </div>
      </div>
    </button>
  );
};

export default ChapterCard;
