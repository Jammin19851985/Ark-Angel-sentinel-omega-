
import React, { useState, useMemo, useEffect } from 'react';
import { BotStatus, Bot, LegionName } from '../types';
import { useAppContext } from '../contexts/AppContext';
import { NetworkIcon } from './icons/NetworkIcon';
import { LivePaperBadge } from './LivePaperBadge';
import { IntelligenceAvatar } from './icons/IntelligenceAvatar';
import { DefenseAvatar } from './icons/DefenseAvatar';
import { EfficiencyAvatar } from './icons/EfficiencyAvatar';

const statusGlows: { [key in BotStatus]: string } = {
    Executing: 'shadow-[0_0_8px_rgba(16,185,129,0.5)]',
    Analyzing: 'shadow-[0_0_8px_rgba(245,158,11,0.5)]',
    Idle: 'shadow-none opacity-40 grayscale',
    Patrolling: 'shadow-[0_0_8px_rgba(59,130,246,0.5)]',
    Synthesizing: 'shadow-[0_0_8px_rgba(139,92,246,0.5)]',
    Defending: 'shadow-[0_0_8px_rgba(239,68,68,0.5)]'
};

const BotAvatar: React.FC<{ bot: Bot; isSelected: boolean }> = ({ bot, isSelected }) => {
    // Choose avatar based on role/legion
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

const Sparkline: React.FC<{ data: number[], threshold: number }> = ({ data, threshold }) => {
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

const BotGrid: React.FC<{ 
    bots: Bot[]; 
    selectedBotIds: number[];
    latencyHistories: Record<number, number[]>;
    onMouseDownBot: (id: number) => void;
    onMouseEnterBot: (id: number) => void;
    threshold: number; 
}> = ({ bots, selectedBotIds, latencyHistories, onMouseDownBot, onMouseEnterBot, threshold }) => {
    return (
        <div className="grid grid-cols-10 sm:grid-cols-12 md:grid-cols-15 lg:grid-cols-20 gap-2 p-2 bg-black/40 rounded border border-white/5 overflow-visible">
            {bots.map(bot => {
                const history = latencyHistories[bot.id] || [];
                const currentLatency = history.length > 0 ? history[history.length - 1] : 0;
                const isSelected = selectedBotIds.includes(bot.id);
                const isSingleSelected = selectedBotIds.length === 1 && isSelected;
                
                return (
                    <div key={bot.id} className="relative flex justify-center items-center">
                        <button 
                            onMouseDown={(e) => { e.stopPropagation(); onMouseDownBot(bot.id); }}
                            onMouseEnter={() => onMouseEnterBot(bot.id)}
                            className={`w-4 h-4 relative transition-all duration-300 rounded-sm overflow-visible ${statusGlows[bot.status]} ${isSelected ? 'ring-1 ring-cyan-400 z-10 shadow-[0_0_8px_rgba(34,211,238,0.5)]' : ''}`}
                            title={`Unit ${bot.id}: ${bot.status} (${bot.role})`}
                            style={{ transform: `scale(${1 + Math.min(currentLatency, 200) / 150})` }}
                        >
                            {isSelected && (
                                <span className="absolute inset-0 rounded-sm animate-ping opacity-75 bg-cyan-400/50"></span>
                            )}
                            <BotAvatar bot={bot} isSelected={isSelected} />
                        </button>
                        {isSingleSelected && (
                            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50 bg-slate-900 border border-amber-500/50 rounded p-1.5 text-[9px] font-mono whitespace-nowrap text-left shadow-[0_0_10px_rgba(245,158,11,0.2)]">
                                <div className="text-slate-300 mb-0.5"><span className="text-slate-500">STATUS:</span> <span className={bot.status === 'Executing' ? 'text-green-400' : 'text-slate-200'}>{bot.status.toUpperCase()}</span></div>
                                <div className="text-slate-300"><span className="text-slate-500">LATENCY:</span> <span className="text-amber-400">{currentLatency}ms</span></div>
                                <Sparkline data={history} threshold={threshold} />
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

interface SwarmVisualizerProps { id: string; }

const SwarmVisualizer: React.FC<SwarmVisualizerProps> = ({ id }) => {
    const { bots } = useAppContext();
    const [selectedLegion, setSelectedLegion] = useState<LegionName | 'ALL'>('ALL');
    const [selectedBotIds, setSelectedBotIds] = useState<number[]>([]);
    const [latencyThreshold, setLatencyThreshold] = useState(100);
    const [latencyHistories, setLatencyHistories] = useState<Record<number, number[]>>({});
    const [autoRefresh, setAutoRefresh] = useState(false);
    
    const [isDragging, setIsDragging] = useState(false);
    const [dragMode, setDragMode] = useState<'add' | 'remove'>('add');

    useEffect(() => {
        const generateInitial = (bot: Bot) => Array(15).fill(0).map(() => bot.efficiency < 50 ? Math.floor(Math.random() * 50 + 100) : Math.floor(Math.random() * 20 + 5));
        
        setLatencyHistories(prev => {
            const next = { ...prev };
            bots.forEach(bot => {
                if (!next[bot.id]) {
                    next[bot.id] = generateInitial(bot);
                }
            });
            return next;
        });

        if (autoRefresh) {
            const interval = setInterval(async () => {
                try {
                    const res = await fetch('/api/swarm/latency');
                    if (!res.ok) throw new Error('Network error');
                    const data = await res.json();
                    if (data && data.latencies) {
                        setLatencyHistories(prev => {
                            const next = { ...prev };
                            bots.forEach(bot => {
                                const currentHist = next[bot.id] || generateInitial(bot);
                                const newLatency = data.latencies[bot.id] || 0;
                                next[bot.id] = [...currentHist.slice(1), newLatency];
                            });
                            return next;
                        });
                    }
                } catch (e) {
                    console.error("Failed to fetch latency", e);
                }
            }, 5000);
            return () => clearInterval(interval);
        } else {
            const interval = setInterval(() => {
                setLatencyHistories(prev => {
                    const next = { ...prev };
                    bots.forEach(bot => {
                        const currentHist = next[bot.id] || generateInitial(bot);
                        const newLatency = bot.efficiency < 50 ? Math.floor(Math.random() * 50 + 100) : Math.floor(Math.random() * 20 + 5);
                        next[bot.id] = [...currentHist.slice(1), newLatency];
                    });
                    return next;
                });
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [bots, autoRefresh]);

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

    return (
        <div id={id} className="tech-panel p-4 flex flex-col h-full overflow-hidden relative">
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                    <NetworkIcon className="w-5 h-5 text-amber-400" />
                    <h2 className="micro-label">// SWARM LEGIONS</h2>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <label className="text-[9px] font-mono text-slate-500 uppercase cursor-pointer flex items-center gap-1 hover:text-amber-400 transition-colors">
                            <input 
                                type="checkbox" 
                                checked={autoRefresh} 
                                onChange={(e) => setAutoRefresh(e.target.checked)} 
                                className="accent-amber-500 cursor-pointer"
                            />
                            Live Sync (5s)
                        </label>
                    </div>
                    <div className="flex items-center gap-2">
                        <label className="text-[9px] font-mono text-slate-500 uppercase">Limit</label>
                        <input 
                            type="range" 
                            min="50" max="250" step="10" 
                            value={latencyThreshold} 
                            onChange={(e) => setLatencyThreshold(Number(e.target.value))}
                            className="w-16 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                        />
                        <span className="text-[9px] font-mono text-amber-400 w-8">{latencyThreshold}ms</span>
                    </div>
                    <LivePaperBadge />
                    <div className="text-[10px] font-mono text-green-400 animate-pulse bg-green-900/20 px-2 py-0.5 rounded border border-green-500/30">
                        ACTIVE: {stats.active}
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-1 relative custom-scrollbar pb-10" onMouseDown={() => setSelectedBotIds([])}>
                {(Object.keys(legions) as LegionName[]).map(name => (
                    <div key={name} className={`p-3 rounded-lg border border-white/5 bg-black/40 transition-opacity ${selectedLegion !== 'ALL' && selectedLegion !== name ? 'opacity-30' : 'opacity-100'}`}>
                        <div className="flex justify-between items-center mb-2 cursor-pointer group" onClick={() => setSelectedLegion(name === selectedLegion ? 'ALL' : name)}>
                            <span className="text-[10px] font-bold text-slate-300 font-mono uppercase tracking-widest group-hover:text-amber-400 transition-colors">{name}</span>
                            <span className="text-[9px] text-slate-500 font-mono">{legions[name].length} UNITS</span>
                        </div>
                        <BotGrid 
                            bots={legions[name]} 
                            selectedBotIds={selectedBotIds}
                            latencyHistories={latencyHistories}
                            onMouseDownBot={handleMouseDownBot}
                            onMouseEnterBot={handleMouseEnterBot}
                            threshold={latencyThreshold}
                        />
                    </div>
                ))}
            </div>

            {selectedBotIds.length > 1 && (
                <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-50 bg-slate-900 border border-cyan-500/50 rounded-lg p-3 w-64 shadow-[0_0_20px_rgba(6,182,212,0.2)] pointer-events-none">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] font-bold text-cyan-400 font-mono tracking-widest uppercase">Sub-Swarm Link</span>
                        <span className="text-[9px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">{selectedBotIds.length} Nodes</span>
                    </div>
                    <div className="space-y-1 mb-2">
                        <div className="flex justify-between text-[9px] font-mono">
                            <span className="text-slate-500">AVG LATENCY</span>
                            <span className="text-amber-400">{subSwarmHistory[subSwarmHistory.length - 1] || 0}ms</span>
                        </div>
                        <div className="flex justify-between text-[9px] font-mono">
                            <span className="text-slate-500">EFFICIENCY</span>
                            <span className="text-cyan-400">{Math.round(selectedBots.reduce((sum, b) => sum + b.efficiency, 0) / selectedBots.length)}%</span>
                        </div>
                    </div>
                    <div className="flex justify-center">
                        <Sparkline data={subSwarmHistory} threshold={latencyThreshold} />
                    </div>
                </div>
            )}

            <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between items-center text-[8px] font-mono text-slate-500 uppercase tracking-tighter">
                <span>Stigmergy Engine: v102.0</span>
                <span>Active Legions: {(Object.keys(legions) as LegionName[]).length}</span>
                <span>Ghost Pulse: Sync [0.00ms]</span>
            </div>
        </div>
    );
};

export default React.memo(SwarmVisualizer);
