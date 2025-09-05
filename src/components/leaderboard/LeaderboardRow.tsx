import { Trophy } from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { type User } from '@/types';

interface LeaderboardRowProps {
  rank: number;
  user: User;
  value: number;
  unit: string;
  topValue?: number;
  isCurrentUser: boolean;
  rankChange?: 'up' | 'down' | 'same';
}

const RankIndicator: React.FC<{ rank: number }> = ({ rank }) => {
  const getRankBadge = () => {
    if (rank === 1) {
      return (
        <Badge
          variant="default"
          className="bg-yellow-400 text-yellow-900 dark:bg-yellow-600 dark:text-yellow-100"
        >
          <Trophy className="size-4" />
        </Badge>
      );
    }
    if (rank === 2) {
      return (
        <Badge
          variant="secondary"
          className="bg-gray-300 text-gray-900 dark:bg-gray-600 dark:text-gray-100"
        >
          <Trophy className="size-4" />
        </Badge>
      );
    }
    if (rank === 3) {
      return (
        <Badge
          variant="outline"
          className="bg-amber-600 text-amber-100 dark:bg-amber-700 dark:text-amber-100"
        >
          <Trophy className="size-4" />
        </Badge>
      );
    }
    return <Badge variant="outline">{rank}</Badge>;
  };

  return (
    <div className="flex w-16 shrink-0 items-center justify-center">
      {getRankBadge()}
    </div>
  );
};

const RankChangeIndicator: React.FC<{ change?: 'up' | 'down' | 'same' }> = ({
  change,
}) => {
  if (!change || change === 'same') return null;

  if (change === 'up') {
    return (
      <Badge variant="default" className="bg-green-500 text-green-100">
        <svg
          className="size-3"
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
      </Badge>
    );
  }

  return (
    <Badge variant="destructive">
      <svg
        className="size-3"
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
    </Badge>
  );
};

const LeaderboardRow: React.FC<LeaderboardRowProps> = ({
  rank,
  user,
  value,
  unit,
  topValue,
  isCurrentUser,
  rankChange,
}) => {
  const primaryChapter =
    user.chapters.length > 0 ? `${user.chapters[0]}` : 'No Chapter';

  return (
    <li
      className={`transition-all duration-200 hover:shadow-md ${
        isCurrentUser ? 'ring-2 ring-primary' : ''
      }`}
    >
      <Link
        to={`/members/${user.id}`}
        className="flex min-w-0 grow items-stretch"
      >
        <div className="flex min-w-0 grow items-center p-4">
          <RankIndicator rank={rank} />
          <Avatar className="ml-4 size-12 shrink-0">
            <AvatarImage
              src={user.profilePictureUrl}
              alt={user.name}
              className="object-cover"
            />
            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="ml-4 min-w-0 grow">
            <div className="flex items-center gap-2">
              <p className="truncate font-bold text-foreground">{user.name}</p>
              {isCurrentUser && <Badge variant="default">YOU</Badge>}
            </div>
            <p className="truncate text-sm text-muted-foreground">
              {primaryChapter}
            </p>

            {/* Compact progress bar to give visual weight to higher ranks */}
            <div className="mt-2">
              <Progress
                value={Math.max(
                  3,
                  Math.round(((value || 0) / (topValue || value || 1)) * 100)
                )}
                className="h-2"
              />
            </div>
          </div>

          <div className="ml-4 hidden shrink-0 items-center justify-end gap-2 sm:flex sm:w-24">
            <RankChangeIndicator change={rankChange} />
            <div className="text-right">
              <p className="text-2xl font-extrabold text-foreground">
                {value.toLocaleString()}
              </p>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
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
