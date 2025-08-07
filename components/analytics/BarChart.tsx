import React from 'react';

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

const BarChart: React.FC<BarChartProps> = ({ data, title, barColor = '#d81313' }) => {
    const PADDING = 20;
    const SVG_WIDTH = 500;
    const SVG_HEIGHT = 300;
    const CHART_WIDTH = SVG_WIDTH - PADDING * 2;
    const CHART_HEIGHT = SVG_HEIGHT - PADDING * 2;
    
    const maxValue = Math.max(...data.map(d => d.value), 1); // Avoid division by zero
    const barWidth = CHART_WIDTH / data.length;
    const barMargin = 10;

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

                    {/* Bars and X-axis labels */}
                    {data.map((item, index) => {
                        const barHeight = item.value === 0 ? 0 : (item.value / maxValue) * CHART_HEIGHT;
                        const x = PADDING + index * barWidth;
                        const y = PADDING + CHART_HEIGHT - barHeight;
                        
                        return (
                            <g key={item.label}>
                                <rect 
                                    x={x + barMargin / 2} 
                                    y={y} 
                                    width={barWidth - barMargin} 
                                    height={barHeight} 
                                    fill={item.color || barColor}
                                />
                                <text 
                                    x={x + barWidth / 2} 
                                    y={CHART_HEIGHT + PADDING + 15} 
                                    textAnchor="middle" 
                                    fontSize="10" 
                                    fill="#111827"
                                    className="font-semibold"
                                >
                                    {item.label}
                                </text>
                                <text
                                    x={x + barWidth / 2}
                                    y={y - 5}
                                    textAnchor="middle"
                                    fontSize="10"
                                    fill="#111827"
                                    className="font-bold"
                                >
                                    {item.value}
                                </text>
                            </g>
                        )
                    })}
                </svg>
            </div>
        </div>
    );
};

export default BarChart;
