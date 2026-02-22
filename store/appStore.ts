import React from 'react';
import { create } from 'zustand';
import { 
    MarketData, Portfolio, Bot, LogEntry, SonarSignal, Trade, AnalyticsKPIs, 
    QuantumMetrics, InversionEventLog, ArchangelCoreState, TradeMode, 
    PrimeSuggestion, ProtocolNode, ProposedTrade, ExternalExchangeData, 
    ArbOpportunity, OrderState, ActiveOrder, GammaSessionState, AiToolkitState,
    PayPalReserves, PayPalOrder, BankingConfig
} from '../types';
import { TSX_SYMBOLS } from '../constants';
import { ExecutionIntent } from '../utils/spine';
import { HardwareAuthority } from '../utils/hardwareAuthority';
import { runSwarmOptimization, sendMessageToSentinelA } from '../services/geminiService';
import { RustKernelBridge } from '../utils/rustKernel';
import { marketService } from '../services/marketService';
import { omniBroker } from '../services/omniBroker';
import { SICOEngine, SICOConfig } from '../utils/sicoEngine';

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
    ibkrState: { accountNumber: "U*******999", isArmed: true, latency: 45, marginUtilization: 0.0, buyingPower: 25000, baseCurrency: "CAD" },
    activeDirectives: {},
    profitVault: 0,
    hardwareDevices: [
        { id: "HOST_MACHINE", type: "TPM_MODULE", status: "CONNECTED", firmwareVersion: "SYS_NATIVE", lastAttestation: Date.now() }
    ],
    regulatoryStatus: 'BLINDED',
    shadowModeActive: true
};

const rustKernel = RustKernelBridge.getInstance();

export interface AppState {
    theme: 'dark' | 'light';
    toggleTheme: () => void;
    isGodMode: boolean;
    setIsGodMode: (val: boolean) => void;
    isGodModeUnlocked: boolean;
    setIsGodModeUnlocked: (val: boolean) => void;
    isSovereign: boolean;
    setIsSovereign: (val: any) => void;
    isAgentZeroActive: boolean;
    setIsAgentZeroActive: (val: boolean) => void;
    resonanceStatus: 'IDLE' | 'ANALYZING' | 'RESONATING' | 'EXECUTING';
    marketData: MarketData;
    portfolio: Portfolio;
    fiatBalance: number;
    shadowVaultBalance: number;
    bots: Bot[];
    logs: LogEntry[];
    addLog: (source: LogEntry['source'], message: string) => void;
    historicalMarketData: Record<string, number[]>;
    marketFilter: string;
    setMarketFilter: (val: string) => void;
    sonarSignals: SonarSignal[];
    setSonarSignals: (signals: SonarSignal[]) => void;
    trades: Trade[];
    shadowTrades: Trade[];
    activeOrders: ActiveOrder[];
    kpis: AnalyticsKPIs;
    estimatedAlpha: number;
    aiToolkitState: AiToolkitState;
    setAiToolkitState: (val: AiToolkitState | ((prev: AiToolkitState) => AiToolkitState)) => void;
    isNexusOnline: boolean;
    setNexusOnline: (val: boolean | ((prev: boolean) => boolean)) => void;
    nexusLogs: string[];
    addNexusLog: (msg: string) => void;
    gammaState: GammaSessionState;
    toggleGammaScalper: () => void;
    sonarState: { zoom: number; pan: { x: number; y: number }; activeFilters: Set<string>; };
    setSonarState: (val: { zoom: number; pan: { x: number; y: number }; activeFilters: Set<string>; } | ((prev: { zoom: number; pan: { x: number; y: number }; activeFilters: Set<string>; }) => { zoom: number; pan: { x: number; y: number }; activeFilters: Set<string>; })) => void;
    quantumMetrics: QuantumMetrics;
    inversionLogs: InversionEventLog[];
    coreState: ArchangelCoreState;
    setCoreState: (val: ArchangelCoreState | ((prev: ArchangelCoreState) => ArchangelCoreState)) => void;
    systemStatus: string;
    killSwitchActive: boolean;
    payPalReserves: PayPalReserves;
    activePayPalOrders: PayPalOrder[];
    bankingConfig: BankingConfig;
    setBankingConfig: (cfg: Partial<BankingConfig>) => void;
    sicoActive: boolean;
    setSicoActive: (active: boolean) => void;
    sicoConfig: SICOConfig;
    setSicoConfig: (cfg: Partial<SICOConfig>) => void;
    sicoCollapses: number;
    wallpaperVideoSrc: string | null;
    wallpaperOpacity: number;
    wallpaperBlur: number;
    setWallpaperVideoSrc: (src: string | null) => void;
    isSwarmOptimized: boolean;
    swarmOptimizationReport: string | null;
    externalExchangeData: ExternalExchangeData;
    arbOpportunities: ArbOpportunity[];
    manageBot: (id: number, action: 'REBOOT' | 'ASSIGN_TASK') => void;
    heartbeat: () => void;
    withdrawFiat: (amount: number, destination: string) => boolean;
    signDevice: (deviceId: string) => Promise<void>;
    attestHardware: (deviceId: string) => Promise<void>;
    executeTrade: (symbol: string, action: 'BUY' | 'SELL', quantity: number, price: number, isShadow?: boolean, bracket?: { stopLoss?: number, takeProfit?: number }, exchange?: string) => void;
    optimizeSwarm: () => Promise<string>;
    triggerKillSwitch: () => void;
    tradeMode: TradeMode;
    setTradeMode: (mode: TradeMode) => void;
    primeSuggestions: PrimeSuggestion[];
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

const sicoEngine = new SICOEngine({
    coherenceWindowNs: 120.5,
    minAlphaThreshold: 0.0035,
    slippageTolerance: 0.0001
});

export const useAppStore = create<AppState>((set, get) => ({
    theme: 'dark',
    toggleTheme: () => set(state => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
    isGodMode: true,
    setIsGodMode: (val) => set({ isGodMode: val }),
    isGodModeUnlocked: true,
    setIsGodModeUnlocked: (val) => set({ isGodModeUnlocked: val }),
    isSovereign: true,
    setIsSovereign: (val) => set({ isSovereign: val }),
    isAgentZeroActive: true,
    setIsAgentZeroActive: (val) => set({ isAgentZeroActive: val }),
    resonanceStatus: 'IDLE',
    marketData: {},
    portfolio: {},
    fiatBalance: 25400.85,
    shadowVaultBalance: 125000.00,
    bots: INITIAL_BOTS,
    logs: [{ timestamp: new Date().toLocaleTimeString(), source: 'BOOT', message: 'System Initialized.' }],
    addLog: (source, message) => set(state => ({
        logs: [{ timestamp: new Date().toLocaleTimeString(), source, message }, ...state.logs].slice(0, 1000)
    })),
    historicalMarketData: {},
    marketFilter: '',
    setMarketFilter: (val) => set({ marketFilter: val || '' }),
    sonarSignals: [],
    setSonarSignals: (signals) => set({ sonarSignals: signals }),
    trades: [],
    shadowTrades: [],
    activeOrders: [],
    kpis: { winRate: 98.4, sharpeRatio: 3.1, maxDrawdown: 0.02, totalPnl: 12450.00, pnlPercent: 4.8 },
    estimatedAlpha: 24.5,
    aiToolkitState: {
        activeTab: 'chat',
        chatSettings: { useSearch: true, useMaps: false, useThinking: true, provider: 'gemini' },
        learningParams: { learningRate: 0.01, batchSize: 32, activationFunction: 'ReLU', epochs: 100, optimizer: 'Adam' }
    },
    setAiToolkitState: (fn) => set(state => ({ aiToolkitState: typeof fn === 'function' ? fn(state.aiToolkitState) : fn })),
    isNexusOnline: true,
    setNexusOnline: (val) => set(state => ({ isNexusOnline: typeof val === 'function' ? val(state.isNexusOnline) : val })),
    nexusLogs: [">> UPLINK SECURE."],
    addNexusLog: (msg) => set(state => ({ nexusLogs: [...state.nexusLogs, msg] })),
    gammaState: { isRunning: true, cycleCount: 145, logs: [], totalPnl: 450.25, iv: 0.45, spotPrice: 65000 },
    toggleGammaScalper: () => set(state => ({ gammaState: { ...state.gammaState, isRunning: !state.gammaState.isRunning } })),
    sonarState: { zoom: 1, pan: { x: 0, y: 0 }, activeFilters: new Set(['Financial', 'Geopolitical', 'Cyber', 'Quantum']) },
    setSonarState: (fn) => set(state => ({ sonarState: typeof fn === 'function' ? fn(state.sonarState) : fn })),
    quantumMetrics: { qubitCoherence: 120.5, fsfMetric: 0.00000005, quboEnergy: -24.5, acmdStatus: 'ACTIVE', gpGenerations: 14500, boredom: 0.2, entropy: 0.45, drift: 0.001, trustScore: 0.99, regime: 'STABLE', dnaIntegrity: 0.99, satelliteLink: 3, atmosphericNoise: 0.78, realityAnchorStability: 0.99, selfAuditProgress: 45, executionLatency: 0.04, tesScore: 0.98 },
    inversionLogs: [],
    coreState: INITIAL_CORE_STATE,
    setCoreState: (fn) => set(state => ({ coreState: typeof fn === 'function' ? fn(state.coreState) : fn })),
    systemStatus: "OPERATIONAL",
    killSwitchActive: false,
    payPalReserves: { totalUSD: 12450.75, status: 'SYNCHRONIZED', lastAudit: Date.now(), history: [12000, 12150, 12100, 12300, 12450.75] },
    activePayPalOrders: [],
    bankingConfig: { provider: "PayPal_REST_V2", mode: "LIVE", triggerThreshold: 500, keepReserve: 100, targetEmail: "ark@vault.sovereign", currency: "CAD", status: { errors: 0, lastSync: "NOMINAL" } },
    setBankingConfig: (cfg) => set(state => ({ bankingConfig: { ...state.bankingConfig, ...cfg } })),
    sicoActive: true,
    setSicoActive: (active) => set({ sicoActive: active }),
    sicoConfig: { coherenceWindowNs: 120.5, minAlphaThreshold: 0.0035, slippageTolerance: 0.0001 },
    setSicoConfig: (cfg) => set(state => {
        const next = { ...state.sicoConfig, ...cfg };
        sicoEngine.updateConfig(next);
        return { sicoConfig: next };
    }),
    sicoCollapses: 0,
    tradeMode: 'SOVEREIGN',
    setTradeMode: (mode) => set({ tradeMode: mode }),
    primeSuggestions: [],
    wallpaperVideoSrc: null,
    wallpaperOpacity: 0.6,
    wallpaperBlur: 0,
    setWallpaperVideoSrc: (src) => set({ wallpaperVideoSrc: src }),
    isSwarmOptimized: false,
    swarmOptimizationReport: null,
    externalExchangeData: { kraken: {} },
    arbOpportunities: [],
    
    manageBot: (id, action) => set(state => ({
        bots: state.bots.map(b => b.id === id ? { ...b, status: action === 'REBOOT' ? 'Idle' : 'Executing' } : b)
    })),

    heartbeat: () => set(state => ({
        coreState: { ...state.coreState, monotonicTime: Date.now() }
    })),

    withdrawFiat: (amount, destination) => {
        const current = get().fiatBalance;
        if (amount > current) return false;
        set({ fiatBalance: current - amount });
        get().addLog('BANKING', `Withdrawal of $${amount.toLocaleString()} to ${destination} executed.`);
        return true;
    },

    signDevice: async (deviceId) => {
        get().setCoreState(prev => ({
            ...prev,
            hardwareSignedDevices: Array.from(new Set([...prev.hardwareSignedDevices, deviceId]))
        }));
        get().addLog('HARDWARE', `Device ${deviceId} signature verified.`);
    },

    attestHardware: async (deviceId) => {
        const res = await HardwareAuthority.attestDevice(deviceId);
        get().setCoreState(prev => ({
            ...prev,
            hardwareDevices: prev.hardwareDevices.map(d => d.id === deviceId ? { ...d, status: res.status === 'VERIFIED' ? 'CONNECTED' : 'TAMPERED' } : d)
        }));
        get().addLog('HARDWARE', `Attestation for ${deviceId}: ${res.status}`);
    },
    
    executeTrade: async (symbol, action, quantity, price, isShadow = false, bracket, exchange = "KRAKEN") => {
        if (get().coreState.killSwitchActive) return;
        try {
            const exId = exchange.toLowerCase().includes('coinbase') ? 'coinbase' : 'kraken';
            const res = await omniBroker.createOrder(exId as any, symbol, action.toLowerCase() as any, quantity, price);
            get().addLog('TRADE', `REAL_EXECUTION: ${action} ${quantity} ${symbol} @ ${price}`);
            if (res) get().addNexusLog(`>> SICO_FILLED: ${symbol} at ${price}`);
        } catch (e: any) {
            get().addLog('ERROR', `REJECTION: ${e.message}`);
        }
    },

    fetchSymbolData: async (symbol) => {
        try {
            const price = await marketService.getPrice(symbol);
            set(state => ({ marketData: { ...state.marketData, [symbol]: { ...state.marketData[symbol], price } } }));
        } catch {}
    },

    ppCheckReserves: async () => {
        await new Promise(r => setTimeout(r, 1000));
        set(state => ({ payPalReserves: { ...state.payPalReserves, lastAudit: Date.now() } }));
    },
    ppInitiateDeposit: async (amount) => {
        get().addLog('BANKING', `Depositing $${amount} to PayPal Vault...`);
    },
    ppCaptureDeposit: async (id) => {},
    ppInitiateWithdrawal: async (email, amount) => {
        get().addLog('BANKING', `Exfiltrating $${amount} to ${email}...`);
    },

    optimizeSwarm: async () => {
        set({ isSwarmOptimized: false });
        const report = await runSwarmOptimization(get().kpis);
        set({ isSwarmOptimized: true, swarmOptimizationReport: report });
        get().addLog('ORCHESTRATOR', 'Swarm Optimization Complete.');
        return report;
    },
    triggerKillSwitch: () => set(state => {
        const active = !state.killSwitchActive;
        return { 
            killSwitchActive: active,
            coreState: { ...state.coreState, killSwitchActive: active }
        };
    }),
    executeOperation: async () => { set({ systemStatus: "EXECUTING" }); await sendMessageToSentinelA("EXECUTE"); set({ systemStatus: "OPERATIONAL" }); },
    installProtocol: async () => { set({ systemStatus: "INSTALLING" }); await sendMessageToSentinelA("INSTALL"); set({ systemStatus: "OPERATIONAL" }); },
    runSystem: async () => { set({ systemStatus: "AWAKENING" }); await sendMessageToSentinelA("RUN"); set({ systemStatus: "OPERATIONAL" }); },

    initApp: () => {
        try {
            rustKernel.start();
            setInterval(async () => {
                try {
                    const tickers = ['BTC', 'ETH', 'SOL', ...TSX_SYMBOLS];
                    const updates = await marketService.getBatchPrices(tickers);
                    set(prev => ({ marketData: { ...prev.marketData, ...updates } }));

                    if (get().sicoActive && updates['BTC'] && updates['ETH']) {
                        const priceA = updates['BTC'].price;
                        // Simulated drift for SICO monitoring
                        const drift = 1 + (Math.random() - 0.5) * 0.01;
                        const priceB = updates['BTC'].price * drift; 
                        
                        const res = await sicoEngine.monitorDecoherence(priceA, priceB, async () => {
                            get().addLog('SPINE', 'SICO_COLLAPSE_TRIGGERED: ATOMIC_ARBITRAGE');
                        });
                        if (res?.success) set(s => ({ sicoCollapses: s.sicoCollapses + 1 }));
                    }
                } catch {}
            }, 5000);
        } catch (e) {
            console.error("BOOT_FAILURE", e);
        }
    }
}));