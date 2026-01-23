
import React, { useEffect, useRef, useState, useMemo } from 'react';
import { LogEntry } from '../types';
import { DownloadIcon } from './icons/DownloadIcon';
import { useAppContext } from '../contexts/AppContext';
import { LivePaperBadge } from './LivePaperBadge';

// Fix: Added missing BANKING_PAYPAL color to logSourceColors to satisfy type constraints
const logSourceColors: { [key in LogEntry['source']]: string } = {
    SYSTEM: 'text-sky-400',
    SENTINEL: 'text-amber-400',
    SWARM: 'text-amber-400',
    TRADE: 'text-green-400',
    MARKET: 'text-amber-500',
    AI_TOOLKIT: 'text-amber-300',
    ORCHESTRATOR: 'text-amber-300',
    BOOT: 'text-slate-400',
    SONAR: 'text-amber-500',
    ERROR: 'text-red-500',
    NEXUS: 'text-violet-400',
    CAUSAL: 'text-cyan-400',
    LIVE_PULSE: 'text-emerald-400',
    AODE: 'text-pink-500 font-bold',
    QUANTUM: 'text-indigo-400',
    BLOCKCHAIN: 'text-emerald-300',
    BANKING: 'text-emerald-500',
    BANKING_PAYPAL: 'text-blue-400 font-bold',
    SCALPER: 'text-fuchsia-400',
    SHADOW: 'text-zinc-400',
    FORENSIC: 'text-amber-600 font-bold',
    LEGION: 'text-orange-400',
    XEDO: 'text-cyan-500 font-bold',
    MLEM: 'text-amber-500 font-bold',
    SENTRY: 'text-rose-400',
    SPINE: 'text-blue-400 font-bold',
    PAPER: 'text-cyan-400',
    VAULT: 'text-amber-500 font-bold',
    AUTONOMY: 'text-purple-400 font-bold',
    AUDIT: 'text-blue-500 font-bold',
    BIOMETRIC: 'text-rose-500 font-bold',
    DIRECTIVE: 'text-amber-500 font-bold',
    EXCHANGE: 'text-yellow-500 font-bold',
    RUST_KRNL: 'text-red-400 font-bold',
    MEV_GUARD: 'text-emerald-400 font-bold',
    IBKR: 'text-orange-500 font-bold',
    HARDWARE: 'text-indigo-500 font-bold',
    AUTH: 'text-fuchsia-500 font-bold',
};

const SystemLog: React.FC<{ id: string }> = ({ id }) => {
    const { logs } = useAppContext();
    const logContainerRef = useRef<HTMLDivElement>(null);
    const [activeFilter, setActiveFilter] = useState<'ALL' | LogEntry['source']>('ALL');

    useEffect(() => {
        const node = logContainerRef.current;
        if (node) {
            const isNearBottom = node.scrollHeight - node.scrollTop - node.clientHeight < 100;
            if (isNearBottom) node.scrollTo({ top: node.scrollHeight, behavior: 'smooth' });
        }
    }, [logs]);

    const filteredLogs = useMemo(() => {
        if (activeFilter === 'ALL') return logs;
        return logs.filter(log => log.source === activeFilter);
    }, [logs, activeFilter]);

    const LogFilterButton: React.FC<{ filter: 'ALL' | LogEntry['source']; label: string }> = ({ filter, label }) => (
        <button
            onClick={() => setActiveFilter(filter)}
            className={`px-2 py-0.5 text-[8px] font-mono border rounded-sm transition-all uppercase tracking-wider ${
                activeFilter === filter
                    ? 'bg-amber-900/50 border-amber-500 text-amber-400'
                    : 'bg-transparent border-slate-800 text-slate-500 hover:border-slate-600'
            }`}
        >
            {label}
        </button>
    );
    
    return (
        <div id={id} className="tech-panel flex flex-col flex-1 h-full font-mono"> 
             <div className="tech-header">
                <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <span className="w-1 h-1 bg-amber-500 rounded-full animate-ping"></span>
                    System_Log_v17
                </h2>
                <div className="flex items-center gap-2">
                    <LivePaperBadge />
                    <button className="flex items-center space-x-1 text-[8px] px-2 py-0.5 rounded-sm bg-slate-900 border border-slate-700 text-slate-400 hover:text-cyan-400 hover:border-cyan-500 transition-colors">
                        <DownloadIcon className="w-2 h-2" />
                        <span>EXPORT</span>
                    </button>
                </div>
            </div>
            <div className="px-2 py-1 border-b border-slate-800 flex flex-wrap gap-1 bg-black/40">
                <LogFilterButton filter="ALL" label="All" />
                <LogFilterButton filter="ERROR" label="Err" />
                <LogFilterButton filter="HARDWARE" label="Hdw" />
                <LogFilterButton filter="TRADE" label="Trd" />
                <LogFilterButton filter="SPINE" label="Spn" />
            </div>
            <div ref={logContainerRef} className="flex-1 overflow-y-auto p-2 font-mono text-[9px] text-slate-400 space-y-0.5 bg-black/20 custom-scrollbar">
                {filteredLogs.map((log, index) => (
                    <div key={index} className="flex hover:bg-white/5 transition-colors p-0.5 rounded-sm">
                        <span className="text-slate-600 mr-2 select-none w-12 text-right opacity-70">{log.timestamp.split(' ')[0]}</span>
                        <span className={`w-16 ${logSourceColors[log.source]} font-bold select-none text-right mr-2 opacity-90`}>{log.source}</span>
                        <span className="flex-1 whitespace-pre-wrap leading-tight opacity-80">{log.message}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SystemLog;
