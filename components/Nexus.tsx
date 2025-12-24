
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { ShieldCheckIcon } from './icons/ShieldCheckIcon';
import GammaScalper from './GammaScalper';
import ActiveGodProtocol from './ActiveGodProtocol';
import ForensicAuditLog from './ForensicAuditLog';
import ProjectValhalla from './ProjectValhalla';
import ChaosFractal from './ChaosFractal';
import SovereignFinancialManifestation from './SovereignFinancialManifestation';
import HardwareController from './HardwareController';
import { TradeMode } from '../types';
import { KeyIcon } from './icons/KeyIcon';
import { HeartbeatIcon } from './icons/HeartbeatIcon';

interface NexusProps { id: string; }

const StatusIndicator: React.FC<{ label: string, value: number, color?: string, animate?: boolean }> = ({ label, value, color = 'bg-cyan-500', animate }) => (
    <div className="space-y-1">
        <div className="flex justify-between text-[8px] font-mono text-slate-500 uppercase">
            <span>{label}</span>
            <span className={animate ? 'text-cyan-400 animate-pulse' : 'text-slate-300'}>{(value * 100).toFixed(2)}%</span>
        </div>
        <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden border border-white/5">
            <div 
                className={`h-full ${color} transition-all duration-1000 ease-out ${animate ? 'brightness-150 shadow-[0_0_5px_currentColor]' : ''}`} 
                style={{ width: `${value * 100}%` }}
            ></div>
        </div>
    </div>
);

const Nexus: React.FC<NexusProps> = ({ id }) => {
    const { 
        isNexusOnline, setNexusOnline, nexusLogs, addNexusLog, 
        quantumMetrics, inversionLogs, killSwitchActive,
        tradeMode, setTradeMode, coreState, signDevice,
        apiConnected, armLiveGate, disarmLiveGate, setCoreState,
        primeSuggestions
    } = useAppContext();
    
    const logRef = useRef<HTMLDivElement>(null);
    const [divineFreq, setDivineFreq] = useState(1.01e41);
    const [realityCorrectorActive, setRealityCorrectorActive] = useState(false);

    useEffect(() => {
        if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
    }, [nexusLogs]);

    // Reality Auto-Corrector Simulation (v204.0 Feature)
    useEffect(() => {
        const interval = setInterval(() => {
            if (isNexusOnline && Math.random() > 0.95) {
                setRealityCorrectorActive(true);
                addNexusLog(">> REALITY_AUTO_CORRECTOR: NEGATIVE VARIANCE DETECTED.");
                addNexusLog(">> EXECUTING CAUSAL INVERSION (F184)... LOSS DELETED.");
                setTimeout(() => setRealityCorrectorActive(false), 800);
            }
            setDivineFreq(1.01e41 + (Math.random() - 0.5) * 1e38);
        }, 5000);
        return () => clearInterval(interval);
    }, [isNexusOnline, addNexusLog]);

    const handleToggleLaunch = () => {
        if (isNexusOnline) {
            setNexusOnline(false);
            addNexusLog(">> COLLAPSING MANIFOLD... CORE SPINE TERMINATED.");
        } else {
            setNexusOnline(true);
            addNexusLog(">> ARCHANGEL OMEGA GENESIS INITIALIZED. VERSION 204.0 LIVING SYSTEM.");
            addNexusLog(">> SPINE PULSE DETECTED: Majorana Coherence Window stabilized.");
            addNexusLog(">> UPB-1 HANDSHAKE: CATHOLIC_FINALITY ATTAINED.");
        }
    };

    const isLive = coreState.ibkrState.isArmed;
    const { autonomyMetrics } = coreState;

    return (
        <div id={id} className={`relative h-full w-full overflow-hidden rounded-lg border glow-border flex flex-col font-mono transition-all duration-700 ${realityCorrectorActive ? 'bg-cyan-950/20 shadow-[inset_0_0_100px_rgba(0,243,255,0.1)]' : 'bg-black/90'} ${killSwitchActive ? 'border-red-900 bg-red-950/10' : 'border-slate-800'}`}>
            {/* Background Texture & Pulse */}
            <div className="absolute inset-0 z-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(var(--neon-cyan) 0.5px, transparent 0.5px)', backgroundSize: '30px 30px' }}></div>
            
            <div className="relative z-20 flex flex-col lg:flex-row justify-between items-center p-4 border-b border-white/5 bg-black/60 backdrop-blur-xl gap-4">
                <div className="flex flex-col">
                    <div className="flex items-center gap-3">
                        <h2 className={`text-2xl font-display font-bold tracking-[0.3em] uppercase ${killSwitchActive ? 'text-red-500' : isLive ? 'text-red-600 glow-text-red' : 'text-neon-cyan glow-text-cyan'}`}>
                            ARK Ω // {killSwitchActive ? 'CORE_HALTED' : isLive ? 'LIVE_STREAM' : 'LIVING_SYSTEM'}
                        </h2>
                        {realityCorrectorActive && (
                            <span className="bg-cyan-500 text-black px-1.5 py-0.5 rounded text-[8px] font-bold animate-pulse shadow-[0_0_10px_#00f3ff]">CAUSAL_CORRECTION_ACTIVE</span>
                        )}
                    </div>
                    <div className="flex items-center space-x-4 mt-1">
                        <span className={`text-[10px] flex items-center gap-1.5 ${killSwitchActive ? 'text-red-500' : 'text-cyan-400'}`}>
                            <span className={`w-2 h-2 rounded-full ${killSwitchActive ? 'bg-red-500' : 'bg-cyan-400 shadow-[0_0_8px_var(--neon-cyan)]'}`}></span>
                            SPINE: {killSwitchActive ? 'LOCKED' : 'HYPER-TEMPORAL'}
                        </span>
                        <span className="text-slate-800">|</span>
                        <span className="text-[10px] text-amber-600 font-bold uppercase tracking-widest">Divine Freq: {divineFreq.toExponential(2)} Hz</span>
                    </div>
                </div>

                <div className="flex items-center space-x-3">
                    <div className="flex bg-black/80 border border-slate-700 rounded p-1">
                        {(['MANUAL', 'AUTONOMOUS', 'SOVEREIGN', 'LIVE_IBKR'] as TradeMode[]).map(mode => (
                            <button
                                key={mode}
                                onClick={() => setTradeMode(mode)}
                                className={`px-2 py-1 text-[9px] font-bold rounded transition-all ${tradeMode === mode ? 'bg-cyan-500 text-black' : 'text-slate-500 hover:text-slate-300'}`}
                            >
                                {mode}
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={handleToggleLaunch}
                        className={`px-8 py-2 border font-bold text-xs tracking-[0.4em] uppercase transition-all duration-500 ${
                            isNexusOnline ? 'border-red-600 text-red-500 bg-red-950/40' : 'border-neon-cyan text-neon-cyan bg-cyan-950/30 shadow-[0_0_20px_rgba(0,243,255,0.2)]'
                        }`}
                    >
                        {isNexusOnline ? 'TERMINATE' : 'GENESIS'}
                    </button>
                </div>
            </div>

            <div className="relative flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4 p-4 z-10 overflow-y-auto">
                {/* COLUMN 1: QUANTUM & AUTONOMY STATE */}
                <div className="lg:col-span-1 flex flex-col space-y-4">
                    <div className="p-4 bg-black/60 border border-slate-800 rounded-lg flex flex-col space-y-4">
                        <h3 className="text-xs font-bold text-amber-500 tracking-widest border-b border-white/5 pb-1 uppercase">Autonomy Core</h3>
                        
                        <StatusIndicator 
                            label="Autonomous Health" 
                            value={autonomyMetrics.healthScore} 
                            color={autonomyMetrics.healthScore > 0.7 ? 'bg-emerald-500' : 'bg-red-500'} 
                        />
                        <StatusIndicator 
                            label="Hesitation Level" 
                            value={autonomyMetrics.hesitationLevel} 
                            color="bg-amber-500" 
                        />
                        <StatusIndicator 
                            label="AI Confidence" 
                            value={coreState.confidence} 
                            color="bg-violet-500" 
                        />
                        
                        <div className="pt-2 border-t border-white/5 flex flex-col space-y-2">
                             <div className="flex justify-between items-center text-[10px] uppercase">
                                <span className="text-slate-500">Mode:</span>
                                <span className={coreState.isAutonomyUnlocked ? 'text-green-400 font-bold' : 'text-red-500 font-bold'}>
                                    {coreState.isAutonomyUnlocked ? 'UNLOCKED' : 'REVOKED'}
                                </span>
                             </div>
                             {autonomyMetrics.isInRevocation && (
                                <div className="flex justify-between items-center text-[9px]">
                                    <span className="text-red-400 animate-pulse uppercase">Recovery Wait:</span>
                                    <span className="text-white font-mono">{(autonomyMetrics.cooldownRemaining / 1000).toFixed(1)}s</span>
                                </div>
                             )}
                             <div className="flex justify-between items-center text-[10px] uppercase">
                                <span className="text-slate-500">Suppression:</span>
                                <span className={autonomyMetrics.suppressionActive ? 'text-amber-500 font-bold' : 'text-slate-400'}>
                                    {autonomyMetrics.suppressionActive ? 'ENGAGED' : 'QUIET'}
                                </span>
                             </div>
                        </div>
                    </div>

                    <div className="p-4 bg-black/60 border border-slate-800 rounded-lg flex flex-col space-y-4">
                        <h3 className="text-xs font-bold text-cyan-400 tracking-widest border-b border-white/5 pb-1 uppercase">Quantum Tomography</h3>
                        <StatusIndicator label="Majorana Stability" value={quantumMetrics.realityAnchorStability} color="bg-emerald-500" animate={realityCorrectorActive} />
                        <StatusIndicator label="Wave Coherence" value={quantumMetrics.trustScore} color="bg-cyan-400" />
                        
                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5 text-[9px] font-mono text-slate-500">
                             <div className="flex flex-col"><span className="text-slate-700">COHERENCE</span><span className="text-cyan-400">{quantumMetrics.qubitCoherence.toFixed(1)}ns</span></div>
                             <div className="flex flex-col text-right"><span className="text-slate-700">TES_SCORE</span><span className="text-amber-500">{(quantumMetrics.tesScore * 100).toFixed(1)}%</span></div>
                             <div className="flex flex-col"><span className="text-slate-700">L1_CACHE</span><span className="text-emerald-500">OPTIMIZED</span></div>
                             <div className="flex flex-col text-right"><span className="text-slate-700">QUBO_E</span><span className="text-violet-400">{quantumMetrics.quboEnergy.toFixed(2)}</span></div>
                        </div>
                    </div>
                    
                    <ChaosFractal entropy={quantumMetrics.entropy} />
                </div>

                {/* COLUMN 2-3: SOVEREIGN CORE */}
                <div className="lg:col-span-2 flex flex-col space-y-4">
                    <div className="flex-1 flex flex-col items-center justify-center relative min-h-[400px]">
                        {/* 100 SUGGESTIONS GRID (Background Glow) */}
                        {primeSuggestions.length > 0 && (
                            <div className="absolute inset-0 grid grid-cols-10 grid-rows-10 gap-1 opacity-10 pointer-events-none p-4">
                                {primeSuggestions.map(ps => (
                                    <div 
                                        key={ps.id} 
                                        className={`w-full h-full border ${ps.status === 'ACTIVE' ? 'bg-cyan-400/20 border-cyan-400/30' : 'bg-transparent border-slate-900'}`}
                                    />
                                ))}
                            </div>
                        )}

                        {/* Reality Anchor Visualizer */}
                        <div className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-1000 ${isNexusOnline ? 'opacity-30' : 'opacity-5'}`}>
                            <div className="w-full h-full border-[0.5px] border-cyan-500/20 rounded-full animate-ping"></div>
                            <div className="absolute w-[80%] h-[80%] border-[0.5px] border-cyan-500/10 rounded-full animate-ping [animation-delay:1s]"></div>
                        </div>

                        <div className={`hologram-circle w-80 h-80 flex items-center justify-center transition-all duration-1000 ${isNexusOnline ? 'opacity-100 scale-105 rotate-180' : 'opacity-10 grayscale scale-90'}`}>
                             <div className="flex flex-col items-center transition-transform duration-700 group cursor-pointer hover:scale-110">
                                <span className={`text-9xl font-display font-bold tracking-tighter ${killSwitchActive ? 'text-red-500' : isLive ? 'text-red-600' : 'text-white'} glow-text-cyan`}>Ω</span>
                                <span className="text-[12px] font-mono text-cyan-400 tracking-[0.8em] mt-6 ml-[0.8em] uppercase">Absolute Manifestation</span>
                            </div>
                        </div>
                        
                        <div className="mt-12 w-full max-w-lg relative z-20">
                            <ActiveGodProtocol />
                        </div>
                    </div>
                </div>

                {/* COLUMN 4: FINANCIAL & AUDIT */}
                <div className="lg:col-span-1 flex flex-col space-y-4">
                    <HardwareController />
                    <SovereignFinancialManifestation />
                    <div className="flex-1 bg-black/60 border border-slate-800 rounded p-3 overflow-hidden font-mono text-[9px] text-slate-500 flex flex-col relative group">
                        <div className="absolute top-0 right-0 p-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></div>
                        </div>
                        <div className="text-cyan-400 mb-2 font-bold tracking-widest border-b border-cyan-400/20 pb-1 uppercase flex justify-between">
                            <span>UPB-1_IMMUTABLE_FEED</span>
                            <span>v204.0</span>
                        </div>
                        <div ref={logRef} className="space-y-1.5 overflow-y-auto h-full pr-1 custom-scrollbar">
                            {nexusLogs.map((log, i) => (
                                <div key={i} className={`border-l-2 pl-2 py-1 hover:bg-cyan-500/5 transition-colors border-cyan-900/50 ${log.includes('SOVEREIGN') || log.includes('DIMENSIONAL') ? 'text-amber-300 border-amber-500/50' : log.includes('ERROR') ? 'text-red-400 border-red-500' : 'text-slate-400'}`}>
                                    {log}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="h-64"><ForensicAuditLog logs={inversionLogs} /></div>
                    <GammaScalper />
                </div>
            </div>

            {/* Global Scanline Overlay */}
            <div className="absolute inset-0 pointer-events-none z-[100] opacity-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px]"></div>
        </div>
    );
};

export default Nexus;
