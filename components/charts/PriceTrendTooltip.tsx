
import React, { useState, useMemo } from 'react';

interface PriceTrendTooltipProps {
    history: number[];
}

const PriceTrendTooltip: React.FC<PriceTrendTooltipProps> = ({ history }) => {
    const [hoveredCandle, setHoveredCandle] = useState<number | null>(null);

    // Generate synthetic OHLC from price history
    const candles = useMemo(() => {
        return history.map((close, i, arr) => {
            const prevClose = i === 0 ? close : arr[i - 1];
            // Add some synthetic volatility for visual interest
            const volatility = close * 0.002;
            const open = prevClose;
            const isUp = close >= open;
            const high = Math.max(open, close) + (Math.random() * volatility);
            const low = Math.min(open, close) - (Math.random() * volatility);
            return { open, high, low, close, isUp, index: i };
        });
    }, [history]);

    if (candles.length < 2) return null;

    const width = 180;
    const height = 80;
    const padding = 10;
    
    const maxPrice = Math.max(...candles.map(c => c.high));
    const minPrice = Math.min(...candles.map(c => c.low));
    const priceRange = maxPrice - minPrice;

    const getY = (price: number) => (height - padding) - ((price - minPrice) / (priceRange || 1)) * (height - 2 * padding);

    const candleWidth = Math.max(2, (width - 2 * padding) / candles.length - 1);

    const activeCandle = hoveredCandle !== null ? candles[hoveredCandle] : candles[candles.length - 1];

    return (
        <div 
            className="absolute z-50 -top-8 left-[90%] ml-2 w-52 p-3 bg-black/90 backdrop-blur-xl border border-cyan-500/30 rounded-lg shadow-[0_0_20px_rgba(0,243,255,0.2)]" 
            role="tooltip"
            style={{ pointerEvents: 'auto' }} // Allow interaction with the tooltip
        >
            <div className="text-[10px] text-cyan-400 font-mono mb-2 flex justify-between font-bold tracking-widest uppercase">
                <span>Holo-Analysis</span>
                <span className="text-amber-400">Live</span>
            </div>
            
            <div className="h-20 -mx-1 relative" onMouseLeave={() => setHoveredCandle(null)}>
                <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
                    {/* Grid lines */}
                    <line x1="0" y1={height/2} x2={width} y2={height/2} stroke="rgba(255,255,255,0.1)" strokeDasharray="2 2" />
                    
                    {candles.map((candle, i) => {
                        const x = (i / (candles.length - 1)) * (width - 2 * padding) + padding;
                        const yOpen = getY(candle.open);
                        const yClose = getY(candle.close);
                        const yHigh = getY(candle.high);
                        const yLow = getY(candle.low);
                        
                        const color = candle.isUp ? '#00ff9d' : '#ff0044';
                        
                        return (
                            <g 
                                key={i} 
                                onMouseEnter={() => setHoveredCandle(i)}
                                className="cursor-crosshair transition-transform hover:scale-y-110"
                                style={{ transformOrigin: `${x}px ${height/2}px` }}
                            >
                                {/* Invisible wider hover target */}
                                <rect x={x - candleWidth} y={0} width={candleWidth * 2} height={height} fill="transparent" />
                                {/* Wick */}
                                <line x1={x} y1={yHigh} x2={x} y2={yLow} stroke={color} strokeWidth="1" opacity="0.8" />
                                {/* Body */}
                                <rect 
                                    x={x - candleWidth / 2} 
                                    y={Math.min(yOpen, yClose)} 
                                    width={candleWidth} 
                                    height={Math.max(1, Math.abs(yOpen - yClose))} 
                                    fill={candle.isUp ? 'rgba(0,255,157,0.2)' : color}
                                    stroke={color}
                                    strokeWidth="1"
                                />
                                {hoveredCandle === i && (
                                    <line x1={x} y1={0} x2={x} y2={height} stroke="rgba(255,255,255,0.2)" strokeDasharray="1 1" />
                                )}
                            </g>
                        );
                    })}
                </svg>
            </div>
            
            {activeCandle && (
                <div className="mt-2 grid grid-cols-2 gap-1 text-[9px] font-mono border-t border-white/10 pt-2">
                    <div className="flex justify-between"><span className="text-slate-500">O:</span> <span className="text-slate-200">{activeCandle.open.toFixed(2)}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">H:</span> <span className="text-slate-200">{activeCandle.high.toFixed(2)}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">L:</span> <span className="text-slate-200">{activeCandle.low.toFixed(2)}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">C:</span> <span className={activeCandle.isUp ? 'text-green-400' : 'text-red-400'}>{activeCandle.close.toFixed(2)}</span></div>
                </div>
            )}
        </div>
    );
};

export default PriceTrendTooltip;
