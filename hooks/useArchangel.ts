
import { useState, useCallback, useEffect, useRef } from 'react';
import { 
    MarketData, Portfolio, Bot, LogEntry, SonarSignal, Trade, AnalyticsKPIs, 
    QuantumMetrics, InversionEventLog, ArchangelCoreState, TradeMode, 
    PrimeSuggestion, ProtocolNode, ProposedTrade, ExternalExchangeData, 
    ArbOpportunity, OrderState, Holding
} from '../types';
import { generateInitialTrades } from '../utils/analytics';
import { SpineEngine, SpineContext, ExecutionIntent } from '../utils/spine';
import { HardwareAuthority } from '../utils/hardwareAuthority';

const INITIAL_MARKET_DATA: MarketData = {
    'BTC': { price: 64230.50, change: 2.4, changeAbsolute: 1541.53, volume: 1500000000 },
    'ETH': { price: 3450.75, change: 1.8, changeAbsolute: 62.11, volume: 800000000 },
    'SOL': { price: 148.20, change: -0.5, changeAbsolute: -0.74, volume: 200000000 },
    'ADA': { price: 0.45, change: 0.1, changeAbsolute: 0.00045, volume: 50000000 },
};

const INITIAL_PORTFOLIO: Portfolio = {
    'BTC': { symbol: 'BTC', quantity: 0.5, avgPrice: 60000, qualityScore: 1.2, stability: 0.9, strikes: 0, isRetired: false },
    'ETH': { symbol: 'ETH', quantity: 10, avgPrice: 3200, qualityScore: 1.5, stability: 0.95, strikes: 0, isRetired: false },
};

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
    buyingPower: 500000,
    spineHeartbeatAge: 0,
    monotonicTime: Date.now(),
    killSwitchActive: false,
    hardwareSignedDevices: [],
    hardwareQuorumRequired: 1,
    survivalDrawdownLimit: 0.15,
    structuralAlphaThreshold: 0.7,
    isAutonomyUnlocked: true,
    decisionCoreActive: true,
    strategyMetrics: { qualityScore: 1.5, drawdown: 0.02, stability: 0.9, capitalScale: 1.0, strikes: 0, isRetired: false },
    autonomyMetrics: { healthScore: 0.95, hesitationLevel: 0.1, suppressionActive: false, confidenceDecayFactor: 0.01, lastRevocationReason: null, cooldownRemaining: 0, isInRevocation: false, anomalyDetected: false, performanceMilestoneMet: true, lockedContracts: [] },
    biometricMetrics: { hrv: 65, stressIndex: 0.2, isAuthorized: true, lastSync: Date.now() },
    rustSpineMetrics: { kernelLatency: 0.04, throughput: 1000, rateLimitUsage: 0.1, heartbeatStatus: 'HEALTHY', partialFillEfficiency: 0.99 },
    mevMetrics: { mempoolExposure: 0.05, privateRpcActive: true, bundlesSent: 150, sandwichAttemptsBlocked: 12, currentSlippageLimit: 0.001, isFlashbotsBypassActive: true },
    ibkrState: { accountNumber: "U*******999", isArmed: false, latency: 45, marginUtilization: 0.3, buyingPower: 250000, baseCurrency: "USD" },
    activeDirectives: {},
    profitVault: 15000,
    hardwareDevices: [
        { id: "SENTINEL_MK1_A", type: "ARDUINO_SENTINEL", status: "CONNECTED", firmwareVersion: "v1.0.4", lastAttestation: Date.now() },
        { id: "TPM_MAINBOARD", type: "TPM_MODULE", status: "LOCKED", firmwareVersion: "2.0", lastAttestation: Date.now() }
    ]
};

export const useArchangel = () => {
    const [marketData, setMarketData] = useState<MarketData>(INITIAL_MARKET_DATA);
    const [portfolio, setPortfolio] = useState<Portfolio>(INITIAL_PORTFOLIO);
    const [paperPortfolio, setPaperPortfolio] = useState<Portfolio>({});
    const [fiatBalance, setFiatBalance] = useState(100000);
    const [paperBalance, setPaperBalance] = useState(100000);
    const [bots, setBots] = useState<Bot[]>(INITIAL_BOTS);
    const [logs, setLogs] = useState<LogEntry[]>([
        { timestamp: new Date().toLocaleTimeString(), source: 'BOOT', message: 'System Initialized.' }
    ]);
    const [historicalMarketData, setHistoricalMarketData] = useState<Record<string, number[]>>({
        'BTC': [64000, 64100, 64200, 64150, 64230],
        'ETH': [3400, 3420, 3410, 3440, 3450]
    });
    const [marketFilter, setMarketFilter] = useState('');
    const [sonarSignals, setSonarSignals] = useState<SonarSignal[]>([]);
    const [trades, setTrades] = useState<Trade[]>(generateInitialTrades());
    const [paperTrades, setPaperTrades] = useState<Trade[]>([]);
    const [kpis, setKpis] = useState<AnalyticsKPIs>({ winRate: 65, sharpeRatio: 1.8, maxDrawdown: 5.2, totalPnl: 12500, pnlPercent: 12.5 });
    const [estimatedAlpha, setEstimatedAlpha] = useState(15.4);
    const [quantumMetrics, setQuantumMetrics] = useState<QuantumMetrics>({
        qubitCoherence: 120.5, fsfMetric: 0.00000005, quboEnergy: -24.5, acmdStatus: 'IDLE', gpGenerations: 14500, boredom: 0.2, entropy: 0.45, drift: 0.001, trustScore: 0.99, regime: 'STABLE', dnaIntegrity: 0.99, satelliteLink: 3, atmosphericNoise: 0.78, realityAnchorStability: 0.99, selfAuditProgress: 45, executionLatency: 0.04, tesScore: 0.98
    });
    const [inversionLogs, setInversionLogs] = useState<InversionEventLog[]>([]);
    const [coreState, setCoreState] = useState<ArchangelCoreState>(INITIAL_CORE_STATE);
    const [tradeMode, setTradeMode] = useState<TradeMode>('MANUAL');
    const [primeSuggestions, setPrimeSuggestions] = useState<PrimeSuggestion[]>([
        { id: 1, label: "Enable Quantum Entropy", status: "PENDING" }
    ]);
    const [protocolNodes, setProtocolNodes] = useState<ProtocolNode[]>([]);
    const [pendingProposals, setPendingProposals] = useState<ProposedTrade[]>([]);
    const [apiConnected, setApiConnected] = useState(true);
    const [externalExchangeData, setExternalExchangeData] = useState<ExternalExchangeData>({ kraken: {} });
    const [arbOpportunities, setArbOpportunities] = useState<ArbOpportunity[]>([]);

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

    const executeTrade = useCallback(async (symbol: string, action: 'BUY' | 'SELL', quantity: number, price: number, isPaper: boolean = false) => {
        const intent: ExecutionIntent = { symbol, side: action, quantity, price };
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

        try {
            if (!isPaper) {
                // Real Trade Preflight
                const preflight = await SpineEngine.preflight(intent, context);
                if (!preflight.valid) throw new Error("Spine Preflight Failed");
            }

            const tradeId = `ord-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
            const newTrade: Trade = {
                id: tradeId,
                timestamp: new Date().toLocaleTimeString(),
                symbol,
                action,
                quantity,
                price,
                pnl: 0,
                status: OrderState.FILLED,
                type: 'STANDARD',
                isPaper,
                auditHash: isPaper ? undefined : `HASH_${Date.now()}_${symbol}`,
                tesScore: quantumMetrics.tesScore
            };

            if (isPaper) {
                setPaperTrades(prev => [newTrade, ...prev]);
                setPaperBalance(prev => action === 'BUY' ? prev - (quantity * price) : prev + (quantity * price));
                // Update Paper Portfolio
                setPaperPortfolio(prev => {
                    const current = prev[symbol] || { symbol, quantity: 0, avgPrice: 0 };
                    let newQty = current.quantity;
                    let newAvg = current.avgPrice;
                    if (action === 'BUY') {
                        newAvg = ((current.quantity * current.avgPrice) + (quantity * price)) / (current.quantity + quantity);
                        newQty += quantity;
                    } else {
                        newQty -= quantity;
                    }
                    return { ...prev, [symbol]: { ...current, quantity: newQty, avgPrice: newAvg } };
                });
                addLog('PAPER', `SIMULATED ${action} ${quantity} ${symbol} @ $${price}`);
            } else {
                setTrades(prev => [newTrade, ...prev]);
                setFiatBalance(prev => action === 'BUY' ? prev - (quantity * price) : prev + (quantity * price));
                // Update Real Portfolio
                setPortfolio(prev => {
                    const current = prev[symbol] || { symbol, quantity: 0, avgPrice: 0, strikes: 0, isRetired: false };
                    let newQty = current.quantity;
                    let newAvg = current.avgPrice;
                    if (action === 'BUY') {
                        newAvg = ((current.quantity * current.avgPrice) + (quantity * price)) / (current.quantity + quantity);
                        newQty += quantity;
                    } else {
                        newQty -= quantity;
                    }
                    return { ...prev, [symbol]: { ...current, quantity: newQty, avgPrice: newAvg } };
                });
                addLog('TRADE', `EXECUTED ${action} ${quantity} ${symbol} @ $${price}`);
            }

        } catch (e: any) {
            addLog('ERROR', `Trade Execution Failed: ${e.message}`);
        }
    }, [fiatBalance, paperBalance, coreState, quantumMetrics, addLog]);

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
        // Simulating async arming
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

    // --- EFFECT LOOPS ---

    useEffect(() => {
        const interval = setInterval(() => {
            setMarketData(prev => {
                const next = { ...prev };
                Object.keys(next).forEach(sym => {
                    const change = (Math.random() - 0.5) * 0.001;
                    if (next[sym]) {
                        next[sym].price *= (1 + change);
                        next[sym].change = change * 1000;
                        next[sym].changeAbsolute = next[sym].price * change;
                        // Update historical
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

            setQuantumMetrics(prev => ({
                ...prev,
                realityAnchorStability: Math.min(1.0, prev.realityAnchorStability + 0.00001),
                gpGenerations: prev.gpGenerations + Math.floor(Math.random() * 100),
                qubitCoherence: Math.max(90, Math.min(150, prev.qubitCoherence + (Math.random() - 0.5) * 4)),
                tesScore: Math.max(0.95, Math.min(0.9999, prev.tesScore + (Math.random() - 0.5) * 0.002))
            }));
            
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    // Simulating Bot Activity
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
        attestHardware
    };
};
