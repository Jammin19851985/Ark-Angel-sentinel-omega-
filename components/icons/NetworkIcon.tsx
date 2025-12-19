
import React from 'react';

export const NetworkIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
        <rect x="2" y="2" width="7" height="7" rx="1"></rect>
        <rect x="15" y="2" width="7" height="7" rx="1"></rect>
        <rect x="15" y="15" width="7" height="7" rx="1"></rect>
        <rect x="2" y="15" width="7" height="7" rx="1"></rect>
        <path d="M9 5.5H15"></path>
        <path d="M18.5 9V15"></path>
        <path d="M9 18.5H15"></path>
        <path d="M5.5 9V15"></path>
    </svg>
);
