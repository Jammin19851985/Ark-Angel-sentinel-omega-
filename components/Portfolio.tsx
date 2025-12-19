
import React from 'react';
import { Holding } from '../types';
import { useAppContext } from '../contexts/AppContext';

interface PortfolioDisplayProps {
    id: string; // New: Add ID prop for tour targeting
}

const PortfolioDisplay: React.FC<PortfolioDisplayProps> = ({ id }) => {
    const { portfolio, marketData, fiatBalance } = useAppContext();
    const holdings = Object.values(portfolio) as Holding[];

    const totalAssetValue = holdings.reduce((acc, holding) => {
        const currentPrice = marketData[holding.symbol]?.price || holding.avgPrice;
        return acc + (holding.quantity * currentPrice);
    }, 0);

    const totalValue = totalAssetValue + fiatBalance;

    const totalCost = holdings.reduce((acc, holding) => {
        return acc + (holding.quantity * holding.avgPrice);
    }, 0);
    
    const totalPnl = totalAssetValue - totalCost;
    const totalPnlPercent = totalCost > 0 ? (totalPnl / totalCost) * 100 : 0;

    return (
        <div id={id} className="bg-black/30 backdrop-blur-sm border border-slate-800 rounded-lg p-4 shadow-lg glow-border h-full flex flex-col">
            <h2 className="text-sm font-bold text-amber-400 mb-3 font-mono">// PORTFOLIO OVERVIEW</h2>
            <div className="font-mono text-sm space-y-3 flex-1 flex flex-col min-h-0">
                <div className="bg-slate-900/50 p-3 rounded border border-slate-700">
                    <div className="flex justify-between text-slate-400 text-xs mb-1">
                        <span>FIAT BALANCE (USD/CAD)</span>
                    </div>
                    <div className="text-2xl font-bold text-white tracking-widest">
                        ${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(fiatBalance)}
                    </div>
                </div>

                <div className="flex justify-between text-slate-300">
                    <span>Total Equity:</span>
                    <span className="font-medium text-white">${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(totalValue)}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                    <span>Unrealized P/L:</span>
                    <span className={`font-medium ${totalPnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {totalPnl >= 0 ? '+' : '-'}${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Math.abs(totalPnl))} ({totalPnlPercent.toFixed(2)}%)
                    </span>
                </div>
                <div className="border-t border-slate-700 my-2"></div>
                <div className="text-xs text-slate-400 grid grid-cols-10 gap-2">
                    <span className="col-span-2">SYMBOL</span>
                    <span className="col-span-3 text-right">QTY</span>
                    <span className="col-span-2 text-right">VALUE</span>
                    <span className="col-span-3 text-right">P/L</span>
                </div>
                <div className="space-y-1 flex-1 overflow-y-auto pr-2">
                    {holdings.map(holding => {
                         const currentPrice = marketData[holding.symbol]?.price || holding.avgPrice;
                         const currentValue = currentPrice * holding.quantity;
                         const costBasis = holding.avgPrice * holding.quantity;
                         const pnl = currentValue - costBasis;
                         const pnlPercent = costBasis > 0 ? (pnl / costBasis) * 100 : 0;
                         const pnlColorClass = pnl >= 0 ? 'text-green-400' : 'text-red-400';

                        return (
                            <div key={holding.symbol} className="grid grid-cols-10 gap-2 text-slate-300 items-center text-xs hover:bg-white/5 p-1 rounded transition-colors">
                                <span className="col-span-2 font-bold">{holding.symbol}</span>
                                <span className="col-span-3 text-right">{holding.quantity.toFixed(6)}</span>
                                <span className="col-span-2 text-right">${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(currentValue)}</span>
                                <div className="col-span-3 flex flex-col text-right">
                                     <span className={`font-medium ${pnlColorClass}`}>
                                        {pnl >= 0 ? '+' : '-'}${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Math.abs(pnl))}
                                    </span>
                                    <span className={pnlColorClass}>
                                        ({pnlPercent.toFixed(2)}%)
                                    </span>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    );
};

export default React.memo(PortfolioDisplay);
