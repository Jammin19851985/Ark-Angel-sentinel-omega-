import React from 'react';

export const BatmanIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        {...props}
    >
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 15c-3.11 0-5.8-1.91-6.96-4.62h13.92C17.8 15.09 15.11 17 12 17zm-6.1-6.5c.32.74.73 1.41 1.21 2h9.78c.48-.59.89-1.26 1.21-2H5.9zM12 5c3.11 0 5.8 1.91 6.96 4.62H5.04C6.2 6.91 8.89 5 12 5z" />
    </svg>
);