
import React from 'react';

export const IntelligenceAvatar: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg 
        viewBox="0 0 40 40" 
        className="w-full h-full drop-shadow-[0_0_5px_rgba(245,158,11,0.5)]"
        {...props}
    >
        <defs>
            <radialGradient id="brain-glow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
            </radialGradient>
        </defs>
        {/* Pulsing Core */}
        <circle cx="20" cy="20" r="6" fill="url(#brain-glow)" className="animate-pulse" />
        
        {/* Neural Paths */}
        <g stroke="#f59e0b" strokeWidth="1.5" fill="none" className="opacity-60">
            <path d="M20 10 L20 14" />
            <path d="M20 26 L20 30" />
            <path d="M10 20 L14 20" />
            <path d="M26 20 L30 20" />
            <path d="M13 13 L16 16" />
            <path d="M24 24 L27 27" />
            <path d="M13 27 L16 24" />
            <path d="M24 16 L27 13" />
        </g>

        {/* Orbiting Rings */}
        <circle 
            cx="20" cy="20" r="14" 
            stroke="#f59e0b" strokeWidth="0.5" strokeDasharray="4 8" 
            fill="none" 
            className="animate-spin-slow opacity-40" 
        />
        <circle 
            cx="20" cy="20" r="18" 
            stroke="#f59e0b" strokeWidth="0.5" strokeDasharray="2 10" 
            fill="none" 
            className="animate-reverse-spin opacity-20" 
        />
    </svg>
);
