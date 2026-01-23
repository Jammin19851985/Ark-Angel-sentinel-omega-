
import React, { useMemo, useState, useRef, useEffect } from 'react';
import { Holding } from '../types';
import { useAppContext } from '../contexts/AppContext';
import { LivePaperBadge } from './LivePaperBadge';
import { Sparkline } from './charts/Sparkline';

interface PortfolioDisplayProps {
    id: string;
}

const PortfolioDisplay: React.FC<PortfolioDisplayProps> = ({ id }) => {
    const { portfolio, marketData, fiatBalance, historicalMarketData, coreState } = useAppContext();
    const [hoverIndex, setHoverIndex] = useState<number | null>(null);
    const chartContainerRef = useRef<HTMLDivElement>(null);
    
    // Drag and Drop State
    const [orderedSymbols, setOrderedSymbols] = useState<string[]>([]);
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

    // Sync orderedSymbols with portfolio keys, preserving existing order where possible
    useEffect(() => {
        const currentSymbols = Object.keys(portfolio);
        setOrderedSymbols(prev => {
            // Keep existing symbols in their current order
            const existing = prev.filter(s => currentSymbols.includes(s));
            // Add new symbols to the end
            const newSymbols = currentSymbols.filter(s => !prev.includes(s));
            return [...existing, ...newSymbols];
        });
    }, [portfolio]);

    const holdings = useMemo(() => {
        return orderedSymbols
            .map(s => portfolio[s])
            .filter(Boolean) as Holding[];
    }, [orderedSymbols, portfolio]);

    // Memoize financial calculations to ensure they update efficiently when marketData changes
    const { currentAssetValue, totalValue, totalCost, totalPnl, totalPnlPercent } = useMemo(() => {
        const assetVal = holdings.reduce((acc, holding) => {
            const currentPrice = marketData[holding.symbol]?.price || holding.avgPrice;
            return acc + (holding.quantity * currentPrice);
        }, 0);

        const cost = holdings.reduce((acc, holding) => {
            return acc + (holding.quantity * holding.avgPrice);
        }, 0);
        
        const pnl = assetVal - cost;
        const pnlPercent = cost > 0 ? (pnl / cost) * 100 : 0;
        const total = assetVal + fiatBalance;

        return {
            currentAssetValue: assetVal,
            totalCost: cost,
            totalPnl: pnl,
            totalPnlPercent: pnlPercent,
            totalValue: total
        };
    }, [holdings, marketData, fiatBalance]);

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

    // Drag Handlers
    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
        setDraggedIndex(index);
        e.dataTransfer.effectAllowed = "move";
        // Required for Firefox to allow drag
        e.dataTransfer.setData("text/plain", index.toString());
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>, index: number) => {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === index) return;

        const newOrder = [...orderedSymbols];
        const [movedSymbol] = newOrder.splice(draggedIndex, 1);
        newOrder.splice(index, 0, movedSymbol);

        setOrderedSymbols(newOrder);
        setDraggedIndex(null);
    };

    const handleDragEnd = () => {
        setDraggedIndex(null);
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
                            <div className={`text-[10px] font-mono font-bold mt-1 flex items-center gap-1 ${totalPnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                <span className="text-slate-600 uppercase font-bold text-[8px] tracking-wider">Unrl. PnL:</span>
                                {totalPnl >= 0 ? '+' : '-'}${Math.abs(totalPnl).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </div>
                        </div>
                        <div className="text-right">
                             <div className={`text-[10px] font-bold ${totalPnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {totalPnl >= 0 ? '▲' : '▼'} {Math.abs(totalPnlPercent).toFixed(2)}%
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
                    <span className="col-span-3 text-center">Trend</span>
                    <span className="col-span-3 text-right">Value</span>
                    <span className="col-span-3 text-right">Yield</span>
                </div>
                
                <div className="space-y-1 flex-1 overflow-y-auto pr-1 custom-scrollbar">
                    {holdings.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-700 italic text-[9px] space-y-2">
                            <span className="tracking-widest">PORTFOLIO_EMPTY</span>
                        </div>
                    ) : (
                        holdings.map((holding, index) => {
                            const currentPrice = marketData[holding.symbol]?.price || holding.avgPrice;
                            const currentValue = currentPrice * holding.quantity;
                            const costBasis = holding.avgPrice * holding.quantity;
                            const pnl = currentValue - costBasis;
                            const pnlPercent = costBasis > 0 ? (pnl / costBasis) * 100 : 0;
                            const pnlColorClass = pnl >= 0 ? 'text-green-400' : 'text-red-400';
                            const history = historicalMarketData[holding.symbol] || [];
                            
                            // Transform price history to PnL history for visualization
                            const pnlHistory = history.map(price => (price - holding.avgPrice) * holding.quantity);

                            return (
                                <div 
                                    key={holding.symbol} 
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, index)}
                                    onDragOver={handleDragOver}
                                    onDrop={(e) => handleDrop(e, index)}
                                    onDragEnd={handleDragEnd}
                                    className={`grid grid-cols-12 gap-1 text-slate-300 items-center p-1.5 rounded-sm border transition-all relative group cursor-grab active:cursor-grabbing
                                        ${draggedIndex === index ? 'opacity-30 border-dashed border-slate-600' : 'border-slate-800/50 bg-[#08080a] hover:border-slate-600'}
                                    `}
                                >
                                    {/* Drag Handle Overlay (Visible on Hover) */}
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-slate-700 opacity-0 group-hover:opacity-50 rounded-l-sm transition-opacity" />

                                    <div className="col-span-3 flex flex-col pl-1.5">
                                        <span className="font-bold text-white text-[10px] tracking-tight flex items-center gap-1">
                                            {holding.symbol}
                                        </span>
                                        <span className="text-[8px] text-slate-600 uppercase font-bold">{holding.quantity.toFixed(4)} Units</span>
                                    </div>
                                    
                                    <div className="col-span-3 flex flex-col items-center justify-center h-full">
                                        <Sparkline 
                                            data={pnlHistory} 
                                            color={pnl >= 0 ? '#10b981' : '#ef4444'} 
                                            width={60}
                                            height={20}
                                            strokeWidth={1.5}
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
