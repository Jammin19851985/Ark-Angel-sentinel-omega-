import React from 'react';
import { useQuantumEngine } from '../hooks/useQuantumEngine';
import { Activity, Zap, Shield, Cpu, Network } from 'lucide-react';
import { motion } from 'motion/react';

export const QuantumMonitor: React.FC = () => {
    const { data, status, error } = useQuantumEngine();

    if (error) {
        return (
            <div className="p-4 bg-red-950/20 border border-red-900/50 rounded-lg font-mono text-[10px] text-red-400">
                <div className="flex items-center gap-2 mb-1">
                    <Shield className="w-3 h-3" />
                    <span className="font-bold uppercase tracking-widest">Quantum Link Fault</span>
                </div>
                <p className="opacity-70 uppercase">Error: {error}</p>
                <p className="mt-2 text-[8px] text-red-500/50">Retrying bridge synchronization...</p>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="p-4 bg-black/40 border border-slate-800 rounded-lg font-mono text-[10px] text-slate-500 animate-pulse">
                <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-3 h-3 text-slate-600" />
                    <span className="uppercase tracking-widest">Initializing Quantum Link...</span>
                </div>
                <div className="h-1 w-full bg-slate-900 rounded overflow-hidden">
                    <motion.div 
                        className="h-full bg-slate-700"
                        animate={{ x: ['-100%', '100%'] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 bg-black/60 border border-slate-800 rounded-lg font-mono relative overflow-hidden group">
            <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                    <Zap className={`w-3 h-3 ${status === 'CONNECTED' ? 'text-cyan-400 animate-pulse' : 'text-red-500'}`} />
                    <span className="text-[10px] font-bold text-slate-100 uppercase tracking-widest">
                        Quantum Reality Engine
                    </span>
                </div>
                <span className={`text-[8px] px-1.5 py-0.5 rounded border ${status === 'CONNECTED' ? 'border-emerald-500/30 text-emerald-500' : 'border-red-500/30 text-red-500'}`}>
                    {status}
                </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                    <div className="flex flex-col">
                        <span className="text-[8px] text-slate-500 uppercase flex items-center gap-1">
                            <Shield className="w-2 h-2" /> Qubit Coherence
                        </span>
                        <div className="flex items-baseline gap-2">
                            <span className="text-lg font-bold text-cyan-400">{data.qubit_coherence}%</span>
                            <motion.div 
                                className="h-1 bg-cyan-400/20 rounded-full flex-1 overflow-hidden"
                                initial={{ width: 0 }}
                                animate={{ width: '100%' }}
                            >
                                <motion.div 
                                    className="h-full bg-cyan-400"
                                    animate={{ width: `${data.qubit_coherence}%` }}
                                    transition={{ type: 'spring', stiffness: 100 }}
                                />
                            </motion.div>
                        </div>
                    </div>

                    <div className="flex flex-col">
                        <span className="text-[8px] text-slate-500 uppercase flex items-center gap-1">
                            <Activity className="w-2 h-2" /> Market Resonance
                        </span>
                        <span className="text-lg font-bold text-amber-500">
                            {(data.market_resonance * 100).toFixed(1)}%
                        </span>
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="flex flex-col">
                        <span className="text-[8px] text-slate-500 uppercase flex items-center gap-1">
                            <Cpu className="w-2 h-2" /> Causal Drift
                        </span>
                        <span className={`text-sm font-bold ${Math.abs(data.causal_drift) > 0.0005 ? 'text-red-400' : 'text-emerald-400'}`}>
                            {data.causal_drift.toFixed(6)}ns
                        </span>
                    </div>

                    <div className="flex flex-col">
                        <span className="text-[8px] text-slate-500 uppercase flex items-center gap-1">
                            <Network className="w-2 h-2" /> Active Swarm
                        </span>
                        <span className="text-sm font-bold text-indigo-400">
                            {data.active_agents} AGENTS
                        </span>
                    </div>
                </div>
            </div>

            <div className="mt-4 pt-2 border-t border-slate-800/50 flex justify-between items-center opacity-50">
                <span className="text-[8px] text-slate-600 uppercase">Entropy: {data.entropy_level}</span>
                <span className="text-[8px] text-slate-600 uppercase">TS: {new Date(data.timestamp * 1000).toLocaleTimeString()}</span>
            </div>

            {/* Scanning line effect */}
            <motion.div 
                className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent h-1/2 w-full pointer-events-none"
                animate={{ top: ['-100%', '200%'] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
            />
        </div>
    );
};
