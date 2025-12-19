
import React from 'react';
import { CandlestickData } from '../../types';

interface CandlestickChartProps {
    data: CandlestickData[];
}

const CandlestickChart: React.FC<CandlestickChartProps> = ({ data }) => {
    const width = 500;
    const height = 250;
    const padding = 20;

    const maxPrice = Math.max(...data.map(d => d.high));
    const minPrice = Math.min(...data.map(d => d.low));
    const priceRange = maxPrice - minPrice;

    const xStep = (width - 2 * padding) / (data.length - 1);
    const candleWidth = Math.max(2, xStep * 0.6); // Ensure visible width

    const priceToY = (price: number) => height - padding - ((price - minPrice) / (priceRange || 1)) * (height - 2 * padding);

    return (
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full text-slate-500 overflow-visible">
            <defs>
                <filter id="glow-green" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                    <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
                <filter id="glow-red" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                    <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
                <linearGradient id="grad-green" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#059669" stopOpacity="0.3" />
                </linearGradient>
                <linearGradient id="grad-red" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#b91c1c" stopOpacity="0.3" />
                </linearGradient>
            </defs>

            {/* Grid Lines */}
            {[...Array(5)].map((_, i) => {
                const price = minPrice + (priceRange / 4) * i;
                const y = priceToY(price);
                return (
                    <g key={i}>
                        <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="currentColor" strokeWidth="0.5" strokeDasharray="2,4" opacity="0.2" />
                        <text x={padding - 5} y={y + 3} textAnchor="end" fontSize="9" fill="currentColor" className="font-mono opacity-60">{price.toFixed(0)}</text>
                    </g>
                );
            })}

            {/* Candlesticks */}
            {data.map((d, i) => {
                const x = padding + i * xStep;
                const yHigh = priceToY(d.high);
                const yLow = priceToY(d.low);
                const yOpen = priceToY(d.open);
                const yClose = priceToY(d.close);
                const isBullish = d.close >= d.open;
                
                // For doji or very small candles, ensure min height of 1px
                const bodyTop = Math.min(yOpen, yClose);
                const bodyHeight = Math.max(1, Math.abs(yOpen - yClose));

                return (
                    <g key={d.date} className="hover:opacity-80 transition-opacity cursor-crosshair group">
                        {/* High-Low Wick */}
                        <line 
                            x1={x} y1={yHigh} x2={x} y2={yLow} 
                            stroke={isBullish ? '#10B981' : '#EF4444'} 
                            strokeWidth="1"
                            className={isBullish ? 'drop-shadow-[0_0_2px_rgba(16,185,129,0.5)]' : 'drop-shadow-[0_0_2px_rgba(239,68,68,0.5)]'}
                        />
                        {/* Body */}
                        <rect
                            x={x - candleWidth / 2}
                            y={bodyTop}
                            width={candleWidth}
                            height={bodyHeight}
                            fill={isBullish ? 'url(#grad-green)' : 'url(#grad-red)'}
                            stroke={isBullish ? '#10B981' : '#EF4444'}
                            strokeWidth="0.5"
                            rx="1"
                            filter={isBullish ? 'url(#glow-green)' : 'url(#glow-red)'}
                        />
                        {/* Hover Price Tag (Invisible unless hovered) */}
                        <text 
                            x={width/2} 
                            y={padding} 
                            textAnchor="middle" 
                            fontSize="10" 
                            fill={isBullish ? '#34d399' : '#f87171'} 
                            className="font-mono opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                        >
                            O:{d.open} H:{d.high} L:{d.low} C:{d.close}
                        </text>
                    </g>
                );
            })}
        </svg>
    );
};

export default CandlestickChart;
