import React from 'react';
import { type UserStats } from '../../types';
import { ClockIcon, UsersIcon, TrendingUpIcon, GlobeAltIcon } from '../icons';

interface StatsGridProps {
  stats: UserStats;
}

const StatCard: React.FC<{ icon: React.ReactNode; title: string; value: string | number }> = ({ icon, title, value }) => (
  <div className="bg-white border border-black p-4">
    <div className="flex items-center">
      <div className="text-[#d81313]">{icon}</div>
      <p className="ml-3 text-sm font-semibold uppercase tracking-wider text-neutral-600">{title}</p>
    </div>
    <p className="mt-2 text-4xl font-extrabold text-black">{value}</p>
  </div>
);

const StatsGrid: React.FC<StatsGridProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatCard 
        icon={<ClockIcon className="w-6 h-6" />} 
        title="Hours" 
        value={stats.totalHours} 
      />
      <StatCard 
        icon={<UsersIcon className="w-6 h-6" />} 
        title="Cubes" 
        value={stats.cubesAttended} 
      />
      <StatCard 
        icon={<TrendingUpIcon className="w-6 h-6" />} 
        title="Conversions" 
        value={stats.veganConversions} 
      />
      <StatCard 
        icon={<GlobeAltIcon className="w-6 h-6" />} 
        title="Cities" 
        value={stats.cities.length} 
      />
    </div>
  );
};

export default StatsGrid;
