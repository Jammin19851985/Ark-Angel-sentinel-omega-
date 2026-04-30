
import React, { useState, useEffect } from 'react';
import { ForecastPoint } from '../types';
import { getPredictiveForecast } from '../services/geminiService';
import Loader from './Loader';
import LineChart from './charts/LineChart';
import { ArrowUpIcon } from './icons/ArrowUpIcon';
import { ArrowDownIcon } from './icons/ArrowDownIcon';
import { useAppContext } from '../contexts/AppContext';
import { ChartInfo } from './charts/ChartInfoOverlay';
import { LivePaperBadge } from './LivePaperBadge';

interface AnalyticsProps {
    id: string; 
}

const FORECAST_INFO: ChartInfo = {
    title: "Predictive Flux Engine",
    description: "Visualizes projected price action based on stochastic volatility models and Sentinel-A market sentiment.",
    useCase: "Identifying potential trend reversals and future support/resistance levels.",
    benefits: "Provides a probabilistic 7-day outlook to inform strategic positioning.",
    howToUse: "Follow the amber trace. Shaded region indicates the confidence interval (risk variance)."
};

const Analytics: React.FC<AnalyticsProps> = ({ id }) => {
    const { marketData, addLog, trades, kpis } = useAppContext();
    const [forecast, setForecast] = useState<ForecastPoint[]>([]);
    const [isForecastLoading, setIsForecastLoading] = useState(true);
    
    // Chart Controls
    const [showTrace, setShowTrace] = useState(true);
    const [showConfidence, setShowConfidence] = useState(true);
    const [selectedPoint, setSelectedPoint] = useState<ForecastPoint | null>(null);

    useEffect(() => {
        const fetchForecast = async () => {
            const btcPrice = marketData['BTC']?.price;
            if (!btcPrice || btcPrice === 0) return;

            setIsForecastLoading(true);
            try {
                addLog('SENTINEL', 'Generating predictive forecast for BTC...');
                const forecastData = await getPredictiveForecast('BTC', btcPrice);
                const today = new Date().toISOString().split('T')[0];
                
                // Real-world safety: ensure forecastData is iterable (array)
                const safeForecastData = Array.isArray(forecastData) ? forecastData : [];
                setForecast([{ date: today, price: btcPrice }, ...safeForecastData]);
                
                addLog('SENTINEL', 'BTC forecast received and rendered.');
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
                console.error("Failed to fetch forecast:", error);
                addLog('ERROR', `Failed to generate predictive forecast: ${errorMessage}`);
            } finally {
                setIsForecastLoading(false);
            }
        };

        fetchForecast();
    }, [marketData['BTC']?.price, addLog]);
    
    const handlePointSelect = (point: ForecastPoint) => {
        setSelectedPoint(point);
    };

    const KPICard: React.FC<{ label: string; value: string; positive?: boolean }> = ({ label, value, positive }) => (
        <div className="bg-black/50 backdrop-blur-sm p-3 rounded-lg border border-slate-800 hover:border-amber-500/50 transition-colors flex flex-col justify-center min-h-[80px]">
            <div className="text-[10px] text-slate-400 font-mono uppercase tracking-wider mb-1">{label}</div>
            <div className={`text-xl font-display font-bold ${positive === true ? 'text-green-400 drop-shadow-[0_0_5px_rgba(74,222,128,0.5)]' : positive === false ? 'text-red-400 drop-shadow-[0_0_5px_rgba(248,113,113,0.5)]' : 'text-slate-100'}`}>
                {value}
            </div>
        </div>
    );

    const ToggleButton: React.FC<{ label: string, active: boolean, onClick: () => void }> = ({ label, active, onClick }) => (
        <button
            onClick={onClick}
            className={`px-3 py-1 text-[10px] font-mono rounded-full border transition-all ${
                active 
                ? 'bg-amber-900/50 border-amber-500 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.3)]' 
                : 'bg-black/30 border-slate-700 text-slate-500 hover:border-slate-500'
            }`}
        >
            {active ? '●' : '○'} {label}
        </button>
    );

    return (
        <div id={id} className="bg-black/30 backdrop-blur-sm border border-slate-800 rounded-b-lg rounded-tr-lg shadow-lg flex flex-col h-full glow-border flex-1 min-h-0 overflow-hidden tech-panel">
            <div className="p-4 border-b border-slate-800 flex-shrink-0 flex justify-between items-center">
                <h2 className="text-sm font-bold text-amber-400 font-mono">// ANALYTICS DASHBOARD // FORENSIC DISSECTION</h2>
                <LivePaperBadge />
            </div>
            <div className="flex-1 p-4 overflow-y-auto space-y-6">
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <KPICard label="Total P/L" value={`${kpis.totalPnl >= 0 ? '+' : '-'}$${Math.abs(kpis.totalPnl).toFixed(2)}`} positive={kpis.totalPnl >= 0} />
                    <KPICard label="Win/Loss Ratio" value={`${kpis.winRate.toFixed(1)}%`} positive={kpis.winRate > 50} />
                    <KPICard label="Sharpe Ratio" value={kpis.sharpeRatio.toFixed(2)} positive={kpis.sharpeRatio > 1} />
                    <KPICard label="Max Drawdown" value={`${kpis.maxDrawdown.toFixed(1)}%`} positive={false} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
                    <div className="bg-black/50 backdrop-blur-sm rounded-lg border border-slate-800 p-4 shadow-inner flex flex-col relative overflow-hidden h-[350px]">
                        <div className="flex justify-between items-center mb-4 relative z-10 flex-shrink-0">
                            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-widest">BTC/USD Predictive Forecast (7-Day)</h3>
                            <div className="flex space-x-2">
                                <ToggleButton label="Trace" active={showTrace} onClick={() => setShowTrace(!showTrace)} />
                                <ToggleButton label="Confidence" active={showConfidence} onClick={() => setShowConfidence(!showConfidence)} />
                            </div>
                        </div>
                        
                        <div className="flex-1 relative z-10 w-full min-h-0">
                            {isForecastLoading ? (
                                <div className="h-full flex flex-col items-center justify-center space-y-4">
                                    <Loader />
                                    <p className="text-xs text-amber-400 animate-pulse font-mono tracking-widest">SYNTHESIZING FUTURES...</p>
                                </div>
                            ) : (
                                <LineChart 
                                    data={forecast} 
                                    showTrace={showTrace}
                                    showConfidence={showConfidence}
                                    onPointSelect={handlePointSelect}
                                    info={FORECAST_INFO}
                                />
                            )}
                        </div>

                        {/* Decorative Scanline */}
                        <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] pointer-events-none z-0 opacity-30"></div>

                        {selectedPoint && (
                            <div className="absolute bottom-4 left-4 right-4 p-3 bg-amber-900/90 border border-amber-500/50 rounded-md animate-fade-in-fast flex justify-between items-center z-20 backdrop-blur-md shadow-lg">
                                <div>
                                    <span className="text-[9px] text-amber-300 font-mono block uppercase">Data Point</span>
                                    <span className="text-xs text-white font-mono font-bold">{selectedPoint.date}</span>
                                </div>
                                <div className="text-right">
                                    <span className="text-[9px] text-amber-300 font-mono block uppercase">Projected</span>
                                    <span className="text-sm font-bold text-white font-mono">${selectedPoint.price.toFixed(2)}</span>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="bg-black/50 backdrop-blur-sm rounded-lg border border-slate-800 p-4 shadow-inner flex flex-col h-[350px]">
                        <h3 className="text-xs font-bold text-slate-200 mb-2 uppercase tracking-widest flex-shrink-0">Recent Trade History</h3>
                        <div className="flex-1 overflow-hidden font-mono text-[10px] flex flex-col">
                            <div className="grid grid-cols-5 gap-2 text-slate-500 mb-2 px-2 uppercase tracking-tight flex-shrink-0">
                                <span>TIME</span>
                                <span>SYMBOL</span>
                                <span className="text-right">QTY</span>
                                <span className="text-right">PRICE</span>
                                <span className="text-right">P/L</span>
                            </div>
                            <div className="space-y-1 flex-1 overflow-y-auto custom-scrollbar">
                                {trades.map(trade => (
                                    <div key={trade.id} className={`grid grid-cols-5 gap-2 p-2 rounded-sm border border-transparent hover:border-slate-600 transition-colors ${trade.action === 'BUY' ? 'bg-emerald-950/20 text-emerald-100' : 'bg-rose-950/20 text-rose-100'}`}>
                                        <span className="opacity-70">{trade.timestamp}</span>
                                        <div className="flex items-center space-x-1">
                                            {trade.action === 'BUY' ? <ArrowUpIcon className="w-2.5 h-2.5 text-emerald-400"/> : <ArrowDownIcon className="w-2.5 h-2.5 text-rose-400"/>}
                                            <span className="font-bold">{trade.symbol}</span>
                                        </div>
                                        <span className="text-right opacity-80">{trade.quantity}</span>
                                        <span className="text-right opacity-80">${trade.price.toFixed(2)}</span>
                                        <span className={`text-right font-bold ${trade.pnl > 0 ? 'text-emerald-400' : trade.pnl < 0 ? 'text-rose-400' : 'text-slate-500'}`}>
                                            {trade.action === 'SELL' ? `${trade.pnl >= 0 ? '+' : ''}$${trade.pnl.toFixed(2)}` : '--'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Analytics;
