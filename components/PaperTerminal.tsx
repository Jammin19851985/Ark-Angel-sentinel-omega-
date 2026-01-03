
import React from 'react';
import { useAppContext } from '../contexts/AppContext';
import { ArrowUpIcon } from './icons/ArrowUpIcon';
import { ArrowDownIcon } from './icons/ArrowDownIcon';
import { LivePaperBadge } from './LivePaperBadge';

const PaperTerminal: React.FC<{ id: string }> = ({ id }) => {
    const { paperBalance, paperTrades, executeTrade, marketData } = useAppContext();

    const handlePaperTrade = (symbol: string, side: 'BUY' | 'SELL') => {
        const price = marketData[symbol]?.price || 0;
        if (price > 0) {
            executeTrade(symbol, side, 0.1, price, true);
        }
    };

    return (
        <div id={id} className="h-full flex flex-col bg-black/40 border border-slate-800 rounded-lg overflow-hidden font-mono tech-panel">
            <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex justify-between items-center">
                <div>
                    <h2 className="text-sm font-bold text-cyan-400">// ISOLATED PAPER TERMINAL</h2>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest">Sandbox Protocol (Zero Capital Risk)</p>
                </div>
                <div className="flex flex-col items-end">
                    <LivePaperBadge />
                    <div className="mt-1">
                        <span className="text-[9px] text-slate-500 uppercase mr-2">Paper Balance</span>
                        <span className="text-lg font-bold text-white">${paperBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                </div>
            </div>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 p-4 overflow-hidden">
                <div className="flex flex-col space-y-4">
                    <div className="bg-black/50 border border-slate-700 p-4 rounded-lg">
                        <h3 className="text-[10px] font-bold text-amber-500 mb-3 uppercase tracking-widest">Execute Simulation</h3>
                        <div className="grid grid-cols-2 gap-2">
                            {['BTC', 'ETH', 'SOL', 'ADA'].map(sym => (
                                <div key={sym} className="flex flex-col p-2 border border-slate-800 rounded bg-slate-900/30">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="font-bold text-slate-300">{sym}</span>
                                        <span className="text-[10px] text-slate-500">${marketData[sym]?.price?.toFixed(2) || '0.00'}</span>
                                    </div>
                                    <div className="flex gap-1">
                                        <button 
                                            onClick={() => handlePaperTrade(sym, 'BUY')}
                                            className="flex-1 bg-green-900/30 hover:bg-green-900/50 border border-green-500 text-green-400 py-1 rounded text-[10px] font-bold transition-all"
                                        >
                                            BUY
                                        </button>
                                        <button 
                                            onClick={() => handlePaperTrade(sym, 'SELL')}
                                            className="flex-1 bg-red-900/30 hover:bg-red-900/50 border border-red-500 text-red-400 py-1 rounded text-[10px] font-bold transition-all"
                                        >
                                            SELL
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    <div className="p-4 bg-black/50 border border-slate-700 rounded-lg flex-1 overflow-hidden flex flex-col">
                        <h3 className="text-[10px] font-bold text-slate-400 mb-3 uppercase tracking-widest">Simulation Metrics</h3>
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-[10px] mb-1">
                                    <span className="text-slate-500 uppercase">Alpha Generation</span>
                                    <span className="text-cyan-400">+12.4%</span>
                                </div>
                                <div className="w-full bg-slate-900 h-1 rounded overflow-hidden">
                                    <div className="bg-cyan-500 h-full w-2/3 shadow-[0_0_8px_cyan]"></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-[10px] mb-1">
                                    <span className="text-slate-500 uppercase">Win Probability</span>
                                    <span className="text-amber-500">68.2%</span>
                                </div>
                                <div className="w-full bg-slate-900 h-1 rounded overflow-hidden">
                                    <div className="bg-amber-500 h-full w-[68%]" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-black/50 border border-slate-700 rounded-lg flex flex-col overflow-hidden">
                    <h3 className="p-3 text-[10px] font-bold text-slate-500 border-b border-slate-800 uppercase tracking-widest">Simulated History</h3>
                    <div className="flex-1 overflow-y-auto p-2 space-y-1">
                        {paperTrades.length === 0 ? (
                            <div className="h-full flex items-center justify-center opacity-20 italic text-[10px]">No simulation vectors recorded.</div>
                        ) : (
                            paperTrades.map(trade => (
                                <div key={trade.id} className="grid grid-cols-4 gap-1 p-2 bg-slate-950 border border-white/5 rounded text-[9px] items-center">
                                    <span className="text-slate-500">{trade.timestamp}</span>
                                    <span className="font-bold text-white flex items-center gap-1">
                                        {trade.action === 'BUY' ? <ArrowUpIcon className="w-2 h-2 text-green-500"/> : <ArrowDownIcon className="w-2 h-2 text-red-500"/>}
                                        {trade.symbol}
                                    </span>
                                    <span className="text-right text-slate-400">${trade.price.toFixed(2)}</span>
                                    <span className={`text-right font-bold ${trade.pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                        {trade.pnl > 0 ? '+' : ''}{trade.pnl.toFixed(2)}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaperTerminal;
