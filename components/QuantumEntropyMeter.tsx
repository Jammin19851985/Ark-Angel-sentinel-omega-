import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useAppContext } from '../contexts/AppContext';

interface DataPoint {
    time: number;
    value: number; // 0.000 to 1.000 (decoherence level)
}

interface QuantumEntropyMeterProps {
    compact?: boolean;
    className?: string;
    onExpandToggle?: () => void;
}

export const QuantumEntropyMeter: React.FC<QuantumEntropyMeterProps> = ({
    compact = false,
    className = '',
    onExpandToggle
}) => {
    const { quantumMetrics, bots, isLiveMode, coreState, sicoCollapses } = useAppContext();
    
    // 60-second historical history (1 point per second, 60 points)
    const [history, setHistory] = useState<DataPoint[]>(() => {
        const initial: DataPoint[] = [];
        const now = Date.now();
        const base = 0.18;
        for (let i = 59; i >= 0; i--) {
            const noise = (Math.sin(i / 5) * 0.05) + ((Math.random() - 0.5) * 0.03);
            initial.push({
                time: now - i * 1000,
                value: Math.max(0.02, Math.min(0.95, base + noise))
            });
        }
        return initial;
    });

    const [currentDecoherence, setCurrentDecoherence] = useState(0.18);
    const [systemStress, setSystemStress] = useState(28.5);
    const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; val: number; label: string } | null>(null);

    // Compute real-time decoherence based on system stress factors
    useEffect(() => {
        const interval = setInterval(() => {
            const now = Date.now();
            
            // Factor 1: Active executing bots load
            const activeBots = bots.filter(b => b.status === 'Executing').length;
            const botStress = (activeBots / Math.max(bots.length, 1)) * 30;

            // Factor 2: SICO & Quantum metrics drift
            const entropyBase = (quantumMetrics?.entropy || 0.45) * 25;
            const driftStress = ((quantumMetrics?.drift || 0.001) * 1000) * 10;

            // Factor 3: Live mode execution tension
            const liveModeStress = isLiveMode ? 20 : 5;

            // Factor 4: Micro jitter
            const jitter = (Math.random() - 0.48) * 8;

            const totalStress = Math.max(5, Math.min(99.5, botStress + entropyBase + driftStress + liveModeStress + jitter));
            setSystemStress(Number(totalStress.toFixed(1)));

            // Convert stress into decoherence index [0.05 - 0.95]
            const rawDecoherence = (totalStress / 100) * 0.85 + (Math.sin(now / 3000) * 0.04);
            const clamped = Math.max(0.04, Math.min(0.96, Number(rawDecoherence.toFixed(4))));
            setCurrentDecoherence(clamped);

            setHistory(prev => {
                const next = [...prev.slice(1), { time: now, value: clamped }];
                return next;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [bots, isLiveMode, quantumMetrics]);

    // Calculate 10-second predictive trend line
    const { prediction, trendDirection, slope } = useMemo(() => {
        if (history.length < 10) return { prediction: [], trendDirection: 'STABLE', slope: 0 };

        // Linear regression on the last 15 seconds to project forward
        const recent = history.slice(-15);
        const n = recent.length;
        let sumX = 0;
        let sumY = 0;
        let sumXY = 0;
        let sumX2 = 0;

        recent.forEach((p, idx) => {
            sumX += idx;
            sumY += p.value;
            sumXY += idx * p.value;
            sumX2 += idx * idx;
        });

        const calculatedSlope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
        const intercept = (sumY - calculatedSlope * sumX) / n;

        // Stress inertia modifier: high stress bends prediction upward
        const stressBias = (systemStress > 60 ? (systemStress - 60) * 0.0008 : 0);
        const effectiveSlope = calculatedSlope + stressBias;

        const lastPoint = recent[recent.length - 1];
        const futurePoints: DataPoint[] = [];

        for (let step = 1; step <= 10; step++) {
            const projectedValue = lastPoint.value + (effectiveSlope * step) + (Math.sin(step) * 0.008);
            futurePoints.push({
                time: lastPoint.time + step * 1000,
                value: Math.max(0.02, Math.min(0.98, Number(projectedValue.toFixed(4))))
            });
        }

        const direction = effectiveSlope > 0.003 ? 'DIVERGING_UP' : effectiveSlope < -0.003 ? 'CONVERGING_DOWN' : 'STABLE';
        return { prediction: futurePoints, trendDirection: direction, slope: effectiveSlope };
    }, [history, systemStress]);

    // Sparkline geometry dimensions
    const width = compact ? 220 : 360;
    const height = compact ? 42 : 80;
    const padding = { top: 6, bottom: 8, left: 4, right: 4 };

    const totalSeconds = 70; // 60s history + 10s forecast
    const historyWidth = (60 / totalSeconds) * (width - padding.left - padding.right);
    const futureWidth = (10 / totalSeconds) * (width - padding.left - padding.right);

    // Scaling helpers
    const scaleXHistory = (index: number) => padding.left + (index / 59) * historyWidth;
    const scaleXFuture = (index: number) => padding.left + historyWidth + ((index + 1) / 10) * futureWidth;
    const scaleY = (val: number) => {
        const usableHeight = height - padding.top - padding.bottom;
        return height - padding.bottom - val * usableHeight;
    };

    // Build SVG path strings
    const historyPath = useMemo(() => {
        if (history.length === 0) return '';
        return history.reduce((acc, pt, i) => {
            const x = scaleXHistory(i);
            const y = scaleY(pt.value);
            return i === 0 ? `M ${x},${y}` : `${acc} L ${x},${y}`;
        }, '');
    }, [history, width, height]);

    const historyAreaPath = useMemo(() => {
        if (history.length === 0) return '';
        const firstX = scaleXHistory(0);
        const lastX = scaleXHistory(history.length - 1);
        const baseY = height - padding.bottom;
        return `${historyPath} L ${lastX},${baseY} L ${firstX},${baseY} Z`;
    }, [historyPath, history, width, height]);

    const predictionPath = useMemo(() => {
        if (prediction.length === 0 || history.length === 0) return '';
        const lastHistoryPt = history[history.length - 1];
        const startX = scaleXHistory(history.length - 1);
        const startY = scaleY(lastHistoryPt.value);

        const segments = prediction.map((pt, i) => {
            const x = scaleXFuture(i);
            const y = scaleY(pt.value);
            return `L ${x},${y}`;
        }).join(' ');

        return `M ${startX},${startY} ${segments}`;
    }, [prediction, history, width, height]);

    // Status category
    const status = useMemo(() => {
        if (currentDecoherence < 0.25) return { label: 'COHERENT', color: 'text-emerald-400', border: 'border-emerald-500/40', bg: 'bg-emerald-950/30' };
        if (currentDecoherence < 0.55) return { label: 'META-STABLE', color: 'text-cyan-400', border: 'border-cyan-500/40', bg: 'bg-cyan-950/30' };
        if (currentDecoherence < 0.80) return { label: 'HIGH_STRESS', color: 'text-amber-400', border: 'border-amber-500/40', bg: 'bg-amber-950/30' };
        return { label: 'CRITICAL_DRIFT', color: 'text-rose-500', border: 'border-rose-500/60', bg: 'bg-rose-950/40' };
    }, [currentDecoherence]);

    if (compact) {
        return (
            <div 
                id="quantum-entropy-meter"
                className={`flex items-center gap-3 px-3 py-1 bg-black/70 border border-slate-800 hover:border-cyan-500/50 rounded transition-all select-none ${className}`}
                title="Quantum Decoherence Real-time Meter (60s History + 10s Predictive Forecast)"
            >
                <div className="flex flex-col">
                    <div className="flex items-center gap-1.5">
                        <div className={`w-1.5 h-1.5 rounded-full animate-ping ${status.color.replace('text-', 'bg-')}`} />
                        <span className="text-[8px] font-mono text-slate-400 uppercase tracking-widest">DECOHERENCE</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                        <span className={`text-xs font-mono font-bold ${status.color}`}>
                            {currentDecoherence.toFixed(3)}
                        </span>
                        <span className="text-[8px] text-slate-500 font-mono">Λ</span>
                        <span className={`text-[8px] font-mono font-semibold px-1 rounded border ${status.border} ${status.bg} ${status.color} ml-1`}>
                            {status.label}
                        </span>
                    </div>
                </div>

                {/* Compact Sparkline */}
                <div className="relative">
                    <svg width={width} height={height} className="overflow-visible">
                        <defs>
                            <linearGradient id="qem-history-gradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.4" />
                                <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
                            </linearGradient>
                            <linearGradient id="qem-pred-gradient" x1="0" y1="0" x2="1" y2="0">
                                <stop offset="0%" stopColor="#06b6d4" />
                                <stop offset="100%" stopColor="#f59e0b" />
                            </linearGradient>
                        </defs>

                        {/* Baseline Grid */}
                        <line 
                            x1={padding.left} 
                            y1={scaleY(0.5)} 
                            x2={width - padding.right} 
                            y2={scaleY(0.5)} 
                            stroke="#334155" 
                            strokeDasharray="2,2" 
                            strokeWidth="0.5" 
                        />

                        {/* 60s History Area */}
                        <path d={historyAreaPath} fill="url(#qem-history-gradient)" />

                        {/* 60s History Line */}
                        <path d={historyPath} fill="none" stroke="#22d3ee" strokeWidth="1.2" strokeLinecap="round" />

                        {/* Current Value Marker */}
                        {history.length > 0 && (
                            <circle 
                                cx={scaleXHistory(history.length - 1)} 
                                cy={scaleY(currentDecoherence)} 
                                r="2.5" 
                                fill="#22d3ee" 
                                className="animate-pulse"
                            />
                        )}

                        {/* 10s Predictive Trend Line (Dashed) */}
                        <path 
                            d={predictionPath} 
                            fill="none" 
                            stroke="url(#qem-pred-gradient)" 
                            strokeWidth="1.2" 
                            strokeDasharray="3,2" 
                        />

                        {/* Boundary line between past and forecast */}
                        <line 
                            x1={padding.left + historyWidth} 
                            y1={padding.top} 
                            x2={padding.left + historyWidth} 
                            y2={height - padding.bottom} 
                            stroke="#475569" 
                            strokeWidth="0.75" 
                            strokeDasharray="1,2" 
                        />
                    </svg>

                    <div className="flex justify-between text-[7px] font-mono text-slate-500 mt-0.5 px-1">
                        <span>-60s</span>
                        <span className="text-cyan-400">NOW</span>
                        <span className="text-amber-400">+10s FORECAST</span>
                    </div>
                </div>

                <div className="hidden xl:flex flex-col text-right text-[8px] font-mono pl-2 border-l border-slate-800">
                    <span className="text-slate-500">SYSTEM STRESS:</span>
                    <span className="text-cyan-300 font-bold">{systemStress}%</span>
                    <span className={`text-[7px] ${trendDirection === 'DIVERGING_UP' ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {trendDirection === 'DIVERGING_UP' ? '▲ DRIFTING' : trendDirection === 'CONVERGING_DOWN' ? '▼ DAMPENING' : '► STEADY'}
                    </span>
                </div>
            </div>
        );
    }

    // Full Panel View
    return (
        <div 
            id="quantum-entropy-meter-panel"
            className={`p-4 bg-[#05070a]/90 border border-cyan-900/40 rounded-lg tech-panel holographic-panel shadow-[0_0_20px_rgba(6,182,212,0.1)] relative overflow-hidden ${className}`}
        >
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full animate-ping ${status.color.replace('text-', 'bg-')}`} />
                    <h3 className="text-xs font-mono font-bold tracking-widest text-cyan-300 uppercase">
                        Quantum Decoherence Monitor
                    </h3>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[9px] font-mono text-slate-400">STATUS:</span>
                    <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border ${status.border} ${status.bg} ${status.color}`}>
                        {status.label}
                    </span>
                </div>
            </div>

            {/* Metrics Ribbon */}
            <div className="grid grid-cols-3 gap-2 mb-3 bg-black/40 p-2.5 rounded border border-slate-800/80 font-mono text-center">
                <div>
                    <span className="text-[8px] text-slate-500 block uppercase">Decoherence (D)</span>
                    <span className={`text-base font-bold ${status.color}`}>
                        {currentDecoherence.toFixed(4)} <span className="text-[9px] text-slate-400">Λ</span>
                    </span>
                </div>
                <div>
                    <span className="text-[8px] text-slate-500 block uppercase">System Stress</span>
                    <span className="text-base font-bold text-cyan-300">
                        {systemStress}%
                    </span>
                </div>
                <div>
                    <span className="text-[8px] text-slate-500 block uppercase">10s Trajectory</span>
                    <span className={`text-base font-bold ${trendDirection === 'DIVERGING_UP' ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {trendDirection === 'DIVERGING_UP' ? '▲ +DRIFT' : trendDirection === 'CONVERGING_DOWN' ? '▼ -DAMP' : '► STABLE'}
                    </span>
                </div>
            </div>

            {/* Main Sparkline Canvas */}
            <div className="w-full bg-black/60 rounded p-2 border border-slate-800 relative">
                <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
                    <defs>
                        <linearGradient id="qem-full-history-gradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.45" />
                            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.02" />
                        </linearGradient>
                        <linearGradient id="qem-full-pred-gradient" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#22d3ee" />
                            <stop offset="100%" stopColor="#f59e0b" />
                        </linearGradient>
                    </defs>

                    {/* Horizontal Grid lines */}
                    {[0.25, 0.5, 0.75].map(level => (
                        <g key={level}>
                            <line 
                                x1={padding.left} 
                                y1={scaleY(level)} 
                                x2={width - padding.right} 
                                y2={scaleY(level)} 
                                stroke="#1e293b" 
                                strokeDasharray="2,2" 
                                strokeWidth="0.5" 
                            />
                            <text 
                                x={width - padding.right + 2} 
                                y={scaleY(level) + 2} 
                                fill="#475569" 
                                fontSize="6" 
                                fontFamily="monospace"
                            >
                                {level}
                            </text>
                        </g>
                    ))}

                    {/* Shaded Forecast Corridor */}
                    {prediction.length > 0 && (
                        <polygon
                            points={`
                                ${scaleXFuture(0)},${scaleY(Math.max(0, prediction[0].value - 0.05))}
                                ${scaleXFuture(prediction.length - 1)},${scaleY(Math.max(0, prediction[prediction.length - 1].value - 0.08))}
                                ${scaleXFuture(prediction.length - 1)},${scaleY(Math.min(1, prediction[prediction.length - 1].value + 0.08))}
                                ${scaleXFuture(0)},${scaleY(Math.min(1, prediction[0].value + 0.05))}
                            `}
                            fill="#f59e0b"
                            fillOpacity="0.08"
                        />
                    )}

                    {/* 60s Area & Line */}
                    <path d={historyAreaPath} fill="url(#qem-full-history-gradient)" />
                    <path d={historyPath} fill="none" stroke="#22d3ee" strokeWidth="1.5" strokeLinecap="round" />

                    {/* Current Anchor */}
                    {history.length > 0 && (
                        <circle 
                            cx={scaleXHistory(history.length - 1)} 
                            cy={scaleY(currentDecoherence)} 
                            r="3.5" 
                            fill="#38bdf8" 
                            stroke="#0369a1"
                            strokeWidth="1.5"
                            className="animate-pulse"
                        />
                    )}

                    {/* 10s Predictive Trend Line */}
                    <path 
                        d={predictionPath} 
                        fill="none" 
                        stroke="url(#qem-full-pred-gradient)" 
                        strokeWidth="1.5" 
                        strokeDasharray="4,2" 
                    />

                    {/* Real-time sync divider */}
                    <line 
                        x1={padding.left + historyWidth} 
                        y1={padding.top} 
                        x2={padding.left + historyWidth} 
                        y2={height - padding.bottom} 
                        stroke="#64748b" 
                        strokeWidth="1" 
                        strokeDasharray="2,2" 
                    />
                </svg>

                <div className="flex justify-between items-center text-[8px] font-mono text-slate-500 mt-2">
                    <span>-60 SECONDS (HISTORICAL RECORD)</span>
                    <span className="text-cyan-400 font-bold px-1.5 py-0.5 rounded bg-cyan-950/40 border border-cyan-800/40">
                        SYNCHRONOUS PRESENT
                    </span>
                    <span className="text-amber-400 font-bold">+10s PREDICTIVE VECTOR</span>
                </div>
            </div>

            <div className="mt-2.5 text-[8px] font-mono text-slate-500 flex items-center justify-between">
                <span>Drift Tolerance: &lt;0.050 Λ</span>
                <span>Collapses Prevented: {sicoCollapses || 0}</span>
                <span className="text-emerald-400">ATOMIC CORRECTION: ACTIVE</span>
            </div>
        </div>
    );
};

export default QuantumEntropyMeter;
