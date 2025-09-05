import { Trophy } from 'lucide-react';
import React, { useMemo } from 'react';

import { useEvents, useUsers } from '@/store';
import { useCurrentUser } from '@/store/auth.store';
import { CubeEvent, User } from '@/types';

const LeaderboardSnapshot: React.FC = () => {
  const currentUser = useCurrentUser();
  const allUsers = useUsers();
  const allEvents = useEvents();

  const userRank = useMemo(() => {
    if (!currentUser || !currentUser.chapters.length) return null;

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const chapterMembers = allUsers.filter((user: User) =>
      user.chapters?.some((c) => currentUser.chapters.includes(c))
    );

    const getMonthlyHours = (userId: string) => {
      return allEvents.reduce((total: number, event: CubeEvent) => {
        if (event.report?.attendance[userId] === 'Attended') {
          const eventDate = new Date(event.startDate);
          if (
            eventDate.getMonth() === currentMonth &&
            eventDate.getFullYear() === currentYear
          ) {
            return total + (event.report.hours || 0);
          }
        }
        return total;
      }, 0);
    };

    const rankedUsers = chapterMembers
      .map((user) => ({
        ...user,
        monthlyHours: getMonthlyHours(user.id),
      }))
      .sort((a, b) => b.monthlyHours - a.monthlyHours);

    const rank =
      rankedUsers.findIndex((user) => user.id === currentUser.id) + 1;

    return {
      rank,
      total: rankedUsers.length,
      hours: rankedUsers[rank - 1]?.monthlyHours || 0,
    };
  }, [currentUser, allUsers, allEvents]);

  if (!userRank || userRank.hours === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-center">
        <Trophy className="mb-4 size-12 text-muted-foreground" />
        <h3 className="font-bold text-foreground">No activity this month</h3>
        <p className="text-sm text-muted-foreground">
          Log some hours to get on the board!
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col items-center justify-center text-center">
      <Trophy className="size-16 text-primary" />
      <p className="mt-4 text-lg text-foreground">You are</p>
      <h3 className="text-5xl font-bold text-foreground">#{userRank.rank}</h3>
      <p className="text-lg text-foreground">
        out of {userRank.total} activists
      </p>
      <p className="mt-2 text-sm text-muted-foreground">
        with {userRank.hours.toFixed(1)} hours this month.
      </p>
    </div>
  );
};

export default LeaderboardSnapshot;
