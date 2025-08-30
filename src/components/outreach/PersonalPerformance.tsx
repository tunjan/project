import React, { useMemo } from 'react';

import LineChart from '@/components/analytics/LineChart';
import { CalendarIcon, TargetIcon, TrendingUpIcon, TrophyIcon } from '@/icons';
import { type OutreachLog, OutreachOutcome } from '@/types';
import { getConversationTrendsByMonth } from '@/utils/analytics';

// Enhanced stat card with better visual impact
const Stat: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
}> = ({ icon, label, value, subtitle, trend }) => (
  <div className="group relative overflow-hidden rounded-none border-2 border-black bg-white p-6 hover:shadow-brutal-lg">
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <div className="mb-2 flex items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-none bg-neutral-100 group-hover:bg-neutral-200">
            {icon}
          </div>
          {trend && (
            <div
              className={`text-sm font-bold ${
                trend === 'up'
                  ? 'text-success'
                  : trend === 'down'
                    ? 'text-danger'
                    : 'text-neutral-500'
              }`}
            >
              {trend === 'up' ? '↗' : trend === 'down' ? '↘' : '→'}
            </div>
          )}
        </div>
        <p className="text-sm font-bold uppercase tracking-wide text-neutral-600">
          {label}
        </p>
        <p className="text-3xl font-extrabold text-black">{value}</p>
        {subtitle && (
          <p className="mt-1 text-sm text-neutral-500">{subtitle}</p>
        )}
      </div>
    </div>
  </div>
);

const PersonalPerformance: React.FC<{ logs: OutreachLog[] }> = ({ logs }) => {
  const currentYear = new Date().getFullYear();

  const monthlyData = useMemo(
    () => getConversationTrendsByMonth(logs, 12),
    [logs]
  );

  const stats = useMemo(() => {
    const currentMonth = new Date().getMonth();
    const thisMonth = logs.filter((l) => {
      const d = new Date(l.createdAt);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    }).length;

    const lastMonth = logs.filter((l) => {
      const d = new Date(l.createdAt);
      const lastMonthDate = new Date(currentYear, currentMonth - 1);
      return (
        d.getMonth() === lastMonthDate.getMonth() &&
        d.getFullYear() === lastMonthDate.getFullYear()
      );
    }).length;

    const positiveOutcomes = logs.filter((log) =>
      [
        OutreachOutcome.BECAME_VEGAN_ACTIVIST,
        OutreachOutcome.BECAME_VEGAN,
        OutreachOutcome.ALREADY_VEGAN_NOW_ACTIVIST,
      ].includes(log.outcome)
    ).length;

    const successRate =
      logs.length > 0
        ? `${Math.round((positiveOutcomes / logs.length) * 100)}%`
        : '0%';

    const eventCounts = logs.reduce(
      (acc, log) => {
        acc[log.eventId] = (acc[log.eventId] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );
    const personalBest = Math.max(...Object.values(eventCounts), 0);

    // Calculate trend for this month vs last month
    const getTrend = (
      current: number,
      previous: number
    ): 'up' | 'down' | 'neutral' => {
      if (current > previous) return 'up';
      if (current < previous) return 'down';
      return 'neutral';
    };

    return {
      thisMonth,
      lastMonth,
      successRate,
      personalBest,
      trend: getTrend(thisMonth, lastMonth),
    };
  }, [logs, currentYear]);

  return (
    <section>
      <h2 className="mb-6 border-b-4 border-primary pb-3 text-2xl font-extrabold tracking-tight text-black">
        Your Performance
      </h2>

      <div className="space-y-8">
        {/* Enhanced Stats Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <Stat
            icon={<CalendarIcon className="size-6 text-primary" />}
            label="This Month"
            value={stats.thisMonth}
            subtitle={`vs ${stats.lastMonth} last month`}
            trend={stats.trend}
          />
          <Stat
            icon={<TrophyIcon className="size-6 text-warning" />}
            label="Personal Best"
            value={stats.personalBest}
            subtitle="Best event performance"
          />
          <Stat
            icon={<TrendingUpIcon className="size-6 text-success" />}
            label="Success Rate"
            value={stats.successRate}
            subtitle="Positive outcomes"
          />
          <Stat
            icon={<TargetIcon className="size-6 text-info" />}
            label="Total Impact"
            value={logs.length}
            subtitle="All conversations"
          />
        </div>

        {/* Enhanced Chart Section */}
        <div className="rounded-none border-2 border-black bg-white p-6 hover:shadow-brutal-lg">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-bold text-black">
              Monthly Conversation Trends
            </h3>
            <div className="text-sm text-neutral-600">
              {currentYear} Performance
            </div>
          </div>

          <div className="w-full">
            <LineChart
              data={monthlyData.map((d) => ({
                label: new Date(d.month + '-02').toLocaleString('default', {
                  month: 'short',
                }),
                value: d.count,
              }))}
              title="Conversations per Month"
            />
          </div>

          <div className="mt-4 text-center">
            <p className="text-sm text-neutral-600">
              Track your outreach momentum throughout the year
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PersonalPerformance;
