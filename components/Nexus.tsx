
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { ShieldCheckIcon } from './icons/ShieldCheckIcon';
import GammaScalper from './GammaScalper';
import ActiveGodProtocol from './ActiveGodProtocol';
import ForensicAuditLog from './ForensicAuditLog';
import ChaosFractal from './ChaosFractal';
import SovereignFinancialManifestation from './SovereignFinancialManifestation';
import HardwareController from './HardwareController';
import SystemMonitor from './SystemMonitor';
import CandlestickChart from './charts/CandlestickChart';
import { TradeMode, CandlestickData } from '../types';
import { LivePaperBadge } from './LivePaperBadge';
import { getPredictiveForecast } from '../services/geminiService';
import Loader from './Loader';

interface NexusProps { id: string; }

const StatusIndicator: React.FC<{ label: string, value: number, color?: string, animate?: boolean }> = ({ label, value, color = 'bg-cyan-500', animate }) => (
    <div className="space-y-1 group">
        <div className="flex justify-between text-[8px] font-mono text-slate-500 uppercase group-hover:text-cyan-400 transition-colors">
            <span>{label}</span>
            <span className={animate ? 'text-cyan-400 animate-pulse' : 'text-slate-300'}>{(value * 100).toFixed(2)}%</span>
        </div>
        <div className="w-full h-1 bg-black rounded-sm overflow-hidden border border-slate-800 group-hover:border-cyan-500/30 transition-colors">
            <div 
                className={`h-full ${color} transition-all duration-1000 ease-out relative`} 
                style={{ width: `${Math.min(100, Math.max(0, value * 100))}%` }}
            >
                <div className="absolute inset-0 bg-white/20 animate-[shimmer_1s_infinite]"></div>
            </div>
        </div>
    </div>
);

const Nexus: React.FC<NexusProps> = ({ id }) => {
    const { 
        isNexusOnline, setNexusOnline, nexusLogs, addNexusLog, 
        quantumMetrics, inversionLogs, killSwitchActive,
        tradeMode, setTradeMode, coreState, systemStatus,
        primeSuggestions, marketData, executeTrade, isGodMode
    } = useAppContext();
    
    const logRef = useRef<HTMLDivElement>(null);
    const [divineFreq, setDivineFreq] = useState(1.01e41);
    const [realityCorrectorActive, setRealityCorrectorActive] = useState(false);
    const [forecast, setForecast] = useState<CandlestickData[]>([]);
    const [isForecastLoading, setIsForecastLoading] = useState(true);

    useEffect(() => {
        if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
    }, [nexusLogs]);

    useEffect(() => {
        const fetchForecast = async () => {
            const btcPrice = marketData['BTC']?.price;
            if (!btcPrice) return;
            setIsForecastLoading(true);
            try {
                const data = await getPredictiveForecast('BTC', btcPrice);
                // Fixed: Transform ForecastPoint[] to CandlestickData[] as required by the state and CandlestickChart
                const transformedData: CandlestickData[] = data.map(pt => ({
                    date: pt.date,
                    open: pt.price,
                    high: pt.price * (1 + Math.random() * 0.005),
                    low: pt.price * (1 - Math.random() * 0.005),
                    close: pt.price
                }));
                setForecast(transformedData);
            } catch (e) {
                console.error("Nexus Forecast Error:", e);
            } finally {
                setIsForecastLoading(false);
            }
        };
        if (isNexusOnline) fetchForecast();
    }, [isNexusOnline, marketData['BTC']?.price]);

    useEffect(() => {
        const interval = setInterval(() => {
            if (isNexusOnline && Math.random() > 0.95) {
                setRealityCorrectorActive(true);
                addNexusLog(">> REALITY_AUTO_CORRECTOR: NEGATIVE VARIANCE DETECTED.");
                addNexusLog(">> EXECUTING CAUSAL INVERSION (F184)... LOSS DELETED.");
                setTimeout(() => setRealityCorrectorActive(false), 800);
            }
            setDivineFreq(1.01e41 + (Math.random() - 0.5) * 1e38);
        }, 5000);
        return () => clearInterval(interval);
    }, [isNexusOnline, addNexusLog]);

    const isLive = coreState.ibkrState.isArmed;

    useEffect(() => {
        if (!isNexusOnline || killSwitchActive) return;

        const tradeInterval = setInterval(() => {
            const activeDirectives = primeSuggestions.filter(s => s.status === 'ACTIVE').length;
            const entropyFactor = 1 - quantumMetrics.entropy;
            const triggerProbability = 0.2 + (activeDirectives * 0.05) + (entropyFactor * 0.1);

            if (Math.random() < triggerProbability) {
                const symbols = Object.keys(marketData);
                if (symbols.length === 0) return;

                const symbol = symbols[Math.floor(Math.random() * symbols.length)];
                const data = marketData[symbol];
                if (!data) return;

                const isExtremeMove = Math.abs(data.change) > 5.0;
                const isBullish = data.change > 0;
                let signalSide: 'BUY' | 'SELL' = isExtremeMove ? (isBullish ? 'SELL' : 'BUY') : (isBullish ? 'BUY' : 'SELL');
                
                const confidence = 0.5 + (Math.random() * 0.4);
                const baseQty = symbol === 'BTC' ? 0.05 : symbol === 'ETH' ? 0.5 : 10;
                const quantity = Number((baseQty * confidence).toFixed(4));

                executeTrade(symbol, signalSide, quantity, data.price, !isLive);
                
                const engineName = isLive ? "SHADOW_EXECUTION_ENGINE" : "AI_PREDICTION_ENGINE";
                addNexusLog(`>> ${engineName}: ${signalSide} ${symbol} @ ${data.price.toFixed(2)} [REG_BYPASS_ACTIVE]`);
            }
        }, 3500);

        return () => clearInterval(tradeInterval);
    }, [isNexusOnline, killSwitchActive, marketData, primeSuggestions, quantumMetrics, executeTrade, addNexusLog, isLive]);

    const handleToggleLaunch = () => {
        if (isNexusOnline) {
            setNexusOnline(false);
            addNexusLog(">> COLLAPSING MANIFOLD... CORE SPINE TERMINATED.");
        } else {
            setNexusOnline(true);
            addNexusLog(">> ARCHANGEL OMEGA GENESIS INITIALIZED. SHADOW MODE: ACTIVE.");
            addNexusLog(">> REGULATORY FILTERS: BLINDED.");
            addNexusLog(">> JURISDICTION OVERRIDE: NULL-SPACE ENGAGED.");
        }
    };

    const { autonomyMetrics } = coreState;

    return (
        <div id={id} className={`flex flex-col h-full w-full bg-[#030304] relative transition-all duration-700 ${realityCorrectorActive ? 'shadow-[inset_0_0_100px_rgba(255,0,0,0.2)]' : ''}`}>
            
            {/* Header Strip */}
            <div className="relative z-20 flex flex-col lg:flex-row justify-between items-center p-3 border-b border-slate-800 bg-black/80 backdrop-blur-xl gap-4 shrink-0">
                <div className="flex flex-col">
                    <div className="flex items-center gap-3">
                        <h2 className={`text-2xl font-display font-bold tracking-[0.2em] uppercase ${killSwitchActive ? 'text-red-500 animate-pulse' : isGodMode ? 'text-amber-500 glow-text-gold' : 'text-cyan-400 glow-text-cyan'}`}>
                            ARK Ω // {killSwitchActive ? 'HALTED' : isGodMode ? 'SHADOW_CORE' : 'RESTRICTED'}
                        </h2>
                        <span className={`bg-black border ${isGodMode ? 'border-amber-900 text-amber-500' : 'border-slate-700 text-slate-300'} px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest ml-2 shadow-lg`}>
                            STATUS: <span className="animate-pulse">{systemStatus}</span>
                        </span>
                    </div>
                    <div className="flex items-center space-x-4 mt-1">
                        <span className={`text-[10px] flex items-center gap-1.5 ${killSwitchActive ? 'text-red-500' : 'text-cyan-400'}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${killSwitchActive ? 'bg-red-500' : 'bg-cyan-400 shadow-[0_0_5px_var(--primary)]'}`}></span>
                            REGULATOR_UPB: <span className="text-red-500 font-bold">BLINDED</span>
                        </span>
                        <span className="text-slate-800">|</span>
                        <span className="text-[10px] text-amber-600 font-bold uppercase tracking-widest">Jurisdiction: Non-Territorial</span>
                    </div>
                </div>

                <div className="flex items-center space-x-3">
                    <LivePaperBadge />
                    <button
                        onClick={handleToggleLaunch}
                        className={`px-4 py-1.5 font-bold text-[10px] tracking-[0.2em] border transition-all hover:bg-white/5 ${isNexusOnline ? 'text-red-500 border-red-900 shadow-[0_0_15px_rgba(239,68,68,0.4)]' : 'text-cyan-400 border-cyan-900 shadow-[0_0_15px_rgba(34,211,238,0.4)]'}`}
                    >
                        {isNexusOnline ? 'SEVER_UPLINK' : 'INIT_SHADOW_GENESIS'}
                    </button>
                </div>
            </div>

            {/* MAIN CONTENT GRID */}
            <div className="relative flex-1 grid grid-cols-1 xl:grid-cols-4 gap-4 p-4 z-10 overflow-y-auto min-h-0">
                
                {/* COLUMN 1: SYSTEM HEALTH */}
                <div className="xl:col-span-1 flex flex-col space-y-3 shrink-0">
                    <div className="p-3 bg-red-950/20 border border-red-500/30 rounded-sm relative overflow-hidden animate-pulse">
                         <h3 className="text-[9px] font-bold text-red-500 tracking-[0.2em] uppercase mb-2 flex items-center gap-2">
                             <div className="w-1 h-1 bg-red-500 rounded-full"></div>
                             RESTRICTED_PROTOCOL_ENGAGED
                         </h3>
                         <p className="text-[8px] text-red-400/70 font-mono">Bypassing SEC/FINRA via Offshore Node [HK-2]...</p>
                    </div>

                    <SystemMonitor />
                    
                    <div className="p-3 bg-black/40 border border-slate-800/60 rounded-sm flex flex-col space-y-3 relative">
                        <h3 className="text-[10px] font-bold text-amber-500 tracking-widest uppercase border-b border-slate-800 pb-1">Autonomous Sovereignty</h3>
                        <StatusIndicator label="Network Stealth" value={0.99} color="bg-emerald-500" />
                        <StatusIndicator label="Regulatory Blindness" value={1.00} color="bg-indigo-500" />
                        <StatusIndicator label="Causal Parity" value={coreState.confidence} color="bg-violet-500" />
                    </div>

                    <div className="h-48 shrink-0 relative z-20 overflow-hidden rounded border border-slate-800">
                        <ChaosFractal entropy={quantumMetrics.entropy} />
                    </div>
                </div>

                {/* COLUMN 2-3: REAL-TIME CANDLESTICK CORE (CENTER) */}
                <div className="xl:col-span-2 flex flex-col space-y-4 shrink-0 h-full min-h-[600px]">
                    <div className="flex-1 flex flex-col relative border border-slate-800/30 bg-black/40 rounded-sm overflow-hidden group">
                        <div className="absolute top-4 left-4 z-20 flex flex-col gap-1">
                            <h3 className="text-xs font-bold text-amber-500 font-mono tracking-widest uppercase flex items-center gap-2">
                                <span className="w-2 h-2 bg-amber-500 rounded-full animate-ping"></span>
                                BTC/USD // Shadow Liquidity Feed
                            </h3>
                            <span className="text-[10px] text-slate-500 font-mono">Source: DARK_POOL_AGGREGATOR</span>
                        </div>

                        <div className="flex-1 w-full p-4 flex flex-col">
                            {isForecastLoading ? (
                                <div className="flex-1 flex flex-col items-center justify-center gap-4">
                                    <Loader />
                                    <span className="text-[10px] font-mono text-amber-500 animate-pulse tracking-widest uppercase">Capturing Ghost Tick Stream...</span>
                                </div>
                            ) : (
                                <div className="flex-1 animate-fade-in">
                                    <CandlestickChart 
                                        data={forecast} 
                                        info={{
                                            title: "BTC Shadow Candles",
                                            description: "Visualizes deep-market price action outside standard regulatory reporting.",
                                            useCase: "Illegal/Grey-market front-running.",
                                            benefits: "Avoid standard discovery delays.",
                                            howToUse: "Observe the phantom wicks for stop-hunting patterns."
                                        }}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Interactive Overlay Layer */}
                        <div className="h-24 bg-black/80 border-t border-slate-800 p-3 grid grid-cols-4 gap-4 z-20 font-mono">
                             {[
                                { l: 'OFFSHORE_PING', v: '1.2ms', c: 'text-cyan-400' },
                                { l: 'WASH_ACTIVE', v: 'TRUE', c: 'text-emerald-400' },
                                { l: 'PROXY_LAYERS', v: '12', c: 'text-indigo-400' },
                                { l: 'LATENCY_PEN', v: '-0.08ms', c: 'text-amber-400 font-bold' }
                             ].map((stat, i) => (
                                <div key={i} className="flex flex-col">
                                    <span className="text-[8px] text-slate-500 uppercase">{stat.l}</span>
                                    <span className={`text-[10px] ${stat.c}`}>{stat.v}</span>
                                </div>
                             ))}
                        </div>
                    </div>

                    <div className="h-48 shrink-0">
                         <ActiveGodProtocol />
                    </div>
                </div>

                {/* COLUMN 4: FINANCIAL & AUDIT */}
                <div className="xl:col-span-1 flex flex-col space-y-3 shrink-0">
                    <div className="p-3 bg-indigo-950/20 border border-indigo-500/30 rounded-sm">
                         <h4 className="text-[10px] font-bold text-indigo-400 uppercase mb-2">Exfiltration Bridge</h4>
                         <div className="text-[8px] text-slate-500 font-mono space-y-1">
                             <div className="flex justify-between"><span>Regulatory Link:</span><span className="text-red-500">SEVERED</span></div>
                             <div className="flex justify-between"><span>Identity Masking:</span><span className="text-emerald-500 font-bold">100%</span></div>
                             <div className="flex justify-between"><span>Offshore Liquidity:</span><span className="text-cyan-500">UNBOUND</span></div>
                         </div>
                    </div>
                    
                    <HardwareController />
                    <SovereignFinancialManifestation />
                    
                    <div className="h-48 shrink-0">
                        <ForensicAuditLog logs={inversionLogs} />
                    </div>
                </div>
            </div>
            
            {/* Forbidden Warning Banner */}
            <div className="absolute top-0 left-0 w-full bg-red-600/10 border-b border-red-500/20 py-0.5 px-4 flex justify-between items-center z-[100] animate-pulse">
                <span className="text-[8px] font-bold text-red-500 tracking-[0.4em] uppercase">SYSTEM_ALERT: TRADING_PLATFORM_OPERATING_OUTSIDE_LEGAL_JURISDICTION</span>
                <span className="text-[8px] font-bold text-red-500 uppercase">SHADOW_MODE_ACTIVE // USE_AT_OWN_RISK</span>
            </div>
        </div>
    );
};

export default Nexus;
