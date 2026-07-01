
import React, { useMemo } from 'react';
import { useAppContext } from '../contexts/AppContext';

const GammaScalper: React.FC<{ id?: string }> = ({ id }) => {
    const { gammaState, toggleGammaScalper } = useAppContext();
    const { isRunning, logs, totalPnl, iv } = gammaState;

    // Generate a simple SVG sparkline path from the last 20 logs' PnL
    const sparklinePath = useMemo(() => {
        if (logs.length < 2) return '';
        const recent = logs.slice(0, 20).reverse();
        const maxPnl = Math.max(...recent.map(l => l.net_pnl_today_usd), 0.01);
        const minPnl = Math.min(...recent.map(l => l.net_pnl_today_usd), -0.01);
        const range = maxPnl - minPnl || 1;
        
        return recent.map((log, i) => {
            const x = (i / (recent.length - 1)) * 100;
            const y = 100 - (((log.net_pnl_today_usd - minPnl) / range) * 100);
            return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
        }).join(' ');
    }, [logs]);

    return (
        <div id={id} className="h-full flex flex-col bg-black/60 p-2 rounded border border-slate-800 tech-panel min-h-[150px] relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-neon-pink/5 rounded-full blur-[40px] pointer-events-none group-hover:bg-neon-pink/10 transition-colors"></div>
            <div className="flex justify-between items-center mb-1 border-b border-white/10 pb-1 relative z-10">
                <div>
                    <h3 className="micro-label text-neon-pink drop-shadow-[0_0_5px_rgba(255,0,255,0.5)]">// GAMMA SCALPER</h3>
                </div>
                <button
                    onClick={toggleGammaScalper}
                    className={`px-2 py-0.5 rounded text-[8px] font-bold font-mono border transition-all ${
                        isRunning 
                        ? 'bg-red-900/30 border-red-500 text-red-400 hover:bg-red-900/50' 
                        : 'bg-neon-green/20 border-neon-green text-neon-green hover:bg-neon-green/30 hover:shadow-[0_0_10px_rgba(57,255,20,0.4)]'
                    }`}
                >
                    {isRunning ? 'STOP' : 'START'}
                </button>
            </div>

            <div className="grid grid-cols-2 gap-1 mb-1 relative z-10">
                <div className="bg-black/40 p-1 rounded border border-slate-800 relative overflow-hidden">
                    <div className="text-[8px] text-slate-500 font-mono relative z-10">PNL</div>
                    <div className={`text-xs font-mono font-bold relative z-10 ${totalPnl >= 0 ? 'text-neon-green' : 'text-red-400'}`}>
                        ${totalPnl.toFixed(2)}
                    </div>
                    {/* Sparkline background */}
                    <div className="absolute bottom-0 left-0 w-full h-full opacity-20 pointer-events-none">
                        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
                            <path d={sparklinePath} fill="none" stroke={totalPnl >= 0 ? '#39ff14' : '#ff0044'} strokeWidth="2" vectorEffect="non-scaling-stroke" />
                        </svg>
                    </div>
                </div>
                <div className="bg-black/40 p-1 rounded border border-slate-800">
                    <div className="text-[8px] text-slate-500 font-mono">IV</div>
                    <div className="text-xs text-neon-pink font-mono font-bold">{(iv * 100).toFixed(1)}%</div>
                </div>
            </div>

            <div className="flex-1 overflow-hidden relative border border-slate-800 rounded bg-[#08080a] z-10">
                <div className="absolute top-0 left-0 w-full bg-slate-900/80 border-b border-slate-800 p-1 flex text-[8px] font-mono text-slate-500 uppercase">
                    <span className="w-8">CYC</span>
                    <span className="w-10">ACT</span>
                    <span className="flex-1 text-right">PNL</span>
                </div>
                <div className="mt-4 h-full overflow-y-auto p-1 space-y-0.5 custom-scrollbar">
                    {logs.map((log) => (
                        <div key={log.cycle} className="flex text-[8px] font-mono text-slate-300 border-b border-slate-800/50 pb-0.5 hover:bg-white/5">
                            <span className="w-8 text-slate-600">#{log.cycle}</span>
                            <span className={`w-10 font-bold ${log.hedge_action.includes('BUY') ? 'text-neon-green' : 'text-red-400'}`}>{log.hedge_action === 'BUY_SPOT' ? 'BUY' : 'SELL'}</span>
                            <span className={`flex-1 text-right ${log.net_pnl_today_usd >= 0 ? 'text-neon-green' : 'text-red-400'}`}>
                                {log.net_pnl_today_usd >= 0 ? '+' : ''}{log.net_pnl_today_usd.toFixed(2)}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default GammaScalper;
