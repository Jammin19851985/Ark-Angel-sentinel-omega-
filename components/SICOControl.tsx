import React from 'react';
import { useAppContext } from '../contexts/AppContext';
import { ActivityIcon } from './icons/ActivityIcon';
import { PowerIcon } from './icons/PowerIcon';

const SICOControl: React.FC = () => {
    const { sicoActive, setSicoActive, sicoConfig, setSicoConfig, sicoCollapses } = useAppContext();

    const handleToggle = () => {
        setSicoActive(!sicoActive);
    };

    return (
        <div className="bg-black/60 border border-slate-800 rounded-sm p-4 font-mono flex flex-col space-y-4 relative overflow-hidden group hover:border-amber-500/30 transition-colors duration-500 shadow-2xl">
            {/* Background scanner line effect */}
            <div className="absolute top-0 left-0 w-full h-[1px] bg-amber-500/10 animate-scan pointer-events-none" />

            {/* Header */}
            <div className="flex justify-between items-center border-b border-white/5 pb-2 mb-1">
                <div className="flex flex-col">
                    <h3 className="text-[10px] font-bold text-amber-500 uppercase tracking-widest flex items-center gap-2">
                        <ActivityIcon className="w-3 h-3 text-amber-500" />
                        SICO_Engine_v1
                    </h3>
                    <span className="text-[8px] text-slate-600 font-bold mt-0.5 tracking-tighter">[ SICO_CONFIG ]</span>
                </div>
                <button 
                    onClick={handleToggle}
                    className={`p-1.5 rounded-full transition-all border ${sicoActive ? 'bg-amber-500 border-amber-300 text-black shadow-[0_0_15px_rgba(245,158,11,0.5)]' : 'bg-slate-900 border-slate-700 text-slate-500'}`}
                >
                    <PowerIcon className="w-3 h-3" />
                </button>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-2 gap-2">
                <div className="bg-black/40 p-2 rounded border border-white/5 shadow-inner">
                    <div className="text-[8px] text-slate-500 uppercase font-bold tracking-tighter">Total Collapses</div>
                    <div className="text-sm font-bold text-slate-200 tracking-tighter">{sicoCollapses.toLocaleString()}</div>
                </div>
                <div className="bg-black/40 p-2 rounded border border-white/5 shadow-inner">
                    <div className="text-[8px] text-slate-500 uppercase font-bold tracking-tighter">System Integrity</div>
                    <div className="flex items-center gap-1.5 mt-1">
                        <div className={`w-1.5 h-1.5 rounded-full ${sicoActive ? 'bg-emerald-500 shadow-[0_0_5px_emerald]' : 'bg-slate-700 animate-pulse'}`}></div>
                        <span className="text-[9px] font-bold text-slate-200">{sicoActive ? 'NOMINAL' : 'STANDBY'}</span>
                    </div>
                </div>
            </div>

            {/* Configuration Inputs */}
            <div className="space-y-5">
                {/* Coherence Window */}
                <div className="space-y-2">
                    <div className="flex justify-between text-[9px] font-bold">
                        <span className="text-slate-400">COHERENCE_WINDOW_NS</span>
                        <span className="text-amber-500/70" title="Safety factor for Majorana Core">MANDATE: 1.1</span>
                    </div>
                    <div className="flex gap-3 items-center bg-black/30 p-2 rounded border border-white/5">
                        <input 
                            type="range" 
                            min="10" 
                            max="500" 
                            step="0.1"
                            value={sicoConfig.coherenceWindowNs}
                            onChange={(e) => setSicoConfig({ coherenceWindowNs: parseFloat(e.target.value) })}
                            className="flex-1 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                        />
                        <div className="relative">
                            <input 
                                type="number"
                                step="0.1"
                                value={sicoConfig.coherenceWindowNs}
                                onChange={(e) => setSicoConfig({ coherenceWindowNs: parseFloat(e.target.value) || 0 })}
                                className="w-16 bg-black border border-slate-700 rounded px-1.5 py-1 text-xs text-amber-500 focus:border-amber-400 outline-none text-right font-bold shadow-inner"
                            />
                            <span className="absolute -top-3 right-0 text-[7px] text-slate-600 font-bold uppercase">ns</span>
                        </div>
                    </div>
                </div>

                {/* Alpha Threshold */}
                <div className="space-y-2">
                    <div className="flex justify-between text-[9px] font-bold">
                        <span className="text-slate-400">MIN_ALPHA_THRESHOLD</span>
                        <span className="text-amber-500/70" title="Entropy-adjusted minimum spread">MANDATE: 1.3</span>
                    </div>
                    <div className="flex gap-3 items-center bg-black/30 p-2 rounded border border-white/5">
                        <input 
                            type="range" 
                            min="0.0001" 
                            max="0.02" 
                            step="0.0001"
                            value={sicoConfig.minAlphaThreshold}
                            onChange={(e) => setSicoConfig({ minAlphaThreshold: parseFloat(e.target.value) })}
                            className="flex-1 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                        />
                        <div className="relative">
                            <input 
                                type="number"
                                step="0.0001"
                                value={sicoConfig.minAlphaThreshold}
                                onChange={(e) => setSicoConfig({ minAlphaThreshold: parseFloat(e.target.value) || 0 })}
                                className="w-20 bg-black border border-slate-700 rounded px-1.5 py-1 text-xs text-amber-500 focus:border-amber-400 outline-none text-right font-bold shadow-inner"
                            />
                            <span className="absolute -top-3 right-0 text-[7px] text-slate-600 font-bold uppercase">ratio</span>
                        </div>
                    </div>
                    <div className="flex justify-between items-center px-1">
                        <span className="text-[8px] text-slate-600 italic">Target Spread</span>
                        <span className="text-[10px] text-slate-400 font-bold">
                            {(sicoConfig.minAlphaThreshold * 100).toFixed(2)}% 
                            <span className="text-amber-900 mx-1">/</span>
                            <span className="text-amber-600/80">{(sicoConfig.minAlphaThreshold * 10000).toFixed(0)} bps</span>
                        </span>
                    </div>
                </div>
            </div>

            {/* Engineering Status Footer */}
            {sicoActive ? (
                <div className="text-[7px] text-amber-500/80 bg-amber-500/5 p-2 rounded border border-amber-500/20 italic animate-pulse flex items-start gap-2">
                    <span className="text-amber-500">&gt;&gt;</span>
                    <span>Composite orders are atomic. Loss of coherence results in immediate state rejection.</span>
                </div>
            ) : (
                <div className="text-[7px] text-slate-600 p-2 rounded border border-white/5 italic flex items-start gap-2">
                    <span className="text-slate-700">&gt;&gt;</span>
                    <span>Engine standby. Logic manifold disengaged from live execution spine.</span>
                </div>
            )}
        </div>
    );
};

export default SICOControl;