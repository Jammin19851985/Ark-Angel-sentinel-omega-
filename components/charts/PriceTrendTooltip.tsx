
import React from 'react';

interface PriceTrendTooltipProps {
    history: number[];
}

const PriceTrendTooltip: React.FC<PriceTrendTooltipProps> = ({ history }) => {
    if (history.length < 2) return null;

    const width = 120;
    const height = 50;
    const padding = 5;

    const maxPrice = Math.max(...history);
    const minPrice = Math.min(...history);
    const priceRange = maxPrice - minPrice;

    const points = history.map((price, i) => {
        const x = (i / (history.length - 1)) * (width - 2 * padding) + padding;
        const y = (height - padding) - ((price - minPrice) / (priceRange || 1)) * (height - 2 * padding);
        return `${x},${y}`;
    }).join(' ');
    
    const isUp = history[history.length - 1] > history[0];
    const colorClass = isUp ? 'text-green-400' : 'text-red-400';

    return (
        <div className="absolute z-10 -top-4 left-full ml-2 w-40 p-2 bg-slate-800 border border-slate-700 rounded-md shadow-lg pointer-events-none animate-fade-in-fast" role="tooltip">
            <div className="text-xs text-slate-300 font-mono mb-1">Recent Trend</div>
            <div className="h-12 -mx-1">
                <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full" preserveAspectRatio="none">
                    <polyline
                        fill="none"
                        stroke="currentColor"
                        className={colorClass}
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        points={points}
                        vectorEffect="non-scaling-stroke"
                    />
                </svg>
            </div>
            <div className="flex justify-between text-xs text-slate-500 font-mono">
                <span>L: {minPrice.toFixed(2)}</span>
                <span>H: {maxPrice.toFixed(2)}</span>
            </div>
        </div>
    );
};

export default PriceTrendTooltip;
