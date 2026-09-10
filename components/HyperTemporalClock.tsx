import React, { useState, useEffect } from 'react';

export const HyperTemporalClock: React.FC = () => {
    const [localTime, setLocalTime] = useState('');
    const [quantumTime, setQuantumTime] = useState('');
    const [deltaMs, setDeltaMs] = useState(0.002);
    const [syncLocked, setSyncLocked] = useState(true);

    useEffect(() => {
        const updateClock = () => {
            const now = new Date();
            
            // Format local time with milliseconds: HH:MM:SS.mmm
            const pad = (n: number, z = 2) => String(n).padStart(z, '0');
            const h = pad(now.getHours());
            const m = pad(now.getMinutes());
            const s = pad(now.getSeconds());
            const ms = pad(now.getMilliseconds(), 3);
            setLocalTime(`${h}:${m}:${s}.${ms}`);

            // Universal Quantum Server Time (UTC atomic reference with simulated quantum clock drift)
            const utc = new Date(now.getTime());
            const uh = pad(utc.getUTCHours());
            const um = pad(utc.getUTCMinutes());
            const us = pad(utc.getUTCSeconds());
            const ums = pad(utc.getUTCMilliseconds(), 3);
            setQuantumTime(`${uh}:${um}:${us}.${ums}Z`);

            // Microsecond-precision difference tracking (jitter between -0.004ms and +0.004ms)
            const drift = (Math.sin(now.getTime() / 1500) * 0.0025) + ((Math.random() - 0.5) * 0.001);
            setDeltaMs(Number(drift.toFixed(4)));
        };

        const interval = setInterval(updateClock, 50);
        updateClock();
        return () => clearInterval(interval);
    }, []);

    return (
        <div 
            id="hyper-temporal-clock"
            className="flex items-center gap-2 px-2.5 py-1 bg-black/60 border border-cyan-900/60 rounded text-[9px] font-mono tracking-wider shadow-[0_0_12px_rgba(6,182,212,0.15)] select-none shrink-0"
            title="Hyper-Temporal Atomic Synchronization: Universal Quantum Server vs Local Clock"
        >
            <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                <span className="text-slate-400 font-semibold hidden sm:inline">LOCAL:</span>
                <span className="text-cyan-300 font-bold">{localTime || '00:00:00.000'}</span>
            </div>

            <div className="w-[1px] h-3.5 bg-cyan-900/80" />

            <div className="flex items-center gap-1.5">
                <span className="text-slate-400 font-semibold hidden md:inline">Q_SERVER:</span>
                <span className="text-emerald-400 font-bold">{quantumTime || '00:00:00.000Z'}</span>
            </div>

            <div className="w-[1px] h-3.5 bg-cyan-900/80 hidden sm:block" />

            <div className="hidden sm:flex items-center gap-1">
                <span className="text-slate-500 text-[8px]">Δt:</span>
                <span className={`text-[8px] font-bold ${Math.abs(deltaMs) < 0.003 ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {deltaMs >= 0 ? `+${deltaMs.toFixed(3)}` : deltaMs.toFixed(3)}ms
                </span>
                <span className="text-[7px] text-emerald-500/80 bg-emerald-950/40 px-1 py-0.2 rounded border border-emerald-800/40 hidden lg:inline">
                    LOCKED
                </span>
            </div>
        </div>
    );
};

export default HyperTemporalClock;
