import React from 'react';
import {
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from 'recharts';

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';

export interface BarChartData {
  label: string;
  value: number;
  color?: string;
}

interface BarChartProps {
  data: BarChartData[];
  title: string;
  barColor?: string;
}

const BarChart: React.FC<BarChartProps> = ({
  data,
  barColor = 'hsl(var(--primary))',
}) => {
  const chartData = data.map((item) => ({
    name: item.label,
    value: item.value,
    fill: item.color || barColor,
  }));

  const chartConfig = {
    value: {
      label: 'Value',
      color: barColor,
    },
  };

  return (
    <ChartContainer config={chartConfig} className="h-80 w-full">
      <RechartsBarChart
        data={chartData}
        margin={{
          top: 20,
          right: 20,
          left: 0,
          bottom: 5,
        }}
      >
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="name"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tick={{ fontSize: 12 }}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tick={{ fontSize: 12 }}
        />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent indicator="dot" />}
        />
        <Bar dataKey="value" radius={4} />
      </RechartsBarChart>
    </ChartContainer>
  );
};

export default React.memo(BarChart);
