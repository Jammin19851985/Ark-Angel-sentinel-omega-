
import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { ShieldCheckIcon } from './icons/ShieldCheckIcon';
import GammaScalper from './GammaScalper';
import ActiveGodProtocol from './ActiveGodProtocol';
import ForensicAuditLog from './ForensicAuditLog';
import ChaosFractal from './ChaosFractal';
import SovereignFinancialManifestation from './SovereignFinancialManifestation';
import HardwareController from './HardwareController';
import { TradeMode } from '../types';
import { LivePaperBadge } from './LivePaperBadge';

interface NexusProps { id: string; }

const StatusIndicator: React.FC<{ label: string, value: number, color?: string, animate?: boolean }> = ({ label, value, color = 'bg-cyan-500', animate }) => (
    <div className="space-y-1 group">
        <div className="flex justify-between text-[8px] font-mono text-slate-500 uppercase group-hover:text-cyan-400 transition-colors">
            <span>{label}</span>
            <span className={animate ? 'text-cyan-400 animate-pulse' : 'text-slate-300'}>{(value * 100).toFixed(2)}%</span>
        </div>
        <div className="w-full h-1 bg-black rounded-sm overflow-hidden border border-slate-800 group-hover:border-cyan-500/30 transition-colors">
            <div 
                className={`h-full ${color} transition-all duration-1000 ease-out relative`} 
                style={{ width: `${value * 100}%` }}
            >
                <div className="absolute inset-0 bg-white/20 animate-[shimmer_1s_infinite]"></div>
            </div>
        </div>
    </div>
);

const Nexus: React.FC<NexusProps> = ({ id }) => {
    const { 
        isNexusOnline, setNexusOnline, nexusLogs, addNexusLog, 
        quantumMetrics, inversionLogs, killSwitchActive,
        tradeMode, setTradeMode, coreState, systemStatus,
        primeSuggestions
    } = useAppContext();
    
    const logRef = useRef<HTMLDivElement>(null);
    const [divineFreq, setDivineFreq] = useState(1.01e41);
    const [realityCorrectorActive, setRealityCorrectorActive] = useState(false);

    useEffect(() => {
        if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
    }, [nexusLogs]);

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
        }
    };

    const isLive = coreState.ibkrState.isArmed;
    const { autonomyMetrics } = coreState;

    return (
        <div id={id} className={`flex flex-col h-full w-full overflow-hidden bg-[#030304] relative transition-all duration-700 ${realityCorrectorActive ? 'shadow-[inset_0_0_100px_rgba(0,243,255,0.2)]' : ''}`}>
            
            {/* Header Strip */}
            <div className="relative z-20 flex flex-col lg:flex-row justify-between items-center p-3 border-b border-slate-800 bg-black/80 backdrop-blur-xl gap-4 shrink-0">
                <div className="flex flex-col">
                    <div className="flex items-center gap-3">
                        <h2 className={`text-2xl font-display font-bold tracking-[0.2em] uppercase ${killSwitchActive ? 'text-red-500 animate-pulse' : isLive ? 'text-red-600 glow-text-red' : 'text-cyan-400 glow-text-cyan'}`}>
                            ARK Ω // {killSwitchActive ? 'HALTED' : isLive ? 'LIVE' : 'LIVING'}
                        </h2>
                        <span className="bg-black border border-slate-700 text-slate-300 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest ml-2 shadow-lg">
                            STATUS: <span className="text-amber-400 animate-pulse">{systemStatus}</span>
                        </span>
                    </div>
                    <div className="flex items-center space-x-4 mt-1">
                        <span className={`text-[10px] flex items-center gap-1.5 ${killSwitchActive ? 'text-red-500' : 'text-cyan-400'}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${killSwitchActive ? 'bg-red-500' : 'bg-cyan-400 shadow-[0_0_5px_var(--primary)]'}`}></span>
                            SPINE: {killSwitchActive ? 'LOCKED' : 'HYPER-TEMPORAL'}
                        </span>
                        <span className="text-slate-800">|</span>
                        <span className="text-[10px] text-amber-600 font-bold uppercase tracking-widest">Freq: {divineFreq.toExponential(2)} Hz</span>
                    </div>
                </div>

                <div className="flex items-center space-x-3">
                    <LivePaperBadge />
                    <div className="flex bg-[#050505] border border-slate-800 rounded-sm p-0.5 gap-0.5">
                        {(['MANUAL', 'AUTONOMOUS', 'SOVEREIGN', 'LIVE_IBKR'] as TradeMode[]).map(mode => (
                            <button
                                key={mode}
                                onClick={() => setTradeMode(mode)}
                                className={`px-2 py-1 text-[8px] font-bold rounded-sm transition-all border ${
                                    tradeMode === mode 
                                    ? 'bg-cyan-900/50 border-cyan-500 text-cyan-300 shadow-[0_0_5px_rgba(34,211,238,0.3)]' 
                                    : 'bg-transparent border-transparent text-slate-600 hover:text-cyan-500'
                                }`}
                            >
                                {mode}
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={handleToggleLaunch}
                        className={`px-4 py-1.5 font-bold text-[10px] tracking-[0.2em] border transition-all hover:bg-white/5 ${isNexusOnline ? 'text-red-500 border-red-900 shadow-[0_0_15px_rgba(239,68,68,0.4)]' : 'text-cyan-400 border-cyan-900 shadow-[0_0_15px_rgba(34,211,238,0.4)]'}`}
                    >
                        {isNexusOnline ? 'TERMINATE' : 'GENESIS'}
                    </button>
                </div>
            </div>

            {/* MAIN CONTENT GRID - NOW FORCES HEIGHT TO 100% AND MANAGES INTERNAL SCROLL */}
            <div className="relative flex-1 grid grid-cols-1 xl:grid-cols-4 gap-4 p-4 z-10 min-h-0 overflow-hidden">
                
                {/* COLUMN 1: QUANTUM & AUTONOMY STATE */}
                <div className="xl:col-span-1 flex flex-col space-y-3 min-h-0 overflow-y-auto custom-scrollbar pr-1">
                    <div className="p-3 bg-black/40 border border-slate-800/60 rounded-sm flex flex-col space-y-3 relative hover:border-amber-500/30 transition-colors duration-500">
                        <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-amber-500 opacity-50"></div>
                        <h3 className="text-[10px] font-bold text-amber-500 tracking-widest uppercase border-b border-slate-800 pb-1">Autonomy Core</h3>
                        <StatusIndicator label="Autonomous Health" value={autonomyMetrics.healthScore} color={autonomyMetrics.healthScore > 0.7 ? 'bg-emerald-500' : 'bg-red-500'} />
                        <StatusIndicator label="Hesitation Level" value={autonomyMetrics.hesitationLevel} color="bg-amber-500" />
                        <StatusIndicator label="AI Confidence" value={coreState.confidence} color="bg-violet-500" />
                        <div className="pt-1 border-t border-slate-800 flex justify-between items-center text-[9px] uppercase">
                            <span className="text-slate-600">Mode:</span>
                            <span className={coreState.isAutonomyUnlocked ? 'text-green-400 font-bold' : 'text-red-500 font-bold'}>{coreState.isAutonomyUnlocked ? 'UNLOCKED' : 'REVOKED'}</span>
                        </div>
                    </div>

                    <div className="p-3 bg-black/40 border border-slate-800/60 rounded-sm flex flex-col space-y-3 relative hover:border-cyan-500/30 transition-colors duration-500">
                        <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-cyan-500 opacity-50"></div>
                        <h3 className="text-[10px] font-bold text-cyan-400 tracking-widest uppercase border-b border-slate-800 pb-1">Quantum Tomography</h3>
                        <StatusIndicator label="Majorana Stability" value={quantumMetrics.realityAnchorStability} color="bg-emerald-500" animate={realityCorrectorActive} />
                        <StatusIndicator label="Wave Coherence" value={quantumMetrics.trustScore} color="bg-cyan-400" />
                        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800 text-[8px] font-mono text-slate-500">
                             <div className="flex flex-col"><span className="text-slate-700">COHERENCE</span><span className="text-cyan-400">{quantumMetrics.qubitCoherence.toFixed(1)}ns</span></div>
                             <div className="flex flex-col text-right"><span className="text-slate-700">TES_SCORE</span><span className="text-amber-500">{(quantumMetrics.tesScore * 100).toFixed(1)}%</span></div>
                        </div>
                    </div>
                    
                    {/* Chaos Fractal */}
                    <div className="h-48 shrink-0 relative z-20 overflow-hidden rounded border border-slate-800">
                        <ChaosFractal entropy={quantumMetrics.entropy} />
                    </div>
                </div>

                {/* COLUMN 2-3: SOVEREIGN CORE (CENTER) */}
                <div className="xl:col-span-2 flex flex-col space-y-4 min-h-0 overflow-hidden">
                    <div className="flex-1 flex flex-col items-center justify-center relative min-h-0 border border-slate-800/30 bg-black/40 rounded-sm overflow-hidden group">
                        {/* 100 SUGGESTIONS GRID (Background Glow) */}
                        {primeSuggestions.length > 0 && (
                            <div className="absolute inset-0 grid grid-cols-10 grid-rows-10 gap-px opacity-10 pointer-events-none p-4 group-hover:opacity-15 transition-opacity">
                                {primeSuggestions.map(ps => (
                                    <div key={ps.id} className={`w-full h-full ${ps.status === 'ACTIVE' ? 'bg-cyan-500/20 shadow-[0_0_10px_cyan]' : 'bg-transparent border border-white/5'}`} />
                                ))}
                            </div>
                        )}

                        {/* Reality Anchor Visualizer */}
                        <div className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-1000 ${isNexusOnline ? 'opacity-30' : 'opacity-5'}`}>
                            <div className="w-[300px] h-[300px] border border-cyan-500/10 rounded-full animate-spin-slow border-dashed"></div>
                            <div className="absolute w-[200px] h-[200px] border border-amber-500/10 rounded-full animate-spin border-dotted" style={{animationDirection: 'reverse'}}></div>
                        </div>

                        <div className={`relative z-10 w-full flex flex-col items-center justify-center flex-1 transition-all duration-1000 ${isNexusOnline ? 'opacity-100 scale-100' : 'opacity-20 grayscale scale-90'}`}>
                             <div className="flex flex-col items-center mb-4 cursor-pointer hover:scale-105 transition-transform duration-500">
                                <span className={`text-8xl md:text-9xl font-display font-bold tracking-tighter ${killSwitchActive ? 'text-red-500' : isLive ? 'text-red-600' : 'text-white'} glow-text-cyan drop-shadow-[0_0_30px_rgba(0,243,255,0.4)]`}>Ω</span>
                                <span className="text-[10px] font-mono text-cyan-400 tracking-[0.8em] mt-2 ml-[0.8em] uppercase">Absolute Manifestation</span>
                            </div>
                            
                            {/* GOD PROTOCOL - 3D Tablet */}
                            <div className="w-full max-w-xl px-4 h-64 md:h-72 perspective-1000">
                                <ActiveGodProtocol />
                            </div>
                        </div>
                    </div>
                </div>

                {/* COLUMN 4: FINANCIAL & AUDIT - SCROLLABLE COLUMN */}
                <div className="xl:col-span-1 flex flex-col space-y-3 min-h-0 overflow-y-auto custom-scrollbar pr-1">
                    <HardwareController />
                    <SovereignFinancialManifestation />
                    <div className="flex-shrink-0 bg-black/60 border border-slate-800 rounded-sm p-3 overflow-hidden font-mono text-[9px] text-slate-500 flex flex-col relative h-[150px] hover:border-cyan-900 transition-colors">
                        <div className="text-cyan-400 mb-2 font-bold tracking-widest border-b border-cyan-900/30 pb-1 uppercase flex justify-between">
                            <span>UPB-1_IMMUTABLE</span>
                            <span>v204.0</span>
                        </div>
                        <div ref={logRef} className="space-y-1 overflow-y-auto h-full pr-1 custom-scrollbar">
                            {nexusLogs.map((log, i) => (
                                <div key={i} className={`border-l pl-2 py-0.5 transition-colors border-cyan-900/30 leading-relaxed ${log.includes('SOVEREIGN') ? 'text-amber-300 border-amber-500/50 bg-amber-900/10' : 'text-slate-500 hover:text-slate-300'}`}>
                                    {log}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="h-32 shrink-0"><ForensicAuditLog logs={inversionLogs} /></div>
                    <div className="shrink-0"><GammaScalper /></div>
                </div>
            </div>
        </div>
    );
};

export default Nexus;
