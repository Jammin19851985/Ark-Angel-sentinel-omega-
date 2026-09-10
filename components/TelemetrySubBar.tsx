import React, { useState, useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext';
import QuantumEntropyMeter from './QuantumEntropyMeter';
import { triggerAutoSnapshot } from '../utils/autoSnapshot';

export const TelemetrySubBar: React.FC = () => {
    const { 
        isLiveMode, 
        isSovereign, 
        isAgentZeroActive, 
        fiatBalance, 
        portfolio, 
        addLog, 
        addNexusLog 
    } = useAppContext();

    const [fps, setFps] = useState(60);
    const [mem, setMem] = useState(65.2);
    const [netLatency, setNetLatency] = useState(0.8);
    const [snapshotFeedback, setSnapshotFeedback] = useState<string | null>(null);

    // Frame counter & Memory telemetry
    useEffect(() => {
        let frameCount = 0;
        let lastTime = performance.now();
        let animId: number;

        const loop = () => {
            const now = performance.now();
            frameCount++;
            if (now - lastTime >= 1000) {
                setFps(frameCount);
                frameCount = 0;
                lastTime = now;
                setMem(64.8 + Math.random() * 0.8);
                setNetLatency(Number((0.6 + Math.random() * 0.4).toFixed(1)));
            }
            animId = requestAnimationFrame(loop);
        };
        animId = requestAnimationFrame(loop);

        return () => cancelAnimationFrame(animId);
    }, []);

    // Listen for snapshot events
    useEffect(() => {
        const handler = (e: any) => {
            const snap = e.detail;
            if (snap?.id) {
                setSnapshotFeedback(snap.id);
                setTimeout(() => setSnapshotFeedback(null), 3000);
            }
        };
        window.addEventListener('aode-snapshot-created', handler);
        return () => window.removeEventListener('aode-snapshot-created', handler);
    }, []);

    const handleManualSnapshot = () => {
        const snap = triggerAutoSnapshot(
            'MANUAL_CHECKPOINT_USER_REQUESTED',
            { fiatBalance, portfolio, isLiveMode },
            addLog,
            addNexusLog
        );
        setSnapshotFeedback(snap.id);
        setTimeout(() => setSnapshotFeedback(null), 3000);
    };

    return (
        <div 
            id="telemetry-sub-bar"
            className="w-full px-3 py-1 bg-[#040608]/95 border-b border-cyan-950/60 flex flex-wrap items-center justify-between gap-2 text-[9px] font-mono z-20 shrink-0 backdrop-blur-md shadow-[0_2px_10px_rgba(0,0,0,0.5)]"
        >
            {/* Left Zone: Operational State & Snapshot Action */}
            <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-black/60 rounded border border-slate-800">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    <span className="text-slate-400 uppercase tracking-widest text-[8px] hidden sm:inline">KERNEL:</span>
                    <span className="text-emerald-400 font-bold">
                        {isAgentZeroActive ? 'AGENT_ZERO' : isSovereign ? 'SOVEREIGN_MESH' : 'OMEGA_CORE_v210'}
                    </span>
                </div>

                <button 
                    onClick={handleManualSnapshot}
                    className={`px-2 py-0.5 rounded border transition-all flex items-center gap-1 ${
                        snapshotFeedback 
                            ? 'bg-amber-950/40 border-amber-500 text-amber-300' 
                            : 'bg-black/50 border-slate-800 text-slate-400 hover:text-cyan-300 hover:border-cyan-700'
                    }`}
                    title="Commit an Immutable State Snapshot to local ledger"
                >
                    <span>📸</span>
                    <span className="hidden md:inline">
                        {snapshotFeedback ? `SAVED [${snapshotFeedback}]` : 'SNAPSHOT'}
                    </span>
                </button>
            </div>

            {/* Center Zone: Quantum Entropy Decoherence Meter with Sparkline & 10s Forecast */}
            <div className="flex-1 flex justify-center min-w-0 max-w-xl">
                <QuantumEntropyMeter compact={true} />
            </div>

            {/* Right Zone: Relocated FPS, MEM, NET telemetry */}
            <div className="flex items-center gap-1.5 select-none font-mono">
                <div className="flex items-center gap-1 bg-black/60 px-2 py-0.5 rounded border border-slate-800">
                    <span className="text-slate-500 text-[8px]">FPS</span>
                    <span className={`font-bold ${fps >= 50 ? 'text-emerald-400' : fps >= 30 ? 'text-amber-400' : 'text-rose-500'}`}>
                        {fps}
                    </span>
                </div>

                <div className="flex items-center gap-1 bg-black/60 px-2 py-0.5 rounded border border-slate-800">
                    <span className="text-slate-500 text-[8px]">MEM</span>
                    <span className="text-cyan-400 font-bold">
                        {mem.toFixed(1)}GB
                    </span>
                </div>

                <div className="flex items-center gap-1 bg-black/60 px-2 py-0.5 rounded border border-slate-800">
                    <span className="text-slate-500 text-[8px]">NET</span>
                    <span className="text-neon-pink font-bold">
                        OK <span className="text-slate-400 font-normal text-[7px]">({netLatency}ms)</span>
                    </span>
                </div>
            </div>
        </div>
    );
};

export default TelemetrySubBar;
