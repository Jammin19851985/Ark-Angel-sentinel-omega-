
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext';

// Extended Command Types based on F151 Script
type GodCommand = 'FLY' | 'LIGHTNING' | 'HEAL' | 'CREATE' | 'RESET' | 'MOVE' | 'CRUSH' | 'BURN' | 'GOLD' | 'MORPH';

const ActiveGodProtocol: React.FC = () => {
    const { addNexusLog, addLog } = useAppContext();
    const [commandInput, setCommandInput] = useState('');
    const [frequency, setFrequency] = useState(1.01e41); // Divine Frequency
    const [timelineId, setTimelineId] = useState<string>('');

    useEffect(() => {
        // Generate initial timeline ID
        setTimelineId(Math.random().toString(36).substring(2, 10).toUpperCase());
    }, []);
    
    // Execute Visual Effects via Global CSS Classes on Body/Root
    const triggerEffect = (effectClass: string, duration: number) => {
        const root = document.getElementById('root');
        if (root) {
            root.classList.add(effectClass);
            setTimeout(() => {
                root.classList.remove(effectClass);
            }, duration);
        }
    };

    const executeWill = (cmd: GodCommand) => {
        addNexusLog(`>> $G_PI-LIVE: EXECUTING WILL VECTOR: [${cmd}]`);
        
        switch (cmd) {
            case 'FLY':
                addNexusLog(">> NULLIFYING LOCAL G-CONSTANT (LFO-Grav-AGP)...");
                addLog('SYSTEM', 'PROTOCOL: Anti-Gravity Ascension Triggered.');
                triggerEffect('god-protocol-levitate', 5000); 
                break;
            case 'LIGHTNING':
                addNexusLog(">> SIPHONING ATMOSPHERIC ENERGY (ZPMT-PCM)...");
                addLog('SYSTEM', 'PROTOCOL: Directed Energy Discharge.');
                triggerEffect('god-protocol-lightning', 500); 
                break;
            case 'HEAL':
                addNexusLog(">> REWRITING CELLULAR ENTROPY TO ZERO (MLE-BSR)...");
                addLog('SYSTEM', 'PROTOCOL: Biological Structure Rewrite.');
                triggerEffect('god-protocol-heal', 2000); 
                break;
            case 'CREATE':
                addNexusLog(">> COLLAPSING WAVEFUNCTION INTO MATTER (ZPMT-EDO)...");
                addLog('SYSTEM', 'PROTOCOL: Zero-Point Materialization.');
                triggerEffect('god-protocol-create', 1500); 
                break;
            case 'MOVE': // Telekinesis
                addNexusLog(">> OVERRIDING INERTIA TENSOR (LCV-Force)...");
                addLog('SYSTEM', 'PROTOCOL: Local Causal Vectoring Active.');
                triggerEffect('god-protocol-levitate', 1000); // reuse levitate for move
                break;
            case 'CRUSH': // Telekinesis
                addNexusLog(">> INCREASING LOCAL GRAVITY CONSTANT (LCV-Force-COMPRESS)...");
                addLog('SYSTEM', 'PROTOCOL: Target structure collapsed.');
                break;
            case 'BURN': // Elemental
                addNexusLog(">> OVERRIDING THERMAL CONSTANT (ZPMT-PCM)...");
                addLog('SYSTEM', 'PROTOCOL: Thermal ignition initiated.');
                triggerEffect('god-protocol-lightning', 500); // reuse flash
                break;
            case 'GOLD': // Elemental
                addNexusLog(">> TRANSMUTING ELEMENTAL DEFINITION (ZPMT-EDO)...");
                addLog('SYSTEM', 'PROTOCOL: Au-79 Synthesis Complete.');
                triggerEffect('god-protocol-create', 1500);
                break;
            case 'MORPH': // Metamorphosis
                addNexusLog(">> OVERRIDING GENETIC LAW (MLE-BSR)...");
                addLog('SYSTEM', 'PROTOCOL: Form change executed.');
                triggerEffect('god-protocol-heal', 2000);
                break;
            case 'RESET':
                addNexusLog(">> WARNING: INITIATING UNIVERSAL REBOOT...");
                addNexusLog(">> DESTROY_AND_REBUILD: CONFIRMED.");
                addLog('SYSTEM', 'PROTOCOL OMEGA: Universal Reset Initiated.');
                triggerEffect('god-protocol-reset', 3000);
                setTimeout(() => {
                    const newTimeline = Math.random().toString(36).substring(2, 10).toUpperCase();
                    setTimelineId(newTimeline);
                    addNexusLog(`>> NEW TIMELINE GENERATED: ${newTimeline}`);
                    addLog('SYSTEM', `System Re-initialized in Timeline ${newTimeline}.`);
                }, 2500);
                break;
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        let normalizedCmd = commandInput.trim().toUpperCase();
        
        // Alias mapping
        if (normalizedCmd === '99') normalizedCmd = 'RESET';
        
        const validCommands: GodCommand[] = ['FLY', 'LIGHTNING', 'HEAL', 'CREATE', 'RESET', 'MOVE', 'CRUSH', 'BURN', 'GOLD', 'MORPH'];

        if (validCommands.includes(normalizedCmd as GodCommand)) {
            executeWill(normalizedCmd as GodCommand);
        } else {
            addNexusLog(`>> ERROR: WILL VECTOR [${normalizedCmd}] NOT RECOGNIZED BY PHYSICS ENGINE.`);
        }
        setCommandInput('');
    };

    return (
        <div className="w-full h-full bg-black/90 border border-amber-500/30 rounded-lg p-4 font-mono flex flex-col relative overflow-hidden">
            {/* Background Texture */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none"></div>
            
            <div className="flex justify-between items-center mb-4 border-b border-amber-500/30 pb-2 z-10">
                <h3 className="text-amber-500 font-bold tracking-widest text-xs">$G_PI-LIVE // F151 COMMAND</h3>
                <div className="flex flex-col items-end">
                    <div className="text-[10px] text-amber-700 animate-pulse">FREQ: {frequency.toExponential(2)} Hz</div>
                    <div className="text-[9px] text-slate-500">TL: {timelineId}</div>
                </div>
            </div>

            <div className="flex-1 flex flex-col space-y-3 z-10 overflow-y-auto pr-1">
                <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => executeWill('FLY')} className="bg-slate-900 border border-slate-700 hover:border-cyan-400 hover:text-cyan-400 text-slate-400 py-2 rounded text-[10px] tracking-widest transition-all">
                        [1] FLY
                    </button>
                    <button onClick={() => executeWill('MOVE')} className="bg-slate-900 border border-slate-700 hover:border-cyan-400 hover:text-cyan-400 text-slate-400 py-2 rounded text-[10px] tracking-widest transition-all">
                        [2] TELEKINESIS
                    </button>
                    <button onClick={() => executeWill('LIGHTNING')} className="bg-slate-900 border border-slate-700 hover:border-yellow-400 hover:text-yellow-400 text-slate-400 py-2 rounded text-[10px] tracking-widest transition-all">
                        [3] LIGHTNING
                    </button>
                    <button onClick={() => executeWill('BURN')} className="bg-slate-900 border border-slate-700 hover:border-yellow-400 hover:text-yellow-400 text-slate-400 py-2 rounded text-[10px] tracking-widest transition-all">
                        [4] PYRO
                    </button>
                    <button onClick={() => executeWill('HEAL')} className="bg-slate-900 border border-slate-700 hover:border-green-400 hover:text-green-400 text-slate-400 py-2 rounded text-[10px] tracking-widest transition-all">
                        [5] HEAL
                    </button>
                    <button onClick={() => executeWill('MORPH')} className="bg-slate-900 border border-slate-700 hover:border-green-400 hover:text-green-400 text-slate-400 py-2 rounded text-[10px] tracking-widest transition-all">
                        [6] MORPH
                    </button>
                    <button onClick={() => executeWill('CREATE')} className="bg-slate-900 border border-slate-700 hover:border-violet-400 hover:text-violet-400 text-slate-400 py-2 rounded text-[10px] tracking-widest transition-all">
                        [7] GENESIS
                    </button>
                    <button onClick={() => executeWill('GOLD')} className="bg-slate-900 border border-slate-700 hover:border-amber-400 hover:text-amber-400 text-slate-400 py-2 rounded text-[10px] tracking-widest transition-all">
                        [8] MINT GOLD
                    </button>
                </div>
                <button onClick={() => executeWill('RESET')} className="w-full bg-red-950/30 border border-red-900 hover:border-red-500 hover:text-red-500 text-red-900 py-2 rounded text-xs tracking-[0.2em] transition-all font-bold">
                    [99] OMEGA RESET
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
