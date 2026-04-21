import React from 'react';

interface GlitchTextProps {
    text: string;
    className?: string;
    isActive?: boolean;
}

const GlitchText: React.FC<GlitchTextProps> = ({ text, className = "", isActive = true }) => {
    if (!isActive) return <span className={className}>{text}</span>;

    return (
        <span 
            className={`glitch ${className}`} 
            data-text={text}
        >
            {text}
        </span>
    );
};

export default GlitchText;