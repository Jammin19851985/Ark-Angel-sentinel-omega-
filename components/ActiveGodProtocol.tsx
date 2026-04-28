
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { DownloadIcon } from './icons/DownloadIcon';
import { PlayCircleIcon } from './icons/PlayCircleIcon';
import { CrosshairIcon } from './icons/CrosshairIcon';
import Loader from './Loader';

type GodCommand = 'DEPLOY_SWARM' | 'CAPITAL_SHIFT' | 'FLASH_ARB' | 'LIQUIDITY_BURN' | 'DELTA_NEUTRALIZE' | 'REGIME_ADAPT' | 'SPAWN_PROCESS' | 'PROFIT_SWEEP' | 'SYSTEM_PURGE';

const COMMAND_DETAILS: Record<string, { func: string; useCase: string; desc: string }> = {
    'EXECUTE': { func: 'Authorize pending SICO orders.', useCase: 'Finalizing a prepared sovereign operation.', desc: 'Collapses the quantum wavefunction of pending orders.' },
    'INSTALL': { func: 'Inject new protocol logic.', useCase: 'Upgrading system capabilities.', desc: 'Transmutes new code into the UPB-1 compliance layer.' },
    'RUN': { func: 'Engage full system autonomy.', useCase: 'Continuous operation.', desc: 'Activates the main loop of the Living System.' },
    'DEPLOY_SWARM': { func: 'Init autonomous agent cluster.', useCase: 'High-frequency alpha hunting.', desc: 'Spawns 2,500 independent bot instances.' },
    'CAPITAL_SHIFT': { func: 'Reallocation of sovereign liquidity.', useCase: 'Macro-regime shifts.', desc: 'Moves capital using Dimensional Bypass Synthesis.' },
    'FLASH_ARB': { func: 'Atomic triangular arbitrage.', useCase: 'Exploiting inefficiencies.', desc: 'Executes zero-risk loan-flash-repay cycles.' },
    'LIQUIDITY_BURN': { func: 'Emergency exit.', useCase: 'Black swan mitigation.', desc: 'Rapidly dumps risk assets into stablecoins.' },
    'DELTA_NEUTRALIZE': { func: 'Automated hedging.', useCase: 'Protecting inventory.', desc: 'Executes perp swaps to offset spot exposure.' },
    'REGIME_ADAPT': { func: 'AI model switching.', useCase: 'Transitioning strategies.', desc: 'Hot-swaps algorithms based on market entropy.' },
    'SPAWN_PROCESS': { func: 'Create child threads.', useCase: 'Scaling processing.', desc: 'Forks the main AODE kernel.' },
    'PROFIT_SWEEP': { func: 'Realized gain aggregation.', useCase: 'Securing runway.', desc: 'Transfers surplus alpha to Cold Vault.' },
    'SYSTEM_PURGE': { func: 'Total memory wipe.', useCase: 'Compromise detection.', desc: 'Hard reset of AODE runtime.' }
};

const GRID_COMMANDS: GodCommand[] = ['DEPLOY_SWARM', 'CAPITAL_SHIFT', 'FLASH_ARB', 'LIQUIDITY_BURN', 'DELTA_NEUTRALIZE', 'REGIME_ADAPT', 'SPAWN_PROCESS', 'PROFIT_SWEEP'];

const ActiveGodProtocol: React.FC = () => {
    const { addNexusLog, addLog, executeOperation, installProtocol, runSystem, killSwitchActive } = useAppContext();
    const [commandInput, setCommandInput] = useState('');
    const [frequency, setFrequency] = useState(1.01e41);
    const [timelineId, setTimelineId] = useState<string>('');
    const [isOpActive, setIsOpActive] = useState<string | null>(null);

    useEffect(() => { setTimelineId(Math.random().toString(36).substring(2, 10).toUpperCase()); }, []);
    
    const triggerEffect = (effectClass: string, duration: number) => {
        const root = document.getElementById('root');
        if (root) { root.classList.add(effectClass); setTimeout(() => root.classList.remove(effectClass), duration); }
    };

    const logCommandDetails = (cmd: string) => {
        const details = COMMAND_DETAILS[cmd];
        if (details) { addNexusLog(`>> COMMAND: ${cmd}`); addNexusLog(`   FUNC: ${details.func}`); }
    };

    const handleSovereignOp = async (op: 'EXECUTE' | 'INSTALL' | 'RUN') => {
        if (killSwitchActive) return;
        setIsOpActive(op); logCommandDetails(op);
        try {
            if (op === 'EXECUTE') await executeOperation();
            if (op === 'INSTALL') await installProtocol();
            if (op === 'RUN') await runSystem();
        } finally { setTimeout(() => setIsOpActive(null), 1000); }
    };

    const executeWill = (cmd: GodCommand) => {
        logCommandDetails(cmd);
        addNexusLog(`>> GOD_PROTOCOL: ${cmd} INITIATED.`);
        addLog('SYSTEM', `PROTOCOL: ${cmd} Triggered.`);
        if (cmd === 'SYSTEM_PURGE') triggerEffect('god-protocol-reset', 3000);
        else triggerEffect('god-protocol-lightning', 1000);
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
        <div className="cyber-chip p-4 bg-[#1a1200] border border-amber-600/50 shadow-[inset_0_0_30px_rgba(245,158,11,0.2)] h-full flex flex-col relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-amber-500 animate-[scan_2s_infinite]"></div>
            
            <div className="flex justify-between items-center mb-4 border-b border-amber-500/30 pb-2 z-10">
                <h3 className="text-amber-400 font-display font-bold tracking-widest text-xs glow-text-gold">READINESS RANGER // LIVE</h3>
                <div className="flex flex-col items-end">
                    <div className="text-[10px] text-amber-600 font-mono animate-pulse">{frequency.toExponential(2)} Hz</div>
                    <div className="text-[9px] text-amber-800 font-mono">TL: {timelineId}</div>
                </div>
            </div>

            <div className="flex-1 flex flex-col space-y-4 z-10 overflow-y-auto pr-1">
                {/* PRIMARY CONTROLS */}
                <div className="grid grid-cols-3 gap-3 p-3 border border-amber-500/20 rounded bg-amber-950/20">
                    {['EXECUTE', 'INSTALL', 'RUN'].map(op => (
                        <button 
                            key={op}
                            onClick={() => handleSovereignOp(op as any)}
                            disabled={!!isOpActive || killSwitchActive}
                            className={`cyber-key p-2 flex flex-col items-center justify-center gap-1 min-h-[60px] ${isOpActive === op ? 'active bg-amber-600 border-amber-300 text-white' : 'text-amber-500 border-amber-900 hover:text-white'}`}
                        >
                            {isOpActive === op ? <Loader /> : op === 'EXECUTE' ? <CrosshairIcon className="w-5 h-5"/> : op === 'INSTALL' ? <DownloadIcon className="w-5 h-5"/> : <PlayCircleIcon className="w-5 h-5"/>}
                            <span className="text-[9px] font-bold tracking-widest">{op}</span>
                        </button>
                    ))}
                </div>

                {/* GRID COMMANDS */}
                <div className="grid grid-cols-2 gap-2">
                    {GRID_COMMANDS.map((cmd, idx) => (
                        <button 
                            key={cmd}
                            onClick={() => executeWill(cmd)} 
                            className="bg-[#2a2205] border border-amber-800/50 hover:border-amber-500 text-amber-600 hover:text-amber-100 py-2 rounded text-[9px] tracking-widest transition-all active:scale-95 text-left px-3 font-bold font-mono shadow-md"
                        >
                            <span className="opacity-50 mr-2">[{idx + 1}]</span>
                            {cmd}
                        </button>
                    ))}
                </div>
                
                <button 
                    onClick={() => executeWill('SYSTEM_PURGE')} 
                    className="w-full bg-red-950 border border-red-600 text-red-500 hover:text-white hover:bg-red-900 py-3 rounded text-xs tracking-[0.2em] font-display font-bold shadow-[0_0_10px_rgba(220,38,38,0.3)] animate-pulse"
                >
                    [99] SYSTEM_PURGE
                </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-3 relative z-10">
                <input 
                    type="text" 
                    value={commandInput}
                    onChange={(e) => setCommandInput(e.target.value)}
                    className="w-full bg-black border border-amber-500/50 rounded p-2 text-amber-400 text-xs font-mono focus:border-amber-400 focus:outline-none placeholder-amber-900"
                    placeholder=">> AWAITING OMEGA VECTOR..."
                />
            </form>
        </div>
    );
};

export default ActiveGodProtocol;
