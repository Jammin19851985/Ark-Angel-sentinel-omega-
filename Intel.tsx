
import React, { useState, useMemo } from 'react';
import { GRAND_SLAM_FEATURES } from './constants';

interface IntelProps { id: string; }

const Intel: React.FC<IntelProps> = ({ id }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFeature, setSelectedFeature] = useState<any>(null);
    const [filterTier, setFilterTier] = useState<'ALL' | 'OMEGA' | 'COSMIC' | 'ABSOLUTE'>('ALL');

    const filtered = useMemo(() => {
        return GRAND_SLAM_FEATURES.filter(f => {
            const matchesSearch = f.name.toLowerCase().includes(searchTerm.toLowerCase());
            if (!matchesSearch) return false;
            
            if (filterTier === 'ALL') return true;
            if (filterTier === 'OMEGA') return f.id >= 172 && f.id <= 181;
            if (filterTier === 'COSMIC') return f.id >= 182 && f.id <= 191;
            if (filterTier === 'ABSOLUTE') return f.id >= 192 && f.id <= 200;
            return true;
        });
    }, [searchTerm, filterTier]);

    return (
        <div id={id} className="bg-black/30 backdrop-blur-sm border border-slate-800 rounded-lg shadow-lg flex flex-col h-full glow-border flex-1 font-mono">
            <div className="p-4 border-b border-slate-800 flex flex-col lg:flex-row justify-between lg:items-center bg-black/40 gap-4">
                <div>
                    <h2 className="text-sm font-bold text-neon-cyan font-mono uppercase tracking-tighter">// THE CODEX // TRANSLATION MATRIX</h2>
                    <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest">v204.0 LIVING SYSTEM ENCYCLOPEDIA</p>
                </div>
                <div className="flex items-center space-x-2">
                    <div className="flex bg-black/60 rounded border border-slate-800 p-0.5">
                        {['ALL', 'OMEGA', 'COSMIC', 'ABSOLUTE'].map(t => (
                            <button
                                key={t}
                                onClick={() => setFilterTier(t as any)}
                                className={`px-2 py-1 text-[8px] font-bold rounded transition-all ${filterTier === t ? 'bg-cyan-900/50 text-cyan-400' : 'text-slate-600 hover:text-slate-400'}`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                    <input 
                        type="text" 
                        placeholder="SCAN PROTOCOLS..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-black/60 border border-slate-700 rounded px-2 py-1.5 text-[10px] font-mono text-cyan-400 focus:border-cyan-400 outline-none w-48"
                    />
                </div>
            </div>
            
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-0 overflow-hidden">
                {/* List View */}
                <div className="lg:col-span-2 overflow-y-auto p-4 border-r border-slate-800 bg-black/20">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {filtered.map(f => (
                            <button 
                                key={f.id}
                                onClick={() => setSelectedFeature(f)}
                                className={`flex flex-col text-left p-3 rounded border transition-all group ${selectedFeature?.id === f.id ? 'bg-cyan-900/30 border-cyan-500 shadow-[0_0_15px_rgba(0,243,255,0.2)]' : 'bg-black/40 border-slate-800 hover:border-slate-600'}`}
                            >
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-[10px] text-slate-500 font-mono tracking-widest">CODE: F{f.id}</span>
                                    <span className={`text-[8px] px-1.5 py-0.5 rounded uppercase font-bold ${f.id >= 192 ? 'bg-amber-950 text-amber-400 border border-amber-500/30 animate-pulse' : f.id >= 182 ? 'bg-indigo-950 text-indigo-400 border border-indigo-500/30' : 'bg-cyan-950 text-cyan-400'}`}>
                                        {f.id >= 192 ? 'ABSOLUTE' : f.id >= 182 ? 'COSMIC' : 'SOVEREIGN'}
                                    </span>
                                </div>
                                <div className="text-xs font-bold text-slate-100 uppercase tracking-widest group-hover:text-cyan-400 transition-colors">{f.name}</div>
                                <div className="text-[8px] text-slate-600 mt-1 truncate uppercase">{f.description?.substring(0, 40)}...</div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Detail View */}
                <div className="lg:col-span-1 p-6 bg-black/40 overflow-y-auto relative">
                    {selectedFeature ? (
                        <div className="space-y-6 animate-fade-in-fast">
                            <div className="border-b border-cyan-500/30 pb-4">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-[10px] font-mono text-cyan-700 uppercase">Axiomatic Constant</span>
                                    <span className="text-[9px] text-emerald-500 font-bold">UPB-1_SEALED</span>
                                </div>
                                <h3 className="text-2xl font-display font-bold text-cyan-400 glow-text-cyan uppercase leading-tight tracking-tighter">{selectedFeature.name}</h3>
                                <p className="text-[10px] font-mono text-slate-400 mt-3 uppercase tracking-[0.2em]">Protocol ARCH-F-{selectedFeature.id}-OMEGA</p>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <span className="text-[10px] font-mono text-cyan-700 uppercase block mb-2 tracking-widest">Absolute Briefing</span>
                                    <div className="text-sm text-slate-200 leading-relaxed font-sans bg-white/5 p-4 rounded border border-white/5 italic shadow-inner">
                                        "{selectedFeature.description}"
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="p-3 bg-black/60 border border-slate-800 rounded">
                                        <span className="text-[8px] text-slate-500 uppercase block mb-1">Reality Impact</span>
                                        <span className="text-[10px] text-amber-500 font-bold uppercase">Infinite_Scaling</span>
                                    </div>
                                    <div className="p-3 bg-black/60 border border-slate-800 rounded">
                                        <span className="text-[8px] text-slate-500 uppercase block mb-1">Causal Stability</span>
                                        <span className="text-[10px] text-green-400 font-bold uppercase">100%_Finality</span>
                                    </div>
                                </div>

                                <div className="bg-cyan-950/20 border border-cyan-500/20 p-4 rounded-lg relative overflow-hidden group">
                                    <div className="absolute top-0 left-0 w-full h-0.5 bg-cyan-500 animate-pulse"></div>
                                    <span className="text-[9px] font-mono text-cyan-400 uppercase block mb-2 font-bold tracking-widest">Forensic Execution Hash</span>
                                    <div className="text-[10px] font-mono text-cyan-500/70 break-all bg-black/40 p-2 rounded">
                                        SHA-512:{Math.random().toString(36).substring(2, 15).toUpperCase()}
                                        {Math.random().toString(36).substring(2, 15).toUpperCase()}
                                        {Math.random().toString(36).substring(2, 15).toUpperCase()}
                                    </div>
                                    <div className="mt-3 flex justify-between items-center text-[8px] text-cyan-800 font-bold">
                                        <span>MLEM_GENERATOR: ACTIVE</span>
                                        <span>XEDO_LEGAL: VERIFIED</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-20">
                            <div className="text-9xl text-cyan-900 font-display">Ω</div>
                            <p className="text-[10px] font-mono uppercase tracking-[0.6em] text-slate-500">Awaiting Signal Collapse</p>
                        </div>
                    )}
                </div>
            </div>
            
            {/* Background decorative scanlines */}
            <div className="absolute inset-0 pointer-events-none opacity-5 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-0 bg-[length:100%_2px,3px_100%]"></div>
        </div>
    );
};

export default Intel;
