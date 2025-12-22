import { useState, useEffect, useCallback, useRef } from 'react';
import { 
    MarketData, Portfolio, Bot, LogEntry, BotStatus, SonarSignal, 
    Trade, AnalyticsKPIs, QuantumMetrics, ArchangelCoreState, 
    TradeMode, PrimeSuggestion, ProtocolNode, AgentRole, LegionName,
    InversionEventLog, OrderState
} from '../types';
import { generateInitialTrades, calculateKPIs } from '../utils/analytics';
import { ShadowExecutionEngine, Side } from '../utils/shadowExecution';
import { SpineEngine, SpineContext } from '../utils/spine';

// AODE Kernel UPB-1 Constants
const QUBIT_MIN_COHERENCE_NS = 40.0;
const HEARTBEAT_TIMEOUT_MS = 5000;
const TES_STEALTH_THRESHOLD = 0.95;

export const useArchangel = () => {
    const [marketData, setMarketData] = useState<MarketData>({});
    const [historicalMarketData, setHistoricalMarketData] = useState<Record<string, number[]>>({});
    const [marketFilter, setMarketFilter] = useState('');
    const [portfolio, setPortfolio] = useState<Portfolio>({});
    const [paperPortfolio, setPaperPortfolio] = useState<Portfolio>({});
    const [fiatBalance, setFiatBalance] = useState<number>(100000.00);
    const [paperBalance, setPaperBalance] = useState<number>(1000000.00);
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [sonarSignals, setSonarSignals] = useState<SonarSignal[]>([]);
    
    const [quantumMetrics, setQuantumMetrics] = useState<QuantumMetrics>({
        qubitCoherence: 120, 
        fsfMetric: 0.00000005, 
        quboEnergy: -24.5,
        acmdStatus: 'ACTIVE', 
        gpGenerations: 45000, 
        boredom: 0.12,
        entropy: 0.45, 
        drift: 0.02, 
        trustScore: 0.99,
        regime: 'STABLE_TREND', 
        dnaIntegrity: 0.9999, 
        satelliteLink: 1.0, 
        atmosphericNoise: 0.42, 
        realityAnchorStability: 0.99999,
        selfAuditProgress: 0.15,
        executionLatency: 0.85,
        tesScore: 0.88
    });

    const [coreState, setCoreState] = useState<ArchangelCoreState>({ 
        confidence: 0.99, 
        approved: true, 
        lastHash: 'AODE_INIT_Ω', 
        ledgerSize: 0,
        quorumStatus: 'PENDING',
        buyingPower: 1200000.00, 
        spineHeartbeatAge: 0,
        monotonicTime: 0,
        killSwitchActive: false,
        hardwareSignedDevices: [],
        hardwareQuorumRequired: 2,
        survivalDrawdownLimit: SpineEngine.MAX_DRAWDOWN,
        structuralAlphaThreshold: SpineEngine.ALPHA_THRESHOLD,
        isAutonomyUnlocked: true
    });

    const [trades, setTrades] = useState<Trade[]>(generateInitialTrades());
    const [paperTrades, setPaperTrades] = useState<Trade[]>([]);
    const [kpis, setKpis] = useState<AnalyticsKPIs>(() => calculateKPIs([], 100000));
    const [killSwitchActive, setKillSwitchActive] = useState(false);
    const [tradeMode, setTradeMode] = useState<TradeMode>('AUTONOMOUS');
    const [protocolNodes, setProtocolNodes] = useState<ProtocolNode[]>([]);
    const [primeSuggestions, setPrimeSuggestions] = useState<PrimeSuggestion[]>([]);
    const [bots, setBots] = useState<Bot[]>([]);
    const [inversionLogs, setInversionLogs] = useState<InversionEventLog[]>([]);

    const shadowEngine = useRef(new ShadowExecutionEngine());
    const lastHeartbeat = useRef(Date.now());
    const genesisTime = useRef(performance.now());

    const addLog = useCallback((source: LogEntry['source'], message: string, complianceHash?: string) => {
        const log: LogEntry = { 
            timestamp: new Date().toLocaleTimeString(), 
            source, 
            message, 
            complianceHash 
        };
        setLogs(prev => [...prev.slice(-200), log]);
    }, []);

    // Implementation of real-time market simulation and deterministic heartbeat
    useEffect(() => {
        const spinePulse = setInterval(() => {
            const now = performance.now();
            const elapsedMicros = Math.floor((now - genesisTime.current) * 1000);
            
            setCoreState(prev => ({
                ...prev,
                monotonicTime: elapsedMicros,
                spineHeartbeatAge: Date.now() - lastHeartbeat.current
            }));

            if (Date.now() - lastHeartbeat.current > HEARTBEAT_TIMEOUT_MS) {
                if (!killSwitchActive) {
                    setKillSwitchActive(true);
                    addLog('ERROR', "[FAIL_CLOSED]: Execution Spine Heartbeat Lost. Hard halt engaged.");
                }
            }

            setQuantumMetrics(prev => {
                const decoherenceTrigger = Math.random() < 0.02;
                const nextCoherence = decoherenceTrigger ? 38 : Math.max(30, prev.qubitCoherence + (Math.random() - 0.5) * 2);
                
                let acmdStatus = prev.acmdStatus;
                if (nextCoherence < QUBIT_MIN_COHERENCE_NS) {
                    acmdStatus = 'PATCHING';
                    addLog('XEDO', `AODE: Majorana Qubit Decoherence (${nextCoherence.toFixed(2)}ns). Executing SKP Kernel Patch.`);
                } else if (acmdStatus === 'PATCHING') {
                    acmdStatus = 'ACTIVE';
                }

                return {
                    ...prev,
                    qubitCoherence: nextCoherence,
                    acmdStatus: acmdStatus,
                    fsfMetric: Math.max(0.00000001, prev.fsfMetric + (Math.random() - 0.5) * 0.00000001),
                    gpGenerations: prev.gpGenerations + 1000,
                    tesScore: Math.max(0.1, Math.min(0.99, prev.tesScore + (Math.random() - 0.5) * 0.05))
                };
            });

            // Simulate Market Data movements for UI Manifestation
            const symbols = ['BTC', 'ETH', 'SOL', 'ADA', 'DOT', 'LINK', 'UNI', 'AVAX'];
            setMarketData(prevData => {
                const nextData: MarketData = { ...prevData };
                symbols.forEach(sym => {
                    const basePrice = sym === 'BTC' ? 65000 : sym === 'ETH' ? 3500 : sym === 'SOL' ? 145 : 0.5;
                    const prevPrice = prevData[sym]?.price || basePrice;
                    const drift = (Math.random() - 0.48) * 0.002; 
                    const price = prevPrice * (1 + drift);
                    const change = ((price / basePrice) - 1) * 100;
                    const absChange = price - prevPrice;
                    const volume = (prevData[sym]?.volume || 1000000000) * (1 + (Math.random() - 0.5) * 0.05);

                    nextData[sym] = { price, change, changeAbsolute: absChange, volume };

                    setHistoricalMarketData(prevHist => ({
                        ...prevHist,
                        [sym]: [...(prevHist[sym] || []).slice(-19), price]
                    }));
                });
                return nextData;
            });

        }, 3000);
        return () => clearInterval(spinePulse);
    }, [addLog, killSwitchActive]);

    const signDevice = useCallback((deviceId: string) => {
        setCoreState(prev => {
            if (prev.hardwareSignedDevices.includes(deviceId)) return prev;
            const nextSigned = [...prev.hardwareSignedDevices, deviceId];
            const quorumMet = nextSigned.length >= prev.hardwareQuorumRequired;
            
            addLog('SPINE', `DEVICE SIGNED: ${deviceId}. Quorum: ${nextSigned.length}/${prev.hardwareQuorumRequired}`);
            
            return {
                ...prev,
                hardwareSignedDevices: nextSigned,
                quorumStatus: quorumMet ? 'VERIFIED' : 'PENDING'
            };
        });
    }, [addLog]);

    const heartbeat = useCallback(() => {
        lastHeartbeat.current = Date.now();
        if (killSwitchActive) {
            setKillSwitchActive(false);
            addLog('SYSTEM', "AODE: Execution Spine Restored via Heartbeat Ping.");
        }
    }, [killSwitchActive, addLog]);

    const triggerKillSwitch = useCallback(() => {
        setKillSwitchActive(true);
        setCoreState(prev => ({ ...prev, killSwitchActive: true }));
        addLog('ERROR', "!!! ATOMIC KILL SWITCH TRIGGERED !!! TERMINATING ALL ACTIVE VECTORS !!!");
    }, [addLog]);

    const executeTrade = useCallback(async (symbol: string, action: 'BUY' | 'SELL', quantity: number, price: number, isPaper = false) => {
        if (!isPaper && killSwitchActive) {
            addLog('ERROR', "AODE: Execution Blocked. Core Halted.");
            return;
        }

        const currentBalance = isPaper ? paperBalance : fiatBalance;

        const context: SpineContext = {
            device: coreState.hardwareSignedDevices[0] || 'MASTER_TERMINAL_Ω',
            equity: currentBalance,
            volatility: 0.2, 
            drawdown: kpis.maxDrawdown / 100,
            structureScore: quantumMetrics.trustScore,
            signedDevices: coreState.hardwareSignedDevices,
            requiredQuorum: coreState.hardwareQuorumRequired,
            fsfMetric: quantumMetrics.fsfMetric,
            qubitCoherence: quantumMetrics.qubitCoherence
        };

        try {
            if (!isPaper) {
                addLog('SPINE', `[PREFLIGHT]: Authorizing ${action} ${symbol} through Deterministic Spine...`);
                SpineEngine.authorize(context);
            } else {
                addLog('PAPER', `[SIMULATION]: Validating ${action} ${symbol} intent...`);
            }

            const preflight = await SpineEngine.preflight({ symbol, side: action }, context);
            
            // ADVERSARIAL MITIGATION (3.3) - Only for Live
            let finalQuantity = quantity;
            if (!isPaper && quantumMetrics.tesScore > TES_STEALTH_THRESHOLD) {
                addLog('AODE', `[TES_EVASION]: Stealth signature detected (${quantumMetrics.tesScore.toFixed(3)}). Applying 75% size reduction.`);
                finalQuantity = quantity * 0.25;
            }

            const startTime = performance.now();
            const fill = await shadowEngine.current.submit_order(action === 'BUY' ? Side.BUY : Side.SELL, finalQuantity, price);
            const endTime = performance.now();
            
            const complianceHash = preflight.complianceHash;

            const newTrade: Trade = {
                id: fill.order_id,
                timestamp: new Date().toLocaleTimeString(),
                symbol, action,
                quantity: fill.filled_qty,
                price: fill.avg_price,
                pnl: action === 'SELL' ? (fill.avg_price - price) * fill.filled_qty : 0,
                type: 'SICO',
                status: OrderState.FILLED,
                auditHash: complianceHash,
                tesScore: quantumMetrics.tesScore,
                coherenceAtExecution: quantumMetrics.qubitCoherence,
                quboEnergyAtExecution: quantumMetrics.quboEnergy,
                mlemVerified: true,
                isPaper
            };

            if (isPaper) {
                setPaperTrades(prev => [newTrade, ...prev.slice(0, 99)]);
                setPaperBalance(p => action === 'BUY' ? p - (fill.avg_price * fill.filled_qty) : p + (fill.avg_price * fill.filled_qty));
            } else {
                setTrades(prev => [newTrade, ...prev.slice(0, 99)]);
                setFiatBalance(p => action === 'BUY' ? p - (fill.avg_price * fill.filled_qty) : p + (fill.avg_price * fill.filled_qty));
                addLog('MLEM', `[UPB-1]: SICO EXECUTED. HASH: ${complianceHash}`, complianceHash);
            }

            const newInversionLog: InversionEventLog = {
                id: `${isPaper ? 'PAPER' : 'AODE'}-${crypto.randomUUID().substring(0, 8)}`,
                type: 'STANDARD',
                symbol, action,
                temporalAnchors: { tMinus: startTime, tZero: fill.timestamp, latencyDelta: endTime - startTime },
                vectorOfTruth: { causalDriftScore: 0.0000001, predictedStateHash: complianceHash.substring(0, 8), manifestedStateHash: complianceHash.substring(0, 8) }
            };
            setInversionLogs(prev => [newInversionLog, ...prev.slice(0, 49)]);

        } catch (e) {
            const errorMsg = e instanceof Error ? e.message : "Unknown spine error";
            addLog('ERROR', `[SPINE BLOCK]: ${errorMsg}`);
        }
    }, [killSwitchActive, coreState, fiatBalance, paperBalance, kpis.maxDrawdown, quantumMetrics.trustScore, quantumMetrics.qubitCoherence, quantumMetrics.fsfMetric, quantumMetrics.tesScore, quantumMetrics.quboEnergy, addLog]);

    useEffect(() => {
        const initialBots: Bot[] = [];
        const legionConfig: { name: LegionName, count: number, roles: AgentRole[] }[] = [
            { name: 'Infrastructure', count: 500, roles: ['Infra'] },
            { name: 'Seraphim', count: 1000, roles: ['Hunter', 'Sentinel', 'Weaver'] },
            { name: 'Voice', count: 500, roles: ['Persona', 'Oracle'] },
            { name: 'Growth', count: 250, roles: ['Growth'] },
            { name: 'Security', count: 250, roles: ['Legal', 'Saboteur'] },
        ];
        let botId = 1;
        legionConfig.forEach(c => {
            for(let i=0; i<c.count; i++) {
                initialBots.push({ id: botId++, legion: c.name, role: c.roles[i % c.roles.length], status: 'Idle', efficiency: 1.0, xp: 1000 });
            }
        });
        setBots(initialBots);
    }, []);

    const executeAllPrimeDirectives = useCallback(async (suggestions: string[]) => {
        addLog('AODE', "AODE: Engaging 100 Sovereign Directives...");
        const newSuggestions = suggestions.map((s, i) => ({ id: i + 1, label: s, status: 'PENDING' as const }));
        setPrimeSuggestions(newSuggestions);
        for (let i = 0; i < newSuggestions.length; i++) {
            await new Promise(r => setTimeout(r, 2));
            setPrimeSuggestions(prev => prev.map((ps, idx) => idx === i ? { ...ps, status: 'ACTIVE' as const } : ps));
        }
    }, [addLog]);

    return { 
        marketData, portfolio, setPortfolio, paperPortfolio, setPaperPortfolio,
        fiatBalance, paperBalance, executeTrade, logs, addLog, sonarSignals, 
        trades, setTrades, paperTrades, kpis, setKpis, quantumMetrics, coreState, killSwitchActive,
        heartbeat, triggerKillSwitch, signDevice,
        tradeMode, setTradeMode, protocolNodes, bots,
        primeSuggestions, executeAllPrimeDirectives, inversionLogs,
        depositFiat: (a: number, s: string) => setFiatBalance(p => p + a),
        withdrawFiat: (a: number, d: string) => { if (fiatBalance >= a) { setFiatBalance(p => p - a); return true; } return false; },
        historicalMarketData, marketFilter, setMarketFilter, estimatedAlpha: 36.82
    };
};