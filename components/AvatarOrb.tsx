
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useAppContext } from '../contexts/AppContext';

const AvatarOrb: React.FC = () => {
    const { addLog } = useAppContext();
    const [position, setPosition] = useState({ x: window.innerWidth - 100, y: window.innerHeight - 150 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [isOpen, setIsOpen] = useState(false);

    // Prevent default browser drag image
    const handleDragStart = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        // Only start drag if left click
        if (e.button !== 0) return;
        setIsDragging(true);
        setDragOffset({
            x: e.clientX - position.x,
            y: e.clientY - position.y
        });
    };

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (isDragging) {
            setPosition({
                x: e.clientX - dragOffset.x,
                y: e.clientY - dragOffset.y
            });
        }
    }, [isDragging, dragOffset]);

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);

    useEffect(() => {
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [handleMouseMove, handleMouseUp]);

    const toggleMenu = () => {
        if (!isDragging) {
            setIsOpen(!isOpen);
            addLog('SYSTEM', isOpen ? 'Avatar Orb minimized.' : 'Avatar Orb expanded: OMEGA Interface Active.');
        }
    };

    const handleAction = (type: string, msg: string) => {
        addLog(type as any, msg);
    };

    return (
        <div 
            className="fixed z-[9999]"
            style={{ left: position.x, top: position.y, touchAction: 'none' }}
        >
            {/* The Orb */}
            <div 
                onMouseDown={handleMouseDown}
                onClick={toggleMenu}
                onDragStart={handleDragStart}
                className={`relative w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer select-none ${isOpen ? 'shadow-[0_0_30px_rgba(34,211,238,0.6)] bg-black/80 border-2 border-cyan-400' : 'shadow-[0_0_15px_rgba(34,211,238,0.3)] bg-black/50 border border-cyan-500/50 hover:scale-110'}`}
            >
                <div className={`w-8 h-8 rounded-full bg-cyan-400/20 animate-pulse ${isOpen ? 'bg-cyan-400' : ''}`} />
                
                {/* Orbiting Ring Animation */}
                <div className="absolute inset-0 rounded-full border border-cyan-500/30 animate-spin-slow pointer-events-none"></div>
            </div>

            {/* Satellites / Menu Items */}
            {isOpen && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    {/* Top Left: Trade */}
                    <button 
                        className="pointer-events-auto absolute -translate-x-12 -translate-y-12 w-12 h-12 bg-black/90 border border-green-500 rounded-full flex items-center justify-center text-[10px] font-bold font-mono text-green-400 hover:bg-green-900/50 hover:scale-110 transition-all shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                        onClick={() => handleAction('TRADE', 'ORBITAL COMMAND: EXECUTING MARKET BUY BTC')}
                    >
                        TRD
                    </button>
                    {/* Top Right: Hive */}
                    <button 
                        className="pointer-events-auto absolute translate-x-12 -translate-y-12 w-12 h-12 bg-black/90 border border-violet-500 rounded-full flex items-center justify-center text-[10px] font-bold font-mono text-violet-400 hover:bg-violet-900/50 hover:scale-110 transition-all shadow-[0_0_10px_rgba(139,92,246,0.3)]"
                        onClick={() => handleAction('SWARM', 'ORBITAL COMMAND: SWARM HEURISTICS UPDATED')}
                    >
                        HIV
                    </button>
                    {/* Bottom: Omni */}
                    <button 
                        className="pointer-events-auto absolute translate-y-16 w-12 h-12 bg-black/90 border border-amber-500 rounded-full flex items-center justify-center text-[8px] font-bold font-mono text-amber-400 hover:bg-amber-900/50 hover:scale-110 transition-all shadow-[0_0_10px_rgba(245,158,11,0.3)]"
                        onClick={() => handleAction('SYSTEM', 'ORBITAL COMMAND: OMNI-LINK ESTABLISHED')}
                    >
                        OMNI
                    </button>
                </div>
            )}
        </div>
    );
};

export default AvatarOrb;
