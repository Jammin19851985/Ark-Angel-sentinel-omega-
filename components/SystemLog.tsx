
import React, { useEffect, useRef, useState, useMemo } from 'react';
import { LogEntry } from '../types';
import { DownloadIcon } from './icons/DownloadIcon';
import { useAppContext } from '../contexts/AppContext';

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
            className={`px-3 py-1 text-[10px] font-mono border rounded transition-colors ${
                activeFilter === filter
                    ? 'bg-amber-600 border-amber-400 text-white'
                    : 'bg-black/50 border-slate-800 hover:bg-slate-700/50 text-slate-400'
            }`}
        >
            {label}
        </button>
    );
    
    return (
        <div id={id} className="bg-black/30 backdrop-blur-sm border border-slate-800 rounded-lg shadow-lg flex flex-col flex-1 h-full glow-border"> 
             <div className="p-4 border-b border-slate-800 flex justify-between items-center">
                <h2 className="text-sm font-bold text-amber-400 font-mono tracking-widest">// v17.0 FORENSIC LOG</h2>
                 <button className="flex items-center space-x-1.5 px-2 py-1 text-xs font-medium rounded-md bg-black/50 border border-slate-800 text-slate-300 transition-colors">
                    <DownloadIcon className="w-4 h-4" />
                    <span>EXPORT</span>
                </button>
            </div>
            <div className="px-4 py-2 border-b border-slate-800 flex flex-wrap gap-2">
                <LogFilterButton filter="ALL" label="All" />
                <LogFilterButton filter="ERROR" label="Errors" />
                <LogFilterButton filter="HARDWARE" label="Hardware" />
                <LogFilterButton filter="TRADE" label="Trades" />
                <LogFilterButton filter="SPINE" label="Spine" />
            </div>
            <div ref={logContainerRef} className="flex-1 overflow-y-auto p-4 font-mono text-[10px] text-slate-400 space-y-0.5">
                {filteredLogs.map((log, index) => (
                    <div key={index} className="flex">
                        <span className="text-slate-600 mr-3">[{log.timestamp}]</span>
                        <span className={`w-20 ${logSourceColors[log.source]}`}>[{log.source}]</span>
                        <span className="flex-1 whitespace-pre-wrap">{log.message}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SystemLog;
