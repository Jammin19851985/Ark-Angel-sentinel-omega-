
import React, { useState, useMemo } from 'react';
import { ForecastPoint } from '../../types';
import { ChartInfoOverlay, ChartInfo } from './ChartInfoOverlay';

interface LineChartProps {
    data: ForecastPoint[];
    showTrace?: boolean;
    showConfidence?: boolean;
    onPointSelect?: (point: ForecastPoint) => void;
    info?: ChartInfo;
}

const LineChart: React.FC<LineChartProps> = ({ 
    data, 
    showTrace = true, 
    showConfidence = false,
    onPointSelect,
    info
}) => {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    const validData = useMemo(() => {
        if (!Array.isArray(data)) return [];
        return data.filter(d => d && d.price != null);
    }, [data]);

    if (validData.length < 2) {
        return <div className="text-center text-slate-500 h-full flex items-center justify-center font-mono text-xs">Awaiting Predictive Stream Signal...</div>;
    }

    const width = 500;
    const height = 250;
    const padding = 20;
    const chartWidth = width - 2 * padding;
    const chartHeight = height - 2 * padding;

    const values = validData.map(d => d.price);
    const max = Math.max(...values);
    const min = Math.min(...values);
    const range = max - min === 0 ? 1 : max - min;
    
    const yBuffer = range * 0.1;
    const domainMax = max + yBuffer;
    const domainMin = min - yBuffer;
    const domainRange = Math.max(0.0001, domainMax - domainMin);

    const getX = (index: number) => (index / (validData.length - 1)) * chartWidth + padding;
    const getY = (price: number) => (height - padding) - ((price - domainMin) / domainRange) * chartHeight;

    const points = validData.map((point, i) => `${getX(i)},${getY(point.price)}`).join(' ');

    const areaPoints = [
        `${getX(0)},${height - padding}`,
        ...validData.map((point, i) => `${getX(i)},${getY(point.price)}`),
        `${getX(validData.length - 1)},${height - padding}`
    ].join(' ');

    const confidencePath = useMemo(() => {
        const upperPoints = validData.map((point, i) => `${getX(i)},${getY(point.price * 1.02)}`);
        const lowerPoints = validData.map((point, i) => `${getX(i)},${getY(point.price * 0.98)}`).reverse();
        return `${upperPoints.join(' ')} ${lowerPoints.join(' ')}`;
    }, [validData, getX, getY]);

    return (
        <div className="relative w-full h-full group/chart">
            <ChartInfoOverlay info={info} />
            
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
                <defs>
                    <linearGradient id="line-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
                    </linearGradient>
                    <filter id="glow-line" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {[...Array(6)].map((_, i) => {
                    const y = padding + (chartHeight / 5) * i;
                    return (
                        <line key={`grid-${i}`} x1={padding} y1={y} x2={width - padding} y2={y} stroke="#1e293b" strokeWidth="1" />
                    );
                })}
                {[...Array(6)].map((_, i) => {
                    const x = padding + (chartWidth / 5) * i;
                    return (
                        <line key={`vgrid-${i}`} x1={x} y1={padding} x2={x} y2={height - padding} stroke="#1e293b" strokeWidth="1" strokeDasharray="2,4" />
                    );
                })}

                {showConfidence && (
                    <polygon points={confidencePath} fill="#f59e0b" fillOpacity="0.05" />
                )}

                <polygon points={areaPoints} fill="url(#line-gradient)" />

                {showTrace && (
                    <polyline
                        points={points}
                        fill="none"
                        stroke="#f59e0b"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        filter="url(#glow-line)"
                        className="drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]"
                    />
                )}

                {validData.map((point, i) => {
                    const x = getX(i);
                    const y = getY(point.price);
                    const isHovered = hoveredIndex === i;

                    return (
                        <g 
                            key={`pt-${i}`} 
                            onMouseEnter={() => setHoveredIndex(i)}
                            onMouseLeave={() => setHoveredIndex(null)}
                            onClick={() => onPointSelect && onPointSelect(point)}
                            className="cursor-pointer"
                        >
                            {isHovered && <circle cx={x} cy={y} r={8} fill="#f59e0b" fillOpacity="0.3" filter="url(#glow-line)" />}
                            
                            <circle 
                                cx={x} 
                                cy={y} 
                                r={isHovered ? 4 : 2} 
                                fill="#fff" 
                                stroke="#f59e0b"
                                strokeWidth="2"
                                className="transition-all duration-200 ease-out"
                            />
                            <circle cx={x} cy={y} r={10} fill="transparent" />
                            
                            {isHovered && (
                                <g>
                                    <line x1={x} y1={padding} x2={x} y2={height - padding} stroke="#f59e0b" strokeWidth="1" strokeDasharray="4,2" />
                                    <rect x={x - 35} y={y - 45} width="70" height="30" rx="2" fill="#0f172a" stroke="#f59e0b" strokeWidth="1" />
                                    <text x={x} y={y - 26} textAnchor="middle" fontSize="10" fill="#fbbf24" className="font-mono font-bold">
                                        ${point.price.toFixed(2)}
                                    </text>
                                </g>
                            )}
                        </g>
                    );
                })}
            </svg>
        </div>
    );
};

export default LineChart;
