
import React, { useState, useEffect } from 'react';
import { ForecastPoint } from '../types';
import { getPredictiveForecast } from '../services/geminiService';
import Loader from './Loader';
import LineChart from './charts/LineChart';
import { ArrowUpIcon } from './icons/ArrowUpIcon';
import { ArrowDownIcon } from './icons/ArrowDownIcon';
import { useAppContext } from '../contexts/AppContext';

interface AnalyticsProps {
    id: string; // New: Add ID prop for tour targeting
}

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
                setForecast([{ date: today, price: btcPrice }, ...forecastData]);
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
        <div className="bg-black/50 backdrop-blur-sm p-3 rounded-lg border border-slate-800 hover:border-amber-500/50 transition-colors">
            <div className="text-xs text-slate-400 font-mono">{label}</div>
            <div className={`text-xl font-bold ${positive === true ? 'text-green-400' : positive === false ? 'text-red-400' : 'text-slate-100'}`}>
                {value}
            </div>
        </div>
    );

    const ToggleButton: React.FC<{ label: string, active: boolean, onClick: () => void }> = ({ label, active, onClick }) => (
        <button
            onClick={onClick}
            className={`px-3 py-1 text-xs font-mono rounded-full border transition-all ${
                active 
                ? 'bg-amber-900/50 border-amber-500 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.3)]' 
                : 'bg-black/30 border-slate-700 text-slate-500 hover:border-slate-500'
            }`}
        >
            {active ? '●' : '○'} {label}
        </button>
    );

    return (
        <div id={id} className="bg-black/30 backdrop-blur-sm border border-slate-800 rounded-b-lg rounded-tr-lg shadow-lg flex flex-col h-full glow-border flex-1">
            <div className="p-4 border-b border-slate-800">
                <h2 className="text-sm font-bold text-amber-400 font-mono">// ANALYTICS DASHBOARD // FORENSIC DISSECTION</h2>
            </div>
            <div className="flex-1 p-4 overflow-y-auto space-y-6">
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <KPICard label="Total P/L" value={`${kpis.totalPnl >= 0 ? '+' : '-'}$${Math.abs(kpis.totalPnl).toFixed(2)}`} positive={kpis.totalPnl >= 0} />
                    <KPICard label="Win/Loss Ratio" value={`${kpis.winRate.toFixed(1)}%`} positive={kpis.winRate > 50} />
                    <KPICard label="Sharpe Ratio" value={kpis.sharpeRatio.toFixed(2)} positive={kpis.sharpeRatio > 1} />
                    <KPICard label="Max Drawdown" value={`${kpis.maxDrawdown.toFixed(1)}%`} positive={false} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-black/50 backdrop-blur-sm rounded-lg border border-slate-800 p-4 shadow-inner flex flex-col relative overflow-hidden">
                        <div className="flex justify-between items-center mb-4 relative z-10">
                            <h3 className="text-base font-semibold text-slate-200">BTC/USD Predictive Forecast (7-Day)</h3>
                            <div className="flex space-x-2">
                                <ToggleButton label="Trace" active={showTrace} onClick={() => setShowTrace(!showTrace)} />
                                <ToggleButton label="Confidence" active={showConfidence} onClick={() => setShowConfidence(!showConfidence)} />
                            </div>
                        </div>
                        
                        <div className="h-64 relative z-10">
                            {isForecastLoading ? (
                                <div className="h-full flex flex-col items-center justify-center space-y-4">
                                    <Loader />
                                    <p className="text-sm text-amber-400 animate-pulse font-mono">SYNTHESIZING FUTURES...</p>
                                </div>
                            ) : (
                                <LineChart 
                                    data={forecast} 
                                    showTrace={showTrace}
                                    showConfidence={showConfidence}
                                    onPointSelect={handlePointSelect}
                                />
                            )}
                        </div>

                        {/* Decorative Scanline for "4D" effect */}
                        <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] pointer-events-none z-0 opacity-30"></div>

                        {selectedPoint && (
                            <div className="mt-4 p-3 bg-amber-900/20 border border-amber-900/50 rounded-md animate-fade-in-fast flex justify-between items-center relative z-10">
                                <div>
                                    <span className="text-xs text-amber-500 font-mono block">SELECTED DATA POINT</span>
                                    <span className="text-sm text-slate-300 font-mono">{selectedPoint.date}</span>
                                </div>
                                <div className="text-right">
                                    <span className="text-xs text-slate-500 font-mono block">PROJECTED PRICE</span>
                                    <span className="text-lg font-bold text-white font-mono">${selectedPoint.price.toFixed(2)}</span>
                                </div>
                            </div>
                        )}
                        {!selectedPoint && !isForecastLoading && (
                             <div className="mt-4 p-3 text-center relative z-10">
                                <span className="text-xs text-slate-600 font-mono">Select a point on the chart for details</span>
                             </div>
                        )}
                    </div>

                    <div className="bg-black/50 backdrop-blur-sm rounded-lg border border-slate-800 p-4 shadow-inner flex flex-col">
                        <h3 className="text-base font-semibold text-slate-200 mb-2">Recent Trade History</h3>
                        <div className="flex-1 overflow-y-auto font-mono text-xs">
                            <div className="grid grid-cols-5 gap-2 text-slate-500 mb-2 px-2">
                                <span>TIME</span>
                                <span>SYMBOL</span>
                                <span className="text-right">QTY</span>
                                <span className="text-right">PRICE</span>
                                <span className="text-right">P/L</span>
                            </div>
                            <div className="space-y-1 max-h-[350px] overflow-y-auto">
                                {trades.map(trade => (
                                    <div key={trade.id} className={`grid grid-cols-5 gap-2 p-2 rounded-md ${trade.action === 'BUY' ? 'bg-amber-950/50' : 'bg-red-950/50'}`}>
                                        <span className="text-slate-400">{trade.timestamp}</span>
                                        <div className="flex items-center space-x-1">
                                            {trade.action === 'BUY' ? <ArrowUpIcon className="w-3 h-3 text-green-400"/> : <ArrowDownIcon className="w-3 h-3 text-red-400"/>}
                                            <span className="text-slate-200 font-bold">{trade.symbol}</span>
                                        </div>
                                        <span className="text-right text-slate-300">{trade.quantity}</span>
                                        <span className="text-right text-slate-300">${trade.price.toFixed(2)}</span>
                                        <span className={`text-right font-medium ${trade.pnl > 0 ? 'text-green-400' : trade.pnl < 0 ? 'text-red-400' : 'text-slate-500'}`}>
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
