
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { motion, AnimatePresence } from 'motion/react';
import { ActivityIcon } from './icons/ActivityIcon';
import { Shield, Zap, RefreshCw, Play, DollarSign, ArrowUpRight, ArrowDownLeft, Lock } from 'lucide-react';

export const SovereignCommandCenter: React.FC = () => {
    const { 
        executeAllProtocols, systemStatus, 
        payPalReserves, ppCheckReserves, ppInitiateDeposit, ppInitiateWithdrawal,
        killSwitchActive, triggerKillSwitch,
        sicoConfig, quantumMetrics, coreState, addLog
    } = useAppContext();

    const [showPayPalModal, setShowPayPalModal] = useState(false);
    const [ppAction, setPpAction] = useState<'DEPOSIT' | 'WITHDRAW'>('DEPOSIT');
    const [amount, setAmount] = useState('100');
    const [email, setEmail] = useState('ark@vault.sovereign');
    const [tradeConfirmState, setTradeConfirmState] = useState<'IDLE' | 'CONFIRMING' | 'EXECUTED'>('IDLE');

    const handleManualTrade = () => {
        if (tradeConfirmState === 'IDLE') {
            setTradeConfirmState('CONFIRMING');
            // Auto reset if not confirmed within 3 seconds
            setTimeout(() => {
                setTradeConfirmState(prev => prev === 'CONFIRMING' ? 'IDLE' : prev);
            }, 3000);
        } else if (tradeConfirmState === 'CONFIRMING') {
            setTradeConfirmState('EXECUTED');
            addLog('TRADE', 'MANUAL SCALP OVERRIDE EXECUTED');
            // Reset after execution
            setTimeout(() => setTradeConfirmState('IDLE'), 2000);
        }
    };

    const handlePayPalSubmit = () => {
        const val = parseFloat(amount);
        if (isNaN(val)) return;
        if (ppAction === 'DEPOSIT') {
            ppInitiateDeposit(val);
        } else {
            ppInitiateWithdrawal(email, val);
        }
        setShowPayPalModal(false);
    };

    const handleSaveConfig = async () => {
        try {
            addLog('SYSTEM', 'PERSISTING CONFIGURATION TO SOVEREIGN LEDGER...');
            const res = await fetch('/spine-bridge/system/save-config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sico: sicoConfig,
                    quantum: quantumMetrics,
                    core: coreState
                })
            });
            const data = await res.json();
            addLog('SYSTEM', `CONFIG_SAVED: ${new Date(data.timestamp).toLocaleTimeString()}`);
        } catch (e: any) {
            addLog('ERROR', `SAVE_FAILED: ${e.message}`);
        }
    };

    const [health, setHealth] = useState<{ status: string; integrity: string } | null>(null);

    const checkHealth = async () => {
        try {
            const res = await fetch('/spine-bridge/health');
            const data = await res.json();
            setHealth(data);
        } catch {
            setHealth({ status: 'OFFLINE', integrity: '0%' });
        }
    };

    useEffect(() => {
        checkHealth();
        const interval = setInterval(checkHealth, 30000);
        return () => clearInterval(interval);
    }, []);

    const [pulseValue, setPulseValue] = useState(0);

    useEffect(() => {
        if (systemStatus === 'OPERATIONAL') {
            setPulseValue(Math.floor(Math.random() * 40) + 60);
            const interval = setInterval(() => {
                setPulseValue(Math.floor(Math.random() * 40) + 60);
            }, 2000);
            return () => clearInterval(interval);
        } else {
            setPulseValue(0);
        }
    }, [systemStatus]);

    return (
        <div className="bg-black/60 border border-slate-800 rounded-sm p-4 font-mono flex flex-col space-y-4 relative overflow-hidden group hover:border-cyan-500/30 transition-colors duration-500 shadow-2xl">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-cyan-500/10 animate-scan pointer-events-none" />
            
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <div className="flex flex-col">
                    <h3 className="text-base font-bold text-cyan-500 uppercase tracking-widest flex items-center gap-2">
                        <div className="relative flex h-2 w-2 items-center justify-center">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-cyan-500"></span>
                        </div>
                        <div className="w-2.5 h-2.5 border-2 border-cyan-500 rounded-full"></div>
                        SOVEREIGN_COMMAND_CENTER
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[7px] text-slate-600 font-bold tracking-tighter uppercase">Spine Integrity:</span>
                        <span className={`text-[8px] font-bold tracking-widest ${!health || health.status === 'OPERATIONAL' ? 'text-emerald-500' : 'text-red-500'}`}>
                            {health?.integrity || 'SYNCING...'}
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2" title="Execution Pulse">
                        <span className="text-[7px] text-slate-500 uppercase tracking-widest font-bold hidden sm:inline-block">Pulse</span>
                        <div className="relative w-4 h-4 rounded-full flex items-center justify-center overflow-hidden">
                            <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                                <path
                                    className="text-slate-800/80"
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="6"
                                />
                                <path
                                    className="text-cyan-500 transition-all duration-1000 ease-out"
                                    strokeDasharray={`${pulseValue}, 100`}
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="6"
                                />
                            </svg>
                            <div className={`absolute inset-1 rounded-full ${systemStatus === 'OPERATIONAL' ? 'bg-cyan-500/20 animate-pulse' : 'bg-slate-800'}`}></div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={handleSaveConfig}
                            className="p-1 hover:bg-white/5 rounded transition-colors text-slate-500 hover:text-cyan-400"
                            title="Save Configuration"
                        >
                            <RefreshCw className="w-3 h-3" />
                        </button>
                        <span className={`text-[8px] font-bold px-2 py-0.5 rounded border ${systemStatus === 'OPERATIONAL' ? 'border-emerald-900 text-emerald-500 bg-emerald-950/20' : 'border-amber-900 text-amber-500 bg-amber-950/20 animate-pulse'}`}>
                            {systemStatus}
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-3">
                {/* Global Execution */}
                <button 
                    onClick={executeAllProtocols}
                    disabled={systemStatus !== 'OPERATIONAL' || killSwitchActive}
                    className="flex items-center justify-center gap-3 bg-cyan-950/20 border border-cyan-900/50 hover:bg-cyan-500 hover:text-black transition-all p-3 rounded group/btn disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Zap className={`w-4 h-4 ${systemStatus === 'UPGRADING' ? 'animate-spin' : 'group-hover/btn:animate-pulse'}`} />
                    <div className="flex flex-col items-start">
                        <span className="text-[10px] font-bold uppercase tracking-widest">Execute All Protocols</span>
                        <span className="text-[7px] opacity-70 uppercase">Upgrade & Launch Sequence</span>
                    </div>
                </button>

                {/* Manual Trade */}
                <button 
                    onClick={handleManualTrade}
                    disabled={killSwitchActive}
                    className={`flex items-center justify-center gap-3 border transition-all p-3 rounded group/btn disabled:opacity-50 disabled:cursor-not-allowed ${
                        tradeConfirmState === 'EXECUTED' 
                            ? 'bg-neon-green/20 border-neon-green/50 text-neon-green'
                            : tradeConfirmState === 'CONFIRMING'
                                ? 'bg-amber-950/40 border-amber-500 text-amber-500 animate-pulse'
                                : 'bg-slate-900/50 border-slate-700 text-slate-400 hover:bg-white/5 hover:text-white hover:border-slate-500'
                    }`}
                >
                    <ActivityIcon className={`w-4 h-4 ${tradeConfirmState === 'CONFIRMING' ? 'animate-bounce' : ''}`} />
                    <div className="flex flex-col items-start">
                        <span className="text-[10px] font-bold uppercase tracking-widest">
                            {tradeConfirmState === 'EXECUTED' ? 'TRADE EXECUTED' : tradeConfirmState === 'CONFIRMING' ? 'CONFIRM TRADE?' : 'MANUAL SCALP'}
                        </span>
                        <span className="text-[7px] opacity-70 uppercase">
                            {tradeConfirmState === 'EXECUTED' ? 'SUCCESS' : tradeConfirmState === 'CONFIRMING' ? 'CLICK AGAIN TO EXECUTE' : 'FORCE EXECUTION'}
                        </span>
                    </div>
                </button>

                {/* Kill Switch */}
                <button 
                    onClick={triggerKillSwitch}
                    className={`flex items-center justify-center gap-3 border transition-all p-3 rounded group/btn ${killSwitchActive ? 'bg-emerald-950/20 border-emerald-900/50 text-emerald-500 hover:bg-emerald-500 hover:text-black' : 'bg-red-950/20 border-red-900/50 text-red-500 hover:bg-red-500 hover:text-black'}`}
                >
                    <Lock className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                    <div className="flex flex-col items-start">
                        <span className="text-[10px] font-bold uppercase tracking-widest">{killSwitchActive ? 'Disengage Kill Switch' : 'Emergency Kill Switch'}</span>
                        <span className="text-[7px] opacity-70 uppercase">{killSwitchActive ? 'Resume Operations' : 'Halt All Execution'}</span>
                    </div>
                </button>
            </div>

            {/* PayPal Section */}
            <div className="border border-slate-800/50 rounded p-4 space-y-4">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-blue-400" />
                        <span className="text-[10px] font-bold text-blue-300 uppercase tracking-widest">PayPal Reserves</span>
                    </div>
                    <button onClick={ppCheckReserves} className="p-1 hover:bg-white/5 rounded transition-colors">
                        <RefreshCw className="w-3 h-3 text-slate-600 hover:text-cyan-500" />
                    </button>
                </div>
                
                <div className="flex items-end justify-between">
                    <div className="flex flex-col">
                        <span className="text-2xl font-mono font-bold text-white tracking-tighter">
                            ${payPalReserves.totalUSD.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                        </span>
                        <span className="text-[8px] text-slate-500 font-bold uppercase mt-1">Status: {payPalReserves.status}</span>
                    </div>
                    <div className="flex gap-2">
                        <button 
                            onClick={() => { setPpAction('DEPOSIT'); setShowPayPalModal(true); }}
                            className="flex items-center gap-2 px-4 py-2 bg-transparent border border-blue-500/50 text-blue-400 text-[10px] font-bold rounded hover:bg-blue-500/10 transition-all uppercase"
                        >
                            <ArrowDownLeft className="w-3 h-3" /> DEPOSIT
                        </button>
                        <button 
                            onClick={() => { setPpAction('WITHDRAW'); setShowPayPalModal(true); }}
                            className="flex items-center gap-2 px-4 py-2 bg-transparent border border-slate-700 text-slate-500 text-[10px] font-bold rounded hover:bg-slate-800 transition-all uppercase"
                        >
                            <ArrowUpRight className="w-3 h-3" /> WITHDRAW
                        </button>
                    </div>
                </div>
            </div>

            {/* PayPal Modal */}
            <AnimatePresence>
                {showPayPalModal && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
                    >
                        <div className="w-full space-y-4">
                            <div className="flex justify-between items-center border-b border-white/10 pb-2">
                                <span className="text-[10px] font-bold text-cyan-500 uppercase tracking-widest">
                                    PayPal {ppAction}
                                </span>
                                <button onClick={() => setShowPayPalModal(false)} className="text-slate-500 hover:text-white">×</button>
                            </div>
                            
                            <div className="space-y-3">
                                <div className="space-y-1">
                                    <label className="text-[8px] text-slate-500 uppercase font-bold">Amount (USD)</label>
                                    <input 
                                        type="number" 
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        className="w-full bg-black border border-slate-800 rounded p-2 text-xs text-cyan-400 font-mono focus:border-cyan-500 outline-none"
                                    />
                                </div>
                                
                                {ppAction === 'WITHDRAW' && (
                                    <div className="space-y-1">
                                        <label className="text-[8px] text-slate-500 uppercase font-bold">Recipient Email</label>
                                        <input 
                                            type="email" 
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full bg-black border border-slate-800 rounded p-2 text-xs text-cyan-400 font-mono focus:border-cyan-500 outline-none"
                                        />
                                    </div>
                                )}
                            </div>

                            <button 
                                onClick={handlePayPalSubmit}
                                className="w-full py-2 bg-cyan-500 text-black text-[10px] font-bold uppercase tracking-widest rounded hover:bg-cyan-400 transition-colors"
                            >
                                Confirm {ppAction}
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
