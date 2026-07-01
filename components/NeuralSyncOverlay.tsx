import React from 'react';
import { useAppStore } from '../store/appStore';
import { motion, AnimatePresence } from 'motion/react';

export default function NeuralSyncOverlay() {
    const neuralSyncActive = useAppStore(state => state.neuralSyncActive);

    return (
        <AnimatePresence>
            {neuralSyncActive && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.05 }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
                >
                    <div className="absolute inset-0 bg-blue-900/10 mix-blend-screen" />
                    
                    {/* Pulsing Grid */}
                    <motion.div 
                        animate={{ 
                            backgroundPosition: ['0% 0%', '100% 100%'],
                            opacity: [0, 0.4, 0] 
                        }}
                        transition={{ duration: 1.5, ease: 'linear' }}
                        className="absolute inset-0 opacity-20"
                        style={{
                            backgroundImage: `radial-gradient(circle at center, rgba(56, 189, 248, 0.15) 1px, transparent 1px)`,
                            backgroundSize: '40px 40px'
                        }}
                    />

                    {/* Central Geometric Core */}
                    <div className="relative flex items-center justify-center">
                        <motion.div
                            animate={{ rotate: 180, scale: [1, 1.2, 1] }}
                            transition={{ duration: 2, ease: "easeInOut" }}
                            className="absolute h-[40vh] w-[40vh] rounded-full border border-blue-500/20"
                        />
                        <motion.div
                            animate={{ rotate: -180, scale: [1, 1.5, 1] }}
                            transition={{ duration: 1.8, ease: "easeInOut" }}
                            className="absolute h-[30vh] w-[30vh] rounded-full border border-cyan-400/30 border-dashed"
                        />
                        
                        {/* Text Status */}
                        <motion.div 
                            animate={{ opacity: [0, 1, 1, 0], y: [10, 0, 0, -10] }}
                            transition={{ duration: 2, times: [0, 0.2, 0.8, 1] }}
                            className="flex flex-col items-center justify-center bg-black/60 backdrop-blur-md px-8 py-4 rounded-xl border border-cyan-500/50 shadow-[0_0_30px_rgba(34,211,238,0.2)]"
                        >
                            <div className="flex items-center gap-3 text-cyan-400 font-mono text-sm tracking-widest uppercase">
                                <span className="relative flex h-3 w-3">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
                                </span>
                                Neural Sync
                            </div>
                            <div className="text-white text-xs mt-1 font-mono tracking-wider opacity-60">
                                Processing High-Priority Financial Data
                            </div>
                        </motion.div>
                    </div>

                    {/* Edge Vignette */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]" />
                </motion.div>
            )}
        </AnimatePresence>
    );
}
