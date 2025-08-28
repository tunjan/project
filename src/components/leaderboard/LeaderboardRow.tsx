import React from 'react';
import { Link } from 'react-router-dom';
import { type User } from '@/types';
import { TrophyIcon } from '@/icons';
import Tag from '@/components/ui/Tag';

interface LeaderboardRowProps {
  rank: number;
  user: User;
  value: number;
  unit: string;
  isCurrentUser: boolean;
  rankChange?: 'up' | 'down' | 'same';
}

const RankIndicator: React.FC<{ rank: number }> = ({ rank }) => {
  const rankStyles = {
    1: 'bg-yellow text-black border-black',
    2: 'bg-grey-300 text-black border-black',
    3: 'bg-yellow-700 text-white border-black', // Bronze color
  };

  const baseStyle =
    'flex w-16 flex-shrink-0 items-center justify-center border-r-2 border-black text-2xl font-black';
  const rankClass =
    rank <= 3 ? rankStyles[rank as 1 | 2 | 3] : 'bg-white text-black';

  return (
    <div className={`${baseStyle} ${rankClass}`}>
      {rank <= 3 ? <TrophyIcon className="h-6 w-6" /> : <span>{rank}</span>}
    </div>
  );
};

const RankChangeIndicator: React.FC<{ change?: 'up' | 'down' | 'same' }> = ({
  change,
}) => {
  if (!change || change === 'same') return null;

  if (change === 'up') {
    return (
      <div className="flex items-center gap-1 text-success">
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 10l7-7m0 0l7 7m-7-7v18"
          />
        </svg>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 text-danger">
      <svg
        className="h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 14l-7 7m0 0l-7-7m7 7V3"
        />
      </svg>
    </div>
  );
};

const LeaderboardRow: React.FC<LeaderboardRowProps> = ({
  rank,
  user,
  value,
  unit,
  isCurrentUser,
  rankChange,
}) => {
  const primaryChapter =
    user.chapters.length > 0 ? `${user.chapters[0]}` : 'No Chapter';

  return (
    <li
      className={`flex transform-gpu flex-col border-2 border-black transition-all duration-200 hover:-translate-y-1 hover:shadow-brutal ${
        isCurrentUser ? 'bg-primary-lightest ring-2 ring-primary' : 'bg-white'
      }`}
    >
      <Link
        to={`/members/${user.id}`}
        className="flex min-w-0 flex-grow items-stretch"
      >
        <RankIndicator rank={rank} />
        <div className="flex min-w-0 flex-grow items-center p-3">
          <img
            src={user.profilePictureUrl}
            alt={user.name}
            className="h-12 w-12 flex-shrink-0 border-2 border-black object-cover"
          />
          <div className="ml-4 min-w-0 flex-grow">
            <div className="flex items-center gap-2">
              <p className="truncate font-bold text-black">{user.name}</p>
              {isCurrentUser && <Tag variant="primary">YOU</Tag>}
            </div>
            <p className="truncate text-sm text-neutral-600">
              {primaryChapter}
            </p>
          </div>
          <div className="ml-4 hidden flex-shrink-0 items-center gap-2 sm:flex">
            <RankChangeIndicator change={rankChange} />
            <div className="text-right">
              <p className="text-2xl font-extrabold text-black">
                {value.toLocaleString()}
              </p>
              <p className="text-xs font-semibold uppercase tracking-wider text-neutral-600">
                {unit}
              </p>
            </div>
          </div>
        </div>
      </Link>
    </li>
  );
};

export default LeaderboardRow;
