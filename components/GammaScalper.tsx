
import React from 'react';
import { useAppContext } from '../contexts/AppContext';

const GammaScalper: React.FC<{ id?: string }> = ({ id }) => {
    const { gammaState, toggleGammaScalper } = useAppContext();
    const { isRunning, logs, totalPnl, iv } = gammaState;

    return (
        <div id={id} className="h-full flex flex-col bg-slate-900/50 p-2 rounded border border-slate-800">
            <div className="flex justify-between items-center mb-2 border-b border-slate-700 pb-1">
                <div>
                    <h3 className="text-amber-400 font-mono font-bold text-xs">// GAMMA SCALPER</h3>
                </div>
                <button
                    onClick={toggleGammaScalper}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono border transition-all ${
                        isRunning 
                        ? 'bg-red-900/30 border-red-500 text-red-400 hover:bg-red-900/50' 
                        : 'bg-green-900/30 border-green-500 text-green-400 hover:bg-green-900/50'
                    }`}
                >
                    {isRunning ? 'STOP' : 'START'}
                </button>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-2">
                <div className="bg-black/40 p-1.5 rounded border border-slate-700">
                    <div className="text-[9px] text-slate-500 font-mono">PNL (SESSION)</div>
                    <div className={`text-sm font-mono ${totalPnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        ${totalPnl.toFixed(2)}
                    </div>
                </div>
                <div className="bg-black/40 p-1.5 rounded border border-slate-700">
                    <div className="text-[9px] text-slate-500 font-mono">IV</div>
                    <div className="text-sm text-violet-400 font-mono">{(iv * 100).toFixed(1)}%</div>
                </div>
            </div>

            <div className="flex-1 overflow-hidden relative border border-slate-800 rounded bg-black/60">
                <div className="absolute top-0 left-0 w-full bg-slate-900/80 border-b border-slate-800 p-1 flex text-[9px] font-mono text-slate-500">
                    <span className="w-10">CYC</span>
                    <span className="w-14">ACT</span>
                    <span className="flex-1 text-right">PNL</span>
                </div>
                <div className="mt-5 h-full overflow-y-auto p-1 space-y-0.5">
                    {logs.map((log) => (
                        <div key={log.cycle} className="flex text-[9px] font-mono text-slate-300 border-b border-slate-800/50 pb-0.5">
                            <span className="w-10 text-slate-500">#{log.cycle}</span>
                            <span className={`w-14 ${log.hedge_action.includes('BUY') ? 'text-green-400' : 'text-red-400'}`}>{log.hedge_action === 'BUY_SPOT' ? 'BUY' : 'SELL'}</span>
                            <span className={`flex-1 text-right ${log.net_pnl_today_usd >= 0 ? 'text-green-300' : 'text-red-300'}`}>
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
