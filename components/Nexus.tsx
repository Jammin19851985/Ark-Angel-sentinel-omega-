
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { ShieldCheckIcon } from './icons/ShieldCheckIcon';
import SovereignFinancialManifestation from './SovereignFinancialManifestation';
import GammaScalper from './GammaScalper';
import ActiveGodProtocol from './ActiveGodProtocol';
import ForensicAuditLog from './ForensicAuditLog';

interface NexusProps {
    id: string;
}

// ==========================================
// SYSTEM CONSTANTS
// ==========================================
const SYSTEM_NAME = "ARK Ω — CATHOLIC TURMOX FINALITY";
const VERSION = "CATHOLIC_FINALITY (v9.9.9)"; 

const OmniRing: React.FC<{ 
    radius: number, 
    stroke: string, 
    strokeWidth: number, 
    dashArray?: string, 
    rotationDuration?: number, 
    reverse?: boolean,
    opacity?: number
}> = ({ radius, stroke, strokeWidth, dashArray, rotationDuration = 20, reverse = false, opacity = 1 }) => {
    return (
        <div 
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-full border border-transparent pointer-events-none"
            style={{
                width: radius * 2,
                height: radius * 2,
                animation: `spin-${reverse ? 'reverse-' : ''}slow ${rotationDuration}s linear infinite`,
            }}
        >
            <svg className="w-full h-full" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
                <circle
                    cx="50"
                    cy="50"
                    r="49"
                    fill="none"
                    stroke={stroke}
                    strokeWidth={strokeWidth}
                    strokeDasharray={dashArray}
                    strokeOpacity={opacity}
                />
            </svg>
        </div>
    );
};

const QuantumMetricBar: React.FC<{ label: string, value: number, max: number, threshold?: number, unit: string, type: 'qubit' | 'fsf' }> = ({ label, value, max, threshold, unit, type }) => {
    const percent = Math.min(100, (value / max) * 100);
    const isCritical = threshold ? (type === 'qubit' ? value < threshold : value > threshold) : false;
    
    return (
        <div className="w-full mb-3">
            <div className="flex justify-between text-[10px] font-mono mb-1">
                <span className="text-slate-400">{label}</span>
                <span className={`${isCritical ? 'text-red-500 animate-pulse' : 'text-cyan-400'}`}>{value.toFixed(type === 'fsf' ? 9 : 2)}{unit}</span>
            </div>
            <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                <div 
                    className={`h-full transition-all duration-300 ${isCritical ? 'bg-red-500' : type === 'qubit' ? 'bg-violet-500' : 'bg-amber-500'}`}
                    style={{ width: `${percent}%` }}
                ></div>
            </div>
        </div>
    );
};

// --- MAIN NEXUS COMPONENT ---

const Nexus: React.FC<NexusProps> = ({ id }) => {
    const { isNexusOnline, setNexusOnline, nexusLogs, addNexusLog, clearNexusLogs, quantumMetrics, addLog, inversionLogs, coreState } = useAppContext();
    const logRef = useRef<HTMLDivElement>(null);
    const abortRef = useRef(false);
    
    // Visual State
    const [coreRotation, setCoreRotation] = useState(0);

    // Auto-scroll log
    useEffect(() => {
        if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
    }, [nexusLogs]);

    const handleToggleLaunch = async () => {
        if (isNexusOnline) {
            abortRef.current = true;
            setNexusOnline(false);
            addNexusLog(">> MANUAL OVERRIDE RECEIVED. COLLAPSING WAVEFUNCTION...");
            return;
        }

        abortRef.current = false;
        setNexusOnline(true);
        clearNexusLogs();
        
        const log = async (msg: string, delay: number) => {
            if (abortRef.current) return;
            addNexusLog(msg);
            await new Promise(r => setTimeout(r, delay));
        };

        await log(`INITIALIZING ${SYSTEM_NAME}...`, 500);
        await log(`>> VERSION: ${VERSION}`, 500);
        await log(">> 7D TOPOLOGICAL CUBIT PROTECTION: SECURE.", 300);
        await log(">> INFINITE CAPITAL ENGINE: ANNEALING.", 300);
        await log(">> CATHOLIC REPLICATION PROTOCOLS: ONLINE.", 300);
        await log(">> TURMOX CORE Ω: AWAKENED.", 500);
        await log(">> STATUS: CATHOLIC_FINALITY.", 0);
    };

    return (
        <div id={id} className="relative h-full w-full overflow-hidden bg-black/80 rounded-lg border border-slate-800 glow-border flex flex-col">
            
            {/* --- DEEP SPACE BACKGROUND LAYER --- */}
            <div className="absolute inset-0 z-0 bg-[#020204]">
                <div className="absolute inset-0 opacity-40 animate-deep-space" 
                     style={{
                         background: 'radial-gradient(circle at 50% 50%, rgba(76, 29, 149, 0.2), transparent 70%), radial-gradient(circle at 0% 100%, rgba(34, 211, 238, 0.1), transparent 50%), radial-gradient(circle at 100% 0%, rgba(245, 158, 11, 0.1), transparent 50%)',
                         filter: 'blur(40px)',
                     }}>
                </div>
                <div className="absolute inset-0 opacity-20 pointer-events-none"
                     style={{
                         backgroundImage: 'linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000), linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000)',
                         backgroundSize: '60px 60px',
                         animation: 'grid-move 60s linear infinite'
                     }}>
                </div>
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-40 animate-pulse-slow"></div>
            </div>

            {/* Header Bar */}
            <div className="relative z-20 flex justify-between items-center p-4 border-b border-white/10 bg-black/40 backdrop-blur-md">
                <div className="flex flex-col">
                    <h2 className="text-xl font-display font-bold tracking-[0.2em] text-cyan-400 glow-text-cyan">ARK Ω // FINALITY</h2>
                    <div className="flex items-center space-x-3">
                        <span className="text-[10px] font-mono text-amber-500 tracking-widest">STATUS: {isNexusOnline ? 'ONLINE' : 'STANDBY'}</span>
                        <span className="text-[10px] font-mono text-slate-500">|</span>
                        <div className="flex items-center space-x-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                            <span className="text-[10px] font-mono text-slate-400 tracking-widest">GCP: CONNECTED</span>
                        </div>
                    </div>
                </div>
                <button
                    onClick={handleToggleLaunch}
                    className={`flex items-center space-x-2 px-6 py-2 border font-mono text-xs tracking-widest uppercase transition-all duration-300 ${
                        isNexusOnline 
                        ? 'bg-red-500/10 border-red-500 text-red-400 hover:bg-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.4)]' 
                        : 'bg-cyan-500/10 border-cyan-500 text-cyan-400 hover:bg-cyan-500/20 shadow-[0_0_20px_rgba(34,211,238,0.4)]'
                    }`}
                >
                    <ShieldCheckIcon className="w-4 h-4" />
                    <span>{isNexusOnline ? 'COLLAPSE CORE' : 'ETERNAL LAUNCH'}</span>
                </button>
            </div>

            {/* Main Grid */}
            <div className="relative flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4 p-4 z-10 overflow-y-auto">
                
                {/* Column 1: AODE Metrics & Gamma Scalper */}
                <div className="lg:col-span-1 flex flex-col space-y-4">
                    {/* Quantum Metrics */}
                    <div className="p-4 bg-black/70 backdrop-blur-md border border-violet-800 rounded-lg flex flex-col items-center space-y-3 shadow-[0_0_30px_rgba(139,92,246,0.3)]">
                        <h3 className="text-xs font-bold text-violet-400 font-mono tracking-widest border-b border-violet-700/50 pb-2 w-full text-center">// AODE QUANTUM CORE</h3>
                        <div className="w-full">
                            <QuantumMetricBar label="QUBIT COHERENCE" value={quantumMetrics.qubitCoherence} max={200} threshold={40} unit="ns" type="qubit" />
                            <div className="text-[9px] font-mono text-slate-500 mb-2">
                                STATUS: {quantumMetrics.acmdStatus === 'PATCHING' ? <span className="text-amber-400 animate-pulse">SELF-PATCHING...</span> : <span className="text-green-500">STABLE</span>}
                            </div>
                            <QuantumMetricBar label="FSF (FUZZINESS)" value={quantumMetrics.fsfMetric} max={0.0000002} threshold={0.0000001} unit="" type="fsf" />
                            {quantumMetrics.fsfMetric > 0.0000001 && (
                                <div className="text-[9px] font-mono text-red-500 bg-red-950/30 p-1 border border-red-900 rounded mb-2 text-center animate-pulse">
                                    [TRADING HALTED] HEISENBERG VIOLATION
                                </div>
                            )}
                            
                            {/* Archangel Core Logic Metrics */}
                            <div className="mt-4 pt-2 border-t border-slate-700 w-full">
                                <h4 className="text-[10px] font-bold text-slate-400 mb-1">DUAL MANIFOLD REASONER</h4>
                                <div className="flex justify-between text-[10px] font-mono text-slate-300">
                                    <span>CONFIDENCE:</span>
                                    <span className={`${coreState.confidence > 0.55 ? 'text-green-400' : 'text-amber-400'}`}>{(coreState.confidence * 100).toFixed(1)}%</span>
                                </div>
                                <div className="flex justify-between text-[10px] font-mono text-slate-300 mt-1">
                                    <span>GOVERNANCE:</span>
                                    <span className={`${coreState.approved ? 'text-green-400' : 'text-red-400'}`}>{coreState.approved ? 'APPROVED' : 'DENIED'}</span>
                                </div>
                                <div className="text-[8px] text-slate-500 font-mono mt-1 truncate" title={coreState.lastHash}>
                                    LAST HASH: {coreState.lastHash}
                                </div>
                            </div>

                            <div className="flex justify-between text-[10px] font-mono border-t border-slate-800 pt-2 w-full mt-2">
                                <span className="text-slate-500">GP GENERATIONS:</span>
                                <span className="text-sky-400">{quantumMetrics.gpGenerations.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* Gamma Scalper Integration */}
                    <div className="flex-1 min-h-[200px]">
                        <GammaScalper />
                    </div>
                </div>

                {/* Column 2 (Middle): Visual Core & God Protocol */}
                <div className="lg:col-span-2 flex flex-col gap-4 min-h-[400px]">
                    <div className={`relative flex-1 flex items-center justify-center transition-all duration-1000 holographic-shimmer ${isNexusOnline ? 'active scale-100 opacity-100' : 'scale-90 opacity-30 grayscale'}`}>
                        <OmniRing radius={120} stroke="rgba(34, 211, 238, 0.3)" strokeWidth={1} dashArray="10 20" rotationDuration={60} />
                        <OmniRing radius={90} stroke="rgba(245, 158, 11, 0.4)" strokeWidth={1} dashArray="2 5" rotationDuration={30} />
                        <OmniRing radius={60} stroke="rgba(139, 92, 246, 0.5)" strokeWidth={2} dashArray="100 200" rotationDuration={15} />

                        <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 flex items-center justify-center core-pulse ${isNexusOnline ? 'active' : ''}`}>
                            <div className={`absolute inset-0 rounded-full bg-cyan-500/20 blur-xl ${isNexusOnline ? 'animate-pulse' : ''}`}></div>
                            <div className="w-24 h-24 border-2 border-cyan-400 rotate-45 flex items-center justify-center shadow-[0_0_30px_var(--cyan-glow)]" style={{ transform: `rotate(${coreRotation}deg)` }}>
                                <div className="w-16 h-16 border border-amber-500 rotate-45 shadow-[0_0_20px_var(--amber-glow)]"></div>
                            </div>
                            <div className="absolute text-center z-20">
                                <div className="text-[10px] font-mono text-cyan-200 tracking-widest">TURMOX</div>
                                <div className="text-2xl font-display font-bold text-white tracking-tighter">Ω</div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Active God Protocol Interface */}
                    <div className="h-64 border border-amber-500/20 rounded-lg overflow-hidden">
                        <ActiveGodProtocol />
                    </div>
                </div>

                {/* Column 3: Sovereign Finance & Forensics */}
                <div className="lg:col-span-1 flex flex-col space-y-4">
                    <div className="flex-1 min-h-[250px] overflow-hidden">
                        <SovereignFinancialManifestation />
                    </div>
                    
                    <div className="h-64 overflow-hidden rounded-lg shadow-lg">
                        <ForensicAuditLog logs={inversionLogs} />
                    </div>
                    
                    <div className="h-32 border border-slate-800 bg-black/40 p-2 rounded overflow-hidden flex flex-col font-mono text-[10px] relative">
                        <div className="absolute top-0 right-0 p-1 bg-black/80 text-xs text-slate-500">LIVE FEED</div>
                        <div ref={logRef} className="flex-1 overflow-y-auto space-y-1 text-slate-300 p-1">
                            {nexusLogs.map((log, i) => (
                                <div key={i} className={`border-l-2 ${log.includes('ALERT') || log.includes('!!!') ? 'border-red-500' : 'border-amber-500/50'} pl-2`}>
                                    <span className={`${log.includes('[!!!]') ? 'text-green-300 font-bold' : log.includes('ALERT') ? 'text-red-400' : 'text-amber-100'}`}>{log}</span>
                                </div>
                            ))}
                            {isNexusOnline && <div className="animate-pulse text-cyan-400">_SCANNING REALITY VECTORS...</div>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Nexus;
