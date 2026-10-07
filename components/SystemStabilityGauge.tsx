import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { useAppContext } from '../contexts/AppContext';
import { ShieldCheck, RefreshCw, Zap, Activity, AlertTriangle } from 'lucide-react';

interface SystemStabilityGaugeProps {
    id?: string;
    className?: string;
}

export const SystemStabilityGauge: React.FC<SystemStabilityGaugeProps> = ({ id, className = '' }) => {
    const { quantumMetrics, performRealityCorrection } = useAppContext();
    const svgRef = useRef<SVGSVGElement | null>(null);
    const previousStabilityRef = useRef<number>(95);
    const [isCalibrating, setIsCalibrating] = useState(false);
    const [simulatedDecoherence, setSimulatedDecoherence] = useState(false);
    const [lastCalibrationNotice, setLastCalibrationNotice] = useState<string | null>(null);

    // Compute composite quantum-accelerated engine stability (0 - 100)
    const { stabilityScore, isRadialPulseActive, tier, tierColor, tierBg, qubitCoherence, entropy, regime, drift } = useMemo(() => {
        const anchor = quantumMetrics?.realityAnchorStability ?? 0.99;
        const ent = quantumMetrics?.entropy ?? 0.45;
        const coherence = quantumMetrics?.qubitCoherence ?? 120.5;
        const reg = quantumMetrics?.regime ?? 'STABLE';
        const d = quantumMetrics?.drift ?? 0.001;

        // Composite stability: 70% reality anchor + 30% inverted entropy factor
        let rawScore = (anchor * 0.70 + (1 - Math.min(1, Math.max(0, ent))) * 0.30) * 100;
        
        // If simulation mode is active for testing/verification, force stability to 63.8% (< 70%)
        if (simulatedDecoherence) {
            rawScore = 63.8;
        }

        const clamped = Math.min(100, Math.max(0, rawScore));
        const isBelow70 = clamped < 70;

        let t: 'OPTIMAL' | 'DEVIATED' | 'CRITICAL' = 'OPTIMAL';
        let col = '#00f3ff'; // Default cyan
        let bgCol = 'rgba(0, 243, 255, 0.15)';

        if (clamped >= 85) {
            t = 'OPTIMAL';
            col = '#10b981'; // Emerald
            bgCol = 'rgba(16, 185, 129, 0.2)';
        } else if (clamped >= 70) {
            t = 'DEVIATED';
            col = '#f59e0b'; // Amber
            bgCol = 'rgba(245, 158, 11, 0.25)';
        } else {
            // Below 70% threshold: Activates Bright Red Critical Radial Pulse
            t = 'CRITICAL';
            col = '#ff0033'; // Bright neon red
            bgCol = 'rgba(255, 0, 51, 0.45)';
        }

        return {
            stabilityScore: clamped,
            isRadialPulseActive: isBelow70,
            tier: t,
            tierColor: col,
            tierBg: bgCol,
            qubitCoherence: simulatedDecoherence ? 74.2 : coherence,
            entropy: simulatedDecoherence ? 0.88 : ent,
            regime: simulatedDecoherence ? 'DECOHERENCE_ALERT' : reg,
            drift: simulatedDecoherence ? 0.0084 : d
        };
    }, [quantumMetrics, simulatedDecoherence]);

    // Handle Manual Calibration / Reality Re-anchoring
    const handleRecalibrate = () => {
        setIsCalibrating(true);
        setSimulatedDecoherence(false);
        if (typeof performRealityCorrection === 'function') {
            performRealityCorrection();
        }
        setLastCalibrationNotice('REALITY ANCHORED');
        setTimeout(() => {
            setIsCalibrating(false);
        }, 800);
        setTimeout(() => {
            setLastCalibrationNotice(null);
        }, 2500);
    };

    // Toggle simulation to easily verify < 70% red radial pulse
    const toggleSimulateDecoherence = () => {
        setSimulatedDecoherence(prev => !prev);
    };

    // D3 Progress Arc & Radial Ticks Render
    useEffect(() => {
        if (!svgRef.current) return;

        const svg = d3.select(svgRef.current);
        const width = 200;
        const height = 200;
        const cx = width / 2;
        const cy = height / 2;
        const innerRadius = 66;
        const outerRadius = 76;

        // Angle scale: -120° (-2π/3) to +120° (+2π/3) symmetrically matching AlphaGauge
        const minAngle = - (2 / 3) * Math.PI;
        const maxAngle = (2 / 3) * Math.PI;
        const totalAngleRange = maxAngle - minAngle;

        // Scale mapping 0-100 to radians
        const angleScale = d3.scaleLinear()
            .domain([0, 100])
            .range([minAngle, maxAngle])
            .clamp(true);

        const currentTargetAngle = angleScale(stabilityScore);
        const previousTargetAngle = angleScale(previousStabilityRef.current);

        // Arc Generator for Value Progress
        const arcGenerator = d3.arc<any>()
            .innerRadius(innerRadius)
            .outerRadius(outerRadius)
            .startAngle(minAngle)
            .cornerRadius(5);

        // Background Track Arc Generator
        const trackArcGenerator = d3.arc<any>()
            .innerRadius(innerRadius)
            .outerRadius(outerRadius)
            .startAngle(minAngle)
            .endAngle(maxAngle)
            .cornerRadius(5);

        // Ensure root group exists
        let g = svg.select<SVGGElement>('g.gauge-container');
        if (g.empty()) {
            g = svg.append('g')
                .attr('class', 'gauge-container')
                .attr('transform', `translate(${cx}, ${cy})`);

            // Defs for gradients & filters
            const defs = svg.append('defs');

            // Dynamic glow filter
            const filter = defs.append('filter')
                .attr('id', 'stability-glow')
                .attr('x', '-40%')
                .attr('y', '-40%')
                .attr('width', '180%')
                .attr('height', '180%');

            filter.append('feGaussianBlur')
                .attr('stdDeviation', '4.5')
                .attr('result', 'blur');
            filter.append('feMerge')
                .selectAll('feMergeNode')
                .data(['blur', 'SourceGraphic'])
                .enter()
                .append('feMergeNode')
                .attr('in', d => d);

            // Linear gradient for the progress arc
            const gradient = defs.append('linearGradient')
                .attr('id', 'stability-gradient')
                .attr('gradientUnits', 'userSpaceOnUse')
                .attr('x1', -outerRadius)
                .attr('y1', outerRadius)
                .attr('x2', outerRadius)
                .attr('y2', -outerRadius);

            gradient.append('stop')
                .attr('class', 'gradient-stop-1')
                .attr('offset', '0%')
                .attr('stop-color', '#00f3ff');

            gradient.append('stop')
                .attr('class', 'gradient-stop-2')
                .attr('offset', '100%')
                .attr('stop-color', tierColor);

            // Background Track Path
            g.append('path')
                .attr('class', 'gauge-track')
                .attr('d', trackArcGenerator as any)
                .attr('fill', 'none')
                .attr('stroke', 'rgba(255, 255, 255, 0.08)')
                .attr('stroke-width', '1');

            // Inner Orbit Ring (dashed)
            g.append('circle')
                .attr('class', 'inner-orbit-ring')
                .attr('r', 55)
                .attr('fill', 'none')
                .attr('stroke', 'rgba(0, 243, 255, 0.15)')
                .attr('stroke-width', '1')
                .attr('stroke-dasharray', '3, 4');

            // Quantum ticks group
            g.append('g').attr('class', 'quantum-ticks');

            // Foreground Progress Path
            g.append('path')
                .attr('class', 'gauge-progress')
                .attr('fill', 'url(#stability-gradient)')
                .style('filter', 'url(#stability-glow)');

            // Leading Edge Particle Indicator Pip
            g.append('circle')
                .attr('class', 'gauge-pip')
                .attr('r', 4.5)
                .attr('fill', '#ffffff')
                .attr('stroke', tierColor)
                .attr('stroke-width', 2)
                .style('filter', 'drop-shadow(0 0 6px #00f3ff)');
        }

        // Update gradient stop colors smoothly
        svg.select('#stability-gradient .gradient-stop-1')
            .transition()
            .duration(400)
            .attr('stop-color', isRadialPulseActive ? '#ff0055' : '#00f3ff');

        svg.select('#stability-gradient .gradient-stop-2')
            .transition()
            .duration(400)
            .attr('stop-color', tierColor);

        // Update inner ring color based on pulse status
        g.select('circle.inner-orbit-ring')
            .transition()
            .duration(400)
            .attr('stroke', isRadialPulseActive ? 'rgba(255, 0, 51, 0.4)' : 'rgba(0, 243, 255, 0.15)');

        // Update Radial Quantum Ticks (28 ticks around the arc)
        const tickCount = 28;
        const tickData = d3.range(tickCount).map(i => {
            const frac = i / (tickCount - 1);
            const tickAngle = minAngle + frac * totalAngleRange;
            const isLit = (frac * 100) <= stabilityScore;
            const isMajor = i % 7 === 0;
            return { index: i, angle: tickAngle, isLit, isMajor, frac };
        });

        const ticksGroup = g.select('g.quantum-ticks');
        const ticks = ticksGroup.selectAll<SVGLineElement, typeof tickData[0]>('line.tick-line')
            .data(tickData, d => d.index);

        ticks.enter()
            .append('line')
            .attr('class', 'tick-line')
            .merge(ticks)
            .each(function(d) {
                const tickR1 = outerRadius + 5;
                const tickR2 = outerRadius + (d.isMajor ? 11 : 7);
                const x1 = tickR1 * Math.sin(d.angle);
                const y1 = -tickR1 * Math.cos(d.angle);
                const x2 = tickR2 * Math.sin(d.angle);
                const y2 = -tickR2 * Math.cos(d.angle);

                d3.select(this)
                    .attr('x1', x1)
                    .attr('y1', y1)
                    .attr('x2', x2)
                    .attr('y2', y2)
                    .attr('stroke', d.isLit ? tierColor : 'rgba(255, 255, 255, 0.12)')
                    .attr('stroke-width', d.isMajor ? 1.5 : 1)
                    .attr('stroke-linecap', 'round')
                    .style('opacity', d.isLit ? (d.isMajor ? 1 : 0.8) : 0.25)
                    .style('filter', d.isLit ? `drop-shadow(0 0 3px ${tierColor})` : 'none');
            });

        ticks.exit().remove();

        // Animate Foreground Progress Arc using D3 Interpolate
        const progressPath = g.select<SVGPathElement>('path.gauge-progress');
        const pipCircle = g.select<SVGCircleElement>('circle.gauge-pip');

        const interpolator = d3.interpolate(previousTargetAngle, currentTargetAngle);

        progressPath.transition()
            .duration(650)
            .ease(d3.easeCubicOut)
            .attrTween('d', () => {
                return (t: number) => {
                    const interpolatedAngle = interpolator(t);
                    return arcGenerator({
                        endAngle: interpolatedAngle
                    } as any) || '';
                };
            });

        // Update leading edge pip position smoothly
        const pipMidR = (innerRadius + outerRadius) / 2;
        pipCircle.transition()
            .duration(650)
            .ease(d3.easeCubicOut)
            .attr('cx', pipMidR * Math.sin(currentTargetAngle))
            .attr('cy', -pipMidR * Math.cos(currentTargetAngle))
            .attr('stroke', tierColor)
            .style('filter', `drop-shadow(0 0 8px ${tierColor})`);

        previousStabilityRef.current = stabilityScore;
    }, [stabilityScore, tierColor, isRadialPulseActive]);

    return (
        <div 
            id={id} 
            className={`tech-panel holographic-panel p-4 flex flex-col h-full bg-black/60 relative overflow-hidden group transition-colors duration-500 ${
                isRadialPulseActive ? 'border-red-600/80 shadow-[0_0_30px_rgba(255,0,51,0.3)]' : ''
            } ${className}`}
        >
            {/* Ambient Background Glow */}
            <div 
                className={`absolute -top-10 -right-10 w-48 h-48 rounded-full blur-[55px] pointer-events-none transition-all duration-700 ${
                    isRadialPulseActive ? 'bg-red-600/40 animate-pulse' : ''
                }`}
                style={{ backgroundColor: !isRadialPulseActive ? tierBg : undefined }}
            />

            {/* Header: Title + Controls */}
            <div className="flex justify-between items-center mb-2 relative z-10">
                <div className="flex items-center gap-2">
                    <span 
                        className={`w-1.5 h-1.5 rounded-full ${isRadialPulseActive ? 'bg-red-500 animate-ping' : 'animate-ping'}`} 
                        style={{ backgroundColor: !isRadialPulseActive ? tierColor : '#ff0033' }} 
                    />
                    <h2 className="micro-label tracking-widest text-slate-200">// SYSTEM STABILITY</h2>
                </div>
                
                <div className="flex items-center gap-1.5">
                    {lastCalibrationNotice && (
                        <span className="text-[8px] font-mono font-bold text-emerald-400 tracking-wider animate-pulse">
                            {lastCalibrationNotice}
                        </span>
                    )}

                    {/* Quick Simulation Trigger for testing/verifying < 70% threshold */}
                    <button
                        onClick={toggleSimulateDecoherence}
                        title="Toggle simulated decoherence below 70% to test radial pulse"
                        className={`px-1.5 py-0.5 rounded text-[7px] font-mono font-bold tracking-wider uppercase border transition-all ${
                            simulatedDecoherence
                                ? 'bg-red-950/60 text-red-400 border-red-500 shadow-[0_0_8px_rgba(255,0,51,0.5)]'
                                : 'bg-black/40 text-slate-500 hover:text-slate-300 border-slate-800'
                        }`}
                    >
                        {simulatedDecoherence ? 'TEST <70% [ON]' : 'TEST <70%'}
                    </button>

                    <button
                        onClick={handleRecalibrate}
                        disabled={isCalibrating}
                        title="Quantum reality anchor stabilization"
                        className={`flex items-center gap-1 px-2 py-0.5 rounded text-[8px] font-bold font-mono tracking-wider uppercase border transition-all ${
                            isCalibrating 
                                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400' 
                                : isRadialPulseActive
                                    ? 'bg-red-900/40 text-red-200 border-red-500 hover:bg-red-900/60 animate-pulse shadow-[0_0_10px_rgba(255,0,51,0.4)]'
                                    : 'bg-black/40 text-slate-400 hover:text-cyan-300 hover:border-cyan-500/50 border-slate-800'
                        }`}
                    >
                        <RefreshCw className={`w-2.5 h-2.5 ${isCalibrating ? 'animate-spin text-cyan-400' : ''}`} />
                        <span>ANCHOR</span>
                    </button>
                </div>
            </div>

            {/* D3 Circular Gauge Center Visualization & Radial Pulse Layer */}
            <div className="flex-1 flex items-center justify-center relative min-h-[140px]">
                <div className="relative w-48 h-48 flex items-center justify-center">

                    {/* RADIAL PULSE ANIMATION EFFECT (Active when stability < 70%) */}
                    {isRadialPulseActive && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
                            {/* Layer 1: Expanding bright red radial pulse wave 1 */}
                            <div className="absolute w-44 h-44 rounded-full border border-red-500 animate-radial-pulse-1" />
                            {/* Layer 2: Expanding bright red radial pulse wave 2 (offset) */}
                            <div className="absolute w-44 h-44 rounded-full border border-red-500 animate-radial-pulse-2" />
                            {/* Layer 3: Expanding bright red radial pulse wave 3 (offset) */}
                            <div className="absolute w-44 h-44 rounded-full border border-red-500 animate-radial-pulse-3" />
                            
                            {/* Center bright red radial aura glow */}
                            <div 
                                className="absolute w-44 h-44 rounded-full pointer-events-none animate-radial-breathe blur-xl"
                                style={{
                                    background: 'radial-gradient(circle, rgba(255, 0, 51, 0.6) 0%, rgba(255, 0, 51, 0.25) 50%, transparent 75%)'
                                }}
                            />
                        </div>
                    )}

                    {/* Concentric rotating quantum radar ring */}
                    <div 
                        className={`absolute inset-2 rounded-full border pointer-events-none transition-colors duration-500 animate-spin ${
                            isRadialPulseActive ? 'border-red-500/30' : 'border-cyan-500/10'
                        }`} 
                        style={{ animationDuration: isRadialPulseActive ? '15s' : '40s' }} 
                    />

                    {/* D3 Target SVG */}
                    <svg
                        ref={svgRef}
                        viewBox="0 0 200 200"
                        className="w-full h-full relative z-10"
                    />

                    {/* Gauge Center Readout */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-20">
                        <div className="flex items-baseline">
                            <span 
                                className={`text-4xl md:text-5xl font-bold font-mono tracking-tight transition-all duration-300 ${
                                    isRadialPulseActive ? 'text-red-100' : 'text-slate-100'
                                }`}
                                style={{ 
                                    textShadow: isRadialPulseActive 
                                        ? '0 0 16px rgba(255, 0, 51, 0.9), 0 0 30px rgba(255, 0, 51, 0.5)'
                                        : `0 0 12px ${tierBg}`,
                                    fontVariantNumeric: 'tabular-nums' 
                                }}
                            >
                                {stabilityScore.toFixed(1)}
                            </span>
                            <span className={`text-xl md:text-2xl font-mono ml-0.5 ${isRadialPulseActive ? 'text-red-400' : 'text-slate-400'}`}>%</span>
                        </div>
                        
                        <div className="flex items-center gap-1 mt-0.5">
                            <span 
                                className={`text-[9px] font-mono font-bold tracking-widest uppercase transition-colors duration-300 ${
                                    isRadialPulseActive ? 'animate-pulse text-red-400' : ''
                                }`}
                                style={{ color: !isRadialPulseActive ? tierColor : '#ff0033' }}
                            >
                                {isRadialPulseActive ? 'CRITICAL PULSE' : (tier === 'OPTIMAL' ? 'COHERENT' : tier)}
                            </span>
                            <span className="text-slate-600 text-[8px]">·</span>
                            <span className={`text-[8px] font-mono uppercase ${isRadialPulseActive ? 'text-red-300 font-bold' : 'text-slate-400'}`}>
                                {regime}
                            </span>
                        </div>

                        {/* Critical Alert Subtext when below 70% */}
                        {isRadialPulseActive && (
                            <div className="mt-1 flex items-center gap-1 text-[8px] font-mono text-red-400 tracking-wider uppercase animate-pulse">
                                <AlertTriangle className="w-2.5 h-2.5 text-red-500" />
                                <span>&lt; 70% DECOHERENCE</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Bottom Quantum Engine Telemetry Bar (Zero-Pill Discipline) */}
            <div className={`mt-2 pt-2 border-t flex items-center justify-between text-[9px] font-mono relative z-10 tabular-nums transition-colors duration-300 ${
                isRadialPulseActive ? 'border-red-900/40 text-red-300/80' : 'border-white/5 text-slate-400'
            }`}>
                <div className="flex items-center gap-1.5" title="Qubit Coherence Time">
                    <Activity className={`w-2.5 h-2.5 ${isRadialPulseActive ? 'text-red-400' : 'text-cyan-400'}`} />
                    <span>COH: <span className={`font-semibold ${isRadialPulseActive ? 'text-red-200' : 'text-slate-200'}`}>{qubitCoherence.toFixed(1)}μs</span></span>
                </div>
                <span className="text-slate-700">·</span>
                <div className="flex items-center gap-1.5" title="Decoherence Entropy">
                    <Zap className={`w-2.5 h-2.5 ${isRadialPulseActive ? 'text-red-400' : 'text-amber-400'}`} />
                    <span>ENT: <span className={`font-semibold ${isRadialPulseActive ? 'text-red-200' : 'text-slate-200'}`}>{entropy.toFixed(3)}</span></span>
                </div>
                <span className="text-slate-700">·</span>
                <div className="flex items-center gap-1.5" title="Quantum Drift Variance">
                    <ShieldCheck className={`w-2.5 h-2.5 ${isRadialPulseActive ? 'text-red-400' : 'text-emerald-400'}`} />
                    <span>DRIFT: <span className={`font-semibold ${isRadialPulseActive ? 'text-red-200' : 'text-slate-200'}`}>{Math.abs(drift * 1000).toFixed(2)}‰</span></span>
                </div>
            </div>
        </div>
    );
};

export default React.memo(SystemStabilityGauge);
