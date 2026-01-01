
import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../contexts/AppContext';
import GammaScalper from './GammaScalper';
import ActiveGodProtocol from './ActiveGodProtocol';
import ForensicAuditLog from './ForensicAuditLog';
import ChaosFractal from './ChaosFractal';
import SovereignFinancialManifestation from './SovereignFinancialManifestation';
import HardwareController from './HardwareController';
import { TradeMode } from '../types';

interface NexusProps { id: string; }

const StatusIndicator: React.FC<{ label: string, value: number, color?: string, animate?: boolean }> = ({ label, value, color = 'bg-cyan-500', animate }) => (
    <div className="space-y-1">
        <div className="flex justify-between text-[8px] font-mono text-slate-500 uppercase">
            <span>{label}</span>
            <span className={animate ? 'text-cyan-400 animate-pulse' : 'text-slate-300'}>{(value * 100).toFixed(2)}%</span>
        </div>
        <div className="w-full h-1.5 bg-black rounded-sm overflow-hidden border border-slate-800 shadow-inner">
            <div 
                className={`h-full ${color} transition-all duration-1000 ease-out relative overflow-hidden`} 
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

    // Reality Auto-Corrector Simulation
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
        <div id={id} className={`relative h-full w-full overflow-hidden rounded-lg cyber-chip flex flex-col font-mono transition-all duration-700 ${realityCorrectorActive ? 'shadow-[inset_0_0_100px_rgba(0,243,255,0.2)]' : ''}`}>
            
            {/* Header Strip */}
            <div className="relative z-20 flex flex-col lg:flex-row justify-between items-center p-4 border-b border-slate-800 bg-black/80 backdrop-blur-xl gap-4 cyber-chip-screws">
                <div className="flex flex-col">
                    <div className="flex items-center gap-3">
                        <h2 className={`text-2xl font-display font-bold tracking-[0.2em] uppercase ${killSwitchActive ? 'text-red-500' : isLive ? 'text-red-600 glow-text-red' : 'text-cyan-400 glow-text-cyan'}`}>
                            ARK Ω // {killSwitchActive ? 'HALTED' : isLive ? 'LIVE' : 'LIVING'}
                        </h2>
                        <span className="bg-black border border-slate-700 text-slate-300 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest ml-2">
                            STATUS: <span className="text-amber-400">{systemStatus}</span>
                        </span>
                    </div>
                    <div className="flex items-center space-x-4 mt-1">
                        <span className={`text-[10px] flex items-center gap-1.5 ${killSwitchActive ? 'text-red-500' : 'text-cyan-400'}`}>
                            <span className={`w-2 h-2 rounded-full ${killSwitchActive ? 'bg-red-500' : 'bg-cyan-400 shadow-[0_0_8px_var(--primary)]'}`}></span>
                            SPINE: {killSwitchActive ? 'LOCKED' : 'HYPER-TEMPORAL'}
                        </span>
                        <span className="text-slate-800">|</span>
                        <span className="text-[10px] text-amber-600 font-bold uppercase tracking-widest">Freq: {divineFreq.toExponential(2)} Hz</span>
                    </div>
                </div>

                <div className="flex items-center space-x-3">
                    <div className="flex bg-[#050505] border border-slate-800 rounded p-1 gap-1 shadow-inner">
                        {(['MANUAL', 'AUTONOMOUS', 'SOVEREIGN', 'LIVE_IBKR'] as TradeMode[]).map(mode => (
                            <button
                                key={mode}
                                onClick={() => setTradeMode(mode)}
                                className={`px-3 py-1 text-[9px] font-bold rounded-sm transition-all border ${
                                    tradeMode === mode 
                                    ? 'bg-cyan-900/50 border-cyan-500 text-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.3)]' 
                                    : 'bg-transparent border-transparent text-slate-600 hover:text-cyan-500'
                                }`}
                            >
                                {mode}
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={handleToggleLaunch}
                        className={`cyber-key px-6 py-2 font-bold text-xs tracking-[0.2em] border-2 ${isNexusOnline ? 'text-red-500 border-red-900' : 'text-cyan-400 border-cyan-900'}`}
                    >
                        {isNexusOnline ? 'TERMINATE' : 'GENESIS'}
                    </button>
                </div>
            </div>

            <div className="relative flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4 p-4 z-10 overflow-y-auto bg-[#08080a]">
                {/* COLUMN 1: QUANTUM & AUTONOMY STATE */}
                <div className="lg:col-span-1 flex flex-col space-y-4">
                    <div className="p-4 cyber-chip flex flex-col space-y-4">
                        <h3 className="text-xs font-bold text-amber-500 tracking-widest border-b border-white/5 pb-1 uppercase">Autonomy Core</h3>
                        <StatusIndicator label="Autonomous Health" value={autonomyMetrics.healthScore} color={autonomyMetrics.healthScore > 0.7 ? 'bg-emerald-500' : 'bg-red-500'} />
                        <StatusIndicator label="Hesitation Level" value={autonomyMetrics.hesitationLevel} color="bg-amber-500" />
                        <StatusIndicator label="AI Confidence" value={coreState.confidence} color="bg-violet-500" />
                        <div className="pt-2 border-t border-white/5 flex flex-col space-y-2">
                             <div className="flex justify-between items-center text-[10px] uppercase">
                                <span className="text-slate-500">Mode:</span>
                                <span className={coreState.isAutonomyUnlocked ? 'text-green-400 font-bold' : 'text-red-500 font-bold'}>{coreState.isAutonomyUnlocked ? 'UNLOCKED' : 'REVOKED'}</span>
                             </div>
                        </div>
                    </div>

                    <div className="p-4 cyber-chip flex flex-col space-y-4">
                        <h3 className="text-xs font-bold text-cyan-400 tracking-widest border-b border-white/5 pb-1 uppercase">Quantum Tomography</h3>
                        <StatusIndicator label="Majorana Stability" value={quantumMetrics.realityAnchorStability} color="bg-emerald-500" animate={realityCorrectorActive} />
                        <StatusIndicator label="Wave Coherence" value={quantumMetrics.trustScore} color="bg-cyan-400" />
                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5 text-[9px] font-mono text-slate-500">
                             <div className="flex flex-col"><span className="text-slate-700">COHERENCE</span><span className="text-cyan-400">{quantumMetrics.qubitCoherence.toFixed(1)}ns</span></div>
                             <div className="flex flex-col text-right"><span className="text-slate-700">TES_SCORE</span><span className="text-amber-500">{(quantumMetrics.tesScore * 100).toFixed(1)}%</span></div>
                        </div>
                    </div>
                    
                    <ChaosFractal entropy={quantumMetrics.entropy} />
                </div>

                {/* COLUMN 2-3: SOVEREIGN CORE */}
                <div className="lg:col-span-2 flex flex-col space-y-4">
                    <div className="flex-1 flex flex-col items-center justify-center relative min-h-[400px] cyber-inset bg-[#020202]">
                        {/* 100 SUGGESTIONS GRID (Background Glow) */}
                        {primeSuggestions.length > 0 && (
                            <div className="absolute inset-0 grid grid-cols-10 grid-rows-10 gap-px opacity-10 pointer-events-none">
                                {primeSuggestions.map(ps => (
                                    <div key={ps.id} className={`w-full h-full ${ps.status === 'ACTIVE' ? 'bg-cyan-500/20' : 'bg-transparent'}`} />
                                ))}
                            </div>
                        )}

                        {/* Reality Anchor Visualizer */}
                        <div className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-1000 ${isNexusOnline ? 'opacity-40' : 'opacity-5'}`}>
                            <div className="w-[80%] h-[80%] border border-cyan-500/10 rounded-full animate-spin-slow border-dashed"></div>
                            <div className="absolute w-[60%] h-[60%] border border-amber-500/10 rounded-full animate-spin border-dotted" style={{animationDirection: 'reverse'}}></div>
                        </div>

                        <div className={`hologram-circle w-80 h-80 flex items-center justify-center transition-all duration-1000 ${isNexusOnline ? 'opacity-100 scale-105' : 'opacity-10 grayscale scale-90'}`}>
                             <div className="flex flex-col items-center transition-transform duration-700 group cursor-pointer hover:scale-110">
                                <span className={`text-9xl font-display font-bold tracking-tighter ${killSwitchActive ? 'text-red-500' : isLive ? 'text-red-600' : 'text-white'} glow-text-cyan`}>Ω</span>
                                <span className="text-[12px] font-mono text-cyan-400 tracking-[0.8em] mt-6 ml-[0.8em] uppercase">Absolute</span>
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
                    <div className="flex-1 cyber-chip p-3 overflow-hidden font-mono text-[9px] text-slate-500 flex flex-col relative">
                        <div className="text-cyan-400 mb-2 font-bold tracking-widest border-b border-cyan-400/20 pb-1 uppercase flex justify-between">
                            <span>UPB-1_IMMUTABLE_FEED</span>
                            <span>v204.0</span>
                        </div>
                        <div ref={logRef} className="space-y-1.5 overflow-y-auto h-full pr-1 custom-scrollbar">
                            {nexusLogs.map((log, i) => (
                                <div key={i} className={`border-l-2 pl-2 py-1 transition-colors border-cyan-900/50 ${log.includes('SOVEREIGN') ? 'text-amber-300 border-amber-500/50' : 'text-slate-400'}`}>
                                    {log}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="h-48"><ForensicAuditLog logs={inversionLogs} /></div>
                    <GammaScalper />
                </div>
            </div>
        </div>
    );
};

export default Nexus;
