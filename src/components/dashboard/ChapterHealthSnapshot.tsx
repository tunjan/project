import React, { useMemo } from 'react';
import { useCurrentUser } from '@/store/auth.store';
import { useUsers, useChapters, useEvents } from '@/store';
import { UserGroupIcon, TrendingUpIcon, CalendarIcon } from '@/icons';
import { subMonths, isAfter } from 'date-fns';

interface ChapterHealth {
  name: string;
  totalMembers: number;
  activeMembers: number;
  memberGrowth: number;
}

const ChapterHealthSnapshot: React.FC = () => {
  const currentUser = useCurrentUser();
  const allUsers = useUsers();
  const allChapters = useChapters();
  const allEvents = useEvents();

  const manageableChapters = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === 'Global Admin') return allChapters;
    return allChapters.filter(c => currentUser.organiserOf?.includes(c.name));
  }, [currentUser, allChapters]);

  const chapterHealthData: ChapterHealth[] = useMemo(() => {
    if (!manageableChapters.length) return [];

    const threeMonthsAgo = subMonths(new Date(), 3);
    const oneMonthAgo = subMonths(new Date(), 1);

    return manageableChapters.map(chapter => {
      const chapterMembers = allUsers.filter(u => u.chapters?.includes(chapter.name));

      const activeMembers = chapterMembers.filter(member => {
        const lastEvent = allEvents
          .filter(e => e.organizer.chapters?.includes(chapter.name) && e.report?.attendance[member.id] === 'Attended')
          .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())[0];
        return lastEvent && isAfter(new Date(lastEvent.startDate), threeMonthsAgo);
      }).length;

      const recentMembers = chapterMembers.filter(u => u.joinDate && isAfter(new Date(u.joinDate), oneMonthAgo)).length;
      const previousMembers = chapterMembers.length - recentMembers;
      const memberGrowth = previousMembers > 0 ? (recentMembers / previousMembers) * 100 : recentMembers > 0 ? 100 : 0;

      return {
        name: chapter.name,
        totalMembers: chapterMembers.length,
        activeMembers,
        memberGrowth,
      };
    });
  }, [manageableChapters, allUsers, allEvents]);

  if (!chapterHealthData.length) {
    return (
      <div className="flex h-full items-center justify-center text-center text-neutral-600">
        <p>You are not managing any chapters.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {chapterHealthData.map(health => (
        <div key={health.name} className="border-2 border-black bg-white p-4">
          <h4 className="h-card mb-4">{health.name}</h4>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <UserGroupIcon className="mx-auto h-6 w-6 text-primary" />
              <p className="mt-1 text-2xl font-bold">{health.totalMembers}</p>
              <p className="text-xs text-neutral-600">Total Members</p>
            </div>
            <div>
              <TrendingUpIcon className="mx-auto h-6 w-6 text-success" />
              <p className="mt-1 text-2xl font-bold">{health.activeMembers}</p>
              <p className="text-xs text-neutral-600">Active (3mo)</p>
            </div>
            <div>
              <CalendarIcon className="mx-auto h-6 w-6 text-primary" />
              <p className="mt-1 text-2xl font-bold">{health.memberGrowth.toFixed(0)}%</p>
              <p className="text-xs text-neutral-600">Growth (1mo)</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ChapterHealthSnapshot;
