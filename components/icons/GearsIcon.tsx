
import React from 'react';

export const GearsIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83l-2.64 2.64a2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33H9.6a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0L2.36 19.4a2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82V9.6a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83L4.93 2.36a2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33h4.8a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0l2.64 2.64a2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v4.8Z" />
    </svg>
);
