import React from 'react';
import { Link } from 'react-router-dom';
import { type User } from '@/types';
import { type UserLeaderboardEntry } from '@/utils/leaderboard';
import { UsersIcon } from '@/icons';

interface LeaderboardProps {
  title: string;
  data: UserLeaderboardEntry[];
  unit: string;
  currentUser: User | null;
}

const rankClasses: { [key: number]: string } = {
  1: 'bg-primary text-white',
  2: 'bg-neutral-800 text-white',
  3: 'bg-neutral-300 text-black',
};

const Leaderboard: React.FC<LeaderboardProps> = ({
  title,
  data,
  unit,
  currentUser,
}) => {
  return (
    <div className="border-4 border-black bg-white">
      <h2 className="border-b-4 border-black p-4 text-xl font-bold text-black">
        {title}
      </h2>
      {data.length > 0 ? (
        <ul className="divide-y-4 divide-black">
          {data.map(({ user, value }, index) => {
            const rank = index + 1;
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
                  className={`flex w-16 flex-shrink-0 items-center justify-center border-r-4 border-black text-2xl font-black ${rankBG}`}
                >
                  {rank}
                </div>
                <Link
                  to={`/members/${user.id}`}
                  className="flex flex-grow items-center p-4 transition-colors hover:bg-neutral-100"
                >
                  <img
                    src={user.profilePictureUrl}
                    alt={user.name}
                    className="h-12 w-12 flex-shrink-0 border-2 border-black object-cover"
                  />
                  <div className="ml-4 flex-grow">
                    <p className="font-bold text-black">{user.name}</p>
                  </div>
                  <div className="ml-4 flex-shrink-0 text-right">
                    <p className="text-2xl font-extrabold text-black">
                      {value.toLocaleString()}
                    </p>
                    <p className="text-xs font-semibold uppercase tracking-wider text-neutral-600">
                      {unit}
                    </p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="p-8 text-center text-neutral-500">
          <UsersIcon className="mx-auto h-12 w-12 text-neutral-300" />
          <p className="mt-2 font-semibold">No data available.</p>
          <p className="text-sm">There is no activity for this time period.</p>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
