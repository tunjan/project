import React, { useMemo } from 'react';
import { useCurrentUser } from '@/store/auth.store';
import { useUsers, useEvents } from '@/store';
import { User, CubeEvent } from '@/types';
import { TrophyIcon } from '@/icons';

const LeaderboardSnapshot: React.FC = () => {
  const currentUser = useCurrentUser();
  const allUsers = useUsers();
  const allEvents = useEvents();

  const userRank = useMemo(() => {
    if (!currentUser || !currentUser.chapters.length) return null;

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const chapterMembers = allUsers.filter((user: User) =>
      user.chapters?.some(c => currentUser.chapters.includes(c))
    );

    const getMonthlyHours = (userId: string) => {
      return allEvents.reduce((total: number, event: CubeEvent) => {
        if (event.report?.attendance[userId] === 'Attended') {
          const eventDate = new Date(event.startDate);
          if (eventDate.getMonth() === currentMonth && eventDate.getFullYear() === currentYear) {
            return total + (event.report.hours || 0);
          }
        }
        return total;
      }, 0);
    };

    const rankedUsers = chapterMembers
      .map(user => ({
        ...user,
        monthlyHours: getMonthlyHours(user.id),
      }))
      .sort((a, b) => b.monthlyHours - a.monthlyHours);

    const rank = rankedUsers.findIndex(user => user.id === currentUser.id) + 1;

    return {
      rank,
      total: rankedUsers.length,
      hours: rankedUsers[rank - 1]?.monthlyHours || 0,
    };
  }, [currentUser, allUsers, allEvents]);

  if (!userRank || userRank.hours === 0) {
    return (
        <div className="flex h-full flex-col items-center justify-center text-center">
          <TrophyIcon className="h-12 w-12 text-grey-400 mb-4" />
          <h3 className="font-bold">No activity this month</h3>
          <p className="text-sm text-grey-600">Log some hours to get on the board!</p>
        </div>
    );
  }

  return (
      <div className="flex h-full flex-col items-center justify-center text-center">
        <TrophyIcon className="h-16 w-16 text-yellow" />
        <p className="mt-4 text-lg">You are</p>
        <h3 className="text-5xl font-bold">#{userRank.rank}</h3>
        <p className="text-lg">out of {userRank.total} activists</p>
        <p className="mt-2 text-sm text-grey-600">with {userRank.hours.toFixed(1)} hours this month.</p>
      </div>
  );
};

export default LeaderboardSnapshot;
