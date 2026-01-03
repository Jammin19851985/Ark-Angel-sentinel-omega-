
import React, { useMemo, useState, useRef } from 'react';
import { Holding } from '../types';
import { useAppContext } from '../contexts/AppContext';
import { LivePaperBadge } from './LivePaperBadge';

interface PortfolioDisplayProps {
    id: string;
}

const PLSparkline: React.FC<{ history: number[], avgPrice: number, quantity: number, color: string }> = ({ history, avgPrice, quantity, color }) => {
    if (history.length < 2) return null;
    
    const plHistory = history.map(price => (price - avgPrice) * quantity);
    const min = Math.min(...plHistory);
    const max = Math.max(...plHistory);
    const range = Math.max(max - min, 1);
    const width = 100;
    const height = 30;

    const points = plHistory.map((val, i) => {
        const x = (i / (plHistory.length - 1)) * width;
        const y = height - ((val - min) / range) * height;
        return `${x},${y}`;
    }).join(' ');

    return (
        <div className="relative group/spark">
            <svg width="70" height="24" viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
                <line 
                    x1="0" y1={height - ((0 - min) / range) * height} 
                    x2={width} y2={height - ((0 - min) / range) * height} 
                    stroke="rgba(255,255,255,0.1)" 
                    strokeWidth="0.5" 
                    strokeDasharray="2,2"
                />
                <polyline
                    fill="none"
                    stroke={color}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={points}
                    className="transition-all duration-500"
                />
            </svg>
        </div>
    );
};

const PortfolioDisplay: React.FC<PortfolioDisplayProps> = ({ id }) => {
    const { portfolio, marketData, fiatBalance, historicalMarketData, coreState, trades, activeOrders } = useAppContext();
    const [hoverIndex, setHoverIndex] = useState<number | null>(null);
    const chartContainerRef = useRef<HTMLDivElement>(null);

    const holdings = Object.values(portfolio) as Holding[];

    const currentAssetValue = holdings.reduce((acc, holding) => {
        const currentPrice = marketData[holding.symbol]?.price || holding.avgPrice;
        return acc + (holding.quantity * currentPrice);
    }, 0);

    const totalValue = currentAssetValue + fiatBalance;

    const totalCost = holdings.reduce((acc, holding) => {
        return acc + (holding.quantity * holding.avgPrice);
    }, 0);
    
    const totalPnl = currentAssetValue - totalCost;
    const totalPnlPercent = totalCost > 0 ? (totalPnl / totalCost) * 100 : 0;

    const equityHistory = useMemo(() => {
        const symbols = Object.keys(portfolio);
        if (symbols.length === 0) return [];
        
        const historyLengths = symbols.map(s => historicalMarketData[s]?.length || 0);
        const minLength = Math.min(...historyLengths, 20); 
        
        if (minLength < 2) return [];

        const curve = [];
        for (let i = 0; i < minLength; i++) {
            let pointValue = fiatBalance;
            symbols.forEach(s => {
                const prices = historicalMarketData[s];
                const priceIndex = prices.length - 1 - (minLength - 1 - i);
                const price = prices[priceIndex] || portfolio[s].avgPrice;
                pointValue += portfolio[s].quantity * price;
            });
            curve.push(pointValue);
        }
        return curve;
    }, [historicalMarketData, portfolio, fiatBalance]);

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!chartContainerRef.current || equityHistory.length < 2) return;
        const rect = chartContainerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const index = Math.round((x / rect.width) * (equityHistory.length - 1));
        setHoverIndex(Math.max(0, Math.min(index, equityHistory.length - 1)));
    };

    return (
        <div id={id} className="tech-panel p-3 flex flex-col font-mono h-full bg-black/60">
            <div className="flex justify-between items-center mb-3">
                <h2 className="text-xs font-bold text-amber-400 tracking-widest uppercase">// ASSET_LEDGER</h2>
                <div className="flex items-center gap-2">
                    <LivePaperBadge />
                    <div className="text-[8px] px-1.5 py-0.5 rounded border border-cyan-900 bg-cyan-950/30 text-cyan-400 uppercase tracking-tighter">
                        Q: {coreState.strategyMetrics.qualityScore.toFixed(2)}
                    </div>
                </div>
            </div>

            <div className="space-y-3 flex-shrink-0">
                <div className="bg-[#0b0b0f] p-3 rounded-sm border border-slate-800 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5 pointer-events-none" />
                    <div className="flex justify-between items-start relative z-10">
                        <div>
                            <div className="text-slate-600 text-[8px] mb-0.5 tracking-widest uppercase font-bold">Net Liq Value</div>
                            <div className="text-2xl font-bold text-white tracking-tighter group-hover:text-amber-400 transition-colors">
                                ${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(totalValue)}
                            </div>
                        </div>
                        <div className="text-right">
                             <div className={`text-[10px] font-bold ${totalPnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {totalPnl >= 0 ? '▲' : '▼'} {totalPnlPercent.toFixed(2)}%
                            </div>
                            <div className="text-[8px] text-slate-600 uppercase font-bold">ROE</div>
                        </div>
                    </div>
                    
                    <div 
                        ref={chartContainerRef}
                        className="mt-2 h-16 w-full relative cursor-crosshair"
                        onMouseMove={handleMouseMove}
                        onMouseLeave={() => setHoverIndex(null)}
                    >
                        {equityHistory.length > 1 ? (
                            <svg viewBox="0 0 400 100" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                                <path
                                    d={`M 0 100 ${equityHistory.map((v, i) => `L ${(i / (equityHistory.length - 1)) * 400} ${100 - ((v - Math.min(...equityHistory)) / (Math.max(...equityHistory) - Math.min(...equityHistory) || 1)) * 80}`).join(' ')} L 400 100 Z`}
                                    fill="rgba(245,158,11,0.1)"
                                />
                                <polyline
                                    fill="none"
                                    stroke="#f59e0b"
                                    strokeWidth="1.5"
                                    strokeLinejoin="round"
                                    points={equityHistory.map((v, i) => `${(i / (equityHistory.length - 1)) * 400},${100 - ((v - Math.min(...equityHistory)) / (Math.max(...equityHistory) - Math.min(...equityHistory) || 1)) * 80}`).join(' ')}
                                />
                            </svg>
                        ) : (
                            <div className="h-full flex items-center justify-center text-[8px] text-slate-700 font-bold tracking-widest">NO_DATA</div>
                        )}
                    </div>
                </div>

                <div className="flex justify-between items-center px-3 py-2 bg-black border border-slate-800 rounded-sm text-[10px]">
                    <span className="text-slate-500 uppercase tracking-widest font-bold">Liquid Cash</span>
                    <span className="text-slate-200 font-bold font-mono">${fiatBalance.toLocaleString()}</span>
                </div>
            </div>

            <div className="border-t border-slate-800 pt-3 flex-1 flex flex-col min-h-0">
                <div className="text-[8px] text-slate-600 grid grid-cols-12 gap-1 mb-2 px-1 font-bold uppercase tracking-widest bg-black/40 py-1 rounded-sm">
                    <span className="col-span-3">Asset</span>
                    <span className="col-span-3 text-center">Status</span>
                    <span className="col-span-3 text-right">Value</span>
                    <span className="col-span-3 text-right">Yield</span>
                </div>
                
                <div className="space-y-1 flex-1 overflow-y-auto pr-1 custom-scrollbar">
                    {holdings.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-700 italic text-[9px] space-y-2">
                            <span className="tracking-widest">PORTFOLIO_EMPTY</span>
                        </div>
                    ) : (
                        holdings.map(holding => {
                            const currentPrice = marketData[holding.symbol]?.price || holding.avgPrice;
                            const currentValue = currentPrice * holding.quantity;
                            const costBasis = holding.avgPrice * holding.quantity;
                            const pnl = currentValue - costBasis;
                            const pnlPercent = costBasis > 0 ? (pnl / costBasis) * 100 : 0;
                            const pnlColorClass = pnl >= 0 ? 'text-green-400' : 'text-red-400';
                            const history = historicalMarketData[holding.symbol] || [];

                            return (
                                <div key={holding.symbol} className={`grid grid-cols-12 gap-1 text-slate-300 items-center p-1.5 rounded-sm border border-slate-800/50 bg-[#08080a] hover:border-slate-600 transition-colors`}>
                                    <div className="col-span-3 flex flex-col">
                                        <span className="font-bold text-white text-[10px] tracking-tight">{holding.symbol}</span>
                                        <span className="text-[8px] text-slate-600 uppercase font-bold">{holding.quantity.toFixed(4)} Units</span>
                                    </div>
                                    
                                    <div className="col-span-3 flex flex-col items-center">
                                        <PLSparkline 
                                            history={history} 
                                            avgPrice={holding.avgPrice} 
                                            quantity={holding.quantity} 
                                            color={pnl >= 0 ? '#10b981' : '#ef4444'} 
                                        />
                                    </div>
                                    
                                    <div className="col-span-3 text-right flex flex-col">
                                        <span className="text-[10px] font-bold text-slate-200">${new Intl.NumberFormat('en-US', { notation: 'compact' }).format(currentValue)}</span>
                                        <span className="text-[8px] text-slate-600">@ ${currentPrice.toFixed(2)}</span>
                                    </div>

                                    <div className="col-span-3 text-right flex flex-col">
                                        <span className={`text-[10px] font-bold ${pnlColorClass}`}>
                                            {pnl >= 0 ? '+' : ''}${Math.abs(pnl).toFixed(2)}
                                        </span>
                                        <span className={`text-[8px] ${pnlColorClass} opacity-70`}>
                                            {pnlPercent.toFixed(2)}%
                                        </span>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};

export default React.memo(PortfolioDisplay);
