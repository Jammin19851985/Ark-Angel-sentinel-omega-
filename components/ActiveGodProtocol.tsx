
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { PowerIcon } from './icons/PowerIcon';
import { DownloadIcon } from './icons/DownloadIcon';
import { PlayCircleIcon } from './icons/PlayCircleIcon';
import { CrosshairIcon } from './icons/CrosshairIcon';
import Loader from './Loader';

// Updated Command Types based on Readiness Ranger script
type GodCommand = 'DEPLOY_SWARM' | 'CAPITAL_SHIFT' | 'FLASH_ARB' | 'LIQUIDITY_BURN' | 'DELTA_NEUTRALIZE' | 'REGIME_ADAPT' | 'SPAWN_PROCESS' | 'PROFIT_SWEEP' | 'SYSTEM_PURGE';

const ActiveGodProtocol: React.FC = () => {
    const { addNexusLog, addLog, executeOperation, installProtocol, runSystem, killSwitchActive } = useAppContext();
    const [commandInput, setCommandInput] = useState('');
    const [frequency, setFrequency] = useState(1.01e41); // Divine Frequency
    const [timelineId, setTimelineId] = useState<string>('');
    const [isOpActive, setIsOpActive] = useState<string | null>(null);

    useEffect(() => {
        setTimelineId(Math.random().toString(36).substring(2, 10).toUpperCase());
    }, []);
    
    const triggerEffect = (effectClass: string, duration: number) => {
        const root = document.getElementById('root');
        if (root) {
            root.classList.add(effectClass);
            setTimeout(() => {
                root.classList.remove(effectClass);
            }, duration);
        }
    };

    const handleSovereignOp = async (op: 'EXECUTE' | 'INSTALL' | 'RUN') => {
        if (killSwitchActive) return;
        setIsOpActive(op);
        
        try {
            if (op === 'EXECUTE') await executeOperation();
            if (op === 'INSTALL') await installProtocol();
            if (op === 'RUN') await runSystem();
        } finally {
            setTimeout(() => setIsOpActive(null), 1000);
        }
    };

    const executeWill = (cmd: GodCommand) => {
        addNexusLog(`>> AODE_COMMAND: EXECUTING TACTICAL VECTOR: [${cmd}]`);
        
        switch (cmd) {
            case 'DEPLOY_SWARM':
                addNexusLog(">> INITIALIZING AGENT CLUSTER... HUNTING ALPHA.");
                addLog('SYSTEM', 'PROTOCOL: Swarm Deployment Triggered.');
                triggerEffect('god-protocol-levitate', 3000); 
                break;
            case 'CAPITAL_SHIFT':
                addNexusLog(">> REBALANCING CROSS-VENUE LIQUIDITY... WIRE PENDING.");
                addLog('SYSTEM', 'PROTOCOL: Capital Reallocation Active.');
                break;
            case 'FLASH_ARB':
                addNexusLog(">> SCANNING TRIANGULAR VECTORS... LATENCY < 4ms.");
                addLog('SYSTEM', 'PROTOCOL: Flash Arbitrage Sequence.');
                triggerEffect('god-protocol-lightning', 500); 
                break;
            case 'LIQUIDITY_BURN':
                addNexusLog(">> EMERGENCY PROTOCOL: FLATTENING POSITIONS.");
                addLog('SYSTEM', 'PROTOCOL: Liquidity Burn (Emergency Exit).');
                triggerEffect('god-protocol-reset', 2000); 
                break;
            case 'DELTA_NEUTRALIZE':
                addNexusLog(">> CALCULATING GREEKS... RESETTING DELTA TO 0.0.");
                addLog('SYSTEM', 'PROTOCOL: Delta Neutralization Engaged.');
                triggerEffect('god-protocol-heal', 1500); 
                break;
            case 'REGIME_ADAPT':
                addNexusLog(">> DETECTING STRUCTURE... SWITCHING ALGO MODE.");
                addLog('SYSTEM', 'PROTOCOL: Adaptive Regime Shift.');
                break;
            case 'SPAWN_PROCESS':
                addNexusLog(">> COMPILING NEW STRATEGY CONTAINER... L-ENV UP.");
                addLog('SYSTEM', 'PROTOCOL: Process Genesis Initiated.');
                triggerEffect('god-protocol-create', 1000);
                break;
            case 'PROFIT_SWEEP':
                addNexusLog(">> AUDITING PNL... SWEEPING TO COLD VAULT.");
                addLog('SYSTEM', 'PROTOCOL: Profit Extraction Secured.');
                triggerEffect('god-protocol-create', 500);
                break;
            case 'SYSTEM_PURGE':
                addNexusLog(">> CRITICAL ERROR RECOVERY: FLUSHING RAM...");
                addLog('SYSTEM', 'PROTOCOL OMEGA: System Purge & Reboot.');
                triggerEffect('god-protocol-reset', 3000);
                setTimeout(() => {
                    const newTimeline = Math.random().toString(36).substring(2, 10).toUpperCase();
                    setTimelineId(newTimeline);
                    addNexusLog(`>> SYSTEM REBOOTED. TIMELINE: ${newTimeline}`);
                }, 2500);
                break;
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const input = commandInput.trim().toUpperCase();
        if (input === '99') { executeWill('SYSTEM_PURGE'); setCommandInput(''); return; }
        
        // Match input to command
        const found = (['DEPLOY_SWARM', 'CAPITAL_SHIFT', 'FLASH_ARB', 'LIQUIDITY_BURN', 'DELTA_NEUTRALIZE', 'REGIME_ADAPT', 'SPAWN_PROCESS', 'PROFIT_SWEEP', 'SYSTEM_PURGE'] as GodCommand[]).find(c => c === input);
        if (found) executeWill(found);
        else addNexusLog(`>> ERROR: VECTOR [${input}] NOT RECOGNIZED.`);
        setCommandInput('');
    };

    return (
        <div className="w-full h-full bg-black/90 border border-amber-500/30 rounded-lg p-4 font-mono flex flex-col relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none"></div>
            
            <div className="flex justify-between items-center mb-4 border-b border-amber-500/30 pb-2 z-10">
                <h3 className="text-amber-500 font-bold tracking-widest text-xs">$G_PI-LIVE // READINESS RANGER</h3>
                <div className="flex flex-col items-end">
                    <div className="text-[10px] text-amber-700 animate-pulse">FREQ: {frequency.toExponential(2)} Hz</div>
                    <div className="text-[9px] text-slate-500">TL: {timelineId}</div>
                </div>
            </div>

            <div className="flex-1 flex flex-col space-y-4 z-10 overflow-y-auto pr-1">
                {/* PRIMARY SOVEREIGN COMMANDS */}
                <div className="grid grid-cols-3 gap-3">
                    <button 
                        onClick={() => handleSovereignOp('EXECUTE')}
                        disabled={!!isOpActive || killSwitchActive}
                        className={`flex flex-col items-center justify-center gap-2 p-3 rounded border transition-all ${isOpActive === 'EXECUTE' ? 'bg-amber-500 border-amber-400 text-black shadow-[0_0_20px_rgba(245,158,11,0.5)]' : 'bg-black/40 border-amber-500/30 text-amber-500 hover:bg-amber-900/20 hover:border-amber-500'}`}
                    >
                        {isOpActive === 'EXECUTE' ? <Loader /> : <CrosshairIcon className="w-6 h-6" />}
                        <span className="text-[10px] font-bold tracking-[0.2em] uppercase">Execute</span>
                    </button>
                    <button 
                        onClick={() => handleSovereignOp('INSTALL')}
                        disabled={!!isOpActive || killSwitchActive}
                        className={`flex flex-col items-center justify-center gap-2 p-3 rounded border transition-all ${isOpActive === 'INSTALL' ? 'bg-cyan-500 border-cyan-400 text-black shadow-[0_0_20px_rgba(6,182,212,0.5)]' : 'bg-black/40 border-cyan-500/30 text-cyan-500 hover:bg-cyan-900/20 hover:border-cyan-500'}`}
                    >
                        {isOpActive === 'INSTALL' ? <Loader /> : <DownloadIcon className="w-6 h-6" />}
                        <span className="text-[10px] font-bold tracking-[0.2em] uppercase">Install</span>
                    </button>
                    <button 
                        onClick={() => handleSovereignOp('RUN')}
                        disabled={!!isOpActive || killSwitchActive}
                        className={`flex flex-col items-center justify-center gap-2 p-3 rounded border transition-all ${isOpActive === 'RUN' ? 'bg-green-500 border-green-400 text-black shadow-[0_0_20px_rgba(34,197,94,0.5)]' : 'bg-black/40 border-green-500/30 text-green-500 hover:bg-green-900/20 hover:border-green-500'}`}
                    >
                        {isOpActive === 'RUN' ? <Loader /> : <PlayCircleIcon className="w-6 h-6" />}
                        <span className="text-[10px] font-bold tracking-[0.2em] uppercase">Run</span>
                    </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => executeWill('DEPLOY_SWARM')} className="bg-slate-900 border border-slate-700 hover:border-cyan-400 hover:text-cyan-400 text-slate-400 py-2 rounded text-[10px] tracking-widest transition-all">
                        [1] DEPLOY_SWARM
                    </button>
                    <button onClick={() => executeWill('CAPITAL_SHIFT')} className="bg-slate-900 border border-slate-700 hover:border-cyan-400 hover:text-cyan-400 text-slate-400 py-2 rounded text-[10px] tracking-widest transition-all">
                        [2] CAPITAL_SHIFT
                    </button>
                    <button onClick={() => executeWill('FLASH_ARB')} className="bg-slate-900 border border-slate-700 hover:border-yellow-400 hover:text-yellow-400 text-slate-400 py-2 rounded text-[10px] tracking-widest transition-all">
                        [3] FLASH_ARB
                    </button>
                    <button onClick={() => executeWill('LIQUIDITY_BURN')} className="bg-slate-900 border border-slate-700 hover:border-red-400 hover:text-red-400 text-slate-400 py-2 rounded text-[10px] tracking-widest transition-all">
                        [4] LIQUIDITY_BURN
                    </button>
                    <button onClick={() => executeWill('DELTA_NEUTRALIZE')} className="bg-slate-900 border border-slate-700 hover:border-green-400 hover:text-green-400 text-slate-400 py-2 rounded text-[10px] tracking-widest transition-all">
                        [5] DELTA_NEUTRALIZE
                    </button>
                    <button onClick={() => executeWill('REGIME_ADAPT')} className="bg-slate-900 border border-slate-700 hover:border-blue-400 hover:text-blue-400 text-slate-400 py-2 rounded text-[10px] tracking-widest transition-all">
                        [6] REGIME_ADAPT
                    </button>
                    <button onClick={() => executeWill('SPAWN_PROCESS')} className="bg-slate-900 border border-slate-700 hover:border-violet-400 hover:text-violet-400 text-slate-400 py-2 rounded text-[10px] tracking-widest transition-all">
                        [7] SPAWN_PROCESS
                    </button>
                    <button onClick={() => executeWill('PROFIT_SWEEP')} className="bg-slate-900 border border-slate-700 hover:border-amber-400 hover:text-amber-400 text-slate-400 py-2 rounded text-[10px] tracking-widest transition-all">
                        [8] PROFIT_SWEEP
                    </button>
                </div>
                <button onClick={() => executeWill('SYSTEM_PURGE')} className="w-full bg-red-950/30 border border-red-900 hover:border-red-500 hover:text-red-500 text-red-900 py-2 rounded text-xs tracking-[0.2em] transition-all font-bold">
                    [99] SYSTEM_PURGE
                </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-3 relative z-10">
                <input 
                    type="text" 
                    value={commandInput}
                    onChange={(e) => setCommandInput(e.target.value)}
                    className="w-full bg-black border border-amber-900/50 rounded p-2 text-amber-500 text-xs focus:border-amber-500 focus:outline-none placeholder-amber-900/50"
                    placeholder=">> SOVEREIGN COMMAND..."
                />
            </form>
        </div>
    );
};

export default ActiveGodProtocol;
