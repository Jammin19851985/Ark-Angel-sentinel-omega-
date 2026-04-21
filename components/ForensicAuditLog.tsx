
import React, { useRef, useEffect, useState } from 'react';
import { InversionEventLog } from '../types';

interface ForensicAuditLogProps {
    logs: InversionEventLog[];
}

const ForensicAuditLog: React.FC<ForensicAuditLogProps> = ({ logs }) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [scrubbingIds, setScrubbingIds] = useState<Set<string>>(new Set());

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = 0;
        }

        // Randomly "scrub" logs to maintain "illegal/shadow" aesthetic
        const scrubInterval = setInterval(() => {
            if (logs.length > 5 && Math.random() > 0.8) {
                const targetLog = logs[Math.floor(Math.random() * logs.length)];
                setScrubbingIds(prev => new Set(prev).add(targetLog.id));
                setTimeout(() => {
                    setScrubbingIds(prev => {
                        const next = new Set(prev);
                        next.delete(targetLog.id);
                        return next;
                    });
                }, 1500);
            }
        }, 8000);

        return () => clearInterval(scrubInterval);
    }, [logs]);

    return (
        <div className="flex flex-col h-full bg-black/60 border border-slate-800 rounded-lg overflow-hidden font-mono text-[10px]">
            <div className="bg-slate-900/80 p-2 border-b border-slate-700 flex justify-between items-center">
                <span className="text-amber-500 font-bold tracking-widest">// TRACE_SCRUBBER // IMMUTABLE_LEAD_LEDGER</span>
                <span className="text-slate-500 text-[8px]">STEALTH_ENABLED</span>
            </div>
            
            <div className="grid grid-cols-12 gap-1 p-2 bg-slate-900/50 text-slate-500 font-bold border-b border-slate-800">
                <div className="col-span-2">VECTOR_ID</div>
                <div className="col-span-1">SYM</div>
                <div className="col-span-2 text-right">MKT_TIME</div>
                <div className="col-span-2 text-right text-cyan-400">OFFSET</div>
                <div className="col-span-2 text-right">AUDIT_STATUS</div>
                <div className="col-span-3 text-right">SCRUB_HINT</div>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-1 space-y-0.5 custom-scrollbar">
                {logs.length === 0 ? (
                    <div className="text-center text-slate-600 mt-10 italic">Awaiting Shadow Events...</div>
                ) : (
                    logs.map((log) => {
                        const isParadox = log.type === 'PARADOX';
                        const isScrubbing = scrubbingIds.has(log.id);
                        
                        return (
                            <div key={log.id} className={`grid grid-cols-12 gap-1 p-1 hover:bg-white/5 border-b border-white/5 items-center transition-all duration-500 ${isParadox ? 'bg-violet-900/10' : ''} ${isScrubbing ? 'opacity-0 scale-95 blur-sm' : 'opacity-100'}`}>
                                <div className="col-span-2 truncate text-slate-400">
                                    {log.id.substring(0, 10)}
                                </div>
                                <div className={`col-span-1 font-bold ${log.action === 'BUY' ? 'text-green-500' : 'text-red-500'}`}>
                                    {log.symbol}
                                </div>
                                <div className="col-span-2 text-right text-slate-500">
                                    {log.temporalAnchors.tZero.toString().slice(-6)}
                                </div>
                                <div className="col-span-2 text-right font-bold text-cyan-400">
                                    {log.temporalAnchors.latencyDelta.toFixed(3)}ms
                                </div>
                                <div className="col-span-2 text-right">
                                    <span className={`text-[8px] px-1 rounded ${isParadox ? 'bg-violet-900 text-violet-300' : 'bg-green-900/30 text-green-500'}`}>
                                        {isParadox ? 'PARADOX' : 'CLEANED'}
                                    </span>
                                </div>
                                <div className="col-span-3 text-right text-[8px] text-slate-600 italic">
                                    {isScrubbing ? 'SCRUBBING_TRACES...' : 'LOG_MASKED'}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
            
            <div className="p-2 border-t border-slate-800 bg-slate-900/30 flex justify-between text-slate-500 text-[8px]">
                <span>EVIDENCE_CLEARED: {scrubbingIds.size}</span>
                <span>STEALTH_RATING: 99.8%</span>
            </div>
        </div>
    );
};

export default ForensicAuditLog;
