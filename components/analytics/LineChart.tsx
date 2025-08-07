import React from 'react';

export interface LineChartData {
    label: string;
    value: number;
}

interface LineChartProps {
    data: LineChartData[];
    title: string;
    lineColor?: string;
}

const LineChart: React.FC<LineChartProps> = ({ data, title, lineColor = '#d81313' }) => {
    const PADDING = 20;
    const SVG_WIDTH = 500;
    const SVG_HEIGHT = 300;
    const CHART_WIDTH = SVG_WIDTH - PADDING * 2;
    const CHART_HEIGHT = SVG_HEIGHT - PADDING * 2;
    
    if (data.length < 2) {
        return (
            <div className="bg-white border border-black p-4 md:p-6">
                <h3 className="text-lg font-bold text-black mb-4">{title}</h3>
                <div className="flex items-center justify-center h-full text-neutral-500">
                    Not enough data to display chart.
                </div>
            </div>
        );
    }

    const maxValue = Math.max(...data.map(d => d.value), 1); // Avoid division by zero
    
    const points = data.map((item, index) => {
        const x = PADDING + (index / (data.length - 1)) * CHART_WIDTH;
        const y = PADDING + CHART_HEIGHT - ((item.value / maxValue) * CHART_HEIGHT);
        return `${x},${y}`;
    }).join(' ');

    return (
        <div className="bg-white border border-black p-4 md:p-6">
            <h3 className="text-lg font-bold text-black mb-4">{title}</h3>
            <div className="w-full h-full">
                <svg viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`} className="w-full font-sans">
                    {/* Y-axis labels */}
                    <text x={PADDING - 5} y={PADDING + 4} textAnchor="end" fontSize="10" fill="#6b7280">{maxValue}</text>
                    <line x1={PADDING} y1={PADDING} x2={SVG_WIDTH - PADDING} y2={PADDING} stroke="#e5e7eb" strokeWidth="1" />
                    <text x={PADDING - 5} y={CHART_HEIGHT / 2 + PADDING + 4} textAnchor="end" fontSize="10" fill="#6b7280">{Math.round(maxValue / 2)}</text>
                    <line x1={PADDING} y1={CHART_HEIGHT / 2 + PADDING} x2={SVG_WIDTH - PADDING} y2={CHART_HEIGHT / 2 + PADDING} stroke="#e5e7eb" strokeWidth="1" strokeDasharray="2,2"/>
                    <text x={PADDING - 5} y={CHART_HEIGHT + PADDING} textAnchor="end" fontSize="10" fill="#6b7280">0</text>
                    <line x1={PADDING} y1={CHART_HEIGHT + PADDING} x2={SVG_WIDTH - PADDING} y2={CHART_HEIGHT + PADDING} stroke="#111827" strokeWidth="1" />

                    {/* Line and points */}
                    <polyline fill="none" stroke={lineColor} strokeWidth="2" points={points} />
                    {data.map((item, index) => {
                         const x = PADDING + (index / (data.length - 1)) * CHART_WIDTH;
                         const y = PADDING + CHART_HEIGHT - ((item.value / maxValue) * CHART_HEIGHT);
                         return (
                            <g key={item.label}>
                                <circle cx={x} cy={y} r="3" fill={lineColor} />
                                 <text 
                                    x={x} 
                                    y={CHART_HEIGHT + PADDING + 15} 
                                    textAnchor="middle" 
                                    fontSize="10" 
                                    fill="#111827"
                                >
                                    {item.label}
                                </text>
                            </g>
                         )
                    })}
                </svg>
            </div>
        </div>
    );
};

export default LineChart;
