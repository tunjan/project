import React from 'react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

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

const CustomTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: ScatterPlotData }>;
}) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="shadow-brutal border-2 border-black bg-white p-3">
        <p className="font-bold text-black">{data.label}</p>
        <p className="text-primary">
          {data.y.toLocaleString()} conversations / {data.x.toLocaleString()}{' '}
          hours
        </p>
      </div>
    );
  }
  return null;
};

const ScatterPlot: React.FC<ScatterPlotProps> = ({
  data,
  title,
  xAxisLabel,
  yAxisLabel,
}) => {
  if (data.length === 0) {
    return (
      <div className="border-2 border-black bg-white p-4 md:p-6">
        <h3 className="mb-4 text-lg font-bold text-black">{title}</h3>
        <div className="flex h-[350px] items-center justify-center text-neutral-500">
          Not enough data to display chart.
        </div>
      </div>
    );
  }

  // Transform data for Recharts format
  const chartData = data.map((item) => ({
    ...item,
    name: item.label,
  }));

  return (
    <div className="border-2 border-black bg-white p-4 md:p-6">
      <h3 className="mb-4 text-lg font-bold text-black">{title}</h3>
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart
            data={chartData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 60,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              type="number"
              dataKey="x"
              name={xAxisLabel}
              tick={{ fontSize: 12, fill: '#111827' }}
              axisLine={{ stroke: '#111827' }}
              tickLine={{ stroke: '#111827' }}
              label={{
                value: xAxisLabel,
                position: 'insideBottom',
                offset: -10,
                style: {
                  textAnchor: 'middle',
                  fill: '#111827',
                  fontSize: '12px',
                },
              }}
            />
            <YAxis
              type="number"
              dataKey="y"
              name={yAxisLabel}
              tick={{ fontSize: 12, fill: '#6b7280' }}
              axisLine={{ stroke: '#111827' }}
              tickLine={{ stroke: '#111827' }}
              label={{
                value: yAxisLabel,
                angle: -90,
                position: 'insideLeft',
                style: {
                  textAnchor: 'middle',
                  fill: '#111827',
                  fontSize: '12px',
                },
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Scatter
              dataKey="y"
              fill="#c70f0f"
              stroke="#000000"
              strokeWidth={1}
              r={6}
            />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ScatterPlot;
