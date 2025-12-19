
import React, { useState } from 'react';
import { BotStatus } from '../types';
import { useAppContext } from '../contexts/AppContext';
import { GearsIcon } from './icons/GearsIcon';

const colorOptions = [
    { label: 'Green', bg: 'bg-green-500/70', text: 'text-green-400' },
    { label: 'Emerald', bg: 'bg-emerald-500/70', text: 'text-emerald-400' },
    { label: 'Teal', bg: 'bg-teal-500/70', text: 'text-teal-400' },
    { label: 'Cyan', bg: 'bg-cyan-500/70', text: 'text-cyan-400' },
    { label: 'Sky', bg: 'bg-sky-500/70', text: 'text-sky-400' },
    { label: 'Blue', bg: 'bg-blue-500/70', text: 'text-blue-400' },
    { label: 'Indigo', bg: 'bg-indigo-500/70', text: 'text-indigo-400' },
    { label: 'Violet', bg: 'bg-violet-500/70', text: 'text-violet-400' },
    { label: 'Purple', bg: 'bg-purple-500/70', text: 'text-purple-400' },
    { label: 'Fuchsia', bg: 'bg-fuchsia-500/70', text: 'text-fuchsia-400' },
    { label: 'Pink', bg: 'bg-pink-500/70', text: 'text-pink-400' },
    { label: 'Rose', bg: 'bg-rose-500/70', text: 'text-rose-400' },
    { label: 'Red', bg: 'bg-red-500/70', text: 'text-red-400' },
    { label: 'Orange', bg: 'bg-orange-500/70', text: 'text-orange-400' },
    { label: 'Amber', bg: 'bg-amber-500/70', text: 'text-amber-400' },
    { label: 'Yellow', bg: 'bg-yellow-500/70', text: 'text-yellow-400' },
    { label: 'Slate', bg: 'bg-slate-600/70', text: 'text-slate-400' },
    { label: 'Zinc', bg: 'bg-zinc-600/70', text: 'text-zinc-400' },
];

interface SwarmVisualizerProps {
    id: string; // New: Add ID prop for tour targeting
}

const SwarmVisualizer: React.FC<SwarmVisualizerProps> = ({ id }) => {
    const { bots } = useAppContext();
    const [showConfig, setShowConfig] = useState(false);
    
    // State for user-defined colors
    const [statusSettings, setStatusSettings] = useState<{ [key in BotStatus]: { bg: string, text: string } }>({
        Executing: { bg: 'bg-green-500/70', text: 'text-green-400' },
        Analyzing: { bg: 'bg-amber-500/70', text: 'text-amber-400' },
        Idle: { bg: 'bg-slate-600/70', text: 'text-slate-400' },
    });

    const handleColorChange = (status: BotStatus, bgClass: string) => {
        const option = colorOptions.find(opt => opt.bg === bgClass);
        if (option) {
            setStatusSettings(prev => ({
                ...prev,
                [status]: { bg: option.bg, text: option.text }
            }));
        }
    };

    return (
        <div id={id} className="bg-black/30 backdrop-blur-sm border border-slate-800 rounded-lg p-4 shadow-lg glow-border relative">
            <div className="flex justify-between items-center mb-3">
                <h2 className="text-sm font-bold text-amber-400 font-mono">// AI SWARM STATUS</h2>
                <button 
                    onClick={() => setShowConfig(!showConfig)}
                    className={`transition-colors ${showConfig ? 'text-amber-400' : 'text-slate-500 hover:text-amber-400'}`}
                    aria-label="Customize Colors"
                    title="Customize Indicator Colors"
                >
                    <GearsIcon className="w-4 h-4" />
                </button>
            </div>

            {showConfig && (
                <div className="mb-4 p-3 bg-black/60 rounded border border-slate-700 animate-fade-in-fast text-xs font-mono">
                    <h3 className="text-slate-300 mb-2 font-bold tracking-wide border-b border-slate-700 pb-1">INDICATOR CONFIG</h3>
                    <div className="space-y-2">
                        {(Object.keys(statusSettings) as BotStatus[]).map(status => (
                            <div key={status} className="flex items-center justify-between">
                                <span className="text-slate-400 w-20">{status}</span>
                                <select
                                    value={statusSettings[status].bg}
                                    onChange={(e) => handleColorChange(status, e.target.value)}
                                    className="bg-slate-900 border border-slate-600 rounded px-2 py-1 text-slate-200 focus:border-amber-500 outline-none text-[10px] w-32"
                                >
                                    {colorOptions.map(opt => (
                                        <option key={opt.label} value={opt.bg}>
                                            {opt.label}
                                        </option>
                                    ))}
                                </select>
                                <div className={`w-3 h-3 rounded-full ml-2 ${statusSettings[status].bg}`}></div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-10 gap-1.5">
                {bots.map(bot => (
                    <div key={bot.id} className="relative w-full aspect-square rounded group cursor-crosshair">
                        <div className={`w-full h-full rounded transition-colors duration-500 ${statusSettings[bot.status].bg}`} />
                        
                        {/* Custom Tooltip */}
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black/90 border border-slate-700 text-white text-[10px] font-mono rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 shadow-[0_0_10px_rgba(0,0,0,0.5)]">
                            <span className="text-amber-500">ID:{bot.id}</span> <span className="text-slate-600">|</span> <span className={statusSettings[bot.status].text}>{bot.status}</span>
                        </div>
                    </div>
                ))}
            </div>
            <div className="flex justify-around items-center mt-3 text-xs font-mono text-slate-400">
                {(Object.keys(statusSettings) as BotStatus[]).map(status => (
                    <div key={status} className="flex items-center space-x-1.5">
                        <div className={`w-2.5 h-2.5 rounded-full ${statusSettings[status].bg}`}></div>
                        <span>{status}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default React.memo(SwarmVisualizer);
