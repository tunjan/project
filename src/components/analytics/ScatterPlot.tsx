import React from 'react';
import { CartesianGrid, Scatter, ScatterChart, XAxis, YAxis } from 'recharts';

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';

export interface ScatterPlotData {
  label: string;
  x: number;
  y: number;
}

interface ScatterPlotProps {
  data: ScatterPlotData[];
  title: string;
  xAxisLabel: string;
  yAxisLabel: string;
}

const ScatterPlot: React.FC<ScatterPlotProps> = ({
  data,
  xAxisLabel,
  yAxisLabel,
}) => {
  if (data.length === 0) {
    return (
      <div className="flex h-[340px] items-center justify-center text-muted-foreground">
        Not enough data to display chart.
      </div>
    );
  }

  const chartData = data.map((item) => ({
    ...item,
    name: item.label,
  }));

  const chartConfig = {
    y: {
      label: yAxisLabel,
      color: 'hsl(var(--primary))',
    },
    x: {
      label: xAxisLabel,
      color: 'hsl(var(--muted-foreground))',
    },
  };

  return (
    <ChartContainer config={chartConfig} className="h-80 w-full">
      <ScatterChart
        data={chartData}
        margin={{
          top: 20,
          right: 20,
          left: 0,
          bottom: 20,
        }}
      >
        <CartesianGrid vertical={false} />
        <XAxis
          type="number"
          dataKey="x"
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
          type="number"
          dataKey="y"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tick={{ fontSize: 12 }}
        />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent labelKey="name" indicator="dot" />}
        />
        <Scatter dataKey="y" fill="var(--color-y)" radius={6} />
      </ScatterChart>
    </ChartContainer>
  );
};

export default React.memo(ScatterPlot);
