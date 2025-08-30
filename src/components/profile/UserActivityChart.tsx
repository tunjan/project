import React, { useMemo } from 'react';

import LineChart from '@/components/analytics/LineChart';
import { useEvents, useOutreachLogs } from '@/store';
import {
  getUserConversationsByMonth,
  getUserHoursByMonth,
} from '@/utils/analytics';

interface UserActivityChartProps {
  userId: string;
}

const UserActivityChart: React.FC<UserActivityChartProps> = ({ userId }) => {
  const allEvents = useEvents();
  const allOutreachLogs = useOutreachLogs();

  const hoursData = useMemo(
    () => getUserHoursByMonth(userId, allEvents),
    [userId, allEvents]
  );

  const conversationsData = useMemo(
    () => getUserConversationsByMonth(userId, allOutreachLogs),
    [userId, allOutreachLogs]
  );

  const formatDataForChart = (data: { month: string; count: number }[]) => {
    return data.map((d) => ({
      label: new Date(d.month + '-02').toLocaleString('default', {
        month: 'short',
      }),
      value: d.count,
    }));
  };

  return (
    <div className="grid grid-cols-1 gap-8">
      <LineChart data={formatDataForChart(hoursData)} title="Hours per Month" />
      <LineChart
        data={formatDataForChart(conversationsData)}
        title="Conversations per Month"
        lineColor="#000000"
      />
    </div>
  );
};

export default UserActivityChart;
