import React from 'react';
import { BaseChart } from './BaseChart';

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
  title,
  lineColor = '#c70f0f',
}) => {
  if (data.length === 0) {
    return (
      <div className="border border-black bg-white p-4 md:p-6">
        <h3 className="mb-4 text-lg font-bold text-black">{title}</h3>
        <div className="flex h-[300px] items-center justify-center text-neutral-500">
          Not enough data to display chart.
        </div>
      </div>
    );
  }

  const points = data
    .map((item, index, arr) => {
      if (arr.length < 2) return '';
      const x = 40 + (index / (arr.length - 1)) * (500 - 40 * 2);
      const maxValue = Math.max(...arr.map((d) => d.value), 0);
      const y = 40 + (300 - 40) - (item.value / (maxValue || 1)) * (300 - 40);
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="border border-black bg-white p-4 md:p-6">
      <h3 className="mb-4 text-lg font-bold text-black">{title}</h3>
      <div className="h-full w-full">
        <BaseChart data={data} width={500} height={300} padding={40}>
          {({ xScale, yScale }) => (
            <g>
              <polyline
                fill="none"
                stroke={lineColor}
                strokeWidth="2"
                points={data
                  .map((d, i) => `${xScale(i)},${yScale(d.value)}`)
                  .join(' ')}
              />
              {data.map((d, i) => (
                <circle
                  key={`dot-${i}`}
                  cx={xScale(i)}
                  cy={yScale(d.value)}
                  r="3"
                  fill={lineColor}
                />
              ))}
            </g>
          )}
        </BaseChart>
      </div>
    </div>
  );
};

export default LineChart;
