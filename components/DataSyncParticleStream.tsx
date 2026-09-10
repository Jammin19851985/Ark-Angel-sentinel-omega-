import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../contexts/AppContext';

interface Particle {
    id: number;
    progress: number; // 0 to 1
    speed: number;
    size: number;
    color: string;
    lane: number; // -1, 0, 1
}

export const DataSyncParticleStream: React.FC = () => {
    const { marketData } = useAppContext();
    const [isPulseActive, setIsPulseActive] = useState(false);
    const [pulseCount, setPulseCount] = useState(0);
    const [particles, setParticles] = useState<Particle[]>([]);
    const lastPriceHashRef = useRef<string>('');
    const animRef = useRef<number>(0);

    // Generate initial particles
    useEffect(() => {
        const initialParticles: Particle[] = Array.from({ length: 8 }, (_, i) => ({
            id: i,
            progress: i / 8,
            speed: 0.008 + Math.random() * 0.006,
            size: 2 + Math.random() * 2,
            color: Math.random() > 0.3 ? '#22d3ee' : '#f59e0b',
            lane: (i % 3) - 1
        }));
        setParticles(initialParticles);
    }, []);

    // Detect batch price updates to trigger origin/destination pulse effect
    useEffect(() => {
        const currentHash = Object.entries(marketData)
            .slice(0, 5)
            .map(([s, d]) => `${s}:${d.price}`)
            .join('|');

        if (lastPriceHashRef.current && currentHash !== lastPriceHashRef.current) {
            // Data batch synchronization event!
            setIsPulseActive(true);
            setPulseCount(c => c + 1);

            // Spawn accelerated high-energy burst particles
            setParticles(prev => [
                ...prev,
                { id: Date.now() + 1, progress: 0.05, speed: 0.025, size: 3.5, color: '#38bdf8', lane: 0 },
                { id: Date.now() + 2, progress: 0.1, speed: 0.022, size: 3, color: '#fbbf24', lane: -1 },
                { id: Date.now() + 3, progress: 0.15, speed: 0.024, size: 3, color: '#34d399', lane: 1 },
            ].slice(-16));

            const timer = setTimeout(() => setIsPulseActive(false), 900);
            return () => clearTimeout(timer);
        }
        lastPriceHashRef.current = currentHash;
    }, [marketData]);

    // Particle animation loop
    useEffect(() => {
        let lastTime = performance.now();
        const loop = (now: number) => {
            const dt = Math.min((now - lastTime) / 16.67, 2);
            lastTime = now;

            setParticles(prev => prev.map(p => {
                let nextProgress = p.progress + (p.speed * dt);
                if (nextProgress > 1) {
                    nextProgress = 0;
                }
                return { ...p, progress: nextProgress };
            }));

            animRef.current = requestAnimationFrame(loop);
        };

        animRef.current = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(animRef.current);
    }, []);

    return (
        <div 
            id="market-portfolio-particle-stream"
            className="w-full h-7 relative flex items-center justify-center my-0.5 select-none pointer-events-none z-20"
            title="Real-time Data Batch Synchronization Stream (MarketWatch ➔ Portfolio)"
        >
            {/* Background Conduit Track */}
            <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 h-[2px] bg-gradient-to-r from-transparent via-cyan-900/60 to-transparent" />
            <div className="absolute inset-x-12 top-1/2 -translate-y-1/2 h-[1px] bg-cyan-500/20" />

            {/* Central Vertical Connector Ribbon with SVG Particle Pipeline */}
            <svg className="w-full h-full overflow-visible">
                <defs>
                    <linearGradient id="stream-pipe-grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.8" />
                        <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#10b981" stopOpacity="0.8" />
                    </linearGradient>
                    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="2" result="blur" />
                        <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* Vertical Conduit Lines */}
                <line x1="50%" y1="0" x2="50%" y2="100%" stroke="url(#stream-pipe-grad)" strokeWidth="1.5" strokeDasharray="3,2" opacity="0.6" />
                <line x1="48%" y1="0" x2="48%" y2="100%" stroke="#06b6d4" strokeWidth="0.75" opacity="0.3" />
                <line x1="52%" y1="0" x2="52%" y2="100%" stroke="#10b981" strokeWidth="0.75" opacity="0.3" />

                {/* Animated Particles flowing from Origin (top) to Destination (bottom) */}
                {particles.map(p => {
                    const y = p.progress * 28; // container height is 28px (h-7)
                    const xOffset = p.lane * 8;
                    const opacity = Math.sin(p.progress * Math.PI); // Fades in at top, bright in middle, fades into dest
                    return (
                        <g key={p.id} filter="url(#glow)">
                            <circle
                                cx={`calc(50% + ${xOffset}px)`}
                                cy={y}
                                r={p.size}
                                fill={p.color}
                                opacity={Math.max(0.2, opacity)}
                            />
                            {/* Particle Trail */}
                            <line
                                x1={`calc(50% + ${xOffset}px)`}
                                y1={Math.max(0, y - 6)}
                                x2={`calc(50% + ${xOffset}px)`}
                                y2={y}
                                stroke={p.color}
                                strokeWidth={p.size * 0.6}
                                opacity={opacity * 0.6}
                            />
                        </g>
                    );
                })}
            </svg>

            {/* Origin Node (Top: Connected to MarketWatch) */}
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 flex items-center justify-center">
                <div className={`w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee] transition-transform duration-300 ${isPulseActive ? 'scale-150 bg-cyan-200 shadow-[0_0_16px_#38bdf8]' : 'scale-100'}`} />
                {/* Pulse wave ring at origin */}
                {isPulseActive && (
                    <div className="absolute w-6 h-6 rounded-full border border-cyan-400 animate-ping opacity-75" />
                )}
            </div>

            {/* Central Micro Badge */}
            <div className="absolute left-1/2 -translate-x-1/2 bg-black/90 px-2 py-0.5 rounded-full border border-cyan-900/80 flex items-center gap-1.5 shadow-[0_0_10px_rgba(0,0,0,0.8)]">
                <div className={`w-1 h-1 rounded-full ${isPulseActive ? 'bg-amber-400 animate-ping' : 'bg-cyan-400'}`} />
                <span className="text-[7px] font-mono tracking-widest text-slate-400 uppercase">
                    SYNC_STREAM <span className={isPulseActive ? 'text-amber-400 font-bold' : 'text-cyan-400'}>{isPulseActive ? 'BATCH_PULSE' : 'ACTIVE'}</span>
                </span>
            </div>

            {/* Destination Node (Bottom: Connected to PortfolioDisplay) */}
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex items-center justify-center">
                <div className={`w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981] transition-transform duration-300 ${isPulseActive ? 'scale-150 bg-emerald-200 shadow-[0_0_16px_#34d399]' : 'scale-100'}`} />
                {/* Pulse wave ring at destination */}
                {isPulseActive && (
                    <div className="absolute w-6 h-6 rounded-full border border-emerald-400 animate-ping opacity-75" />
                )}
            </div>
        </div>
    );
};

export default DataSyncParticleStream;
