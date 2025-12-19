
import React from 'react';

export const ArkAngelIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
    >
        <path d="M12 2L4 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5L12 2z" />
        <path d="M9 10.5c1.5-1 3.5-1 5 0" />
        <path d="M15 13.5c-1.5 1-3.5 1-5 0" />
    </svg>
);