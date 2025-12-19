
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

const QuantumMetricBar: React.FC<{ label: string, value: number, max: number, threshold?: number, unit: string, type: 'qubit' | 'fsf' | 'boredom' | 'entropy' }> = ({ label, value, max, threshold, unit, type }) => {
    const percent = Math.min(100, (value / max) * 100);
    const isCritical = threshold ? (type === 'qubit' ? value < threshold : value > threshold) : false;
    
    return (
        <div className="w-full mb-3">
            <div className="flex justify-between text-[10px] font-mono mb-1">
                <span className="text-slate-400">{label}</span>
                <span className={`${isCritical ? 'text-red-500 animate-pulse' : 'text-cyan-400'}`}>
                    {type === 'fsf' ? value.toFixed(9) : value.toFixed(2)}{unit}
                </span>
            </div>
            <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                <div 
                    className={`h-full transition-all duration-300 ${isCritical ? 'bg-red-500' : 'bg-cyan-500'}`}
                    style={{ width: `${percent}%` }}
                ></div>
            </div>
        </div>
    );
};

const Nexus: React.FC<NexusProps> = ({ id }) => {
    const { isNexusOnline, setNexusOnline, nexusLogs, addNexusLog, clearNexusLogs, quantumMetrics, addLog, inversionLogs, coreState } = useAppContext();
    const logRef = useRef<HTMLDivElement>(null);
    const abortRef = useRef(false);
    
    const [coreRotation, setCoreRotation] = useState(0);

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
        await log(">> TURMOX CORE Ω: AWAKENED.", 500);
        await log(">> STATUS: CATHOLIC_FINALITY.", 0);
    };

    return (
        <div id={id} className="relative h-full w-full overflow-hidden bg-black/80 rounded-lg border border-slate-800 glow-border flex flex-col">
            <div className="absolute inset-0 z-0 bg-[#020204]">
                <div className="absolute inset-0 opacity-40 animate-deep-space" 
                     style={{
                         background: 'radial-gradient(circle at 50% 50%, rgba(76, 29, 149, 0.2), transparent 70%), radial-gradient(circle at 0% 100%, rgba(34, 211, 238, 0.1), transparent 50%)',
                         filter: 'blur(40px)',
                     }}>
                </div>
            </div>

            <div className="relative z-20 flex justify-between items-center p-4 border-b border-white/10 bg-black/40 backdrop-blur-md">
                <div className="flex flex-col">
                    <h2 className="text-xl font-display font-bold tracking-[0.2em] text-cyan-400 glow-text-cyan">ARK Ω // FINALITY</h2>
                    <div className="flex items-center space-x-3">
                        <span className="text-[10px] font-mono text-amber-500">STATUS: {isNexusOnline ? 'ONLINE' : 'STANDBY'}</span>
                        <span className="text-[10px] font-mono text-slate-500">|</span>
                        <span className="text-[10px] font-mono text-slate-400">GCP: LINKED</span>
                    </div>
                </div>
                <button
                    onClick={handleToggleLaunch}
                    className={`flex items-center space-x-2 px-6 py-2 border font-mono text-xs tracking-widest uppercase transition-all duration-300 ${
                        isNexusOnline ? 'border-red-500 text-red-400' : 'border-cyan-500 text-cyan-400'
                    }`}
                >
                    <ShieldCheckIcon className="w-4 h-4" />
                    <span>{isNexusOnline ? 'COLLAPSE' : 'LAUNCH'}</span>
                </button>
            </div>

            <div className="relative flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4 p-4 z-10 overflow-y-auto">
                <div className="lg:col-span-1 flex flex-col space-y-4">
                    <div className="p-4 bg-black/70 backdrop-blur-md border border-slate-800 rounded-lg flex flex-col">
                        <h3 className="text-xs font-bold text-violet-400 font-mono tracking-widest mb-3 border-b border-slate-800 pb-1">// QUANTUM CORE</h3>
                        <QuantumMetricBar label="COHERENCE" value={quantumMetrics.qubitCoherence} max={200} threshold={40} unit="ns" type="qubit" />
                        <QuantumMetricBar label="FSF" value={quantumMetrics.fsfMetric} max={0.0000002} threshold={0.0000001} unit="" type="fsf" />
                        <QuantumMetricBar label="ENTROPY" value={quantumMetrics.entropy} max={1} unit="" type="entropy" />
                        <QuantumMetricBar label="BOREDOM" value={quantumMetrics.boredom} max={1} unit="" type="boredom" />
                        
                        <div className="mt-4 pt-2 border-t border-slate-800">
                            <div className="flex justify-between text-[10px] font-mono text-slate-500">
                                <span>TRUST SCORE:</span>
                                <span className="text-green-400">{(quantumMetrics.trustScore * 100).toFixed(1)}%</span>
                            </div>
                            <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
                                <span>CAUSAL DRIFT:</span>
                                <span className="text-amber-400">{quantumMetrics.drift.toFixed(5)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1"><GammaScalper /></div>
                </div>

                <div className="lg:col-span-2 flex flex-col gap-4">
                    <div className={`relative flex-1 flex items-center justify-center transition-all duration-1000 ${isNexusOnline ? 'opacity-100 scale-100' : 'opacity-20 scale-90'}`}>
                        <OmniRing radius={120} stroke="rgba(34, 211, 238, 0.3)" strokeWidth={1} dashArray="10 20" rotationDuration={60} />
                        <OmniRing radius={60} stroke="rgba(139, 92, 246, 0.5)" strokeWidth={2} dashArray="100 200" rotationDuration={15} />
                        <div className="absolute text-center z-20">
                            <div className="text-[10px] font-mono text-cyan-200">CORE</div>
                            <div className="text-4xl font-display font-bold text-white tracking-tighter">Ω</div>
                        </div>
                    </div>
                    <div className="h-64"><ActiveGodProtocol /></div>
                </div>

                <div className="lg:col-span-1 flex flex-col space-y-4">
                    <div className="flex-1"><SovereignFinancialManifestation /></div>
                    <div className="h-64"><ForensicAuditLog logs={inversionLogs} /></div>
                </div>
            </div>
        </div>
    );
};

export default Nexus;
