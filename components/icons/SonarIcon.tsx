import React from 'react';

export const SonarIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="24" 
        height="24" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        {...props}
    >
        <path d="M12 12a1 1 0 1 0-1-1 1 1 0 0 0 1 1Z"/>
        <path d="M17.66 17.66a8 8 0 1 0-11.32 0"/>
        <path d="M4.22 12a10.8 10.8 0 0 1 3.12-7.52"/>
    </svg>
);