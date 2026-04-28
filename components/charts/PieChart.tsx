
import React, { useState } from 'react';

interface PieChartProps {
    data: { label: string; value: number }[];
}

// Nano-Bananas Gradient Palette
const GRADIENTS = [
    { start: '#0ea5e9', end: '#0c4a6e' }, // Sky
    { start: '#8b5cf6', end: '#4c1d95' }, // Violet
    { start: '#f59e0b', end: '#78350f' }, // Amber
    { start: '#10b981', end: '#064e3b' }, // Emerald
    { start: '#f43f5e', end: '#881337' }, // Rose
];

const PieChart: React.FC<PieChartProps> = ({ data }) => {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const total = data.reduce((sum, item) => sum + item.value, 0);
    
    if (total === 0) {
        return <div className="flex items-center justify-center h-full text-slate-500 font-mono text-xs">NO DATA TO SYNTHESIZE</div>;
    }

    let startAngle = -90;
    const radius = 80;
    const cx = 125;
    const cy = 125;

    const getCoordinatesForPercent = (percent: number) => {
        const x = cx + radius * Math.cos(2 * Math.PI * percent);
        const y = cy + radius * Math.sin(2 * Math.PI * percent);
        return [x, y];
    };

    return (
        <div className="w-full h-full flex items-center justify-center relative">
            <svg viewBox="0 0 250 250" className="w-2/3 h-full overflow-visible">
                <defs>
                    {GRADIENTS.map((g, i) => (
                        <linearGradient key={i} id={`pie-grad-${i}`} x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor={g.start} />
                            <stop offset="100%" stopColor={g.end} />
                        </linearGradient>
                    ))}
                    <filter id="pie-glow">
                        <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {data.map((item, i) => {
                    const slicePercentage = item.value / total;
                    const endAngle = startAngle + slicePercentage * 360;
                    
                    // Don't draw if 0 size
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

                    // Update angle for next slice
                    startAngle = endAngle;

                    return (
                        <g key={item.label} 
                           onMouseEnter={() => setHoveredIndex(i)}
                           onMouseLeave={() => setHoveredIndex(null)}
                           className="transition-all duration-300 ease-out cursor-pointer"
                           style={{ transformOrigin: `${cx}px ${cy}px`, transform: isHovered ? 'scale(1.05)' : 'scale(1)' }}
                        >
                            <path 
                                d={pathData} 
                                fill={`url(#pie-grad-${colorIndex})`}
                                stroke="rgba(0,0,0,0.5)"
                                strokeWidth="1"
                                className="transition-all duration-300"
                                filter={isHovered ? 'url(#pie-glow)' : ''}
                            />
                        </g>
                    );
                })}
                
                {/* Donut Hole */}
                <circle cx={cx} cy={cy} r={radius * 0.6} fill="#000000" fillOpacity="0.4" />
                <circle cx={cx} cy={cy} r={radius * 0.55} fill="transparent" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
            </svg>

            {/* Legend / Hover Info */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none text-center">
                {hoveredIndex !== null ? (
                    <div className="animate-fade-in-fast">
                        <div className="text-xl font-bold text-white font-mono drop-shadow-md">
                            {data[hoveredIndex].value}
                        </div>
                        <div className="text-[10px] text-slate-300 font-mono tracking-widest uppercase">
                            {data[hoveredIndex].label}
                        </div>
                    </div>
                ) : (
                    <div className="text-xs text-slate-500 font-mono">
                        TOTAL<br/>{total}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PieChart;
