
import React, { useState, useMemo } from 'react';
import { BotStatus, Bot, LegionName } from '../types';
import { useAppContext } from '../contexts/AppContext';
import { NetworkIcon } from './icons/NetworkIcon';

const statusColors: { [key in BotStatus]: string } = {
    Executing: 'bg-green-500 shadow-[0_0_5px_#10b981]',
    Analyzing: 'bg-amber-500 shadow-[0_0_5px_#f59e0b]',
    Idle: 'bg-slate-800',
    Patrolling: 'bg-blue-500 shadow-[0_0_5px_#3b82f6]',
    Synthesizing: 'bg-violet-500 shadow-[0_0_5px_#8b5cf6]',
    Defending: 'bg-red-500 shadow-[0_0_5px_#ef4444]'
};

const BotGrid: React.FC<{ bots: Bot[] }> = ({ bots }) => {
    return (
        <div className="grid grid-cols-25 gap-0.5 p-1 bg-black/40 rounded border border-white/5 overflow-hidden">
            {bots.map(bot => (
                <div 
                    key={bot.id} 
                    className={`w-1 h-1 rounded-sm ${statusColors[bot.status]} relative transition-all duration-700`}
                />
            ))}
        </div>
    );
};

interface SwarmVisualizerProps { id: string; }

const SwarmVisualizer: React.FC<SwarmVisualizerProps> = ({ id }) => {
    const { bots } = useAppContext();
    const [selectedLegion, setSelectedLegion] = useState<LegionName | 'ALL'>('ALL');

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

    return (
        <div id={id} className="bg-black/30 backdrop-blur-sm border border-slate-800 rounded-lg p-4 shadow-lg glow-border flex flex-col h-full overflow-hidden">
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                    <NetworkIcon className="w-5 h-5 text-amber-400" />
                    <h2 className="text-xs font-bold text-amber-400 font-mono tracking-widest uppercase">// SWARM LEGIONS // 2,500 UNITS</h2>
                </div>
                <div className="text-[10px] font-mono text-green-400 animate-pulse">
                    ACTIVE: {stats.active}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                {(Object.keys(legions) as LegionName[]).map(name => (
                    <div key={name} className={`p-3 rounded-lg border border-white/5 bg-black/40 transition-opacity ${selectedLegion !== 'ALL' && selectedLegion !== name ? 'opacity-30' : 'opacity-100'}`}>
                        <div className="flex justify-between items-center mb-2 cursor-pointer" onClick={() => setSelectedLegion(name === selectedLegion ? 'ALL' : name)}>
                            <span className="text-[10px] font-bold text-slate-300 font-mono uppercase tracking-widest">{name}</span>
                            <span className="text-[9px] text-slate-500 font-mono">{legions[name].length} UNITS</span>
                        </div>
                        <BotGrid bots={legions[name]} />
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
