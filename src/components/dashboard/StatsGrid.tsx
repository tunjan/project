import { Box, Clock, Globe, MessageCircle, TrendingUp } from 'lucide-react';
import React from 'react';

import { Card, CardContent } from '@/components/ui/card';
import { type UserStats } from '@/types';

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
  <Card
    className={`group transition-all duration-300 ${
      onClick ? 'cursor-pointer hover:shadow-md' : 'cursor-default'
    }`}
    onClick={onClick}
    onKeyDown={
      onClick
        ? (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onClick();
            }
          }
        : undefined
    }
    role={onClick ? 'button' : undefined}
    tabIndex={onClick ? 0 : undefined}
  >
    <CardContent className="p-6">
      <div className="flex items-center">
        <div className="text-primary">{icon}</div>
        <p className="ml-3 truncate text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </p>
      </div>
      <p className="mt-2 text-5xl font-extrabold text-foreground">{value}</p>
    </CardContent>
  </Card>
);

const StatsGrid: React.FC<StatsGridProps> = ({
  stats,
  showPrivateStats = false,
  onCityClick,
}) => {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <StatCard
        icon={<Clock className="size-6" />}
        title="Hours"
        value={Math.round(stats.totalHours)}
      />
      <StatCard
        icon={<Box className="size-6" />}
        title="Cubes"
        value={stats.cubesAttended}
      />
      <StatCard
        icon={<MessageCircle className="size-6" />}
        title="Conversations"
        value={stats.totalConversations}
      />
      <StatCard
        icon={<Globe className="size-6" />}
        title="Cities"
        value={stats.cities.length}
        onClick={onCityClick}
      />
      {showPrivateStats && (
        <StatCard
          icon={<TrendingUp className="size-6" />}
          title="Conversions"
          value={stats.veganConversions}
        />
      )}
    </div>
  );
};

export default StatsGrid;
