
import React from 'react';

export const DefenseAvatar: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg 
        viewBox="0 0 40 40" 
        className="w-full h-full drop-shadow-[0_0_5px_rgba(239,68,68,0.5)]"
        {...props}
    >
        {/* Hexagonal Shield Base */}
        <path 
            d="M20 4 L34 12 L34 28 L20 36 L6 28 L6 12 Z" 
            fill="rgba(127, 29, 29, 0.2)" 
            stroke="#ef4444" 
            strokeWidth="2" 
        />
        
        {/* Inner Security Core */}
        <rect x="16" y="16" width="8" height="8" fill="#ef4444" rx="1" className="animate-pulse" />
        
        {/* Scanning Beam */}
        <line x1="10" y1="12" x2="30" y2="12" stroke="#ef4444" strokeWidth="1" className="opacity-80">
            <animate 
                attributeName="y1" 
                values="12;28;12" 
                dur="2s" 
                repeatCount="indefinite" 
            />
            <animate 
                attributeName="y2" 
                values="12;28;12" 
                dur="2s" 
                repeatCount="indefinite" 
            />
        </line>
        
        {/* Hardened Corners */}
        <g stroke="#ef4444" strokeWidth="3" strokeLinecap="round">
            <path d="M20 4 L20 8" />
            <path d="M20 32 L20 36" />
        </g>
    </svg>
);
