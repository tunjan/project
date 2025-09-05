import { isAfter, subMonths } from 'date-fns';
import { Calendar, TrendingUp, Users } from 'lucide-react';
import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { Card, CardContent } from '@/components/ui/card';
import { useChapters, useEvents, useUsers } from '@/store';
import { useCurrentUser } from '@/store/auth.store';

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

    // FIX: Pre-process data into lookup maps for huge performance gains.
    // This avoids repeatedly filtering large arrays inside a loop.
    const userChapterMap = new Map<string, string[]>();
    allUsers.forEach((user) => {
      if (user.chapters) userChapterMap.set(user.id, user.chapters);
    });

    const userEventAttendance = new Map<string, Date[]>();
    allEvents.forEach((event) => {
      if (event.report?.attendance) {
        Object.entries(event.report.attendance).forEach(([userId, status]) => {
          if (status === 'Attended') {
            if (!userEventAttendance.has(userId)) {
              userEventAttendance.set(userId, []);
            }
            userEventAttendance.get(userId)!.push(new Date(event.startDate));
          }
        });
      }
    });

    return manageableChapters.map((chapter) => {
      const chapterName = chapter.name;

      const chapterMembers = allUsers.filter((u) =>
        userChapterMap.get(u.id)?.includes(chapterName)
      );

      const activeMembers = chapterMembers.filter((member) => {
        const attendedDates = userEventAttendance.get(member.id) || [];
        return attendedDates.some((date) => isAfter(date, threeMonthsAgo));
      }).length;

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
    // ... (rest of the component remains the same)
    return (
      <Card>
        <CardContent className="flex h-full items-center justify-center p-6 text-center">
          <p className="text-muted-foreground">
            You are not managing any chapters.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {chapterHealthData.map((health) => (
        <div
          key={health.name}
          onClick={() => navigate(`/chapters/${health.name}`)}
          className="group cursor-pointer rounded-lg border border-border bg-card p-4 transition-all duration-200 hover:border-primary/30 hover:shadow-md"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              navigate(`/chapters/${health.name}`);
            }
          }}
        >
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0 flex-1">
              <h3 className="mb-3 line-clamp-1 font-semibold text-foreground">
                {health.name}
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <div className="shrink-0 rounded-full bg-primary/10 p-1.5">
                    <Users className="size-3 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground">
                      {health.totalMembers}
                    </p>
                    <p className="line-clamp-1 text-xs text-muted-foreground">
                      Members
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="shrink-0 rounded-full bg-green-100 p-1.5 dark:bg-green-900/20">
                    <TrendingUp className="size-3 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground">
                      {health.activeMembers}
                    </p>
                    <p className="line-clamp-1 text-xs text-muted-foreground">
                      Active
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="shrink-0 rounded-full bg-blue-100 p-1.5 dark:bg-blue-900/20">
                    <Calendar className="size-3 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground">
                      {health.memberGrowth.toFixed(0)}%
                    </p>
                    <p className="line-clamp-1 text-xs text-muted-foreground">
                      Growth
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
export default ChapterHealthSnapshot;
