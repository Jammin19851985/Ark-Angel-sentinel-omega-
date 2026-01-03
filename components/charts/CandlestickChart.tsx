
import React from 'react';
import { CandlestickData } from '../../types';
import { ChartInfoOverlay, ChartInfo } from './ChartInfoOverlay';

interface CandlestickChartProps {
    data: CandlestickData[];
    info?: ChartInfo;
}

const CandlestickChart: React.FC<CandlestickChartProps> = ({ data, info }) => {
    const width = 500;
    const height = 250;
    const padding = 20;

    const maxPrice = Math.max(...data.map(d => d.high));
    const minPrice = Math.min(...data.map(d => d.low));
    const priceRange = maxPrice - minPrice;

    const xStep = (width - 2 * padding) / (data.length - 1);
    const candleWidth = Math.max(2, xStep * 0.6);

    const priceToY = (price: number) => height - padding - ((price - minPrice) / (priceRange || 1)) * (height - 2 * padding);

    return (
        <div className="relative w-full h-full group/chart">
            <ChartInfoOverlay info={info} />
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full text-slate-500 overflow-visible">
                <defs>
                    <filter id="glow-green" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                    <filter id="glow-red" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                    <linearGradient id="grad-green" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#10b981" stopOpacity="1" />
                        <stop offset="100%" stopColor="#059669" stopOpacity="0.6" />
                    </linearGradient>
                    <linearGradient id="grad-red" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#ef4444" stopOpacity="1" />
                        <stop offset="100%" stopColor="#b91c1c" stopOpacity="0.6" />
                    </linearGradient>
                </defs>

                {/* Grid Lines */}
                {[...Array(5)].map((_, i) => {
                    const price = minPrice + (priceRange / 4) * i;
                    const y = priceToY(price);
                    return (
                        <g key={i}>
                            <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="#1e293b" strokeWidth="1" strokeDasharray="4,4" />
                            <text x={width - padding + 5} y={y + 3} textAnchor="start" fontSize="9" fill="#64748b" className="font-mono">{price.toFixed(0)}</text>
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
                    
                    const bodyTop = Math.min(yOpen, yClose);
                    const bodyHeight = Math.max(1, Math.abs(yOpen - yClose));

                    return (
                        <g key={d.date} className="hover:opacity-80 transition-opacity cursor-crosshair group">
                            {/* High-Low Wick */}
                            <line 
                                x1={x} y1={yHigh} x2={x} y2={yLow} 
                                stroke={isBullish ? '#10B981' : '#EF4444'} 
                                strokeWidth="1.5"
                                className={isBullish ? 'filter-green' : 'filter-red'}
                            />
                            {/* Body */}
                            <rect
                                x={x - candleWidth / 2}
                                y={bodyTop}
                                width={candleWidth}
                                height={bodyHeight}
                                fill={isBullish ? 'url(#grad-green)' : 'url(#grad-red)'}
                                stroke={isBullish ? '#34d399' : '#f87171'}
                                strokeWidth="0.5"
                                rx="1"
                                filter={isBullish ? 'url(#glow-green)' : 'url(#glow-red)'}
                            />
                            {/* Hover Details */}
                            <g className="opacity-0 group-hover:opacity-100 transition-opacity">
                                <line x1={padding} y1={yClose} x2={width - padding} y2={yClose} stroke="#fff" strokeWidth="0.5" strokeDasharray="2,2" />
                                <text 
                                    x={width/2} 
                                    y={padding} 
                                    textAnchor="middle" 
                                    fontSize="10" 
                                    fill="#fff"
                                    className="font-mono bg-black/80 px-2 py-1"
                                >
                                    O:{d.open} H:{d.high} L:{d.low} C:{d.close}
                                </text>
                            </g>
                        </g>
                    );
                })}
            </svg>
        </div>
    );
};

export default CandlestickChart;
