import React, { useState } from 'react';

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

const generateAxisTicks = (maxValue: number, tickCount: number): number[] => {
  if (maxValue === 0) return [0];
  const power = Math.pow(10, Math.floor(Math.log10(maxValue)));
  const range = Math.ceil(maxValue / power) * power;
  const interval = Math.ceil(range / tickCount / power) * power;
  const niceMaxValue = interval * tickCount;
  return Array.from({ length: tickCount + 1 }, (_, i) => i * interval);
};

const ScatterPlot: React.FC<ScatterPlotProps> = ({
  data,
  title,
  xAxisLabel,
  yAxisLabel,
}) => {
  const [tooltip, setTooltip] = useState<{
    data: ScatterPlotData;
    x: number;
    y: number;
  } | null>(null);

  const width = 500;
  const height = 350;
  const padding = { top: 20, right: 20, bottom: 60, left: 60 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const xMax = Math.max(...data.map((d) => d.x), 0);
  const yMax = Math.max(...data.map((d) => d.y), 0);

  const xTicks = generateAxisTicks(xMax, 5);
  const yTicks = generateAxisTicks(yMax, 5);

  const xMaxAxis = xTicks[xTicks.length - 1] || 1;
  const yMaxAxis = yTicks[yTicks.length - 1] || 1;

  const xScale = (value: number) => (value / xMaxAxis) * chartWidth;
  const yScale = (value: number) =>
    chartHeight - (value / yMaxAxis) * chartHeight;

  if (data.length === 0) {
    return (
      <div className="border border-black bg-white p-4 md:p-6">
        <h3 className="mb-4 text-lg font-bold text-black">{title}</h3>
        <div className="flex h-[350px] items-center justify-center text-neutral-500">
          Not enough data to display chart.
        </div>
      </div>
    );
  }

  return (
    <div className="relative border border-black bg-white p-4 md:p-6">
      <h3 className="mb-4 text-lg font-bold text-black">{title}</h3>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full font-sans">
        <g transform={`translate(${padding.left}, ${padding.top})`}>
          {}
          {yTicks.map((tick) => (
            <g key={`y-${tick}`} transform={`translate(0, ${yScale(tick)})`}>
              <line x2={-6} stroke="#6b7280" />
              <text
                dy=".32em"
                x={-9}
                textAnchor="end"
                fontSize="10"
                fill="#6b7280"
              >
                {tick}
              </text>
              <line
                x1={chartWidth}
                x2={0}
                stroke="#e5e7eb"
                strokeDasharray="2,2"
              />
            </g>
          ))}
          <text
            transform="rotate(-90)"
            y={-padding.left + 20}
            x={-chartHeight / 2}
            textAnchor="middle"
            fontSize="12"
            fill="#111827"
          >
            {yAxisLabel}
          </text>

          {}
          {xTicks.map((tick) => (
            <g
              key={`x-${tick}`}
              transform={`translate(${xScale(tick)}, ${chartHeight})`}
            >
              <line y2={6} stroke="#6b7280" />
              <text
                y={9}
                dy=".71em"
                textAnchor="middle"
                fontSize="10"
                fill="#6b7280"
              >
                {tick}
              </text>
            </g>
          ))}
          <text
            y={chartHeight + padding.bottom - 15}
            x={chartWidth / 2}
            textAnchor="middle"
            fontSize="12"
            fill="#111827"
          >
            {xAxisLabel}
          </text>

          {}
          {data.map((d) => (
            <circle
              key={d.label}
              cx={xScale(d.x)}
              cy={yScale(d.y)}
              r={5}
              fill="#c70f0f"
              className="cursor-pointer opacity-70 transition-opacity hover:opacity-100"
              onMouseEnter={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const containerRect = e.currentTarget
                  .closest('div.relative')
                  ?.getBoundingClientRect();
                if (!containerRect) return;

                setTooltip({
                  data: d,
                  x: rect.left - containerRect.left + 15,
                  y: rect.top - containerRect.top - 10,
                });
              }}
              onMouseLeave={() => setTooltip(null)}
            />
          ))}
        </g>
      </svg>
      {tooltip && (
        <div
          className="pointer-events-none absolute rounded bg-black px-3 py-1.5 text-sm text-white shadow-lg"
          style={{
            left: tooltip.x,
            top: tooltip.y,
            transform: 'translateY(-100%)',
          }}
        >
          <p className="font-bold">{tooltip.data.label}</p>
          <p>
            {tooltip.data.y.toLocaleString()} convos /{' '}
            {tooltip.data.x.toLocaleString()} hrs
          </p>
        </div>
      )}
    </div>
  );
};

export default ScatterPlot;
