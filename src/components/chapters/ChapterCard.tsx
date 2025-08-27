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
      className="w-full transform cursor-pointer overflow-hidden border-2 border-black bg-white text-left transition-all duration-150 hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
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
            <UsersIcon className="mr-2 h-5 w-5 text-red" />
            <div>
              <p className="font-bold">{chapterStats.memberCount}</p>
              <p className="text-red">Members</p>
            </div>
          </div>
          <div className="flex items-center">
            <BuildingOfficeIcon className="mr-2 h-5 w-5 text-red" />
            <div>
              <p className="font-bold">{chapterStats.eventsHeld}</p>
              <p className="text-red">Events Held</p>
            </div>
          </div>
        </div>
      </div>
    </button>
  );
};

export default ChapterCard;
