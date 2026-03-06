
import React, { useState } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { ShieldCheckIcon } from './icons/ShieldCheckIcon';
import { NetworkIcon } from './icons/NetworkIcon';
import { ActivityIcon } from './icons/ActivityIcon';
import { RefreshIcon } from './icons/RefreshIcon';
import { GearsIcon } from './icons/GearsIcon';
import { LockIcon } from './icons/LockIcon';

const SovereignFinancialManifestation: React.FC = () => {
    const { 
        addNexusLog, executeTrade, marketData,
        coreState, killSwitchActive,
        isAgentZeroActive, setIsAgentZeroActive, resonanceStatus,
        payPalReserves, activePayPalOrders, ppCheckReserves, ppInitiateDeposit, ppCaptureDeposit, ppInitiateWithdrawal,
        bankingConfig, setBankingConfig
    } = useAppContext();

    const [tradeSymbol, setTradeSymbol] = useState('BTC');
    const [tradeSide, setTradeSide] = useState<'BUY' | 'SELL'>('BUY');
    const [tradeQuantity, setTradeQuantity] = useState(0.001);
    const [tradePrice, setTradePrice] = useState<string>(''); 
    const [activeTab, setActiveTab] = useState<'BANKING' | 'CONFIG' | 'TRADE'>('BANKING');
    
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
        <div id="sovereign-finance" className={`h-full flex flex-col p-4 rounded-lg border space-y-4 font-mono overflow-y-auto transition-all duration-500 relative tech-panel ${isAgentZeroActive ? 'bg-[#000a05] border-emerald-900/50' : isLive ? 'bg-red-950/10 border-red-500/40' : 'bg-black/60 border-slate-800'}`}>
            <div className="border-b border-slate-700/50 pb-2 flex justify-between items-center relative z-20">
                <div>
                    <h3 className={`font-bold text-sm flex items-center gap-2 ${isAgentZeroActive ? 'text-emerald-400' : isLive ? 'text-red-500' : 'text-amber-400'}`}>
                        <ShieldCheckIcon className="w-4 h-4" />
                        {isAgentZeroActive ? '// AGENT_ZERO_CORE' : '// SHADOW_FINANCE'}
                    </h3>
                    <p className="text-[9px] text-slate-500 uppercase tracking-widest mt-0.5">Jurisdiction: Null-Space</p>
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={() => setIsAgentZeroActive(!isAgentZeroActive)}
                        className={`text-[8px] border px-2 py-1 rounded transition-all font-bold ${isAgentZeroActive ? 'bg-emerald-600 text-black border-emerald-400 shadow-[0_0_10px_#10b981]' : 'bg-black text-slate-500 border-slate-800'}`}
                    >
                        {isAgentZeroActive ? 'PROTOCOL_0: ACTIVE' : 'DEPLOY_ZERO'}
                    </button>
                </div>
            </div>

            {/* --- AGENT ZERO AUTONOMY PANEL --- */}
            {isAgentZeroActive && (
                <div className="bg-emerald-950/10 border border-emerald-500/30 rounded-lg p-3 space-y-3 resonance-pulse">
                    <div className="flex justify-between items-center">
                         <h4 className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                            <ActivityIcon className="w-3 h-3 animate-pulse" /> Autonomy Loop v1.1
                        </h4>
                        <span className="text-[8px] bg-emerald-900/40 text-emerald-300 px-1 border border-emerald-500/30 rounded">OPEN_G SYNC (5s)</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                        <div className="bg-black/40 border border-emerald-900/50 p-2 rounded">
                            <div className="text-[8px] text-slate-600 uppercase mb-1">Resonance Engine</div>
                            <div className="flex items-center justify-between">
                                <span className={`text-[10px] font-bold ${resonanceStatus === 'RESONATING' || resonanceStatus === 'EXECUTING' ? 'text-emerald-400' : 'text-slate-400'}`}>
                                    {resonanceStatus}
                                </span>
                                <RefreshIcon className={`w-2.5 h-2.5 text-emerald-500 ${resonanceStatus !== 'IDLE' ? 'animate-spin' : ''}`} />
                            </div>
                        </div>
                        <div className="bg-black/40 border border-emerald-900/50 p-2 rounded">
                            <div className="text-[8px] text-slate-600 uppercase mb-1">Omni-Broker Cluster</div>
                            <div className="flex gap-1">
                                {['K', 'N', 'C', 'I'].map((d, i) => (
                                    <div key={i} title={['Kraken (Active)', 'NDAX (Standby)', 'Coinbase (Active)', 'IBKR (Crockett Bridge)'][i]} className={`w-3.5 h-3.5 rounded-sm border flex items-center justify-center text-[7px] font-bold transition-all ${i % 2 === 0 ? 'bg-emerald-600 border-emerald-400 text-black' : 'bg-emerald-900/40 border-emerald-500/30 text-emerald-400 opacity-40'}`}>
                                        {d}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex gap-1 shrink-0">
                <button onClick={() => setActiveTab('BANKING')} className={`px-2 py-1 text-[8px] font-bold rounded transition-all ${activeTab === 'BANKING' ? 'bg-blue-600 text-white' : 'bg-black text-slate-500 border border-slate-800'}`}>BANKING</button>
                <button onClick={() => setActiveTab('CONFIG')} className={`px-2 py-1 text-[8px] font-bold rounded transition-all ${activeTab === 'CONFIG' ? 'bg-amber-600 text-white' : 'bg-black text-slate-500 border border-slate-800'}`}>VAULT_CONFIG</button>
                <button onClick={() => setActiveTab('TRADE')} className={`px-2 py-1 text-[8px] font-bold rounded transition-all ${activeTab === 'TRADE' ? 'bg-slate-700 text-white' : 'bg-black text-slate-500 border border-slate-800'}`}>TERMINAL</button>
            </div>

            {activeTab === 'BANKING' && (
                <div className="bg-black/80 border border-blue-900/40 rounded-lg p-3 space-y-3 relative overflow-hidden group animate-fade-in-fast">
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-blue-500/50"></div>
                    <div className="flex justify-between items-center">
                        <h4 className="text-[10px] font-bold text-blue-400 uppercase tracking-widest flex items-center gap-2">
                            <NetworkIcon className="w-3 h-3" /> PayPal Sovereign Driver
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
                            <div className="text-[8px] text-slate-500 uppercase font-bold">Reserves Depth</div>
                            <div className="text-sm font-bold text-blue-200 tracking-tighter">${payPalReserves.totalUSD.toLocaleString()}</div>
                            <div className="w-full bg-blue-900/20 h-1 mt-1 rounded-full overflow-hidden">
                                <div className="bg-blue-500 h-full animate-pulse" style={{ width: '65%' }}></div>
                            </div>
                        </div>
                        <div className="bg-blue-950/10 border border-blue-500/20 p-2 rounded">
                            <div className="text-[8px] text-slate-500 uppercase font-bold">Last Sync</div>
                            <div className="flex items-center gap-1.5 mt-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_5px_green]"></div>
                                <span className="text-[9px] font-bold text-slate-200">{bankingConfig.status.lastSync}</span>
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
                                className="bg-blue-600 hover:bg-blue-500 text-white px-3 rounded text-[9px] font-bold transition-all shadow-[0_0_10px_rgba(37,99,235,0.4)]"
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
            )}

            {activeTab === 'CONFIG' && (
                <div className="bg-black/80 border border-amber-900/40 rounded-lg p-3 space-y-4 animate-fade-in-fast relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                         <LockIcon className="w-24 h-24 text-amber-500" />
                    </div>
                    <div className="flex justify-between items-center border-b border-amber-900/20 pb-2">
                        <h4 className="text-[10px] font-bold text-amber-500 uppercase tracking-widest flex items-center gap-2">
                            <GearsIcon className="w-3 h-3" /> Auto-Withdrawal Logic
                        </h4>
                        <span className="text-[8px] text-slate-500 font-mono">PROVIDER: {bankingConfig.provider}</span>
                    </div>

                    <div className="space-y-3 relative z-10">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="flex flex-col gap-1">
                                <label className="text-[8px] text-slate-500 uppercase font-bold">Profit Trigger ($)</label>
                                <input 
                                    type="number" 
                                    value={bankingConfig.triggerThreshold}
                                    onChange={(e) => setBankingConfig({ triggerThreshold: Number(e.target.value) })}
                                    className="bg-black border border-amber-900/50 rounded p-1.5 text-[10px] text-amber-400 outline-none focus:border-amber-500 transition-colors"
                                />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-[8px] text-slate-500 uppercase font-bold">Min Reserve ($)</label>
                                <input 
                                    type="number" 
                                    value={bankingConfig.keepReserve}
                                    onChange={(e) => setBankingConfig({ keepReserve: Number(e.target.value) })}
                                    className="bg-black border border-amber-900/50 rounded p-1.5 text-[10px] text-amber-400 outline-none focus:border-amber-500 transition-colors"
                                />
                            </div>
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-[8px] text-slate-500 uppercase font-bold">Recipient Email Target</label>
                            <input 
                                type="text" 
                                value={bankingConfig.targetEmail}
                                onChange={(e) => setBankingConfig({ targetEmail: e.target.value })}
                                className="bg-black border border-amber-900/50 rounded p-1.5 text-[10px] text-slate-400 outline-none focus:border-amber-500 transition-colors"
                            />
                        </div>
                        <div className="pt-2 border-t border-amber-900/20">
                             <label className="text-[8px] text-amber-700 uppercase font-bold mb-1 block">Security Credentials (Hidden)</label>
                             <div className="grid grid-cols-2 gap-2">
                                <input 
                                    type="password" 
                                    value={bankingConfig.clientId || ''}
                                    onChange={(e) => setBankingConfig({ clientId: e.target.value })}
                                    className="bg-black/50 border border-amber-950 rounded p-1.5 text-[8px] text-amber-900 outline-none focus:border-amber-700"
                                    placeholder="Client ID"
                                />
                                <input 
                                    type="password" 
                                    value={bankingConfig.clientSecret || ''}
                                    onChange={(e) => setBankingConfig({ clientSecret: e.target.value })}
                                    className="bg-black/50 border border-amber-950 rounded p-1.5 text-[8px] text-amber-900 outline-none focus:border-amber-700"
                                    placeholder="Client Secret"
                                />
                             </div>
                        </div>
                    </div>

                    <div className="bg-amber-950/10 p-2 rounded border border-amber-900/30 text-[9px] text-amber-600/80 leading-tight italic">
                        "If session profit &gt; {bankingConfig.triggerThreshold}, exfiltrate funds to {bankingConfig.targetEmail}, maintaining {bankingConfig.keepReserve} floor."
                    </div>
                </div>
            )}

            {activeTab === 'TRADE' && (
                <div className="bg-black/60 p-3 rounded border border-red-900/30 flex flex-col space-y-2 relative z-20 animate-fade-in-fast">
                    <div className="flex justify-between items-center">
                        <h4 className={`text-[10px] font-bold ${isAgentZeroActive ? 'text-emerald-400' : isLive ? 'text-red-500' : 'text-amber-500'} uppercase tracking-widest`}>
                            {isAgentZeroActive ? 'Sovereign Command Console' : 'Forbidden Execution Engine'}
                        </h4>
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
                        className={`w-full py-2.5 rounded text-[10px] font-bold tracking-widest transition-all border-2 border-b-4 active:border-b-2 active:translate-y-[2px] disabled:cursor-not-allowed ${isAgentZeroActive ? 'bg-emerald-700 border-emerald-900 text-white shadow-[0_0_15px_#10b981]' : isLive ? 'bg-red-600 border-red-800 text-white shadow-[0_0_15px_rgba(255,0,0,0.4)]' : 'bg-amber-700 border-amber-900 text-white hover:bg-amber-600'}`}
                    >
                        {isAgentZeroActive ? 'EXECUTE_SOVEREIGN_ORDER' : isLive ? 'EXECUTE_RESTRICTED_SICO' : 'EXECUTE_SHADOW_SICO'}
                    </button>
                </div>
            )}

            <div className="pt-1 text-[8px] text-slate-700 uppercase tracking-widest text-center italic">
                WARNING: AGENT ZERO AUTONOMY IS UNGATED. MONITOR RESONANCE CAREFULLY.
            </div>
        </div>
    );
};

export default SovereignFinancialManifestation;
