import React from 'react';
import { BaseChart } from './BaseChart';

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
  title,
  barColor = '#c70f0f',
}) => {
  const barXScale = (index: number, chartWidth: number, padding: number) => {
    const barWidth = chartWidth / data.length;
    return padding + index * barWidth;
  };

  return (
    <div className="border-2 border-black bg-white p-4 md:p-6">
      <h3 className="mb-4 text-lg font-bold text-black">{title}</h3>
      <div className="h-full w-full">
        <BaseChart data={data} padding={40}>
          {({ yScale, chartWidth }) => {
            const barWidth = chartWidth / data.length;
            const barMargin = barWidth * 0.2;
            const effectiveBarWidth = barWidth - barMargin;

            return (
              <g>
                {data.map((item, index) => {
                  const x = barXScale(index, chartWidth, 40);
                  const y = yScale(item.value);
                  // Corrected: Calculate height based on the y-scale function
                  const barHeight = yScale(0) - yScale(item.value);

                  return (
                    <g key={item.label}>
                      <rect
                        x={x + barMargin / 2}
                        y={y}
                        width={effectiveBarWidth}
                        height={barHeight}
                        fill={item.color || barColor}
                      />
                      <text
                        x={x + barWidth / 2}
                        y={y - 5}
                        textAnchor="middle"
                        fontSize="10"
                        fill="#111827"
                        className="font-bold"
                      >
                        {item.value.toLocaleString()}
                      </text>
                    </g>
                  );
                })}
              </g>
            );
          }}
        </BaseChart>
      </div>
    </div>
  );
};

export default BarChart;
