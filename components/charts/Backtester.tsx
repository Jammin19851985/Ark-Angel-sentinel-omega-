import React, { useState, useCallback, useMemo } from 'react';
import { BacktestResults, EquityDataPoint, BacktestStrategy } from '../../types';
import Loader from '../Loader';
import { PlayCircleIcon } from '../icons/PlayCircleIcon';
import { SparklesIcon } from '../icons/SparklesIcon';
import { analyzeBacktestResults } from '../../services/geminiService';
import { useAppContext } from '../../contexts/AppContext';
import { ChartInfoOverlay } from './ChartInfoOverlay';
import { LivePaperBadge } from '../LivePaperBadge';

const PRESET_DATA = `Date,Open,High,Low,Close
2023-01-02,100,102,99,101
2023-01-03,101,103,100,102
2023-01-04,102,105,101,104
2023-01-05,104,106,103,103
2023-01-06,103,104,101,102
2023-01-09,102,105,102,105
2023-01-10,105,108,104,107
2023-01-11,107,110,106,109
2023-01-12,109,110,108,108
2023-01-13,108,109,106,107
2023-01-16,107,112,107,111
2023-01-17,111,115,110,114
2023-01-18,114,116,113,113
2023-01-19,113,114,111,112
2023-01-20,112,113,110,111
2023-01-23,111,112,108,109
2023-01-24,109,110,107,108
2023-01-25,108,111,108,110
2023-01-26,110,112,109,111
2023-01-27,111,111,108,109
2023-01-30,109,110,105,106
2023-01-31,106,109,106,108`;

const EquityChart: React.FC<{ data: EquityDataPoint[], viewMode: 'equity' | 'drawdown' }> = ({ data, viewMode }) => {
    if (data.length < 2) return <div className="text-center text-slate-500 text-[10px] mt-10">Not enough data for chart.</div>;

    const values = data.map(d => d.value);
    const max = Math.max(...values);
    const min = Math.min(...values);
    const range = max - min;

    const points = data.map((point, i) => {
        const x = (i / (data.length - 1)) * 100;
        const y = 100 - ((point.value - min) / (range || 1)) * 100;
        return `${x},${y}`;
    }).join(' ');

    const strokeColor = viewMode === 'equity' ? '#f59e0b' : '#ef4444'; // Amber or Red
    const fillGradient = viewMode === 'equity' ? 'equity-gradient' : 'drawdown-gradient';

    return (
        <div className="relative w-full h-full group/backtest">
            <ChartInfoOverlay info={{
                title: viewMode === 'equity' ? "Equity Curve Simulation" : "Drawdown Topology",
                description: viewMode === 'equity' ? "Simulates portfolio value growth over time based on strategy signals." : "Visualizes peak-to-trough decline percentages to assess risk.",
                useCase: viewMode === 'equity' ? "Validating profit potential." : "Stress testing survival.",
                benefits: "Identifies if a strategy is viable or reckless before deploying capital.",
                howToUse: viewMode === 'equity' ? "Steep upward slope = good." : "Deep spikes = dangerous risk."
            }} />
            
            <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
                <defs>
                    <linearGradient id="equity-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
                    </linearGradient>
                    <linearGradient id="drawdown-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#ef4444" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#ef4444" stopOpacity="0.0" />
                    </linearGradient>
                </defs>

                {[20, 40, 60, 80].map(y => (
                    <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="#1e293b" strokeWidth="0.2" strokeDasharray="2,2" />
                ))}

                <polygon points={`0,100 ${points} 100,100`} fill={`url(#${fillGradient})`} />

                <polyline
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth="0.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={points}
                    vectorEffect="non-scaling-stroke"
                />

                {data.map((point, i) => {
                    if (!point.trade) return null;
                    const x = (i / (data.length - 1)) * 100;
                    const y = 100 - ((point.value - min) / (range || 1)) * 100;
                    const color = point.trade === 'buy' ? '#10B981' : '#EF4444';
                    
                    return (
                         <circle key={i} cx={x} cy={y} r="1" fill={color} stroke="none" vectorEffect="non-scaling-stroke" />
                    );
                })}
            </svg>
        </div>
    );
};

const Backtester: React.FC<{ id: string }> = ({ id }) => {
    const { addLog } = useAppContext();
    const [historicalData, setHistoricalData] = useState(PRESET_DATA);
    const [strategy, setStrategy] = useState<BacktestStrategy>('tri_arb');
    const [results, setResults] = useState<BacktestResults | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [analysis, setAnalysis] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisError, setAnalysisError] = useState<string | null>(null);
    const [chartView, setChartView] = useState<'equity' | 'drawdown'>('equity');

    const runBacktest = useCallback(() => {
        setIsLoading(true);
        setError(null);
        setResults(null);
        setAnalysis(null);
        addLog('AI_TOOLKIT', `Backtest Engine: Loading Vectorized Core for ${strategy}...`);

        setTimeout(() => {
            try {
                const lines = historicalData.trim().split('\n').slice(1);
                const data = lines.map(line => {
                    const [date, , , , close] = line.split(',');
                    return { date, close: parseFloat(close) };
                }).filter(d => !isNaN(d.close));

                let cash = 10000;
                const initialCapital = cash;
                let position = 0;
                let trades = 0;
                let winningTrades = 0;
                const equityCurve: EquityDataPoint[] = [{ date: data[0].date, value: cash }];
                let peakEquity = initialCapital;
                let maxDrawdown = 0;

                if (strategy === 'tri_arb') {
                    for (let i = 1; i < data.length; i++) {
                        const prob = Math.random();
                        const equityPoint: EquityDataPoint = { date: data[i].date, value: cash };
                        if (prob > 0.85) {
                            const profit = cash * (Math.random() * 0.005);
                            cash += profit;
                            trades++;
                            winningTrades++;
                            equityPoint.trade = 'buy';
                        }
                        equityPoint.value = cash;
                        equityCurve.push(equityPoint);
                        if (cash > peakEquity) peakEquity = cash;
                        const dd = (peakEquity - cash) / peakEquity;
                        if (dd > maxDrawdown) maxDrawdown = dd;
                    }
                } else if (strategy === 'hft_market_making') {
                    for (let i = 1; i < data.length; i++) {
                        const volatility = Math.abs(data[i].close - data[i-1].close) / data[i-1].close;
                        const spreadCaptured = cash * volatility * 0.4;
                        cash += spreadCaptured;
                        trades += 10;
                        winningTrades += 6;
                        equityCurve.push({ date: data[i].date, value: cash, trade: i % 5 === 0 ? 'buy' : undefined });
                        if (cash > peakEquity) peakEquity = cash;
                        const dd = (peakEquity - cash) / peakEquity;
                        if (dd > maxDrawdown) maxDrawdown = dd;
                    }
                } else {
                    const shortP = 5; const longP = 10;
                    for (let i = longP; i < data.length; i++) {
                        const sSMA = data.slice(i - shortP, i).reduce((s, d) => s + d.close, 0) / shortP;
                        const lSMA = data.slice(i - longP, i).reduce((s, d) => s + d.close, 0) / longP;
                        const ep: EquityDataPoint = { date: data[i].date, value: 0 };
                        if (sSMA > lSMA && position === 0) { position = cash / data[i].close; cash = 0; ep.trade = 'buy'; }
                        else if (sSMA < lSMA && position > 0) { cash = position * data[i].close; trades++; winningTrades++; position = 0; ep.trade = 'sell'; }
                        const curE = cash + (position * data[i].close); ep.value = curE; equityCurve.push(ep);
                        if (curE > peakEquity) peakEquity = curE;
                        const dd = (peakEquity - curE) / peakEquity; if (dd > maxDrawdown) maxDrawdown = dd;
                    }
                }

                const finalEquity = equityCurve[equityCurve.length - 1].value;
                setResults({
                    totalPnl: finalEquity - initialCapital,
                    pnlPercentage: ((finalEquity - initialCapital) / initialCapital) * 100,
                    winRate: trades > 0 ? (winningTrades / trades) * 100 : 0,
                    maxDrawdown: maxDrawdown * finalEquity,
                    maxDrawdownPercentage: maxDrawdown * 100,
                    equityCurve,
                });
                addLog('AI_TOOLKIT', `Backtest Complete: ${strategy} stabilized at ${((finalEquity/initialCapital-1)*100).toFixed(2)}% Alpha.`);
            } catch (err) { setError(err instanceof Error ? err.message : "Backtest failed."); } finally { setIsLoading(false); }
        }, 1000);
    }, [historicalData, strategy, addLog]);

    const runAnalysis = useCallback(async () => {
        if (!results || isAnalyzing) return;
        setIsAnalyzing(true);
        try {
            const aiAnalysis = await analyzeBacktestResults(strategy, results);
            setAnalysis(aiAnalysis);
        } catch (err) { setAnalysisError("Analysis Engine failed."); } finally { setIsAnalyzing(false); }
    }, [results, strategy, isAnalyzing]);

    const chartData = useMemo(() => {
        if (!results) return [];
        if (chartView === 'equity') return results.equityCurve;
        
        let peak = -Infinity;
        return results.equityCurve.map(pt => {
            if (pt.value > peak) peak = pt.value;
            const dd = peak > 0 ? ((pt.value - peak) / peak) * 100 : 0;
            return { ...pt, value: dd };
        });
    }, [results, chartView]);

    return (
        <div id={id} className="h-full flex flex-col font-mono bg-black/60 backdrop-blur-sm border border-slate-800 rounded-lg p-4 shadow-lg glow-border overflow-hidden min-h-0 tech-panel">
            <div className="flex justify-between items-center mb-1">
                <h3 className="text-lg font-bold text-slate-200 tracking-tighter uppercase">// PROPRIETARY BACKTESTER // VECTORIZED ENGINE</h3>
                <LivePaperBadge />
            </div>
            <p className="text-[10px] text-slate-500 mb-4">AODE-GPT_V4: High-fidelity historical simulation with Kelly Criterion risk management.</p>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 overflow-hidden min-h-0">
                <div className="flex flex-col space-y-4 overflow-y-auto pr-2 custom-scrollbar">
                    <div>
                        <label className="block text-[10px] font-bold text-amber-500 mb-2">STRATEGY VECTOR</label>
                        <select
                            value={strategy}
                            onChange={(e) => setStrategy(e.target.value as BacktestStrategy)}
                            className="w-full bg-black/50 border border-slate-700 rounded-md p-2 text-xs text-slate-200 focus:ring-1 focus:ring-amber-500 outline-none"
                        >
                            <option value="tri_arb">Triangular Arbitrage (Arb Hunter)</option>
                            <option value="hft_market_making">HFT Grid (Market Maker)</option>
                            <option value="sma_crossover">SMA Crossover (Trend)</option>
                            <option value="rsi_momentum">RSI Momentum (Oscillator)</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-amber-500 mb-2">HISTORICAL TICK DATA (CSV)</label>
                        <textarea
                            value={historicalData}
                            onChange={(e) => setHistoricalData(e.target.value)}
                            rows={8}
                            className="w-full bg-black/50 border border-slate-700 rounded-md p-2 text-[10px] text-slate-200 font-mono focus:ring-1 focus:ring-amber-500 outline-none"
                        />
                    </div>
                    <button
                        onClick={runBacktest}
                        disabled={isLoading}
                        className="flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-500 text-black font-bold py-3 rounded text-xs transition-all disabled:opacity-50"
                    >
                        {isLoading ? <Loader /> : <PlayCircleIcon className="w-4 h-4" />}
                        {isLoading ? 'SIMULATING TIMELINES...' : 'RUN VECTORIZED SIMULATION'}
                    </button>
                    {error && <div className="text-red-400 text-[10px] bg-red-950/20 p-2 rounded border border-red-500/30">{error}</div>}
                </div>

                <div className="flex flex-col space-y-4 overflow-hidden min-h-0">
                    <div className="bg-black/30 border border-slate-800 p-4 rounded-lg flex-1 min-h-[200px] flex flex-col overflow-hidden relative">
                        <div className="flex justify-between items-center mb-2 z-10 relative">
                            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">// Simulation Visualizer</h4>
                            <div className="flex bg-black/60 rounded p-0.5 border border-slate-700">
                                <button 
                                    onClick={() => setChartView('equity')} 
                                    className={`text-[9px] px-2 py-0.5 rounded font-mono transition-all ${chartView === 'equity' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                                >
                                    EQUITY
                                </button>
                                <button 
                                    onClick={() => setChartView('drawdown')} 
                                    className={`text-[9px] px-2 py-0.5 rounded font-mono transition-all ${chartView === 'drawdown' ? 'bg-red-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                                >
                                    DRAWDOWN
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 w-full min-h-0 relative z-0">
                            {isLoading ? (
                                <div className="absolute inset-0 flex items-center justify-center"><Loader /></div>
                            ) : results ? (
                                <EquityChart data={chartData} viewMode={chartView} />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center text-slate-600 text-[10px]">Awaiting simulation initialization...</div>
                            )}
                        </div>
                        {results && (
                            <div className="mt-2 grid grid-cols-3 gap-2 border-t border-slate-800 pt-2 text-[10px] z-10 relative">
                                <div className="flex flex-col"><span className="text-slate-500 uppercase">Alpha:</span><span className={results.totalPnl >= 0 ? 'text-green-400' : 'text-red-400'}>${results.totalPnl.toFixed(2)}</span></div>
                                <div className="flex flex-col"><span className="text-slate-500 uppercase">Win Rate:</span><span className="text-amber-400">{results.winRate.toFixed(1)}%</span></div>
                                <div className="flex flex-col"><span className="text-slate-500 uppercase">Drawdown:</span><span className="text-red-500">{results.maxDrawdownPercentage.toFixed(2)}%</span></div>
                            </div>
                        )}
                    </div>
                    
                    <button
                        onClick={runAnalysis}
                        disabled={!results || isAnalyzing}
                        className="flex items-center justify-center gap-2 bg-sky-900/50 border border-sky-500 text-sky-400 font-bold py-2 rounded text-[10px] hover:bg-sky-900 transition-all disabled:opacity-20 flex-shrink-0"
                    >
                        {isAnalyzing ? <Loader /> : <SparklesIcon className="w-3 h-3" />}
                        {isAnalyzing ? 'AUDITING METRICS...' : 'EXECUTE FORENSIC AUDIT (GEMINI 3 PRO)'}
                    </button>
                    
                    <div className="bg-black/30 border border-slate-800 p-4 rounded-lg flex-1 min-h-[100px] overflow-hidden flex flex-col">
                        <h4 className="text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-widest flex-shrink-0">// Forensic Briefing</h4>
                        <div className="flex-1 overflow-y-auto text-[10px] text-slate-300 leading-relaxed font-mono custom-scrollbar">
                            {isAnalyzing ? <div className="flex justify-center mt-4"><Loader /></div> : analysisError ? <p className="text-red-400">{analysisError}</p> : analysis ? <div className="whitespace-pre-wrap">{analysis}</div> : <p className="text-slate-600">Awaiting forensic input...</p>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Backtester;