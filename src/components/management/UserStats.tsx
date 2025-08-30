import React from 'react';
import { type User } from '@/types';
import StatsGrid from '@/components/dashboard/StatsGrid';
import BadgeList from '@/components/dashboard/BadgeList';
import DiscountTierProgress from '@/components/dashboard/DiscountTierProgress';

interface UserStatsProps {
  user: User;
}

const UserStats: React.FC<UserStatsProps> = ({ user }) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-3 text-lg font-semibold">Statistics</h3>
        <StatsGrid stats={user.stats} />
      </div>

      {user.badges && user.badges.length > 0 && (
        <div>
          <h3 className="mb-3 text-lg font-semibold">Badges</h3>
          <BadgeList badges={user.badges} />
        </div>
      )}

      <div>
        <h3 className="mb-3 text-lg font-semibold">Discount Tier Progress</h3>
        <DiscountTierProgress user={user} />
      </div>
    </div>
  );
};

export default UserStats;
