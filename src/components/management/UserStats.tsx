import React, { useMemo } from 'react';

import LineChart from '@/components/analytics/LineChart';
import BadgeList from '@/components/dashboard/BadgeList';
import DiscountTierProgress from '@/components/dashboard/DiscountTierProgress';
import StatsGrid from '@/components/dashboard/StatsGrid';
import {
  CalendarIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon,
  MapIcon,
  TargetIcon,
} from '@/icons';
import { useEvents, useOutreachLogs } from '@/store';
import { type User } from '@/types';
import { getConversationTrendsByMonth } from '@/utils';

interface UserStatsProps {
  user: User;
}

const UserStats: React.FC<UserStatsProps> = ({ user }) => {
  const allEvents = useEvents();
  const allOutreachLogs = useOutreachLogs();

  // Enhanced analytics data
  const userAnalytics = useMemo(() => {
    const userEvents = allEvents.filter((event) =>
      event.participants.some((p) => p.user.id === user.id)
    );

    const userOutreachLogs = allOutreachLogs.filter(
      (log) => log.userId === user.id
    );

    // Event participation details
    const attendedEvents = userEvents.filter(
      (event) => event.report?.attendance[user.id] === 'Attended'
    );

    const organizedEvents = allEvents.filter(
      (event) => event.organizer.id === user.id
    );

    // Outreach performance by outcome
    const outreachByOutcome = userOutreachLogs.reduce(
      (acc, log) => {
        acc[log.outcome] = (acc[log.outcome] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    // Monthly trends
    const monthlyData = getConversationTrendsByMonth(userOutreachLogs, 12);

    // City coverage
    const citiesVisited = new Set([
      ...user.stats.cities,
      ...attendedEvents.map((e) => e.city),
    ]);

    // Recent activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentOutreach = userOutreachLogs.filter(
      (log) => new Date(log.createdAt) > thirtyDaysAgo
    ).length;

    const recentEvents = attendedEvents.filter(
      (event) => new Date(event.startDate) > thirtyDaysAgo
    ).length;

    return {
      userEvents,
      userOutreachLogs,
      attendedEvents,
      organizedEvents,
      outreachByOutcome,
      monthlyData,
      citiesVisited: Array.from(citiesVisited),
      recentOutreach,
      recentEvents,
      totalHours: attendedEvents.reduce(
        (sum, event) => sum + (event.report?.hours || 0),
        0
      ),
      averageConversationsPerEvent:
        userOutreachLogs.length > 0 && attendedEvents.length > 0
          ? (userOutreachLogs.length / attendedEvents.length).toFixed(1)
          : '0',
    };
  }, [user, allEvents, allOutreachLogs]);

  return (
    <div className="space-y-8">
      {/* Enhanced Statistics Grid */}
      <div>
        <h3 className="mb-4 text-xl font-bold text-black">
          Performance Overview
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2">
          <div className="rounded-none border-black bg-white p-4 md:border-2">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-none bg-primary/10">
                <CalendarIcon className="size-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-bold text-neutral-600">
                  Events Attended
                </p>
                <p className="text-2xl font-bold text-black">
                  {userAnalytics.attendedEvents.length}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-none border-black bg-white p-4 md:border-2">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-none bg-success/10">
                <ChatBubbleLeftRightIcon className="size-5 text-success" />
              </div>
              <div>
                <p className="text-sm font-bold text-neutral-600">
                  Total Conversations
                </p>
                <p className="text-2xl font-bold text-black">
                  {userAnalytics.userOutreachLogs.length}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-none border-black bg-white p-4 md:border-2">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-none bg-warning/10">
                <ClockIcon className="size-5 text-warning" />
              </div>
              <div>
                <p className="text-sm font-bold text-neutral-600">
                  Total Hours
                </p>
                <p className="text-2xl font-bold text-black">
                  {userAnalytics.totalHours}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-none border-black bg-white p-4 md:border-2">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-none bg-info/10">
                <MapIcon className="size-5 text-info" />
              </div>
              <div>
                <p className="text-sm font-bold text-neutral-600">
                  Cities Visited
                </p>
                <p className="text-2xl font-bold text-black">
                  {userAnalytics.citiesVisited.length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Outreach Performance Breakdown */}
      <div>
        <h3 className="mb-4 text-xl font-bold text-black">
          Outreach Performance
        </h3>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Monthly Trends Chart */}
          <div className="rounded-none border-black bg-white p-6 md:border-2">
            <h4 className="mb-4 text-lg font-bold text-black">
              Monthly Conversation Trends
            </h4>
            <LineChart
              data={userAnalytics.monthlyData.map((d) => ({
                label: new Date(d.month + '-02').toLocaleString('default', {
                  month: 'short',
                }),
                value: d.count,
              }))}
              title="Conversations per Month"
            />
          </div>

          {/* Outreach Outcomes Breakdown */}
          <div className="rounded-none border-black bg-white p-6 md:border-2">
            <h4 className="mb-4 text-lg font-bold text-black">
              Conversation Outcomes
            </h4>
            <div className="space-y-3">
              {Object.entries(userAnalytics.outreachByOutcome).map(
                ([outcome, count]) => (
                  <div
                    key={outcome}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm font-medium text-neutral-700">
                      {outcome}
                    </span>
                    <span className="text-lg font-bold text-black">
                      {count}
                    </span>
                  </div>
                )
              )}
            </div>
            <div className="mt-4 bg-neutral-50 p-3">
              <p className="text-sm text-neutral-600">
                <TargetIcon className="mr-2 inline size-4" />
                Avg: {userAnalytics.averageConversationsPerEvent} conversations
                per event
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Event Participation Details */}
      <div>
        <h3 className="mb-4 text-xl font-bold text-black">
          Event Participation
        </h3>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Recent Activity */}
          <div className="rounded-none border-black bg-white p-6 md:border-2">
            <h4 className="mb-4 text-lg font-bold text-black">
              Recent Activity (30 days)
            </h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-neutral-700">
                  New Conversations
                </span>
                <span className="text-lg font-bold text-black">
                  {userAnalytics.recentOutreach}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-neutral-700">
                  Events Attended
                </span>
                <span className="text-lg font-bold text-black">
                  {userAnalytics.recentEvents}
                </span>
              </div>
            </div>
          </div>

          {/* Event Organization */}
          <div className="rounded-none border-black bg-white p-6 md:border-2">
            <h4 className="mb-4 text-lg font-bold text-black">
              Event Organization
            </h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-neutral-700">
                  Events Organized
                </span>
                <span className="text-lg font-bold text-black">
                  {userAnalytics.organizedEvents.length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-neutral-700">
                  Total Participants
                </span>
                <span className="text-lg font-bold text-black">
                  {userAnalytics.organizedEvents.reduce(
                    (sum, event) => sum + event.participants.length,
                    0
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Original Stats Components */}
      <div>
        <h3 className="mb-4 text-xl font-bold text-black">Core Statistics</h3>
        <StatsGrid stats={user.stats} />
      </div>

      {user.badges && user.badges.length > 0 && (
        <div>
          <h3 className="mb-4 text-xl font-bold text-black">
            Recognitions & Badges
          </h3>
          <BadgeList badges={user.badges} />
        </div>
      )}

      <div>
        <h3 className="mb-4 text-xl font-bold text-black">
          Discount Tier Progress
        </h3>
        <DiscountTierProgress user={user} />
      </div>
    </div>
  );
};

export default UserStats;
