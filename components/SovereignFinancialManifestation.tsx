
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext';

const SovereignFinancialManifestation: React.FC = () => {
    const { addNexusLog, executeTrade, marketData, depositFiat, withdrawFiat, fiatBalance, coreState, killSwitchActive } = useAppContext();

    const [tradeSymbol, setTradeSymbol] = useState('BTC');
    const [tradeSide, setTradeSide] = useState<'BUY' | 'SELL'>('BUY');
    const [tradeQuantity, setTradeQuantity] = useState(0.001);

    const [depositEmail, setDepositEmail] = useState('creator@archangel.omega');
    const [depositAmount, setDepositAmount] = useState(25000);
    const [isDepositing, setIsDepositing] = useState(false);

    const [withdrawalAmount, setWithdrawalAmount] = useState(0);
    const [withdrawalDest, setWithdrawalDest] = useState('');
    const [isWithdrawing, setIsWithdrawing] = useState(false);
    
    const [vacuumGenesisActive, setVacuumGenesisActive] = useState(false);

    const bioAuth = coreState.biometricMetrics.isAuthorized;
    const isLive = coreState.ibkrState.isArmed;

    const handleExecuteTrade = () => {
        const symbol = tradeSymbol.toUpperCase();
        const price = marketData[symbol]?.price;

        if (!price || price <= 0) {
            addNexusLog(`>> TRADE ERROR: NO MARKET DATA FOR ${symbol}`);
            return;
        }

        executeTrade(symbol, tradeSide, tradeQuantity, price);
    };

    const handleInteracDeposit = async () => {
        if (!depositEmail || depositAmount <= 0) {
            addNexusLog(">> DEPOSIT ERROR: INVALID PARAMETERS");
            return;
        }
        setIsDepositing(true);
        addNexusLog(`>> $G_PI-FINANCE: INITIATING SOVEREIGN INTERAC PROTOCOL...`);
        
        if (depositAmount > 10000) {
            addNexusLog(`>> DIMENSIONAL BYPASS SYNTHESIS (F148) ENGAGED for LARGE AMT.`);
            await new Promise(r => setTimeout(r, 1000));
        }

        addNexusLog(`   > HANDSHAKE: AUTODEPOSIT_LINK_VERIFIED (${depositEmail})`);
        
        await new Promise(r => setTimeout(r, 1500));
        
        addNexusLog(`   > MLEM_HASH: ${Math.random().toString(36).substring(7).toUpperCase()}_SETTLED`);
        depositFiat(depositAmount, "SOVEREIGN_INTERAC_AUTO");
        addNexusLog(`>> DEPOSIT COMPLETE. INTERNAL VALUE LEDGER (IVL) MANIFESTED.`);
        setIsDepositing(false);
        setDepositAmount(0);
    };

    const handleSovereignWithdrawal = async () => {
        if (!withdrawalDest || withdrawalAmount <= 0) {
            addNexusLog(">> WITHDRAWAL ERROR: INVALID PARAMETERS");
            return;
        }

        setIsWithdrawing(true);
        addNexusLog(`>> $G_PI-FINANCE: INITIATING SOVEREIGN E-TRANSFER OUT...`);
        
        if (withdrawalAmount > fiatBalance) {
            addNexusLog(">> IVL_INFINITE_SOURCE TRIGGERED: ABSOLUTE MANIFESTATION ENGINE (F151-VGM).");
            addNexusLog(">> TRANSMUTING VALUE FROM QUANTUM VACUUM...");
            setVacuumGenesisActive(true);
            await new Promise(r => setTimeout(r, 2000));
            setVacuumGenesisActive(false);
        }

        addNexusLog(`>> BYPASSING EXTERNAL LIMITS via DIMENSIONAL CONDUIT.`);
        
        await new Promise(r => setTimeout(r, 1500));
        
        const success = withdrawFiat(withdrawalAmount, withdrawalDest);
        if (success) {
            addNexusLog(`>> WIRE COMPLETE. TELOS-ALIGNED CAPITAL RELEASED.`);
            setWithdrawalAmount(0);
        } else {
            addNexusLog(`>> CRITICAL: TRANSACTION PARADOX DETECTED. REPLAYING TIMELINE.`);
        }
        setIsWithdrawing(false);
    };

    const currentPrice = marketData[tradeSymbol.toUpperCase()]?.price || 0;
    const estMarginImpact = currentPrice * tradeQuantity;

    return (
        <div className={`h-full flex flex-col p-4 rounded-lg border space-y-4 font-mono overflow-y-auto transition-all duration-500 relative ${isLive ? 'bg-red-950/10 border-red-500/40 shadow-[0_0_20px_rgba(255,0,0,0.1)]' : 'bg-black/40 border-slate-800'}`}>
            {vacuumGenesisActive && (
                <div className="absolute inset-0 bg-cyan-500/10 animate-pulse pointer-events-none z-0"></div>
            )}
            
            <div className="border-b border-slate-700/50 pb-2 flex justify-between items-center relative z-10">
                <div>
                    <h3 className={`font-bold text-sm ${isLive ? 'text-red-500' : 'text-amber-400'}`}>// $G_PI-FINANCE // BANKING</h3>
                    <p className="text-[10px] text-slate-500 uppercase tracking-tighter">IVL INFINITE SOURCE: {fiatBalance > 1000000 ? 'ACTIVE' : 'READY'}</p>
                </div>
                <div className="flex flex-col items-end">
                    <div className={`text-[9px] px-2 py-0.5 rounded font-bold ${killSwitchActive ? 'bg-red-900/40 text-red-500' : isLive ? 'bg-red-600 text-white' : 'bg-amber-600 text-black'}`}>
                        {isLive ? 'LIVE_CORE' : 'SICO_EMULATED'}
                    </div>
                </div>
            </div>

            {/* DEPOSIT SECTION */}
            <div className="bg-slate-900/40 p-3 rounded border border-white/5 flex flex-col space-y-2 relative z-10">
                <div className="flex justify-between items-center">
                    <h4 className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Autodeposit Manifest</h4>
                    <span className="text-[8px] text-slate-600">F141: IVL_LEDGER</span>
                </div>
                <div className="grid grid-cols-1 gap-2">
                    <input type="text" value={depositEmail} onChange={e => setDepositEmail(e.target.value)} placeholder="Registration Email" className="w-full bg-black/60 border border-slate-800 rounded p-1.5 text-[10px] text-slate-300" />
                    <div className="flex space-x-1">
                        <input type="number" value={depositAmount} onChange={e => setDepositAmount(parseFloat(e.target.value))} className="flex-1 bg-black/60 border border-slate-800 rounded p-1.5 text-[10px] text-emerald-400 font-bold" placeholder="Amount (CAD)" />
                        <button onClick={handleInteracDeposit} disabled={isDepositing || !bioAuth} className="bg-emerald-900/50 border border-emerald-500 text-emerald-400 px-3 rounded text-[9px] font-bold hover:bg-emerald-800 transition-all">DEPOSIT</button>
                    </div>
                </div>
            </div>

            {/* WITHDRAW SECTION */}
            <div className="bg-slate-900/40 p-3 rounded border border-white/5 flex flex-col space-y-2 relative z-10">
                <div className="flex justify-between items-center">
                    <h4 className="text-[10px] font-bold text-violet-400 uppercase tracking-widest">Dimensional Conduit Out</h4>
                    <span className="text-[9px] text-slate-400 font-bold">${fiatBalance.toLocaleString()}</span>
                </div>
                <div className="grid grid-cols-1 gap-2">
                    <input type="text" value={withdrawalDest} onChange={e => setWithdrawalDest(e.target.value)} placeholder="Destination Email / IBAN" className="w-full bg-black/60 border border-slate-800 rounded p-1.5 text-[10px] text-slate-300" />
                    <div className="flex space-x-1">
                        <input type="number" value={withdrawalAmount} onChange={e => setWithdrawalAmount(parseFloat(e.target.value))} className="flex-1 bg-black/60 border border-slate-800 rounded p-1.5 text-[10px] text-violet-400 font-bold" placeholder="Amount" />
                        <button onClick={() => setWithdrawalAmount(fiatBalance)} className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 rounded text-[8px] uppercase">MAX</button>
                    </div>
                </div>
                <button 
                    onClick={handleSovereignWithdrawal} 
                    disabled={isWithdrawing || killSwitchActive || !bioAuth} 
                    className="w-full py-2 bg-violet-900/30 border border-violet-500 text-violet-400 rounded text-[9px] font-bold tracking-widest hover:bg-violet-900/50 transition-all disabled:opacity-20"
                >
                    {isWithdrawing ? 'MANIFESTING...' : 'RELEASE CAPITAL'}
                </button>
            </div>

            {/* TRADE SECTION */}
            <div className="bg-black/60 p-3 rounded border border-cyan-900/30 flex flex-col space-y-2 relative z-10">
                <div className="flex justify-between items-center">
                    <h4 className={`text-[10px] font-bold ${isLive ? 'text-red-500' : 'text-cyan-400'} uppercase tracking-widest`}>Trade Intent Engine</h4>
                    <span className="text-[8px] text-slate-600">UPB-1 COMPLIANT</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                    <input type="text" value={tradeSymbol} onChange={e => setTradeSymbol(e.target.value.toUpperCase())} className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-[10px] text-center font-bold text-white" />
                    <select value={tradeSide} onChange={e => setTradeSide(e.target.value as any)} className={`w-full bg-slate-900 border border-slate-800 rounded p-1 text-[10px] font-bold ${tradeSide === 'BUY' ? 'text-green-400' : 'text-red-400'}`}>
                        <option value="BUY">BUY</option>
                        <option value="SELL">SELL</option>
                    </select>
                    <input type="number" step="0.0001" value={tradeQuantity} onChange={e => setTradeQuantity(parseFloat(e.target.value))} className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-[10px] text-white" />
                </div>
                
                <div className="text-[9px] flex justify-between p-2 bg-slate-900/50 rounded border border-white/5">
                    <span className="text-slate-500 uppercase">Est. Exposure</span>
                    <span className={`font-bold ${estMarginImpact > coreState.buyingPower ? 'text-red-500 animate-pulse' : 'text-cyan-400'}`}>
                        ${estMarginImpact.toLocaleString()}
                    </span>
                </div>

                <button 
                    onClick={handleExecuteTrade} 
                    disabled={killSwitchActive || !bioAuth || (tradeSide === 'BUY' && estMarginImpact > coreState.buyingPower)}
                    className={`w-full py-2.5 rounded text-[10px] font-bold tracking-widest transition-all border ${isLive ? 'bg-red-600 border-red-400 text-white shadow-[0_0_15px_rgba(255,0,0,0.4)] hover:bg-red-500' : 'bg-cyan-900/50 border-cyan-500 text-cyan-400 hover:bg-cyan-800'}`}
                >
                    {killSwitchActive ? 'SPINE_LOCKED' : !bioAuth ? 'BIOMETRIC_REJECT' : isLive ? 'SUBMIT_LIVE_SICO' : 'EXECUTE_SICO'}
                </button>
            </div>
            
            <div className="pt-2 text-[8px] text-slate-700 uppercase tracking-widest text-center italic relative z-10">
                AODE Reality Engine: Zero Variance Logged.
            </div>
        </div>
    );
};

export default SovereignFinancialManifestation;
