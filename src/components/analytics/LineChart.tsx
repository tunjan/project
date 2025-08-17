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
      <div className="border-2 border-black bg-white p-2 md:p-6">
        <h3 className="mb-2 text-lg font-bold text-black">{title}</h3>
        <div className="flex h-[300px] items-center justify-center text-neutral-500">
          Not enough data to display chart.
        </div>
      </div>
    );
  }

  return (
    <div className="border-2 border-black bg-white p-2 md:p-6">
      <h3 className="mb-2 text-lg font-bold text-black">{title}</h3>
      <div className="h-full w-full">
        <BaseChart data={data} width={250} height={150} padding={20}>
          {({ xScale, yScale }) => (
            <g>
              <polyline
                fill="none"
                stroke={lineColor}
                strokeWidth="3"
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
