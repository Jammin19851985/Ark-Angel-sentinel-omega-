import React, { useEffect, useState, useRef } from 'react';
import { useAppStore } from '../store/appStore';

export const TargetingReticleCursor: React.FC = () => {
    const isSovereign = useAppStore(state => state.isSovereign);
    const isGodMode = useAppStore(state => state.isGodMode);
    
    const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: -100, y: -100 });
    const [isVisible, setIsVisible] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [isClicked, setIsClicked] = useState(false);
    const [targetLabel, setTargetLabel] = useState<string>('');

    const cursorRef = useRef<HTMLDivElement>(null);
    const posRef = useRef({ x: -100, y: -100, targetX: -100, targetY: -100 });
    const rafId = useRef<number | null>(null);

    useEffect(() => {
        // Disable on touch devices
        if (typeof window === 'undefined' || window.matchMedia('(pointer: coarse)').matches) {
            return;
        }

        const handleMouseMove = (e: MouseEvent) => {
            posRef.current.targetX = e.clientX;
            posRef.current.targetY = e.clientY;
            if (!isVisible) setIsVisible(true);

            // Check if hovering over clickable or technical element
            const target = e.target as HTMLElement | null;
            if (target) {
                const interactive = target.closest('button, a, input, select, textarea, .cyber-button, .cyber-key, [role="button"], .interactive-node');
                if (interactive) {
                    setIsHovered(true);
                    const label = interactive.getAttribute('aria-label') || interactive.getAttribute('id') || interactive.textContent?.trim().slice(0, 12) || 'NODE';
                    setTargetLabel(label.toUpperCase());
                } else {
                    const panel = target.closest('.tech-panel');
                    if (panel) {
                        setIsHovered(false);
                        setTargetLabel('SECTOR');
                    } else {
                        setIsHovered(false);
                        setTargetLabel('');
                    }
                }
            }
        };

        const handleMouseDown = () => setIsClicked(true);
        const handleMouseUp = () => setIsClicked(false);
        const handleMouseLeave = () => setIsVisible(false);
        const handleMouseEnter = () => setIsVisible(true);

        window.addEventListener('mousemove', handleMouseMove, { passive: true });
        window.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('mouseup', handleMouseUp);
        document.addEventListener('mouseleave', handleMouseLeave);
        document.addEventListener('mouseenter', handleMouseEnter);

        // Smooth Lerp loop for reticle fluid motion
        const render = () => {
            const ease = 0.35;
            posRef.current.x += (posRef.current.targetX - posRef.current.x) * ease;
            posRef.current.y += (posRef.current.targetY - posRef.current.y) * ease;

            if (cursorRef.current) {
                cursorRef.current.style.transform = `translate3d(${posRef.current.x}px, ${posRef.current.y}px, 0)`;
            }

            setMousePos({ 
                x: Math.round(posRef.current.targetX), 
                y: Math.round(posRef.current.targetY) 
            });

            rafId.current = requestAnimationFrame(render);
        };

        rafId.current = requestAnimationFrame(render);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mousedown', handleMouseDown);
            window.removeEventListener('mouseup', handleMouseUp);
            document.removeEventListener('mouseleave', handleMouseLeave);
            document.removeEventListener('mouseenter', handleMouseEnter);
            if (rafId.current) cancelAnimationFrame(rafId.current);
        };
    }, [isVisible]);

    if (!isVisible) return null;

    const themeColor = isSovereign 
        ? '#ff0055' 
        : isGodMode 
            ? '#ffd700' 
            : '#00f3ff';

    const glowColor = isSovereign 
        ? 'rgba(255, 0, 85, 0.7)' 
        : isGodMode 
            ? 'rgba(255, 215, 0, 0.7)' 
            : 'rgba(0, 243, 255, 0.6)';

    return (
        <div
            ref={cursorRef}
            className="fixed top-0 left-0 pointer-events-none z-[9999] will-change-transform select-none hidden md:block"
            style={{
                marginTop: '-24px',
                marginLeft: '-24px',
            }}
        >
            <div className={`relative w-12 h-12 flex items-center justify-center transition-transform duration-150 ${isClicked ? 'scale-75' : isHovered ? 'scale-125' : 'scale-100'}`}>
                
                {/* Outer Holographic Bracket Box */}
                <div 
                    className={`absolute inset-0 transition-all duration-200 ${isHovered ? 'rotate-45 scale-110' : 'rotate-0 scale-100'}`}
                >
                    {/* Top-Left */}
                    <div 
                        className="absolute top-0 left-0 w-2.5 h-2.5 border-t-2 border-l-2 transition-colors duration-300"
                        style={{ borderColor: themeColor, filter: `drop-shadow(0 0 4px ${glowColor})` }}
                    />
                    {/* Top-Right */}
                    <div 
                        className="absolute top-0 right-0 w-2.5 h-2.5 border-t-2 border-r-2 transition-colors duration-300"
                        style={{ borderColor: themeColor, filter: `drop-shadow(0 0 4px ${glowColor})` }}
                    />
                    {/* Bottom-Left */}
                    <div 
                        className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b-2 border-l-2 transition-colors duration-300"
                        style={{ borderColor: themeColor, filter: `drop-shadow(0 0 4px ${glowColor})` }}
                    />
                    {/* Bottom-Right */}
                    <div 
                        className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b-2 border-r-2 transition-colors duration-300"
                        style={{ borderColor: themeColor, filter: `drop-shadow(0 0 4px ${glowColor})` }}
                    />
                </div>

                {/* Rotating Inner Radar Ring */}
                <div 
                    className="absolute w-8 h-8 rounded-full border border-dashed opacity-40 animate-[spin_10s_linear_infinite]"
                    style={{ borderColor: themeColor }}
                />

                {/* Cardinal Crosshair Ticks */}
                <div className="absolute w-full h-[1px] opacity-30" style={{ backgroundColor: themeColor }} />
                <div className="absolute h-full w-[1px] opacity-30" style={{ backgroundColor: themeColor }} />

                {/* Center Lock Dot / Ring */}
                <div 
                    className="w-1.5 h-1.5 rounded-full transition-all duration-150"
                    style={{ 
                        backgroundColor: themeColor, 
                        boxShadow: `0 0 8px ${glowColor}, 0 0 16px ${glowColor}` 
                    }}
                />

                {/* Click Wave Expansion */}
                {isClicked && (
                    <div 
                        className="absolute inset-0 rounded-full animate-ping opacity-75"
                        style={{ border: `2px solid ${themeColor}` }}
                    />
                )}

                {/* Telemetry Tag Output */}
                <div 
                    className="absolute -right-24 -top-2 flex flex-col font-mono text-[8px] tracking-wider uppercase opacity-80 backdrop-blur-xs bg-black/40 px-1 py-0.5 rounded border border-white/5 whitespace-nowrap"
                    style={{ color: themeColor }}
                >
                    <span className="font-bold">
                        {targetLabel ? `TGT: ${targetLabel}` : isSovereign ? 'SV-TGT: LOCK' : 'RETICLE: 1.0'}
                    </span>
                    <span className="text-[7px] opacity-70">
                        {mousePos.x.toString().padStart(4, '0')} : {mousePos.y.toString().padStart(4, '0')}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default TargetingReticleCursor;
