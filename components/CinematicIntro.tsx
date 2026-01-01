
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArkAngelIcon } from './icons/ArkAngelIcon';

interface CinematicIntroProps {
    onComplete: () => void;
}

const SEQUENCE_TEXTS = [
    "INITIALIZING MAJORANA QUBIT CORE...",
    "ESTABLISHING TEMPORAL ANCHORS...",
    "CALIBRATING FSF (FINANCIAL STATE FUZZINESS)...",
    "COMPILING OMEGA PROTOCOLS...",
    "CONNECTING TO $G_PI-FINANCE...",
    "WAKING THE ARCHITECT..."
];

const CinematicIntro: React.FC<CinematicIntroProps> = ({ onComplete }) => {
    const [step, setStep] = useState(0);
    const [textIndex, setTextIndex] = useState(0);

    useEffect(() => {
        // Text Sequence
        const textInterval = setInterval(() => {
            setTextIndex(prev => {
                if (prev < SEQUENCE_TEXTS.length - 1) return prev + 1;
                return prev;
            });
        }, 800);

        // Phase Transitions
        const sequence = async () => {
            await new Promise(r => setTimeout(r, 5000)); // Text phase
            setStep(1); // Implosion
            await new Promise(r => setTimeout(r, 1000)); // Expansion
            setStep(2); // Reveal
            await new Promise(r => setTimeout(r, 2000)); // Hold
            setStep(3); // Fade out
            await new Promise(r => setTimeout(r, 1000)); // Done
            onComplete();
        };

        sequence();

        return () => clearInterval(textInterval);
    }, [onComplete]);

    return (
        <div className="fixed inset-0 z-[99999] bg-black flex items-center justify-center overflow-hidden font-mono">
            <AnimatePresence>
                {step === 0 && (
                    <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        exit={{ opacity: 0, scale: 0.1, filter: "blur(20px)" }}
                        className="text-center relative z-10"
                    >
                        <div className="w-32 h-32 mx-auto mb-8 relative">
                            <motion.div 
                                className="absolute inset-0 border-t-2 border-cyan-500 rounded-full"
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            />
                            <motion.div 
                                className="absolute inset-2 border-r-2 border-amber-500 rounded-full"
                                animate={{ rotate: -360 }}
                                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                            />
                            <motion.div 
                                className="absolute inset-4 border-b-2 border-purple-500 rounded-full"
                                animate={{ rotate: 180 }}
                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-2xl font-bold text-white animate-pulse">Ω</span>
                            </div>
                        </div>
                        <motion.p 
                            key={textIndex}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-cyan-400 text-sm tracking-[0.3em] font-bold"
                        >
                            {SEQUENCE_TEXTS[textIndex]}
                        </motion.p>
                        <div className="mt-4 w-64 h-1 bg-slate-900 mx-auto rounded overflow-hidden">
                            <motion.div 
                                className="h-full bg-gradient-to-r from-cyan-500 via-amber-500 to-purple-500"
                                initial={{ width: "0%" }}
                                animate={{ width: "100%" }}
                                transition={{ duration: 4.5, ease: "easeInOut" }}
                            />
                        </div>
                    </motion.div>
                )}

                {step === 2 && (
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 20, opacity: 0 }}
                        transition={{ duration: 1.5, ease: "circOut" }}
                        className="relative z-20 flex flex-col items-center"
                    >
                        <motion.div
                            initial={{ filter: "blur(20px)" }}
                            animate={{ filter: "blur(0px)" }}
                            transition={{ duration: 1 }}
                        >
                            <ArkAngelIcon className="w-48 h-48 text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.8)]" />
                        </motion.div>
                        <motion.h1 
                            className="text-6xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400 mt-8 tracking-[0.2em] uppercase"
                            initial={{ letterSpacing: "1em", opacity: 0 }}
                            animate={{ letterSpacing: "0.2em", opacity: 1 }}
                            transition={{ duration: 1.5 }}
                        >
                            ARCHANGEL
                        </motion.h1>
                        <motion.p
                            className="text-amber-500 font-mono text-sm tracking-[0.5em] mt-2 uppercase"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1, duration: 1 }}
                        >
                            System Online
                        </motion.p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Background Effects */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900 via-black to-black opacity-95" />
            <div className="absolute inset-0 pointer-events-none opacity-20" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/stardust.png")' }}></div>
        </div>
    );
};

export default CinematicIntro;
