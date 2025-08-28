import React from 'react';
import { type ChapterStats } from '@/utils/analytics';
import {
  UsersIcon,
  BuildingOfficeIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon,
} from '@/icons';

interface ChapterCardProps {
  chapterStats: ChapterStats;
  onSelect: () => void;
}

const Stat: React.FC<{
  icon: React.ReactNode;
  value: string | number;
  label: string;
}> = ({ icon, value, label }) => (
  <div className="flex items-center gap-2">
    <div className="text-neutral-500">{icon}</div>
    <div>
      <p className="font-mono text-lg font-bold">{value}</p>
      <p className="text-xs font-semibold uppercase text-neutral-500">
        {label}
      </p>
    </div>
  </div>
);

const ChapterCard: React.FC<ChapterCardProps> = ({
  chapterStats,
  onSelect,
}) => {
  return (
    <button
      onClick={onSelect}
      className="card-brutal-hover w-full transform cursor-pointer overflow-hidden text-left transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
    >
      <div className="p-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">
          {chapterStats.country}
        </p>
        <h3 className="mt-1 truncate text-2xl font-bold text-black">
          {chapterStats.name}
        </h3>

        <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-6 border-t-2 border-black pt-6">
          <Stat
            icon={<UsersIcon className="h-5 w-5" />}
            value={chapterStats.memberCount}
            label="Members"
          />
          <Stat
            icon={<BuildingOfficeIcon className="h-5 w-5" />}
            value={chapterStats.eventsHeld}
            label="Events"
          />
          <Stat
            icon={<ClockIcon className="h-5 w-5" />}
            value={Math.round(chapterStats.totalHours)}
            label="Hours"
          />
          <Stat
            icon={<ChatBubbleLeftRightIcon className="h-5 w-5" />}
            value={chapterStats.totalConversations}
            label="Convos"
          />
        </div>
      </div>
    </button>
  );
};

export default ChapterCard;
