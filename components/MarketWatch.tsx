
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MarketData } from '../types';
import PriceTrendTooltip from './charts/PriceTrendTooltip';
import { Sparkline } from './charts/Sparkline';
import { SearchIcon } from './icons/SearchIcon';
import { BellIcon } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';
import { LivePaperBadge } from './LivePaperBadge';
import Loader from './Loader';
import { TSX_SYMBOLS, GLOBAL_SYMBOLS } from '../constants';

const MARKET_NEWS_HEADLINES = [
    { headline: "TSX leads global recovery as energy sector surges.", source: "Financial Post" },
    { headline: "Bank of Canada signals rate stability for Q3.", source: "Globe and Mail" },
    { headline: "Tweed Node reports 100% Majorana coherence.", source: "AODE_FEED" },
    { headline: "NDAX expands Calgary infrastructure for HFT.", source: "Calgary Herald" },
];

interface MarketWatchProps { id: string; }

const CRYPTO_SYMBOLS = ['BTC', 'ETH', 'SOL', 'ADA'];

const MarketWatch: React.FC<MarketWatchProps> = ({ id }) => {
    const { marketData, historicalMarketData, marketFilter, setMarketFilter, fetchSymbolData, addLog } = useAppContext();
    
    // We use refs for tracking previous prices to strictly avoid re-render loops.
    const prevPricesRef = useRef<Record<string, number>>({});
    // Store flashes just for visual indications
    const [priceChanges, setPriceChanges] = useState<Record<string, 'up' | 'down'>>({});
    
    const [hoveredSymbol, setHoveredSymbol] = useState<string | null>(null);
    const [currentNewsIndex, setCurrentNewsIndex] = useState(0);
    const [activeTab, setActiveTab] = useState<'ALL' | 'CRYPTO' | 'STOCKS' | 'CANADA'>('ALL');
    const [isFetching, setIsFetching] = useState(false);
    
    // Custom Price Alert state
    const [priceAlerts, setPriceAlerts] = useState<Record<string, { high?: number, low?: number }>>({});
    const [alertModalSymbol, setAlertModalSymbol] = useState<string | null>(null);
    const [tempHighAlert, setTempHighAlert] = useState<string>('');
    const [tempLowAlert, setTempLowAlert] = useState<string>('');

    // Request Notification permission
    useEffect(() => {
        if ('Notification' in window && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
            Notification.requestPermission();
        }
    }, []);

    // Check alerts and update flashes
    useEffect(() => {
        const changes: Record<string, 'up' | 'down'> = {};
        let hasChanges = false;
        
        Object.keys(marketData).forEach(symbol => {
            const currentPrice = marketData[symbol]?.price;
            const previousPrice = prevPricesRef.current[symbol];
            
            if (currentPrice && previousPrice && currentPrice !== previousPrice) {
                changes[symbol] = currentPrice > previousPrice ? 'up' : 'down';
                hasChanges = true;
            }
            
            // Trigger alerts
            if (currentPrice) {
                const alerts = priceAlerts[symbol];
                if (alerts) {
                    if (alerts.high && currentPrice >= alerts.high && (!previousPrice || previousPrice < alerts.high)) {
                        triggerNotification(symbol, 'HIGH', currentPrice, alerts.high);
                    }
                    if (alerts.low && currentPrice <= alerts.low && (!previousPrice || previousPrice > alerts.low)) {
                        triggerNotification(symbol, 'LOW', currentPrice, alerts.low);
                    }
                }
                prevPricesRef.current[symbol] = currentPrice;
            }
        });
        
        if (hasChanges) {
            // setPriceChanges(changes);
            // const timer = setTimeout(() => setPriceChanges({}), 1000);
            // return () => clearTimeout(timer);
        }
    }, [marketData, priceAlerts]);

    const triggerNotification = useCallback((symbol: string, direction: 'HIGH' | 'LOW', currentPrice: number, threshold: number) => {
        const msg = `${symbol} crossed ${direction} threshold! Current: $${currentPrice.toFixed(2)} (Alert: $${threshold.toFixed(2)})`;
        addLog('ALERT', msg);
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Sovereign Alert', { body: msg });
        }
    }, [addLog]);

    useEffect(() => {
        const newsInterval = setInterval(() => setCurrentNewsIndex(prev => (prev + 1) % MARKET_NEWS_HEADLINES.length), 7000);
        return () => clearInterval(newsInterval);
    }, []);

    const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && marketFilter.trim()) {
            setIsFetching(true);
            await fetchSymbolData(marketFilter.trim());
            setIsFetching(false);
        }
    };

    const getPriceColorClass = (symbol: string) => {
        const changeStatus = priceChanges[symbol];
        if (changeStatus === 'up') return 'text-green-300';
        if (changeStatus === 'down') return 'text-red-300';
        return (marketData[symbol]?.change ?? 0) >= 0 ? 'text-green-400' : 'text-red-400';
    };

    const filteredSymbols = Object.keys(marketData).filter(symbol => {
        const matchesSearch = symbol.toLowerCase().includes(marketFilter.toLowerCase());
        const isCrypto = CRYPTO_SYMBOLS.includes(symbol);
        const isCanada = TSX_SYMBOLS.includes(symbol);
        const isGlobal = GLOBAL_SYMBOLS.includes(symbol);
        
        const matchesTab = 
            activeTab === 'ALL' || 
            (activeTab === 'CRYPTO' && isCrypto) || 
            (activeTab === 'CANADA' && isCanada) || 
            (activeTab === 'STOCKS' && isGlobal);
            
        return matchesSearch && matchesTab;
    });
    
    const TabButton: React.FC<{ tab: typeof activeTab, label: string }> = ({ tab, label }) => (
        <button
            onClick={() => setActiveTab(tab)}
            className={`px-2 py-0.5 text-[8px] font-bold uppercase rounded-sm border transition-all ${
                activeTab === tab 
                ? 'bg-amber-900/50 border-amber-500 text-amber-300 shadow-[0_0_5px_rgba(245,158,11,0.3)]' 
                : 'bg-black/30 border-slate-800 text-slate-500 hover:text-slate-300 hover:border-slate-600'
            }`}
        >
            {label}
        </button>
    );

    const openAlertModal = (symbol: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setAlertModalSymbol(symbol);
        setTempHighAlert(priceAlerts[symbol]?.high?.toString() || '');
        setTempLowAlert(priceAlerts[symbol]?.low?.toString() || '');
    };

    const saveAlerts = () => {
        if (alertModalSymbol) {
            setPriceAlerts(prev => ({
                ...prev,
                [alertModalSymbol]: {
                    high: tempHighAlert ? parseFloat(tempHighAlert) : undefined,
                    low: tempLowAlert ? parseFloat(tempLowAlert) : undefined
                }
            }));
            updateModalClose();
        }
    };
    
    const updateModalClose = () => {
        setAlertModalSymbol(null);
        setTempHighAlert('');
        setTempLowAlert('');
    };

    return (
        <div id={id} className="tech-panel p-3 flex flex-col h-full bg-black/60 relative">
            <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                    <h2 className="micro-label">// MARKET WATCH</h2>
                </div>
                <LivePaperBadge />
            </div>
            
            <div className="flex gap-1 mb-2">
                <TabButton tab="ALL" label="All" />
                <TabButton tab="CANADA" label="TSX" />
                <TabButton tab="CRYPTO" label="Crypto" />
                <TabButton tab="STOCKS" label="Global" />
            </div>

            <div className="relative mb-3 group">
                <input 
                    type="text"
                    value={marketFilter}
                    onChange={(e) => setMarketFilter(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="SCAN_TICKER (ENTER)..."
                    disabled={isFetching}
                    className="w-full bg-black/80 border border-slate-700 rounded-sm pl-8 pr-8 py-1 text-[10px] font-mono text-slate-200 placeholder-slate-600 focus:border-amber-500 transition outline-none"
                />
                <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-600 pointer-events-none" />
                {isFetching && <div className="absolute right-2.5 top-1/2 -translate-y-1/2"><Loader /></div>}
            </div>
            
            <div className="flex-1 flex flex-col min-h-0">
                <div className="grid grid-cols-12 font-mono text-[9px] text-slate-600 px-2 pb-1 border-b border-slate-800 uppercase tracking-wider">
                    <span className="col-span-2">Sym</span>
                    <span className="col-span-2 text-center">Trend</span>
                    <span className="col-span-3 text-right">Price</span>
                    <span className="col-span-4 text-right">Volume</span>
                    <span className="col-span-1 border-transparent text-center">🔔</span>
                </div>
                <div className="space-y-0.5 overflow-y-auto flex-1 p-1 -m-1 custom-scrollbar">
                    {filteredSymbols.map((symbol) => {
                        const data = marketData[symbol];
                        const history = historicalMarketData[symbol] || [];
                        const formattedVolume = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact' }).format(data.volume);
                        const isUp = history.length > 1 && history[history.length - 1] >= history[0];
                        const hasAlert = priceAlerts[symbol]?.high || priceAlerts[symbol]?.low;

                        return (
                            <div 
                                key={symbol} 
                                className={`relative grid grid-cols-12 items-center font-mono text-[10px] p-1 rounded-sm transition-colors cursor-crosshair hover:bg-white/5 ${priceChanges[symbol] === 'up' ? 'flash-green' : priceChanges[symbol] === 'down' ? 'flash-red' : ''}`}
                                onMouseEnter={() => setHoveredSymbol(symbol)}
                                onMouseLeave={() => setHoveredSymbol(null)}
                            >
                                <span className="text-slate-300 col-span-2 truncate font-bold">{symbol}</span>
                                <div className="col-span-2 h-4 flex items-center justify-center opacity-80">
                                    <Sparkline data={history} width={40} height={16} color={isUp ? '#4ade80' : '#f87171'} strokeWidth={1} />
                                </div>
                                <span className={`font-medium text-right col-span-3 flex flex-col items-end ${getPriceColorClass(symbol)}`}>
                                    <span>{data.price.toFixed(2)}</span>
                                    <span className={`text-[8px] ${data.change >= 0 ? 'text-green-500/70' : 'text-red-500/70'}`}>
                                        {data.change >= 0 ? '+' : ''}{data.change.toFixed(2)}%
                                    </span>
                                </span>
                                <span className="text-slate-500 text-right col-span-4 flex items-center justify-end">
                                    {formattedVolume}
                                </span>
                                <button 
                                    className={`col-span-1 flex items-center justify-center transition-colors ${hasAlert ? 'text-amber-400' : 'text-slate-700 hover:text-slate-400'}`}
                                    onClick={(e) => openAlertModal(symbol, e)}
                                    title="Set Price Alert"
                                >
                                    <BellIcon className="w-3 h-3" />
                                </button>
                                {hoveredSymbol === symbol && history.length > 1 && <PriceTrendTooltip history={history} />}
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="mt-3 pt-2 border-t border-slate-800">
                <h3 className="text-[9px] font-bold text-slate-500 mb-1 font-mono uppercase tracking-widest">// INTEL_FEED</h3>
                {MARKET_NEWS_HEADLINES[currentNewsIndex] && (
                    <div key={currentNewsIndex} className="animate-fade-in-fast min-h-[30px]">
                        <p className="text-[10px] text-slate-400 leading-tight truncate">{MARKET_NEWS_HEADLINES[currentNewsIndex].headline}</p>
                    </div>
                )}
            </div>

            {/* Sub-modal for Alert Config */}
            {alertModalSymbol && (
                <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-700 rounded-md shadow-2xl p-4 w-full flex flex-col gap-3 font-mono">
                        <div className="flex justify-between items-center text-slate-200 uppercase tracking-wider text-[10px] font-bold pb-2 border-b border-slate-800">
                            <span>ALERT: {alertModalSymbol}</span>
                            <button onClick={updateModalClose} className="text-slate-500 hover:text-slate-300">✕</button>
                        </div>
                        
                        <div className="flex flex-col gap-1">
                            <label className="text-[9px] text-slate-400">HIGH THRESHOLD (Trigger above):</label>
                            <input 
                                type="number" 
                                value={tempHighAlert}
                                onChange={(e) => setTempHighAlert(e.target.value)}
                                className="bg-black border border-slate-800 w-full px-2 py-1 text-[11px] text-amber-400 focus:border-amber-500 outline-none rounded-sm"
                                placeholder="e.g. 150.00"
                            />
                        </div>
                        
                        <div className="flex flex-col gap-1">
                            <label className="text-[9px] text-slate-400">LOW THRESHOLD (Trigger below):</label>
                            <input 
                                type="number" 
                                value={tempLowAlert}
                                onChange={(e) => setTempLowAlert(e.target.value)}
                                className="bg-black border border-slate-800 w-full px-2 py-1 text-[11px] text-red-400 focus:border-red-500 outline-none rounded-sm"
                                placeholder="e.g. 90.00"
                            />
                        </div>

                        <div className="flex justify-end gap-2 mt-2">
                            <button onClick={updateModalClose} className="px-3 py-1 text-[9px] uppercase border border-slate-700 text-slate-400 hover:bg-slate-800 rounded-sm transition">Cancel</button>
                            <button onClick={saveAlerts} className="px-3 py-1 text-[9px] uppercase border border-amber-600/50 bg-amber-900/30 text-amber-400 hover:bg-amber-900/60 rounded-sm transition">Save Alerts</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default React.memo(MarketWatch);

