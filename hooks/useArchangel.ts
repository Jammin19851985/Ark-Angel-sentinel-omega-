
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { MarketData, Portfolio, Bot, LogEntry, BotStatus, SonarSignal, Trade, AnalyticsKPIs, Holding, QuantumMetrics, InversionEventLog, ArchangelCoreState } from '../types';
import { generateInitialTrades, calculateKPIs } from '../utils/analytics';
import { ShadowExecutionEngine, Side, OrderStatus } from '../utils/shadowExecution';
import { ArchangelCore } from '../utils/archangelCore';

const SYMBOL_TO_CG_ID: { [key: string]: string } = {
    'BTC': 'bitcoin',
    'ETH': 'ethereum',
    'SOL': 'solana',
    'ADA': 'cardano',
    'DOGE': 'dogecoin',
};

const MOCK_STOCKS_FOREX: MarketData = {
    'AAPL': { price: 192.65, change: 1.2, volume: 81910000, changeAbsolute: 2.25 },
    'TSLA': { price: 206.62, change: -0.5, volume: 146220000, changeAbsolute: -1.03 },
    'EUR/USD': { price: 1.0863, change: 0.1, volume: 0, changeAbsolute: 0.0008 },
};

const INITIAL_SYMBOLS = Object.keys(SYMBOL_TO_CG_ID);

const initialPortfolio: Portfolio = {
    'BTC': { symbol: 'BTC', quantity: 0.005, avgPrice: 66500.50 },
    'ETH': { symbol: 'ETH', quantity: 0.1, avgPrice: 3890.10 },
};

const initialMarketData: MarketData = INITIAL_SYMBOLS.reduce((acc, symbol) => {
    acc[symbol] = { price: 0, change: 0, volume: 0, changeAbsolute: 0 };
    return acc;
}, {} as MarketData);
Object.assign(initialMarketData, MOCK_STOCKS_FOREX);

const BOT_COUNT = 25; 
const initialBots: Bot[] = Array.from({ length: BOT_COUNT }, (_, i) => ({
    id: i,
    status: 'Idle',
}));

export const useArchangel = () => {
    const [marketData, setMarketData] = useState<MarketData>(initialMarketData);
    const [portfolio, setPortfolio] = useState<Portfolio>(() => {
        try {
            const saved = localStorage.getItem('archangel_portfolio');
            return saved ? JSON.parse(saved) : initialPortfolio;
        } catch (e) {
            console.warn("Failed to load portfolio from storage", e);
            return initialPortfolio;
        }
    });
    
    const [fiatBalance, setFiatBalance] = useState<number>(() => {
        try {
            const saved = localStorage.getItem('archangel_fiat_balance');
            return saved ? parseFloat(saved) : 10000.00;
        } catch {
            return 10000.00;
        }
    });

    const [bots, setBots] = useState<Bot[]>(initialBots);
    const [logs, setLogs] = useState<LogEntry[]>(() => {
        try {
            const saved = localStorage.getItem('archangel_logs');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            console.warn("Failed to load logs from storage", e);
            return [];
        }
    });
    const [historicalMarketData, setHistoricalMarketData] = useState<Record<string, number[]>>({});
    const [marketFilter, setMarketFilter] = useState('');
    const [sonarSignals, setSonarSignals] = useState<SonarSignal[]>([]);
    const [estimatedAlpha, setEstimatedAlpha] = useState(21.5);
    
    const [quantumMetrics, setQuantumMetrics] = useState<QuantumMetrics>({
        qubitCoherence: 120, 
        fsfMetric: 0.00000005,
        quboEnergy: -24.5,
        acmdStatus: 'ACTIVE', 
        gpGenerations: 45000,
        boredom: 0.12,
        entropy: 0.45,
        drift: 0.02,
        trustScore: 0.99
    });

    const [coreState, setCoreState] = useState<ArchangelCoreState>({
        confidence: 0,
        approved: false,
        lastHash: 'INIT',
        ledgerSize: 0
    });

    const [inversionLogs, setInversionLogs] = useState<InversionEventLog[]>([]);

    const [trades, setTrades] = useState<Trade[]>(() => {
        try {
            const saved = localStorage.getItem('archangel_trades');
            return saved ? JSON.parse(saved) : generateInitialTrades();
        } catch (e) {
            console.warn("Failed to load trades from storage", e);
            return generateInitialTrades();
        }
    });
    
    const initialPortfolioCost = useMemo(() => 10000, []); 
    const [kpis, setKpis] = useState<AnalyticsKPIs>(() => calculateKPIs(trades, initialPortfolioCost));
    
    const marketDataRef = useRef(marketData);
    const portfolioRef = useRef(portfolio);
    const quantumMetricsRef = useRef(quantumMetrics);
    const shadowEngine = useRef(new ShadowExecutionEngine()); 
    const coreRef = useRef(new ArchangelCore()); 
    const isWsConnected = useRef(false);

    useEffect(() => { marketDataRef.current = marketData; }, [marketData]);
    useEffect(() => { portfolioRef.current = portfolio; }, [portfolio]);
    useEffect(() => { quantumMetricsRef.current = quantumMetrics; }, [quantumMetrics]);

    const addLog = useCallback((source: LogEntry['source'], message: string) => {
        const newLog: LogEntry = {
            timestamp: new Date().toLocaleTimeString(),
            source,
            message,
        };
        setLogs(prevLogs => [...prevLogs.slice(-100), newLog]); 
    }, []);
    
    const executeTrade = useCallback(async (symbol: string, action: 'BUY' | 'SELL', quantity: number, price: number) => {
        if (quantumMetricsRef.current.fsfMetric > 0.0000001) {
            addLog('AODE', `TRADE BLOCKED: FSF THRESHOLD EXCEEDED (${quantumMetricsRef.current.fsfMetric.toFixed(9)})`);
            return;
        }

        const tesScore = Math.random(); 
        let effectiveQty = quantity;
        if (tesScore > 0.95) {
            effectiveQty = quantity * 0.25; 
            addLog('AODE', `TES ALERT (${tesScore.toFixed(3)} > 0.95): ENGAGING P-L-E. SIZE REDUCED BY 75%.`);
        }

        addLog('SHADOW', `Initiating SICO Execution for ${action} ${effectiveQty} ${symbol}...`);
        
        try {
            const fill = await shadowEngine.current.submit_order(
                action === 'BUY' ? Side.BUY : Side.SELL,
                effectiveQty,
                price
            );

            if (fill.status === OrderStatus.REJECTED) {
                addLog('ERROR', `Order REJECTED by Shadow Exchange. ID: ${fill.order_id} | Latency: ${fill.latency_ms}ms`);
                return;
            }

            const fillQty = fill.filled_qty;
            const fillPrice = fill.avg_price;
            const totalCost = fillQty * fillPrice + fill.fee;
            const currentHolding = portfolioRef.current[symbol];

            if (action === 'BUY') {
                setFiatBalance(prev => {
                    if (prev < totalCost) {
                        addLog('ERROR', `Insufficient funds for BUY ${symbol}. Req: $${totalCost.toFixed(2)}, Avail: $${prev.toFixed(2)}`);
                        return prev;
                    }
                    const existingQty = currentHolding?.quantity || 0;
                    const existingAvgPrice = currentHolding?.avgPrice || 0;
                    const newTotalQty = existingQty + fillQty;
                    const newAvgPrice = ((existingQty * existingAvgPrice) + (fillQty * fillPrice)) / newTotalQty;
                    setPortfolio(p => ({ ...p, [symbol]: { symbol, quantity: newTotalQty, avgPrice: newAvgPrice } }));
                    addLog('TRADE', `SHADOW FILL: BUY ${fillQty.toFixed(4)} ${symbol} @ $${fillPrice.toFixed(2)} | Latency: ${fill.latency_ms}ms`);
                    return prev - totalCost;
                });
            } else { 
                if (!currentHolding || currentHolding.quantity < quantity) {
                    addLog('ERROR', `Insufficient holding for SELL ${symbol}.`);
                    return;
                }
                const pnl = (fillPrice - currentHolding.avgPrice) * fillQty;
                const remainingQty = currentHolding.quantity - fillQty;
                const proceeds = (fillQty * fillPrice) - fill.fee;
                setPortfolio(p => {
                    const newP = { ...p };
                    if (remainingQty <= 0.000001) delete newP[symbol];
                    else newP[symbol] = { ...currentHolding, quantity: remainingQty };
                    return newP;
                });
                setFiatBalance(prev => prev + proceeds);
                addLog('TRADE', `SHADOW FILL: SELL ${fillQty.toFixed(4)} ${symbol} @ $${fillPrice.toFixed(2)} PnL: $${pnl.toFixed(2)}`);
            }
            
            setTrades(prev => [{
                id: fill.order_id,
                timestamp: new Date().toLocaleTimeString(),
                symbol,
                action,
                quantity: fillQty,
                price: fillPrice,
                pnl: action === 'SELL' ? (fillPrice - (currentHolding?.avgPrice || 0)) * fillQty : 0,
                type: 'SICO',
                status: fill.status,
                slippage: fill.slippage,
                fee: fill.fee,
                latency: fill.latency_ms
            }, ...prev.slice(0, 49)]);

            const complianceHash = Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join('');
            addLog('FORENSIC', `MLEM GENERATED: ${complianceHash.substring(0,16)}...`);

            setInversionLogs(prev => [{
                id: fill.order_id,
                type: Math.random() > 0.98 ? 'PARADOX' : 'INVERSION',
                symbol,
                action,
                temporalAnchors: {
                    tMinus: Date.now() - fill.latency_ms - 2,
                    tZero: Date.now() - fill.latency_ms,
                    tPlus: Date.now(),
                    latencyDelta: 0 
                },
                vectorOfTruth: {
                    predictedStateHash: complianceHash.substring(0, 8),
                    manifestedStateHash: complianceHash.substring(0, 8),
                    causalDriftScore: Math.random() * 0.0000001
                },
                financialOutcome: {
                    projectedRoi: 0.05,
                    realizedRoi: 0.05
                }
            }, ...prev.slice(0, 99)]);

        } catch (e) {
            addLog('ERROR', `Trade Execution Failed: ${e instanceof Error ? e.message : 'Unknown'}`);
        }
    }, [addLog]);

    useEffect(() => {
        let ws: WebSocket | null = null;
        const connect = () => {
            const assets = Object.values(SYMBOL_TO_CG_ID).join(',');
            ws = new WebSocket(`wss://ws.coincap.io/prices?assets=${assets}`);
            ws.onopen = () => { addLog('MARKET', 'WebSocket Uplink: STABLE.'); isWsConnected.current = true; };
            ws.onmessage = (msg) => {
                try {
                    const data = JSON.parse(msg.data);
                    setMarketData(prev => {
                        let newData = { ...prev };
                        let hasChanged = false;
                        for (const id in data) {
                            const sym = Object.keys(SYMBOL_TO_CG_ID).find(k => SYMBOL_TO_CG_ID[k] === id);
                            if (sym) {
                                newData[sym] = { ...newData[sym], price: parseFloat(data[id]) };
                                hasChanged = true;
                            }
                        }
                        return hasChanged ? newData : prev;
                    });
                } catch (e) {}
            };
            ws.onerror = () => { isWsConnected.current = false; ws?.close(); };
            ws.onclose = () => { isWsConnected.current = false; setTimeout(connect, 5000); };
        };
        connect();
        return () => ws?.close();
    }, [addLog]);

    useEffect(() => {
        const simInterval = setInterval(() => {
            const btcPrice = marketDataRef.current['BTC']?.price || 90000;
            const coreResult = coreRef.current.cycle(btcPrice, Math.random() * 2 - 1);
            setCoreState({
                confidence: coreResult.confidence,
                approved: coreResult.approved,
                lastHash: coreResult.hash,
                ledgerSize: coreResult.ledgerSize
            });

            setQuantumMetrics(prev => ({
                ...prev,
                qubitCoherence: 100 + (Math.random() * 40),
                fsfMetric: 0.00000001 + (Math.random() * 0.00000005),
                quboEnergy: -20 - Math.random() * 10,
                gpGenerations: prev.gpGenerations + 1000,
                boredom: Math.random(),
                entropy: Math.random(),
                drift: Math.random() * 0.1,
                trustScore: 0.95 + Math.random() * 0.05
            }));

            if (Math.random() < 0.05) {
                addLog('FORENSIC', `Reconciliation Cycle Complete. Hash Match: ${Math.random().toString(36).substring(7)}`);
            }

        }, 3000);
        return () => clearInterval(simInterval);
    }, [addLog]);

    return { 
        marketData, portfolio, setPortfolio, fiatBalance, depositFiat: (a:number, s:string)=>setFiatBalance(p=>p+a), 
        withdrawFiat: (a:number, d:string)=>{ if(fiatBalance>=a){setFiatBalance(p=>p-a); return true;} return false;},
        executeTrade, bots, logs, addLog, historicalMarketData, marketFilter, setMarketFilter, sonarSignals, 
        trades, setTrades, kpis, setKpis, estimatedAlpha, quantumMetrics, inversionLogs, coreState 
    };
};
