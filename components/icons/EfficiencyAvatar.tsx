
import React from 'react';

export const EfficiencyAvatar: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg 
        viewBox="0 0 40 40" 
        className="w-full h-full drop-shadow-[0_0_5px_rgba(6,182,212,0.5)]"
        {...props}
    >
        {/* Dynamic Rotor */}
        <g className="animate-spin-fast" style={{ transformOrigin: '20 20' }}>
            <circle cx="20" cy="20" r="16" fill="none" stroke="#06b6d4" strokeWidth="1" strokeDasharray="20 40" />
            <path d="M20 4 L20 10" stroke="#06b6d4" strokeWidth="3" strokeLinecap="round" />
            <path d="M20 30 L20 36" stroke="#06b6d4" strokeWidth="3" strokeLinecap="round" />
            <path d="M4 20 L10 20" stroke="#06b6d4" strokeWidth="3" strokeLinecap="round" />
            <path d="M30 20 L36 20" stroke="#06b6d4" strokeWidth="3" strokeLinecap="round" />
        </g>
        
        {/* Kinetic Core */}
        <circle cx="20" cy="20" r="4" fill="#06b6d4" />
        
        {/* Velocity Trails */}
        <path d="M10 10 L14 14" stroke="#06b6d4" strokeWidth="1" strokeDasharray="2 4" className="opacity-40" />
        <path d="M26 26 L30 30" stroke="#06b6d4" strokeWidth="1" strokeDasharray="2 4" className="opacity-40" />
    </svg>
);
