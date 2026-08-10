
import React, { useEffect, useRef, useState, useMemo } from 'react';
import { LogEntry } from '../types';
import { DownloadIcon } from './icons/DownloadIcon';
import { TrashIcon } from './icons/TrashIcon';
import { useAppContext } from '../contexts/AppContext';
import { LivePaperBadge } from './LivePaperBadge';

// Fix: Added missing FINANCE color to logSourceColors to satisfy type constraints
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
    FINANCE: 'text-emerald-600 font-bold',
    CORE: 'text-cyan-300 font-bold',
    ALERT: 'text-rose-500 font-bold',
};

const SystemLog: React.FC<{ id: string }> = ({ id }) => {
    const { logs, clearLogs } = useAppContext();
    const logContainerRef = useRef<HTMLDivElement>(null);
    const [activeFilter, setActiveFilter] = useState<'ALL' | LogEntry['source']>('ALL');
    const [autoScroll, setAutoScroll] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (!autoScroll) return;
        const node = logContainerRef.current;
        if (node) {
            const isNearBottom = node.scrollHeight - node.scrollTop - node.clientHeight < 100;
            if (isNearBottom || autoScroll) node.scrollTo({ top: node.scrollHeight, behavior: 'smooth' });
        }
    }, [logs, autoScroll]);

    const filteredLogs = useMemo(() => {
        let result = logs;
        if (activeFilter !== 'ALL') {
            result = result.filter(log => log.source === activeFilter);
        }
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(log => log.message.toLowerCase().includes(query) || log.source.toLowerCase().includes(query));
        }
        return result;
    }, [logs, activeFilter, searchQuery]);

    const handleExport = () => {
        const csvContent = "data:text/csv;charset=utf-8," 
            + "Timestamp,Source,Message\n" 
            + logs.map(e => `${e.timestamp},${e.source},"${e.message.replace(/"/g, '""')}"`).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `system_logs_${new Date().getTime()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleDownloadReport = () => {
        const timestamp = new Date().toISOString();
        const reportHeader = `=================================================================\n`
            + `               ARKANGEL OMEGA - SYSTEM LOG SESSION REPORT       \n`
            + `=================================================================\n`
            + `Report Generated: ${timestamp}\n`
            + `Total Log Activity Records: ${logs.length}\n`
            + `Active Log Filter: ${activeFilter}\n`
            + `Search Query Filter: ${searchQuery || 'None'}\n`
            + `-----------------------------------------------------------------\n\n`
            + `SESSION ACTIVITY LOG ENTRIES:\n`
            + `-----------------------------------------------------------------\n`;
        const reportBody = filteredLogs.length > 0 
            ? filteredLogs.map(e => `[${e.timestamp}] [${e.source.padEnd(12)}] ${e.message}`).join('\n')
            : 'No log entries match the current filter criteria.';
        const reportFooter = `\n\n=================================================================\n`
            + `                       END OF SYSTEM REPORT                      \n`
            + `=================================================================\n`;

        const fullText = reportHeader + reportBody + reportFooter;
        const blob = new Blob([fullText], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `system_log_report_${Date.now()}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

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
        <div id={id} className="tech-panel holographic-panel flex flex-col flex-1 h-full font-mono"> 
             <div className="tech-header">
                <h2 className="micro-label flex items-center gap-2">
                    <span className="w-1 h-1 bg-amber-500 rounded-full animate-ping"></span>
                    System_Log_v17
                </h2>
                <div className="flex items-center gap-4">
                    <label className="flex items-center space-x-1.5 text-[9px] text-slate-400 cursor-pointer hover:text-slate-300">
                        <input
                            type="checkbox"
                            checked={autoScroll}
                            onChange={(e) => setAutoScroll(e.target.checked)}
                            className="w-2.5 h-2.5 accent-amber-500 bg-slate-900 border-slate-700 rounded-sm cursor-pointer"
                        />
                        <span>AUTO-SCROLL</span>
                    </label>
                    <LivePaperBadge />
                    <button onClick={handleDownloadReport} className="flex items-center space-x-1 text-[8px] font-bold px-2 py-0.5 rounded-sm bg-amber-950/40 border border-amber-500/50 text-amber-300 hover:text-amber-200 hover:bg-amber-900/60 hover:border-amber-400 transition-colors shadow-[0_0_8px_rgba(245,158,11,0.2)]">
                        <DownloadIcon className="w-2.5 h-2.5" />
                        <span>DOWNLOAD REPORT</span>
                    </button>
                    <button onClick={handleExport} className="flex items-center space-x-1 text-[8px] px-2 py-0.5 rounded-sm bg-slate-900 border border-slate-700 text-slate-400 hover:text-cyan-400 hover:border-cyan-500 transition-colors">
                        <DownloadIcon className="w-2 h-2" />
                        <span>CSV</span>
                    </button>
                    <button onClick={clearLogs} className="flex items-center space-x-1 text-[8px] px-2 py-0.5 rounded-sm bg-slate-900 border border-slate-700 text-slate-400 hover:text-red-400 hover:border-red-500 transition-colors">
                        <TrashIcon className="w-2 h-2" />
                        <span>CLEAR</span>
                    </button>
                </div>
            </div>
            <div className="px-2 py-1 border-b border-slate-800 flex flex-wrap gap-1 items-center bg-black/40">
                <input
                    type="text"
                    placeholder="Search logs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-slate-900 border border-slate-700 text-slate-300 text-[9px] px-2 py-0.5 rounded-sm focus:outline-none focus:border-amber-500 mr-2 w-32"
                />
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
