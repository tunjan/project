import React from 'react';
import {
  CartesianGrid,
  Line,
  LineChart as RechartsLineChart,
  XAxis,
  YAxis,
} from 'recharts';

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';

export interface LineChartData {
  label: string;
  value: number;
}

interface LineChartProps {
  data: LineChartData[];
  title: string;
  lineColor?: string;
}

const LineChart: React.FC<LineChartProps> = ({
  data,
  lineColor = 'hsl(var(--primary))',
}) => {
  if (data.length === 0) {
    return (
      <div className="flex h-[192px] items-center justify-center text-muted-foreground">
        Not enough data to display chart.
      </div>
    );
  }

  const chartData = data.map((item) => ({
    name: item.label,
    value: item.value,
  }));

  const chartConfig = {
    value: {
      label: 'Value',
      color: lineColor,
    },
  };

  return (
    <ChartContainer config={chartConfig} className="h-48 w-full">
      <RechartsLineChart
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
        <Line
          dataKey="value"
          type="monotone"
          stroke="var(--color-value)"
          strokeWidth={2}
          dot={false}
        />
      </RechartsLineChart>
    </ChartContainer>
  );
};

export default React.memo(LineChart);
