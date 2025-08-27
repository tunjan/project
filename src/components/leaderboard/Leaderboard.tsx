import React from 'react';
import { Link } from 'react-router-dom';
import { type User } from '@/types';
import { type UserLeaderboardEntry, calculateRanks } from '@/utils/leaderboard';
import { UsersIcon } from '@/icons';

interface LeaderboardProps {
  title: string;
  data: UserLeaderboardEntry[];
  unit: string;
  currentUser: User | null;
}

const rankClasses: { [key: number]: string } = {
  1: 'bg-primary text-white',
  2: 'bg-black text-white',
  3: 'bg-white text-black',
};

const Leaderboard: React.FC<LeaderboardProps> = ({
  title,
  data,
  unit,
  currentUser,
}) => {
  // Calculate proper ranks that handle ties
  const rankedData = calculateRanks(data);

  return (
    <div className="border-2 border-black bg-white">
      <h2 className="border-b-2 border-black p-4 text-xl font-bold text-black">
        {title}
      </h2>
      {rankedData.length > 0 ? (
        <ul className="divide-y-2 divide-black">
          {rankedData.map(({ user, value, rank }) => {
            const isCurrentUser = currentUser && user.id === currentUser.id;
            const rankBG = rankClasses[rank] || 'bg-white text-black';

            return (
              <li
                key={user.id}
                className={`flex items-stretch ${
                  isCurrentUser ? 'border-l-8 border-primary bg-primary/5' : ''
                }`}
              >
                <div
                  className={`flex w-16 flex-shrink-0 items-center justify-center border-r-2 border-black text-2xl font-black ${rankBG}`}
                >
                  {rank}
                </div>
                <Link
                  to={`/members/${user.id}`}
                  className="flex min-w-0 flex-grow items-center p-4 transition-colors hover:bg-white"
                >
                  <img
                    src={user.profilePictureUrl}
                    alt={user.name}
                    className="h-12 w-12 flex-shrink-0 border-2 border-black object-cover"
                  />
                  <div className="ml-4 min-w-0 flex-grow">
                    <p className="truncate font-bold text-black lg:max-w-none">
                      {user.name}
                    </p>
                  </div>
                  <div className="ml-4 flex-shrink-0 text-right">
                    <p className="text-xl font-extrabold text-black sm:text-2xl">
                      {value.toLocaleString()}
                    </p>
                    <p className="text-grey-600 text-xs font-semibold uppercase tracking-wider">
                      {unit}
                    </p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="text-white0 p-8 text-center">
          <UsersIcon className="text-grey-500 mx-auto h-12 w-12" />
          <p className="mt-2 font-semibold">No data available.</p>
          <p className="text-sm">There is no activity for this time period.</p>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
