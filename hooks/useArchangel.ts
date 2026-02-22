
import { useState, useCallback, useEffect, useRef } from 'react';
import { 
    MarketData, Portfolio, Bot, LogEntry, SonarSignal, Trade, AnalyticsKPIs, 
    QuantumMetrics, InversionEventLog, ArchangelCoreState, TradeMode, 
    PrimeSuggestion, ProtocolNode, ProposedTrade, ExternalExchangeData, 
    ArbOpportunity, OrderState, Holding, ActiveOrder
} from '../types';
import { SpineEngine, SpineContext, ExecutionIntent } from '../utils/spine';
import { HardwareAuthority } from '../utils/hardwareAuthority';
import { StrategyGate, CapitalScaleEngine } from '../utils/strategy';
import { AutonomyEngine } from '../utils/autonomy';

const INITIAL_MARKET_DATA: MarketData = {
    // CRYPTO (Native)
    'BTC': { price: 64230.50, change: 2.4, changeAbsolute: 1541.53, volume: 25000000000 },
    'ETH': { price: 3450.75, change: 1.8, changeAbsolute: 62.11, volume: 12000000000 },
    'SOL': { price: 148.20, change: -0.5, changeAbsolute: -0.74, volume: 1500000000 },
    'ADA': { price: 0.45, change: 0.1, changeAbsolute: 0.00045, volume: 300000000 },

    // NASDAQ (Tech/Growth)
    'NVDA': { price: 890.00, change: 4.5, changeAbsolute: 38.20, volume: 45000000 },
    'AAPL': { price: 172.50, change: -0.5, changeAbsolute: -0.86, volume: 55000000 },
    'MSFT': { price: 415.00, change: 1.2, changeAbsolute: 4.90, volume: 22000000 },
    'TSLA': { price: 175.50, change: -1.8, changeAbsolute: -3.20, volume: 98000000 },
    'QQQ': { price: 440.00, change: 1.1, changeAbsolute: 4.80, volume: 35000000 },

    // NYSE (Blue Chip/Indices)
    'SPY': { price: 512.00, change: 0.8, changeAbsolute: 4.05, volume: 75000000 },
    'BRK.A': { price: 625000.00, change: 0.1, changeAbsolute: 625.00, volume: 5000 },
    'JPM': { price: 195.00, change: 0.5, changeAbsolute: 0.97, volume: 12000000 },
    'XOM': { price: 115.00, change: 0.3, changeAbsolute: 0.34, volume: 18000000 },

    // LSE (International)
    'SHEL.L': { price: 2850.00, change: 0.2, changeAbsolute: 5.70, volume: 15000000 },
    'AZN.L': { price: 10400.00, change: -0.3, changeAbsolute: -31.20, volume: 2000000 },
    'RR.L': { price: 410.00, change: 1.8, changeAbsolute: 7.20, volume: 45000000 },
};

const INITIAL_PORTFOLIO: Portfolio = {};

const INITIAL_BOTS: Bot[] = [
    { id: 1, status: 'Executing', role: 'Hunter', legion: 'Infrastructure', efficiency: 98, xp: 1250 },
    { id: 2, status: 'Analyzing', role: 'Oracle', legion: 'Seraphim', efficiency: 95, xp: 900 },
    { id: 3, status: 'Patrolling', role: 'Sentinel', legion: 'Security', efficiency: 99, xp: 1500 },
];

const INITIAL_CORE_STATE: ArchangelCoreState = {
    confidence: 0.98,
    approved: true,
    lastHash: "genesis",
    ledgerSize: 1024,
    quorumStatus: "VERIFIED",
    buyingPower: 0,
    spineHeartbeatAge: 0,
    monotonicTime: Date.now(),
    killSwitchActive: false,
    hardwareSignedDevices: [],
    hardwareQuorumRequired: 1,
    survivalDrawdownLimit: 0.15,
    structuralAlphaThreshold: 0.7,
    isAutonomyUnlocked: true,
    decisionCoreActive: true,
    strategyMetrics: { qualityScore: 1.5, drawdown: 0.00, stability: 0.9, capitalScale: 1.0, strikes: 0, isRetired: false },
    autonomyMetrics: { healthScore: 0.95, hesitationLevel: 0.1, suppressionActive: false, confidenceDecayFactor: 0.01, lastRevocationReason: null, cooldownRemaining: 0, isInRevocation: false, anomalyDetected: false, performanceMilestoneMet: true, lockedContracts: [] },
    biometricMetrics: { hrv: 65, stressIndex: 0.2, isAuthorized: true, lastSync: Date.now() },
    rustSpineMetrics: { kernelLatency: 0.04, throughput: 1000, rateLimitUsage: 0.1, heartbeatStatus: 'HEALTHY', partialFillEfficiency: 0.99 },
    mevMetrics: { mempoolExposure: 0.05, privateRpcActive: true, bundlesSent: 150, sandwichAttemptsBlocked: 12, currentSlippageLimit: 0.001, isFlashbotsBypassActive: true },
    ibkrState: { accountNumber: "U*******999", isArmed: false, latency: 45, marginUtilization: 0.0, buyingPower: 0, baseCurrency: "USD" },
    activeDirectives: {},
    profitVault: 0,
    hardwareDevices: [
        { id: "SENTINEL_MK1_A", type: "ARDUINO_SENTINEL", status: "CONNECTED", firmwareVersion: "v1.0.4", lastAttestation: Date.now() },
        { id: "TPM_MAINBOARD", type: "TPM_MODULE", status: "LOCKED", firmwareVersion: "2.0", lastAttestation: Date.now() }
    ]
};

// Helper to generate mock history
const generateMockHistory = (basePrice: number) => {
    return Array.from({ length: 20 }, () => basePrice * (1 + (Math.random() - 0.5) * 0.02));
};

export const useArchangel = () => {
    const [marketData, setMarketData] = useState<MarketData>(INITIAL_MARKET_DATA);
    const [portfolio, setPortfolio] = useState<Portfolio>(INITIAL_PORTFOLIO);
    const [paperPortfolio, setPaperPortfolio] = useState<Portfolio>({});
    const [fiatBalance, setFiatBalance] = useState(100000); 
    const [paperBalance, setPaperBalance] = useState(0);
    const [bots, setBots] = useState<Bot[]>(INITIAL_BOTS);
    const [logs, setLogs] = useState<LogEntry[]>([
        { timestamp: new Date().toLocaleTimeString(), source: 'BOOT', message: 'System Initialized. Zero-State Verified.' }
    ]);
    
    // Initialize history for all assets
    const [historicalMarketData, setHistoricalMarketData] = useState<Record<string, number[]>>(() => {
        const history: Record<string, number[]> = {};
        Object.entries(INITIAL_MARKET_DATA).forEach(([sym, data]) => {
            history[sym] = generateMockHistory(data.price);
        });
        return history;
    });

    const [marketFilter, setMarketFilter] = useState('');
    const [sonarSignals, setSonarSignals] = useState<SonarSignal[]>([]);
    const [trades, setTrades] = useState<Trade[]>([]);
    const [paperTrades, setPaperTrades] = useState<Trade[]>([]);
    const [activeOrders, setActiveOrders] = useState<ActiveOrder[]>([]);
    const [kpis, setKpis] = useState<AnalyticsKPIs>({ winRate: 0, sharpeRatio: 0, maxDrawdown: 0, totalPnl: 0, pnlPercent: 0 });
    const [estimatedAlpha, setEstimatedAlpha] = useState(0);
    const [quantumMetrics, setQuantumMetrics] = useState<QuantumMetrics>({
        qubitCoherence: 120.5, fsfMetric: 0.00000005, quboEnergy: -24.5, acmdStatus: 'IDLE', gpGenerations: 14500, boredom: 0.2, entropy: 0.45, drift: 0.001, trustScore: 0.99, regime: 'STABLE', dnaIntegrity: 0.99, satelliteLink: 3, atmosphericNoise: 0.78, realityAnchorStability: 0.99, selfAuditProgress: 45, executionLatency: 0.04, tesScore: 0.98
    });
    const [inversionLogs, setInversionLogs] = useState<InversionEventLog[]>([]);
    const [coreState, setCoreState] = useState<ArchangelCoreState>(INITIAL_CORE_STATE);
    // Fix: Changed 'MANUAL' to 'REAL_WORLD' to satisfy TradeMode type constraints
    const [tradeMode, setTradeMode] = useState<TradeMode>('REAL_WORLD');
    const [primeSuggestions, setPrimeSuggestions] = useState<PrimeSuggestion[]>([
        { id: 1, label: "Enable Quantum Entropy", status: "PENDING" }
    ]);
    const [protocolNodes, setProtocolNodes] = useState<ProtocolNode[]>([]);
    const [pendingProposals, setPendingProposals] = useState<ProposedTrade[]>([]);
    const [apiConnected, setApiConnected] = useState(true);
    const [externalExchangeData, setExternalExchangeData] = useState<ExternalExchangeData>({ kraken: {} });
    const [arbOpportunities, setArbOpportunities] = useState<ArbOpportunity[]>([]);

    const capitalScaleEngineRef = useRef(new CapitalScaleEngine(1.0));

    const addLog = useCallback((source: LogEntry['source'], message: string) => {
        setLogs(prev => [{ timestamp: new Date().toLocaleTimeString(), source, message }, ...prev].slice(0, 1000));
    }, []);

    const depositFiat = useCallback((amount: number, source: string) => {
        setFiatBalance(prev => prev + amount);
        addLog('BANKING', `Deposit of $${amount.toLocaleString()} from ${source} confirmed.`);
    }, [addLog]);

    const withdrawFiat = useCallback((amount: number, destination: string) => {
        if (amount > fiatBalance) return false;
        setFiatBalance(prev => prev - amount);
        addLog('BANKING', `Withdrawal of $${amount.toLocaleString()} to ${destination} executed.`);
        return true;
    }, [fiatBalance, addLog]);

    const executeTrade = useCallback(async (
        symbol: string, 
        action: 'BUY' | 'SELL', 
        quantity: number, 
        price: number, 
        isPaper: boolean = false,
        bracket?: { stopLoss?: number, takeProfit?: number }
    ) => {
        const currentQuality = kpis.sharpeRatio;
        const currentRegime = quantumMetrics.regime;
        const riskScale = capitalScaleEngineRef.current.adjust(currentQuality, currentRegime);
        const scaledQuantity = quantity * riskScale;

        if (!isPaper && Math.abs(riskScale - 1.0) > 0.05) {
            addLog('SCALPER', `Capital Scale Adjusted: ${riskScale.toFixed(2)}x (Qual: ${currentQuality.toFixed(2)}, Regime: ${currentRegime})`);
        }

        setCoreState(prev => ({
            ...prev,
            strategyMetrics: {
                ...prev.strategyMetrics,
                qualityScore: currentQuality,
                capitalScale: riskScale
            }
        }));

        const intent: ExecutionIntent = { 
            symbol, 
            side: action, 
            quantity: scaledQuantity, 
            price, 
            bracket 
        };
        
        const context: SpineContext = {
            device: 'BROWSER_MAIN',
            equity: isPaper ? paperBalance : fiatBalance,
            volatility: 0.02,
            drawdown: coreState.strategyMetrics.drawdown,
            structureScore: coreState.strategyMetrics.qualityScore,
            signedDevices: coreState.hardwareSignedDevices,
            requiredQuorum: coreState.hardwareQuorumRequired,
            fsfMetric: quantumMetrics.fsfMetric,
            qubitCoherence: quantumMetrics.qubitCoherence,
            biometricAuthorized: coreState.biometricMetrics.isAuthorized,
            mevExposure: coreState.mevMetrics.mempoolExposure,
            privateRpcActive: coreState.mevMetrics.privateRpcActive
        };

        if (coreState.killSwitchActive) {
            addLog('ERROR', 'KILL SWITCH ACTIVE. TRADES BLOCKED.');
            return;
        }

        if (!isPaper) {
            const strategyCheck = StrategyGate.validate(kpis);
            if (!strategyCheck.allowed) {
                addLog('ERROR', `STRATEGY FILTER GATE: Execution Blocked. ${strategyCheck.reason}`);
                return; 
            }
        }

        try {
            if (!isPaper) {
                const preflight = await SpineEngine.preflight(intent, context);
                if (!preflight.valid) throw new Error("Spine Preflight Failed");
            }

            const tradeId = `ord-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
            const newTrade: Trade = {
                id: tradeId,
                timestamp: new Date().toLocaleTimeString(),
                symbol,
                action,
                quantity: scaledQuantity, 
                price,
                pnl: 0,
                status: OrderState.FILLED,
                type: 'STANDARD',
                isPaper,
                auditHash: isPaper ? undefined : `HASH_${Date.now()}_${symbol}`,
                tesScore: quantumMetrics.tesScore,
                capitalScaleAtExecution: riskScale,
                qualityAtExecution: currentQuality
            };

            // BRACKET ORDER CREATION
            if (bracket) {
                const childAction = action === 'BUY' ? 'SELL' : 'BUY';
                if (bracket.stopLoss) {
                    setActiveOrders(prev => [...prev, {
                        id: `sl-${Date.now()}`,
                        parentId: tradeId,
                        symbol,
                        action: childAction,
                        quantity: scaledQuantity,
                        type: 'STOP_LOSS',
                        triggerPrice: bracket.stopLoss!,
                        status: 'PENDING',
                        timestamp: Date.now()
                    }]);
                    addLog('SPINE', `Linked Stop Loss for ${symbol} @ ${bracket.stopLoss}`);
                }
                if (bracket.takeProfit) {
                    setActiveOrders(prev => [...prev, {
                        id: `tp-${Date.now()}`,
                        parentId: tradeId,
                        symbol,
                        action: childAction,
                        quantity: scaledQuantity,
                        type: 'TAKE_PROFIT',
                        triggerPrice: bracket.takeProfit!,
                        status: 'PENDING',
                        timestamp: Date.now()
                    }]);
                    addLog('SPINE', `Linked Take Profit for ${symbol} @ ${bracket.takeProfit}`);
                }
            }

            if (isPaper) {
                setPaperTrades(prev => [newTrade, ...prev]);
                setPaperBalance(prev => action === 'BUY' ? prev - (scaledQuantity * price) : prev + (scaledQuantity * price));
                setPaperPortfolio(prev => {
                    const current = prev[symbol] || { symbol, quantity: 0, avgPrice: 0 };
                    let newQty = current.quantity;
                    let newAvg = current.avgPrice;
                    if (action === 'BUY') {
                        newAvg = ((current.quantity * current.avgPrice) + (scaledQuantity * price)) / (current.quantity + scaledQuantity);
                        newQty += scaledQuantity;
                    } else {
                        newQty -= scaledQuantity;
                    }
                    return { ...prev, [symbol]: { ...current, quantity: newQty, avgPrice: newAvg } };
                });
                addLog('PAPER', `SIMULATED ${action} ${scaledQuantity.toFixed(4)} ${symbol} @ $${price} (Scale: ${riskScale.toFixed(2)}x)`);
            } else {
                setTrades(prev => [newTrade, ...prev]);
                setFiatBalance(prev => action === 'BUY' ? prev - (scaledQuantity * price) : prev + (scaledQuantity * price));
                setPortfolio(prev => {
                    const current = prev[symbol] || { symbol, quantity: 0, avgPrice: 0, strikes: 0, isRetired: false };
                    let newQty = current.quantity;
                    let newAvg = current.avgPrice;
                    if (action === 'BUY') {
                        newAvg = ((current.quantity * current.avgPrice) + (scaledQuantity * price)) / (current.quantity + scaledQuantity);
                        newQty += scaledQuantity;
                    } else {
                        newQty -= scaledQuantity;
                    }
                    return { ...prev, [symbol]: { ...current, quantity: newQty, avgPrice: newAvg } };
                });
                addLog('TRADE', `EXECUTED ${action} ${scaledQuantity.toFixed(4)} ${symbol} @ $${price} (Scale: ${riskScale.toFixed(2)}x)`);
            }

        } catch (e: any) {
            addLog('ERROR', `Trade Execution Failed: ${e.message}`);
        }
    }, [fiatBalance, paperBalance, coreState, quantumMetrics, addLog, kpis]);

    const heartbeat = useCallback(() => {
        setCoreState(prev => ({
            ...prev,
            spineHeartbeatAge: 0,
            monotonicTime: Date.now()
        }));
    }, []);

    const triggerKillSwitch = useCallback(() => {
        setCoreState(prev => ({ ...prev, killSwitchActive: !prev.killSwitchActive }));
        addLog('SYSTEM', 'KILL SWITCH TOGGLED.');
    }, [addLog]);

    const signDevice = useCallback((deviceId: string) => {
        setCoreState(prev => {
            const signed = [...prev.hardwareSignedDevices];
            if (!signed.includes(deviceId)) signed.push(deviceId);
            return { ...prev, hardwareSignedDevices: signed };
        });
        addLog('HARDWARE', `Device ${deviceId} signature verified.`);
    }, [addLog]);

    const executeAllPrimeDirectives = useCallback(async (suggestions: string[]) => {
        addLog('DIRECTIVE', 'Executing all pending Prime Directives...');
        for (const s of suggestions) {
            await new Promise(r => setTimeout(r, 200));
            addLog('DIRECTIVE', `Applied: ${s}`);
        }
    }, [addLog]);

    const armLiveGate = useCallback(async () => {
        addLog('SPINE', 'ARMING LIVE GATE to IBKR/EXCHANGE...');
        await new Promise(r => setTimeout(r, 1000));
        setCoreState(prev => ({ ...prev, ibkrState: { ...prev.ibkrState, isArmed: true } }));
        addLog('SPINE', 'LIVE GATE ARMED. REAL CAPITAL AT RISK.');
    }, [addLog]);

    const disarmLiveGate = useCallback(() => {
        setCoreState(prev => ({ ...prev, ibkrState: { ...prev.ibkrState, isArmed: false } }));
        addLog('SPINE', 'LIVE GATE DISARMED.');
    }, [addLog]);

    const attestHardware = useCallback(async (deviceId: string) => {
        const result = await HardwareAuthority.attestDevice(deviceId);
        addLog('HARDWARE', `Attestation for ${deviceId}: ${result.status} (Hash: ${result.hash})`);
        setCoreState(prev => ({
            ...prev,
            hardwareDevices: prev.hardwareDevices.map(d => d.id === deviceId ? { ...d, status: result.status === 'VERIFIED' ? 'CONNECTED' : 'TAMPERED', lastAttestation: Date.now() } : d)
        }));
    }, [addLog]);

    const refreshMarketData = useCallback(() => {
        setMarketData(prev => {
            const next = { ...prev };
            Object.keys(next).forEach(sym => {
                const change = (Math.random() - 0.5) * 0.002;
                if (next[sym]) {
                    next[sym].price *= (1 + change);
                    next[sym].change = change * 1000;
                    next[sym].changeAbsolute = next[sym].price * change;
                    
                    setHistoricalMarketData(prevHist => {
                        const hist = prevHist[sym] || [];
                        const newHist = [...hist, next[sym].price];
                        if (newHist.length > 50) newHist.shift();
                        return { ...prevHist, [sym]: newHist };
                    });
                }
            });
            return next;
        });
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            refreshMarketData();

            setQuantumMetrics(prev => ({
                ...prev,
                realityAnchorStability: Math.min(1.0, prev.realityAnchorStability + 0.00001),
                gpGenerations: prev.gpGenerations + Math.floor(Math.random() * 100),
                qubitCoherence: Math.max(90, Math.min(150, prev.qubitCoherence + (Math.random() - 0.5) * 4)),
                fsfMetric: 0.00000005 + (Math.random() * 0.00000001),
                tesScore: Math.max(0.95, Math.min(0.9999, prev.tesScore + (Math.random() - 0.5) * 0.002)),
                entropy: Math.max(0.1, Math.min(0.95, prev.entropy + (Math.random() - 0.5) * 0.05))
            }));

            // Added IBKR Simulation
            setCoreState(prev => ({
                ...prev,
                ibkrState: {
                    ...prev.ibkrState,
                    latency: Math.floor(35 + Math.random() * 20),
                    buyingPower: prev.ibkrState.isArmed ? fiatBalance * 4 : 0,
                    marginUtilization: Math.max(0, Math.min(0.8, prev.ibkrState.marginUtilization + (Math.random() - 0.5) * 0.05))
                }
            }));
            
        }, 3000);
        return () => clearInterval(interval);
    }, [refreshMarketData, fiatBalance]);

    // Active Order Monitoring (Stop Loss / Take Profit Trigger)
    useEffect(() => {
        const checkBrackets = () => {
            if (activeOrders.length === 0) return;

            const ordersToRemove: string[] = [];
            
            activeOrders.forEach(order => {
                const currentPrice = marketData[order.symbol]?.price;
                if (!currentPrice) return;

                let triggered = false;
                
                // SL for SELL is triggered when price rises above trigger
                // TP for SELL is triggered when price drops below trigger
                if (order.action === 'SELL') { 
                    // This is a closing sell for a long position (so parent was BUY)
                    // Wait, logic correction:
                    // If Parent was BUY, Closing action is SELL.
                    // Stop Loss (Sell) triggers if Price <= Trigger
                    // Take Profit (Sell) triggers if Price >= Trigger
                    if (order.type === 'STOP_LOSS' && currentPrice <= order.triggerPrice) triggered = true;
                    if (order.type === 'TAKE_PROFIT' && currentPrice >= order.triggerPrice) triggered = true;
                }
                
                // If Parent was SELL (Short), Closing action is BUY.
                // Stop Loss (Buy) triggers if Price >= Trigger
                // Take Profit (Buy) triggers if Price <= Trigger
                if (order.action === 'BUY') {
                    if (order.type === 'STOP_LOSS' && currentPrice >= order.triggerPrice) triggered = true;
                    if (order.type === 'TAKE_PROFIT' && currentPrice <= order.triggerPrice) triggered = true;
                }

                if (triggered) {
                    addLog('SPINE', `BRACKET TRIGGERED: ${order.type} for ${order.symbol} @ ${currentPrice.toFixed(2)}`);
                    executeTrade(order.symbol, order.action, order.quantity, currentPrice, false); // Execute market close
                    
                    // Identify siblings (OCO logic) - Cancel the other bracket
                    const siblings = activeOrders.filter(o => o.parentId === order.parentId);
                    siblings.forEach(s => ordersToRemove.push(s.id));
                }
            });

            if (ordersToRemove.length > 0) {
                setActiveOrders(prev => prev.filter(o => !ordersToRemove.includes(o.id)));
                addLog('SPINE', `OCO: Cancelled ${ordersToRemove.length} related pending orders.`);
            }
        };

        const interval = setInterval(checkBrackets, 1000);
        return () => clearInterval(interval);
    }, [activeOrders, marketData, executeTrade, addLog]);

    useEffect(() => {
        const interval = setInterval(() => {
            const btcVol = marketData['BTC']?.volume || 0;
            const volumeScore = Math.min(1.0, btcVol / 500000000); 

            const evaluation = AutonomyEngine.evaluate(
                kpis.totalPnl,
                kpis.maxDrawdown / 100, 
                quantumMetrics.entropy,
                volumeScore,
                coreState.isAutonomyUnlocked
            );

            if (evaluation.unlocked !== coreState.isAutonomyUnlocked) {
                setCoreState(prev => ({
                    ...prev,
                    isAutonomyUnlocked: evaluation.unlocked,
                    autonomyMetrics: {
                        ...prev.autonomyMetrics,
                        lastRevocationReason: evaluation.reason
                    }
                }));
                const statusType = evaluation.unlocked ? 'AUTONOMY' : 'ERROR';
                addLog(statusType, `AUTONOMY STATE CHANGE: ${evaluation.unlocked ? 'UNLOCKED' : 'LOCKED'} - ${evaluation.reason}`);
            }
        }, 5000);
        return () => clearInterval(interval);
    }, [marketData, kpis, quantumMetrics.entropy, coreState.isAutonomyUnlocked, addLog]);

    useEffect(() => {
        const interval = setInterval(() => {
            setBots(prev => prev.map(bot => ({
                ...bot,
                status: Math.random() > 0.8 ? 'Executing' : Math.random() > 0.5 ? 'Analyzing' : 'Patrolling',
                xp: bot.xp + 1
            })));
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    return {
        marketData,
        portfolio,
        setPortfolio,
        paperPortfolio,
        setPaperPortfolio,
        fiatBalance,
        paperBalance,
        bots,
        logs,
        addLog,
        historicalMarketData,
        marketFilter,
        setMarketFilter,
        sonarSignals,
        setSonarSignals,
        trades,
        setTrades,
        paperTrades,
        activeOrders,
        kpis,
        setKpis,
        estimatedAlpha,
        quantumMetrics,
        setQuantumMetrics,
        inversionLogs,
        coreState,
        setCoreState,
        tradeMode,
        setTradeMode,
        primeSuggestions,
        protocolNodes,
        pendingProposals,
        setPendingProposals,
        apiConnected,
        externalExchangeData,
        arbOpportunities,
        depositFiat,
        withdrawFiat,
        executeTrade,
        heartbeat,
        triggerKillSwitch,
        signDevice,
        killSwitchActive: coreState.killSwitchActive,
        executeAllPrimeDirectives,
        armLiveGate,
        disarmLiveGate,
        attestHardware,
        refreshMarketData
    };
};
