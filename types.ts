
export interface Message {
    author: 'sentinel' | 'user';
    content: string;
    sources?: any[]; 
}

export interface Holding {
    symbol: string;
    quantity: number;
    avgPrice: number;
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

export type BotStatus = 'Executing' | 'Analyzing' | 'Idle';

export interface Bot {
    id: number;
    status: BotStatus;
}

export interface LogEntry {
    timestamp: string;
    source: 'MARKET' | 'SWARM' | 'TRADE' | 'SENTINEL' | 'SYSTEM' | 'AI_TOOLKIT' | 'ORCHESTRATOR' | 'BOOT' | 'SONAR' | 'ERROR' | 'NEXUS' | 'CAUSAL' | 'LIVE_PULSE' | 'AODE' | 'QUANTUM' | 'BLOCKCHAIN' | 'BANKING' | 'SCALPER' | 'SHADOW' | 'FORENSIC';
    message: string;
}

export interface Geolocation {
    latitude: number;
    longitude: number;
}

export interface ChatMessage {
    author: 'gemini' | 'user';
    content: string;
    sources?: any[];
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

export interface OrchestrationStep {
    id: number;
    description: string;
    toolName?: string;
    status: 'pending' | 'in_progress' | 'completed' | 'failed';
    result?: { type: 'image' | 'video' | 'audio', url: string } | { type: 'text', content: string };
    error?: string;
}

export interface CandlestickData {
    date: string;
    open: number;
    high: number;
    low: number;
    close: number;
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

export interface Trade {
    id: string;
    timestamp: string;
    symbol: string;
    action: 'BUY' | 'SELL';
    quantity: number;
    price: number;
    pnl: number;
    type?: 'STANDARD' | 'SICO';
    quboOptimality?: number;
    status?: 'FILLED' | 'PARTIAL' | 'REJECTED' | 'EXPIRED';
    slippage?: number;
    fee?: number;
    latency?: number;
}

export interface AnalyticsKPIs {
    winRate: number;
    sharpeRatio: number;
    maxDrawdown: number;
    totalPnl: number;
    pnlPercent: number;
}

export interface ForecastPoint {
    date: string;
    price: number;
}

export type ActiveView = 'sentinel' | 'orchestrator' | 'toolkit' | 'backtester' | 'analytics' | 'intel' | 'sonar' | 'nexus';

export interface SonarSignal {
    id: number;
    lat: number;
    lon: number;
    type: 'Financial' | 'Geopolitical' | 'Cyber' | 'Quantum';
    threat: 'Low' | 'Medium' | 'High';
    timestamp: string;
    details: string;
}

export interface TourStep {
    selector: string;
    title: string;
    content: string;
    placement: 'top' | 'bottom' | 'left' | 'right';
}

export interface LearningParams {
    learningRate: number;
    batchSize: number;
    activationFunction: 'ReLU' | 'Sigmoid' | 'Tanh' | 'Leaky ReLU';
    epochs: number;
    optimizer: 'Adam' | 'SGD' | 'RMSprop';
}

export type ToolkitTab = 'chat' | 'image' | 'video' | 'audio' | 'code' | 'sentiment' | 'rag' | 'learning_params';

export interface AiToolkitState {
    activeTab: ToolkitTab;
    chatSettings: {
        useSearch: boolean;
        useMaps: boolean;
        useThinking: boolean;
    };
    learningParams: LearningParams;
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
    quantum_coherence?: number;
    adaptive_iv?: number;
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
    type: 'INVERSION' | 'PARADOX'; 
    symbol: string;
    action: 'BUY' | 'SELL';
    temporalAnchors: {
        tMinus: number;
        tZero: number; 
        tPlus: number; 
        latencyDelta: number;
    };
    vectorOfTruth: {
        predictedStateHash: string;
        manifestedStateHash: string;
        causalDriftScore: number;
    };
    financialOutcome: {
        projectedRoi: number;
        realizedRoi: number;
        slippageAttribution?: string;
    };
}

export interface QuantumMetrics {
    qubitCoherence: number;
    fsfMetric: number;
    quboEnergy: number;
    acmdStatus: 'ACTIVE' | 'PATCHING' | 'IDLE';
    gpGenerations: number;
    // New Advanced Metrics
    boredom: number;
    entropy: number;
    drift: number;
    trustScore: number;
}

export interface ArchangelCoreState {
    confidence: number;
    approved: boolean;
    lastHash: string;
    ledgerSize: number;
}
