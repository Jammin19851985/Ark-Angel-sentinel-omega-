import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { ShieldCheckIcon } from './icons/ShieldCheckIcon';
import GammaScalper from './GammaScalper';
import ActiveGodProtocol from './ActiveGodProtocol';
import ForensicAuditLog from './ForensicAuditLog';
import ProjectValhalla from './ProjectValhalla';
import ChaosFractal from './ChaosFractal';
import { TradeMode } from '../types';

interface NexusProps { id: string; }

const StatusIndicator: React.FC<{ label: string, value: number, color?: string }> = ({ label, value, color = 'bg-cyan-500' }) => (
    <div className="space-y-1">
        <div className="flex justify-between text-[8px] font-mono text-slate-500 uppercase">
            <span>{label}</span>
            <span className="text-slate-300">{(value * 100).toFixed(2)}%</span>
        </div>
        <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden border border-white/5">
            <div 
                className={`h-full ${color} transition-all duration-1000 ease-out`} 
                style={{ width: `${value * 100}%`, boxShadow: `0 0 5px ${color.replace('bg-', 'rgba(')}` }}
            ></div>
        </div>
    </div>
);

const Nexus: React.FC<NexusProps> = ({ id }) => {
    const { 
        isNexusOnline, setNexusOnline, nexusLogs, addNexusLog, 
        quantumMetrics, heartbeat, killSwitchActive, triggerKillSwitch,
        tradeMode, setTradeMode, primeSuggestions, coreState, signDevice,
        kpis
    } = useAppContext();
    const logRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
    }, [nexusLogs]);

    const handleToggleLaunch = () => {
        if (isNexusOnline) {
            setNexusOnline(false);
            addNexusLog(">> COLLAPSING CORE... MANIFOLD TERMINATED.");
        } else {
            setNexusOnline(true);
            addNexusLog(">> ARCHANGEL OMEGA CORE GENESIS INITIALIZED.");
            addNexusLog(">> DETERMINISTIC SPINE PULSE: CONNECTED.");
            addNexusLog(">> MONOTONIC CLOCK SYNCED: " + coreState.monotonicTime + "µs");
        }
    };

    const quorumPercentage = Math.min(1, coreState.hardwareSignedDevices.length / coreState.hardwareQuorumRequired);

    return (
        <div id={id} className={`relative h-full w-full overflow-hidden rounded-lg border glow-border flex flex-col font-mono transition-colors duration-500 ${killSwitchActive ? 'bg-red-950/20 border-red-500 shadow-[inset_0_0_100px_rgba(239,68,68,0.2)]' : 'bg-black/80 border-slate-800'}`}>
            {/* Absolute Manifestation Background */}
            <div className="absolute inset-0 z-0 bg-[#050505]">
                <div className={`absolute inset-0 opacity-10 ${killSwitchActive ? 'bg-[radial-gradient(var(--red-500)_1px,transparent_1px)]' : 'bg-[radial-gradient(var(--neon-cyan)_0.5px,transparent_0.5px)]'}`} style={{ backgroundSize: '24px 24px' }}></div>
            </div>

            <div className="relative z-20 flex justify-between items-center p-4 border-b border-white/10 bg-black/40 backdrop-blur-md">
                <div className="flex flex-col">
                    <h2 className={`text-xl font-display font-bold tracking-[0.3em] uppercase ${killSwitchActive ? 'text-red-500 animate-pulse' : 'text-amber-500 glow-text-amber'}`}>
                        AODE // {killSwitchActive ? 'SYSTEM_LOCKED' : 'CORE_MANIFEST'}
                    </h2>
                    <div className="flex items-center space-x-3">
                        <span className={`text-[9px] flex items-center gap-1.5 ${killSwitchActive ? 'text-red-500' : 'text-cyan-400'}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${killSwitchActive ? 'bg-red-500 animate-ping' : 'bg-cyan-400 shadow-[0_0_8px_#00f3ff]'}`}></span>
                            SPINE: {killSwitchActive ? 'FAIL_CLOSED' : 'DETERMINISTIC'}
                        </span>
                        <span className="text-slate-700">|</span>
                        <span className="text-[9px] text-amber-600 uppercase tracking-widest">CLOCK: {coreState.monotonicTime.toLocaleString()} µs</span>
                    </div>
                </div>

                <div className="flex items-center space-x-4">
                    <div className="flex bg-black/60 border border-slate-700 rounded p-1">
                        {(['MANUAL', 'AUTONOMOUS', 'SOVEREIGN', 'AODE_QUANTUM'] as TradeMode[]).map(mode => (
                            <button
                                key={mode}
                                onClick={() => setTradeMode(mode)}
                                className={`px-2 py-1 text-[9px] font-mono rounded transition-all ${tradeMode === mode ? 'bg-amber-500 text-black font-bold' : 'text-slate-500 hover:text-slate-300'}`}
                            >
                                {mode === 'AODE_QUANTUM' ? 'Ω_QUANTUM' : mode}
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={handleToggleLaunch}
                        className={`px-8 py-2 border font-bold text-xs tracking-[0.4em] uppercase transition-all duration-500 ${
                            isNexusOnline ? 'border-amber-600 text-amber-500 bg-amber-950/20' : 'border-neon-cyan text-neon-cyan bg-cyan-950/20 shadow-[0_0_30px_rgba(0,243,255,0.2)] hover:scale-105'
                        }`}
                    >
                        {isNexusOnline ? 'COLLAPSE' : 'ENGAGE OMEGA'}
                    </button>
                </div>
            </div>

            <div className="relative flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4 p-4 z-10 overflow-y-auto">
                {/* COLUMN 1: INTEL & SYSTEM HEALTH */}
                <div className="lg:col-span-1 flex flex-col space-y-4">
                    <div className="p-4 bg-black/70 border border-slate-800 rounded-lg flex flex-col space-y-4 shadow-2xl">
                        <h3 className="text-[10px] font-bold text-amber-500 tracking-[0.2em] border-b border-white/5 pb-2 uppercase">Execution Spine Gating</h3>
                        
                        <div className="space-y-3">
                            <div>
                                <StatusIndicator label="Hardware Quorum" value={quorumPercentage} color={quorumPercentage >= 1 ? 'bg-emerald-500' : 'bg-amber-500'} />
                                <div className="flex gap-1 mt-2">
                                    <button onClick={() => signDevice('HW1')} className={`flex-1 text-[8px] border p-1 rounded font-bold ${coreState.hardwareSignedDevices.includes('HW1') ? 'border-emerald-500 text-emerald-400 bg-emerald-950/20' : 'border-slate-700 text-slate-500'}`}>SIGN HW1</button>
                                    <button onClick={() => signDevice('HW2')} className={`flex-1 text-[8px] border p-1 rounded font-bold ${coreState.hardwareSignedDevices.includes('HW2') ? 'border-emerald-500 text-emerald-400 bg-emerald-950/20' : 'border-slate-700 text-slate-500'}`}>SIGN HW2</button>
                                </div>
                            </div>
                            
                            <StatusIndicator label="Survival Margin" value={Math.max(0, 1 - (kpis.maxDrawdown / 100) / coreState.survivalDrawdownLimit)} color="bg-cyan-500" />
                            <StatusIndicator label="Structural Alpha" value={quantumMetrics.trustScore} color="bg-violet-500" />
                            <StatusIndicator label="Tactical Evasion (TES)" value={quantumMetrics.tesScore} color="bg-rose-500" />
                        </div>
                        
                        <div className="grid grid-cols-1 gap-1.5 pt-2 border-t border-white/5 text-[9px]">
                             <div className="flex justify-between text-slate-500">
                                <span>FSF (FUZZINESS):</span>
                                <span className={quantumMetrics.fsfMetric > 0.0000001 ? 'text-red-400 animate-pulse' : 'text-emerald-400'}>{quantumMetrics.fsfMetric.toFixed(9)}</span>
                            </div>
                             <div className="flex justify-between text-slate-500">
                                <span>COHERENCE:</span>
                                <span className="text-cyan-400">{quantumMetrics.qubitCoherence.toFixed(1)}ns</span>
                            </div>
                             <div className="flex justify-between text-slate-500">
                                <span>QUBO ENERGY:</span>
                                <span className="text-violet-400">{quantumMetrics.quboEnergy} eV</span>
                            </div>
                        </div>
                    </div>
                    
                    <ChaosFractal entropy={quantumMetrics.entropy} />
                    <GammaScalper />
                </div>

                {/* COLUMN 2-3: THE CORE VISUALIZER & COMMAND */}
                <div className="lg:col-span-2 flex flex-col space-y-4 relative min-h-[400px]">
                    <div className="flex-1 flex flex-col items-center justify-center relative">
                        <div className={`hologram-circle w-80 h-80 flex items-center justify-center transition-all duration-1000 ${isNexusOnline ? 'opacity-100 scale-105' : 'opacity-20 grayscale scale-90'}`}>
                            <div className={`text-8xl font-display font-bold tracking-tighter flex flex-col items-center ${killSwitchActive ? 'text-red-500 drop-shadow-[0_0_20px_rgba(239,68,68,0.8)]' : 'text-white glow-text-amber'}`}>
                                <span>{killSwitchActive ? '!' : 'Ω'}</span>
                                <span className="text-[12px] font-mono text-amber-500 tracking-[0.8em] mt-4">AODE CORE</span>
                            </div>
                        </div>
                        <div className="mt-12 w-full max-w-md">
                            <ActiveGodProtocol />
                        </div>
                    </div>
                </div>

                {/* COLUMN 4: FORENSICS & EXIT BRIDGES */}
                <div className="lg:col-span-1 flex flex-col space-y-4">
                    <ProjectValhalla />
                    <div className="flex-1 bg-black/40 border border-slate-800 rounded p-4 overflow-hidden text-[9px] flex flex-col shadow-inner">
                        <div className="text-amber-500 mb-3 font-bold tracking-widest border-b border-amber-500/20 pb-2 uppercase flex justify-between">
                            <span>SPINE_HEARTBEAT_FEED</span>
                            <span className={killSwitchActive ? 'text-red-500 animate-pulse' : 'text-green-500'}>{killSwitchActive ? 'HALTED' : 'LIVE'}</span>
                        </div>
                        <div ref={logRef} className="space-y-2 overflow-y-auto h-full pr-1 font-mono leading-relaxed">
                            {nexusLogs.map((log, i) => (
                                <div key={i} className={`border-l-2 border-amber-500/30 pl-3 py-1 text-slate-400`}>
                                    <span className="opacity-40">[{new Date().toLocaleTimeString()}] </span>
                                    {log}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Nexus;
