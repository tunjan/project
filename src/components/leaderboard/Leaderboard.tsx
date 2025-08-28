import React from 'react';
import { type User } from '@/types';
import { type UserLeaderboardEntry, calculateRanks } from '@/utils/leaderboard';
import { UsersIcon } from '@/icons';
import LeaderboardRow from './LeaderboardRow';

interface LeaderboardProps {
  title: string;
  data: UserLeaderboardEntry[];
  unit: string;
  currentUser: User | null;
}

const Leaderboard: React.FC<LeaderboardProps> = ({
  title,
  data,
  unit,
  currentUser,
}) => {
  // Calculate proper ranks that handle ties
  const rankedData = calculateRanks(data);

  const currentUserEntry = rankedData.find(
    (d) => d.user.id === currentUser?.id
  );
  const topEntries = rankedData.slice(0, 10);
  const isCurrentUserInTop = topEntries.some(
    (entry) => entry.user.id === currentUser?.id
  );

  return (
    <div className="flex h-full flex-col border-2 border-black bg-white">
      <h2 className="border-b-2 border-black p-4 text-xl font-bold text-black">
        {title}
      </h2>
      <div className="flex-grow overflow-y-auto">
        {rankedData.length > 0 ? (
          <ul className="space-y-3 p-4">
            {topEntries.map((entry) => (
              <LeaderboardRow
                key={entry.user.id}
                rank={entry.rank}
                user={entry.user}
                value={entry.value}
                unit={unit}
                isCurrentUser={currentUser?.id === entry.user.id}
              />
            ))}

            {/* --- Integrated "My Rank" feature --- */}
            {currentUserEntry && !isCurrentUserInTop && (
              <>
                <div className="py-2 text-center text-2xl font-black text-neutral-400">
                  ...
                </div>
                <LeaderboardRow
                  rank={currentUserEntry.rank}
                  user={currentUserEntry.user}
                  value={currentUserEntry.value}
                  unit={unit}
                  isCurrentUser={true}
                />
              </>
            )}
          </ul>
        ) : (
          <div className="flex h-full flex-col items-center justify-center p-8 text-center text-neutral-500">
            <UsersIcon className="h-12 w-12" />
            <p className="mt-2 font-semibold text-black">No data available.</p>
            <p className="text-sm">No activity for this time period.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
