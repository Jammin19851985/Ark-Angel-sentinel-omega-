
import React, { useState, useMemo } from 'react';
import { ForecastPoint } from '../../types';

interface LineChartProps {
    data: ForecastPoint[];
    showTrace?: boolean;
    showConfidence?: boolean;
    onPointSelect?: (point: ForecastPoint) => void;
}

const LineChart: React.FC<LineChartProps> = ({ 
    data, 
    showTrace = true, 
    showConfidence = false,
    onPointSelect 
}) => {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    if (data.length < 2) {
        return <div className="text-center text-slate-500 h-full flex items-center justify-center font-mono text-xs">Insufficient data for visualization.</div>;
    }

    const width = 500;
    const height = 250;
    const padding = 20;
    const chartWidth = width - 2 * padding;
    const chartHeight = height - 2 * padding;

    const values = data.map(d => d.price);
    const max = Math.max(...values);
    const min = Math.min(...values);
    const range = max - min === 0 ? 1 : max - min;
    
    // Add a little buffer to the Y domain so points aren't on the edge
    const yBuffer = range * 0.1;
    const domainMax = max + yBuffer;
    const domainMin = min - yBuffer;
    const domainRange = domainMax - domainMin;

    const getX = (index: number) => (index / (data.length - 1)) * chartWidth + padding;
    const getY = (price: number) => (height - padding) - ((price - domainMin) / domainRange) * chartHeight;

    // Generate Line Path
    const points = data.map((point, i) => `${getX(i)},${getY(point.price)}`).join(' ');

    // Generate Gradient Area Path for "Nano" look
    const areaPoints = [
        `${getX(0)},${height - padding}`,
        ...data.map((point, i) => `${getX(i)},${getY(point.price)}`),
        `${getX(data.length - 1)},${height - padding}`
    ].join(' ');

    // Generate Confidence Interval Path (Simulated +/- 2% for visual effect)
    const confidencePath = useMemo(() => {
        const getX_internal = (index: number) => (index / (data.length - 1)) * chartWidth + padding;
        const getY_internal = (price: number) => (height - padding) - ((price - domainMin) / domainRange) * chartHeight;

        const upperPoints = data.map((point, i) => `${getX_internal(i)},${getY_internal(point.price * 1.02)}`);
        const lowerPoints = data.map((point, i) => `${getX_internal(i)},${getY_internal(point.price * 0.98)}`).reverse();
        return `${upperPoints.join(' ')} ${lowerPoints.join(' ')}`;
    }, [data, chartWidth, padding, domainMin, domainRange, chartHeight]);

    return (
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
            <defs>
                <linearGradient id="line-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
                </linearGradient>
                <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                    <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>

            {/* Grid Lines */}
            {[...Array(5)].map((_, i) => {
                const y = padding + (chartHeight / 4) * i;
                return (
                    <line key={`grid-${i}`} x1={padding} y1={y} x2={width - padding} y2={y} stroke="#334155" strokeWidth="0.5" strokeDasharray="4,4" />
                );
            })}

            {/* Confidence Interval */}
            {showConfidence && (
                <polygon points={confidencePath} fill="#f59e0b" fillOpacity="0.1" />
            )}

            {/* Area under curve */}
            <polygon points={areaPoints} fill="url(#line-gradient)" />

            {/* The Line */}
            {showTrace && (
                <polyline
                    points={points}
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    filter="url(#glow)"
                />
            )}

            {/* Interactive Points */}
            {data.map((point, i) => {
                const x = getX(i);
                const y = getY(point.price);
                const isHovered = hoveredIndex === i;

                return (
                    <g 
                        key={i} 
                        onMouseEnter={() => setHoveredIndex(i)}
                        onMouseLeave={() => setHoveredIndex(null)}
                        onClick={() => onPointSelect && onPointSelect(point)}
                        className="cursor-pointer"
                    >
                        <circle 
                            cx={x} 
                            cy={y} 
                            r={isHovered ? 6 : 3} 
                            fill="#fcd34d" 
                            className="transition-all duration-200 ease-out"
                        />
                        {/* Invisible larger target for easier hovering */}
                        <circle cx={x} cy={y} r={10} fill="transparent" />
                        
                        {isHovered && (
                            <g>
                                <rect x={x - 30} y={y - 35} width="60" height="25" rx="4" fill="#1e293b" stroke="#475569" strokeWidth="1" />
                                <text x={x} y={y - 18} textAnchor="middle" fontSize="10" fill="#cbd5e1" className="font-mono">
                                    ${point.price.toFixed(0)}
                                </text>
                            </g>
                        )}
                    </g>
                );
            })}
        </svg>
    );
};

export default LineChart;
