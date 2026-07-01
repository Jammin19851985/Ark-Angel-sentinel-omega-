
import React, { useState, useMemo } from 'react';
import { ForecastPoint } from '../../types';
import { ChartInfoOverlay, ChartInfo } from './ChartInfoOverlay';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, ReferenceLine } from 'recharts';

interface LineChartProps {
    data: ForecastPoint[];
    showTrace?: boolean;
    showConfidence?: boolean;
    onPointSelect?: (point: ForecastPoint) => void;
    info?: ChartInfo;
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-slate-900 border border-amber-500/50 p-2 rounded-sm shadow-lg backdrop-blur-sm z-50">
                <p className="font-mono text-xs text-slate-300 font-bold mb-1 shadow-[0_0_8px_rgba(245,158,11,0.3)]">{label}</p>
                <div className="flex flex-col space-y-1">
                    {payload.map((entry: any, index: number) => (
                        <p key={index} className="font-mono text-xs flex justify-between gap-4" style={{ color: entry.color }}>
                            <span>{entry.name}:</span>
                            <span className="font-bold">${Number(entry.value).toFixed(2)}</span>
                        </p>
                    ))}
                </div>
            </div>
        );
    }
    return null;
};

const LineChart: React.FC<LineChartProps> = ({ 
    data, 
    showTrace = true, 
    showConfidence = false,
    onPointSelect,
    info
}) => {
    const validData = useMemo(() => {
        if (!Array.isArray(data)) return [];
        return data.filter(d => d && d.price != null).map(d => ({
            ...d,
            upperConf: d.price * 1.02,
            lowerConf: d.price * 0.98,
        }));
    }, [data]);

    if (validData.length < 2) {
        return <div className="text-center text-slate-500 h-full flex items-center justify-center font-mono text-xs">Awaiting Predictive Stream Signal...</div>;
    }

    const minPrice = Math.min(...validData.map(d => d.lowerConf || d.price));
    const maxPrice = Math.max(...validData.map(d => d.upperConf || d.price));
    const domainPadding = (maxPrice - minPrice) * 0.1;

    return (
        <div className="relative w-full h-full group/chart">
            <ChartInfoOverlay info={info} />
            
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart 
                    data={validData} 
                    margin={{ top: 20, right: 10, left: -20, bottom: 0 }}
                    onClick={(e: any) => {
                        if (e && e.activePayload && onPointSelect) {
                            onPointSelect(e.activePayload[0].payload as ForecastPoint);
                        }
                    }}
                >
                    <defs>
                        <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.5}/>
                            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                        </linearGradient>
                        <filter id="glow-neon" x="-20%" y="-20%" width="140%" height="140%">
                            <feGaussianBlur stdDeviation="2" result="blur" />
                            <feMerge>
                                <feMergeNode in="blur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>
                    
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={true} horizontal={true} />
                    <XAxis 
                        dataKey="date" 
                        stroke="#475569" 
                        fontSize={10} 
                        tickLine={false}
                        axisLine={false}
                        tick={{ fontFamily: 'monospace', fill: '#64748b' }}
                        tickFormatter={(val) => val.split(' ')[0]} 
                    />
                    <YAxis 
                        domain={[minPrice - domainPadding, maxPrice + domainPadding]} 
                        stroke="#475569"
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                        tick={{ fontFamily: 'monospace', fill: '#64748b' }}
                        tickFormatter={(val) => `$${val.toFixed(0)}`}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#f59e0b', strokeWidth: 1, strokeDasharray: '4 4' }} />

                    {showConfidence && (
                        <>
                            <Area type="monotone" dataKey="upperConf" stroke="none" fill="#f59e0b" fillOpacity={0.05} activeDot={false} />
                            <Area type="monotone" dataKey="lowerConf" stroke="none" fill="#000" fillOpacity={0.5} activeDot={false} />
                        </>
                    )}

                    <Area 
                        type="monotone" 
                        dataKey="price" 
                        name="Projected Price"
                        stroke={showTrace ? "#f59e0b" : "none"}
                        strokeWidth={showTrace ? 2 : 0}
                        fillOpacity={1}
                        fill="url(#colorPrice)"
                        filter="url(#glow-neon)"
                        activeDot={{ r: 6, fill: '#fff', stroke: '#f59e0b', strokeWidth: 2 }}
                        style={{ filter: showTrace ? 'drop-shadow(0 0 6px rgba(245,158,11,0.5))' : 'none' }}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

export default LineChart;
