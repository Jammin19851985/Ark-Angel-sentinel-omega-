
import React, { useState, useMemo } from 'react';
import { BotStatus, Bot, LegionName } from '../types';
import { useAppContext } from '../contexts/AppContext';
import { NetworkIcon } from './icons/NetworkIcon';
import { LivePaperBadge } from './LivePaperBadge';
import { XCircleIcon } from './icons/XCircleIcon';
import { RefreshIcon } from './icons/RefreshIcon';
import { CrosshairIcon } from './icons/CrosshairIcon';

const statusColors: { [key in BotStatus]: string } = {
    Executing: 'bg-green-500 shadow-[0_0_5px_#10b981]',
    Analyzing: 'bg-amber-500 shadow-[0_0_5px_#f59e0b]',
    Idle: 'bg-slate-800',
    Patrolling: 'bg-blue-500 shadow-[0_0_5px_#3b82f6]',
    Synthesizing: 'bg-violet-500 shadow-[0_0_5px_#8b5cf6]',
    Defending: 'bg-red-500 shadow-[0_0_5px_#ef4444]'
};

const BotGrid: React.FC<{ bots: Bot[]; onSelect: (bot: Bot) => void; selectedId: number | null }> = ({ bots, onSelect, selectedId }) => {
    return (
        <div className="grid grid-cols-25 gap-0.5 p-1 bg-black/40 rounded border border-white/5 overflow-hidden">
            {bots.map(bot => (
                <button 
                    key={bot.id} 
                    onClick={(e) => { e.stopPropagation(); onSelect(bot); }}
                    className={`w-1 h-1 rounded-sm ${statusColors[bot.status]} relative transition-all duration-300 hover:scale-150 hover:z-10 ${selectedId === bot.id ? 'ring-1 ring-white scale-125 z-10' : ''}`}
                    title={`Unit ${bot.id}: ${bot.status}`}
                />
            ))}
        </div>
    );
};

interface SwarmVisualizerProps { id: string; }

const SwarmVisualizer: React.FC<SwarmVisualizerProps> = ({ id }) => {
    const { bots, manageBot } = useAppContext();
    const [selectedLegion, setSelectedLegion] = useState<LegionName | 'ALL'>('ALL');
    const [selectedBot, setSelectedBot] = useState<Bot | null>(null);

    const legions = useMemo(() => {
        const groups: { [key in LegionName]: Bot[] } = {
            Infrastructure: [], Seraphim: [], Voice: [], Growth: [], Security: []
        };
        bots.forEach(bot => groups[bot.legion].push(bot));
        return groups;
    }, [bots]);

    const stats = useMemo(() => {
        const active = bots.filter(b => b.status === 'Executing').length;
        return { active, total: bots.length };
    }, [bots]);

    const handleReboot = () => {
        if (selectedBot) {
            manageBot(selectedBot.id, 'REBOOT');
            setSelectedBot(null);
        }
    };

    const handleAssignTask = () => {
        if (selectedBot) {
            manageBot(selectedBot.id, 'ASSIGN_TASK');
            setSelectedBot(null);
        }
    };

    return (
        <div id={id} className="tech-panel p-4 flex flex-col h-full overflow-hidden relative">
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                    <NetworkIcon className="w-5 h-5 text-amber-400" />
                    <h2 className="text-xs font-bold text-amber-400 font-mono tracking-widest uppercase">// SWARM LEGIONS</h2>
                </div>
                <div className="flex items-center gap-2">
                    <LivePaperBadge />
                    <div className="text-[10px] font-mono text-green-400 animate-pulse bg-green-900/20 px-2 py-0.5 rounded border border-green-500/30">
                        ACTIVE: {stats.active}
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-1 relative">
                {/* Bot Detail Overlay */}
                {selectedBot && (
                    <div className="absolute inset-0 z-20 bg-black/90 backdrop-blur-md flex flex-col justify-center items-center p-4 animate-fade-in rounded border border-slate-700">
                        <div className="w-full max-w-xs bg-slate-900/50 border border-amber-500/30 rounded-lg p-4 relative shadow-[0_0_20px_rgba(245,158,11,0.1)]">
                            <button 
                                onClick={() => setSelectedBot(null)}
                                className="absolute top-2 right-2 text-slate-500 hover:text-white transition-colors"
                            >
                                <XCircleIcon className="w-5 h-5" />
                            </button>
                            
                            <h3 className="text-sm font-bold text-amber-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${statusColors[selectedBot.status]}`}></span>
                                UNIT_ID: {selectedBot.id.toString().padStart(4, '0')}
                            </h3>
                            
                            <div className="space-y-2 text-[10px] font-mono text-slate-300 mb-6">
                                <div className="flex justify-between border-b border-slate-800 pb-1">
                                    <span className="text-slate-500">ROLE</span>
                                    <span className="text-cyan-400 font-bold">{selectedBot.role.toUpperCase()}</span>
                                </div>
                                <div className="flex justify-between border-b border-slate-800 pb-1">
                                    <span className="text-slate-500">LEGION</span>
                                    <span>{selectedBot.legion}</span>
                                </div>
                                <div className="flex justify-between border-b border-slate-800 pb-1">
                                    <span className="text-slate-500">STATUS</span>
                                    <span className={`${selectedBot.status === 'Executing' ? 'text-green-400' : 'text-slate-200'}`}>{selectedBot.status.toUpperCase()}</span>
                                </div>
                                <div className="flex justify-between items-center pt-1">
                                    <span className="text-slate-500">EFFICIENCY</span>
                                    <div className="w-20 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                        <div className="bg-amber-500 h-full transition-all" style={{ width: `${selectedBot.efficiency}%` }}></div>
                                    </div>
                                    <span className="text-amber-500 font-bold ml-2">{selectedBot.efficiency}%</span>
                                </div>
                                <div className="flex justify-between pt-1">
                                    <span className="text-slate-500">XP</span>
                                    <span className="text-violet-400 font-bold">{selectedBot.xp}</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <button 
                                    onClick={handleAssignTask}
                                    className="flex items-center justify-center gap-1 bg-cyan-900/30 hover:bg-cyan-900/50 border border-cyan-600 text-cyan-400 py-2 rounded text-[9px] font-bold uppercase transition-all hover:shadow-[0_0_10px_cyan]"
                                >
                                    <CrosshairIcon className="w-3 h-3" />
                                    Assign Task
                                </button>
                                <button 
                                    onClick={handleReboot}
                                    className="flex items-center justify-center gap-1 bg-red-900/30 hover:bg-red-900/50 border border-red-600 text-red-400 py-2 rounded text-[9px] font-bold uppercase transition-all hover:shadow-[0_0_10px_red]"
                                >
                                    <RefreshIcon className="w-3 h-3" />
                                    Reboot
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {(Object.keys(legions) as LegionName[]).map(name => (
                    <div key={name} className={`p-3 rounded-lg border border-white/5 bg-black/40 transition-opacity ${selectedLegion !== 'ALL' && selectedLegion !== name ? 'opacity-30' : 'opacity-100'}`}>
                        <div className="flex justify-between items-center mb-2 cursor-pointer" onClick={() => setSelectedLegion(name === selectedLegion ? 'ALL' : name)}>
                            <span className="text-[10px] font-bold text-slate-300 font-mono uppercase tracking-widest">{name}</span>
                            <span className="text-[9px] text-slate-500 font-mono">{legions[name].length} UNITS</span>
                        </div>
                        <BotGrid 
                            bots={legions[name]} 
                            onSelect={setSelectedBot}
                            selectedId={selectedBot?.id || null}
                        />
                    </div>
                ))}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between items-center text-[8px] font-mono text-slate-500 uppercase tracking-tighter">
                <span>Stigmergy: v100.0</span>
                <span>M-Container: Synced</span>
                <span>Ghost Pulse: Active</span>
            </div>
        </div>
    );
};

export default React.memo(SwarmVisualizer);
