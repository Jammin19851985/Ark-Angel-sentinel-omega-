
import React, { useRef, useEffect } from 'react';
import { InversionEventLog } from '../types';

interface ForensicAuditLogProps {
    logs: InversionEventLog[];
}

const ForensicAuditLog: React.FC<ForensicAuditLogProps> = ({ logs }) => {
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = 0; // Newest logs are at the top usually, or we can auto scroll to bottom if reversed.
        }
    }, [logs]);

    return (
        <div className="flex flex-col h-full bg-black/60 border border-slate-800 rounded-lg overflow-hidden font-mono text-[10px]">
            <div className="bg-slate-900/80 p-2 border-b border-slate-700 flex justify-between items-center">
                <span className="text-amber-500 font-bold tracking-widest">// FORENSIC AUDIT: TEMPORAL EVENTS</span>
                <span className="text-slate-500">ZERO-LAG & PARADOX VERIFICATION</span>
            </div>
            
            {/* Header */}
            <div className="grid grid-cols-12 gap-1 p-2 bg-slate-900/50 text-slate-500 font-bold border-b border-slate-800">
                <div className="col-span-2">EVENT_ID</div>
                <div className="col-span-1">SYM</div>
                <div className="col-span-2 text-right">T-MINUS (PRED)</div>
                <div className="col-span-2 text-right">T-ZERO (MKT)</div>
                <div className="col-span-2 text-right text-cyan-400">DELTA (LAG)</div>
                <div className="col-span-1 text-right">DRIFT</div>
                <div className="col-span-2 text-right">HASH_MATCH</div>
            </div>

            {/* Rows */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-1 space-y-0.5">
                {logs.length === 0 ? (
                    <div className="text-center text-slate-600 mt-10 italic">Awaiting Causal Collapse...</div>
                ) : (
                    logs.map((log) => {
                        const isParadox = log.type === 'PARADOX';
                        const isZeroLag = log.temporalAnchors.latencyDelta <= 0;
                        const driftColor = log.vectorOfTruth.causalDriftScore < 0.0001 ? 'text-green-400' : 'text-amber-400';
                        const hashMatch = log.vectorOfTruth.predictedStateHash === log.vectorOfTruth.manifestedStateHash;

                        return (
                            <div key={log.id} className={`grid grid-cols-12 gap-1 p-1 hover:bg-white/5 border-b border-white/5 items-center transition-colors ${isParadox ? 'bg-violet-900/20' : ''}`}>
                                <div className={`col-span-2 truncate ${isParadox ? 'text-violet-400' : 'text-slate-400'}`} title={log.id}>
                                    {isParadox ? 'PARADOX-' : ''}{log.id.substring(0, 12)}...
                                </div>
                                <div className={`col-span-1 font-bold ${log.action === 'BUY' ? 'text-green-500' : 'text-red-500'}`}>
                                    {log.symbol}
                                </div>
                                <div className="col-span-2 text-right text-slate-500">
                                    {log.temporalAnchors.tMinus.toString().slice(-6)}
                                </div>
                                <div className="col-span-2 text-right text-slate-300">
                                    {log.temporalAnchors.tZero.toString().slice(-6)}
                                </div>
                                <div className={`col-span-2 text-right font-bold ${isZeroLag ? 'text-cyan-400 glow-text-cyan' : 'text-red-500'}`}>
                                    {log.temporalAnchors.latencyDelta.toFixed(3)}ms
                                </div>
                                <div className={`col-span-1 text-right ${driftColor}`}>
                                    {log.vectorOfTruth.causalDriftScore.toFixed(5)}
                                </div>
                                <div className="col-span-2 text-right text-xs">
                                    {hashMatch ? (
                                        <span className="text-green-500 bg-green-900/20 px-1 rounded">VERIFIED</span>
                                    ) : (
                                        <span className="text-red-500 bg-red-900/20 px-1 rounded">DIVERGENCE</span>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
            
            {/* Footer Stats */}
            <div className="p-2 border-t border-slate-800 bg-slate-900/30 flex justify-between text-slate-400">
                <span>RECORDS: {logs.length}</span>
                <span>PARADOXES: {logs.filter(l => l.type === 'PARADOX').length}</span>
            </div>
        </div>
    );
};

export default ForensicAuditLog;
