
import React from 'react';

interface BarChartProps {
    data: { label: string; value: number }[];
}

const BarChart: React.FC<BarChartProps> = ({ data }) => {
    const width = 500;
    const height = 250;
    const padding = 20;
    const barPadding = 10;

    const maxValue = Math.max(...data.map(d => d.value));
    const barWidth = (width - 2 * padding) / data.length - barPadding;

    const valueToY = (value: number) => height - padding - (value / (maxValue || 1)) * (height - 2 * padding);

    return (
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full text-slate-400 overflow-visible">
            <defs>
                <linearGradient id="bar-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.9" /> {/* Sky 500 */}
                    <stop offset="100%" stopColor="#0284c7" stopOpacity="0.2" /> {/* Sky 600 */}
                </linearGradient>
                <filter id="bar-glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                    <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>

            {/* Bars */}
            {data.map((d, i) => {
                const x = padding + i * (barWidth + barPadding);
                const y = valueToY(d.value);
                const barHeight = height - padding - y;
                
                return (
                    <g key={d.label} className="group">
                        {/* Glow effect on hover */}
                        <rect
                            x={x}
                            y={y}
                            width={barWidth}
                            height={barHeight}
                            fill="url(#bar-gradient)"
                            stroke="#38bdf8"
                            strokeWidth="0.5"
                            rx="2"
                            className="transition-all duration-300 group-hover:filter group-hover:url(#bar-glow) opacity-80 group-hover:opacity-100"
                        />
                        {/* Label */}
                        <text 
                            x={x + barWidth / 2} 
                            y={height - padding + 15} 
                            textAnchor="middle" 
                            fontSize="10" 
                            fill="currentColor"
                            className="font-mono opacity-70 group-hover:opacity-100 group-hover:fill-sky-300 transition-colors"
                        >
                            {d.label}
                        </text>
                        {/* Value (Floating above) */}
                        <text 
                            x={x + barWidth / 2} 
                            y={y - 5} 
                            textAnchor="middle" 
                            fontSize="10" 
                            className="font-mono fill-sky-200 opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0 duration-300"
                        >
                            {d.value}
                        </text>
                    </g>
                );
            })}
        </svg>
    );
};

export default BarChart;
