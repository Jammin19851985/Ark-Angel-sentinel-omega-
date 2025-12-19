
import React, { useEffect, useRef, useState, useMemo } from 'react';
import { LogEntry } from '../types';
import { DownloadIcon } from './icons/DownloadIcon';
import { useAppContext } from '../contexts/AppContext';

interface SystemLogProps {
    id: string; // New: Add ID prop for tour targeting
}

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
    AODE: 'text-pink-500',
    QUANTUM: 'text-indigo-400',
    BLOCKCHAIN: 'text-emerald-300',
    BANKING: 'text-emerald-500',
    SCALPER: 'text-fuchsia-400',
    SHADOW: 'text-zinc-400',
    // @google/genai Fix: Add missing 'FORENSIC' color mapping to satisfy TypeScript requirements for LogEntry['source'].
    FORENSIC: 'text-amber-600',
};

const SystemLog: React.FC<SystemLogProps> = ({ id }) => {
    const { logs } = useAppContext();
    const logContainerRef = useRef<HTMLDivElement>(null);
    const [activeFilter, setActiveFilter] = useState<'ALL' | LogEntry['source']>('ALL');

    useEffect(() => {
        const node = logContainerRef.current;
        if (node) {
            const scrollThreshold = 100;
            const isNearBottom = node.scrollHeight - node.scrollTop - node.clientHeight < scrollThreshold;

            if (isNearBottom) {
                node.scrollTo({
                    top: node.scrollHeight,
                    behavior: 'smooth'
                });
            }
        }
    }, [logs]);

    const filteredLogs = useMemo(() => {
        if (activeFilter === 'ALL') {
            return logs;
        }
        return logs.filter(log => log.source === activeFilter);
    }, [logs, activeFilter]);

    const handleExport = () => {
        if (logs.length === 0) {
            alert("No logs to export.");
            return;
        }

        const logContent = logs.map(log => 
            `${log.timestamp} [${log.source}] ${log.message}`
        ).join('\n');

        const blob = new Blob([logContent], { type: 'text/plain;charset=utf-8' });

        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        link.download = `archangel-system-log-${timestamp}.txt`;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        URL.revokeObjectURL(url);
    };

    const LogFilterButton: React.FC<{ filter: 'ALL' | LogEntry['source']; label: string }> = ({ filter, label }) => (
        <button
            onClick={() => setActiveFilter(filter)}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                activeFilter === filter
                    ? 'bg-amber-600 text-white'
                    : 'bg-black/50 backdrop-blur-sm hover:bg-slate-700/50 text-slate-300'
            }`}
        >
            {label}
        </button>
    );
    
    return (
        <div id={id} className="bg-black/30 backdrop-blur-sm border border-slate-800 rounded-lg shadow-lg flex flex-col flex-1 h-full glow-border"> 
             <div className="p-4 border-b border-slate-800 flex justify-between items-center">
                <h2 className="text-sm font-bold text-amber-400 font-mono">// SYSTEM LOG</h2>
                 <button 
                    onClick={handleExport}
                    className="flex items-center space-x-1.5 px-2 py-1 text-xs font-medium rounded-md bg-black/50 backdrop-blur-sm hover:bg-slate-700/50 text-slate-300 transition-colors"
                    title="Export logs to a .txt file"
                    aria-label="Export logs"
                >
                    <DownloadIcon className="w-4 h-4" />
                    <span>Export</span>
                </button>
            </div>
            <div className="px-4 py-2 border-b border-slate-800 flex flex-wrap gap-2">
                <LogFilterButton filter="ALL" label="All" />
                <LogFilterButton filter="ERROR" label="Errors" />
                <LogFilterButton filter="SYSTEM" label="System" />
                <LogFilterButton filter="NEXUS" label="Nexus" />
                <LogFilterButton filter="SENTINEL" label="Sentinel" />
                <LogFilterButton filter="SWARM" label="Swarm" />
                <LogFilterButton filter="TRADE" label="Trades" />
                <LogFilterButton filter="MARKET" label="Market" />
                <LogFilterButton filter="LIVE_PULSE" label="Live Pulse" />
                <LogFilterButton filter="AI_TOOLKIT" label="AI Toolkit" />
                <LogFilterButton filter="ORCHESTRATOR" label="Orchestrator" />
                <LogFilterButton filter="BOOT" label="Boot" />
                <LogFilterButton filter="SONAR" label="Sonar" />
                <LogFilterButton filter="AODE" label="AODE" />
                <LogFilterButton filter="QUANTUM" label="Quantum" />
                <LogFilterButton filter="BLOCKCHAIN" label="Chain" />
                <LogFilterButton filter="BANKING" label="Banking" />
                <LogFilterButton filter="SCALPER" label="Scalper" />
                <LogFilterButton filter="FORENSIC" label="Forensic" />
            </div>
            <div ref={logContainerRef} className="flex-1 overflow-y-auto p-4 font-mono text-xs text-slate-400 space-y-0.5">
                {filteredLogs.map((log, index) => (
                    <div key={index} className="flex">
                        <span className="text-slate-500 mr-3">{log.timestamp}</span>
                        <span className={`w-24 ${logSourceColors[log.source]}`}>[{log.source}]</span>
                        <span className="flex-1 whitespace-pre-wrap">{log.message}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SystemLog;
