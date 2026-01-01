
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAppContext } from '../contexts/AppContext';

const AvatarOrb: React.FC = () => {
  const { killSwitchActive, isGodMode, systemStatus } = useAppContext();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Eye Tracking Logic
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Normalize coordinates -1 to 1
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      setMousePos({ x, y });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Determine Core Color
  const coreColor = killSwitchActive ? '#ef4444' : isGodMode ? '#f59e0b' : '#06b6d4';
  const pupilSize = systemStatus === 'EXECUTING' ? 30 : 20;

  return (
    <div className="w-32 h-32 pointer-events-none perspective-1000 select-none">
      <motion.div
        className="relative w-full h-full flex items-center justify-center"
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        <svg width="100%" height="100%" viewBox="0 0 200 200" className="overflow-visible">
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="4" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <radialGradient id="irisGradient">
              <stop offset="10%" stopColor="#fff" />
              <stop offset="40%" stopColor={coreColor} />
              <stop offset="90%" stopColor="#000" />
            </radialGradient>
          </defs>

          {/* --- OUTER MECHANICAL SHELL (Static or Slow Rotation) --- */}
          <motion.g animate={{ rotate: 360 }} transition={{ duration: 60, repeat: Infinity, ease: "linear" }}>
            <circle cx="100" cy="100" r="95" fill="none" stroke="#334155" strokeWidth="1" strokeDasharray="10 5" opacity="0.5" />
            <path d="M 100 5 L 100 15 M 100 185 L 100 195 M 5 100 L 15 100 M 185 100 L 195 100" stroke={coreColor} strokeWidth="2" />
          </motion.g>

          {/* --- INNER MECHANISM (Counter Rotation) --- */}
          <motion.g animate={{ rotate: -360 }} transition={{ duration: 40, repeat: Infinity, ease: "linear" }}>
            <circle cx="100" cy="100" r="85" fill="none" stroke="#475569" strokeWidth="4" strokeDasharray="40 120" opacity="0.8" />
          </motion.g>

          {/* --- THE EYE (Iris & Pupil Tracking) --- */}
          <motion.g 
            style={{ translateX: mousePos.x * 15, translateY: mousePos.y * 15 }}
          >
            {/* Sclera/Socket Background */}
            <circle cx="100" cy="100" r="70" fill="#0f172a" stroke={coreColor} strokeWidth="1" strokeOpacity="0.3" />
            
            {/* Iris */}
            <motion.circle 
              cx="100" cy="100" r="45" 
              fill="url(#irisGradient)" 
              filter="url(#glow)"
              animate={{ opacity: [0.8, 1, 0.8] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
            
            {/* Pupil (Dilates based on status) */}
            <motion.circle 
              cx="100" cy="100" 
              animate={{ r: pupilSize }}
              transition={{ duration: 0.5 }}
              fill="#000" 
            />
            
            {/* Specular Highlight */}
            <circle cx="85" cy="85" r="5" fill="#fff" opacity="0.8" />
          </motion.g>

          {/* --- EYELIDS / SHUTTER (Blinking) --- */}
          {/* Upper Lid */}
          <motion.path
            d="M 20 100 Q 100 20 180 100"
            fill="#0f172a"
            stroke="#334155"
            strokeWidth="2"
            animate={{ d: ["M 20 100 Q 100 20 180 100", "M 20 100 Q 100 100 180 100", "M 20 100 Q 100 20 180 100"] }}
            transition={{ duration: 0.2, repeat: Infinity, repeatDelay: 4 }}
          />
          {/* Lower Lid */}
          <motion.path
            d="M 20 100 Q 100 180 180 100"
            fill="#0f172a"
            stroke="#334155"
            strokeWidth="2"
            animate={{ d: ["M 20 100 Q 100 180 180 100", "M 20 100 Q 100 100 180 100", "M 20 100 Q 100 180 180 100"] }}
            transition={{ duration: 0.2, repeat: Infinity, repeatDelay: 4 }}
          />

        </svg>
        
        {/* Status Text under Eye */}
        <div className="absolute -bottom-8 w-full text-center">
            <span className="text-[10px] font-mono tracking-widest uppercase" style={{ color: coreColor }}>
                {systemStatus}
            </span>
        </div>
      </motion.div>
    </div>
  );
};

export default AvatarOrb;
