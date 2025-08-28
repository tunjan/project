import React, { useMemo } from 'react';
import { OutreachOutcome, type OutreachLog } from '@/types';
import { CalendarIcon, TrophyIcon, TrendingUpIcon } from '@/icons';
import { getConversationTrendsByMonth } from '@/utils/analytics';
import LineChart from '@/components/analytics/LineChart';

const Stat: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string | number;
}> = ({ icon, label, value }) => (
  <div className="flex items-center gap-3 border-2 border-black bg-white p-4">
    {icon}
    <div>
      <p className="text-sm font-bold text-neutral-600">{label}</p>
      <p className="text-2xl font-bold text-black">{value}</p>
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

    return { thisMonth, successRate, personalBest };
  }, [logs, currentYear]);

  return (
    <section>
      <h2 className="h-section">Your Performance</h2>
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4">
          <Stat
            icon={<CalendarIcon className="h-8 w-8 text-primary" />}
            label="This Month"
            value={stats.thisMonth}
          />
          <Stat
            icon={<TrophyIcon className="h-8 w-8 text-primary" />}
            label="Personal Best"
            value={stats.personalBest}
          />
          <Stat
            icon={<TrendingUpIcon className="h-8 w-8 text-primary" />}
            label="Success Rate"
            value={stats.successRate}
          />
        </div>
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
    </section>
  );
};

export default PersonalPerformance;
