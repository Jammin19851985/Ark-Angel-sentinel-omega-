
import React from 'react';
import { useAppContext } from '../contexts/AppContext';
import { LivePaperBadge } from './LivePaperBadge';

// Helper function to convert polar to Cartesian coordinates
const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
        x: centerX + (radius * Math.cos(angleInRadians)),
        y: centerY + (radius * Math.sin(angleInRadians))
    };
};

// Helper function to describe an SVG arc path
const describeArc = (x: number, y: number, radius: number, startAngle: number, endAngle: number) => {
    const start = polarToCartesian(x, y, radius, endAngle);
    const end = polarToCartesian(x, y, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    const d = [
        "M", start.x, start.y,
        "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
    ].join(" ");
    return d;
};

interface AlphaGaugeProps {
    id: string; // New: Add ID prop for tour targeting
}

const AlphaGauge: React.FC<AlphaGaugeProps> = ({ id }) => {
    const { estimatedAlpha } = useAppContext();

    const value = estimatedAlpha;
    const min = 0;
    const max = 40; // Annualized alpha goal
    const startAngle = -120;
    const endAngle = 120;
    const range = endAngle - startAngle;

    // Clamp value to be within min/max
    const clampedValue = Math.max(min, Math.min(value, max));
    const valuePercentage = (clampedValue - min) / (max - min);
    const valueAngle = startAngle + (valuePercentage * range);

    return (
        <div id={id} className="tech-panel p-4 flex flex-col h-full bg-black/60">
            <div className="flex justify-between items-center mb-3">
                <h2 className="text-sm font-bold text-amber-400 font-mono uppercase tracking-widest">// ESTIMATED ALPHA</h2>
                <LivePaperBadge />
            </div>
            <div className="flex-1 flex items-center justify-center">
                <div className="relative w-48 h-48">
                    <svg viewBox="0 0 200 200" className="w-full h-full transform -rotate-90">
                        {/* Background track */}
                        <path
                            d={describeArc(100, 100, 80, startAngle, endAngle)}
                            fill="none"
                            stroke="var(--glow-color)"
                            strokeWidth="10"
                            strokeLinecap="round"
                            className="text-amber-500/20"
                        />
                        {/* Value arc */}
                        <path
                            d={describeArc(100, 100, 80, startAngle, valueAngle)}
                            fill="none"
                            stroke="var(--glow-color)"
                            strokeWidth="10"
                            strokeLinecap="round"
                            className="text-amber-500 transition-all duration-500 ease-out"
                            style={{ filter: 'drop-shadow(0 0 3px var(--glow-color))' }}
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <div className="flex items-baseline">
                            <span className="text-5xl font-bold text-slate-100 font-mono" style={{ textShadow: '0 0 8px rgba(255,255,255,0.3)' }}>
                                {estimatedAlpha.toFixed(2)}
                            </span>
                            <span className="text-2xl text-slate-400 font-mono ml-1">%</span>
                        </div>
                        <span className="text-xs text-slate-500 font-mono mt-1">SWARM CONFIDENCE: HIGH</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default React.memo(AlphaGauge);
