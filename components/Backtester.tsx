
import React, { useState, useCallback } from 'react';
import { BacktestResults, EquityDataPoint } from '../types';
import Loader from './Loader';
import { PlayCircleIcon } from './icons/PlayCircleIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { analyzeBacktestResults } from '../services/geminiService';
import { useAppContext } from '../contexts/AppContext';

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

type Strategy = 'sma_crossover' | 'rsi_momentum';

const EquityChart: React.FC<{ data: EquityDataPoint[] }> = ({ data }) => {
    if (data.length < 2) return <div className="text-center text-slate-500">Not enough data for chart.</div>;

    const values = data.map(d => d.value);
    const max = Math.max(...values);
    const min = Math.min(...values);
    const range = max - min;

    const points = data.map((point, i) => {
        const x = (i / (data.length - 1)) * 100;
        const y = 100 - ((point.value - min) / (range || 1)) * 100;
        return `${x},${y}`;
    }).join(' ');

    return (
        <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
            <polyline
                fill="none"
                stroke="currentColor"
                className="text-amber-500"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={points}
                vectorEffect="non-scaling-stroke"
            />
            {/* Trade Markers */}
            {data.map((point, i) => {
                if (!point.trade) return null;

                const x = (i / (data.length - 1)) * 100;
                const y = 100 - ((point.value - min) / (range || 1)) * 100;

                const color = point.trade === 'buy' ? '#10B981' : '#EF4444'; // green-500, red-500
                // Upward triangle for buy, downward for sell
                const shape = point.trade === 'buy' 
                    ? `M ${x} ${y-4} L ${x-3.5} ${y+2} L ${x+3.5} ${y+2} Z` 
                    : `M ${x} ${y+4} L ${x-3.5} ${y-2} L ${x+3.5} ${y-2} Z`;

                return (
                     <path
                        key={`trade-${i}`}
                        d={shape}
                        fill={color}
                        vectorEffect="non-scaling-stroke"
                    >
                        <title>{`${point.trade.toUpperCase()} @ ${point.value.toFixed(2)}`}</title>
                    </path>
                );
            })}
        </svg>
    );
};


export const Backtester: React.FC<{ id: string }> = ({ id }) => { // Add ID prop
    const { addLog } = useAppContext();
    const [historicalData, setHistoricalData] = useState(PRESET_DATA);
    const [strategy, setStrategy] = useState<Strategy>('sma_crossover');
    const [results, setResults] = useState<BacktestResults | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [analysis, setAnalysis] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisError, setAnalysisError] = useState<string | null>(null);

    const runBacktest = useCallback(() => {
        setIsLoading(true);
        setError(null);
        setResults(null);
        setAnalysis(null);
        setAnalysisError(null);

        addLog('AI_TOOLKIT', `Backtest initiated for strategy: ${strategy}`);

        // Simulate async operation
        setTimeout(() => {
            try {
                const lines = historicalData.trim().split('\n').slice(1);
                if (lines.length < 15) {
                    const err = "Not enough historical data. Minimum 15 days required for RSI strategy.";
                    setError(err);
                    addLog('ERROR', `Backtest failed: ${err}`);
                    throw new Error(err);
                }
                const data = lines.map(line => {
                    const [date, , , , close] = line.split(',');
                    return { date, close: parseFloat(close) };
                }).filter(d => !isNaN(d.close));

                // --- Backtesting logic ---
                let cash = 10000;
                const initialCapital = cash;
                let position = 0;
                let trades = 0;
                let winningTrades = 0;
                let lastBuyPrice = 0;
                const equityCurve: EquityDataPoint[] = [{ date: data[0].date, value: cash }];
                let peakEquity = initialCapital;
                let maxDrawdown = 0;

                if (strategy === 'sma_crossover') {
                    const shortPeriod = 5;
                    const longPeriod = 10;
                    for (let i = longPeriod; i < data.length; i++) {
                        const shortSMA = data.slice(i - shortPeriod, i).reduce((sum, d) => sum + d.close, 0) / shortPeriod;
                        const longSMA = data.slice(i - longPeriod, i).reduce((sum, d) => sum + d.close, 0) / longPeriod;
                        
                        const equityPoint: EquityDataPoint = { date: data[i].date, value: 0 };

                        if (shortSMA > longSMA && position === 0) { // Buy signal
                            const buyPrice = data[i].close;
                            position = cash / buyPrice;
                            lastBuyPrice = buyPrice;
                            cash = 0;
                            equityPoint.trade = 'buy';
                        } else if (shortSMA < longSMA && position > 0) { // Sell signal
                            const sellPrice = data[i].close;
                            cash = position * sellPrice;
                            trades++;
                            if (sellPrice > lastBuyPrice) winningTrades++;
                            position = 0;
                            equityPoint.trade = 'sell';
                        }
                        const currentEquity = cash + (position * data[i].close);
                        equityPoint.value = currentEquity;
                        equityCurve.push(equityPoint);
                        if (currentEquity > peakEquity) peakEquity = currentEquity;
                        const drawdown = (peakEquity - currentEquity) / peakEquity;
                        if (drawdown > maxDrawdown) maxDrawdown = drawdown;
                    }
                } else if (strategy === 'rsi_momentum') {
                    const rsiPeriod = 14;
                    const oversold = 30;
                    const overbought = 70;
                    let gains = 0;
                    let losses = 0;
                    
                    // Calculate initial average gain/loss
                    for (let i = 1; i <= rsiPeriod; i++) {
                        const change = data[i].close - data[i-1].close;
                        if (change > 0) gains += change;
                        else losses -= change; // losses are positive
                    }
                    let avgGain = gains / rsiPeriod;
                    let avgLoss = losses / rsiPeriod;
                    
                    let prevRSI;
                    if (avgLoss === 0) {
                        prevRSI = 100;
                    } else {
                        const rs = avgGain / avgLoss;
                        prevRSI = 100 - (100 / (1 + rs));
                    }

                    for (let i = rsiPeriod + 1; i < data.length; i++) {
                        const change = data[i].close - data[i-1].close;
                        let currentGain = change > 0 ? change : 0;
                        let currentLoss = change < 0 ? -change : 0;
                        
                        avgGain = (avgGain * (rsiPeriod - 1) + currentGain) / rsiPeriod;
                        avgLoss = (avgLoss * (rsiPeriod - 1) + currentLoss) / rsiPeriod;
                        
                        let rsi;
                        if (avgLoss === 0) {
                            rsi = 100; 
                        } else {
                            const rs = avgGain / avgLoss;
                            rsi = 100 - (100 / (1 + rs));
                        }

                        const equityPoint: EquityDataPoint = { date: data[i].date, value: 0 };
                        
                        if (rsi > oversold && prevRSI <= oversold && position === 0) { // Buy signal
                            const buyPrice = data[i].close;
                            position = cash / buyPrice;
                            lastBuyPrice = buyPrice;
                            cash = 0;
                            equityPoint.trade = 'buy';
                        } else if (rsi < overbought && prevRSI >= overbought && position > 0) { // Sell signal
                            const sellPrice = data[i].close;
                            cash = position * sellPrice;
                            trades++;
                            if (sellPrice > lastBuyPrice) winningTrades++;
                            position = 0;
                            equityPoint.trade = 'sell';
                        }
                        
                        const currentEquity = cash + (position * data[i].close);
                        equityPoint.value = currentEquity;
                        equityCurve.push(equityPoint);
                        if (currentEquity > peakEquity) peakEquity = currentEquity;
                        const drawdown = (peakEquity - currentEquity) / peakEquity;
                        if (drawdown > maxDrawdown) maxDrawdown = drawdown;
                        
                        prevRSI = rsi;
                    }
                }

                // Final equity and P/L calculations
                const finalEquity = equityCurve.length > 0 ? equityCurve[equityCurve.length - 1].value : initialCapital;
                const totalPnl = finalEquity - initialCapital;
                const pnlPercentage = (totalPnl / initialCapital) * 100;
                const winRate = trades > 0 ? (winningTrades / trades) * 100 : 0;
                
                setResults({
                    totalPnl,
                    pnlPercentage,
                    winRate,
                    maxDrawdown: maxDrawdown * finalEquity, // Max drawdown in currency
                    maxDrawdownPercentage: maxDrawdown * 100,
                    equityCurve,
                });
                addLog('AI_TOOLKIT', `Backtest completed successfully for strategy: ${strategy}. Total P/L: ${totalPnl.toFixed(2)}.`);

            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
                setError(errorMessage);
                addLog('ERROR', `Backtest failed: ${errorMessage}`);
            } finally {
                setIsLoading(false);
            }
        }, 1000); // Simulate network delay
    }, [historicalData, strategy, addLog]);

    const runAnalysis = useCallback(async () => {
        if (!results || isAnalyzing) return;
        setIsAnalyzing(true);
        setAnalysisError(null);
        setAnalysis(null);
        addLog('AI_TOOLKIT', 'Requesting AI analysis of backtest results...');

        try {
            if (!results) {
                const err = "No backtest results to analyze.";
                setAnalysisError(err);
                addLog('ERROR', `Backtest Analysis failed: ${err}`);
                throw new Error(err);
            }
            const aiAnalysis = await analyzeBacktestResults(strategy, results);
            setAnalysis(aiAnalysis);
            addLog('AI_TOOLKIT', 'AI analysis of backtest results received.');
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "An unknown error occurred during AI analysis.";
            setAnalysisError(errorMessage);
            addLog('ERROR', `Backtest Analysis failed: ${errorMessage}`);
        } finally {
            setIsAnalyzing(false);
        }
    }, [results, strategy, isAnalyzing, addLog]);

    return (
        <div id={id} className="h-full flex flex-col">
            <h3 className="text-lg font-bold text-slate-200 mb-1">Backtester</h3>
            <p className="text-sm text-slate-400 mb-4">Simulate trading strategies on historical data and get AI-powered insights.</p>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 overflow-y-auto">
                {/* Controls */}
                <div className="flex flex-col space-y-4">
                    <div>
                        <label htmlFor="strategy-select" className="block text-sm font-medium text-slate-300 mb-2">Strategy</label>
                        <select
                            id="strategy-select"
                            value={strategy}
                            onChange={(e) => setStrategy(e.target.value as Strategy)}
                            disabled={isLoading}
                            className="w-full bg-black/50 backdrop-blur-sm border border-slate-700 rounded-md p-2 text-sm text-slate-200 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition disabled:opacity-50"
                        >
                            <option value="sma_crossover">SMA Crossover</option>
                            <option value="rsi_momentum">RSI Momentum</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="historical-data" className="block text-sm font-medium text-slate-300 mb-2">Historical Data (CSV)</label>
                        <textarea
                            id="historical-data"
                            value={historicalData}
                            onChange={(e) => setHistoricalData(e.target.value)}
                            rows={10}
                            disabled={isLoading}
                            className="w-full bg-black/50 backdrop-blur-sm border border-slate-700 rounded-md p-2 text-sm text-slate-200 font-mono focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition disabled:opacity-50"
                            placeholder="Date,Open,High,Low,Close&#10;YYYY-MM-DD,100,102,99,101"
                        />
                    </div>
                    <button
                        onClick={runBacktest}
                        disabled={isLoading}
                        className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-amber-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors group"
                    >
                        {isLoading ? (
                            <>
                                <Loader />
                                <span className="ml-2">Running Backtest...</span>
                            </>
                        ) : (
                            <>
                                <PlayCircleIcon className="w-5 h-5 mr-2 -ml-1 text-amber-300" />
                                Run Backtest
                            </>
                        )}
                    </button>
                    {error && (
                         <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-md text-sm mt-4">
                            <p className="font-bold">Error:</p>
                            <p>{error}</p>
                         </div>
                     )}
                </div>

                {/* Results and Analysis */}
                <div className="flex flex-col space-y-4">
                    <div className="bg-black/30 backdrop-blur-sm rounded-lg border border-slate-800 p-4 shadow-inner flex-1 min-h-[250px] flex flex-col">
                        <h4 className="text-base font-semibold text-slate-200 mb-2">Equity Curve</h4>
                        <div className="flex-1 min-h-[150px] flex items-center justify-center">
                            {isLoading ? (
                                <Loader />
                            ) : results && results.equityCurve.length > 1 ? (
                                <EquityChart data={results.equityCurve} />
                            ) : (
                                <p className="text-slate-500 text-sm">Run a backtest to see the equity curve.</p>
                            )}
                        </div>
                        {results && (
                            <div className="mt-4 border-t border-slate-700 pt-3 text-xs font-mono text-slate-400 space-y-1">
                                <div className="flex justify-between"><span>Total P/L:</span> <span className={results.totalPnl >= 0 ? 'text-green-400' : 'text-red-400'}>{results.totalPnl.toFixed(2)} ({results.pnlPercentage.toFixed(2)}%)</span></div>
                                <div className="flex justify-between"><span>Win Rate:</span> <span className={results.winRate > 50 ? 'text-green-400' : 'text-slate-400'}>{results.winRate.toFixed(2)}%</span></div>
                                <div className="flex justify-between"><span>Max Drawdown:</span> <span className="text-red-400">{results.maxDrawdownPercentage.toFixed(2)}%</span></div>
                            </div>
                        )}
                    </div>
                    
                    <button
                        onClick={runAnalysis}
                        disabled={!results || isAnalyzing}
                        className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-sky-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors group"
                    >
                        {isAnalyzing ? (
                            <>
                                <Loader />
                                <span className="ml-2">Analyzing...</span>
                            </>
                        ) : (
                            <>
                                <SparklesIcon className="w-5 h-5 mr-2 -ml-1 text-sky-300" />
                                AI Analyze Results
                            </>
                        )}
                    </button>
                    
                    <div className="bg-black/30 backdrop-blur-sm rounded-lg border border-slate-800 p-4 shadow-inner flex-1 min-h-[150px] flex flex-col">
                        <h4 className="text-base font-semibold text-slate-200 mb-2">AI Analysis</h4>
                        <div className="flex-1 overflow-y-auto text-sm text-slate-300">
                            {isAnalyzing ? (
                                <div className="flex items-center justify-center h-full">
                                    <Loader />
                                </div>
                            ) : analysisError ? (
                                <p className="text-red-400 text-sm">{analysisError}</p>
                            ) : analysis ? (
                                <div className="prose prose-sm prose-invert max-w-none">
                                    {analysis.split('\n').map((line, idx) => {
                                        if (line.startsWith('### ')) return <h3 key={idx}>{line.substring(4)}</h3>;
                                        if (line.startsWith('## ')) return <h2 key={idx}>{line.substring(3)}</h2>;
                                        if (line.startsWith('* ')) return <li key={idx} className="ml-4">{line.substring(2)}</li>;
                                        return <p key={idx}>{line}</p>;
                                    })}
                                </div>
                            ) : (
                                <p className="text-slate-500 text-sm">AI-generated analysis will appear here after running a backtest and clicking "AI Analyze Results".</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
