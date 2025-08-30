import React from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Label,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

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

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ payload: { count: number } }>;
  label?: string;
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="border-2 border-black bg-white p-3 shadow-brutal">
        <p className="font-bold text-black">{`Range: ${label}`}</p>
        <p className="text-primary">{`Count: ${payload[0].payload.count}`}</p>
      </div>
    );
  }
  return null;
};

const Histogram: React.FC<HistogramProps> = ({
  data,
  title,
  xAxisLabel,
  yAxisLabel = 'Frequency',
  barColor = '#6b7280',
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

  return (
    <div className="border-2 border-black bg-white p-4 md:p-6">
      <h3 className="mb-4 text-lg font-bold text-black">{title}</h3>
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 25 }}
            barCategoryGap="10%"
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="range"
              tick={{ fontSize: 12, fill: '#000000' }}
              axisLine={{ stroke: '#000000' }}
              tickLine={{ stroke: '#000000' }}
            >
              <Label
                value={xAxisLabel}
                position="insideBottom"
                offset={-15}
                style={{
                  textAnchor: 'middle',
                  fill: '#000000',
                  fontSize: '12px',
                }}
              />
            </XAxis>
            <YAxis
              allowDecimals={false}
              tick={{ fontSize: 12, fill: '#6b7280' }}
              axisLine={{ stroke: '#000000' }}
              tickLine={{ stroke: '#000000' }}
            >
              <Label
                value={yAxisLabel}
                angle={-90}
                position="insideLeft"
                style={{
                  textAnchor: 'middle',
                  fill: '#000000',
                  fontSize: '12px',
                }}
              />
            </YAxis>
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f3f4f6' }} />
            <Bar
              dataKey="count"
              fill={barColor}
              stroke="#000000"
              strokeWidth={1}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default React.memo(Histogram);
