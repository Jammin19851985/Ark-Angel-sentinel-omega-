
import React, { useState, useMemo } from 'react';
import { ChartInfoOverlay, ChartInfo } from './ChartInfoOverlay';
import { PieChart as RechartsPieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

interface PieChartProps {
    data: { label: string; value: number }[];
    info?: ChartInfo;
}

const GRADIENTS = [
    { id: 'pie-grad-0', start: '#22d3ee', end: '#0891b2' }, 
    { id: 'pie-grad-1', start: '#a78bfa', end: '#7c3aed' }, 
    { id: 'pie-grad-2', start: '#fbbf24', end: '#d97706' }, 
    { id: 'pie-grad-3', start: '#34d399', end: '#059669' }, 
    { id: 'pie-grad-4', start: '#fb7185', end: '#e11d48' }, 
];

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-slate-900 border border-slate-700 p-2 rounded-sm shadow-lg backdrop-blur-sm z-50">
                <p className="font-mono text-xs text-white uppercase tracking-widest">{payload[0].name}</p>
                <p className="font-mono text-lg font-bold" style={{ color: payload[0].payload.fill }}>
                    {Number(payload[0].value).toLocaleString()}
                </p>
            </div>
        );
    }
    return null;
};

const PieChart: React.FC<PieChartProps> = ({ data, info }) => {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    
    const validData = useMemo(() => data?.filter(d => (d.value || 0) > 0) || [], [data]);

    if (!validData || validData.length === 0) return <div className="h-full flex items-center justify-center text-slate-600 font-mono text-[10px]">Awaiting Dataset...</div>;

    const total = validData.reduce((sum, item) => sum + (item.value || 0), 0);
    
    if (total <= 0) {
        return <div className="flex items-center justify-center h-full text-slate-500 font-mono text-xs uppercase tracking-widest">Zero Magnitude Event</div>;
    }

    return (
        <div className="relative w-full h-full flex flex-col items-center justify-center group/chart">
            <ChartInfoOverlay info={info} />
            <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                    <defs>
                        {GRADIENTS.map((g, i) => (
                            <linearGradient key={g.id} id={g.id} x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor={g.start} />
                                <stop offset="100%" stopColor={g.end} />
                            </linearGradient>
                        ))}
                    </defs>
                    <Pie
                        data={validData}
                        cx="50%"
                        cy="50%"
                        innerRadius="60%"
                        outerRadius="80%"
                        paddingAngle={2}
                        dataKey="value"
                        nameKey="label"
                        onMouseEnter={(_, index) => setHoveredIndex(index)}
                        onMouseLeave={() => setHoveredIndex(null)}
                        stroke="#050508"
                        strokeWidth={2}
                    >
                        {validData.map((entry, index) => {
                            const isHovered = hoveredIndex === index;
                            return (
                                <Cell 
                                    key={`cell-${index}`} 
                                    fill={`url(#${GRADIENTS[index % GRADIENTS.length].id})`} 
                                    style={{
                                        filter: isHovered ? 'drop-shadow(0px 0px 8px rgba(255,255,255,0.3))' : 'none',
                                        transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                                        transformOrigin: 'center center',
                                        transition: 'all 0.3s ease',
                                    }}
                                />
                            );
                        })}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                </RechartsPieChart>
            </ResponsiveContainer>

            {/* Inner text overlay */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none text-center z-10 w-24">
                {hoveredIndex !== null && validData[hoveredIndex] ? (
                    <div className="animate-fade-in-fast">
                        <div className="text-lg font-bold text-white font-mono drop-shadow-[0_0_5px_rgba(255,255,255,0.5)] truncate">
                            {validData[hoveredIndex].value.toLocaleString()}
                        </div>
                        <div className="text-[8px] text-cyan-400 font-mono tracking-widest uppercase truncate px-1">
                            {validData[hoveredIndex].label}
                        </div>
                    </div>
                ) : (
                    <div className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">
                        TOTAL<br/>
                        <span className="text-slate-300 text-[13px] font-bold">{total.toLocaleString()}</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PieChart;
