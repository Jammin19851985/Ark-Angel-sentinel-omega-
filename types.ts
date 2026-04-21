
export interface Message {
    author: 'sentinel' | 'user';
    content: string;
    sources?: any[]; 
    provider?: 'GEMINI' | 'OPENAI';
}

export interface Holding {
    symbol: string;
    quantity: number;
    avgPrice: number;
    qualityScore?: number;
    stability?: number;
    strikes?: number;
    isRetired?: boolean;
}

export interface Portfolio {
    [symbol: string]: Holding;
}

export interface MarketData {
    [symbol: string]: {
        price: number;
        change: number; 
        changeAbsolute: number;
        volume: number;
    };
}

export interface ExternalExchangeData {
    kraken: Record<string, { last: number; ask: number; bid: number }>;
    coinbase?: Record<string, { last: number; ask: number; bid: number }>;
}

export interface ArbOpportunity {
    symbol: string;
    buyVenue: string;
    sellVenue: string;
    spread: number;
    spreadPercent: number;
    timestamp: number;
}

export type BotStatus = 'Executing' | 'Analyzing' | 'Idle' | 'Patrolling' | 'Synthesizing' | 'Defending';
export type AgentRole = 'Hunter' | 'Sentinel' | 'Oracle' | 'Weaver' | 'Saboteur' | 'Infra' | 'Persona' | 'Growth' | 'Legal';
export type LegionName = 'Infrastructure' | 'Seraphim' | 'Voice' | 'Growth' | 'Security';

export interface Bot {
    id: number;
    status: BotStatus;
    role: AgentRole;
    legion: LegionName;
    efficiency: number;
    xp: number;
    tech?: string;
}

export interface LogEntry {
    timestamp: string;
    source: 'MARKET' | 'SWARM' | 'TRADE' | 'SENTINEL' | 'SYSTEM' | 'AI_TOOLKIT' | 'ORCHESTRATOR' | 'BOOT' | 'SONAR' | 'ERROR' | 'NEXUS' | 'CAUSAL' | 'LIVE_PULSE' | 'AODE' | 'QUANTUM' | 'BLOCKCHAIN' | 'BANKING' | 'BANKING_PAYPAL' | 'SCALPER' | 'SHADOW' | 'FORENSIC' | 'LEGION' | 'XEDO' | 'MLEM' | 'SENTRY' | 'SPINE' | 'PAPER' | 'VAULT' | 'AUTONOMY' | 'AUDIT' | 'BIOMETRIC' | 'DIRECTIVE' | 'EXCHANGE' | 'RUST_KRNL' | 'MEV_GUARD' | 'IBKR' | 'HARDWARE' | 'AUTH' | 'FINANCE' | 'CORE';
    message: string;
    complianceHash?: string;
}

export enum OrderState {
    CREATED = 'CREATED',
    PRECHECK = 'PRECHECK',
    SUBMITTED = 'SUBMITTED',
    PRESUBMITTED = 'PRESUBMITTED',
    PENDING_SUBMIT = 'PENDING_SUBMIT',
    PARTIALLY_FILLED = 'PARTIALLY_FILLED',
    FILLED = 'FILLED',
    CANCELLED = 'CANCELLED',
    REJECTED = 'REJECTED',
    EXPIRED = 'EXPIRED',
    FAILED = 'FAILED'
}

export interface Trade {
    id: string;
    timestamp: string;
    symbol: string;
    action: 'BUY' | 'SELL';
    quantity: number;
    price: number;
    pnl: number;
    type: 'STANDARD' | 'SICO' | 'BRACKET_EXIT' | 'SOVEREIGN_HUNT';
    status: OrderState;
    auditHash?: string;
    tesScore?: number;
    coherenceAtExecution?: number;
    quboEnergyAtExecution?: number;
    mlemVerified?: boolean;
    isPaper?: boolean;
    isShadow?: boolean;
    qualityAtExecution?: number;
    capitalScaleAtExecution?: number;
    isAutonomous?: boolean;
    exchange?: string;
}

export interface ActiveOrder {
    id: string;
    parentId: string; // Link to the original entry trade
    symbol: string;
    action: 'BUY' | 'SELL';
    quantity: number;
    type: 'STOP_LOSS' | 'TAKE_PROFIT';
    triggerPrice: number;
    status: 'PENDING' | 'TRIGGERED' | 'CANCELLED';
    timestamp: number;
}

export interface ProposedTrade {
    id: string;
    symbol: string;
    action: 'BUY' | 'SELL';
    quantity: number;
    price: number;
    confidence: number;
    alphaScore: number;
    reason: string;
    timestamp: number;
}

export type TradeMode = 'REAL_WORLD' | 'AUTONOMOUS' | 'SOVEREIGN' | 'AODE_QUANTUM' | 'LIVE_IBKR';

export interface AnalyticsKPIs {
    winRate: number;
    sharpeRatio: number;
    maxDrawdown: number;
    totalPnl: number;
    pnlPercent: number;
    globalOptimality?: number;
    stochasticAlpha?: number;
}

export interface ForecastPoint {
    date: string;
    price: number;
}

export type ActiveView = 'sentinel' | 'orchestrator' | 'toolkit' | 'backtester' | 'analytics' | 'intel' | 'sonar' | 'nexus' | 'shadow_terminal';

export interface SonarSignal {
    id: number;
    lat: number;
    lon: number;
    type: 'Financial' | 'Geopolitical' | 'Cyber' | 'Quantum';
    threat: 'Low' | 'Medium' | 'High';
    timestamp: string;
    details: string;
}

export interface LearningParams {
    learningRate: number;
    batchSize: number;
    activationFunction: 'ReLU' | 'Sigmoid' | 'Tanh' | 'Leaky ReLU';
    epochs: number;
    optimizer: 'Adam' | 'SGD' | 'RMSprop';
}

export type ToolkitTab = 'chat' | 'image' | 'video' | 'audio' | 'code' | 'sentiment' | 'rag' | 'learning_params' | 'sentry' | 'analysis';

export interface CodeAnalysisResult {
    bugs: string[];
    security: string[];
    optimizations: string[];
    summary: string;
}

export interface AiToolkitState {
    activeTab: ToolkitTab;
    chatSettings: {
        useSearch: boolean;
        useMaps: boolean;
        useThinking: boolean;
        provider: 'gemini' | 'openai';
    };
    learningParams: LearningParams;
}

export interface QuantumMetrics {
    qubitCoherence: number;
    fsfMetric: number;
    quboEnergy: number;
    acmdStatus: 'ACTIVE' | 'PATCHING' | 'IDLE';
    gpGenerations: number;
    boredom: number;
    entropy: number;
    drift: number;
    trustScore: number;
    regime: string;
    dnaIntegrity: number;
    satelliteLink: number;
    atmosphericNoise: number;
    realityAnchorStability: number;
    selfAuditProgress: number;
    executionLatency: number;
    tesScore: number; 
}

export interface StrategyMetrics {
    qualityScore: number;
    drawdown: number;
    stability: number;
    capitalScale: number;
    strikes: number;
    isRetired: boolean;
}

export interface AutonomyMetrics {
    healthScore: number;
    hesitationLevel: number;
    suppressionActive: boolean;
    confidenceDecayFactor: number;
    lastRevocationReason: string | null;
    cooldownRemaining: number;
    isInRevocation: boolean;
    anomalyDetected: boolean;
    performanceMilestoneMet: boolean;
    lockedContracts: string[]; 
}

export interface BiometricMetrics {
    hrv: number;
    stressIndex: number;
    isAuthorized: boolean;
    lastSync: number;
}

export interface RustSpineMetrics {
    kernelLatency: number;
    throughput: number;
    rateLimitUsage: number;
    heartbeatStatus: 'HEALTHY' | 'DEGRADED' | 'FAILED';
    partialFillEfficiency: number;
}

export interface MevMetrics {
    mempoolExposure: number;
    privateRpcActive: boolean;
    bundlesSent: number;
    sandwichAttemptsBlocked: number;
    currentSlippageLimit: number;
    isFlashbotsBypassActive: boolean;
}

export interface IbkrAccountInfo {
    accountNumber: string;
    isArmed: boolean;
    latency: number;
    marginUtilization: number;
    buyingPower: number;
    baseCurrency: string;
    mode?: 'LIVE' | 'MOCK' | 'ERROR';
    safetySwitch?: boolean;
}

export interface HardwareDevice {
    id: string;
    type: 'ARDUINO_SENTINEL' | 'TPM_MODULE' | 'FIPS_HSM';
    status: 'CONNECTED' | 'LOCKED' | 'TAMPERED';
    firmwareVersion: string;
    lastAttestation: number;
}

export interface ArchangelCoreState {
    confidence: number;
    approved: boolean;
    lastHash: string;
    ledgerSize: number;
    quorumStatus: 'VERIFIED' | 'PENDING' | 'HALTED';
    buyingPower: number;
    spineHeartbeatAge: number;
    monotonicTime: number; 
    killSwitchActive: boolean;
    hardwareSignedDevices: string[];
    hardwareQuorumRequired: number;
    survivalDrawdownLimit: number;
    structuralAlphaThreshold: number;
    isAutonomyUnlocked: boolean;
    decisionCoreActive: boolean;
    strategyMetrics: StrategyMetrics;
    autonomyMetrics: AutonomyMetrics;
    biometricMetrics: BiometricMetrics;
    rustSpineMetrics: RustSpineMetrics;
    mevMetrics: MevMetrics;
    ibkrState: IbkrAccountInfo;
    activeDirectives: Record<string, boolean>;
    profitVault: number;
    hardwareDevices: HardwareDevice[];
    lastSystemOp?: 'EXECUTE' | 'INSTALL' | 'RUN';
    regulatoryStatus?: 'BYPASSED' | 'BLINDED' | 'ACTIVE';
    shadowModeActive?: boolean;
}

export interface PrimeSuggestion {
    id: number;
    label: string;
    status: 'ACTIVE' | 'PENDING' | 'ERROR';
}

export interface ProtocolNode {
    id: number;
    code: string;
    name: string;
    load: number;
    status: 'STABLE' | 'DECOHERENT' | 'SYNTHESIZING';
}

export interface OrchestrationStep {
    id: string;
    description: string;
    toolName?: string;
    status: 'pending' | 'in_progress' | 'completed' | 'failed';
    result?: {
        type: 'text' | 'image';
        content?: string;
        url?: string;
    };
}

export interface SentimentResult {
    overall_sentiment: number;
    sentiment_label: string;
    key_topics: string[];
    summary: string;
    sources?: string[];
}

export interface RagQueryResult {
    text: string;
    sources: string[];
}

export interface ChatMessage {
    author: 'gemini' | 'openai' | 'user';
    content: string;
    sources?: any[];
}

export interface TourStep {
    selector: string;
    title: string;
    content: string;
    placement: 'top' | 'bottom' | 'left' | 'right';
}

export interface EquityDataPoint {
    date: string;
    value: number;
    trade?: 'buy' | 'sell';
}

export interface BacktestResults {
    totalPnl: number;
    pnlPercentage: number;
    winRate: number;
    maxDrawdown: number;
    maxDrawdownPercentage: number;
    equityCurve: EquityDataPoint[];
}

export interface CandlestickData {
    date: string;
    open: number;
    high: number;
    low: number;
    close: number;
}

export interface CycleLog {
    cycle: number;
    spot: number;
    net_delta: number;
    net_gamma: number;
    hedge_action: string;
    hedge_size: number;
    net_pnl_today_usd: number;
    total_pnl_usd: number;
}

export interface GammaSessionState {
    isRunning: boolean;
    cycleCount: number;
    logs: CycleLog[];
    totalPnl: number;
    iv: number;
    spotPrice: number;
}

export interface InversionEventLog {
    id: string;
    type: 'STANDARD' | 'PARADOX';
    symbol: string;
    action: 'BUY' | 'SELL';
    temporalAnchors: {
        tMinus: number;
        tZero: number;
        latencyDelta: number;
    };
    vectorOfTruth: {
        causalDriftScore: number;
        predictedStateHash: string;
        manifestedStateHash: string;
    };
}

export interface Geolocation {
    latitude: number;
    longitude: number;
}

export interface GrandSlamFeature {
    id: number;
    name: string;
    status: 'LOCKED' | 'DEPLOYED' | 'MONITORING';
    description?: string;
    technicalAlias?: string;
}

export interface ApexTarget {
    alias: string;
    address: string;
    threatLevel: number;
    lastVector: string;
    confidence: number;
}

export interface InterceptedAsset {
    codename: string;
    contract: string;
    auditStatus: 'PASSED' | 'FAILED' | 'PENDING';
    liquidity: string;
}

export type BacktestStrategy = 'sma_crossover' | 'rsi_momentum' | 'tri_arb' | 'hft_market_making';

// PayPal Integration Types
export interface PayPalReserves {
    totalUSD: number;
    status: 'SYNCHRONIZED' | 'DRIFTING' | 'OFFLINE';
    lastAudit: number;
    history: number[];
}

export interface PayPalOrder {
    id: string;
    approvalUrl: string;
    amount: number;
    status: 'CREATED' | 'APPROVED' | 'CAPTURED';
}

export interface BankingStatus {
    errors: number;
    lastSync: string;
}

export interface BankingConfig {
    provider: string;
    mode: 'LIVE' | 'SANDBOX';
    triggerThreshold: number;
    keepReserve: number;
    targetEmail: string;
    currency: string;
    clientId?: string;
    clientSecret?: string;
    status: BankingStatus;
}
