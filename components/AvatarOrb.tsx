import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { useAppContext } from '../contexts/AppContext';

const AvatarOrb: React.FC = () => {
  const { killSwitchActive, isGodMode, systemStatus } = useAppContext();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = Math.min(1, Math.max(-1, (e.clientX - window.innerWidth / 2) / (window.innerWidth / 3)));
      const y = Math.min(1, Math.max(-1, (e.clientY - window.innerHeight / 2) / (window.innerHeight / 3)));
      setMousePos({ x, y });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const getColors = () => {
      if (killSwitchActive) {
          return { primary: '#ef4444', secondary: '#7f1d1d', glow: '#b91c1c', eye: '#ff0000' };
      }
      if (isGodMode) {
          return { primary: '#fbbf24', secondary: '#78350f', glow: '#d97706', eye: '#fffbeb' };
      }
      return { primary: '#06b6d4', secondary: '#164e63', glow: '#0891b2', eye: '#22d3ee' };
  };

  const colors = getColors();

  return (
    <div className="w-[400px] h-[400px] pointer-events-none select-none relative z-0">
      <motion.div
        className="relative w-full h-full flex items-center justify-center"
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        <svg width="100%" height="100%" viewBox="0 0 400 400" className="overflow-visible drop-shadow-[0_0_30px_rgba(0,0,0,0.8)]">
          <defs>
            <filter id="avatar-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            
            <linearGradient id="metal-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#334155" />
              <stop offset="50%" stopColor="#0f172a" />
              <stop offset="100%" stopColor="#020617" />
            </linearGradient>

            <radialGradient id="eye-glow-grad">
              <stop offset="0%" stopColor={colors.eye} stopOpacity="1" />
              <stop offset="100%" stopColor={colors.primary} stopOpacity="0" />
            </radialGradient>
          </defs>

          <motion.g 
            style={{ transformOrigin: "200px 200px" }}
            animate={{ rotate: 360 }} 
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            opacity="0.4"
          >
            <circle cx="200" cy="200" r="180" fill="none" stroke={colors.primary} strokeWidth="1" strokeDasharray="10 20" />
            <circle cx="200" cy="200" r="170" fill="none" stroke={colors.secondary} strokeWidth="4" strokeDasharray="40 80" strokeOpacity="0.5" />
            <path d="M 200 20 L 200 40 M 200 360 L 200 380 M 20 200 L 40 200 M 360 200 L 380 200" stroke={colors.primary} strokeWidth="2" />
          </motion.g>

          <motion.g
             style={{ transformOrigin: "200px 200px" }}
             animate={{ rotate: -360 }} 
             transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
             opacity="0.2"
          >
             <circle cx="200" cy="200" r="150" fill="none" stroke={colors.primary} strokeWidth="1" strokeDasharray="2 10" />
          </motion.g>

          <path d="M 170 300 L 170 350 L 230 350 L 230 300 Z" fill="#0f172a" stroke="#1e293b" strokeWidth="2" />
          <path d="M 180 300 L 180 350 M 190 300 L 190 350 M 200 300 L 200 350 M 210 300 L 210 350 M 220 300 L 220 350" stroke="#1e293b" strokeWidth="2" />

          <path 
            d="M 130 100 L 270 100 L 290 160 L 280 240 L 240 290 L 160 290 L 120 240 L 110 160 Z" 
            fill="url(#metal-grad)" 
            stroke={colors.secondary} 
            strokeWidth="2"
          />
          <path d="M 130 100 L 270 100 L 260 140 L 140 140 Z" fill="#1e293b" stroke={colors.primary} strokeWidth="1" strokeOpacity="0.5" />
          <path d="M 120 200 L 140 200 L 140 240 L 125 230 Z" fill="#020617" stroke={colors.primary} strokeWidth="1" />
          <path d="M 280 200 L 260 200 L 260 240 L 275 230 Z" fill="#020617" stroke={colors.primary} strokeWidth="1" />

          <path d="M 145 160 L 190 160 L 185 190 L 145 185 Z" fill="#000" stroke={colors.primary} strokeWidth="1" />
          <path d="M 210 160 L 255 160 L 255 185 L 215 190 Z" fill="#000" stroke={colors.primary} strokeWidth="1" />

          <motion.g 
            animate={{ 
                x: mousePos.x * 12,
                y: mousePos.y * 8 
            }}
            transition={{ type: "spring", stiffness: 100, damping: 15, mass: 0.1 }}
          >
            <circle cx="165" cy="175" r="5" fill="#fff" filter="url(#avatar-glow)" />
            <circle cx="165" cy="175" r="2" fill={colors.eye} />
            <circle cx="235" cy="175" r="5" fill="#fff" filter="url(#avatar-glow)" />
            <circle cx="235" cy="175" r="2" fill={colors.eye} />
          </motion.g>

          <path d="M 170 260 L 230 260 L 225 280 L 175 280 Z" fill="#000" stroke={colors.secondary} strokeWidth="1" />
          
          {(systemStatus === 'EXECUTING' || systemStatus === 'RUNNING' || systemStatus.includes('LIVE')) && (
             <motion.g>
                <motion.path 
                    d="M 175 270 L 225 270" 
                    stroke={colors.primary} 
                    strokeWidth="3" 
                    strokeLinecap="round"
                    animate={{ strokeWidth: [1, 4, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 0.2, repeat: Infinity }}
                />
                
                <path d="M 150 280 L 100 380 L 300 380 L 250 280 Z" fill={`url(#metal-grad)`} opacity="0.1" />
                <text x="200" y="360" textAnchor="middle" fill={colors.primary} fontSize="10" fontFamily="monospace" letterSpacing="4px" opacity="0.8">
                    {isGodMode ? 'RESONATING...' : 'PROCESSING...'}
                </text>
             </motion.g>
          )}

          <motion.rect 
            x="190" y="110" width="20" height="4" fill={colors.primary} 
            animate={{ opacity: [0.2, 1, 0.2] }} 
            transition={{ duration: 2, repeat: Infinity }}
          />
          
          <path d="M 80 100 L 60 120 M 80 110 L 60 130" stroke={colors.primary} strokeWidth="1" opacity="0.3" />
          <path d="M 320 100 L 340 120 M 320 110 L 340 130" stroke={colors.primary} strokeWidth="1" opacity="0.3" />

        </svg>

        <div className="absolute -bottom-10 flex flex-col items-center">
            <div className="h-8 w-[1px] bg-gradient-to-b from-cyan-500/50 to-transparent mb-2"></div>
            <div className={`px-4 py-1 rounded-sm border backdrop-blur-md transition-colors duration-500 ${killSwitchActive ? 'bg-red-950/50 border-red-500 text-red-400' : 'bg-black/60 border-cyan-500/30 text-cyan-400'}`}>
                <span className="text-[10px] font-mono tracking-[0.3em] font-bold uppercase shadow-glow">
                    {isGodMode ? 'PETE_THE_RACCOON' : 'SENTINEL_MK1'}
                </span>
            </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AvatarOrb;