
import React from 'react';

export const HourglassIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
        <path d="M5 22h14"/>
        <path d="M5 2h14"/>
        <path d="M17 2v3.34a1 1 0 0 1-.5.86L12 9l-4.5-2.8a1 1 0 0 1-.5-.86V2"/>
        <path d="M7 22v-3.34a1 1 0 0 1 .5-.86L12 15l4.5 2.8a1 1 0 0 1 .5.86V22"/>
    </svg>
);
