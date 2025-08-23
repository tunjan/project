import React from 'react';
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export interface LineChartData {
  label: string;
  value: number;
}

interface LineChartProps {
  data: LineChartData[];
  title: string;
  lineColor?: string;
}

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="shadow-brutal border-2 border-black bg-white p-3">
        <p className="font-bold text-black">{label}</p>
        <p className="text-primary">
          Value:{' '}
          <span className="font-bold">{payload[0].value.toLocaleString()}</span>
        </p>
      </div>
    );
  }
  return null;
};

const LineChart: React.FC<LineChartProps> = ({
  data,
  title,
  lineColor = '#c70f0f',
}) => {
  if (data.length === 0) {
    return (
      <div className="border-2 border-black bg-white p-4 md:p-6">
        <h3 className="mb-4 text-lg font-bold text-black">{title}</h3>
        <div className="flex h-[300px] items-center justify-center text-neutral-500">
          Not enough data to display chart.
        </div>
      </div>
    );
  }

  // Transform data for Recharts format
  const chartData = data.map((item) => ({
    name: item.label,
    value: item.value,
  }));

  return (
    <div className="border-2 border-black bg-white p-4 md:p-6">
      <h3 className="mb-4 text-lg font-bold text-black">{title}</h3>
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsLineChart
            data={chartData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 12, fill: '#111827' }}
              axisLine={{ stroke: '#111827' }}
              tickLine={{ stroke: '#111827' }}
            />
            <YAxis
              tick={{ fontSize: 12, fill: '#6b7280' }}
              axisLine={{ stroke: '#111827' }}
              tickLine={{ stroke: '#111827' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="value"
              stroke={lineColor}
              strokeWidth={3}
              dot={{ fill: lineColor, strokeWidth: 2, r: 4 }}
              activeDot={{
                r: 6,
                stroke: lineColor,
                strokeWidth: 2,
                fill: '#ffffff',
              }}
            />
          </RechartsLineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default LineChart;
