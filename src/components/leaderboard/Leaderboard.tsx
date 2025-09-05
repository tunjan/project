import { Users } from 'lucide-react';
import React from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { type User } from '@/types';
import { calculateRanks, type UserLeaderboardEntry } from '@/utils';

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
  const rankedData = calculateRanks(data);

  const maxValue = rankedData[0]?.value ?? 0;

  const currentUserEntry = rankedData.find(
    (d) => d.user.id === currentUser?.id
  );
  const topEntries = rankedData.slice(0, 10);
  const isCurrentUserInTop = topEntries.some(
    (entry) => entry.user.id === currentUser?.id
  );

  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <CardTitle className="text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent className="grow overflow-y-auto p-0">
        {rankedData.length > 0 ? (
          <ul className="space-y-0">
            {topEntries.map((entry) => (
              <LeaderboardRow
                key={entry.user.id}
                rank={entry.rank}
                user={entry.user}
                value={entry.value}
                unit={unit}
                topValue={maxValue}
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
                  topValue={maxValue}
                  isCurrentUser={true}
                />
              </>
            )}
          </ul>
        ) : (
          <div className="flex h-full flex-col items-center justify-center p-8 text-center text-neutral-500">
            <Users className="size-12" />
            <p className="mt-2 font-semibold text-black">No data available.</p>
            <p className="text-sm">No activity for this time period.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default Leaderboard;
