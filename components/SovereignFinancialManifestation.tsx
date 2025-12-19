
import React, { useState } from 'react';
import { useAppContext } from '../contexts/AppContext';

const SovereignFinancialManifestation: React.FC = () => {
    const { addNexusLog, executeTrade, marketData, depositFiat, withdrawFiat, fiatBalance } = useAppContext();

    const [tradeSymbol, setTradeSymbol] = useState('BTC');
    const [tradeSide, setTradeSide] = useState<'BUY' | 'SELL'>('BUY');
    const [tradeQuantity, setTradeQuantity] = useState(0.001);

    const [depositEmail, setDepositEmail] = useState('');
    const [depositAmount, setDepositAmount] = useState(1000);
    const [isDepositing, setIsDepositing] = useState(false);

    const [withdrawalAmount, setWithdrawalAmount] = useState(0);
    const [withdrawalDest, setWithdrawalDest] = useState('');
    const [isWithdrawing, setIsWithdrawing] = useState(false);

    const handleExecuteTrade = () => {
        const symbol = tradeSymbol.toUpperCase();
        const price = marketData[symbol]?.price;

        if (!price || price <= 0) {
            addNexusLog(`>> TRADE ERROR: NO MARKET DATA FOR ${symbol}`);
            return;
        }

        executeTrade(symbol, tradeSide, tradeQuantity, price);
        // Log to Nexus console specifically
        addNexusLog(`>> ORDER SENT: ${tradeSide} ${tradeQuantity} ${symbol} @ $${price.toFixed(2)} [FILLED]`);
    };

    const handleInteracDeposit = async () => {
        if (!depositEmail || depositAmount <= 0) {
            addNexusLog(">> DEPOSIT ERROR: INVALID PARAMETERS");
            return;
        }
        setIsDepositing(true);
        addNexusLog(`>> INITIATING INTERAC E-TRANSFER REQUEST...`);
        addNexusLog(`   > REQUEST_SENT: ${depositEmail} | AMT: $${depositAmount}`);
        
        await new Promise(r => setTimeout(r, 2000)); // Simulate bank delay
        
        addNexusLog(`   > BANK_ACK: FUNDS RECEIVED`);
        depositFiat(depositAmount, "INTERAC_ETRANSFER");
        addNexusLog(`>> DEPOSIT COMPLETE. BALANCE UPDATED.`);
        setIsDepositing(false);
        setDepositAmount(0);
    };

    const handleWireWithdrawal = async () => {
        if (!withdrawalDest || withdrawalAmount <= 0) {
            addNexusLog(">> WITHDRAWAL ERROR: INVALID PARAMETERS");
            return;
        }
        if (withdrawalAmount > fiatBalance) {
            addNexusLog(">> WITHDRAWAL ERROR: INSUFFICIENT FUNDS IN IVL.");
            return;
        }

        setIsWithdrawing(true);
        addNexusLog(`>> INITIATING WIRE TRANSFER OUT...`);
        addNexusLog(`   > DEST: ${withdrawalDest} | AMT: $${withdrawalAmount.toFixed(2)}`);
        
        await new Promise(r => setTimeout(r, 1500));
        
        const success = withdrawFiat(withdrawalAmount, withdrawalDest);
        if (success) {
            addNexusLog(`>> WIRE COMPLETE. FUNDS RELEASED TO BANKING SYSTEM.`);
            setWithdrawalAmount(0);
        } else {
            addNexusLog(`>> WIRE FAILED: TRANSACTION REVERTED.`);
        }
        setIsWithdrawing(false);
    };

    const setMaxWithdrawal = () => {
        setWithdrawalAmount(Math.floor(fiatBalance * 100) / 100);
    };

    const setMaxTrade = () => {
        const symbol = tradeSymbol.toUpperCase();
        const price = marketData[symbol]?.price;
        if (tradeSide === 'BUY' && price > 0) {
            setTradeQuantity(Math.floor((fiatBalance / price) * 10000) / 10000);
        }
    };

    return (
        <div className="h-full flex flex-col bg-black/40 p-4 rounded-lg border border-slate-800 space-y-4 font-mono overflow-y-auto">
            <div className="border-b border-slate-700/50 pb-2">
                <h3 className="text-amber-400 font-bold text-sm">// SOVEREIGN BANKING & TRADE</h3>
                <p className="text-[10px] text-slate-500">INTERAC BRIDGE // LIVE EXECUTION</p>
            </div>

            {/* WITHDRAW SECTION (CASH OUT) */}
            <div className="bg-slate-900/50 p-3 rounded border border-slate-800 flex flex-col space-y-2">
                <div className="flex justify-between items-center">
                    <h4 className="text-xs font-bold text-violet-400">CASH OUT (WIRE/INTERAC)</h4>
                    <span className="text-[10px] text-slate-400">AVAIL: ${fiatBalance.toFixed(2)}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="col-span-2">
                        <label className="text-slate-500 block mb-1">Destination</label>
                        <input type="text" value={withdrawalDest} onChange={e => setWithdrawalDest(e.target.value)} placeholder="IBAN / Email" className="w-full bg-black/50 border border-slate-700 rounded p-1 text-slate-200" />
                    </div>
                    <div className="col-span-2">
                        <label className="text-slate-500 block mb-1">Amount ($)</label>
                        <div className="flex space-x-1">
                            <input type="number" value={withdrawalAmount} onChange={e => setWithdrawalAmount(parseFloat(e.target.value))} className="flex-1 bg-black/50 border border-slate-700 rounded p-1 text-slate-200" />
                            <button onClick={setMaxWithdrawal} className="bg-slate-700 hover:bg-slate-600 text-white px-2 rounded text-[10px]">MAX</button>
                        </div>
                    </div>
                </div>
                <button onClick={handleWireWithdrawal} disabled={isWithdrawing} className="w-full bg-violet-900/50 border border-violet-500 hover:bg-violet-900 text-violet-400 py-2 rounded text-[10px] font-bold tracking-widest transition-all disabled:opacity-50 mt-1">
                    {isWithdrawing ? 'SENDING...' : 'INITIATE TRANSFER'}
                </button>
            </div>

            {/* LIVE TRADE SECTION */}
            <div className="bg-slate-900/50 p-3 rounded border border-slate-800 flex flex-col space-y-2">
                <h4 className="text-xs font-bold text-cyan-400">LIVE MARKET EXECUTION</h4>
                <div className="grid grid-cols-3 gap-2 text-xs mb-1">
                    <div>
                        <label className="text-slate-500 block mb-1">Asset</label>
                        <input type="text" value={tradeSymbol} onChange={e => setTradeSymbol(e.target.value.toUpperCase())} className="w-full bg-black/50 border border-slate-700 rounded p-1 text-slate-200 text-center font-bold" />
                    </div>
                    <div>
                        <label className="text-slate-500 block mb-1">Side</label>
                        <select value={tradeSide} onChange={e => setTradeSide(e.target.value as any)} className={`w-full bg-black/50 border border-slate-700 rounded p-1 font-bold ${tradeSide === 'BUY' ? 'text-green-400' : 'text-red-400'}`}>
                            <option value="BUY">BUY</option>
                            <option value="SELL">SELL</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-slate-500 block mb-1">Qty</label>
                        <div className="flex space-x-1">
                            <input type="number" step="0.0001" value={tradeQuantity} onChange={e => setTradeQuantity(parseFloat(e.target.value))} className="w-full bg-black/50 border border-slate-700 rounded p-1 text-slate-200" />
                            {tradeSide === 'BUY' && (
                                <button onClick={setMaxTrade} className="bg-slate-700 hover:bg-slate-600 text-white px-1 rounded text-[8px]">MAX</button>
                            )}
                        </div>
                    </div>
                </div>
                
                <div className="text-xs text-center p-2 bg-black/30 rounded border border-slate-800/50">
                    <span className="text-slate-500">LIVE PRICE: </span>
                    <span className="text-white font-bold">${marketData[tradeSymbol.toUpperCase()]?.price?.toFixed(2) || '---'}</span>
                    <div className="text-slate-600 mt-1">EST TOTAL: ${((marketData[tradeSymbol.toUpperCase()]?.price || 0) * tradeQuantity).toFixed(2)}</div>
                </div>

                <button onClick={handleExecuteTrade} className="w-full bg-cyan-900/50 border border-cyan-500 hover:bg-cyan-900 text-cyan-400 py-2 rounded text-[10px] font-bold tracking-widest transition-all">
                    EXECUTE ORDER
                </button>
            </div>

            {/* DEPOSIT SECTION */}
            <div className="bg-slate-900/50 p-3 rounded border border-slate-800 flex flex-col space-y-2 opacity-80 hover:opacity-100 transition-opacity">
                <h4 className="text-xs font-bold text-emerald-400">DEPOSIT (INBOUND)</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                        <input type="email" value={depositEmail} onChange={e => setDepositEmail(e.target.value)} placeholder="Email Source" className="w-full bg-black/50 border border-slate-700 rounded p-1 text-slate-200" />
                    </div>
                    <div>
                        <input type="number" value={depositAmount} onChange={e => setDepositAmount(parseFloat(e.target.value))} className="w-full bg-black/50 border border-slate-700 rounded p-1 text-slate-200" />
                    </div>
                </div>
                <button onClick={handleInteracDeposit} disabled={isDepositing} className="w-full bg-emerald-900/20 border border-emerald-500/50 hover:bg-emerald-900/40 text-emerald-400 py-1.5 rounded text-[10px] font-bold tracking-widest transition-all disabled:opacity-50">
                    {isDepositing ? 'PROCESSING...' : 'REQUEST FUNDS'}
                </button>
            </div>
        </div>
    );
};

export default SovereignFinancialManifestation;
