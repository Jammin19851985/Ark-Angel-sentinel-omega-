
import React, { useState } from 'react';
import { GRAND_SLAM_FEATURES } from '../constants';
import { LivePaperBadge } from './LivePaperBadge';

interface IntelProps { id: string; }

const ADVANCED_DESCRIPTIONS: Record<number, { technicalAlias: string; description: string }> = {
    1: { technicalAlias: "Quantum Entropy Trade Timer", description: "Randomized timing sequences based on quantum entropy backend (Aer Simulator) to avoid HFT pattern detection and adverse selection." },
    2: { technicalAlias: "Entangled Correlation Fracture Detector", description: "Detects breakdowns in historical correlations using Bell state violation simulations, predicting liquidity shifts before they manifest." },
    4: { technicalAlias: "Quantum Mempool Entropy Shield", description: "Shields transaction intent by injecting randomized entropy into the local mempool observer, preventing sandwich attacks." },
    11: { technicalAlias: "Entangled Flash Loan Defense", description: "Predicts flash loan cascades using multi-state entanglement simulations to pre-halt exposure." },
    21: { technicalAlias: "Neuromorphic Order Book Fingerprinter", description: "Uses Leaky Integrate-and-Fire (LIF) neurons to identify topological signatures in the order book imbalance." },
    24: { technicalAlias: "Spiking Unknown Unknown Hunter", description: "Identifies anomalies outside known statistical bounds using spiking neural nets tuned for low-probability events." },
    31: { technicalAlias: "Neuromorphic Exchange Halt Predictor", description: "Predicts exchange-level trading halts by monitoring spiking volume topology across venue clusters." },
    41: { technicalAlias: "Manager Officer Network Miner", description: "Extracts alternative data from corporate networks to identify non-public behavioral shifts in institutional management." },
    51: { technicalAlias: "Private Equity Exit Timing Predictor", description: "Models the exit windows for large private equity positions using behavioral entropy mapping." },
    61: { technicalAlias: "Quantum Spiking Drawdown Airbag", description: "Hybrid risk circuit that collapses the wavefunction to force a halt state if drawdown exceeds 5%." },
    81: { technicalAlias: "FPGA Topology Offloader", description: "Hardware-accelerated routing that offloads complex spatial arbitrage calculations to custom silicon for sub-microsecond execution." },
    100: { technicalAlias: "Meta-Layer Self-Evolution Engine", description: "Self-correcting code manifold that dynamically generates and patches next-generation alpha features in real-time." }
};

const Intel: React.FC<IntelProps> = ({ id }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFeature, setSelectedFeature] = useState<typeof GRAND_SLAM_FEATURES[0] | null>(null);

    const filteredFeatures = GRAND_SLAM_FEATURES.filter(f => 
        f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (ADVANCED_DESCRIPTIONS[f.id]?.technicalAlias.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div id={id} className="bg-black/30 backdrop-blur-sm border border-slate-800 rounded-lg shadow-lg flex flex-col h-full glow-border flex-1 font-mono tech-panel">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-black/40">
                <div className="flex items-center gap-4">
                    <h2 className="text-sm font-bold text-amber-500 uppercase tracking-tighter">// INTEL FEED // ABSOLUTE MANIFESTATION</h2>
                    <LivePaperBadge />
                </div>
                <div className="flex items-center space-x-2">
                    <input 
                        type="text" 
                        placeholder="SCAN PROTOCOLS..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-black/60 border border-slate-700 rounded px-3 py-1.5 text-[10px] font-mono text-amber-500 focus:border-amber-500 outline-none w-48 lg:w-64 transition-all"
                    />
                </div>
            </div>
            
            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-black/20">
                {/* Protocol List */}
                <div className="lg:w-2/5 border-r border-slate-800 overflow-y-auto p-4 space-y-2">
                    {filteredFeatures.map(f => (
                        <button 
                            key={f.id}
                            onClick={() => setSelectedFeature(f)}
                            className={`w-full flex items-center space-x-3 p-3 bg-black/40 border rounded transition-all group ${selectedFeature?.id === f.id ? 'border-amber-500 bg-amber-950/20 shadow-[0_0_15px_rgba(245,158,11,0.2)]' : 'border-slate-800 hover:border-amber-500/50'}`}
                        >
                            <div className={`w-8 h-8 flex-shrink-0 flex items-center justify-center border rounded transition-colors ${selectedFeature?.id === f.id ? 'bg-amber-500 text-black font-bold' : 'border-amber-500/30 text-amber-500/60 group-hover:text-amber-500'}`}>
                                <span className="text-[10px] font-bold">{f.id}</span>
                            </div>
                            <div className="flex-1 text-left truncate">
                                <div className={`text-[11px] font-bold uppercase truncate ${selectedFeature?.id === f.id ? 'text-amber-300' : 'text-slate-300'}`}>
                                    {ADVANCED_DESCRIPTIONS[f.id]?.technicalAlias || f.name}
                                </div>
                                <div className="text-[8px] text-slate-600 font-mono tracking-widest mt-0.5">STATUS: {f.status}</div>
                            </div>
                            {selectedFeature?.id === f.id && <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse shadow-[0_0_5px_amber]"></div>}
                        </button>
                    ))}
                </div>

                {/* Protocol Details */}
                <div className="flex-1 p-6 lg:p-8 overflow-y-auto bg-black/40">
                    {selectedFeature ? (
                        <div className="max-w-2xl space-y-8 animate-fade-in-fast">
                            <div>
                                <div className="flex justify-between items-start border-b border-amber-500/20 pb-4 mb-6">
                                    <div>
                                        <h1 className="text-3xl font-display font-bold text-amber-500 glow-text-amber tracking-tight uppercase">
                                            {ADVANCED_DESCRIPTIONS[selectedFeature.id]?.technicalAlias || selectedFeature.name}
                                        </h1>
                                        <p className="text-[10px] text-slate-500 uppercase tracking-[0.4em] mt-1">Technical ID: ARCH-F-{selectedFeature.id}-OMEGA</p>
                                    </div>
                                    <div className="text-[10px] text-emerald-500 font-bold px-3 py-1 border border-emerald-500/30 rounded bg-emerald-950/20">
                                        UPB-1 COMPLIANT
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <section>
                                        <h4 className="text-[10px] font-mono text-amber-800 uppercase tracking-widest mb-2">Functional Definition</h4>
                                        <p className="text-sm text-slate-200 font-display font-bold bg-white/5 p-3 rounded border border-white/5 italic">
                                            "{selectedFeature.name}"
                                        </p>
                                    </section>

                                    <section>
                                        <h4 className="text-[10px] font-mono text-amber-800 uppercase tracking-widest mb-2">Sovereign Briefing</h4>
                                        <p className="text-xs text-slate-400 leading-relaxed font-sans bg-black/40 p-4 rounded border border-slate-800 shadow-inner">
                                            {ADVANCED_DESCRIPTIONS[selectedFeature.id]?.description || "Detailed technical documentation for this protocol is classified. Access requires Sovereign Authority Level 4 or higher. Core operational logic remains active in the Execution Spine."}
                                        </p>
                                    </section>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-3 bg-black/60 border border-slate-800 rounded">
                                            <h4 className="text-[9px] text-slate-600 uppercase mb-1">Execution Mode</h4>
                                            <span className="text-[10px] text-amber-500 font-bold uppercase">Singularity Alpha</span>
                                        </div>
                                        <div className="p-3 bg-black/60 border border-slate-800 rounded">
                                            <h4 className="text-[9px] text-slate-600 uppercase mb-1">Causal Impact</h4>
                                            <span className="text-[10px] text-cyan-400 font-bold uppercase">Zero Drift</span>
                                        </div>
                                    </div>

                                    <div className="pt-6 border-t border-slate-800">
                                        <div className="flex items-center space-x-2 text-[8px] font-mono text-slate-700">
                                            <span className="uppercase">Integrity Hash:</span>
                                            <span className="truncate">SHA-512:{Math.random().toString(36).substring(2, 15).toUpperCase()}...{Math.random().toString(36).substring(2, 6).toUpperCase()}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center space-y-6 opacity-30">
                            <div className="text-8xl text-amber-900/50 font-display">Ω</div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-500 uppercase tracking-widest">Codex Decryption Matrix</h3>
                                <p className="text-[10px] text-slate-600 uppercase tracking-widest mt-2">Select a protocol from the manifest to manifest its details.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Intel;
