import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
    ResponsiveContainer,
    ComposedChart,
    Line,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    CartesianGrid
} from 'recharts';
import { BotStatus, Bot, LegionName } from '../types';
import { useAppContext } from '../contexts/AppContext';
import { NetworkIcon } from './icons/NetworkIcon';
import { LivePaperBadge } from './LivePaperBadge';
import { IntelligenceAvatar } from './icons/IntelligenceAvatar';
import { DefenseAvatar } from './icons/DefenseAvatar';
import { EfficiencyAvatar } from './icons/EfficiencyAvatar';
import { SparklesIcon } from './icons/SparklesIcon';
import { CpuChipIcon } from './icons/CpuChipIcon';
import { CrosshairIcon } from './icons/CrosshairIcon';
import { ActivityIcon } from './icons/ActivityIcon';
import { RefreshIcon } from './icons/RefreshIcon';

const statusGlows: { [key in BotStatus]: string } = {
    Executing: 'shadow-[0_0_8px_rgba(16,185,129,0.5)]',
    Analyzing: 'shadow-[0_0_8px_rgba(245,158,11,0.5)]',
    Idle: 'shadow-none opacity-40 grayscale',
    Patrolling: 'shadow-[0_0_8px_rgba(59,130,246,0.5)]',
    Synthesizing: 'shadow-[0_0_8px_rgba(139,92,246,0.5)]',
    Defending: 'shadow-[0_0_8px_rgba(239,68,68,0.5)]'
};

const statusColors: { [key in BotStatus]: string } = {
    Executing: '#10b981',
    Analyzing: '#f59e0b',
    Idle: '#64748b',
    Patrolling: '#3b82f6',
    Synthesizing: '#a855f7',
    Defending: '#ef4444'
};

const legionColors: { [key in LegionName]: { stroke: string; fill: string; glow: string; text: string } } = {
    Infrastructure: { stroke: '#06b6d4', fill: 'rgba(6, 182, 212, 0.15)', glow: 'rgba(6,182,212,0.4)', text: 'text-cyan-400' },
    Seraphim: { stroke: '#f59e0b', fill: 'rgba(245, 158, 11, 0.15)', glow: 'rgba(245,158,11,0.4)', text: 'text-amber-400' },
    Voice: { stroke: '#a855f7', fill: 'rgba(168, 85, 247, 0.15)', glow: 'rgba(168,85,247,0.4)', text: 'text-purple-400' },
    Growth: { stroke: '#10b981', fill: 'rgba(16, 185, 129, 0.15)', glow: 'rgba(16,185,129,0.4)', text: 'text-emerald-400' },
    Security: { stroke: '#f43f5e', fill: 'rgba(244, 63, 94, 0.15)', glow: 'rgba(244,63,94,0.4)', text: 'text-rose-400' }
};

const legionHubs: { [key in LegionName]: { x: number; y: number } } = {
    Infrastructure: { x: 180, y: 130 },
    Seraphim: { x: 720, y: 130 },
    Voice: { x: 450, y: 230 },
    Growth: { x: 230, y: 370 },
    Security: { x: 670, y: 370 }
};

interface NodePos {
    id: number;
    x: number;
    y: number;
    bot: Bot;
    isNew: boolean;
}

interface ConnectionEdge {
    id: string;
    fromId: number;
    toId: number;
    fromX: number;
    fromY: number;
    toX: number;
    toY: number;
    isNew: boolean;
    strength: number;
    isCrossLegion: boolean;
    isCustomLink?: boolean;
}

const BotAvatar: React.FC<{ bot: Bot; isSelected: boolean }> = ({ bot, isSelected }) => {
    const renderIcon = () => {
        if (bot.legion === 'Security' || bot.role === 'Sentinel') {
            return <DefenseAvatar />;
        }
        if (bot.legion === 'Seraphim' || bot.role === 'Oracle') {
            return <IntelligenceAvatar />;
        }
        return <EfficiencyAvatar />;
    };

    return (
        <div className={`w-full h-full transition-all duration-300 ${isSelected ? 'scale-125' : 'hover:scale-110'}`}>
            {renderIcon()}
        </div>
    );
};

const Sparkline: React.FC<{ data: number[]; threshold: number }> = ({ data, threshold }) => {
    if (!data || data.length === 0) return null;
    const max = Math.max(...data, Math.max(150, threshold));
    const width = 80;
    const height = 16;
    const points = data.map((val, i) => `${(i / (data.length - 1)) * width},${height - (val / max) * height}`).join(' ');
    const thresholdY = height - (threshold / max) * height;

    return (
        <svg width={width} height={height} className="mt-1.5 overflow-visible">
            {thresholdY >= 0 && thresholdY <= height && (
                <line x1="0" y1={thresholdY} x2={width} y2={thresholdY} stroke="#ef4444" strokeWidth="1" strokeDasharray="2,2" opacity="0.6" />
            )}
            <polyline points={points} fill="none" stroke="#f59e0b" strokeWidth="1" strokeLinejoin="round" strokeLinecap="round" />
            <path d={`M0,${height} L${points} L${width},${height} Z`} fill="url(#sparkline-gradient)" opacity="0.3" />
            {data.map((val, i) => {
                if (val > threshold) {
                    const x = (i / (data.length - 1)) * width;
                    const y = height - (val / max) * height;
                    return <circle key={i} cx={x} cy={y} r="1.5" fill="#ef4444" />;
                }
                return null;
            })}
            <defs>
                <linearGradient id="sparkline-gradient" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
                </linearGradient>
            </defs>
        </svg>
    );
};

// -------------------------------------------------------------
// DETAILED NODE HOVER TOOLTIP COMPONENT
// -------------------------------------------------------------
interface NodeHoverTooltipProps {
    bot: Bot;
    latencyHistory: number[];
    connectionEdgesCount: number;
    nodePos?: { x: number; y: number };
}

const NodeHoverTooltip: React.FC<NodeHoverTooltipProps> = ({
    bot,
    latencyHistory,
    connectionEdgesCount,
    nodePos
}) => {
    // 1. Dynamic Real-time Uptime
    const [uptimeStr, setUptimeStr] = useState<string>('');

    useEffect(() => {
        const updateUptime = () => {
            const nowSec = Math.floor(Date.now() / 1000);
            const baseStartOffset = (bot.id * 14209 + 86400 * 2) % 604800; // deterministic start up to 7 days
            const totalSec = baseStartOffset + (nowSec % 86400);

            const days = Math.floor(totalSec / 86400);
            const hrs = Math.floor((totalSec % 86400) / 3600);
            const mins = Math.floor((totalSec % 3600) / 60);
            const secs = totalSec % 60;

            if (days > 0) {
                setUptimeStr(`${days}d ${hrs.toString().padStart(2, '0')}h ${mins.toString().padStart(2, '0')}m ${secs.toString().padStart(2, '0')}s`);
            } else {
                setUptimeStr(`${hrs.toString().padStart(2, '0')}h ${mins.toString().padStart(2, '0')}m ${secs.toString().padStart(2, '0')}s`);
            }
        };

        updateUptime();
        const timer = setInterval(updateUptime, 1000);
        return () => clearInterval(timer);
    }, [bot.id]);

    // 2. Real-time Load Percentage
    const currentLatency = latencyHistory.length > 0 ? latencyHistory[latencyHistory.length - 1] : 15;
    const loadPct = useMemo(() => {
        const statusBase = bot.status === 'Executing' ? 82 
            : bot.status === 'Defending' ? 88 
            : bot.status === 'Synthesizing' ? 76 
            : bot.status === 'Analyzing' ? 64 
            : bot.status === 'Patrolling' ? 45 : 22;
        const effModifier = (100 - bot.efficiency) * 0.15;
        const latModifier = Math.min(15, currentLatency * 0.1);
        const jitter = ((bot.id * 7) % 9) - 4;
        return Math.min(99, Math.max(8, Math.round(statusBase + effModifier + latModifier + jitter)));
    }, [bot.status, bot.efficiency, currentLatency, bot.id]);

    // 3. Dynamic Real-time Active Processes
    const activeProcesses = useMemo(() => {
        const p1Name = bot.legion === 'Infrastructure' ? 'k8s-mesh-router.service'
            : bot.legion === 'Seraphim' ? 'gemini-embeddings-v3'
            : bot.legion === 'Security' ? 'zero-trust-auth-guard'
            : bot.legion === 'Voice' ? 'rtc-opus-duplex-stream'
            : 'telemetry-stream-aggregator';

        const p2Name = bot.legion === 'Infrastructure' ? 'envoy-sidecar-proxy'
            : bot.legion === 'Seraphim' ? 'vector-hnsw-indexer'
            : bot.legion === 'Security' ? 'eBPF-packet-analyzer'
            : bot.legion === 'Voice' ? 'whisper-stt-transcriber'
            : 'conversion-eval-engine';

        const p3Name = bot.legion === 'Infrastructure' ? 'tls-handshake-ingress'
            : bot.legion === 'Seraphim' ? 'semantic-tree-pruner'
            : bot.legion === 'Security' ? 'ddos-shield-mitigator'
            : bot.legion === 'Voice' ? 'vad-silence-gatekeeper'
            : 'clickhouse-sync-worker';

        return [
            { pid: 4820 + (bot.id % 100), name: p1Name, cpu: Math.round(loadPct * 0.45), mem: `${120 + (bot.id * 7) % 150} MB`, status: 'RUNNING' },
            { pid: 2100 + (bot.id % 100), name: p2Name, cpu: Math.round(loadPct * 0.35), mem: `${80 + (bot.id * 5) % 100} MB`, status: 'ACTIVE' },
            { pid: 8830 + (bot.id % 100), name: p3Name, cpu: Math.round(loadPct * 0.20), mem: `${45 + (bot.id * 3) % 60} MB`, status: 'EXEC' }
        ];
    }, [bot.legion, bot.id, loadPct]);

    // Calculate position style if nodePos is given (e.g., SVG coordinates)
    const positionStyle: React.CSSProperties = useMemo(() => {
        if (!nodePos) return {};
        const xPct = (nodePos.x / 900) * 100;
        const yPct = (nodePos.y / 480) * 100;

        const leftPct = xPct > 65 ? xPct - 1.5 : xPct + 1.5;
        const topPct = yPct > 60 ? yPct - 1.5 : yPct + 1.5;
        const transform = `${xPct > 65 ? 'translateX(-100%)' : 'translateX(0)'} ${yPct > 60 ? 'translateY(-100%)' : 'translateY(0)'}`;

        return {
            left: `${leftPct}%`,
            top: `${topPct}%`,
            transform
        };
    }, [nodePos]);

    const legColor = legionColors[bot.legion]?.stroke || '#06b6d4';
    const statusColor = statusColors[bot.status] || '#10b981';

    return (
        <div 
            style={positionStyle}
            className={`z-50 font-mono transition-all duration-150 pointer-events-none ${
                nodePos 
                    ? 'absolute w-72 bg-slate-950/95 border border-cyan-500/70 rounded-xl p-3 shadow-[0_0_30px_rgba(6,182,212,0.45)] backdrop-blur-md animate-fade-in'
                    : 'w-72 bg-slate-950/95 border border-cyan-500/70 rounded-xl p-3 shadow-[0_0_30px_rgba(6,182,212,0.45)] backdrop-blur-md animate-fade-in'
            }`}
        >
            {/* Header: Node ID, Name, Legion & Status */}
            <div className="flex justify-between items-start border-b border-white/10 pb-2 mb-2">
                <div>
                    <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-extrabold text-cyan-300 font-mono tracking-wider">
                            U-{bot.id}
                        </span>
                        <span 
                            className="text-[8px] font-bold px-1.5 py-0.2 rounded uppercase" 
                            style={{ backgroundColor: `${legColor}25`, color: legColor, border: `1px solid ${legColor}50` }}
                        >
                            {bot.legion}
                        </span>
                    </div>
                    <div className="text-[10px] font-bold text-slate-100 truncate mt-0.5 max-w-[160px]">
                        {bot.name || `Unit Node #${bot.id}`}
                    </div>
                </div>

                <div className="text-right">
                    <span 
                        className="inline-flex items-center gap-1 text-[8px] font-bold px-1.5 py-0.5 rounded border uppercase" 
                        style={{ backgroundColor: `${statusColor}20`, color: statusColor, borderColor: `${statusColor}50` }}
                    >
                        <span className="w-1.5 h-1.5 rounded-full animate-ping" style={{ backgroundColor: statusColor }}></span>
                        {bot.status}
                    </span>
                    <div className="text-[7px] text-slate-400 mt-0.5 uppercase tracking-wider font-semibold">
                        {bot.role}
                    </div>
                </div>
            </div>

            {/* Metric Row 1: Real-Time Uptime & Load % */}
            <div className="grid grid-cols-2 gap-2 mb-2">
                {/* Real-time Uptime */}
                <div className="bg-black/70 border border-white/10 p-2 rounded-lg">
                    <div className="text-[7px] text-slate-400 uppercase tracking-wider flex items-center justify-between">
                        <span className="font-bold">UPTIME</span>
                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                    </div>
                    <div className="text-[10px] font-bold text-amber-300 font-mono mt-0.5">
                        {uptimeStr || '00h 00m 00s'}
                    </div>
                </div>

                {/* Load Percentage */}
                <div className="bg-black/70 border border-white/10 p-2 rounded-lg">
                    <div className="text-[7px] text-slate-400 uppercase tracking-wider flex justify-between items-center">
                        <span className="font-bold">LOAD LEVEL</span>
                        <span className={`font-bold text-[9px] ${loadPct > 80 ? 'text-rose-400' : loadPct > 55 ? 'text-amber-400' : 'text-emerald-400'}`}>
                            {loadPct}%
                        </span>
                    </div>
                    {/* Visual Load Bar */}
                    <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden mt-1 border border-white/5">
                        <div 
                            className={`h-full transition-all duration-300 ${
                                loadPct > 80 
                                    ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.7)]' 
                                    : loadPct > 55 
                                    ? 'bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.7)]' 
                                    : 'bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.7)]'
                            }`}
                            style={{ width: `${loadPct}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Metric Row 2: Real-time Active Processes */}
            <div className="bg-black/70 border border-white/10 p-2 rounded-lg mb-2">
                <div className="text-[7px] text-slate-400 uppercase tracking-wider flex justify-between items-center mb-1">
                    <span className="flex items-center gap-1 font-bold text-cyan-400">
                        ⚡ ACTIVE PROCESSES ({activeProcesses.length})
                    </span>
                    <span className="text-[7px] text-slate-500 font-mono">CPU / RAM</span>
                </div>
                <div className="space-y-1">
                    {activeProcesses.map((proc, idx) => (
                        <div key={idx} className="flex justify-between items-center text-[8px] font-mono bg-slate-900/80 px-1.5 py-1 rounded border border-white/5">
                            <div className="flex items-center gap-1.5 overflow-hidden pr-1">
                                <span className="w-1 h-1 rounded-full bg-emerald-400 flex-shrink-0 animate-pulse"></span>
                                <span className="text-slate-200 font-semibold truncate" title={proc.name}>
                                    {proc.name}
                                </span>
                            </div>
                            <div className="flex items-center gap-1 flex-shrink-0 text-[8px]">
                                <span className="text-slate-500 text-[7px]">{proc.mem}</span>
                                <span className="text-amber-300 font-bold">{proc.cpu}%</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Metric Row 3: Extended Telemetry */}
            <div className="grid grid-cols-3 gap-1.5 text-[8px] bg-black/50 p-1.5 rounded-lg border border-white/10 text-center font-mono">
                <div>
                    <span className="text-slate-500 block text-[7px] uppercase font-semibold">LATENCY</span>
                    <span className="text-cyan-300 font-bold">{currentLatency} ms</span>
                </div>
                <div>
                    <span className="text-slate-500 block text-[7px] uppercase font-semibold">EFFICIENCY</span>
                    <span className="text-emerald-400 font-bold">{bot.efficiency}%</span>
                </div>
                <div>
                    <span className="text-slate-500 block text-[7px] uppercase font-semibold">MESH LINKS</span>
                    <span className="text-amber-400 font-bold">{connectionEdgesCount}</span>
                </div>
            </div>

            {/* Task Footer */}
            {bot.task && (
                <div className="mt-1.5 text-[7px] text-slate-300 bg-cyan-950/40 p-1 rounded border border-cyan-500/30 flex items-center gap-1 font-mono">
                    <span className="text-cyan-400 font-bold flex-shrink-0">TASK:</span>
                    <span className="text-slate-200 truncate">{bot.task}</span>
                </div>
            )}
        </div>
    );
};

const BotGrid: React.FC<{ 
    bots: Bot[]; 
    selectedBotIds: number[];
    hoveredBotId: number | null;
    latencyHistories: Record<number, number[]>;
    onMouseDownBot: (id: number) => void;
    onMouseEnterBot: (id: number) => void;
    onMouseLeaveBot: () => void;
    threshold: number; 
    newBotIds: Set<number>;
    connectionEdges: ConnectionEdge[];
}> = ({ bots, selectedBotIds, hoveredBotId, latencyHistories, onMouseDownBot, onMouseEnterBot, onMouseLeaveBot, threshold, newBotIds, connectionEdges }) => {
    return (
        <div className="grid grid-cols-10 sm:grid-cols-12 md:grid-cols-15 lg:grid-cols-20 gap-2 p-2 bg-black/40 rounded border border-white/5 overflow-visible relative">
            {bots.map(bot => {
                const history = latencyHistories[bot.id] || [];
                const currentLatency = history.length > 0 ? history[history.length - 1] : 0;
                const isSelected = selectedBotIds.includes(bot.id);
                const isHovered = hoveredBotId === bot.id;
                const isNew = newBotIds.has(bot.id);
                const edgesCount = connectionEdges.filter(e => e.fromId === bot.id || e.toId === bot.id).length;
                
                return (
                    <div key={bot.id} className="relative flex justify-center items-center">
                        <button 
                            onMouseDown={(e) => { e.stopPropagation(); onMouseDownBot(bot.id); }}
                            onMouseEnter={() => onMouseEnterBot(bot.id)}
                            onMouseLeave={() => onMouseLeaveBot()}
                            className={`w-4 h-4 relative transition-all duration-300 rounded-sm overflow-visible ${statusGlows[bot.status]} ${
                                isSelected ? 'ring-1 ring-cyan-400 z-10 shadow-[0_0_8px_rgba(34,211,238,0.5)]' : ''
                            } ${isHovered ? 'ring-1 ring-amber-400 z-20 scale-125' : ''} ${isNew ? 'ring-2 ring-amber-400 animate-pulse scale-125' : ''}`}
                            style={{ transform: `scale(${isHovered ? 1.3 : 1 + Math.min(currentLatency, 200) / 150})` }}
                        >
                            {isSelected && (
                                <span className="absolute inset-0 rounded-sm animate-ping opacity-75 bg-cyan-400/50"></span>
                            )}
                            {isNew && (
                                <span className="absolute -inset-1 rounded-sm animate-ping opacity-90 bg-amber-400/70 pointer-events-none"></span>
                            )}
                            <BotAvatar bot={bot} isSelected={isSelected || isHovered} />
                        </button>
                        {isHovered && (
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 pointer-events-none">
                                <NodeHoverTooltip 
                                    bot={bot} 
                                    latencyHistory={history} 
                                    connectionEdgesCount={edgesCount} 
                                />
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

// -------------------------------------------------------------
// NETWORK DENSITY REAL-TIME SPARKLINE CHART
// -------------------------------------------------------------
const NetworkDensitySparkline: React.FC<{ data: number[]; color?: string }> = ({ data, color = "#06b6d4" }) => {
    if (!data || data.length < 2) return (
        <div className="h-[32px] flex items-center justify-center text-[8px] text-slate-600 font-mono">
            INITIALIZING DENSITY STREAM...
        </div>
    );
    const min = Math.min(...data) * 0.9;
    const max = Math.max(...data) * 1.1 || 1;
    const width = 240;
    const height = 32;
    
    const points = data.map((val, idx) => {
        const x = (idx / (data.length - 1)) * width;
        const y = height - ((val - min) / (max - min || 1)) * (height - 6) - 3;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');

    const lastPoint = points.split(' ').pop()?.split(',') || [0, 0];
    const lastX = Number(lastPoint[0]);
    const lastY = Number(lastPoint[1]);

    const areaPoints = `0,${height} ${points} ${width},${height}`;

    return (
        <div className="relative w-full h-[32px] overflow-hidden">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
                <defs>
                    <linearGradient id="density-sparkline-grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={color} stopOpacity="0.45" />
                        <stop offset="100%" stopColor={color} stopOpacity="0.0" />
                    </linearGradient>
                </defs>
                <polygon points={areaPoints} fill="url(#density-sparkline-grad)" />
                <polyline points={points} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx={lastX} cy={lastY} r="3" fill="#ffffff" stroke={color} strokeWidth="1.5" className="animate-pulse" />
            </svg>
        </div>
    );
};

// -------------------------------------------------------------
// REAL-TIME SCALING TELEMETRY DATA & RECHARTS COMPONENT
// -------------------------------------------------------------
export interface ScalingTelemetryPoint {
    time: string;
    nodes: number;
    throughput: number;     // Ops/s
    throughputGbps: number; // GB/s
    cpuLoad: number;        // CPU Load %
    efficiency: number;     // Scaling Efficiency %
}

interface ScalingEfficiencyChartProps {
    data: ScalingTelemetryPoint[];
    height?: number;
    showLegend?: boolean;
}

const ScalingEfficiencyChart: React.FC<ScalingEfficiencyChartProps> = ({ data, height = 130, showLegend = true }) => {
    if (!data || data.length === 0) {
        return (
            <div className="h-[130px] flex items-center justify-center text-[9px] text-slate-500 font-mono border border-dashed border-white/10 rounded-lg">
                COLLECTING SCALING TELEMETRY...
            </div>
        );
    }

    return (
        <div className="w-full relative" style={{ height }}>
            <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={data} margin={{ top: 6, right: 8, left: -22, bottom: 0 }}>
                    <defs>
                        <linearGradient id="tpGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.35} />
                            <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.07)" />
                    <XAxis 
                        dataKey="time" 
                        tick={{ fill: '#64748b', fontSize: 8, fontFamily: 'monospace' }} 
                        stroke="#334155" 
                    />
                    <YAxis 
                        yAxisId="left" 
                        orientation="left" 
                        tick={{ fill: '#06b6d4', fontSize: 8, fontFamily: 'monospace' }} 
                        stroke="#06b6d4"
                        domain={[0, 'auto']}
                    />
                    <YAxis 
                        yAxisId="right" 
                        orientation="right" 
                        tick={{ fill: '#ef4444', fontSize: 8, fontFamily: 'monospace' }} 
                        stroke="#ef4444" 
                        domain={[0, 100]}
                        unit="%"
                    />
                    <Tooltip 
                        contentStyle={{ 
                            backgroundColor: 'rgba(9, 13, 22, 0.95)', 
                            borderColor: 'rgba(6, 182, 212, 0.5)', 
                            borderRadius: '8px',
                            fontSize: '10px', 
                            fontFamily: 'monospace',
                            boxShadow: '0 0 20px rgba(0,0,0,0.8)' 
                        }}
                        itemStyle={{ padding: '1px 0' }}
                        formatter={(value: any, name: any) => {
                            if (name === 'Node Throughput') return [`${Number(value).toLocaleString()} Ops/s`, name];
                            if (name === 'CPU Load') return [`${value}%`, name];
                            if (name === 'Scaling Efficiency') return [`${value}%`, name];
                            return [value, name];
                        }}
                    />
                    {showLegend && (
                        <Legend 
                            wrapperStyle={{ fontSize: '8px', fontFamily: 'monospace', paddingTop: '2px' }}
                        />
                    )}
                    <Area 
                        yAxisId="left" 
                        type="monotone" 
                        dataKey="throughput" 
                        name="Node Throughput" 
                        fill="url(#tpGrad)" 
                        stroke="#06b6d4" 
                        strokeWidth={1.8} 
                        dot={false}
                    />
                    <Line 
                        yAxisId="right" 
                        type="monotone" 
                        dataKey="cpuLoad" 
                        name="CPU Load" 
                        stroke="#ef4444" 
                        strokeWidth={1.8} 
                        dot={{ r: 2, fill: '#ef4444' }} 
                        strokeDasharray="3 2"
                    />
                    <Line 
                        yAxisId="right" 
                        type="monotone" 
                        dataKey="efficiency" 
                        name="Scaling Efficiency" 
                        stroke="#10b981" 
                        strokeWidth={2} 
                        dot={{ r: 2.5, fill: '#10b981' }} 
                    />
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );
};

// -------------------------------------------------------------
// NETWORK DENSITY OVERLAY WIDGET COMPONENT
// -------------------------------------------------------------
interface NetworkDensityOverlayWidgetProps {
    activeNodes: number;
    totalNodes: number;
    connectionEdgesCount: number;
    maxPossibleLinks: number;
    networkDensity: number;
    totalThroughputOps: number;
    formattedThroughput: string;
    throughputUnit: 'GB/s' | 'Ops/s' | 'Ms';
    setThroughputUnit: (unit: 'GB/s' | 'Ops/s' | 'Ms') => void;
    throughputHistory: number[];
    scalingTelemetryHistory: ScalingTelemetryPoint[];
    isExpanded: boolean;
    setIsExpanded: React.Dispatch<React.SetStateAction<boolean>>;
    onManualSpawn: (count: number) => void;
    isSimulating: boolean;
    onOpenFullGraphModal?: () => void;
}

const NetworkDensityOverlayWidget: React.FC<NetworkDensityOverlayWidgetProps> = ({
    activeNodes,
    totalNodes,
    connectionEdgesCount,
    maxPossibleLinks,
    networkDensity,
    formattedThroughput,
    throughputUnit,
    setThroughputUnit,
    throughputHistory,
    scalingTelemetryHistory,
    isExpanded,
    setIsExpanded,
    onManualSpawn,
    isSimulating,
    onOpenFullGraphModal
}) => {
    const scaleFactor = (totalNodes / 20).toFixed(1);
    const activePercent = totalNodes > 0 ? Math.round((activeNodes / totalNodes) * 100) : 0;
    const densityStatus = networkDensity > 60 ? 'HIGH MATRIX' : networkDensity > 30 ? 'BALANCED MESH' : 'SPARSE GRID';
    const [chartTab, setChartTab] = useState<'RECHARTS' | 'SPARKLINE'>('RECHARTS');

    return (
        <div className={`absolute top-2 left-2 z-40 font-mono transition-all duration-300 pointer-events-auto ${
            isExpanded 
                ? 'w-72 sm:w-84 bg-slate-950/92 border border-amber-500/50 rounded-xl p-3 shadow-[0_0_25px_rgba(245,158,11,0.25)] backdrop-blur-md' 
                : 'bg-slate-950/90 border border-amber-500/40 rounded-full px-3 py-1.5 shadow-[0_0_15px_rgba(245,158,11,0.2)] backdrop-blur-md flex items-center gap-2 cursor-pointer hover:border-amber-400'
        }`}>
            {/* Header / Pill */}
            <div className="flex justify-between items-center w-full">
                <div 
                    className="flex items-center gap-2 cursor-pointer select-none"
                    onClick={() => setIsExpanded(prev => !prev)}
                >
                    <div className="relative flex items-center justify-center">
                        <ActivityIcon className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                        <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping"></span>
                    </div>
                    <span className="text-[10px] font-bold text-amber-400 tracking-wider uppercase flex items-center gap-1.5">
                        Network Density
                    </span>
                    <span className="text-[8px] font-bold text-slate-950 bg-amber-400 px-1.5 py-0.2 rounded-full uppercase">
                        {scaleFactor}x Scale
                    </span>
                </div>

                {!isExpanded && (
                    <div className="flex items-center gap-2 text-[9px] text-slate-300" onClick={() => setIsExpanded(true)}>
                        <span className="text-cyan-400 font-bold">{activeNodes}/{totalNodes} Nodes</span>
                        <span className="text-slate-600">|</span>
                        <span className="text-amber-300 font-bold">{formattedThroughput}</span>
                        <span className="text-slate-600">|</span>
                        <span className="text-emerald-400 font-bold">{networkDensity}%</span>
                        <button className="text-slate-400 hover:text-white ml-1 text-[10px]">▼</button>
                    </div>
                )}

                {isExpanded && (
                    <div className="flex items-center gap-1.5">
                        <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded border ${
                            isSimulating 
                                ? 'bg-emerald-950/80 text-emerald-400 border-emerald-500/40 animate-pulse' 
                                : 'bg-slate-900 text-slate-400 border-white/10'
                        }`}>
                            {isSimulating ? 'STREAMING' : 'IDLE'}
                        </span>
                        <button 
                            onClick={(e) => { e.stopPropagation(); setIsExpanded(false); }}
                            className="text-slate-400 hover:text-amber-300 text-[11px] px-1 font-bold transition-colors"
                            title="Collapse overlay widget"
                        >
                            ✕
                        </button>
                    </div>
                )}
            </div>

            {/* Expanded Body */}
            {isExpanded && (
                <div className="mt-2.5 space-y-2.5 border-t border-white/10 pt-2.5">
                    {/* Stat Cards Grid */}
                    <div className="grid grid-cols-2 gap-2 text-[9px]">
                        {/* Active Nodes Card */}
                        <div className="bg-black/60 border border-white/5 p-2 rounded-lg">
                            <div className="text-slate-400 text-[8px] uppercase tracking-wider flex justify-between">
                                <span>Active Nodes</span>
                                <span className="text-emerald-400 font-bold">{activePercent}%</span>
                            </div>
                            <div className="text-sm font-bold text-slate-100 flex items-baseline gap-1 mt-0.5">
                                <span className="text-cyan-400 font-mono">{activeNodes}</span>
                                <span className="text-[10px] text-slate-500 font-normal">/ {totalNodes} Total</span>
                            </div>
                            <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden mt-1.5 border border-white/5">
                                <div 
                                    className="bg-cyan-400 h-full transition-all duration-500" 
                                    style={{ width: `${activePercent}%` }}
                                />
                            </div>
                        </div>

                        {/* Total Throughput Card */}
                        <div className="bg-black/60 border border-white/5 p-2 rounded-lg">
                            <div className="text-slate-400 text-[8px] uppercase tracking-wider flex justify-between">
                                <span>Total Throughput</span>
                                <span className="text-amber-400 font-bold">LIVE</span>
                            </div>
                            <div className="text-sm font-bold text-amber-300 font-mono mt-0.5">
                                {formattedThroughput}
                            </div>
                            {/* Unit Switcher */}
                            <div className="flex items-center gap-1 mt-1">
                                {(['GB/s', 'Ops/s', 'Ms'] as const).map(u => (
                                    <button
                                        key={u}
                                        onClick={() => setThroughputUnit(u)}
                                        className={`px-1 py-0.2 text-[7px] font-bold rounded transition-colors ${
                                            throughputUnit === u 
                                                ? 'bg-amber-400 text-slate-950 font-extrabold' 
                                                : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                                        }`}
                                    >
                                        {u}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Mesh Density Matrix */}
                    <div className="bg-black/60 border border-white/5 p-2 rounded-lg space-y-1">
                        <div className="flex justify-between items-center text-[8px]">
                            <span className="text-slate-400 uppercase font-bold tracking-wider flex items-center gap-1">
                                Mesh Density Matrix
                            </span>
                            <span className="text-cyan-400 font-bold">{networkDensity}% ({densityStatus})</span>
                        </div>
                        <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-white/5 relative">
                            <div 
                                className="bg-gradient-to-r from-cyan-500 via-amber-500 to-emerald-400 h-full transition-all duration-700 shadow-[0_0_10px_rgba(6,182,212,0.6)]"
                                style={{ width: `${networkDensity}%` }}
                            />
                        </div>
                        <div className="flex justify-between text-[8px] text-slate-500 pt-0.5 font-mono">
                            <span>Interconnects: <strong className="text-slate-300">{connectionEdgesCount}</strong> / {maxPossibleLinks}</span>
                            <span>Scale: <strong className="text-amber-400">{scaleFactor}x</strong></span>
                        </div>
                    </div>

                    {/* Real-Time Telemetry Chart with Recharts / Sparkline Tab Selector */}
                    <div>
                        <div className="flex justify-between items-center text-[8px] text-slate-400 mb-1">
                            <div className="flex gap-1.5 items-center">
                                <button
                                    onClick={() => setChartTab('RECHARTS')}
                                    className={`px-1.5 py-0.5 rounded text-[8px] font-bold transition-all ${
                                        chartTab === 'RECHARTS' 
                                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' 
                                            : 'text-slate-400 hover:text-white'
                                    }`}
                                >
                                    📊 Scaling Efficiency
                                </button>
                                <button
                                    onClick={() => setChartTab('SPARKLINE')}
                                    className={`px-1.5 py-0.5 rounded text-[8px] font-bold transition-all ${
                                        chartTab === 'SPARKLINE' 
                                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' 
                                            : 'text-slate-400 hover:text-white'
                                    }`}
                                >
                                    ⚡ Stream
                                </button>
                            </div>
                            {onOpenFullGraphModal && (
                                <button 
                                    onClick={onOpenFullGraphModal}
                                    className="text-cyan-400 hover:text-cyan-200 text-[8px] font-bold underline"
                                    title="Open full-screen scaling efficiency graph"
                                >
                                    Enlarge ↗
                                </button>
                            )}
                        </div>

                        <div className="bg-black/70 border border-white/10 rounded-lg p-2">
                            {chartTab === 'RECHARTS' ? (
                                <ScalingEfficiencyChart data={scalingTelemetryHistory} height={135} />
                            ) : (
                                <NetworkDensitySparkline data={throughputHistory} color="#f59e0b" />
                            )}
                        </div>
                    </div>

                    {/* Quick Scale Control Buttons */}
                    <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/5 text-[8px]">
                        <span className="text-slate-400 font-bold uppercase">Scale Swarm Mesh:</span>
                        <div className="flex gap-1.5">
                            <button
                                onClick={() => onManualSpawn(5)}
                                className="px-2 py-1 bg-amber-950/70 hover:bg-amber-900 text-amber-300 font-bold rounded border border-amber-500/40 transition-all active:scale-95"
                                title="Spawn +5 nodes to scale throughput"
                            >
                                +5 Nodes
                            </button>
                            <button
                                onClick={() => onManualSpawn(10)}
                                className="px-2 py-1 bg-cyan-950/70 hover:bg-cyan-900 text-cyan-300 font-bold rounded border border-cyan-500/40 transition-all active:scale-95"
                                title="Spawn +10 nodes to scale throughput"
                            >
                                +10 Nodes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

interface SwarmVisualizerProps { id: string; }

const SwarmVisualizer: React.FC<SwarmVisualizerProps> = ({ id }) => {
    const { bots: globalBots, isSwarmSimulating, setSwarmSimulating, addLog, spawnBots } = useAppContext();
    const [selectedLegion, setSelectedLegion] = useState<LegionName | 'ALL'>('ALL');
    const [selectedBotIds, setSelectedBotIds] = useState<number[]>([]);
    const [hoveredBotId, setHoveredBotId] = useState<number | null>(null);
    const [latencyThreshold, setLatencyThreshold] = useState(100);
    const [latencyHistories, setLatencyHistories] = useState<Record<number, number[]>>({});
    const [isLoading, setIsLoading] = useState(false);
    
    // View mode: MESH, GRID, DUAL
    const [viewMode, setViewMode] = useState<'MESH' | 'GRID' | 'DUAL'>('MESH');
    
    // Spawn animation tracking
    const [newBotIds, setNewBotIds] = useState<Set<number>>(new Set());
    const [spawnEvent, setSpawnEvent] = useState<{ count: number; linksAdded: number; densityDelta: number; timestamp: number } | null>(null);

    // Custom Topology Modifiers (Links & Unlinks)
    const [customLinks, setCustomLinks] = useState<string[]>([]);
    const [customUnlinks, setCustomUnlinks] = useState<string[]>([]);
    const [topologyFeedback, setTopologyFeedback] = useState<{ message: string; densityDelta: number; timestamp: number } | null>(null);

    // Local animated bots
    const [bots, setAnimatedBots] = useState<Bot[]>(globalBots);

    const [isDragging, setIsDragging] = useState(false);
    const [dragMode, setDragMode] = useState<'add' | 'remove'>('add');

    const prevBotsLengthRef = useRef(globalBots.length);
    const botsRef = useRef(bots);

    useEffect(() => {
        botsRef.current = bots;
    }, [bots]);

    // Detect SPAWN events when globalBots length increases
    useEffect(() => {
        if (globalBots.length > prevBotsLengthRef.current) {
            const addedCount = globalBots.length - prevBotsLengthRef.current;
            const existingIds = new Set(botsRef.current.map(b => b.id));
            const newlyAdded = globalBots.filter(b => !existingIds.has(b.id));
            const newlyAddedIds = new Set(newlyAdded.map(b => b.id));

            setNewBotIds(newlyAddedIds);
            
            // Calculate connection boost
            const estimatedNewLinks = addedCount * 3 + Math.floor(addedCount * 1.5);
            const prevDensity = prevBotsLengthRef.current > 1 
                ? (prevBotsLengthRef.current * 2.5) / (prevBotsLengthRef.current * (prevBotsLengthRef.current - 1)) * 100 
                : 10;
            const newDensity = (globalBots.length * 2.5) / (globalBots.length * (globalBots.length - 1)) * 100;
            const delta = Math.max(0.5, Math.round((newDensity - prevDensity) * 10) / 10);

            setSpawnEvent({
                count: addedCount,
                linksAdded: estimatedNewLinks,
                densityDelta: delta,
                timestamp: Date.now()
            });

            // Clear temporary spawn highlighting after 4 seconds
            const timer = setTimeout(() => {
                setNewBotIds(new Set());
            }, 4000);

            prevBotsLengthRef.current = globalBots.length;
            setAnimatedBots(globalBots);

            return () => clearTimeout(timer);
        } else {
            prevBotsLengthRef.current = globalBots.length;
            setAnimatedBots(globalBots);
        }
    }, [globalBots]);

    useEffect(() => {
        const generateInitial = (bot: Bot) => Array(15).fill(0).map(() => bot.efficiency < 50 ? Math.floor(Math.random() * 50 + 100) : Math.floor(Math.random() * 20 + 5));
        
        setLatencyHistories(prev => {
            const next = { ...prev };
            botsRef.current.forEach(bot => {
                if (!next[bot.id]) {
                    next[bot.id] = generateInitial(bot);
                }
            });
            return next;
        });

        if (isSwarmSimulating) {
            const interval = setInterval(() => {
                try {
                    setAnimatedBots(prev => prev.map(bot => {
                        const statusCycle = ['Executing', 'Analyzing', 'Patrolling', 'Synthesizing'];
                        if (Math.random() > 0.8) {
                            return {
                                ...bot,
                                status: statusCycle[Math.floor(Math.random() * statusCycle.length)] as BotStatus,
                                task: 'Recalculating vectors...'
                            };
                        }
                        return bot;
                    }));

                    const data = {
                        latencies: botsRef.current.reduce((acc, bot) => ({
                            ...acc,
                            [bot.id]: bot.efficiency < 50 
                                ? Math.floor(Math.random() * 50 + 100) 
                                : Math.floor(Math.random() * 20 + 5)
                        }), {} as Record<number, number>)
                    };
                    
                    if (data && data.latencies) {
                        setLatencyHistories(prev => {
                            const next = { ...prev };
                            botsRef.current.forEach(bot => {
                                const currentHist = next[bot.id] || generateInitial(bot);
                                const newLatency = data.latencies[bot.id] || 0;
                                next[bot.id] = [...currentHist.slice(1), newLatency];
                            });
                            return next;
                        });
                    }
                } catch (e) {
                    console.warn("Simulated fetch latency failed", e);
                }
            }, 2000);
            return () => clearInterval(interval);
        } else {
            const interval = setInterval(() => {
                setLatencyHistories(prev => {
                    const next = { ...prev };
                    botsRef.current.forEach(bot => {
                        const currentHist = next[bot.id] || generateInitial(bot);
                        const newLatency = bot.efficiency < 50 ? Math.floor(Math.random() * 50 + 100) : Math.floor(Math.random() * 20 + 5);
                        next[bot.id] = [...currentHist.slice(1), newLatency];
                    });
                    return next;
                });
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [isSwarmSimulating]);

    const handleLaunch = async () => {
        setIsLoading(true);
        try {
            if (isSwarmSimulating) {
                await new Promise((resolve) => setTimeout(resolve, 300));
                setSwarmSimulating(false);
                addLog('SWARM', '🛑 SWARM SIMULATION SUSPENDED.');
            } else {
                await new Promise((resolve) => setTimeout(resolve, 600));
                setSwarmSimulating(true); 
                addLog('SWARM', '🚀 SWARM SIMULATION LAUNCHED: Active client-side utilizing synthetic mock telemetry.');
                addLog('SWARM', '⚡ STIGMERGY COORDINATES SYNCHRONIZED. GRID ONLINE.');
            }
        } catch (error) {
            console.error("Simulation toggle failed:", error);
            addLog('ERROR', 'Failed to toggle swarm simulation.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleManualSpawn = (count = 5) => {
        if (typeof spawnBots === 'function') {
            spawnBots(count);
        } else {
            addLog('SWARM', `⚡ [SPAWN COMMAND EXECUTED] +${count} agents spawned into network mesh.`);
        }
    };

    const handleMouseDownBot = (botId: number) => {
        setIsDragging(true);
        if (selectedBotIds.includes(botId)) {
            setDragMode('remove');
            setSelectedBotIds(prev => prev.filter(id => id !== botId));
        } else {
            setDragMode('add');
            setSelectedBotIds(prev => [...prev, botId]);
        }
    };

    const handleMouseEnterBot = (botId: number) => {
        if (isDragging) {
            if (dragMode === 'add') {
                setSelectedBotIds(prev => prev.includes(botId) ? prev : [...prev, botId]);
            } else {
                setSelectedBotIds(prev => prev.filter(id => id !== botId));
            }
        }
    };

    useEffect(() => {
        const handleMouseUp = () => setIsDragging(false);
        window.addEventListener('mouseup', handleMouseUp);
        return () => window.removeEventListener('mouseup', handleMouseUp);
    }, []);

    // -------------------------------------------------------------
    // INTERACTIVE NODE LINK / UNLINK TOPOLOGY HANDLERS
    // -------------------------------------------------------------
    const handleLinkSelectedNodes = () => {
        if (selectedBotIds.length < 2) return;
        const newLinksToAdd: string[] = [];
        for (let i = 0; i < selectedBotIds.length; i++) {
            for (let j = i + 1; j < selectedBotIds.length; j++) {
                const id1 = selectedBotIds[i];
                const id2 = selectedBotIds[j];
                const key = id1 < id2 ? `${id1}-${id2}` : `${id2}-${id1}`;
                newLinksToAdd.push(key);
            }
        }

        setCustomLinks(prev => Array.from(new Set([...prev, ...newLinksToAdd])));
        setCustomUnlinks(prev => prev.filter(k => !newLinksToAdd.includes(k)));

        const linksCount = newLinksToAdd.length;
        addLog('SWARM', `⚡ [TOPOLOGY LINK] Established ${linksCount} custom interconnects across nodes: U-${selectedBotIds.join(', U-')}`);
        
        setTopologyFeedback({
            message: `LINKED ${selectedBotIds.length} NODES (+${linksCount} LINKS)`,
            densityDelta: Math.round((linksCount / Math.max(1, bots.length)) * 10) / 10,
            timestamp: Date.now()
        });
    };

    const handleUnlinkSelectedNodes = () => {
        if (selectedBotIds.length < 2) return;
        const keysToRemove: string[] = [];
        for (let i = 0; i < selectedBotIds.length; i++) {
            for (let j = i + 1; j < selectedBotIds.length; j++) {
                const id1 = selectedBotIds[i];
                const id2 = selectedBotIds[j];
                const key = id1 < id2 ? `${id1}-${id2}` : `${id2}-${id1}`;
                keysToRemove.push(key);
            }
        }

        setCustomUnlinks(prev => Array.from(new Set([...prev, ...keysToRemove])));
        setCustomLinks(prev => prev.filter(k => !keysToRemove.includes(k)));

        const linksCount = keysToRemove.length;
        addLog('SWARM', `✂️ [TOPOLOGY UNLINK] Severed ${linksCount} connections between nodes: U-${selectedBotIds.join(', U-')}`);

        setTopologyFeedback({
            message: `UNLINKED ${selectedBotIds.length} NODES (-${linksCount} LINKS)`,
            densityDelta: -Math.round((linksCount / Math.max(1, bots.length)) * 10) / 10,
            timestamp: Date.now()
        });
    };

    const handleToggleEdge = (edgeKey: string, fromId: number, toId: number) => {
        if (customUnlinks.includes(edgeKey)) {
            setCustomUnlinks(prev => prev.filter(k => k !== edgeKey));
            setCustomLinks(prev => Array.from(new Set([...prev, edgeKey])));
            addLog('SWARM', `⚡ [TOPOLOGY RE-LINK] Restored edge U-${fromId} ↔ U-${toId}`);
            setTopologyFeedback({ message: `RESTORED EDGE U-${fromId} ↔ U-${toId}`, densityDelta: 0.5, timestamp: Date.now() });
        } else {
            setCustomUnlinks(prev => Array.from(new Set([...prev, edgeKey])));
            setCustomLinks(prev => prev.filter(k => k !== edgeKey));
            addLog('SWARM', `✂️ [TOPOLOGY UNLINK] Severed edge U-${fromId} ↔ U-${toId}`);
            setTopologyFeedback({ message: `SEVERED EDGE U-${fromId} ↔ U-${toId}`, densityDelta: -0.5, timestamp: Date.now() });
        }
    };

    const handleResetCustomTopology = () => {
        setCustomLinks([]);
        setCustomUnlinks([]);
        addLog('SWARM', `🔄 [TOPOLOGY RESET] Restored baseline topology network mesh.`);
        setTopologyFeedback({ message: `TOPOLOGY RESET TO BASELINE`, densityDelta: 0, timestamp: Date.now() });
    };

    const selectedBots = useMemo(() => selectedBotIds.map(id => bots.find(b => b.id === id)).filter(Boolean) as Bot[], [selectedBotIds, bots]);
    
    const subSwarmHistory = useMemo(() => {
        if (selectedBots.length <= 1) return [];
        const length = 15;
        const avgHistory = [];
        for (let i = 0; i < length; i++) {
            let sum = 0;
            let count = 0;
            selectedBots.forEach(bot => {
                const hist = latencyHistories[bot.id];
                if (hist && hist.length === length) {
                    sum += hist[i];
                    count++;
                }
            });
            avgHistory.push(count > 0 ? Math.round(sum / count) : 0);
        }
        return avgHistory;
    }, [selectedBots, latencyHistories]);

    const legions = useMemo(() => {
        const groups: { [key in LegionName]: Bot[] } = {
            Infrastructure: [], Seraphim: [], Voice: [], Growth: [], Security: []
        };
        bots.forEach(bot => groups[bot.legion].push(bot));
        return groups;
    }, [bots]);

    const stats = useMemo(() => {
        const active = bots.filter(b => b.status === 'Executing' || b.status === 'Patrolling' || b.status === 'Defending').length;
        return { active, total: bots.length };
    }, [bots]);

    // -------------------------------------------------------------
    // TOPOLOGY GRAPH CALCULATIONS (NODES & EDGES)
    // -------------------------------------------------------------
    const { nodePositions, connectionEdges, networkDensity, maxPossibleLinks } = useMemo(() => {
        const nodeMap = new Map<number, NodePos>();
        const legionCounts: Record<LegionName, number> = {
            Infrastructure: 0, Seraphim: 0, Voice: 0, Growth: 0, Security: 0
        };

        // 1. Calculate Node Coordinates (2D plane)
        bots.forEach(bot => {
            const hub = legionHubs[bot.legion];
            const idx = legionCounts[bot.legion];
            legionCounts[bot.legion]++;

            const angle = (idx * 137.5 * Math.PI) / 180; // Golden angle spiral layout
            const radius = 28 + Math.sqrt(idx + 1) * 22;
            const x = hub.x + Math.cos(angle) * radius;
            const y = hub.y + Math.sin(angle) * radius;

            nodeMap.set(bot.id, {
                id: bot.id,
                x: Math.max(30, Math.min(870, x)),
                y: Math.max(30, Math.min(430, y)),
                bot,
                isNew: newBotIds.has(bot.id)
            });
        });

        // 2. Generate Interconnect Edges
        const edges: ConnectionEdge[] = [];
        const edgeSet = new Set<string>();

        const addEdge = (n1: NodePos, n2: NodePos, strength = 0.5, isCross = false, isCustom = false) => {
            const key = n1.id < n2.id ? `${n1.id}-${n2.id}` : `${n2.id}-${n1.id}`;
            if (edgeSet.has(key)) return;
            if (customUnlinks.includes(key)) return; // Exclude manually unlinked edges
            edgeSet.add(key);

            edges.push({
                id: key,
                fromId: n1.id,
                toId: n2.id,
                fromX: n1.x,
                fromY: n1.y,
                toX: n2.x,
                toY: n2.y,
                isNew: n1.isNew || n2.isNew,
                strength,
                isCrossLegion: isCross,
                isCustomLink: isCustom
            });
        };

        const nodesList = Array.from(nodeMap.values());

        // Connect intra-legion nodes
        (Object.keys(legions) as LegionName[]).forEach(legionName => {
            const legionNodes = nodesList.filter(n => n.bot.legion === legionName);
            for (let i = 0; i < legionNodes.length; i++) {
                // Connect to next 2 nodes in same legion
                if (i + 1 < legionNodes.length) addEdge(legionNodes[i], legionNodes[i + 1], 0.7, false);
                if (i + 2 < legionNodes.length) addEdge(legionNodes[i], legionNodes[i + 2], 0.4, false);
            }
        });

        // Connect inter-legion lead hubs
        const legionHeads: Record<string, NodePos> = {};
        nodesList.forEach(n => {
            if (!legionHeads[n.bot.legion]) legionHeads[n.bot.legion] = n;
        });

        const headList = Object.values(legionHeads);
        for (let i = 0; i < headList.length; i++) {
            for (let j = i + 1; j < headList.length; j++) {
                addEdge(headList[i], headList[j], 0.9, true);
            }
        }

        // Additional interconnects for newly spawned nodes
        nodesList.filter(n => n.isNew).forEach(newN => {
            // Find 3 closest nodes across the entire network
            const sortedByDist = nodesList
                .filter(other => other.id !== newN.id)
                .map(other => ({
                    other,
                    dist: Math.hypot(other.x - newN.x, other.y - newN.y)
                }))
                .sort((a, b) => a.dist - b.dist);

            sortedByDist.slice(0, 4).forEach(({ other }) => {
                addEdge(newN, other, 0.85, newN.bot.legion !== other.bot.legion);
            });
        });

        // 3. Add Custom User Links
        customLinks.forEach(key => {
            if (edgeSet.has(key) || customUnlinks.includes(key)) return;
            const [id1, id2] = key.split('-').map(Number);
            const n1 = nodeMap.get(id1);
            const n2 = nodeMap.get(id2);
            if (n1 && n2) {
                addEdge(n1, n2, 1.0, n1.bot.legion !== n2.bot.legion, true);
            }
        });

        // Calculate Network Density
        const N = nodesList.length;
        const maxLinks = N > 1 ? (N * (N - 1)) / 2 : 1;
        // Density formula normalized for UI representation
        const rawDensity = (edges.length / (N * 2.2)) * 100;
        const density = Math.min(100, Math.round(rawDensity * 10) / 10);

        return {
            nodePositions: nodesList,
            connectionEdges: edges,
            networkDensity: density,
            maxPossibleLinks: maxLinks
        };
    }, [bots, newBotIds, legions, customLinks, customUnlinks]);

    const hoveredNode = useMemo(() => {
        if (!hoveredBotId) return null;
        return nodePositions.find(n => n.id === hoveredBotId) || null;
    }, [nodePositions, hoveredBotId]);

    // -------------------------------------------------------------
    // REAL-TIME THROUGHPUT & NETWORK DENSITY TELEMETRY
    // -------------------------------------------------------------
    const [throughputUnit, setThroughputUnit] = useState<'GB/s' | 'Ops/s' | 'Ms'>('GB/s');
    const [isDensityWidgetExpanded, setIsDensityWidgetExpanded] = useState(true);

    const totalThroughputOps = useMemo(() => {
        const activeBots = bots.filter(b => b.status !== 'Idle');
        const baseOps = activeBots.reduce((sum, b) => {
            const mult = b.status === 'Executing' ? 2.5 : b.status === 'Defending' ? 2.0 : b.status === 'Synthesizing' ? 1.8 : 1.3;
            return sum + (b.efficiency * mult * 14.2);
        }, 0);
        const linkBoost = connectionEdges ? connectionEdges.length * 52 : 0;
        return Math.round(baseOps + linkBoost);
    }, [bots, connectionEdges]);

    const formattedThroughput = useMemo(() => {
        if (throughputUnit === 'GB/s') {
            const gbps = (totalThroughputOps * 0.00142).toFixed(2);
            return `${gbps} GB/s`;
        } else if (throughputUnit === 'Ops/s') {
            return `${totalThroughputOps.toLocaleString()} Ops/s`;
        } else {
            const totalLat = bots.reduce((s, b) => {
                const hist = latencyHistories[b.id];
                const lat = hist && hist.length > 0 ? hist[hist.length - 1] : 20;
                return s + lat;
            }, 0);
            const avgLat = bots.length > 0 ? Math.round(totalLat / bots.length) : 0;
            return `${avgLat} ms`;
        }
    }, [totalThroughputOps, throughputUnit, bots, latencyHistories]);

    const [throughputHistory, setThroughputHistory] = useState<number[]>([]);
    const [scalingTelemetryHistory, setScalingTelemetryHistory] = useState<ScalingTelemetryPoint[]>([]);
    const [isScalingGraphModalOpen, setIsScalingGraphModalOpen] = useState(false);

    useEffect(() => {
        if (totalThroughputOps > 0) {
            setThroughputHistory(prev => {
                const jitter = Math.round((Math.random() - 0.48) * (totalThroughputOps * 0.04));
                const val = Math.max(10, totalThroughputOps + jitter);
                if (prev.length === 0) {
                    return Array.from({ length: 15 }, (_, i) => Math.round(val * (0.82 + Math.sin(i) * 0.12)));
                }
                const next = [...prev, val];
                if (next.length > 20) next.shift();
                return next;
            });
        }
    }, [totalThroughputOps]);

    useEffect(() => {
        const updateTelemetry = () => {
            if (totalThroughputOps > 0) {
                const nowStr = new Date().toLocaleTimeString().split(' ')[0];
                const activeCount = bots.filter(b => b.status !== 'Idle').length;
                const baseCpu = 18 + (activeCount * 1.8) + (connectionEdges ? connectionEdges.length * 0.2 : 0);
                const jitterCpu = (Math.random() - 0.5) * 6;
                const cpu = Math.min(98, Math.max(12, Math.round(baseCpu + jitterCpu)));
                const efficiencyVal = Math.min(99, Math.max(35, Math.round(98 - (cpu * 0.35) + (networkDensity * 0.18))));
                
                const newPoint: ScalingTelemetryPoint = {
                    time: nowStr,
                    nodes: bots.length,
                    throughput: totalThroughputOps,
                    throughputGbps: Number((totalThroughputOps * 0.00142).toFixed(2)),
                    cpuLoad: cpu,
                    efficiency: efficiencyVal
                };

                setScalingTelemetryHistory(prev => {
                    if (prev.length === 0) {
                        return Array.from({ length: 12 }, (_, i) => {
                            const pastTime = new Date(Date.now() - (12 - i) * 1500).toLocaleTimeString().split(' ')[0];
                            const factor = 0.82 + (i / 12) * 0.18;
                            const tp = Math.round(totalThroughputOps * factor);
                            const c = Math.min(95, Math.max(15, Math.round(cpu * factor)));
                            const eff = Math.min(99, Math.max(40, Math.round(efficiencyVal * (0.9 + Math.sin(i) * 0.08))));
                            return {
                                time: pastTime,
                                nodes: bots.length,
                                throughput: tp,
                                throughputGbps: Number((tp * 0.00142).toFixed(2)),
                                cpuLoad: c,
                                efficiency: eff
                            };
                        });
                    }
                    const next = [...prev, newPoint];
                    if (next.length > 25) next.shift();
                    return next;
                });
            }
        };

        updateTelemetry();
        const interval = setInterval(updateTelemetry, 1500);
        return () => clearInterval(interval);
    }, [totalThroughputOps, bots.length, connectionEdges, networkDensity]);

    return (
        <div id={id} className="tech-panel holographic-panel p-4 flex flex-col h-full overflow-hidden relative">
            {/* Header */}
            <div className="flex flex-wrap justify-between items-center gap-2 mb-3 shrink-0">
                <div className="flex items-center gap-2">
                    <NetworkIcon className="w-5 h-5 text-amber-400 animate-pulse" />
                    <div>
                        <h2 className="micro-label">// SWARM TOPOLOGY & NETWORK MESH</h2>
                        <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest">
                            STIGMERGY GRAPH v102.4
                        </span>
                    </div>
                </div>

                {/* View Mode Tabs */}
                <div className="flex items-center bg-black/60 p-0.5 rounded border border-white/10 text-[9px] font-mono">
                    <button 
                        onClick={() => setViewMode('MESH')}
                        className={`px-2 py-1 rounded transition-all ${viewMode === 'MESH' ? 'bg-amber-500 text-black font-bold shadow-[0_0_10px_rgba(245,158,11,0.5)]' : 'text-slate-400 hover:text-white'}`}
                    >
                        🕸️ MESH GRAPH
                    </button>
                    <button 
                        onClick={() => setViewMode('GRID')}
                        className={`px-2 py-1 rounded transition-all ${viewMode === 'GRID' ? 'bg-amber-500 text-black font-bold shadow-[0_0_10px_rgba(245,158,11,0.5)]' : 'text-slate-400 hover:text-white'}`}
                    >
                        📊 LEGION GRID
                    </button>
                    <button 
                        onClick={() => setViewMode('DUAL')}
                        className={`px-2 py-1 rounded transition-all ${viewMode === 'DUAL' ? 'bg-amber-500 text-black font-bold shadow-[0_0_10px_rgba(245,158,11,0.5)]' : 'text-slate-400 hover:text-white'}`}
                    >
                        ⚡ DUAL VIEW
                    </button>
                </div>

                {/* SPAWN Quick Action & Controls */}
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 bg-amber-950/20 border border-amber-500/40 p-1 rounded">
                        <button 
                            onClick={() => handleManualSpawn(5)}
                            className="flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-black font-mono font-bold text-[9px] uppercase tracking-wider rounded shadow-[0_0_12px_rgba(245,158,11,0.4)] transition-all active:scale-95"
                            title="Spawn 5 new agents into the network mesh"
                        >
                            <SparklesIcon className="w-3 h-3 text-black animate-spin" style={{ animationDuration: '3s' }} />
                            <span>⚡ SPAWN +5</span>
                        </button>
                        <button 
                            onClick={() => handleManualSpawn(10)}
                            className="px-2 py-1 bg-black/60 hover:bg-amber-900/40 text-amber-400 font-mono text-[9px] font-bold rounded border border-amber-500/30 transition-all hover:border-amber-400"
                            title="Spawn 10 agents"
                        >
                            +10
                        </button>
                    </div>

                    <button 
                        onClick={handleLaunch}
                        disabled={isLoading}
                        className="cyber-key px-2.5 py-1 text-amber-400 border-amber-900/50 hover:text-amber-300 hover:bg-amber-900/20 transition-all text-[9px] uppercase tracking-widest font-mono disabled:opacity-50"
                    >
                        {isLoading ? 'Connecting...' : isSwarmSimulating ? '🛑 SUSPEND' : '🚀 Launch!'}
                    </button>

                    <LivePaperBadge />
                </div>
            </div>

            {/* Spawn Event Flash Notification */}
            {spawnEvent && Date.now() - spawnEvent.timestamp < 3500 && (
                <div className="mb-3 p-2 bg-gradient-to-r from-amber-950/80 via-black to-cyan-950/80 border border-amber-500/60 rounded flex justify-between items-center font-mono text-[10px] animate-fade-in shadow-[0_0_20px_rgba(245,158,11,0.3)] shrink-0">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-amber-400 rounded-full animate-ping"></div>
                        <span className="font-bold text-amber-400 uppercase tracking-wider">
                            ⚡ SPAWN COMMAND EXECUTED:
                        </span>
                        <span className="text-slate-200">
                            +{spawnEvent.count} Agents Joined Mesh | +{spawnEvent.linksAdded} Connections Formed
                        </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-cyan-400 font-bold bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-500/30">
                        <span>DENSITY:</span>
                        <span>+{spawnEvent.densityDelta}%</span>
                    </div>
                </div>
            )}

            {/* Topology Change Feedback Toast */}
            {topologyFeedback && Date.now() - topologyFeedback.timestamp < 4000 && (
                <div className="mb-3 p-2 bg-gradient-to-r from-cyan-950/90 via-black to-slate-900/90 border border-cyan-500/60 rounded flex justify-between items-center font-mono text-[10px] animate-fade-in shadow-[0_0_20px_rgba(6,182,212,0.3)] shrink-0">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-ping"></div>
                        <span className="font-bold text-cyan-400 uppercase tracking-wider">
                            ⚡ TOPOLOGY MODIFIED:
                        </span>
                        <span className="text-slate-200">
                            {topologyFeedback.message}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-cyan-300 font-bold bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
                            DENSITY DELTA: {topologyFeedback.densityDelta >= 0 ? `+${topologyFeedback.densityDelta}%` : `${topologyFeedback.densityDelta}%`}
                        </span>
                    </div>
                </div>
            )}

            {/* Network Density HUD Bar */}
            <div className="bg-black/60 border border-white/10 rounded-lg p-2.5 mb-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-mono text-[10px] shrink-0">
                <div>
                    <div className="text-slate-500 uppercase tracking-wider text-[8px]">Total Mesh Nodes</div>
                    <div className="text-sm font-bold text-slate-100 font-mono flex items-center gap-1.5">
                        <CpuChipIcon className="w-3.5 h-3.5 text-amber-400" />
                        <span>{stats.total} Units ({stats.active} Active)</span>
                    </div>
                </div>
                <div>
                    <div className="text-slate-500 uppercase tracking-wider text-[8px]">Active Interconnects</div>
                    <div className="text-sm font-bold text-cyan-400 font-mono flex items-center gap-1.5">
                        <ActivityIcon className="w-3.5 h-3.5 text-cyan-400" />
                        <span>{connectionEdges.length} Links</span>
                    </div>
                </div>
                <div>
                    <div className="text-slate-500 uppercase tracking-wider text-[8px]">Total Throughput</div>
                    <div className="text-sm font-bold text-amber-300 font-mono flex items-center gap-1.5">
                        <RefreshIcon className="w-3.5 h-3.5 text-amber-400 animate-spin" style={{ animationDuration: '8s' }} />
                        <span>{formattedThroughput}</span>
                    </div>
                </div>
                <div 
                    className="flex flex-col justify-center cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => setIsDensityWidgetExpanded(true)}
                    title="Click to expand full telemetry density overlay widget"
                >
                    <div className="flex justify-between items-center text-[9px] mb-1">
                        <span className="text-slate-400 uppercase font-bold tracking-wider flex items-center gap-1">
                            Mesh Density <span className="text-[8px] text-amber-400">⚡ Telemetry</span>
                        </span>
                        <span className="text-amber-400 font-bold font-mono">{networkDensity}%</span>
                    </div>
                    <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-white/5 relative">
                        <div 
                            className="bg-gradient-to-r from-cyan-500 via-amber-500 to-emerald-400 h-full transition-all duration-700 shadow-[0_0_12px_rgba(245,158,11,0.6)]"
                            style={{ width: `${networkDensity}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Main Interactive Display Area */}
            <div className="flex-1 overflow-hidden relative flex flex-col min-h-0 bg-black/40 border border-white/5 rounded-lg p-1">
                
                {/* 1. MESH TOPOLOGY GRAPH VIEW */}
                {(viewMode === 'MESH' || viewMode === 'DUAL') && (
                    <div className={`relative w-full ${viewMode === 'DUAL' ? 'h-1/2 min-h-[220px] border-b border-white/10' : 'h-full'} overflow-hidden bg-gradient-to-b from-black/80 to-[#080b12]`}>
                        
                        {/* Real-time Network Density & Throughput Overlay Widget */}
                        <NetworkDensityOverlayWidget 
                            activeNodes={stats.active}
                            totalNodes={stats.total}
                            connectionEdgesCount={connectionEdges.length}
                            maxPossibleLinks={maxPossibleLinks}
                            networkDensity={networkDensity}
                            totalThroughputOps={totalThroughputOps}
                            formattedThroughput={formattedThroughput}
                            throughputUnit={throughputUnit}
                            setThroughputUnit={setThroughputUnit}
                            throughputHistory={throughputHistory}
                            scalingTelemetryHistory={scalingTelemetryHistory}
                            isExpanded={isDensityWidgetExpanded}
                            setIsExpanded={setIsDensityWidgetExpanded}
                            onManualSpawn={handleManualSpawn}
                            isSimulating={isSwarmSimulating}
                            onOpenFullGraphModal={() => setIsScalingGraphModalOpen(true)}
                        />

                        {/* Background Grid & Hub Labels */}
                        <svg className="w-full h-full absolute inset-0 pointer-events-none opacity-20">
                            <defs>
                                <pattern id="grid-pattern" width="30" height="30" patternUnits="userSpaceOnUse">
                                    <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
                                </pattern>
                            </defs>
                            <rect width="100%" height="100%" fill="url(#grid-pattern)" />
                        </svg>

                        {/* Interactive SVG Network Graph */}
                        <svg 
                            viewBox="0 0 900 480" 
                            className="w-full h-full overflow-visible"
                            onMouseDown={() => setSelectedBotIds([])}
                        >
                            <defs>
                                <radialGradient id="hub-glow-infra" cx="50%" cy="50%" r="50%">
                                    <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.3" />
                                    <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
                                </radialGradient>
                                <radialGradient id="hub-glow-seraphim" cx="50%" cy="50%" r="50%">
                                    <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.3" />
                                    <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
                                </radialGradient>
                                <radialGradient id="hub-glow-voice" cx="50%" cy="50%" r="50%">
                                    <stop offset="0%" stopColor="#a855f7" stopOpacity="0.3" />
                                    <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
                                </radialGradient>
                                <radialGradient id="hub-glow-growth" cx="50%" cy="50%" r="50%">
                                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                                    <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                                </radialGradient>
                                <radialGradient id="hub-glow-security" cx="50%" cy="50%" r="50%">
                                    <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.3" />
                                    <stop offset="100%" stopColor="#f43f5e" stopOpacity="0" />
                                </radialGradient>
                            </defs>

                            {/* Legion Hub Center Ambient Glows */}
                            {Object.entries(legionHubs).map(([name, hub]) => (
                                <g key={name}>
                                    <circle cx={hub.x} cy={hub.y} r="75" fill={`url(#hub-glow-${name.toLowerCase()})`} />
                                    <text x={hub.x} y={hub.y - 65} textAnchor="middle" fill={legionColors[name as LegionName].stroke} fontSize="9" fontWeight="bold" fontFamily="monospace" letterSpacing="1">
                                        // {name.toUpperCase()}
                                    </text>
                                </g>
                            ))}

                            {/* Connection Edges */}
                            {connectionEdges.map(edge => {
                                const isHighlighted = selectedBotIds.includes(edge.fromId) || selectedBotIds.includes(edge.toId) || hoveredBotId === edge.fromId || hoveredBotId === edge.toId;
                                const strokeColor = edge.isCustomLink ? '#06b6d4' : edge.isNew ? '#f59e0b' : isHighlighted ? '#22d3ee' : edge.isCrossLegion ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.12)';
                                const strokeWidth = edge.isCustomLink ? 2.2 : edge.isNew ? 2 : isHighlighted ? 1.8 : edge.isCrossLegion ? 1.2 : 0.8;

                                return (
                                    <g key={edge.id} className="cursor-pointer group/edge" onClick={(e) => { e.stopPropagation(); handleToggleEdge(edge.id, edge.fromId, edge.toId); }}>
                                        {/* Invisible wider hit line for easy clicking */}
                                        <line
                                            x1={edge.fromX}
                                            y1={edge.fromY}
                                            x2={edge.toX}
                                            y2={edge.toY}
                                            stroke="transparent"
                                            strokeWidth="10"
                                        />
                                        <line 
                                            x1={edge.fromX} 
                                            y1={edge.fromY} 
                                            x2={edge.toX} 
                                            y2={edge.toY} 
                                            stroke={strokeColor} 
                                            strokeWidth={strokeWidth}
                                            strokeDasharray={edge.isCustomLink ? '5 3' : edge.isNew ? '4 2' : 'none'}
                                            className={`${edge.isNew || edge.isCustomLink ? 'animate-pulse' : ''} group-hover/edge:stroke-cyan-300 transition-all`}
                                        />
                                        {/* Animated Energy Signal Particle */}
                                        {(isHighlighted || edge.isNew || edge.isCustomLink || Math.random() > 0.6) && (
                                            <circle r={edge.isCustomLink ? "2.8" : edge.isNew ? "2.5" : "1.5"} fill={edge.isCustomLink ? "#06b6d4" : edge.isNew ? "#f59e0b" : "#22d3ee"}>
                                                <animateMotion 
                                                    path={`M ${edge.fromX} ${edge.fromY} L ${edge.toX} ${edge.toY}`}
                                                    dur={`${2 + (edge.fromId % 3)}s`}
                                                    repeatCount="indefinite"
                                                />
                                            </circle>
                                        )}
                                    </g>
                                );
                            })}

                            {/* Agent Nodes */}
                            {nodePositions.map(node => {
                                const isSelected = selectedBotIds.includes(node.id);
                                const isHovered = hoveredBotId === node.id;
                                const isNew = node.isNew;
                                const nodeColor = statusColors[node.bot.status] || '#10b981';
                                const legColor = legionColors[node.bot.legion]?.stroke || '#22d3ee';

                                return (
                                    <g 
                                        key={node.id} 
                                        transform={`translate(${node.x}, ${node.y})`}
                                        className="cursor-pointer group"
                                        onMouseDown={(e) => { e.stopPropagation(); handleMouseDownBot(node.id); }}
                                        onMouseEnter={() => setHoveredBotId(node.id)}
                                        onMouseLeave={() => setHoveredBotId(null)}
                                    >
                                        {/* Outer Burst Ring for Spawned Nodes */}
                                        {isNew && (
                                            <circle r="16" fill="none" stroke="#f59e0b" strokeWidth="1.5" className="animate-ping opacity-75" />
                                        )}

                                        {/* Selection Ring */}
                                        {isSelected && (
                                            <circle r="14" fill="none" stroke="#22d3ee" strokeWidth="1.5" strokeDasharray="3 2" className="animate-spin" style={{ animationDuration: '6s' }} />
                                        )}

                                        {/* Base Node Circle */}
                                        <circle 
                                            r={isHovered || isSelected ? "8" : "6"} 
                                            fill={nodeColor}
                                            stroke={isNew ? "#f59e0b" : legColor}
                                            strokeWidth={isNew ? "2" : "1.2"}
                                            className="transition-all duration-300"
                                        />

                                        {/* Central Core Pulse */}
                                        <circle r="2" fill="#ffffff" opacity="0.9" />

                                        {/* Unit ID Label */}
                                        <text 
                                            y="16" 
                                            textAnchor="middle" 
                                            fill={isSelected ? '#22d3ee' : isNew ? '#f59e0b' : '#94a3b8'} 
                                            fontSize="8" 
                                            fontFamily="monospace"
                                            fontWeight="bold"
                                        >
                                            U-{node.id}
                                        </text>
                                    </g>
                                );
                            })}
                        </svg>

                        {/* Top Right Topology Legend Overlay */}
                        <div className="absolute top-2 right-2 bg-black/80 border border-white/10 rounded p-2 text-[8px] font-mono space-y-1 backdrop-blur-sm pointer-events-none">
                            <div className="text-slate-400 font-bold mb-1 border-b border-white/10 pb-0.5 uppercase">// MESH LEGEND</div>
                            {(Object.keys(legionColors) as LegionName[]).map(l => (
                                <div key={l} className="flex items-center gap-1.5">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: legionColors[l].stroke }}></div>
                                    <span className="text-slate-300">{l}</span>
                                </div>
                            ))}
                        </div>

                        {/* Floating Real-Time Hover Tooltip overlay for Mesh View */}
                        {hoveredNode && (
                            <NodeHoverTooltip 
                                bot={hoveredNode.bot} 
                                latencyHistory={latencyHistories[hoveredNode.id] || []} 
                                connectionEdgesCount={connectionEdges.filter(e => e.fromId === hoveredNode.id || e.toId === hoveredNode.id).length}
                                nodePos={{ x: hoveredNode.x, y: hoveredNode.y }}
                            />
                        )}
                    </div>
                )}

                {/* 2. LEGION GRID VIEW */}
                {(viewMode === 'GRID' || viewMode === 'DUAL') && (
                    <div className={`flex-1 overflow-y-auto space-y-3 p-2 relative custom-scrollbar ${viewMode === 'DUAL' ? 'h-1/2' : 'h-full'}`} onMouseDown={() => setSelectedBotIds([])}>
                        {(Object.keys(legions) as LegionName[]).map(name => (
                            <div key={name} className={`p-2.5 rounded-lg border border-white/5 bg-black/40 transition-opacity ${selectedLegion !== 'ALL' && selectedLegion !== name ? 'opacity-30' : 'opacity-100'}`}>
                                <div className="flex justify-between items-center mb-1.5 cursor-pointer group" onClick={() => setSelectedLegion(name === selectedLegion ? 'ALL' : name)}>
                                    <span className="text-[10px] font-bold text-slate-300 font-mono uppercase tracking-widest group-hover:text-amber-400 transition-colors">{name}</span>
                                    <span className="text-[9px] text-slate-500 font-mono">{legions[name].length} UNITS</span>
                                </div>
                                <BotGrid 
                                    bots={legions[name]} 
                                    selectedBotIds={selectedBotIds}
                                    hoveredBotId={hoveredBotId}
                                    latencyHistories={latencyHistories}
                                    onMouseDownBot={handleMouseDownBot}
                                    onMouseEnterBot={handleMouseEnterBot}
                                    onMouseLeaveBot={() => setHoveredBotId(null)}
                                    threshold={latencyThreshold}
                                    newBotIds={newBotIds}
                                    connectionEdges={connectionEdges}
                                />
                            </div>
                        ))}
                    </div>
                )}

            </div>

            {/* Sub-Swarm Selected Nodes Interactive Topology Overlay */}
            {selectedBotIds.length > 0 && (
                <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 border border-cyan-500/60 rounded-lg p-3 w-72 shadow-[0_0_25px_rgba(6,182,212,0.4)] backdrop-blur-md pointer-events-auto font-mono animate-fade-in">
                    <div className="flex justify-between items-center mb-2 border-b border-cyan-500/20 pb-1.5">
                        <span className="text-[10px] font-bold text-cyan-400 tracking-widest uppercase flex items-center gap-1">
                            <CrosshairIcon className="w-3.5 h-3.5 text-cyan-400" /> Sub-Swarm Topology
                        </span>
                        <div className="flex items-center gap-1.5">
                            <span className="text-[9px] text-amber-300 font-bold bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/30">
                                {selectedBotIds.length} {selectedBotIds.length === 1 ? 'Node' : 'Nodes'}
                            </span>
                            <button 
                                onClick={() => setSelectedBotIds([])}
                                className="text-slate-400 hover:text-white text-[10px] px-1 font-bold"
                                title="Clear node selection"
                            >
                                ✕
                            </button>
                        </div>
                    </div>

                    {selectedBotIds.length > 1 ? (
                        <>
                            <div className="grid grid-cols-2 gap-2 mb-2.5">
                                <button 
                                    onClick={handleLinkSelectedNodes}
                                    className="px-2.5 py-1.5 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-black font-bold text-[9px] rounded flex items-center justify-center gap-1 shadow-[0_0_10px_rgba(6,182,212,0.4)] transition-all active:scale-95 uppercase tracking-wider"
                                    title="Connect all selected nodes pairwise"
                                >
                                    <span>⚡ LINK NODES</span>
                                </button>
                                <button 
                                    onClick={handleUnlinkSelectedNodes}
                                    className="px-2.5 py-1.5 bg-rose-950/80 hover:bg-rose-900 border border-rose-500/50 text-rose-300 font-bold text-[9px] rounded flex items-center justify-center gap-1 transition-all active:scale-95 uppercase tracking-wider"
                                    title="Sever all connections between selected nodes"
                                >
                                    <span>✂️ UNLINK NODES</span>
                                </button>
                            </div>

                            <div className="space-y-1 mb-2 bg-black/40 p-2 rounded border border-white/5">
                                <div className="flex justify-between text-[9px]">
                                    <span className="text-slate-400">AVG LATENCY</span>
                                    <span className="text-amber-400 font-bold">{subSwarmHistory[subSwarmHistory.length - 1] || 0}ms</span>
                                </div>
                                <div className="flex justify-between text-[9px]">
                                    <span className="text-slate-400">SWARM EFFICIENCY</span>
                                    <span className="text-cyan-400 font-bold">{Math.round(selectedBots.reduce((sum, b) => sum + b.efficiency, 0) / (selectedBots.length || 1))}%</span>
                                </div>
                            </div>
                            <div className="flex justify-center">
                                <Sparkline data={subSwarmHistory} threshold={latencyThreshold} />
                            </div>
                        </>
                    ) : (
                        <div className="text-[9px] text-slate-300 space-y-1.5">
                            <div className="flex justify-between">
                                <span className="text-slate-400">SELECTED UNIT:</span>
                                <span className="text-cyan-300 font-bold">U-{selectedBots[0]?.id} ({selectedBots[0]?.legion})</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400">STATUS:</span>
                                <span className="text-emerald-400 font-bold">{selectedBots[0]?.status}</span>
                            </div>
                            <p className="text-[8px] text-slate-500 italic mt-1 border-t border-white/5 pt-1">
                                💡 Drag or click additional nodes to select a sub-swarm and create/sever custom links.
                            </p>
                        </div>
                    )}

                    {(customLinks.length > 0 || customUnlinks.length > 0) && (
                        <div className="mt-2 pt-2 border-t border-cyan-500/20 flex justify-between items-center text-[8px]">
                            <span className="text-amber-400 font-bold">
                                Custom: +{customLinks.length} Links / -{customUnlinks.length} Unlinks
                            </span>
                            <button 
                                onClick={handleResetCustomTopology}
                                className="text-slate-400 hover:text-cyan-300 underline font-mono"
                            >
                                Reset Graph
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Bottom Footer Telemetry Bar */}
            <div className="mt-2 pt-2 border-t border-slate-800 flex flex-wrap justify-between items-center text-[8px] font-mono text-slate-500 uppercase tracking-tighter shrink-0">
                <span>Stigmergy Mesh Engine: v102.4</span>
                <span>Active Legions: {(Object.keys(legions) as LegionName[]).length}</span>
                <span>Dynamic Mesh Links: {connectionEdges.length}</span>
                <span className="text-green-400 font-bold">Density: {networkDensity}%</span>
            </div>

            {/* Full-screen Scaling Efficiency Recharts Modal */}
            {isScalingGraphModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 font-mono animate-fade-in pointer-events-auto">
                    <div className="bg-slate-950 border border-cyan-500/50 rounded-xl p-5 max-w-3xl w-full shadow-[0_0_40px_rgba(6,182,212,0.3)] space-y-4">
                        <div className="flex justify-between items-center border-b border-white/10 pb-3">
                            <div className="flex items-center gap-2">
                                <ActivityIcon className="w-5 h-5 text-cyan-400 animate-pulse" />
                                <div>
                                    <h3 className="text-sm font-bold text-cyan-300 tracking-wider uppercase">
                                        // SWARM SCALING EFFICIENCY & CPU LOAD TELEMETRY (RECHARTS)
                                    </h3>
                                    <p className="text-[10px] text-slate-400">
                                        Real-time correlation matrix: Node Throughput (Ops/s) vs. System CPU Load (%) vs. Scaling Efficiency (%)
                                    </p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setIsScalingGraphModalOpen(false)}
                                className="text-slate-400 hover:text-white text-sm font-bold bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded border border-white/10"
                            >
                                ✕ Close
                            </button>
                        </div>

                        <div className="grid grid-cols-3 gap-3 text-[10px]">
                            <div className="bg-black/60 border border-cyan-500/30 p-2.5 rounded-lg">
                                <div className="text-slate-400 text-[8px] uppercase">Node Throughput</div>
                                <div className="text-lg font-bold text-cyan-300 font-mono mt-0.5">
                                    {formattedThroughput}
                                </div>
                                <div className="text-[8px] text-slate-500">{totalThroughputOps.toLocaleString()} Total Ops/s</div>
                            </div>
                            <div className="bg-black/60 border border-red-500/30 p-2.5 rounded-lg">
                                <div className="text-slate-400 text-[8px] uppercase">Est. System CPU Load</div>
                                <div className="text-lg font-bold text-red-400 font-mono mt-0.5">
                                    {scalingTelemetryHistory.length > 0 ? scalingTelemetryHistory[scalingTelemetryHistory.length - 1].cpuLoad : 0}%
                                </div>
                                <div className="text-[8px] text-slate-500">Across {stats.active} Active Nodes</div>
                            </div>
                            <div className="bg-black/60 border border-emerald-500/30 p-2.5 rounded-lg">
                                <div className="text-slate-400 text-[8px] uppercase">Scaling Efficiency</div>
                                <div className="text-lg font-bold text-emerald-400 font-mono mt-0.5">
                                    {scalingTelemetryHistory.length > 0 ? scalingTelemetryHistory[scalingTelemetryHistory.length - 1].efficiency : 0}%
                                </div>
                                <div className="text-[8px] text-slate-500">Network Density: {networkDensity}%</div>
                            </div>
                        </div>

                        <div className="bg-black/80 border border-white/10 rounded-xl p-3">
                            <ScalingEfficiencyChart data={scalingTelemetryHistory} height={260} />
                        </div>

                        <div className="flex justify-between items-center text-[9px] text-slate-400 pt-1">
                            <span>Data points sampled live every 1.5s via Recharts Engine</span>
                            <button
                                onClick={() => setIsScalingGraphModalOpen(false)}
                                className="px-3 py-1 bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 font-bold rounded border border-cyan-500/40 transition-colors"
                            >
                                Return to Swarm Mesh
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default React.memo(SwarmVisualizer);
