import React from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';

export interface HistogramData {
  range: string;
  count: number;
}

interface HistogramProps {
  data: HistogramData[];
  title: string;
  xAxisLabel: string;
  yAxisLabel?: string;
  barColor?: string;
}

const Histogram: React.FC<HistogramProps> = ({
  data,
  xAxisLabel,
  yAxisLabel = 'Frequency',
  barColor = 'hsl(var(--primary))',
}) => {
  if (data.length === 0) {
    return (
      <div className="flex h-[340px] items-center justify-center text-muted-foreground">
        Not enough data to display chart.
      </div>
    );
  }

  const chartConfig = {
    count: {
      label: yAxisLabel,
      color: barColor,
    },
  };

  return (
    <ChartContainer config={chartConfig} className="h-80 w-full">
      <BarChart
        data={data}
        margin={{ top: 20, right: 20, left: 0, bottom: 20 }}
        barCategoryGap="10%"
      >
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="range"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tick={{ fontSize: 12 }}
          label={{
            value: xAxisLabel,
            position: 'insideBottom',
            offset: -15,
            style: {
              textAnchor: 'middle',
              fontSize: '12px',
            },
          }}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tick={{ fontSize: 12 }}
          allowDecimals={false}
        />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent indicator="dot" />}
        />
        <Bar dataKey="count" fill="var(--color-count)" radius={4} />
      </BarChart>
    </ChartContainer>
  );
};

export default React.memo(Histogram);
