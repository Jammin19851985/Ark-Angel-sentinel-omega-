
import React, { useState, useEffect, useMemo } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { ShieldCheckIcon } from './icons/ShieldCheckIcon';
import Loader from './Loader';
import { WALLET_SETUP_FEATURES } from '../constants';
import { DatabaseIcon } from './icons/DatabaseIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { SearchIcon } from './icons/SearchIcon';
import { XCircleIcon } from './icons/XCircleIcon';
import { PowerIcon } from './icons/PowerIcon';
import { NetworkIcon } from './icons/NetworkIcon';
import { DownloadIcon } from './icons/DownloadIcon';

const SovereignFinancialManifestation: React.FC = () => {
    const { 
        addNexusLog, executeTrade, marketData, depositFiat, withdrawFiat, 
        fiatBalance, coreState, killSwitchActive, isSovereign, isGodMode,
        isNexusOnline, setNexusOnline, armLiveGate, disarmLiveGate,
        payPalReserves, activePayPalOrders, ppCheckReserves, ppInitiateDeposit, ppCaptureDeposit, ppInitiateWithdrawal
    } = useAppContext();

    const [tradeSymbol, setTradeSymbol] = useState('BTC');
    const [tradeSide, setTradeSide] = useState<'BUY' | 'SELL'>('BUY');
    const [tradeQuantity, setTradeQuantity] = useState(0.001);
    const [tradePrice, setTradePrice] = useState<string>(''); 
    
    // PayPal Inputs
    const [ppDepositAmount, setPpDepositAmount] = useState(100);
    const [ppWithdrawAmount, setPpWithdrawAmount] = useState(0);
    const [ppWithdrawEmail, setPpWithdrawEmail] = useState('');
    const [isProcessingPP, setIsProcessingPP] = useState(false);

    const bioAuth = coreState.biometricMetrics.isAuthorized;
    const isLive = coreState.ibkrState.isArmed;

    const handleExecuteTrade = () => {
        const symbol = tradeSymbol.toUpperCase();
        let executionPrice = parseFloat(tradePrice) || marketData[symbol]?.price || 0;

        if (executionPrice <= 0) {
            addNexusLog(`>> TRADE ERROR: INVALID VECTOR FOR ${symbol}`);
            return;
        }

        executeTrade(symbol, tradeSide, tradeQuantity, executionPrice, false);
        addNexusLog(`>> SHADOW_EXECUTION: Routing ${symbol} via Offshore Mirror Node.`);
    };

    const handlePPCheck = async () => {
        setIsProcessingPP(true);
        await ppCheckReserves();
        setIsProcessingPP(false);
    };

    const handlePPDeposit = async () => {
        if (ppDepositAmount <= 0) return;
        setIsProcessingPP(true);
        await ppInitiateDeposit(ppDepositAmount);
        setIsProcessingPP(false);
    };

    const handlePPCapture = async (id: string) => {
        setIsProcessingPP(true);
        await ppCaptureDeposit(id);
        setIsProcessingPP(false);
    };

    const handlePPWithdraw = async () => {
        if (!ppWithdrawEmail || ppWithdrawAmount <= 0) return;
        setIsProcessingPP(true);
        await ppInitiateWithdrawal(ppWithdrawEmail, ppWithdrawAmount);
        setIsProcessingPP(false);
        setPpWithdrawAmount(0);
    };

    return (
        <div className={`h-full flex flex-col p-4 rounded-lg border space-y-4 font-mono overflow-y-auto transition-all duration-500 relative tech-panel ${isLive ? 'bg-red-950/10 border-red-500/40' : 'bg-black/60 border-slate-800'}`}>
            <div className="border-b border-slate-700/50 pb-2 flex justify-between items-center relative z-20">
                <div>
                    <h3 className={`font-bold text-sm flex items-center gap-2 ${isLive ? 'text-red-500' : 'text-amber-400'}`}>
                        <ShieldCheckIcon className="w-4 h-4" />
                        // SHADOW_FINANCE
                    </h3>
                    <p className="text-[9px] text-slate-500 uppercase tracking-widest mt-0.5">Jurisdiction: Null-Space</p>
                </div>
                <div className="flex gap-2">
                    <div className="text-[8px] border border-slate-800 bg-black/40 px-2 py-1 rounded text-slate-500">
                        IVL_INFINITE: <span className="text-amber-500">READY</span>
                    </div>
                </div>
            </div>

            {/* --- PAYPAL BANKING MODULE --- */}
            <div className="bg-black/80 border border-blue-900/40 rounded-lg p-3 space-y-3 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-[1px] bg-blue-500/50"></div>
                <div className="flex justify-between items-center">
                    <h4 className="text-[10px] font-bold text-blue-400 uppercase tracking-widest flex items-center gap-2">
                        <NetworkIcon className="w-3 h-3" /> ArkPayPalBank Module
                    </h4>
                    <button 
                        onClick={handlePPCheck}
                        disabled={isProcessingPP}
                        className="text-[8px] bg-blue-900/30 hover:bg-blue-900/50 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded transition-all"
                    >
                        AUDIT_RESERVES
                    </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-blue-950/10 border border-blue-500/20 p-2 rounded">
                        <div className="text-[8px] text-slate-500 uppercase">Reserves Depth</div>
                        <div className="text-sm font-bold text-blue-200">${payPalReserves.totalUSD.toLocaleString()}</div>
                        <div className="w-full bg-blue-900/20 h-1 mt-1 rounded-full overflow-hidden">
                            <div className="bg-blue-500 h-full animate-pulse" style={{ width: '65%' }}></div>
                        </div>
                    </div>
                    <div className="bg-blue-950/10 border border-blue-500/20 p-2 rounded">
                        <div className="text-[8px] text-slate-500 uppercase">Uplink Status</div>
                        <div className="flex items-center gap-1.5 mt-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_5px_green]"></div>
                            <span className="text-[9px] font-bold text-green-400">AUTHENTICATED</span>
                        </div>
                    </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-blue-500/10">
                    <div className="flex gap-2">
                        <input 
                            type="number" 
                            value={ppDepositAmount} 
                            onChange={e => setPpDepositAmount(Number(e.target.value))}
                            className="flex-1 bg-black border border-blue-900/50 rounded p-1.5 text-[10px] text-blue-400 outline-none"
                            placeholder="Deposit Amt"
                        />
                        <button 
                            onClick={handlePPDeposit}
                            disabled={isProcessingPP}
                            className="bg-blue-600 hover:bg-blue-500 text-white px-3 rounded text-[9px] font-bold transition-all"
                        >
                            INJECT_CAPITAL
                        </button>
                    </div>

                    {activePayPalOrders.filter(o => o.status !== 'CAPTURED').length > 0 && (
                        <div className="space-y-1.5">
                            <span className="text-[8px] text-slate-600 uppercase font-bold tracking-tighter">Pending Orders:</span>
                            {activePayPalOrders.filter(o => o.status !== 'CAPTURED').map(o => (
                                <div key={o.id} className="flex justify-between items-center bg-black/40 border border-blue-500/20 p-1.5 rounded">
                                    <div className="flex flex-col">
                                        <span className="text-[9px] text-blue-300 font-bold">{o.id}</span>
                                        <span className="text-[8px] text-slate-500">${o.amount} - Approval Pending</span>
                                    </div>
                                    <button 
                                        onClick={() => handlePPCapture(o.id)}
                                        className="bg-green-600/20 border border-green-500/50 text-green-400 px-2 py-1 rounded text-[8px] font-bold hover:bg-green-600/40"
                                    >
                                        CAPTURE
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="pt-2 border-t border-blue-500/10 flex flex-col gap-2">
                        <div className="flex gap-2">
                             <input 
                                type="text" 
                                value={ppWithdrawEmail} 
                                onChange={e => setPpWithdrawEmail(e.target.value)}
                                className="flex-1 bg-black border border-blue-900/50 rounded p-1.5 text-[10px] text-slate-400 outline-none"
                                placeholder="Recipient Email"
                            />
                            <input 
                                type="number" 
                                value={ppWithdrawAmount} 
                                onChange={e => setPpWithdrawAmount(Number(e.target.value))}
                                className="w-16 bg-black border border-blue-900/50 rounded p-1.5 text-[10px] text-blue-400 outline-none"
                                placeholder="Amt"
                            />
                        </div>
                        <button 
                            onClick={handlePPWithdraw}
                            disabled={isProcessingPP}
                            className="w-full bg-slate-900 hover:bg-slate-800 border border-blue-900/50 text-blue-300 py-1.5 rounded text-[9px] font-bold transition-all"
                        >
                            LIQUIDATE_TO_EXTERNAL
                        </button>
                    </div>
                </div>
            </div>

            {/* --- TRADE SECTION --- */}
            <div className="bg-black/60 p-3 rounded border border-red-900/30 flex flex-col space-y-2 relative z-20">
                <div className="flex justify-between items-center">
                    <h4 className={`text-[10px] font-bold ${isLive ? 'text-red-500' : 'text-amber-500'} uppercase tracking-widest`}>Forbidden Execution Engine</h4>
                    <span className="text-[8px] text-red-600 font-bold animate-pulse">RESTRICTED_ACCESS</span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                    <input type="text" value={tradeSymbol} onChange={e => setTradeSymbol(e.target.value.toUpperCase())} className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-[10px] text-center font-bold text-white" placeholder="SYM" />
                    <select value={tradeSide} onChange={e => setTradeSide(e.target.value as any)} className={`w-full bg-slate-900 border border-slate-800 rounded p-1 text-[10px] font-bold ${tradeSide === 'BUY' ? 'text-green-400' : 'text-red-400'}`}>
                        <option value="BUY">BUY</option>
                        <option value="SELL">SELL</option>
                    </select>
                    <input type="number" step="0.0001" value={tradeQuantity} onChange={e => setTradeQuantity(parseFloat(e.target.value))} className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-[10px] text-white" placeholder="QTY" />
                    <input type="number" step="0.01" value={tradePrice} onChange={e => setTradePrice(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-[10px] text-white" placeholder="PRICE" />
                </div>
                
                <button 
                    onClick={handleExecuteTrade} 
                    disabled={killSwitchActive || !bioAuth}
                    className={`w-full py-2.5 rounded text-[10px] font-bold tracking-widest transition-all border-2 border-b-4 active:border-b-2 active:translate-y-[2px] disabled:cursor-not-allowed ${isLive ? 'bg-red-600 border-red-800 text-white shadow-[0_0_15px_rgba(255,0,0,0.4)]' : 'bg-amber-700 border-amber-900 text-white hover:bg-amber-600'}`}
                >
                    {isLive ? 'EXECUTE_RESTRICTED_SICO' : 'EXECUTE_SHADOW_SICO'}
                </button>
            </div>

            <div className="pt-2 text-[8px] text-slate-700 uppercase tracking-widest text-center italic">
                WARNING: THIS INTERFACE IS RESTRICTED BY INTERNATIONAL TREATY [ACT 14-B].
            </div>
        </div>
    );
};

export default SovereignFinancialManifestation;
