import React from 'react';
import { type UserStats } from '@/types';
import {
  ClockIcon,
  CubeIcon,
  TrendingUpIcon,
  GlobeAltIcon,
  ChatBubbleLeftRightIcon,
} from '@/icons';

interface StatsGridProps {
  stats: UserStats;
  showPrivateStats?: boolean;
  onCityClick?: () => void;
}

const StatCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  value: string | number;
  onClick?: () => void;
}> = ({ icon, title, value, onClick }) => (
  <div
    className={`card-brutal group p-4 transition-colors duration-150 ${
      onClick
        ? 'cursor-pointer hover:bg-black hover:text-white'
        : 'cursor-default'
    }`}
    onClick={onClick}
  >
    <div className="flex items-center">
      <div className="text-primary">{icon}</div>
      <p className="ml-3 truncate text-sm font-semibold uppercase tracking-wider text-neutral-600">
        {title}
      </p>
    </div>
    <p className="mt-2 text-5xl font-extrabold">{value}</p>
  </div>
);

const StatsGrid: React.FC<StatsGridProps> = ({
  stats,
  showPrivateStats = false,
  onCityClick,
}) => {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <StatCard
        icon={<ClockIcon className="h-6 w-6" />}
        title="Hours"
        value={Math.round(stats.totalHours)}
      />
      <StatCard
        icon={<CubeIcon className="h-6 w-6" />}
        title="Cubes"
        value={stats.cubesAttended}
      />
      <StatCard
        icon={<ChatBubbleLeftRightIcon className="h-6 w-6" />}
        title="Conversations"
        value={stats.totalConversations}
      />
      <StatCard
        icon={<GlobeAltIcon className="h-6 w-6" />}
        title="Cities"
        value={stats.cities.length}
        onClick={onCityClick}
      />
      {showPrivateStats && (
        <StatCard
          icon={<TrendingUpIcon className="h-6 w-6" />}
          title="Conversions"
          value={stats.veganConversions}
        />
      )}
    </div>
  );
};

export default StatsGrid;
