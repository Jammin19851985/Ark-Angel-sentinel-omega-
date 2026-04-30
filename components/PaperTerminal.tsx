
import React from 'react';
import { useAppContext } from '../contexts/AppContext';
import { ArrowUpIcon } from './icons/ArrowUpIcon';
import { ArrowDownIcon } from './icons/ArrowDownIcon';
import { LivePaperBadge } from './LivePaperBadge';

const ShadowTerminal: React.FC<{ id: string }> = ({ id }) => {
    const { shadowVaultBalance, shadowTrades, executeTrade, marketData } = useAppContext();

    const handleShadowTrade = (symbol: string, side: 'BUY' | 'SELL') => {
        const price = marketData[symbol]?.price || 0;
        if (price > 0) {
            executeTrade(symbol, side, 0.1, price, true); // true indicates shadow/undisclosed
        }
    };

    return (
        <div id={id} className="h-full flex flex-col bg-black/40 border border-slate-800 rounded-lg overflow-hidden font-mono tech-panel">
            <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex justify-between items-center">
                <div>
                    <h2 className="text-sm font-bold text-amber-500 uppercase tracking-tighter">// SHADOW VAULT // UNDETECTABLE EXECUTION</h2>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest">Offshore Mirror Node (Null-Space Bridged)</p>
                </div>
                <div className="flex flex-col items-end">
                    <LivePaperBadge />
                    <div className="mt-1">
                        <span className="text-[9px] text-slate-600 uppercase mr-2 font-bold tracking-tighter">Liquid Reserves</span>
                        <span className="text-lg font-bold text-slate-100 tracking-tighter">${shadowVaultBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                </div>
            </div>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 p-4 overflow-hidden">
                <div className="flex flex-col space-y-4">
                    <div className="bg-black/50 border border-amber-900/30 p-4 rounded-lg">
                        <h3 className="text-[10px] font-bold text-amber-500 mb-3 uppercase tracking-widest flex items-center gap-2">
                             <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-ping"></div>
                             Manual Hunt Protocol
                        </h3>
                        <div className="grid grid-cols-2 gap-2">
                            {['BTC', 'ETH', 'SOL', 'RY.TO'].map(sym => (
                                <div key={sym} className="flex flex-col p-2 border border-slate-800 rounded bg-[#08080a] hover:border-amber-500/30 transition-colors">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="font-bold text-slate-300">{sym}</span>
                                        <span className="text-[10px] text-amber-600 font-bold">${marketData[sym]?.price?.toFixed(2) || '0.00'}</span>
                                    </div>
                                    <div className="flex gap-1">
                                        <button 
                                            onClick={() => handleShadowTrade(sym, 'BUY')}
                                            className="flex-1 bg-emerald-900/20 hover:bg-emerald-900/40 border border-emerald-500/50 text-emerald-400 py-1.5 rounded text-[10px] font-bold transition-all"
                                        >
                                            BUY
                                        </button>
                                        <button 
                                            onClick={() => handleShadowTrade(sym, 'SELL')}
                                            className="flex-1 bg-red-900/20 hover:bg-red-900/40 border border-red-500/50 text-red-400 py-1.5 rounded text-[10px] font-bold transition-all"
                                        >
                                            SELL
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    <div className="p-4 bg-black/50 border border-slate-700 rounded-lg flex-1 overflow-hidden flex flex-col">
                        <h3 className="text-[10px] font-bold text-slate-400 mb-3 uppercase tracking-widest font-mono">// EXFILTRATION_METRICS</h3>
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-[10px] mb-1 font-mono">
                                    <span className="text-slate-500 uppercase tracking-tighter">SOVEREIGN ALPHA</span>
                                    <span className="text-amber-400 font-bold">+24.5%</span>
                                </div>
                                <div className="w-full bg-slate-900 h-1 rounded overflow-hidden">
                                    <div className="bg-amber-500 h-full w-[24.5%] shadow-[0_0_8px_amber]"></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-[10px] mb-1 font-mono">
                                    <span className="text-slate-500 uppercase tracking-tighter">RESONANCE CONFIDENCE</span>
                                    <span className="text-emerald-500 font-bold">99.8%</span>
                                </div>
                                <div className="w-full bg-slate-900 h-1 rounded overflow-hidden">
                                    <div className="bg-emerald-500 h-full w-[99.8%] shadow-[0_0_8px_emerald]" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-black/50 border border-slate-700 rounded-lg flex flex-col overflow-hidden">
                    <h3 className="p-3 text-[10px] font-bold text-slate-500 border-b border-slate-800 uppercase tracking-widest font-mono">// IMMUTABLE_VAULT_LEDGER</h3>
                    <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                        {shadowTrades.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center opacity-30 text-slate-600 text-[10px] font-mono">
                                <span className="animate-pulse">AWAITING_SHADOW_VECTORS...</span>
                            </div>
                        ) : (
                            shadowTrades.map(trade => (
                                <div key={trade.id} className="grid grid-cols-4 gap-1 p-2 bg-slate-950 border border-white/5 rounded text-[9px] items-center hover:bg-white/5 transition-colors">
                                    <span className="text-slate-600 font-mono">{trade.timestamp}</span>
                                    <span className="font-bold text-white flex items-center gap-1 uppercase">
                                        {trade.action === 'BUY' ? <ArrowUpIcon className="w-2 h-2 text-emerald-500"/> : <ArrowDownIcon className="w-2 h-2 text-red-500"/>}
                                        {trade.symbol}
                                    </span>
                                    <span className="text-right text-slate-400 font-mono">${trade.price.toFixed(2)}</span>
                                    <span className={`text-right font-bold ${trade.pnl >= 0 ? 'text-emerald-500' : 'text-red-500'} font-mono`}>
                                        {trade.pnl > 0 ? '+' : ''}{trade.pnl.toFixed(2)}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
            <div className="bg-black/80 p-2 border-t border-slate-800 text-[8px] font-mono text-slate-700 uppercase tracking-[0.4em] text-center">
                Protocol: Dimensional Bypass Synthesis // Integrity: Verified
            </div>
        </div>
    );
};

export default ShadowTerminal;
