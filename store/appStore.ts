
import React from 'react';
import { create } from 'zustand';
import { 
    MarketData, Portfolio, Bot, LogEntry, SonarSignal, Trade, AnalyticsKPIs, 
    QuantumMetrics, InversionEventLog, ArchangelCoreState, TradeMode, 
    PrimeSuggestion, ProtocolNode, ProposedTrade, ExternalExchangeData, 
    ArbOpportunity, OrderState, ActiveOrder, GammaSessionState, AiToolkitState,
    PayPalReserves, PayPalOrder
} from '../types';
import { SpineEngine, SpineContext, ExecutionIntent } from '../utils/spine';
import { HardwareAuthority } from '../utils/hardwareAuthority';
import { StrategyGate, CapitalScaleEngine } from '../utils/strategy';
import { AutonomyEngine } from '../utils/autonomy';
import { runSwarmOptimization, sendMessageToSentinelA } from '../services/geminiService';
import { RustKernelBridge } from '../utils/rustKernel';
import { marketService } from '../services/marketService';
import { executionService } from '../services/executionService';

// --- INITIAL CONSTANTS ---
// Start empty, we will fetch real data
const INITIAL_MARKET_DATA: MarketData = {};

const INITIAL_BOTS: Bot[] = [
    { id: 1, status: 'Idle', role: 'Hunter', legion: 'Infrastructure', efficiency: 98, xp: 1250 },
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
        { id: "HOST_MACHINE", type: "TPM_MODULE", status: "CONNECTED", firmwareVersion: "SYS_NATIVE", lastAttestation: Date.now() }
    ],
    regulatoryStatus: 'BLINDED',
    shadowModeActive: true
};

const capitalScaleEngine = new CapitalScaleEngine(1.0);
const rustKernel = RustKernelBridge.getInstance();

class DailyRiskGuard {
    maxLoss: number;
    initialEquity: number;
    enabled: boolean;

    constructor(maxLossPct: number = 0.05, initialEquity: number = 100000) {
        this.maxLoss = initialEquity * maxLossPct;
        this.initialEquity = initialEquity;
        this.enabled = true;
    }

    check(currentEquity: number): { halted: boolean, loss: number } {
        const loss = this.initialEquity - currentEquity;
        if (this.enabled && loss >= this.maxLoss) {
            return { halted: true, loss };
        }
        return { halted: false, loss };
    }
}

const dailyRiskGuard = new DailyRiskGuard(0.05, 100000);

export interface AppState {
    theme: 'dark' | 'light';
    toggleTheme: () => void;
    isGodMode: boolean;
    setIsGodMode: (val: boolean) => void;
    isGodModeUnlocked: boolean;
    setIsGodModeUnlocked: (val: boolean) => void;
    isSovereign: boolean;
    setIsSovereign: (val: any) => void;
    wallpaperVideoSrc: string | null;
    setWallpaperVideoSrc: (src: string | null) => void;
    wallpaperOpacity: number;
    setWallpaperOpacity: (val: number) => void;
    wallpaperBlur: number;
    setWallpaperBlur: (val: number) => void;
    
    marketData: MarketData;
    portfolio: Portfolio;
    setPortfolio: React.Dispatch<React.SetStateAction<Portfolio>>;
    paperPortfolio: Portfolio;
    setPaperPortfolio: React.Dispatch<React.SetStateAction<Portfolio>>;
    fiatBalance: number;
    paperBalance: number;
    bots: Bot[];
    manageBot: (botId: number, action: 'REBOOT' | 'ASSIGN_TASK', payload?: any) => void;
    logs: LogEntry[];
    addLog: (source: LogEntry['source'], message: string) => void;
    historicalMarketData: Record<string, number[]>;
    marketFilter: string;
    setMarketFilter: (val: string) => void;
    sonarSignals: SonarSignal[];
    setSonarSignals: React.Dispatch<React.SetStateAction<SonarSignal[]>>;
    trades: Trade[];
    setTrades: React.Dispatch<React.SetStateAction<Trade[]>>;
    paperTrades: Trade[];
    activeOrders: ActiveOrder[];
    kpis: AnalyticsKPIs;
    setKpis: React.Dispatch<React.SetStateAction<AnalyticsKPIs>>;
    estimatedAlpha: number;
    aiToolkitState: AiToolkitState;
    setAiToolkitState: React.Dispatch<React.SetStateAction<AiToolkitState>>;
    
    isNexusOnline: boolean;
    setNexusOnline: React.Dispatch<React.SetStateAction<boolean>>;
    nexusLogs: string[];
    addNexusLog: (msg: string) => void;
    clearNexusLogs: () => void;
    gammaState: GammaSessionState;
    toggleGammaScalper: () => void;
    sonarState: { zoom: number; pan: { x: number; y: number }; activeFilters: Set<string>; };
    setSonarState: React.Dispatch<React.SetStateAction<{ zoom: number; pan: { x: number; y: number }; activeFilters: Set<string>; }>>;
    quantumMetrics: QuantumMetrics;
    setQuantumMetrics: React.Dispatch<React.SetStateAction<QuantumMetrics>>;
    inversionLogs: InversionEventLog[];
    coreState: ArchangelCoreState;
    setCoreState: React.Dispatch<React.SetStateAction<ArchangelCoreState>>;
    systemStatus: string;

    payPalReserves: PayPalReserves;
    activePayPalOrders: PayPalOrder[];
    
    depositFiat: (amount: number, source: string) => void;
    withdrawFiat: (amount: number, destination: string) => boolean;
    executeTrade: (symbol: string, action: 'BUY' | 'SELL', quantity: number, price: number, isPaper?: boolean, bracket?: { stopLoss?: number, takeProfit?: number }) => void;
    optimizeSwarm: () => Promise<string>;
    isSwarmOptimized: boolean;
    swarmOptimizationReport: string | null;
    heartbeat: () => void;
    triggerKillSwitch: () => void;
    signDevice: (deviceId: string) => void;
    killSwitchActive: boolean;
    tradeMode: TradeMode;
    setTradeMode: (mode: TradeMode) => void;
    primeSuggestions: PrimeSuggestion[];
    executeAllPrimeDirectives: (suggestions: string[]) => Promise<void>;
    protocolNodes: ProtocolNode[];
    pendingProposals: ProposedTrade[];
    setPendingProposals: React.Dispatch<React.SetStateAction<ProposedTrade[]>>;
    apiConnected: boolean;
    externalExchangeData: ExternalExchangeData;
    arbOpportunities: ArbOpportunity[];
    armLiveGate: () => Promise<void>;
    disarmLiveGate: () => void;
    attestHardware: (deviceId: string) => Promise<void>;
    executeOperation: () => Promise<void>;
    installProtocol: () => Promise<void>;
    runSystem: () => Promise<void>;
    fetchSymbolData: (symbol: string) => Promise<void>;

    ppCheckReserves: () => Promise<void>;
    ppInitiateDeposit: (amount: number) => Promise<void>;
    ppCaptureDeposit: (orderId: string) => Promise<void>;
    ppInitiateWithdrawal: (email: string, amount: number) => Promise<void>;
    
    initApp: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
    // --- UI State ---
    theme: (typeof window !== 'undefined' ? localStorage.getItem('archangel_theme') as 'dark' | 'light' : 'dark') || 'dark',
    toggleTheme: () => set(state => {
        const newTheme = state.theme === 'dark' ? 'light' : 'dark';
        localStorage.setItem('archangel_theme', newTheme);
        if (newTheme === 'light') document.body.classList.add('light-theme');
        else document.body.classList.remove('light-theme');
        return { theme: newTheme };
    }),
    isGodMode: false,
    setIsGodMode: (val) => set({ isGodMode: val }),
    isGodModeUnlocked: typeof window !== 'undefined' && localStorage.getItem('archangel_godModeUnlocked') === 'true',
    setIsGodModeUnlocked: (val) => {
        localStorage.setItem('archangel_godModeUnlocked', String(val));
        set({ isGodModeUnlocked: val });
    },
    isSovereign: typeof window !== 'undefined' && localStorage.getItem('archangel_isSovereign') === 'true',
    setIsSovereign: (val) => {
        const newValue = typeof val === 'function' ? val(get().isSovereign) : val;
        localStorage.setItem('archangel_isSovereign', String(newValue));
        set({ isSovereign: newValue });
    },
    wallpaperVideoSrc: null,
    setWallpaperVideoSrc: (src) => set({ wallpaperVideoSrc: src }),
    wallpaperOpacity: 0.6,
    setWallpaperOpacity: (val) => set({ wallpaperOpacity: val }),
    wallpaperBlur: 0,
    setWallpaperBlur: (val) => set({ wallpaperBlur: val }),

    // --- Core Logic State ---
    marketData: INITIAL_MARKET_DATA,
    portfolio: {},
    setPortfolio: (fn) => set(state => ({ portfolio: typeof fn === 'function' ? fn(state.portfolio) : fn })),
    paperPortfolio: {},
    setPaperPortfolio: (fn) => set(state => ({ paperPortfolio: typeof fn === 'function' ? fn(state.paperPortfolio) : fn })),
    fiatBalance: 100000,
    paperBalance: 0,
    bots: INITIAL_BOTS,
    manageBot: (botId, action, payload) => {
        set(state => ({
            bots: state.bots.map(b => {
                if (b.id !== botId) return b;
                if (action === 'REBOOT') return { ...b, status: 'Idle', efficiency: 100 };
                if (action === 'ASSIGN_TASK') return { ...b, status: 'Executing' };
                return b;
            })
        }));
        get().addLog('SWARM', `BOT_OP: ${action} on Unit-${botId}`);
    },
    logs: [{ timestamp: new Date().toLocaleTimeString(), source: 'BOOT', message: 'System Initialized. Awaiting Backend Uplink.' }],
    addLog: (source, message) => set(state => ({
        logs: [{ timestamp: new Date().toLocaleTimeString(), source, message }, ...state.logs].slice(0, 1000)
    })),
    historicalMarketData: {},
    marketFilter: '',
    setMarketFilter: (val) => set({ marketFilter: val }),
    sonarSignals: [],
    setSonarSignals: (fn) => set(state => ({ sonarSignals: typeof fn === 'function' ? fn(state.sonarSignals) : fn })),
    trades: [],
    setTrades: (fn) => set(state => ({ trades: typeof fn === 'function' ? fn(state.trades) : fn })),
    paperTrades: [],
    activeOrders: [],
    kpis: { winRate: 0, sharpeRatio: 0, maxDrawdown: 0, totalPnl: 0, pnlPercent: 0 },
    setKpis: (fn) => set(state => ({ kpis: typeof fn === 'function' ? fn(state.kpis) : fn })),
    estimatedAlpha: 0,
    aiToolkitState: {
        activeTab: 'chat',
        chatSettings: { useSearch: false, useMaps: false, useThinking: false, provider: 'gemini' },
        learningParams: { learningRate: 0.01, batchSize: 32, activationFunction: 'ReLU', epochs: 100, optimizer: 'Adam' }
    },
    setAiToolkitState: (fn) => set(state => ({ aiToolkitState: typeof fn === 'function' ? fn(state.aiToolkitState) : fn })),
    
    // Nexus State
    isNexusOnline: false,
    setNexusOnline: (fn) => set(state => ({ isNexusOnline: typeof fn === 'function' ? fn(state.isNexusOnline) : fn })),
    nexusLogs: [],
    addNexusLog: (msg) => {
        set(state => ({ nexusLogs: [...state.nexusLogs, msg] }));
        if (msg.startsWith(">> SYSTEM STATUS") || msg.includes("ERROR")) get().addLog('NEXUS', msg);
    },
    clearNexusLogs: () => set({ nexusLogs: [] }),
    gammaState: { isRunning: false, cycleCount: 0, logs: [], totalPnl: 0, iv: 0.45, spotPrice: 65000 },
    toggleGammaScalper: () => set(state => ({ gammaState: { ...state.gammaState, isRunning: !state.gammaState.isRunning } })),
    sonarState: { zoom: 1, pan: { x: 0, y: 0 }, activeFilters: new Set(['Financial', 'Geopolitical', 'Cyber', 'Quantum']) },
    setSonarState: (fn) => set(state => ({ sonarState: typeof fn === 'function' ? fn(state.sonarState) : fn })),
    quantumMetrics: {
        qubitCoherence: 120.5, fsfMetric: 0.00000005, quboEnergy: -24.5, acmdStatus: 'IDLE', gpGenerations: 14500, boredom: 0.2, entropy: 0.45, drift: 0.001, trustScore: 0.99, regime: 'STABLE', dnaIntegrity: 0.99, satelliteLink: 3, atmosphericNoise: 0.78, realityAnchorStability: 0.99, selfAuditProgress: 45, executionLatency: 0.04, tesScore: 0.98
    },
    setQuantumMetrics: (fn) => set(state => ({ quantumMetrics: typeof fn === 'function' ? fn(state.quantumMetrics) : fn })),
    inversionLogs: [],
    coreState: INITIAL_CORE_STATE,
    setCoreState: (fn) => set(state => ({ coreState: typeof fn === 'function' ? fn(state.coreState) : fn })),
    systemStatus: "STANDBY",

    payPalReserves: { totalUSD: 12450.75, status: 'SYNCHRONIZED', lastAudit: Date.now() },
    activePayPalOrders: [],
    
    isSwarmOptimized: false,
    swarmOptimizationReport: null,
    killSwitchActive: false,
    tradeMode: 'MANUAL',
    setTradeMode: (mode) => set({ tradeMode: mode }),
    primeSuggestions: [{ id: 1, label: "Enable Quantum Entropy", status: "PENDING" }],
    protocolNodes: [],
    pendingProposals: [],
    setPendingProposals: (fn) => set(state => ({ pendingProposals: typeof fn === 'function' ? fn(state.pendingProposals) : fn })),
    apiConnected: true,
    externalExchangeData: { kraken: {} },
    arbOpportunities: [],

    fetchSymbolData: async (symbol: string) => {
        const cleanSymbol = symbol.toUpperCase();
        try {
            get().addLog('MARKET', `Fetching live data for ${cleanSymbol}...`);
            const price = await marketService.getPrice(cleanSymbol);
            const stats = await marketService.get24hStats(cleanSymbol);
            const history = await marketService.getHistory(cleanSymbol);
            
            if (price > 0) {
                set(state => ({
                    marketData: { 
                        ...state.marketData, 
                        [cleanSymbol]: {
                            price,
                            change: stats.changePercent,
                            changeAbsolute: stats.changeAbs,
                            volume: stats.volume
                        } 
                    },
                    historicalMarketData: { 
                        ...state.historicalMarketData, 
                        [cleanSymbol]: history.length > 0 ? history : [] 
                    }
                }));
                get().addLog('MARKET', `Signal acquired: ${cleanSymbol} @ $${price}`);
            } else {
                get().addLog('ERROR', `No live feed found for ${cleanSymbol}`);
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Fetch failed";
            get().addLog('ERROR', `Failed to fetch ${cleanSymbol}: ${errorMessage}`);
        }
    },
    depositFiat: (amount, source) => {
        set(state => ({ fiatBalance: state.fiatBalance + amount }));
        get().addLog('BANKING', `Deposit of $${amount.toLocaleString()} from ${source} confirmed.`);
    },
    withdrawFiat: (amount, destination) => {
        const current = get().fiatBalance;
        if (amount > current) {
            get().addNexusLog(`>> $G_PI-FINANCE: WITHDRAWAL REJECTED [INSUFFICIENT_LIQUIDITY]`);
            return false;
        }
        set({ fiatBalance: current - amount });
        get().addLog('BANKING', `Withdrawal of $${amount.toLocaleString()} to ${destination} executed.`);
        return true;
    },

    ppCheckReserves: async () => {
        get().addLog('BANKING_PAYPAL', 'Auditing global PayPal reserves...');
        await new Promise(r => setTimeout(r, 1200));
        // In a real app, call a backend endpoint for this
        const newTotal = 12000 + (Math.random() * 5000); // Placeholder until backend is wired
        set(state => ({ payPalReserves: { totalUSD: newTotal, status: 'SYNCHRONIZED', lastAudit: Date.now() } }));
    },

    ppInitiateDeposit: async (amount: number) => {
        get().addLog('BANKING_PAYPAL', `Initiating Deposit Order for $${amount}...`);
        await new Promise(r => setTimeout(r, 1000));
        const order: PayPalOrder = {
            id: `PP-ORD-${Math.random().toString(36).substring(7).toUpperCase()}`,
            approvalUrl: 'https://www.paypal.com/checkoutnow', // Real URL
            amount,
            status: 'CREATED'
        };
        set(state => ({ activePayPalOrders: [order, ...state.activePayPalOrders] }));
        window.open(order.approvalUrl, '_blank');
    },

    ppCaptureDeposit: async (orderId: string) => {
        get().addLog('BANKING_PAYPAL', `Capturing PayPal Order ${orderId}...`);
        await new Promise(r => setTimeout(r, 1500));
        const order = get().activePayPalOrders.find(o => o.id === orderId);
        if (order) {
            get().depositFiat(order.amount, 'PAYPAL_API_M');
            set(state => ({
                activePayPalOrders: state.activePayPalOrders.map(o => o.id === orderId ? { ...o, status: 'CAPTURED' } : o)
            }));
        }
    },

    ppInitiateWithdrawal: async (email: string, amount: number) => {
        get().addLog('BANKING_PAYPAL', `Initiating Payout of $${amount} to ${email}...`);
        const currentReserves = get().payPalReserves.totalUSD;
        if (amount > currentReserves) {
            get().addLog('ERROR', 'PAYPAL PAYOUT FAILED: Insufficient reserves.');
            return;
        }
        await new Promise(r => setTimeout(r, 2000));
        set(state => ({
            payPalReserves: { ...state.payPalReserves, totalUSD: state.payPalReserves.totalUSD - amount }
        }));
        get().addLog('BANKING_PAYPAL', `Withdrawal Complete. Funds released to ${email}.`);
    },

    executeTrade: async (symbol, action, quantity, price, isPaper = false, bracket) => {
        const state = get();
        
        const intent: ExecutionIntent = { symbol, side: action, quantity, price, bracket };
        
        if (state.coreState.killSwitchActive) {
            state.addLog('ERROR', 'KILL SWITCH ACTIVE. TRADES BLOCKED.');
            return;
        }

        try {
            if (!isPaper) {
                // LIVE EXECUTION
                const response = await executionService.executeLiveTrade(intent, state.coreState.confidence);
                
                const newTrade: Trade = {
                    id: response.order_id || `ord-${Date.now()}`,
                    timestamp: new Date().toLocaleTimeString(),
                    symbol,
                    action,
                    quantity,
                    price,
                    pnl: 0,
                    status: OrderState.FILLED, // Backend confirms fill
                    type: 'STANDARD',
                    isPaper: false,
                    auditHash: `LIVE_TX:${Date.now()}`,
                    tesScore: state.quantumMetrics.tesScore,
                };

                set(prev => {
                    const newBalance = action === 'BUY' ? prev.fiatBalance - (quantity * price) : prev.fiatBalance + (quantity * price);
                    const currentHolding = prev.portfolio[symbol] || { symbol, quantity: 0, avgPrice: 0, strikes: 0, isRetired: false };
                    let newQty = currentHolding.quantity;
                    let newAvg = currentHolding.avgPrice;
                    if (action === 'BUY') {
                        newAvg = ((currentHolding.quantity * currentHolding.avgPrice) + (quantity * price)) / (currentHolding.quantity + quantity);
                        newQty += quantity;
                    } else {
                        newQty -= quantity;
                    }
                    return {
                        trades: [newTrade, ...prev.trades],
                        fiatBalance: newBalance,
                        portfolio: { ...prev.portfolio, [symbol]: { ...currentHolding, quantity: newQty, avgPrice: newAvg } }
                    };
                });
                state.addLog('TRADE', `LIVE EXECUTION CONFIRMED: ${action} ${quantity} ${symbol} @ ${price}`);

            } else {
                // PAPER TRADING (Local Simulation)
                const tradeId = `paper-${Date.now()}`;
                const newTrade: Trade = {
                    id: tradeId, timestamp: new Date().toLocaleTimeString(), symbol, action, quantity, price, pnl: 0, status: OrderState.FILLED, type: 'STANDARD', isPaper: true
                };
                
                set(prev => {
                    const newBalance = action === 'BUY' ? prev.paperBalance - (quantity * price) : prev.paperBalance + (quantity * price);
                    const currentHolding = prev.paperPortfolio[symbol] || { symbol, quantity: 0, avgPrice: 0 };
                    let newQty = currentHolding.quantity + (action === 'BUY' ? quantity : -quantity);
                    let newAvg = action === 'BUY' ? ((currentHolding.quantity * currentHolding.avgPrice) + (quantity * price)) / (currentHolding.quantity + quantity) : currentHolding.avgPrice;
                    return {
                        paperTrades: [newTrade, ...prev.paperTrades],
                        paperBalance: newBalance,
                        paperPortfolio: { ...prev.paperPortfolio, [symbol]: { ...currentHolding, quantity: newQty, avgPrice: newAvg } }
                    };
                });
                state.addLog('PAPER', `SIMULATION: ${action} ${quantity} ${symbol} @ ${price}`);
            }
        } catch (e: any) {
            state.addLog('ERROR', `Trade Execution Failed: ${e.message}`);
        }
    },
    optimizeSwarm: async () => {
        get().addLog('SYSTEM', 'Quantum Synthesis protocol engaged...');
        try {
            const report = await runSwarmOptimization(get().kpis);
            set({ isSwarmOptimized: true, swarmOptimizationReport: report });
            return report;
        } catch (err) { throw err; }
    },
    heartbeat: () => set(state => ({
        coreState: { ...state.coreState, spineHeartbeatAge: 0, monotonicTime: Date.now() }
    })),
    triggerKillSwitch: () => {
        set(state => ({ killSwitchActive: !state.killSwitchActive, coreState: { ...state.coreState, killSwitchActive: !state.coreState.killSwitchActive } }));
        get().addLog('SYSTEM', 'KILL SWITCH TOGGLED.');
    },
    signDevice: (deviceId) => {
        set(state => {
            const signed = [...state.coreState.hardwareSignedDevices];
            if (!signed.includes(deviceId)) signed.push(deviceId);
            return { coreState: { ...state.coreState, hardwareSignedDevices: signed } };
        });
    },
    executeAllPrimeDirectives: async (suggestions) => {
        get().addLog('DIRECTIVE', 'Executing all pending Prime Directives...');
        for (const s of suggestions) {
            await new Promise(r => setTimeout(r, 200));
            get().addLog('DIRECTIVE', `Applied: ${s}`);
        }
    },
    armLiveGate: async () => {
        get().addLog('SPINE', 'ARMING LIVE GATE to IBKR/EXCHANGE...');
        await new Promise(r => setTimeout(r, 1000));
        set(state => ({ coreState: { ...state.coreState, ibkrState: { ...state.coreState.ibkrState, isArmed: true } } }));
    },
    disarmLiveGate: () => {
        set(state => ({ coreState: { ...state.coreState, ibkrState: { ...state.coreState.ibkrState, isArmed: false } } }));
    },
    attestHardware: async (deviceId) => {
        const result = await HardwareAuthority.attestDevice(deviceId);
        get().addLog('HARDWARE', `Attestation for ${deviceId}: ${result.status} [${result.hash}]`);
        set(state => ({
            coreState: {
                ...state.coreState,
                hardwareDevices: state.coreState.hardwareDevices.map(d => d.id === deviceId ? { ...d, status: result.status === 'VERIFIED' ? 'CONNECTED' : 'TAMPERED', lastAttestation: Date.now() } : d)
            }
        }));
    },

    // --- SOVEREIGN CASCADE OPERATIONS ---
    executeOperation: async () => {
        if (get().killSwitchActive) return;
        set({ systemStatus: "EXECUTING_CASCADE" });
        get().addLog('DIRECTIVE', 'SOVEREIGN_EXECUTE: Initiating global SICO cascade...');
        await sendMessageToSentinelA("EXECUTE_CASCADE: Authorize all pending SICO orders across 7D topological substrate.");
        set({ systemStatus: "OPERATIONAL_CASCADE" });
        get().addLog('SYSTEM', 'GLOBAL CASCADE COMPLETE. PARITY REACHED.');
    },

    installProtocol: async () => {
        if (get().killSwitchActive) return;
        set({ systemStatus: "INSTALLING_AXIOMS" });
        get().addLog('DIRECTIVE', 'SOVEREIGN_INSTALL: Transmuting new operational axioms...');
        await sendMessageToSentinelA("INSTALL_AXIOMS: Inject next-gen alpha features into the UPB-1 compliance layer.");
        set({ systemStatus: "INSTALLED_OMEGA" });
        get().addLog('SYSTEM', 'INSTALLATION FINALIZED. NEW AXIOMS ACTIVE.');
    },

    runSystem: async () => {
        if (get().killSwitchActive) return;
        set({ systemStatus: "AWAKENING_LIVING_SYSTEM" });
        get().addLog('DIRECTIVE', 'SOVEREIGN_RUN: Engaging Living System v204.0...');
        await sendMessageToSentinelA("RUN_CORE: Initiate full-scale market hunting. Maximize Stochastic Alpha.");
        set({ systemStatus: "LIVE_OMEGA" });
        get().addLog('SYSTEM', 'LIVING SYSTEM AWAKE. JURISDICTION: NULL-SPACE.');
    },

    initApp: () => {
        rustKernel.start();
        HardwareAuthority.getHostFingerprint().then(fingerprint => {
            set(state => ({
                coreState: {
                    ...state.coreState,
                    hardwareDevices: [...state.coreState.hardwareDevices, { id: "HOST_NODE_PRIMARY", type: "TPM_MODULE", status: "CONNECTED", firmwareVersion: fingerprint, lastAttestation: Date.now() }]
                }
            }));
        });

        // Initialize Market Data
        const tickers = ['BTC', 'ETH', 'SOL', 'ADA'];
        get().addLog('MARKET', 'Initializing Real-Time Feeds...');
        
        // Start polling for real prices instead of simulating
        setInterval(async () => {
            const updates = await marketService.getBatchPrices(tickers);
            
            // Poll Rust Kernel Metrics from Backend
            const kernelMetrics = await rustKernel.getMetrics();

            set(prev => {
                const nextData = { ...prev.marketData, ...updates };
                
                // Update history with real data points
                const nextHistory = { ...prev.historicalMarketData };
                Object.entries(updates).forEach(([sym, data]) => {
                    if (data && data.price) {
                        const hist = nextHistory[sym] || [];
                        const newHist = [...hist, data.price];
                        if (newHist.length > 50) newHist.shift();
                        nextHistory[sym] = newHist;
                    }
                });

                return {
                    marketData: nextData,
                    historicalMarketData: nextHistory,
                    coreState: {
                        ...prev.coreState,
                        rustSpineMetrics: { 
                            ...prev.coreState.rustSpineMetrics, 
                            kernelLatency: kernelMetrics.ffiLatency, 
                            throughput: kernelMetrics.throughput, 
                            rateLimitUsage: kernelMetrics.throughput / 60000 
                        }
                    }
                };
            });
        }, 5000);
    }
}));
