import React from "react";
import { BaseChart } from "./BaseChart";

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
  barColor = "#d81313",
}) => {
  const barXScale = (index: number, chartWidth: number, padding: number) => {
    const barWidth = chartWidth / data.length;
    return padding + index * barWidth;
  };

  return (
    <div className="bg-white border border-black p-4 md:p-6">
      <h3 className="text-lg font-bold text-black mb-4">{title}</h3>
      <div className="w-full h-full">
        <BaseChart data={data} padding={40}>
          {({ yScale, chartWidth, chartHeight, maxValue }) => {
            const barWidth = chartWidth / data.length;
            const barMargin = barWidth * 0.2;
            const effectiveBarWidth = barWidth - barMargin;

            return (
              <g>
                {data.map((item, index) => {
                  const x = barXScale(index, chartWidth, 40);
                  const y = yScale(item.value);
                  const barHeight =
                    item.value === 0
                      ? 0
                      : (item.value / maxValue) * chartHeight;

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
