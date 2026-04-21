
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ActivityIcon } from './icons/ActivityIcon';
import { ShieldIcon } from './icons/ShieldIcon';
import { BrainCircuitIcon } from './icons/BrainCircuitIcon';

const HyperTemporalExecution: React.FC = () => {
    const { inversionLogs, quantumMetrics, performRealityCorrection } = useAppContext();
    const [selectedLogId, setSelectedLogId] = useState<string | null>(null);

    const selectedLog = inversionLogs.find(l => l.id === selectedLogId);

    return (
        <div className="flex flex-col h-full bg-[#050505] border border-slate-800 rounded-sm overflow-hidden font-mono text-[10px] shadow-2xl">
            {/* Header */}
            <div className="bg-slate-900/80 p-2 border-b border-slate-700 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse"></div>
                    <span className="text-cyan-400 font-bold tracking-widest uppercase">Hyper-Temporal Execution Interface</span>
                </div>
                <span className="text-slate-500 text-[8px]">v204.0_STABLE</span>
            </div>

            {/* Metrics Bar */}
            <div className="grid grid-cols-3 gap-1 p-2 bg-black/40 border-b border-slate-800">
                <div className="flex flex-col">
                    <span className="text-[7px] text-slate-500 uppercase">Causal Drift</span>
                    <span className={`text-xs font-bold ${quantumMetrics.drift > 0.04 ? 'text-red-500' : 'text-cyan-400'}`}>
                        {(quantumMetrics.drift * 100).toFixed(4)}%
                    </span>
                </div>
                <div className="flex flex-col">
                    <span className="text-[7px] text-slate-500 uppercase">Anchor Stability</span>
                    <span className="text-xs font-bold text-emerald-400">
                        {(quantumMetrics.realityAnchorStability * 100).toFixed(2)}%
                    </span>
                </div>
                <div className="flex flex-col">
                    <span className="text-[7px] text-slate-500 uppercase">Inversion Depth</span>
                    <span className="text-xs font-bold text-violet-400">
                        -{Math.abs(quantumMetrics.executionLatency * 100).toFixed(2)}ms
                    </span>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-h-0">
                {/* Log List */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-1 space-y-1">
                    <AnimatePresence initial={false}>
                        {inversionLogs.map((log) => (
                            <motion.div
                                key={log.id}
                                layout
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                onClick={() => setSelectedLogId(log.id)}
                                className={`p-2 border rounded-sm cursor-pointer transition-all ${
                                    selectedLogId === log.id 
                                    ? 'bg-cyan-950/30 border-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.2)]' 
                                    : 'bg-black/40 border-slate-800 hover:border-slate-600'
                                }`}
                            >
                                <div className="flex justify-between items-center mb-1">
                                    <span className={`font-bold ${log.action === 'BUY' ? 'text-green-500' : 'text-red-500'}`}>
                                        {log.action} {log.symbol}
                                    </span>
                                    <span className="text-[8px] text-slate-500">{log.id}</span>
                                </div>
                                <div className="flex justify-between text-[8px]">
                                    <span className="text-violet-400">T-MINUS: {(log.temporalAnchors.tZero - log.temporalAnchors.tMinus).toFixed(2)}ms</span>
                                    <span className={log.type === 'PARADOX' ? 'text-red-500 animate-pulse' : 'text-emerald-500'}>
                                        {log.type}
                                    </span>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                    {inversionLogs.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center text-slate-600 italic opacity-50">
                            <ActivityIcon className="w-8 h-8 mb-2 animate-pulse" />
                            <span>Awaiting Temporal Events...</span>
                        </div>
                    )}
                </div>

                {/* Detail Panel */}
                {selectedLog && (
                    <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        className="bg-slate-900/90 border-t border-cyan-900/50 p-3 space-y-2 overflow-hidden"
                    >
                        <div className="flex items-center justify-between border-b border-slate-800 pb-1 mb-2">
                            <span className="text-cyan-400 font-bold uppercase text-[9px]">Vector of Truth Analysis</span>
                            <button onClick={() => setSelectedLogId(null)} className="text-slate-500 hover:text-white">×</button>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <span className="text-[7px] text-slate-500 uppercase">Predicted State Hash</span>
                                <div className="bg-black p-1 border border-slate-800 text-[9px] text-cyan-500 font-mono break-all">
                                    0x{selectedLog.vectorOfTruth.predictedStateHash}
                                </div>
                            </div>
                            <div className="space-y-1">
                                <span className="text-[7px] text-slate-500 uppercase">Manifested State Hash</span>
                                <div className="bg-black p-1 border border-slate-800 text-[9px] text-emerald-500 font-mono break-all">
                                    0x{selectedLog.vectorOfTruth.manifestedStateHash}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between text-[8px] pt-1">
                            <span className="text-slate-400">Causal Drift Score:</span>
                            <span className="text-cyan-400">{(selectedLog.vectorOfTruth.causalDriftScore * 100).toFixed(6)}%</span>
                        </div>

                        <div className="w-full h-1 bg-black rounded-full overflow-hidden mt-1">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${(1 - selectedLog.vectorOfTruth.causalDriftScore) * 100}%` }}
                                className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500"
                            />
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Footer Controls */}
            <div className="p-2 border-t border-slate-800 bg-black/60 space-y-2">
                <div className="flex justify-between items-center text-[8px]">
                    <span className="text-slate-500 uppercase">Reality Anchor:</span>
                    <span className={quantumMetrics.realityAnchorStability > 0.9 ? 'text-emerald-500' : 'text-amber-500'}>
                        {quantumMetrics.realityAnchorStability > 0.9 ? 'LOCKED' : 'DEGRADING'}
                    </span>
                </div>
                <button 
                    onClick={performRealityCorrection}
                    className="w-full py-2 bg-cyan-950/30 border border-cyan-500/50 text-cyan-400 text-[9px] font-bold tracking-widest hover:bg-cyan-500 hover:text-black transition-all rounded-sm uppercase flex items-center justify-center gap-2"
                >
                    <ShieldIcon className="w-3 h-3" />
                    Nullify Causal Drift
                </button>
            </div>
        </div>
    );
};

export default HyperTemporalExecution;
