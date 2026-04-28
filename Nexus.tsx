
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
        quantumMetrics, inversionLogs, heartbeat, killSwitchActive,
        tradeMode, setTradeMode, primeSuggestions
    } = useAppContext();
    const logRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
    }, [nexusLogs]);

    useEffect(() => {
        const interval = setInterval(() => heartbeat(), 1000);
        return () => clearInterval(interval);
    }, [heartbeat]);

    const handleToggleLaunch = () => {
        if (isNexusOnline) {
            setNexusOnline(false);
            addNexusLog(">> COLLAPSING MANIFOLD... SPINE SHUTDOWN.");
        } else {
            setNexusOnline(true);
            addNexusLog(">> ARCHANGEL OMEGA v100.0 [CORE SPINE] INITIALIZED.");
            addNexusLog(">> AGENT JULES (ARK) SOVEREIGN OVERRIDE ENGAGED.");
            addNexusLog(">> ATMOSPHERIC NOISE RNG SEED ACQUIRED.");
            addNexusLog(">> SATELLITE UPLINK: REDUNDANT LINK 03 ESTABLISHED.");
            addNexusLog(">> DNA-BASED ARCHIVING: SYNCED.");
            addNexusLog(">> STATUS: THE ABSOLUTE MANIFESTATION.");
        }
    };

    return (
        <div id={id} className="relative h-full w-full overflow-hidden bg-black/80 rounded-lg border border-slate-800 glow-border flex flex-col">
            <div className="absolute inset-0 z-0 bg-[#050505]">
                <div className="absolute inset-0 opacity-20 animate-pulse-slow" 
                     style={{ background: 'radial-gradient(circle at 50% 50%, #bc13fe 0%, transparent 70%)' }}>
                </div>
            </div>

            <div className="relative z-20 flex justify-between items-center p-4 border-b border-white/10 bg-black/40 backdrop-blur-md">
                <div className="flex flex-col">
                    <h2 className="text-xl font-display font-bold tracking-[0.2em] text-neon-cyan glow-text-cyan uppercase">ARK Ω // Sovereign Nexus</h2>
                    <div className="flex items-center space-x-3">
                        <span className={`text-[10px] font-mono flex items-center gap-1.5 ${killSwitchActive ? 'text-red-500 animate-pulse' : 'text-neon-purple'}`}>
                            <span className={`w-2 h-2 rounded-full ${killSwitchActive ? 'bg-red-500' : 'bg-neon-purple shadow-[0_0_8px_rgba(188,19,254,0.8)]'}`}></span>
                            HEARTBEAT: {killSwitchActive ? 'TIMED OUT' : 'NOMINAL'}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">|</span>
                        <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">AODE CORE: ACTIVE</span>
                    </div>
                </div>

                <div className="flex items-center space-x-4">
                    <div className="flex bg-black/60 border border-slate-700 rounded p-1">
                        {(['MANUAL', 'AUTONOMOUS', 'SOVEREIGN'] as TradeMode[]).map(mode => (
                            <button
                                key={mode}
                                onClick={() => setTradeMode(mode)}
                                className={`px-2 py-1 text-[9px] font-mono rounded transition-all ${tradeMode === mode ? 'bg-amber-500 text-black font-bold' : 'text-slate-500 hover:text-slate-300'}`}
                            >
                                {mode}
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={handleToggleLaunch}
                        className={`px-6 py-2 border font-mono text-xs tracking-widest uppercase transition-all duration-300 ${
                            isNexusOnline ? 'border-red-500 text-red-400 bg-red-950/20' : 'border-neon-cyan text-neon-cyan bg-cyan-950/20 shadow-[0_0_15px_rgba(0,243,255,0.3)] hover:scale-105'
                        }`}
                    >
                        {isNexusOnline ? 'COLLAPSE CORE' : 'ETERNAL LAUNCH'}
                    </button>
                </div>
            </div>

            <div className="relative flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4 p-4 z-10 overflow-y-auto">
                {/* COLUMN 1: INTEL & SYSTEM HEALTH */}
                <div className="lg:col-span-1 flex flex-col space-y-4">
                    <div className="p-4 bg-black/70 backdrop-blur-md border border-slate-800 rounded-lg shadow-xl flex flex-col space-y-4">
                        <h3 className="text-xs font-bold text-neon-purple font-mono tracking-widest pb-1 border-b border-white/10 uppercase">Sovereign Health</h3>
                        
                        <StatusIndicator label="DNA Archive Integrity" value={quantumMetrics.dnaIntegrity} color="bg-emerald-500" />
                        <StatusIndicator label="Satellite Link Redundancy" value={quantumMetrics.satelliteLink} color="bg-cyan-400" />
                        <StatusIndicator label="Atmospheric RNG Noise" value={quantumMetrics.atmosphericNoise} color="bg-amber-500" />
                        
                        <div className="grid grid-cols-1 gap-2 pt-2 border-t border-white/5">
                             <div className="flex justify-between text-[10px] font-mono text-slate-500">
                                <span>COHERENCE:</span>
                                <span className="text-neon-cyan">{quantumMetrics.qubitCoherence.toFixed(1)}ns</span>
                            </div>
                             <div className="flex justify-between text-[10px] font-mono text-slate-500">
                                <span>REGIME:</span>
                                <span className="text-amber-500 font-bold">{quantumMetrics.regime}</span>
                            </div>
                            <div className="flex justify-between text-[10px] font-mono text-slate-500">
                                <span>JULES MOOD:</span>
                                <span className="text-neon-purple">STOIC</span>
                            </div>
                        </div>
                    </div>
                    <ChaosFractal entropy={quantumMetrics.entropy} />
                    <GammaScalper />
                </div>

                {/* COLUMN 2-3: THE CORE VISUALIZER & COMMAND */}
                <div className="lg:col-span-2 flex flex-col space-y-4 relative min-h-[400px]">
                    <div className="flex-1 flex flex-col items-center justify-center relative">
                        {/* 100 SUGGESTIONS GRID (Background Glow) */}
                        {primeSuggestions.length > 0 && (
                            <div className="absolute inset-0 grid grid-cols-10 grid-rows-10 gap-1 opacity-20 pointer-events-none p-4">
                                {primeSuggestions.map(ps => (
                                    <div 
                                        key={ps.id} 
                                        className={`w-full h-full border ${ps.status === 'ACTIVE' ? 'bg-cyan-400/30 border-cyan-400/50 shadow-[0_0_10px_rgba(0,243,255,0.2)]' : 'bg-transparent border-slate-900'}`}
                                    />
                                ))}
                            </div>
                        )}

                        <div className={`hologram-circle w-72 h-72 flex items-center justify-center transition-all duration-1000 ${isNexusOnline ? 'opacity-100 scale-100' : 'opacity-20 grayscale scale-90'}`}>
                            <div className="text-7xl font-display font-bold text-white tracking-tighter glow-text-cyan flex flex-col items-center">
                                <span>Ω</span>
                                <span className="text-[10px] font-mono text-slate-500 tracking-[0.5em] mt-2">v100.0</span>
                            </div>
                        </div>
                        
                        <div className="mt-8 w-full max-w-md">
                            <ActiveGodProtocol />
                        </div>
                    </div>
                </div>

                {/* COLUMN 4: FORENSICS & EXIT BRIDGES */}
                <div className="lg:col-span-1 flex flex-col space-y-4">
                    <ProjectValhalla />
                    <div className="h-64"><ForensicAuditLog logs={inversionLogs} /></div>
                    <div className="flex-1 bg-black/40 border border-slate-800 rounded p-3 overflow-hidden font-mono text-[9px] text-slate-500 flex flex-col">
                        <div className="text-neon-cyan mb-2 font-bold tracking-widest border-b border-neon-cyan/20 pb-1 uppercase flex justify-between">
                            <span>XEDO_IMMUTABLE_FEED</span>
                            <span className="animate-pulse">● LIVE</span>
                        </div>
                        <div ref={logRef} className="space-y-1.5 overflow-y-auto h-full pr-1">
                            {nexusLogs.map((log, i) => (
                                <div key={i} className={`border-l pl-2 py-0.5 hover:bg-white/5 transition-colors ${log.includes('SOVEREIGN') || log.includes('VALHALLA') ? 'border-amber-500 text-amber-200' : 'border-neon-purple/50'}`}>
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
