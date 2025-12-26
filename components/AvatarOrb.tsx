
import React from 'react';
import { motion } from 'framer-motion';

const AvatarOrb: React.FC = () => {
  // Generate array for mechanical feathers to create density
  const feathers = Array.from({ length: 12 });

  return (
    <div className="absolute top-2 right-2 z-50 w-64 h-64 pointer-events-none perspective-1000">
      <motion.div
        className="relative w-full h-full flex items-center justify-center"
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        <svg width="100%" height="100%" viewBox="0 0 400 400" className="overflow-visible">
          <defs>
            {/* 1. CHROME METAL GRADIENT (High Contrast for Shine) */}
            <linearGradient id="chromeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
              <stop offset="20%" stopColor="#cbd5e1" />
              <stop offset="45%" stopColor="#475569" />
              <stop offset="50%" stopColor="#0f172a" /> {/* Hard reflection line */}
              <stop offset="55%" stopColor="#475569" />
              <stop offset="80%" stopColor="#94a3b8" />
              <stop offset="100%" stopColor="#e2e8f0" />
            </linearGradient>

            {/* 2. BLACK LEATHER GRADIENT (Matte, Dark) */}
            <linearGradient id="leatherGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#222" />
              <stop offset="100%" stopColor="#050505" />
            </linearGradient>

            {/* 3. ARC REACTOR GLOW */}
            <filter id="neonGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* 4. METALLIC SPECULAR LIGHTING (3D Effect) */}
            <filter id="metalBump">
              <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="blur"/>
              <feSpecularLighting in="blur" surfaceScale="5" specularConstant="1" specularExponent="20" lightingColor="#white" result="specOut">
                <fePointLight x="-5000" y="-10000" z="20000"/>
              </feSpecularLighting>
              <feComposite in="specOut" in2="SourceAlpha" operator="in" result="specOut"/>
              <feComposite in="SourceGraphic" in2="specOut" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" result="litPaint"/>
            </filter>
          </defs>

          {/* --- HUD RINGS (Iron Man Interface Style) --- */}
          <motion.g
             style={{ transformOrigin: "200px 200px" }}
             animate={{ rotate: 360 }}
             transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          >
            <circle cx="200" cy="200" r="140" fill="none" stroke="#06b6d4" strokeWidth="1" strokeDasharray="20 40" opacity="0.3" />
            <circle cx="200" cy="200" r="135" fill="none" stroke="#06b6d4" strokeWidth="0.5" strokeDasharray="100 100" opacity="0.2" />
          </motion.g>
          
          <motion.g
             style={{ transformOrigin: "200px 200px" }}
             animate={{ rotate: -360 }}
             transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          >
             <path d="M 200 40 L 200 60" stroke="#06b6d4" strokeWidth="2" opacity="0.5" />
             <path d="M 200 340 L 200 360" stroke="#06b6d4" strokeWidth="2" opacity="0.5" />
             <path d="M 40 200 L 60 200" stroke="#06b6d4" strokeWidth="2" opacity="0.5" />
             <path d="M 340 200 L 360 200" stroke="#06b6d4" strokeWidth="2" opacity="0.5" />
             <circle cx="200" cy="200" r="160" fill="none" stroke="#06b6d4" strokeWidth="1" strokeDasharray="4 8" opacity="0.15" />
          </motion.g>

          {/* --- LEFT WING (Layered Mechanical Feathers) --- */}
          <motion.g 
            transform="translate(200, 200) scale(-1, 1) translate(-200, -200)"
            initial={{ rotate: -5 }}
            animate={{ rotate: 0 }}
            transition={{ duration: 4, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
          >
            {feathers.map((_, i) => (
              <motion.path
                key={`l-feather-${i}`}
                d={`M 220 ${180 + i * 8} Q 320 ${140 + i * 15} 380 ${100 + i * 20} L 360 ${120 + i * 20} Q 300 ${160 + i * 15} 240 ${200 + i * 8} Z`}
                fill="url(#chromeGradient)"
                stroke="#000"
                strokeWidth="0.5"
                filter="url(#metalBump)"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              />
            ))}
            {/* Leather Covert (Top of Wing) */}
            <path 
              d="M 220 180 Q 280 160 320 140 Q 280 200 240 220 Z" 
              fill="url(#leatherGradient)" 
              stroke="#333" 
              strokeWidth="1"
            />
          </motion.g>

          {/* --- RIGHT WING (Layered Mechanical Feathers) --- */}
          <motion.g
            initial={{ rotate: 5 }}
            animate={{ rotate: 0 }}
            transition={{ duration: 4, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
          >
            {feathers.map((_, i) => (
              <motion.path
                key={`r-feather-${i}`}
                d={`M 220 ${180 + i * 8} Q 320 ${140 + i * 15} 380 ${100 + i * 20} L 360 ${120 + i * 20} Q 300 ${160 + i * 15} 240 ${200 + i * 8} Z`}
                fill="url(#chromeGradient)"
                stroke="#000"
                strokeWidth="0.5"
                filter="url(#metalBump)"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              />
            ))}
            {/* Leather Covert */}
            <path 
              d="M 220 180 Q 280 160 320 140 Q 280 200 240 220 Z" 
              fill="url(#leatherGradient)" 
              stroke="#333" 
              strokeWidth="1"
            />
          </motion.g>

          {/* --- ARCHANGEL BODY (Mech Armor) --- */}
          <g filter="url(#metalBump)">
            {/* Shoulders */}
            <path d="M 160 180 L 240 180 L 250 210 L 150 210 Z" fill="url(#chromeGradient)" stroke="#0f172a" strokeWidth="2" />
            {/* Chest Plate */}
            <path d="M 170 210 L 230 210 L 200 280 Z" fill="#1e293b" stroke="url(#chromeGradient)" strokeWidth="2" />
            {/* Head/Helmet */}
            <path d="M 180 180 L 180 140 L 220 140 L 220 180 L 200 195 Z" fill="url(#chromeGradient)" stroke="#000" strokeWidth="1" />
          </g>

          {/* --- THE CORE (Iron Man / Arc Reactor Style) --- */}
          <g filter="url(#neonGlow)">
            {/* Chest Light */}
            <circle cx="200" cy="230" r="8" fill="#22d3ee" fillOpacity="0.8">
              <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite" />
            </circle>
            {/* Visor Light */}
            <path d="M 185 160 L 215 160 L 215 165 L 185 165 Z" fill="#22d3ee" />
          </g>

          {/* --- DATA STREAM PARTICLES (Holographic effect) --- */}
          <motion.circle 
            cx="200" cy="200" r="190" 
            stroke="url(#chromeGradient)" strokeWidth="0.5" fill="none" opacity="0.1"
            animate={{ scale: [0.9, 1.1, 0.9], opacity: [0.1, 0.3, 0.1] }}
            transition={{ duration: 4, repeat: Infinity }}
          />

        </svg>
      </motion.div>
    </div>
  );
};

export default AvatarOrb;
