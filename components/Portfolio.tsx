
import React, { useMemo, useState, useRef } from 'react';
import { Holding } from '../types';
import { useAppContext } from '../contexts/AppContext';

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
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-700 text-[8px] px-2 py-1 rounded opacity-0 group-hover/spark:opacity-100 transition-opacity pointer-events-none whitespace-nowrap font-mono text-white shadow-xl z-50">
                RANGE: {min.toFixed(0)}..{max.toFixed(0)}
            </div>
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
        <div id={id} className="bg-black/60 backdrop-blur-md border border-slate-800 rounded-lg p-4 shadow-lg glow-border h-full flex flex-col font-mono">
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                    <h2 className="text-sm font-bold text-amber-400 tracking-widest uppercase">// ASSET_LEDGER</h2>
                </div>
                <div className="flex items-center gap-2">
                    <div className={`text-[9px] px-2 py-0.5 rounded border font-bold ${coreState.strategyMetrics.isRetired ? 'border-red-500 bg-red-950 text-red-400' : 'border-cyan-500 bg-cyan-950 text-cyan-400'} uppercase tracking-tighter`}>
                        Quality: {coreState.strategyMetrics.qualityScore.toFixed(2)}
                    </div>
                    <div className="text-[9px] px-2 py-0.5 rounded border border-amber-500 bg-amber-950 text-amber-400 animate-pulse uppercase tracking-tighter font-bold">
                        Scale: {coreState.strategyMetrics.capitalScale.toFixed(2)}x
                    </div>
                </div>
            </div>

            <div className="space-y-4 flex-shrink-0">
                <div className="bg-slate-900 p-4 rounded border border-slate-700 relative overflow-hidden group shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none" />
                    <div className="flex justify-between items-start relative z-10">
                        <div>
                            <div className="text-slate-500 text-[9px] mb-1 tracking-widest uppercase font-bold">Net Portfolio Value</div>
                            <div className="text-3xl font-bold text-white tracking-tighter transition-all group-hover:text-amber-400 origin-left">
                                ${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(totalValue)}
                            </div>
                        </div>
                        <div className="text-right">
                             <div className={`text-xs font-bold ${totalPnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {totalPnl >= 0 ? '▲' : '▼'} {totalPnlPercent.toFixed(2)}%
                            </div>
                            <div className="text-[10px] text-slate-500 uppercase font-bold">Return_On_Sovereign</div>
                        </div>
                    </div>
                    
                    <div 
                        ref={chartContainerRef}
                        className="mt-4 h-24 w-full relative cursor-crosshair"
                        onMouseMove={handleMouseMove}
                        onMouseLeave={() => setHoverIndex(null)}
                    >
                        {equityHistory.length > 1 ? (
                            <>
                                <svg viewBox="0 0 400 100" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                                    <defs>
                                        <linearGradient id="equity-grad-fill" x1="0%" y1="0%" x2="0%" y2="100%">
                                            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.3" />
                                            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
                                        </linearGradient>
                                    </defs>
                                    <path
                                        d={`M 0 100 ${equityHistory.map((v, i) => `L ${(i / (equityHistory.length - 1)) * 400} ${100 - ((v - Math.min(...equityHistory)) / (Math.max(...equityHistory) - Math.min(...equityHistory) || 1)) * 80}`).join(' ')} L 400 100 Z`}
                                        fill="url(#equity-grad-fill)"
                                    />
                                    <polyline
                                        fill="none"
                                        stroke="#f59e0b"
                                        strokeWidth="2"
                                        strokeLinejoin="round"
                                        points={equityHistory.map((v, i) => `${(i / (equityHistory.length - 1)) * 400},${100 - ((v - Math.min(...equityHistory)) / (Math.max(...equityHistory) - Math.min(...equityHistory) || 1)) * 80}`).join(' ')}
                                        className="drop-shadow-[0_0_5px_rgba(245,158,11,0.5)]"
                                    />
                                    
                                    {hoverIndex !== null && (
                                        <g>
                                            <line 
                                                x1={(hoverIndex / (equityHistory.length - 1)) * 400} 
                                                y1="0" 
                                                x2={(hoverIndex / (equityHistory.length - 1)) * 400} 
                                                y2="100" 
                                                stroke="white" 
                                                strokeWidth="1" 
                                                strokeDasharray="4,4" 
                                            />
                                            <circle 
                                                cx={(hoverIndex / (equityHistory.length - 1)) * 400} 
                                                cy={100 - ((equityHistory[hoverIndex] - Math.min(...equityHistory)) / (Math.max(...equityHistory) - Math.min(...equityHistory) || 1)) * 80} 
                                                r="4" 
                                                fill="white" 
                                                className="animate-pulse"
                                            />
                                        </g>
                                    )}
                                </svg>
                            </>
                        ) : (
                            <div className="h-full flex items-center justify-center border border-dashed border-white/10 rounded text-[9px] text-slate-700 font-bold tracking-widest">MANIFESTING_EQUITY_CURVE...</div>
                        )}
                    </div>
                </div>

                <div className="flex justify-between items-center px-4 py-3 bg-black border border-amber-600 rounded text-[11px] group hover:bg-amber-950 transition-colors shadow-[0_0_10px_rgba(245,158,11,0.2)]">
                    <span className="text-slate-400 uppercase tracking-widest font-bold">Liquid Cash Reserve</span>
                    <span className="text-white font-bold group-hover:text-amber-400 transition-colors text-sm">${fiatBalance.toLocaleString()}</span>
                </div>
            </div>

            <div className="border-t border-slate-800 pt-4 flex-1 flex flex-col min-h-0 mb-4">
                <div className="text-[9px] text-slate-500 grid grid-cols-12 gap-2 mb-3 px-2 font-bold uppercase tracking-widest bg-black py-1 rounded">
                    <span className="col-span-3">Asset Vector</span>
                    <span className="col-span-3 text-center">Status / Strikes</span>
                    <span className="col-span-3 text-right">Value</span>
                    <span className="col-span-3 text-right">Yield</span>
                </div>
                
                <div className="space-y-2 flex-1 overflow-y-auto pr-1 custom-scrollbar">
                    {holdings.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-600 italic text-[10px] space-y-2 opacity-70">
                            <div className="w-8 h-8 rounded-full border-2 border-dashed border-slate-600 animate-spin-slow"></div>
                            <span className="font-bold tracking-widest">AWAITING_PORTFOLIO_CONSTRUCTION</span>
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
                                <div key={holding.symbol} className={`grid grid-cols-12 gap-2 text-slate-300 items-center p-3 rounded border transition-all group ${holding.isRetired ? 'opacity-50 grayscale bg-red-950/20 border-red-900' : 'bg-slate-900 border-slate-800 hover:border-amber-500/50 hover:bg-slate-800/80 shadow-md'}`}>
                                    <div className="col-span-3 flex flex-col">
                                        <span className="font-bold text-white text-xs group-hover:text-amber-400 transition-colors tracking-tight">{holding.symbol}</span>
                                        <span className="text-[8px] text-slate-500 truncate uppercase font-bold">{holding.quantity.toFixed(4)} Units</span>
                                    </div>
                                    
                                    <div className="col-span-3 flex flex-col items-center">
                                        {holding.isRetired ? (
                                            <span className="text-[8px] font-bold text-red-500 uppercase animate-pulse border border-red-500 px-1 rounded">Retired</span>
                                        ) : (
                                            <div className="flex gap-1 mb-1">
                                                {[...Array(5)].map((_, i) => (
                                                    <div key={i} className={`w-1.5 h-1.5 rounded-full ${i < (holding.strikes || 0) ? 'bg-red-500 shadow-[0_0_2px_red]' : 'bg-slate-700'}`} />
                                                ))}
                                            </div>
                                        )}
                                        <PLSparkline 
                                            history={history} 
                                            avgPrice={holding.avgPrice} 
                                            quantity={holding.quantity} 
                                            color={pnl >= 0 ? '#10b981' : '#ef4444'} 
                                        />
                                    </div>
                                    
                                    <div className="col-span-3 text-right flex flex-col">
                                        <span className="text-[11px] font-bold text-slate-100">${new Intl.NumberFormat('en-US', { notation: 'compact' }).format(currentValue)}</span>
                                        <span className="text-[8px] text-slate-500">@ ${currentPrice.toFixed(2)}</span>
                                    </div>

                                    <div className="col-span-3 text-right flex flex-col">
                                        <span className={`text-[11px] font-bold ${pnlColorClass}`}>
                                            {pnl >= 0 ? '+' : '-'}${Math.abs(pnl).toFixed(2)}
                                        </span>
                                        <span className={`text-[9px] ${pnlColorClass} opacity-80`}>
                                            {pnlPercent.toFixed(2)}%
                                        </span>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Active Orders Section */}
            {activeOrders.length > 0 && (
                <div className="border-t border-slate-800 pt-2 mb-2">
                    <div className="text-[9px] text-amber-500 mb-1 uppercase tracking-widest font-bold px-2 flex justify-between">
                        <span>// WORKING_ORDERS (SPINE_GATED)</span>
                        <span className="bg-amber-950 px-1 rounded text-amber-400">{activeOrders.length} ACTIVE</span>
                    </div>
                    <div className="max-h-24 overflow-y-auto pr-1 space-y-1 custom-scrollbar">
                        {activeOrders.map(order => (
                            <div key={order.id} className="flex justify-between items-center text-[9px] font-mono bg-black/40 border border-slate-800 p-1.5 rounded text-slate-400">
                                <span className="text-white font-bold">{order.symbol}</span>
                                <span className={order.action === 'BUY' ? 'text-green-400' : 'text-red-400'}>{order.action}</span>
                                <span>{order.type.replace('_', ' ')}</span>
                                <span className="text-cyan-400 font-bold">@ ${order.triggerPrice}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="border-t border-slate-800 pt-3 h-32 flex flex-col min-h-0 bg-slate-900/30 rounded-md border border-slate-800/50">
                 <div className="text-[9px] text-slate-500 mb-2 uppercase tracking-widest font-bold px-2 flex justify-between items-center">
                    <span>// RECENT_EXECUTION_LOG</span>
                    <span className="bg-slate-800 px-1.5 rounded text-[8px] text-slate-400 border border-slate-700">LAST 20</span>
                 </div>
                 <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
                    <div className="grid grid-cols-12 gap-2 px-2 pb-1 text-[8px] text-slate-600 font-bold uppercase border-b border-slate-800/50 mb-1">
                        <span className="col-span-3">Time</span>
                        <span className="col-span-2">Side</span>
                        <span className="col-span-2">Sym</span>
                        <span className="col-span-2 text-right">Qty</span>
                        <span className="col-span-3 text-right">P/L</span>
                    </div>
                    {trades.slice(0, 20).map((trade) => (
                        <div key={trade.id} className="grid grid-cols-12 gap-2 px-2 py-1 text-[9px] font-mono border-b border-white/5 hover:bg-white/5 transition-colors items-center">
                            <span className="col-span-3 text-slate-500 truncate" title={trade.timestamp}>{trade.timestamp.split(' ')[0]}</span>
                            <span className={`col-span-2 font-bold ${trade.action === 'BUY' ? 'text-green-500' : 'text-red-500'}`}>{trade.action}</span>
                            <span className="col-span-2 text-slate-300 font-bold">{trade.symbol}</span>
                            <span className="col-span-2 text-right text-slate-400">{trade.quantity.toFixed(4)}</span>
                            <span className={`col-span-3 text-right font-bold ${trade.pnl > 0 ? 'text-green-400' : trade.pnl < 0 ? 'text-red-400' : 'text-slate-600'}`}>
                                {trade.action === 'SELL' ? (trade.pnl > 0 ? '+' : '') + trade.pnl.toFixed(2) : '--'}
                            </span>
                        </div>
                    ))}
                 </div>
            </div>
            
            <div className="mt-4 pt-3 border-t border-slate-800 text-[8px] text-slate-600 flex justify-between items-center font-mono font-bold">
                <span className="uppercase tracking-widest">Reconciliation_Status: <span className="text-green-500">COMPLIANT</span></span>
                <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-700 text-cyan-500">IVL_VERIFIER_Ω: ACTIVE</span>
            </div>
        </div>
    );
};

export default React.memo(PortfolioDisplay);
