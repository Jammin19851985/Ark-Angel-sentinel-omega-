
import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { DownloadIcon } from './icons/DownloadIcon';
import { PlayCircleIcon } from './icons/PlayCircleIcon';
import { CrosshairIcon } from './icons/CrosshairIcon';
import Loader from './Loader';

type GodCommand = 'DEPLOY_SWARM' | 'CAPITAL_SHIFT' | 'FLASH_ARB' | 'LIQUIDITY_BURN' | 'DELTA_NEUTRALIZE' | 'REGIME_ADAPT' | 'SPAWN_PROCESS' | 'PROFIT_SWEEP' | 'SYSTEM_PURGE';

const GRID_COMMANDS: GodCommand[] = ['DEPLOY_SWARM', 'CAPITAL_SHIFT', 'FLASH_ARB', 'LIQUIDITY_BURN', 'DELTA_NEUTRALIZE', 'REGIME_ADAPT', 'SPAWN_PROCESS', 'PROFIT_SWEEP'];

const ActiveGodProtocol: React.FC = () => {
    const { addNexusLog, addLog, executeOperation, installProtocol, runSystem, killSwitchActive } = useAppContext();
    const [commandInput, setCommandInput] = useState('');
    const [timelineId, setTimelineId] = useState<string>('');
    const [isOpActive, setIsOpActive] = useState<string | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [rotation, setRotation] = useState({ x: 0, y: 0 });

    useEffect(() => { setTimelineId(Math.random().toString(36).substring(2, 10).toUpperCase()); }, []);
    
    // 3D Tilt Logic
    const handleMouseMove = (e: React.MouseEvent) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        setRotation({ x: y * -10, y: x * 10 });
    };
    const handleMouseLeave = () => setRotation({ x: 0, y: 0 });

    const handleSovereignOp = async (op: 'EXECUTE' | 'INSTALL' | 'RUN') => {
        if (killSwitchActive) return;
        setIsOpActive(op); 
        if(containerRef.current) containerRef.current.classList.add('animate-pulse-fast');
        
        try {
            if (op === 'EXECUTE') await executeOperation();
            if (op === 'INSTALL') await installProtocol();
            if (op === 'RUN') await runSystem();
        } finally { 
            setTimeout(() => {
                setIsOpActive(null);
                if(containerRef.current) containerRef.current.classList.remove('animate-pulse-fast');
            }, 1000); 
        }
    };

    const executeWill = (cmd: GodCommand) => {
        setIsOpActive(cmd);
        addNexusLog(`>> GOD_PROTOCOL: ${cmd} INITIATED.`);
        addLog('SYSTEM', `PROTOCOL: ${cmd} Triggered.`);
        setTimeout(() => setIsOpActive(null), 800);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const input = commandInput.trim().toUpperCase();
        if (input === '99') { executeWill('SYSTEM_PURGE'); setCommandInput(''); return; }
        const found = GRID_COMMANDS.find(c => c === input) || (input === 'SYSTEM_PURGE' ? 'SYSTEM_PURGE' : undefined);
        if (found) executeWill(found);
        else addNexusLog(`>> ERROR: VECTOR [${input}] NOT RECOGNIZED.`);
        setCommandInput('');
    };

    return (
        <div className="perspective-1000 w-full h-full relative" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
            <div 
                ref={containerRef}
                className={`relative w-full h-full bg-[#050505]/90 backdrop-blur-xl border border-slate-800 rounded-xl p-4 shadow-[0_0_40px_rgba(57,255,20,0.1)] flex flex-col overflow-hidden transition-transform duration-200 ease-out preserve-3d ${isOpActive ? 'ring-2 ring-neon-pink ring-opacity-50' : ''}`}
                style={{ 
                    transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
                    clipPath: 'polygon(0 0, 100% 0, 100% 95%, 95% 100%, 0 100%)'
                }}
            >
                {/* Asymmetric Neon Borders */}
                <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-neon-green opacity-80 pointer-events-none"></div>
                <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-neon-pink opacity-80 pointer-events-none"></div>

                {/* Internal Glow Source */}
                <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-neon-green/10 blur-[50px] rounded-full pointer-events-none transition-all duration-500 ${isOpActive ? 'opacity-100 scale-150 bg-neon-pink/20' : 'opacity-0 scale-50'}`}></div>

                {/* Scanline */}
                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-neon-green to-transparent animate-scan opacity-50"></div>
                
                {/* Header */}
                <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-2 z-10">
                    <h3 className="text-neon-green font-display font-bold tracking-widest text-xs flex items-center gap-2 transform -skew-x-12">
                        <span className={`w-2 h-2 rounded-sm ${isOpActive ? 'bg-white animate-ping' : 'bg-neon-pink'}`}></span>
                        GOD_PROTOCOL // <span className="text-neon-pink">LIVE</span>
                    </h3>
                    <div className="text-[9px] text-slate-500 font-mono">TL: {timelineId}</div>
                </div>

                <div className="flex-1 flex flex-col space-y-4 z-10 overflow-y-auto pr-1 custom-scrollbar">
                    {/* Primary Controls */}
                    <div className="grid grid-cols-3 gap-2">
                        {['EXECUTE', 'INSTALL', 'RUN'].map(op => (
                            <button 
                                key={op}
                                onClick={() => handleSovereignOp(op as any)}
                                disabled={!!isOpActive || killSwitchActive}
                                className={`group relative h-14 overflow-hidden border transition-all duration-300 ${
                                    isOpActive === op 
                                    ? 'bg-neon-pink text-black border-white shadow-[0_0_20px_#ff00ff]' 
                                    : 'bg-black/60 border-slate-700 text-neon-green hover:border-neon-green hover:bg-green-950/20 hover:shadow-[0_0_15px_rgba(57,255,20,0.3)]'
                                }`}
                                style={{ clipPath: 'polygon(10% 0, 100% 0, 100% 90%, 90% 100%, 0 100%, 0 10%)' }}
                            >
                                <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                                    {isOpActive === op ? <Loader /> : op === 'EXECUTE' ? <CrosshairIcon className="w-4 h-4 mb-1"/> : op === 'INSTALL' ? <DownloadIcon className="w-4 h-4 mb-1"/> : <PlayCircleIcon className="w-4 h-4 mb-1"/>}
                                    <span className="text-[8px] font-bold tracking-widest">{op}</span>
                                </div>
                                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300 pointer-events-none"></div>
                            </button>
                        ))}
                    </div>

                    {/* Grid Commands */}
                    <div className="grid grid-cols-2 gap-2">
                        {GRID_COMMANDS.map((cmd, idx) => (
                            <button 
                                key={cmd}
                                onClick={() => executeWill(cmd)} 
                                className={`text-left px-2 py-2 text-[8px] font-mono tracking-wider transition-all border relative overflow-hidden group ${
                                    isOpActive === cmd 
                                    ? 'bg-neon-green/20 text-neon-green border-neon-green' 
                                    : 'bg-black/40 text-slate-400 border-slate-800 hover:border-neon-pink hover:text-neon-pink'
                                }`}
                            >
                                <span className="absolute left-0 top-0 bottom-0 w-0.5 bg-current transition-all group-hover:w-full group-hover:opacity-10"></span>
                                <span className="opacity-40 mr-1">0{idx + 1}</span> {cmd}
                            </button>
                        ))}
                    </div>
                    
                    <button 
                        onClick={() => executeWill('SYSTEM_PURGE')} 
                        className="w-full bg-red-950/30 border border-red-900 text-red-500 hover:bg-red-900 hover:text-white hover:border-red-500 py-2 text-[9px] tracking-[0.2em] font-bold uppercase transition-all shadow-[0_0_10px_rgba(220,38,38,0.1)] hover:shadow-[0_0_20px_rgba(220,38,38,0.6)]"
                        style={{ clipPath: 'polygon(0 0, 100% 0, 98% 100%, 2% 100%)' }}
                    >
                        [99] EMERGENCY_PURGE
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="mt-3 relative z-10 group">
                    <input 
                        type="text" 
                        value={commandInput}
                        onChange={(e) => setCommandInput(e.target.value)}
                        className="w-full bg-black/80 border border-slate-800 rounded p-2 text-neon-green text-[10px] font-mono focus:border-neon-green focus:shadow-[0_0_10px_rgba(57,255,20,0.3)] focus:outline-none placeholder-slate-700 transition-all"
                        placeholder=">> AWAITING OMEGA VECTOR..."
                    />
                    <div className="absolute right-2 top-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-neon-pink rounded-full animate-pulse opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
                </form>
            </div>
        </div>
    );
};

export default ActiveGodProtocol;
