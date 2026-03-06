import React from 'react';

interface SparklineProps {
    data: number[];
    color?: string;
    width?: number;
    height?: number;
    strokeWidth?: number;
    fill?: boolean; // Optional area fill
}

export const Sparkline: React.FC<SparklineProps> = ({ 
    data, 
    color = '#f59e0b', 
    width = 60, 
    height = 20,
    strokeWidth = 1.5,
    fill = false
}) => {
    if (!data || data.length < 2) return null;

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;

    // Buffer for aesthetics
    const drawHeight = height - 4; 
    const paddingY = 2;

    const points = data.map((val, i) => {
        const x = (i / (data.length - 1)) * width;
        // Invert Y because SVG 0 is top
        const y = (height - paddingY) - ((val - min) / range) * drawHeight;
        return `${x},${y}`;
    }).join(' ');

    const fillPoints = fill 
        ? `${points} ${width},${height} 0,${height}` 
        : '';

    return (
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
            {fill && (
                <polygon 
                    points={fillPoints} 
                    fill={color} 
                    fillOpacity="0.1" 
                />
            )}
            <polyline
                fill="none"
                stroke={color}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeLinejoin="round"
                points={points}
                vectorEffect="non-scaling-stroke"
            />
        </svg>
    );
};
