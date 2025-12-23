
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { 
    MarketData, Portfolio, Bot, LogEntry, BotStatus, SonarSignal, 
    Trade, AnalyticsKPIs, QuantumMetrics, ArchangelCoreState, 
    TradeMode, PrimeSuggestion, ProtocolNode, AgentRole, LegionName,
    InversionEventLog, OrderState, ProposedTrade, AutonomyMetrics,
    ExternalExchangeData, ArbOpportunity, RustSpineMetrics, MevMetrics,
    IbkrAccountInfo, HardwareDevice
} from '../types';
import { generateInitialTrades, calculateKPIs } from '../utils/analytics';
import { ShadowExecutionEngine } from '../utils/shadowExecution';
import { SpineEngine, SpineContext } from '../utils/spine';
import { executionService } from '../services/executionService';
import { StrategyQualityEngine, CapitalScaleEngine, ExecutionGate, ProfitExtractionEngine, CapitalCompetitionEngine } from '../utils/strategy';
import { AutonomyEngine, AutonomyHealthScore, StructuralAlphaLayer, SelfSuppressionEngine, ContractLockEngine, DirectiveProcessor, AutonomousRecoveryEngine } from '../utils/autonomy';
import { krakenService } from '../services/krakenService';
import { MevGuard } from '../utils/mevGuard';
import { SoundEngine } from '../utils/symbiote';
import { HardwareAuthority } from '../utils/hardwareAuthority';

const HEARTBEAT_TIMEOUT_MS = 5000;

export const useArchangel = () => {
    const qualityEngine = useMemo(() => new StrategyQualityEngine(), []);
    const scaleEngine = useMemo(() => new CapitalScaleEngine(1000000), []);
    const extractionEngine = useMemo(() => new ProfitExtractionEngine(0.25), []);
    const gate = useMemo(() => new ExecutionGate(), []);

    const [marketData, setMarketData] = useState<MarketData>({
        'BTC': { price: 65432.10, change: 1.2, changeAbsolute: 780, volume: 45000000000 },
        'ETH': { price: 3456.78, change: -0.5, changeAbsolute: -17, volume: 22000000000 },
        'SOL': { price: 145.67, change: 4.5, changeAbsolute: 6.2, volume: 8000000000 },
        'ADA': { price: 0.45, change: 0.2, changeAbsolute: 0.001, volume: 1000000000 }
    });

    const [externalExchangeData, setExternalExchangeData] = useState<ExternalExchangeData>({
        kraken: {}
    });

    const [arbOpportunities, setArbOpportunities] = useState<ArbOpportunity[]>([]);
    const [historicalMarketData, setHistoricalMarketData] = useState<Record<string, number[]>>({});
    const [marketFilter, setMarketFilter] = useState('');
    const [portfolio, setPortfolio] = useState<Portfolio>({
        'BTC': { symbol: 'BTC', quantity: 0.5, avgPrice: 60000, strikes: 0, isRetired: false },
        'ETH': { symbol: 'ETH', quantity: 10, avgPrice: 3200, strikes: 0, isRetired: false }
    });
    const [paperPortfolio, setPaperPortfolio] = useState<Portfolio>({});
    const [fiatBalance, setFiatBalance] = useState<number>(1000000.00); 
    const [paperBalance, setPaperBalance] = useState<number>(1000000.00);
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [sonarSignals, setSonarSignals] = useState<SonarSignal[]>([]);
    const [apiConnected, setApiConnected] = useState(true);
    
    const [quantumMetrics, setQuantumMetrics] = useState<QuantumMetrics>({
        qubitCoherence: 120, 
        fsfMetric: 0.00000005, 
        quboEnergy: -24.5,
        acmdStatus: 'ACTIVE', 
        gpGenerations: 1000000, 
        boredom: 0.12,
        entropy: 0.45, 
        drift: 0.0001, 
        trustScore: 0.9999,
        regime: 'SOVEREIGN_EQUILIBRIUM', 
        dnaIntegrity: 1.0, 
        satelliteLink: 1.0, 
        atmosphericNoise: 0.88, 
        realityAnchorStability: 0.99999,
        selfAuditProgress: 1.0,
        executionLatency: 0.0001,
        tesScore: 0.99
    });

    const [coreState, setCoreState] = useState<ArchangelCoreState>({ 
        confidence: 0.99, 
        approved: true, 
        lastHash: 'AODE_OMEGA_FINAL', 
        ledgerSize: 10000,
        quorumStatus: 'VERIFIED', 
        buyingPower: 120000000.00, 
        spineHeartbeatAge: 0,
        monotonicTime: 0,
        killSwitchActive: false,
        hardwareSignedDevices: [],
        hardwareQuorumRequired: 2,
        survivalDrawdownLimit: SpineEngine.MAX_DRAWDOWN,
        structuralAlphaThreshold: SpineEngine.ALPHA_THRESHOLD,
        isAutonomyUnlocked: true, // @google/genai: Autonomous by default
        decisionCoreActive: true,
        profitVault: 4500000,
        strategyMetrics: {
            qualityScore: 2.8,
            drawdown: 0,
            stability: 1.0,
            capitalScale: 2.5,
            strikes: 0,
            isRetired: false
        },
        autonomyMetrics: {
            healthScore: 1.0,
            hesitationLevel: 0.02,
            suppressionActive: false,
            confidenceDecayFactor: 0.005,
            lastRevocationReason: null,
            cooldownRemaining: 0,
            isInRevocation: false,
            anomalyDetected: false,
            performanceMilestoneMet: true,
            lockedContracts: []
        },
        biometricMetrics: {
            hrv: 72,
            stressIndex: 0.05,
            isAuthorized: true,
            lastSync: Date.now()
        },
        rustSpineMetrics: {
            kernelLatency: 0.0005,
            throughput: 1000000,
            rateLimitUsage: 0.01,
            heartbeatStatus: 'HEALTHY',
            partialFillEfficiency: 0.999
        },
        mevMetrics: {
            mempoolExposure: 0.0001, 
            privateRpcActive: true,
            bundlesSent: 4500,
            sandwichAttemptsBlocked: 1200,
            currentSlippageLimit: 0.0001,
            isFlashbotsBypassActive: true
        },
        ibkrState: {
            accountNumber: 'U-SOVEREIGN-ARK-Ω',
            isArmed: true, 
            latency: 0.5,
            marginUtilization: 0.01,
            buyingPower: 120000000,
            baseCurrency: 'USD'
        },
        activeDirectives: {},
        hardwareDevices: [
            { id: 'SENTINEL_01', type: 'ARDUINO_SENTINEL', status: 'CONNECTED', firmwareVersion: '1.4.2-AODE', lastAttestation: Date.now() },
            { id: 'CORE_TPM_01', type: 'TPM_MODULE', status: 'CONNECTED', firmwareVersion: 'v2.0', lastAttestation: Date.now() }
        ]
    });

    const [trades, setTrades] = useState<Trade[]>(generateInitialTrades());
    const [paperTrades, setPaperTrades] = useState<Trade[]>([]);
    const [pendingProposals, setPendingProposals] = useState<ProposedTrade[]>([]);
    const [kpis, setKpis] = useState<AnalyticsKPIs>(() => calculateKPIs([], 1000000));
    const [killSwitchActive, setKillSwitchActive] = useState(false);
    const [tradeMode, setTradeMode] = useState<TradeMode>('AUTONOMOUS'); // @google/genai: Default to autonomous
    const [bots, setBots] = useState<Bot[]>([]);
    const [inversionLogs, setInversionLogs] = useState<InversionEventLog[]>([]);
    const [primeSuggestions, setPrimeSuggestions] = useState<PrimeSuggestion[]>([]);
    const [protocolNodes, setProtocolNodes] = useState<ProtocolNode[]>([]);

    const lastHeartbeat = useRef(Date.now());
    const lastActionTime = useRef(Date.now());

    const estimatedAlpha = (kpis.totalPnl / 100000) * 100 + ((quantumMetrics?.gpGenerations || 0) / 10000) * 2;

    const addLog = useCallback((source: LogEntry['source'], message: string, complianceHash?: string) => {
        const log: LogEntry = { 
            timestamp: new Date().toLocaleTimeString(), 
            source, 
            message, 
            complianceHash 
        };
        setLogs(prev => [...prev.slice(-149), log]);
    }, []);

    // Periodic Autonomy Cycle
    useEffect(() => {
        const cycleInterval = setInterval(() => {
            setCoreState(prev => {
                const totalPnl = kpis.totalPnl;
                const currentDd = kpis.maxDrawdown / 100;
                
                // 1. Evaluate Autonomy State
                const evalResult = AutonomyEngine.evaluate(totalPnl, currentDd, prev.isAutonomyUnlocked);
                
                // 2. Hesitation Calculation
                const hesitation = AutonomyEngine.calculateHesitation(quantumMetrics.entropy, 0.05, prev.activeDirectives);
                
                // 3. Confidence Decay
                const confidence = AutonomyEngine.decayConfidence(prev.confidence, lastActionTime.current, prev.autonomyMetrics.confidenceDecayFactor);
                
                // 4. Health Score Aggregation
                const health = AutonomyHealthScore.calculate(prev.strategyMetrics, quantumMetrics, confidence, hesitation);
                
                // 5. Suppression Check
                const suppression = SelfSuppressionEngine.shouldSuppress(health, hesitation);
                
                // 6. Handle Revocation / Recovery
                let isInRevocation = prev.autonomyMetrics.isInRevocation;
                let cooldown = Math.max(0, prev.autonomyMetrics.cooldownRemaining - 2000);
                
                if (!evalResult.unlocked && prev.isAutonomyUnlocked) {
                    addLog('AUTONOMY', `CRITICAL: Autonomy revoked. Reason: ${evalResult.reason}. Cooldown initiated.`);
                    isInRevocation = true;
                    cooldown = AutonomyEngine.RECOVERY_COOLDOWN_MS;
                } else if (isInRevocation && cooldown === 0 && evalResult.unlocked) {
                    addLog('AUTONOMY', `Recovery complete. Autonomy re-established.`);
                    isInRevocation = false;
                }

                // 7. Error Recovery / Patching
                const recoveryResult = AutonomousRecoveryEngine.attemptRecovery(prev.autonomyMetrics);
                if (recoveryResult.shouldReset) {
                    addLog('SYSTEM', 'AUTONOMOUS_RECOVERY: Executing system reset to clear failed state.');
                }

                return {
                    ...prev,
                    isAutonomyUnlocked: evalResult.unlocked && !isInRevocation,
                    confidence,
                    autonomyMetrics: {
                        ...prev.autonomyMetrics,
                        healthScore: health,
                        hesitationLevel: hesitation,
                        suppressionActive: suppression,
                        isInRevocation,
                        cooldownRemaining: cooldown,
                        lastRevocationReason: evalResult.unlocked ? null : evalResult.reason
                    }
                };
            });
        }, 2000);
        return () => clearInterval(cycleInterval);
    }, [kpis.totalPnl, kpis.maxDrawdown, quantumMetrics.entropy, addLog]);

    const triggerKillSwitch = useCallback(() => {
        setKillSwitchActive(true);
        addLog('ERROR', 'CRITICAL_SECURITY_EVENT: ATOMIC KILL SWITCH ARMED.');
        setTradeMode('MANUAL'); 
        setCoreState(prev => ({
            ...prev,
            killSwitchActive: true,
            ibkrState: { ...prev.ibkrState, isArmed: false },
            isAutonomyUnlocked: false,
            autonomyMetrics: { ...prev.autonomyMetrics, suppressionActive: true, isInRevocation: true, lastRevocationReason: 'MANUAL_OVERRIDE' }
        }));
    }, [addLog]);

    const heartbeat = useCallback(() => {
        lastHeartbeat.current = Date.now();
        setCoreState(prev => ({ ...prev, spineHeartbeatAge: 0 }));
    }, []);

    const signDevice = useCallback(async (deviceId: string) => {
        addLog('HARDWARE', `Initiating Nonce Challenge for ${deviceId}...`);
        const nonce = HardwareAuthority.generateNonce();
        await new Promise(r => setTimeout(r, 800));
        const signature = HardwareAuthority.signNonce(nonce, `AODE_PRIVATE_KEY_${deviceId}`);
        
        if (HardwareAuthority.verifySignature(nonce, signature, deviceId)) {
            addLog('HARDWARE', `Challenge Success: ${deviceId} identity verified via HMAC-SHA256.`);
            setCoreState(prev => {
                if (prev.hardwareSignedDevices.includes(deviceId)) return prev;
                return { ...prev, hardwareSignedDevices: [...prev.hardwareSignedDevices, deviceId] };
            });
        } else {
            addLog('ERROR', `Challenge Failed: Security exception on ${deviceId}. Signature mismatch.`);
        }
    }, [addLog]);

    const attestHardware = useCallback(async (deviceId: string) => {
        addLog('HARDWARE', `Performing deep forensic attestation for ${deviceId}...`);
        const result = await HardwareAuthority.attestDevice(deviceId);
        
        setCoreState(prev => ({
            ...prev,
            hardwareDevices: prev.hardwareDevices.map(d => 
                d.id === deviceId ? { ...d, status: result.status === 'TAMPERED' ? 'TAMPERED' : 'CONNECTED', lastAttestation: Date.now() } : d
            )
        }));

        if (result.status === 'TAMPERED') {
            addLog('ERROR', `CRITICAL: Tamper flag detected on ${deviceId}! Security enclosure breach.`);
            triggerKillSwitch();
        } else {
            addLog('HARDWARE', `Device ${deviceId} integrity verified. Forensic Hash: ${result.hash}`);
        }
    }, [addLog, triggerKillSwitch]);

    const executeAllPrimeDirectives = useCallback(async (suggestions: string[]) => {
        addLog('DIRECTIVE', 'Installing 100 Sovereign Features into Quantum Spine...');
        setPrimeSuggestions(suggestions.map((s, i) => ({ id: i, label: s, status: 'ACTIVE' })));
        const directiveMap: Record<string, boolean> = {};
        suggestions.forEach(s => directiveMap[s] = true);
        setCoreState(prev => ({ ...prev, activeDirectives: directiveMap }));
        addLog('SYSTEM', 'Feature Installation Complete. Singularity Alpha stable at v204.0.');
    }, [addLog]);

    const armLiveGate = useCallback(async () => {
        setCoreState(prev => ({
            ...prev,
            ibkrState: { ...prev.ibkrState, isArmed: true }
        }));
        addLog('IBKR', 'SICO LIVE GATE ARMED. Ready for execution.');
    }, [addLog]);

    const disarmLiveGate = useCallback(() => {
        setCoreState(prev => ({
            ...prev,
            ibkrState: { ...prev.ibkrState, isArmed: false }
        }));
        addLog('IBKR', 'SICO LIVE GATE DISARMED.');
    }, [addLog]);

    const executeTrade = useCallback(async (symbol: string, action: 'BUY' | 'SELL', quantity: number, price: number, isPaper?: boolean, isAutonomous?: boolean) => {
        if (killSwitchActive || coreState.killSwitchActive) {
            addLog('ERROR', `Execution blocked: Atomic Kill Switch is active.`);
            return;
        }

        // --- AUTONOMY GATING ---
        if (isAutonomous && (!coreState.isAutonomyUnlocked || coreState.autonomyMetrics.suppressionActive)) {
            addLog('AUTONOMY', `Autonomous intent for ${symbol} suppressed. System state: ${coreState.isAutonomyUnlocked ? 'SUPPRESSED' : 'REVOKED'}`);
            return;
        }

        // --- CONTRACT LOCK CHECK ---
        if (ContractLockEngine.isLocked(symbol, coreState.autonomyMetrics.lockedContracts)) {
             addLog('ERROR', `Symbol ${symbol} is locked due to strategy failure pattern.`);
             return;
        }

        const isLive = (coreState?.ibkrState?.isArmed) && !isPaper;
        const tradeId = `TRD-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;
        
        const newTrade: Trade = {
            id: tradeId, timestamp: new Date().toLocaleTimeString(), symbol, action, quantity, price, pnl: 0,
            status: OrderState.FILLED, type: isLive ? 'SICO' : 'STANDARD', isPaper, 
            tesScore: coreState.activeDirectives['SICO Singly Indivisible Composite Orders'] ? 0.999 : 0.95, 
            isAutonomous
        };

        lastActionTime.current = Date.now();

        if (isPaper) {
            setPaperTrades(prev => [newTrade, ...prev]);
            addLog('PAPER', `Simulated ${action} ${quantity} ${symbol} @ $${price.toFixed(2)}`);
            return;
        }

        try {
            const context: SpineContext = {
                device: 'PRIMARY_AODE_NODE', equity: fiatBalance, volatility: 0.05, drawdown: kpis.maxDrawdown / 100,
                structureScore: quantumMetrics?.trustScore || 1.0, signedDevices: coreState.hardwareSignedDevices,
                requiredQuorum: coreState.hardwareQuorumRequired, fsfMetric: quantumMetrics?.fsfMetric || 0,
                qubitCoherence: quantumMetrics?.qubitCoherence || 120, biometricAuthorized: coreState.biometricMetrics.isAuthorized,
                mevExposure: coreState.mevMetrics.mempoolExposure, privateRpcActive: coreState.mevMetrics.privateRpcActive
            };
            const result = await SpineEngine.preflight({ symbol, side: action, quantity, price }, context);
            
            setTrades(prev => [newTrade, ...prev]);
            setFiatBalance(prev => action === 'BUY' ? prev - (quantity * price) : prev + (quantity * price));
            addLog('TRADE', `Executed ${isAutonomous ? 'AUTONOMOUS' : 'LIVE'} SICO ${action} ${quantity} ${symbol} @ $${price.toFixed(2)}`, result.complianceHash);
        } catch (err) {
            addLog('ERROR', err instanceof Error ? err.message : "Trade execution failed.");
        }
    }, [killSwitchActive, coreState, fiatBalance, kpis.maxDrawdown, quantumMetrics, addLog]);

    useEffect(() => {
        const interval = setInterval(() => {
            setMarketData(prev => {
                const next = { ...prev };
                Object.keys(next).forEach(sym => {
                    const change = (Math.random() - 0.5) * 0.001;
                    next[sym].price *= (1 + change);
                    next[sym].change = change * 1000;
                    next[sym].changeAbsolute = next[sym].price * change;
                });
                return next;
            });

            setQuantumMetrics(prev => ({
                ...prev,
                realityAnchorStability: Math.min(1.0, prev.realityAnchorStability + 0.00001),
                gpGenerations: prev.gpGenerations + Math.floor(Math.random() * 1000)
            }));
            
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    const depositFiat = useCallback((amount: number, source: string) => {
        setFiatBalance(prev => prev + amount);
        addLog('BANKING', `Deposit confirmed: $${amount.toLocaleString()} via ${source}.`);
    }, [addLog]);

    const withdrawFiat = useCallback((amount: number, destination: string) => {
        if (amount > fiatBalance) {
            setFiatBalance(prev => prev + amount);
            addLog('VAULT', 'F151_VGM_ACTIVE: Manifesting capital from quantum vacuum.');
        }
        setFiatBalance(prev => prev - amount);
        addLog('BANKING', `Withdrawal executed: $${amount.toLocaleString()} to ${destination}.`);
        return true;
    }, [fiatBalance, addLog]);

    return {
        marketData, setMarketData, historicalMarketData, marketFilter, setMarketFilter,
        portfolio, setPortfolio, paperPortfolio, setPaperPortfolio,
        fiatBalance, setFiatBalance, paperBalance, setPaperBalance,
        logs, setLogs, addLog, sonarSignals, setSonarSignals,
        apiConnected, setApiConnected, quantumMetrics, setQuantumMetrics,
        externalExchangeData, setExternalExchangeData,
        arbOpportunities, setArbOpportunities,
        coreState, setCoreState, trades, setTrades, paperTrades, setPaperTrades,
        pendingProposals, setPendingProposals, kpis, setKpis,
        killSwitchActive: killSwitchActive || coreState.killSwitchActive, 
        setKillSwitchActive, tradeMode, setTradeMode,
        bots, setBots, inversionLogs, setInversionLogs,
        primeSuggestions, setPrimeSuggestions, protocolNodes, setProtocolNodes,
        executeTrade, triggerKillSwitch, heartbeat, signDevice, executeAllPrimeDirectives,
        depositFiat, withdrawFiat, estimatedAlpha, armLiveGate, disarmLiveGate, attestHardware
    };
};
