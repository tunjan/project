import React from 'react';

import { Stat } from '@/components/ui';
import {
  BuildingOfficeIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon,
  UsersIcon,
} from '@/icons';
import { type ChapterStats } from '@/utils';

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
      className="card-brutal-hover hover-raise w-full cursor-pointer overflow-hidden text-left focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
    >
      <div className="p-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">
          {chapterStats.country}
        </p>
        <h3 className="mt-1 truncate text-2xl font-bold text-black">
          {chapterStats.name}
        </h3>

        <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-6 border-t-2 border-black pt-6 dark:border-white">
          <Stat
            icon={<UsersIcon className="size-5" />}
            value={chapterStats.memberCount}
            label="Members"
            variant="detailed"
          />
          <Stat
            icon={<BuildingOfficeIcon className="size-5" />}
            value={chapterStats.eventsHeld}
            label="Events"
            variant="detailed"
          />
          <Stat
            icon={<ClockIcon className="size-5" />}
            value={Math.round(chapterStats.totalHours)}
            label="Hours"
            variant="detailed"
          />
          <Stat
            icon={<ChatBubbleLeftRightIcon className="size-5" />}
            value={chapterStats.totalConversations}
            label="Convos"
            variant="detailed"
          />
        </div>
      </div>
    </button>
  );
};

export default ChapterCard;
