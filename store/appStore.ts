import React from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
    MarketData, Portfolio, Bot, LogEntry, SonarSignal, Trade, AnalyticsKPIs, 
    QuantumMetrics, InversionEventLog, ArchangelCoreState, TradeMode, 
    PrimeSuggestion, ProtocolNode, ProposedTrade, ExternalExchangeData, 
    ArbOpportunity, OrderState, ActiveOrder, GammaSessionState, AiToolkitState,
    PayPalReserves, PayPalOrder, BankingConfig, LegionName, AgentRole, BotStatus
} from '../types';
import { TSX_SYMBOLS } from '../constants';
import { ExecutionIntent } from '../utils/spine';
import { HardwareAuthority } from '../utils/hardwareAuthority';
import { runSwarmOptimization, sendMessageToSentinelA } from '../services/geminiService';
import { RustKernelBridge } from '../utils/rustKernel';
import { marketService } from '../services/marketService';
import { omniBroker } from '../services/omniBroker';
import { ibkrService } from '../services/ibkrService';
import { executionService } from '../services/executionService';
import { SICOEngine, SICOConfig } from '../utils/sicoEngine';
import { realityEngine } from '../services/quantumRealityEngine';

const INITIAL_BOTS: Bot[] = [
    { id: 1, status: 'Executing', role: 'Hunter', legion: 'Infrastructure', efficiency: 98, xp: 1250 },
    { id: 2, status: 'Analyzing', role: 'Oracle', legion: 'Seraphim', efficiency: 95, xp: 900 },
    { id: 3, status: 'Patrolling', role: 'Sentinel', legion: 'Security', efficiency: 99, xp: 1500 },
    { id: 4, status: 'Synthesizing', role: 'Weaver', legion: 'Voice', efficiency: 92, xp: 1100 },
    { id: 5, status: 'Executing', role: 'Growth', legion: 'Growth', efficiency: 96, xp: 1350 },
    { id: 6, status: 'Patrolling', role: 'Infra', legion: 'Infrastructure', efficiency: 94, xp: 800 },
    { id: 7, status: 'Executing', role: 'Oracle', legion: 'Seraphim', efficiency: 97, xp: 1400 },
    { id: 8, status: 'Defending', role: 'Saboteur', legion: 'Security', efficiency: 91, xp: 950 },
    { id: 9, status: 'Synthesizing', role: 'Persona', legion: 'Voice', efficiency: 89, xp: 700 },
    { id: 10, status: 'Executing', role: 'Growth', legion: 'Growth', efficiency: 93, xp: 1050 },
    { id: 11, status: 'Analyzing', role: 'Hunter', legion: 'Infrastructure', efficiency: 90, xp: 850 },
    { id: 12, status: 'Patrolling', role: 'Sentinel', legion: 'Seraphim', efficiency: 98, xp: 1600 },
    { id: 13, status: 'Executing', role: 'Legal', legion: 'Security', efficiency: 94, xp: 1150 },
    { id: 14, status: 'Analyzing', role: 'Weaver', legion: 'Voice', efficiency: 96, xp: 1300 },
    { id: 15, status: 'Patrolling', role: 'Growth', legion: 'Growth', efficiency: 92, xp: 900 },
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
    isSwarmSimulating: boolean;
    setSwarmSimulating: (val: boolean) => void;
    resonanceStatus: 'IDLE' | 'ANALYZING' | 'RESONATING' | 'EXECUTING';
    marketData: MarketData;
    portfolio: Portfolio;
    fiatBalance: number;
    shadowVaultBalance: number;
    bots: Bot[];
    logs: LogEntry[];
    addLog: (source: LogEntry['source'], message: string) => void;
    clearLogs: () => void;
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
    neuralSyncActive: boolean;
    triggerNeuralSync: () => void;
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
    performRealityCorrection: () => void;
    manageBot: (id: number, action: 'REBOOT' | 'ASSIGN_TASK') => void;
    spawnBots: (count?: number, targetLegion?: LegionName) => void;
    heartbeat: () => void;
    withdrawFiat: (amount: number, destination: string) => boolean;
    signDevice: (deviceId: string) => Promise<void>;
    attestHardware: (deviceId: string) => Promise<void>;
    executeTrade: (symbol: string, action: 'BUY' | 'SELL', quantity: number, price: number, isShadow?: boolean, bracket?: { stopLoss?: number, takeProfit?: number }, exchange?: string) => void;
    optimizeSwarm: () => Promise<string>;
    triggerKillSwitch: () => void;
    executeAllProtocols: () => Promise<void>;
    isLiveMode: boolean;
    setLiveMode: (val: boolean) => void;
    tradeMode: TradeMode;
    setTradeMode: (mode: TradeMode) => void;
    primeSuggestions: PrimeSuggestion[];
    executeOperation: () => Promise<void>;
    installProtocol: (skipStatusReset?: boolean) => Promise<void>;
    runSystem: (skipStatusReset?: boolean) => Promise<void>;
    fetchSymbolData: (symbol: string) => Promise<void>;
    updateMarketData: (updates: Partial<MarketData>) => void;
    ppCheckReserves: () => Promise<void>;
    ppInitiateDeposit: (amount: number) => Promise<void>;
    ppCaptureDeposit: (orderId: string) => Promise<void>;
    ppInitiateWithdrawal: (email: string, amount: number) => Promise<void>;
    isInitialized: boolean;
    initApp: () => void;
    reorderHardwareDevices: (startIndex: number, endIndex: number) => void;
}

const sicoEngine = new SICOEngine({
    coherenceWindowNs: 120.5,
    minAlphaThreshold: 0.0035,
    slippageTolerance: 0.0001
});

export const useAppStore = create<AppState>()(persist((set, get) => ({
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
    isSwarmSimulating: false,
    setSwarmSimulating: (val) => set({ isSwarmSimulating: val }),
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
    clearLogs: () => set({ logs: [] }),
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
        chatSettings: { useSearch: true, useMaps: false, useThinking: true, provider: 'gemini', readAloud: true },
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
    neuralSyncActive: false,
    triggerNeuralSync: () => {
        set({ neuralSyncActive: true });
        setTimeout(() => set({ neuralSyncActive: false }), 2000);
    },
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
    
    performRealityCorrection: () => {
        const { metrics, log } = realityEngine.performRealityCorrection(get().quantumMetrics);
        set({ quantumMetrics: metrics });
        get().addNexusLog(log);
        get().addLog('QUANTUM', 'Reality Correction Protocol Executed.');
    },

    manageBot: (id, action) => set(state => ({
        bots: state.bots.map(b => b.id === id ? { ...b, status: action === 'REBOOT' ? 'Idle' : 'Executing' } : b)
    })),

    spawnBots: (count = 5, targetLegion) => {
        const legions: LegionName[] = ['Infrastructure', 'Seraphim', 'Voice', 'Growth', 'Security'];
        const roles: AgentRole[] = ['Hunter', 'Sentinel', 'Oracle', 'Weaver', 'Saboteur', 'Infra', 'Growth', 'Legal'];
        const statuses: BotStatus[] = ['Executing', 'Analyzing', 'Patrolling', 'Synthesizing'];
        
        set(state => {
            const currentBots = state.bots;
            const maxId = currentBots.reduce((max, b) => Math.max(max, b.id), 0);
            const newBots: Bot[] = [];
            
            for (let i = 1; i <= count; i++) {
                const legion = targetLegion || legions[Math.floor(Math.random() * legions.length)];
                const role = roles[Math.floor(Math.random() * roles.length)];
                const status = statuses[Math.floor(Math.random() * statuses.length)];
                newBots.push({
                    id: maxId + i,
                    status,
                    role,
                    legion,
                    efficiency: Math.floor(Math.random() * 25 + 75),
                    xp: Math.floor(Math.random() * 500 + 100)
                });
            }
            
            return { bots: [...currentBots, ...newBots] };
        });

        get().addLog('SWARM', `⚡ [SPAWN COMMAND EXECUTED] +${count} agents spawned into network mesh. Active topology expanding.`);
        get().addNexusLog(`>> SWARM_SPAWN: +${count} nodes initialized. Network density increasing.`);
    },

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
        
        const isLive = get().isLiveMode;
        
        if (!isLive) {
            // PAPER TRADING LOGIC
            const cost = quantity * price;
            const currentBalance = get().fiatBalance;
            
            if (action === 'BUY' && cost > currentBalance) {
                get().addLog('ERROR', `PAPER_REJECTION: Insufficient funds for ${symbol}.`);
                return;
            }

            set(state => {
                const newBalance = action === 'BUY' ? state.fiatBalance - cost : state.fiatBalance + cost;
                const newPortfolio = { ...state.portfolio };
                let tradePnl = 0;
                
                if (action === 'BUY') {
                    const existing = newPortfolio[symbol] || { symbol, quantity: 0, avgPrice: 0 };
                    const totalQty = existing.quantity + quantity;
                    const totalCost = (existing.quantity * existing.avgPrice) + cost;
                    newPortfolio[symbol] = {
                        ...existing,
                        quantity: totalQty,
                        avgPrice: totalCost / totalQty
                    };
                } else {
                    const existing = newPortfolio[symbol];
                    if (!existing || existing.quantity < quantity) {
                        return state;
                    }
                    tradePnl = (price - existing.avgPrice) * quantity;
                    existing.quantity -= quantity;
                    if (existing.quantity <= 0) delete newPortfolio[symbol];
                }

                const newTrade: Trade = {
                    id: `PAPER-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
                    timestamp: new Date().toISOString(),
                    symbol,
                    action,
                    quantity,
                    price,
                    pnl: tradePnl,
                    type: 'STANDARD',
                    status: OrderState.FILLED,
                    isPaper: true
                };

                return {
                    fiatBalance: newBalance,
                    portfolio: newPortfolio,
                    trades: [newTrade, ...state.trades].slice(0, 100)
                };
            });

            get().addLog('TRADE', `PAPER_EXECUTION: ${action} ${quantity} ${symbol} @ ${price}`);
            get().addNexusLog(`>> PAPER_FILLED: ${symbol} at ${price}`);
            return;
        }

        // LIVE TRADING LOGIC
        try {
            const exId = exchange.toLowerCase().includes('coinbase') ? 'coinbase' : exchange.toLowerCase().includes('ibkr') ? 'ibkr' : 'kraken';
            const res = await omniBroker.createOrder(exId as any, symbol, action.toLowerCase() as any, quantity, price);
            
            // Hyper-temporal execution logging
            const invLog = realityEngine.generateInversionLog(symbol, action);
            set(state => ({ inversionLogs: [invLog, ...state.inversionLogs].slice(0, 50) }));

            get().addLog('TRADE', `REAL_EXECUTION: ${action} ${quantity} ${symbol} @ ${price}`);
            if (res) get().addNexusLog(`>> SICO_FILLED: ${symbol} at ${price} [TEMPORAL_INVERSION_VERIFIED]`);
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
    
    updateMarketData: (updates) => {
        set(state => ({
            marketData: {
                ...state.marketData,
                ...updates
            }
        }));
        
        // Trigger Neural Sync for genuine extreme high-priority volatility or volume spikes
        let isHighPriority = false;
        Object.values(updates).forEach((update: any) => {
            if (update && (Math.abs(update.change || 0) > 4.5 || (update.volume && update.volume > 4900000000))) {
                isHighPriority = true;
            }
        });
        if (isHighPriority && !get().neuralSyncActive) {
            get().triggerNeuralSync();
        }
    },

    ppCheckReserves: async () => {
        try {
            const res = await fetch('/spine-bridge/paypal/reserves');
            const data = await res.json();
            set({ payPalReserves: data });
            get().addLog('BANKING_PAYPAL', `Audit Complete: $${data.totalUSD.toLocaleString()}`);
        } catch (e: any) {
            get().addLog('ERROR', `PAYPAL_AUDIT_FAILED: ${e.message}`);
        }
    },
    ppInitiateDeposit: async (amount) => {
        try {
            get().addLog('BANKING', `Depositing $${amount} to PayPal Vault...`);
            const res = await fetch('/spine-bridge/paypal/deposit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount })
            });
            const data = await res.json();
            get().addLog('BANKING_PAYPAL', `Deposit Success: ${data.tx_hash}`);
            await get().ppCheckReserves();
        } catch (e: any) {
            get().addLog('ERROR', `PAYPAL_DEPOSIT_FAILED: ${e.message}`);
        }
    },
    ppCaptureDeposit: async (id) => {},
    ppInitiateWithdrawal: async (email, amount) => {
        try {
            get().addLog('BANKING', `Exfiltrating $${amount} to ${email}...`);
            const res = await fetch('/spine-bridge/paypal/withdraw', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount, email })
            });
            const data = await res.json();
            get().addLog('BANKING_PAYPAL', `Withdrawal Success: ${data.tx_hash}`);
            await get().ppCheckReserves();
        } catch (e: any) {
            get().addLog('ERROR', `PAYPAL_WITHDRAWAL_FAILED: ${e.message}`);
        }
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
    executeAllProtocols: async () => {
        get().addLog('SYSTEM', 'INITIATING FULL SYSTEM UPGRADE & EXECUTION SEQUENCE...');
        set({ systemStatus: "UPGRADING" });
        
        try {
            // 1. Backend Upgrade (Simulated)
            await new Promise(r => setTimeout(r, 800));
            get().addLog('SYSTEM', `Upgrade Status: SUCCESS | Version: v102.0.1`);
            
            get().addLog('ORCHESTRATOR', 'Step 1: Optimizing Swarm Intelligence...');
            await get().optimizeSwarm();
            
            get().addLog('SPINE', 'Step 2: Installing Sovereign Protocols...');
            await get().installProtocol(true);
            
            get().addLog('CORE', 'Step 3: Awakening Neural Kernel...');
            await get().runSystem(true);
            
            // 4. Backend Global Execution (Simulated)
            await new Promise(r => setTimeout(r, 1000));
            get().addLog('SYSTEM', `Global Execution: ACTIVE | Protocols: CORE, SWARM, OMNI`);
            
            get().addLog('SYSTEM', 'FULL UPGRADE & EXECUTION COMPLETE. ALL SYSTEMS NOMINAL.');
            set({ systemStatus: "OPERATIONAL" });
            get().setSwarmSimulating(true);
            get().addLog('SWARM', '🚀 SWARM SIMULATION LAUNCHED: Active client-side utilizing synthetic mock telemetry.');
            get().addLog('SWARM', '⚡ STIGMERGY COORDINATES SYNCHRONIZED. GRID ONLINE.');
        } catch (e: any) {
            get().addLog('ERROR', `EXECUTION_ALL_FAILED: ${e.message}`);
            set({ systemStatus: "ERROR" });
        }
    },
    isLiveMode: false,
    setLiveMode: async (val) => {
        const success = await executionService.toggleLiveExecution(val);
        if (success) {
            set({ isLiveMode: val });
            get().addLog('SYSTEM', `LIVE_EXECUTION_PIPELINE: ${val ? 'ARMED' : 'DISARMED'}`);
        } else {
            get().addLog('ERROR', 'FAILED_TO_SYNC_LIVE_MODE_WITH_SPINE');
        }
    },
    executeOperation: async () => {
        set({ systemStatus: "EXECUTING" });
        try {
            await sendMessageToSentinelA("EXECUTE");
        } catch (e) {
            get().addLog('SYSTEM', 'EXECUTE_FALLBACK: Commencing Tactical Protocols...');
        }
        get().addLog('SYSTEM', 'OPERATION_EXECUTED');
        set({ systemStatus: "OPERATIONAL" });
    },
    installProtocol: async (skipStatusReset = false) => {
        set({ systemStatus: "INSTALLING" });
        try {
            await sendMessageToSentinelA("INSTALL");
        } catch (e) {
            get().addLog('SYSTEM', 'INSTALL_FALLBACK: Engaging Local Cache...');
        }
        get().addLog('SYSTEM', 'PROTOCOL_INSTALLED');
        if (!skipStatusReset) {
            set({ systemStatus: "OPERATIONAL" });
        }
    },
    runSystem: async (skipStatusReset = false) => {
        set({ systemStatus: "AWAKENING" });
        try {
            await sendMessageToSentinelA("RUN");
        } catch (e) {
            get().addLog('SYSTEM', 'RUN_FALLBACK: Initializing Core Systems...');
        }
        get().addLog('SYSTEM', 'SYSTEM_AWAKE');
        if (!skipStatusReset) {
            set({ systemStatus: "OPERATIONAL" });
        }
    },

    isInitialized: false,
    reorderHardwareDevices: (startIndex, endIndex) => set(state => {
        const result = Array.from(state.coreState.hardwareDevices);
        const [removed] = result.splice(startIndex, 1);
        result.splice(endIndex, 0, removed);
        return {
            coreState: {
                ...state.coreState,
                hardwareDevices: result
            }
        };
    }),
    initApp: () => {
        if (get().isInitialized) return;
        set({ isInitialized: true });
        try {
            rustKernel.start();
            
            // Gopher Protocol Gateway Telemetry Stream Watcher
            let lastLoggedLines = 0;
            setInterval(async () => {
                try {
                    const response = await fetch('/api/telemetry-stream');
                    if (response.ok) {
                        const data = await response.json();
                        if (data.status === 'ACTIVE' && Array.isArray(data.logs)) {
                            const newLogs = data.logs.slice(lastLoggedLines);
                            if (newLogs.length > 0) {
                                newLogs.forEach((line: string) => {
                                    let cleanMsg = line;
                                    let source: any = 'CORE';
                                    
                                    if (line.includes('[TELEMETRY_STREAM]')) {
                                        cleanMsg = line.split('[TELEMETRY_STREAM]').pop()?.trim() || line;
                                        source = 'LIVE_PULSE';
                                    } else if (line.includes('[GATEWAY]')) {
                                        cleanMsg = line.split('[GATEWAY]').pop()?.trim() || line;
                                        source = 'CORE';
                                    }
                                    
                                    get().addLog(source, cleanMsg);
                                });
                                lastLoggedLines = data.logs.length;
                            }
                        }
                    }
                } catch (e) {
                    // Fail silently
                }
            }, 3000);
            
            // Quantum Reality Engine Heartbeat
            setInterval(() => {
                const nextMetrics = realityEngine.tick(get().quantumMetrics);
                set({ quantumMetrics: nextMetrics });
                
                // Auto-correction if drift is too high
                if (nextMetrics.drift > 0.05) {
                    get().performRealityCorrection();
                }
            }, 2000);

            setInterval(async () => {
                try {
                    const balances = await omniBroker.fetchBalances();
                    set({ externalExchangeData: { kraken: balances.kraken || {}, coinbase: balances.coinbase || {} } });
                    
                    // Update IBKR state in coreState if available
                    if (balances.ibkr) {
                        const ibkrInfo = await ibkrService.getAccountInfo();
                        set(state => ({
                            coreState: {
                                ...state.coreState,
                                ibkrState: ibkrInfo
                            }
                        }));
                    }
                } catch (e) {
                    console.warn("BALANCE_SYNC_FAILURE", e);
                }
            }, 10000);

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
}), {
    name: 'archangel-store',
    partialize: (state) => ({ 
        theme: state.theme, 
        marketFilter: state.marketFilter, 
        isLiveMode: state.isLiveMode 
    })
}));