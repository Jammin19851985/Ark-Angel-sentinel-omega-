
import React, { useState } from 'react';
import { ChartInfoOverlay, ChartInfo } from './ChartInfoOverlay';

interface PieChartProps {
    data: { label: string; value: number }[];
    info?: ChartInfo;
}

const GRADIENTS = [
    { start: '#22d3ee', end: '#0891b2' }, 
    { start: '#a78bfa', end: '#7c3aed' }, 
    { start: '#fbbf24', end: '#d97706' }, 
    { start: '#34d399', end: '#059669' }, 
    { start: '#fb7185', end: '#e11d48' }, 
];

const PieChart: React.FC<PieChartProps> = ({ data, info }) => {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    
    if (!data || data.length === 0) return <div className="h-full flex items-center justify-center text-slate-600 font-mono text-[10px]">Awaiting Dataset...</div>;

    const total = data.reduce((sum, item) => sum + (item.value || 0), 0);
    
    if (total <= 0) {
        return <div className="flex items-center justify-center h-full text-slate-500 font-mono text-xs uppercase tracking-widest">Zero Magnitude Event</div>;
    }

    let startAngle = -90;
    const radius = 80;
    const cx = 125;
    const cy = 125;

    const getCoordinatesForPercent = (percent: number) => {
        if (isNaN(percent)) return [cx, cy];
        const x = cx + radius * Math.cos(2 * Math.PI * percent);
        const y = cy + radius * Math.sin(2 * Math.PI * percent);
        return [x, y];
    };

    return (
        <div className="relative w-full h-full flex items-center justify-center group/chart">
            <ChartInfoOverlay info={info} />
            <svg viewBox="0 0 250 250" className="w-2/3 h-full overflow-visible">
                <defs>
                    {GRADIENTS.map((g, i) => (
                        <linearGradient key={i} id={`pie-grad-${i}`} x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor={g.start} />
                            <stop offset="100%" stopColor={g.end} />
                        </linearGradient>
                    ))}
                    <filter id="pie-glow">
                        <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* Outer Ring */}
                <circle cx={cx} cy={cy} r={radius + 5} fill="none" stroke="#1e293b" strokeWidth="1" strokeDasharray="4 2" />

                {data.map((item, i) => {
                    const val = item.value || 0;
                    const slicePercentage = val / total;
                    const endAngle = startAngle + slicePercentage * 360;
                    
                    if (slicePercentage <= 0) return null;

                    const [startX, startY] = getCoordinatesForPercent(startAngle / 360);
                    const [endX, endY] = getCoordinatesForPercent(endAngle / 360);
                    const largeArcFlag = slicePercentage > 0.5 ? 1 : 0;

                    const pathData = [
                        `M ${cx} ${cy}`,
                        `L ${startX} ${startY}`,
                        `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`,
                        `Z`,
                    ].join(' ');

                    const isHovered = hoveredIndex === i;
                    const colorIndex = i % GRADIENTS.length;

                    startAngle = endAngle;

                    return (
                        <g key={`${item.label}-${i}`} 
                           onMouseEnter={() => setHoveredIndex(i)}
                           onMouseLeave={() => setHoveredIndex(null)}
                           className="transition-all duration-300 ease-out cursor-pointer"
                           style={{ transformOrigin: `${cx}px ${cy}px`, transform: isHovered ? 'scale(1.1)' : 'scale(1)' }}
                        >
                            <path 
                                d={pathData} 
                                fill={`url(#pie-grad-${colorIndex})`}
                                stroke="rgba(0,0,0,0.8)"
                                strokeWidth="2"
                                className="transition-all duration-300"
                                filter={isHovered ? 'url(#pie-glow)' : ''}
                            />
                        </g>
                    );
                })}
                
                <circle cx={cx} cy={cy} r={radius * 0.5} fill="#050508" stroke="#1e293b" strokeWidth="2" />
            </svg>

            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none text-center z-10">
                {hoveredIndex !== null && data[hoveredIndex] ? (
                    <div className="animate-fade-in-fast">
                        <div className="text-xl font-bold text-white font-mono drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]">
                            {data[hoveredIndex].value || 0}
                        </div>
                        <div className="text-[9px] text-cyan-400 font-mono tracking-widest uppercase">
                            {data[hoveredIndex].label}
                        </div>
                    </div>
                ) : (
                    <div className="text-xs text-slate-500 font-mono uppercase tracking-widest">
                        TOTAL<br/>
                        <span className="text-slate-300 text-sm font-bold">{total.toLocaleString()}</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PieChart;
