
import React, { useState } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldAlertIcon } from './icons/ShieldAlertIcon';
import { ShieldCheckIcon } from './icons/ShieldCheckIcon';

const LiveModeToggle: React.FC = () => {
    const { isLiveMode, setLiveMode, addLog, addNexusLog } = useAppContext();
    const [showWarning, setShowWarning] = useState(false);

    const handleToggle = () => {
        if (!isLiveMode) {
            setShowWarning(true);
        } else {
            setLiveMode(false);
            addLog('SYSTEM', 'Switched to PAPER_TRADING mode.');
            addNexusLog('>> MODE_CHANGE: PAPER_TRADING_ACTIVE');
        }
    };

    const confirmLiveMode = () => {
        setLiveMode(true);
        setShowWarning(false);
        addLog('SYSTEM', 'CRITICAL: Switched to LIVE_TRADING mode. Real capital at risk.');
        addNexusLog('>> MODE_CHANGE: LIVE_TRADING_ACTIVE [REAL_CAPITAL_ENGAGED]');
    };

    return (
        <div className="relative flex items-center gap-3">
            <div className="flex flex-col items-end">
                <span className={`text-[8px] font-bold tracking-widest uppercase ${isLiveMode ? 'text-red-500' : 'text-emerald-500'}`}>
                    {isLiveMode ? 'LIVE_MODE' : 'PAPER_MODE'}
                </span>
                <span className="micro-label">Execution Spine</span>
            </div>
            
            <button 
                onClick={handleToggle}
                className={`relative w-12 h-6 rounded-full p-1 transition-all duration-500 ${isLiveMode ? 'bg-red-900/40 border-red-500' : 'bg-emerald-900/40 border-emerald-500'} border`}
            >
                <motion.div 
                    animate={{ x: isLiveMode ? 24 : 0 }}
                    className={`w-4 h-4 rounded-full shadow-lg ${isLiveMode ? 'bg-red-500 shadow-red-500/50' : 'bg-emerald-500 shadow-emerald-500/50'}`}
                />
            </button>

            <AnimatePresence>
                {showWarning && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="max-w-md w-full bg-[#0a0a0b] border border-red-900/50 rounded-xl p-6 shadow-[0_0_50px_rgba(239,68,68,0.2)]"
                        >
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/30">
                                    <ShieldAlertIcon className="w-6 h-6 text-red-500" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-display font-bold text-red-500 tracking-wider uppercase">Critical Warning</h2>
                                    <p className="text-[10px] text-slate-500 font-mono">SOVEREIGN_EXECUTION_MANDATE_v2.1</p>
                                </div>
                            </div>

                            <div className="space-y-4 mb-8">
                                <p className="text-sm text-slate-300 leading-relaxed">
                                    You are about to engage <span className="text-red-500 font-bold">LIVE TRADING MODE</span>. 
                                    This will connect the Archangel Omega spine directly to your broker accounts (Kraken, Coinbase, IBKR).
                                </p>
                                <div className="p-3 bg-red-950/20 border-l-2 border-red-500 text-[11px] text-red-200 font-mono space-y-2">
                                    <p>• REAL CAPITAL IS AT RISK.</p>
                                    <p>• TRADES WILL BE EXECUTED ON LIVE EXCHANGES.</p>
                                    <p>• LOSSES CAN EXCEED INITIAL DEPOSITS.</p>
                                    <p>• SYSTEM LATENCY MAY AFFECT EXECUTION PRICES.</p>
                                </div>
                                <p className="text-xs text-slate-400 italic">
                                    By confirming, you acknowledge that you are solely responsible for all financial outcomes.
                                </p>
                            </div>

                            <div className="flex gap-3">
                                <button 
                                    onClick={() => setShowWarning(false)}
                                    className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold tracking-widest uppercase rounded-lg transition-all border border-slate-800"
                                >
                                    Abort
                                </button>
                                <button 
                                    onClick={confirmLiveMode}
                                    className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white text-xs font-bold tracking-widest uppercase rounded-lg transition-all shadow-[0_0_20px_rgba(239,68,68,0.4)]"
                                >
                                    Confirm Live Mode
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default LiveModeToggle;
