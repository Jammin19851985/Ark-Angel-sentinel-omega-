import React, { useState, useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext';

const SovereignFinancialManifestation: React.FC = () => {
    const { addNexusLog, marketData, fiatBalance, coreState, killSwitchActive } = useAppContext();

    const [tradeSymbol, setTradeSymbol] = useState('BTC');
    const [tradeSide, setTradeSide] = useState<'BUY' | 'SELL'>('BUY');
    const [tradeQuantity, setTradeQuantity] = useState(0.001);

    const [stopLoss, setStopLoss] = useState<string>('');
    const [takeProfit, setTakeProfit] = useState<string>('');

    const [depositEmail, setDepositEmail] = useState('creator@archangel.omega');
    const [depositAmount, setDepositAmount] = useState(25000);
    const [isDepositing, setIsDepositing] = useState(false);

    const [withdrawalAmount, setWithdrawalAmount] = useState(0);
    const [withdrawalDest, setWithdrawalDest] = useState('');
    const [isWithdrawing, setIsWithdrawing] = useState(false);
    
    const [vacuumGenesisActive, setVacuumGenesisActive] = useState(false);

    const bioAuth = coreState.biometricMetrics.isAuthorized;
    const isLive = coreState.ibkrState.isArmed;

    const handleInteracDeposit = async () => {
        if (!depositEmail || depositAmount <= 0) {
            addNexusLog(">> DEPOSIT ERROR: INVALID PARAMETERS");
            return;
        }
        setIsDepositing(true);
        addNexusLog('>> -FINANCE: INITIATING SOVEREIGN INTERAC PROTOCOL...');

        const res = await fetch('http://localhost:8000/api/finance/deposit', { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount: depositAmount, method: 'SOVEREIGN_INTERAC_AUTO', email: depositEmail }) 
        });

        if (res.ok) {
            addNexusLog('   > HANDSHAKE: AUTODEPOSIT_LINK_VERIFIED (' + depositEmail + ')');
            addNexusLog('>> DEPOSIT COMPLETE. INTERNAL VALUE LEDGER (IVL) MANIFESTED.');
        }
        
        setIsDepositing(false);
        setDepositAmount(0);
    };

    const handleSovereignWithdrawal = async () => {
        if (!withdrawalDest || withdrawalAmount <= 0) {
            addNexusLog(">> WITHDRAWAL ERROR: INVALID PARAMETERS");
            return;
        }

        setIsWithdrawing(true);
        addNexusLog('>> -FINANCE: INITIATING SOVEREIGN E-TRANSFER OUT...');

        if (withdrawalAmount > fiatBalance) {
            addNexusLog(">> IVL_INFINITE_SOURCE TRIGGERED: VGM Absolute Manifestation (F151).");
            setVacuumGenesisActive(true);
            await new Promise(r => setTimeout(r, 1000));
            setVacuumGenesisActive(false);
        }

        const res = await fetch('http://localhost:8000/api/finance/withdraw', { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount: withdrawalAmount, destination: withdrawalDest }) 
        });

        if (res.ok) {
            addNexusLog('>> WIRE COMPLETE. TELOS-ALIGNED CAPITAL RELEASED.');
            setWithdrawalAmount(0);
        } else {
            addNexusLog('>> CRITICAL: TRANSACTION PARADOX DETECTED.');
        }
        setIsWithdrawing(false);
    };

    const currentPrice = marketData[tradeSymbol.toUpperCase()]?.price || 0;
    const estMarginImpact = currentPrice * tradeQuantity;

    return (
        <div className={h-full flex flex-col p-4 rounded-lg border space-y-4 font-mono overflow-y-auto transition-all duration-500 relative \}>
            {vacuumGenesisActive && (
                <div className="absolute inset-0 bg-cyan-500/10 animate-pulse pointer-events-none z-0"></div>
            )}

            <div className="border-b border-slate-700/50 pb-2 flex justify-between items-center relative z-10">
                <div>
                    <h3 className={ont-bold text-sm \}>// \-FINANCE // BANKING</h3> 
                    <p className="text-[10px] text-slate-500 uppercase tracking-tighter">IVL INFINITE SOURCE: {fiatBalance > 1000000 ? 'ACTIVE' : 'READY'}</p>
                </div>
            </div>

            <div className="bg-slate-900/40 p-3 rounded border border-white/5 flex flex-col space-y-2 relative z-10">
                <h4 className="text-[10px] font-bold text-emerald-400 uppercase">Autodeposit Manifest</h4>
                <input type="text" value={depositEmail} onChange={e => setDepositEmail(e.target.value)} placeholder="Email" className="bg-black/60 border border-slate-800 rounded p-1.5 text-[10px] text-slate-300" />
                <div className="flex space-x-1">
                    <input type="number" value={depositAmount} onChange={e => setDepositAmount(parseFloat(e.target.value))} className="flex-1 bg-black/60 border border-slate-800 rounded p-1.5 text-[10px] text-emerald-400 font-bold" />     
                    <button onClick={handleInteracDeposit} disabled={isDepositing} className="bg-emerald-700 hover:bg-emerald-600 text-white px-3 rounded text-[9px] font-bold">DEPOSIT</button>
                </div>
            </div>

            <div className="bg-slate-900/40 p-3 rounded border border-white/5 flex flex-col space-y-2 relative z-10">
                <h4 className="text-[10px] font-bold text-violet-400 uppercase">Dimensional Conduit Out</h4>
                <input type="text" value={withdrawalDest} onChange={e => setWithdrawalDest(e.target.value)} placeholder="Destination" className="bg-black/60 border border-slate-800 rounded p-1.5 text-[10px] text-slate-300" />
                <div className="flex space-x-1">
                    <input type="number" value={withdrawalAmount} onChange={e => setWithdrawalAmount(parseFloat(e.target.value))} className="flex-1 bg-black/60 border border-slate-800 rounded p-1.5 text-[10px] text-violet-400 font-bold" />      
                    <button onClick={handleSovereignWithdrawal} disabled={isWithdrawing} className="w-full py-2 bg-violet-700 text-white rounded text-[9px] font-bold">RELEASE CAPITAL</button>
                </div>
            </div>

            <div className="pt-2 text-[8px] text-slate-700 uppercase tracking-widest text-center italic relative z-10">
                AODE Reality Engine: Zero Variance Logged.
            </div>
        </div>
    );
};

export default SovereignFinancialManifestation;
