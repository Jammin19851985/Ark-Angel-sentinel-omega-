
import React from 'react';
import { ChartInfoOverlay, ChartInfo } from './ChartInfoOverlay';

interface BarChartProps {
    data: { label: string; value: number }[];
    info?: ChartInfo;
}

const BarChart: React.FC<BarChartProps> = ({ data, info }) => {
    if (!data || data.length === 0) return <div className="h-full flex items-center justify-center text-slate-600 font-mono text-[10px]">Awaiting Dataset Ingest...</div>;

    const width = 500;
    const height = 250;
    const padding = 20;
    const barPadding = 15;

    const validValues = data.map(d => d.value || 0);
    const maxValue = Math.max(...validValues, 1); // Ensure max is at least 1 to prevent div by zero
    const barWidth = Math.max(1, (width - 2 * padding) / data.length - barPadding);

    const valueToY = (value: number) => height - padding - ((value || 0) / maxValue) * (height - 2 * padding);

    return (
        <div className="relative w-full h-full group/chart">
            <ChartInfoOverlay info={info} />
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full text-slate-400 overflow-visible">
                <defs>
                    <linearGradient id="bar-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.9" /> 
                        <stop offset="100%" stopColor="#083344" stopOpacity="0.4" /> 
                    </linearGradient>
                    <filter id="bar-glow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* Horizontal Grid */}
                {[...Array(5)].map((_, i) => {
                    const y = height - padding - ((height - 2 * padding) / 4) * i;
                    return <line key={i} x1={padding} y1={y} x2={width - padding} y2={y} stroke="#1e293b" strokeWidth="1" />;
                })}

                {/* Bars */}
                {data.map((d, i) => {
                    const x = padding + i * (barWidth + barPadding) + barPadding / 2;
                    const y = valueToY(d.value);
                    const barHeight = Math.max(0, height - padding - y);
                    
                    return (
                        <g key={`${d.label}-${i}`} className="group">
                            <rect
                                x={x}
                                y={y}
                                width={barWidth}
                                height={barHeight}
                                fill="url(#bar-gradient)"
                                stroke="#22d3ee"
                                strokeWidth="1"
                                rx="2"
                                className="transition-all duration-300 opacity-80 group-hover:opacity-100 group-hover:filter group-hover:url(#bar-glow)"
                            />
                            <text 
                                x={x + barWidth / 2} 
                                y={height - padding + 15} 
                                textAnchor="middle" 
                                fontSize="10" 
                                fill="currentColor"
                                className="font-mono opacity-70 group-hover:opacity-100 group-hover:fill-cyan-300 transition-colors uppercase tracking-wider"
                            >
                                {d.label}
                            </text>
                            <text 
                                x={x + barWidth / 2} 
                                y={y - 8} 
                                textAnchor="middle" 
                                fontSize="11" 
                                className="font-mono fill-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0 duration-300 font-bold"
                            >
                                {d.value || 0}
                            </text>
                        </g>
                    );
                })}
            </svg>
        </div>
    );
};

export default BarChart;
