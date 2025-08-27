import React from 'react';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

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
      <div className="border-2 border-black bg-white p-3 shadow-brutal">
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

const BarChart: React.FC<BarChartProps> = ({
  data,
  title,
  barColor = '#d81313',
}) => {
  // Transform data for Recharts format
  const chartData = data.map((item) => ({
    name: item.label,
    value: item.value,
    fill: item.color || barColor,
  }));

  return (
    <div className="border-2 border-black bg-white p-4 md:p-6">
      <h3 className="mb-4 text-lg font-bold text-black">{title}</h3>
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsBarChart
            data={chartData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 12, fill: '#000000' }}
              axisLine={{ stroke: '#000000' }}
              tickLine={{ stroke: '#000000' }}
            />
            <YAxis
              tick={{ fontSize: 12, fill: '#6b7280' }}
              axisLine={{ stroke: '#000000' }}
              tickLine={{ stroke: '#000000' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="value"
              fill={barColor}
              stroke="#000000"
              strokeWidth={1}
              radius={[2, 2, 0, 0]}
            />
          </RechartsBarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default BarChart;
