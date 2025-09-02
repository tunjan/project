import { isAfter, subMonths } from 'date-fns';
import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { CalendarIcon, TrendingUpIcon, UserGroupIcon } from '@/icons';
import { useChapters, useEvents, useUsers } from '@/store';
import { useCurrentUser } from '@/store/auth.store';
import { CubeEvent } from '@/types';

interface ChapterHealth {
  name: string;
  totalMembers: number;
  activeMembers: number;
  memberGrowth: number;
}

const ChapterHealthSnapshot: React.FC = () => {
  const navigate = useNavigate();
  const currentUser = useCurrentUser();
  const allUsers = useUsers();
  const allChapters = useChapters();
  const allEvents = useEvents();

  const manageableChapters = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === 'Global Admin') return allChapters;
    return allChapters.filter((c) => currentUser.organiserOf?.includes(c.name));
  }, [currentUser, allChapters]);

  const chapterHealthData: ChapterHealth[] = useMemo(() => {
    if (!manageableChapters.length) return [];

    const threeMonthsAgo = subMonths(new Date(), 3);
    const oneMonthAgo = subMonths(new Date(), 1);

    // CRITICAL FIX: Optimize performance by pre-processing data once
    // Create lookup maps to avoid repeated filtering operations
    const userChapterMap = new Map<string, string[]>();
    const eventChapterMap = new Map<string, CubeEvent[]>();
    const userEventMap = new Map<string, CubeEvent[]>();

    // Build user-chapter relationships
    allUsers.forEach((user) => {
      if (user.chapters) {
        userChapterMap.set(user.id, user.chapters);
      }
    });

    // Build event-chapter relationships and user-event relationships
    allEvents.forEach((event) => {
      if (event.organizer.chapters) {
        event.organizer.chapters.forEach((chapterName) => {
          if (!eventChapterMap.has(chapterName)) {
            eventChapterMap.set(chapterName, []);
          }
          eventChapterMap.get(chapterName)!.push(event);
        });

        // Track user attendance for performance
        if (event.report?.attendance) {
          Object.entries(event.report.attendance).forEach(
            ([userId, status]) => {
              if (status === 'Attended') {
                if (!userEventMap.has(userId)) {
                  userEventMap.set(userId, []);
                }
                userEventMap.get(userId)!.push(event);
              }
            }
          );
        }
      }
    });

    return manageableChapters.map((chapter) => {
      const chapterName = chapter.name;

      // Get chapter members efficiently
      const chapterMembers = allUsers.filter((u) =>
        userChapterMap.get(u.id)?.includes(chapterName)
      );

      // Calculate active members efficiently
      const activeMembers = chapterMembers.filter((member) => {
        const userEvents = userEventMap.get(member.id) || [];
        const chapterEvents = userEvents.filter((event) =>
          event.organizer.chapters?.includes(chapterName)
        );

        if (chapterEvents.length === 0) return false;

        // Find most recent event for this user in this chapter
        const lastEvent = chapterEvents.reduce((latest, current) =>
          new Date(current.startDate) > new Date(latest.startDate)
            ? current
            : latest
        );

        return isAfter(new Date(lastEvent.startDate), threeMonthsAgo);
      }).length;

      // Calculate member growth efficiently
      const recentMembers = chapterMembers.filter(
        (u) => u.joinDate && isAfter(new Date(u.joinDate), oneMonthAgo)
      ).length;

      const previousMembers = chapterMembers.length - recentMembers;
      const memberGrowth =
        previousMembers > 0
          ? (recentMembers / previousMembers) * 100
          : recentMembers > 0
            ? 100
            : 0;

      return {
        name: chapterName,
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
      {chapterHealthData.map((health) => (
        <button
          key={health.name}
          onClick={() => navigate(`/chapters/${health.name}`)}
          className="w-full border-black bg-white p-4 text-left hover:shadow-brutal md:border-2"
        >
          <h4 className="h-card mb-4">{health.name}</h4>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <UserGroupIcon className="mx-auto size-6 text-primary" />
              <p className="mt-1 text-2xl font-bold">{health.totalMembers}</p>
              <p className="text-xs text-neutral-600">Total Members</p>
            </div>
            <div>
              <TrendingUpIcon className="mx-auto size-6 text-success" />
              <p className="mt-1 text-2xl font-bold">{health.activeMembers}</p>
              <p className="text-xs text-neutral-600">Active (3mo)</p>
            </div>
            <div>
              <CalendarIcon className="mx-auto size-6 text-primary" />
              <p className="mt-1 text-2xl font-bold">
                {health.memberGrowth.toFixed(0)}%
              </p>
              <p className="text-xs text-neutral-600">Growth (1mo)</p>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
};

export default ChapterHealthSnapshot;
