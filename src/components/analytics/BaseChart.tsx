import React from 'react';

interface BaseChartProps {
  data: { label: string; value: number }[];
  width?: number;
  height?: number;
  padding?: number;
  children: (props: {
    xScale: (index: number) => number;
    yScale: (value: number) => number;
    chartWidth: number;
    chartHeight: number;
    maxValue: number;
  }) => React.ReactNode;
}

const generateAxisTicks = (maxValue: number, tickCount: number): number[] => {
  if (maxValue === 0) return [0];
  const niceMaxValue = Math.ceil(maxValue / tickCount) * tickCount;
  const interval = niceMaxValue / tickCount;
  return Array.from({ length: tickCount + 1 }, (_, i) => i * interval);
};

export const BaseChart: React.FC<BaseChartProps> = ({
  data,
  width = 500,
  height = 300,
  padding = 40,
  children,
}) => {
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding;

  const dataMaxValue = Math.max(...data.map((d) => d.value), 0);
  const yAxisTicks = generateAxisTicks(dataMaxValue, 4);
  const axisMaxValue = yAxisTicks[yAxisTicks.length - 1] || 1;

  const yScale = (value: number) =>
    padding + chartHeight - (value / axisMaxValue) * chartHeight;
  const xScale = (index: number) => {
    if (data.length < 2) return padding;
    return padding + (index / (data.length - 1)) * chartWidth;
  };

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full font-sans">
      {}
      {yAxisTicks.map((tickValue) => {
        const y = yScale(tickValue);
        return (
          <g key={tickValue}>
            <text
              x={padding - 8}
              y={y + 4}
              textAnchor="end"
              fontSize="10"
              fill="#6b7280"
            >
              {tickValue}
            </text>
            <line
              x1={padding}
              y1={y}
              x2={width - padding}
              y2={y}
              stroke={tickValue === 0 ? '#111827' : '#e5e7eb'}
              strokeWidth="1"
              strokeDasharray={tickValue === 0 ? undefined : '2,2'}
            />
          </g>
        );
      })}

      {}
      {data.map((item, index) => (
        <text
          key={`label-${item.label}`}
          x={xScale(index)}
          y={height - 5}
          textAnchor="middle"
          fontSize="10"
          fill="#111827"
        >
          {item.label}
        </text>
      ))}

      {}
      {children({
        xScale,
        yScale,
        chartWidth,
        chartHeight,
        maxValue: axisMaxValue,
      })}
    </svg>
  );
};
