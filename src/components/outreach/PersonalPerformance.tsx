import { Calendar, Target, TrendingUp, Trophy } from 'lucide-react';
import React, { useMemo } from 'react';

import LineChart from '@/components/analytics/LineChart';
import { type OutreachLog, OutreachOutcome } from '@/types';
import { getConversationTrendsByMonth } from '@/utils';

// Modern stat card with clean design
const Stat: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
}> = ({ icon, label, value, subtitle, trend }) => (
  <div className="rounded-xl border bg-card/50 p-6 transition-colors hover:bg-card/80">
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-xl bg-muted/50">
            {icon}
          </div>
          {trend && (
            <div
              className={`text-sm font-semibold ${
                trend === 'up'
                  ? 'text-green-600'
                  : trend === 'down'
                    ? 'text-red-600'
                    : 'text-muted-foreground'
              }`}
            >
              {trend === 'up' ? '↗' : trend === 'down' ? '↘' : '→'}
            </div>
          )}
        </div>
        <p className="mb-1 text-sm font-medium text-muted-foreground">
          {label}
        </p>
        <p className="mb-1 text-3xl font-bold text-foreground">{value}</p>
        {subtitle && (
          <p className="text-sm text-muted-foreground">{subtitle}</p>
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
    <section className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Your Performance</h2>
        <p className="text-muted-foreground">
          Track your outreach progress and impact over time
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <Stat
          icon={<Calendar className="size-5 text-primary" />}
          label="This Month"
          value={stats.thisMonth}
          subtitle={`vs ${stats.lastMonth} last month`}
          trend={stats.trend}
        />
        <Stat
          icon={<Trophy className="size-5 text-yellow-600" />}
          label="Personal Best"
          value={stats.personalBest}
          subtitle="Best event performance"
        />
        <Stat
          icon={<TrendingUp className="size-5 text-green-600" />}
          label="Success Rate"
          value={stats.successRate}
          subtitle="Positive outcomes"
        />
        <Stat
          icon={<Target className="size-5 text-blue-600" />}
          label="Total Impact"
          value={logs.length}
          subtitle="All conversations"
        />
      </div>

      {/* Chart Section */}
      <div className="rounded-xl border bg-card/50 p-6">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">
            Monthly Conversation Trends
          </h3>
          <div className="text-sm text-muted-foreground">
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
          <p className="text-sm text-muted-foreground">
            Track your outreach momentum throughout the year
          </p>
        </div>
      </div>
    </section>
  );
};

export default PersonalPerformance;
