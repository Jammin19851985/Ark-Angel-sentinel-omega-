
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MarketData } from '../types';
import PriceTrendTooltip from './charts/PriceTrendTooltip';
import { Sparkline } from './charts/Sparkline';
import { SearchIcon } from './icons/SearchIcon';
import { BellIcon, BarChart2, History, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';
import { LivePaperBadge } from './LivePaperBadge';
import Loader from './Loader';
import { TSX_SYMBOLS, GLOBAL_SYMBOLS } from '../constants';
import HistoricalTradesView from './HistoricalTradesView';

const MARKET_NEWS_HEADLINES = [
    { headline: "TSX leads global recovery as energy sector surges.", source: "Financial Post" },
    { headline: "Bank of Canada signals rate stability for Q3.", source: "Globe and Mail" },
    { headline: "Tweed Node reports 100% Majorana coherence.", source: "AODE_FEED" },
    { headline: "NDAX expands Calgary infrastructure for HFT.", source: "Calgary Herald" },
];

interface MarketWatchProps { id: string; }

const CRYPTO_SYMBOLS = ['BTC', 'ETH', 'SOL', 'ADA'];

type SortField = 'symbol' | 'price' | 'change';
type SortOrder = 'asc' | 'desc';

interface ThresholdConfig {
    tier: 'SURGE_BULL' | 'BULL' | 'NEUTRAL_POS' | 'NEUTRAL_NEG' | 'BEAR' | 'CRASH_BEAR';
    label: string;
    dotClass: string;
    textClass: string;
    badgeBg: string;
    badgeBorder: string;
    glowClass: string;
    badgeGlow: string;
    icon: string;
}

const getThresholdIndicator = (change: number = 0): ThresholdConfig => {
    if (change >= 2.5) {
        return {
            tier: 'SURGE_BULL',
            label: 'SURGE BULL (>= +2.5%)',
            dotClass: 'bg-emerald-400 border-emerald-300 ring-2 ring-emerald-500/60 animate-pulse glow-beacon-green-high',
            textClass: 'text-emerald-300 font-bold',
            badgeBg: 'bg-emerald-950/80',
            badgeBorder: 'border-emerald-400/80',
            glowClass: 'shadow-[0_0_12px_rgba(34,197,94,0.85)]',
            badgeGlow: 'shadow-[0_0_8px_rgba(34,197,94,0.6)]',
            icon: '▲'
        };
    }
    if (change >= 0.5) {
        return {
            tier: 'BULL',
            label: 'BULLISH (>= +0.5%)',
            dotClass: 'bg-emerald-500 border-emerald-400 glow-beacon-green-mid',
            textClass: 'text-emerald-400 font-semibold',
            badgeBg: 'bg-emerald-950/50',
            badgeBorder: 'border-emerald-500/60',
            glowClass: 'shadow-[0_0_7px_rgba(34,197,94,0.5)]',
            badgeGlow: 'shadow-[0_0_5px_rgba(34,197,94,0.35)]',
            icon: '▲'
        };
    }
    if (change >= 0) {
        return {
            tier: 'NEUTRAL_POS',
            label: 'MILD GAIN (0% to +0.5%)',
            dotClass: 'bg-emerald-500/80 border-emerald-600/70',
            textClass: 'text-emerald-400/90',
            badgeBg: 'bg-emerald-950/30',
            badgeBorder: 'border-emerald-700/50',
            glowClass: 'shadow-[0_0_4px_rgba(34,197,94,0.35)]',
            badgeGlow: 'shadow-[0_0_3px_rgba(34,197,94,0.2)]',
            icon: '▲'
        };
    }
    if (change > -0.5) {
        return {
            tier: 'NEUTRAL_NEG',
            label: 'MILD PULLBACK (0% to -0.5%)',
            dotClass: 'bg-rose-500/80 border-rose-600/70',
            textClass: 'text-rose-400/90',
            badgeBg: 'bg-rose-950/30',
            badgeBorder: 'border-rose-700/50',
            glowClass: 'shadow-[0_0_4px_rgba(239,68,68,0.35)]',
            badgeGlow: 'shadow-[0_0_3px_rgba(239,68,68,0.2)]',
            icon: '▼'
        };
    }
    if (change > -2.5) {
        return {
            tier: 'BEAR',
            label: 'BEARISH (<= -0.5%)',
            dotClass: 'bg-rose-500 border-rose-400 glow-beacon-red-mid',
            textClass: 'text-rose-400 font-semibold',
            badgeBg: 'bg-rose-950/50',
            badgeBorder: 'border-rose-500/60',
            glowClass: 'shadow-[0_0_7px_rgba(239,68,68,0.5)]',
            badgeGlow: 'shadow-[0_0_5px_rgba(239,68,68,0.35)]',
            icon: '▼'
        };
    }
    return {
        tier: 'CRASH_BEAR',
        label: 'HYPER BEARISH (<= -2.5%)',
        dotClass: 'bg-rose-500 border-rose-300 ring-2 ring-rose-500/60 animate-pulse glow-beacon-red-high',
        textClass: 'text-rose-300 font-bold',
        badgeBg: 'bg-rose-950/80',
        badgeBorder: 'border-rose-400/80',
        glowClass: 'shadow-[0_0_12px_rgba(239,68,68,0.85)]',
        badgeGlow: 'shadow-[0_0_8px_rgba(239,68,68,0.6)]',
        icon: '▼'
    };
};

const MarketWatch: React.FC<MarketWatchProps> = ({ id }) => {
    const { marketData, historicalMarketData, marketFilter, setMarketFilter, fetchSymbolData, addLog, trades } = useAppContext();
    
    // Primary View Mode: TICKERS or HISTORICAL TRADES
    const [viewMode, setViewMode] = useState<'TICKERS' | 'TRADES'>('TICKERS');

    // Sorting state
    const [sortField, setSortField] = useState<SortField>('change');
    const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

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

    const triggerNotification = useCallback((symbol: string, direction: 'HIGH' | 'LOW', currentPrice: number, threshold: number) => {
        const msg = `${symbol} crossed ${direction} threshold! Current: $${currentPrice.toFixed(2)} (Alert: $${threshold.toFixed(2)})`;
        addLog('ALERT', msg);
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Sovereign Alert', { body: msg });
        }
    }, [addLog]);

    // Check alerts and update real-time tick flashes
    useEffect(() => {
        const changes: Record<string, 'up' | 'down'> = {};
        let hasChanges = false;
        
        Object.keys(marketData).forEach(symbol => {
            const currentPrice = marketData[symbol]?.price;
            const previousPrice = prevPricesRef.current[symbol];
            
            if (currentPrice !== undefined && previousPrice !== undefined && currentPrice !== previousPrice) {
                changes[symbol] = currentPrice > previousPrice ? 'up' : 'down';
                hasChanges = true;
            }
            
            // Trigger alerts
            if (currentPrice !== undefined) {
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
            setPriceChanges(prev => ({ ...prev, ...changes }));
            const timer = setTimeout(() => {
                setPriceChanges(prev => {
                    const next = { ...prev };
                    Object.keys(changes).forEach(k => delete next[k]);
                    return next;
                });
            }, 1200);
            return () => clearTimeout(timer);
        }
    }, [marketData, priceAlerts, triggerNotification]);

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
        if (changeStatus === 'up') return 'text-green-300 font-bold';
        if (changeStatus === 'down') return 'text-red-300 font-bold';
        return (marketData[symbol]?.change ?? 0) >= 0 ? 'text-green-400' : 'text-red-400';
    };

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortField(field);
            setSortOrder(field === 'symbol' ? 'asc' : 'desc');
        }
    };

    const renderSortIcon = (field: SortField) => {
        if (sortField !== field) {
            return <ArrowUpDown className="w-2.5 h-2.5 opacity-40 group-hover:opacity-100 transition" />;
        }
        return sortOrder === 'asc' ? (
            <ArrowUp className="w-2.5 h-2.5 text-amber-400" />
        ) : (
            <ArrowDown className="w-2.5 h-2.5 text-amber-400" />
        );
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

    const sortedSymbols = [...filteredSymbols].sort((a, b) => {
        const dataA = marketData[a];
        const dataB = marketData[b];
        if (!dataA && !dataB) return 0;
        if (!dataA) return 1;
        if (!dataB) return -1;

        let comp = 0;
        if (sortField === 'symbol') {
            comp = a.localeCompare(b);
        } else if (sortField === 'price') {
            comp = (dataA.price || 0) - (dataB.price || 0);
        } else if (sortField === 'change') {
            comp = (dataA.change || 0) - (dataB.change || 0);
        }

        return sortOrder === 'asc' ? comp : -comp;
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
        <div id={id} className="tech-panel holographic-panel p-3 flex flex-col h-full bg-black/60 relative">
            {/* Header with Title, Mode Switcher, and Live Badge */}
            <div className="flex justify-between items-center mb-2 pb-1.5 border-b border-slate-800">
                <div className="flex items-center gap-2">
                    <h2 className="micro-label">// MARKET WATCH</h2>
                </div>

                {/* Sub-view switcher tabs */}
                <div className="flex items-center gap-1 bg-black/50 p-0.5 rounded border border-slate-800">
                    <button
                        onClick={() => setViewMode('TICKERS')}
                        className={`flex items-center gap-1 px-2 py-0.5 text-[8.5px] font-bold uppercase rounded-sm transition ${
                            viewMode === 'TICKERS'
                            ? 'bg-amber-950/80 text-amber-300 border border-amber-500/50 shadow-[0_0_5px_rgba(245,158,11,0.2)]'
                            : 'text-slate-500 hover:text-slate-300 border border-transparent'
                        }`}
                        title="Live Tickers and Price Trends"
                    >
                        <BarChart2 className="w-2.5 h-2.5" />
                        <span>TICKERS</span>
                        <span className="text-[7.5px] opacity-70">({Object.keys(marketData).length})</span>
                    </button>

                    <button
                        onClick={() => setViewMode('TRADES')}
                        className={`flex items-center gap-1 px-2 py-0.5 text-[8.5px] font-bold uppercase rounded-sm transition ${
                            viewMode === 'TRADES'
                            ? 'bg-amber-950/80 text-amber-300 border border-amber-500/50 shadow-[0_0_5px_rgba(245,158,11,0.2)]'
                            : 'text-slate-500 hover:text-slate-300 border border-transparent'
                        }`}
                        title="Historical Executed Orders & Statuses"
                    >
                        <History className="w-2.5 h-2.5" />
                        <span>HISTORICAL TRADES</span>
                        <span className="px-1 py-0.2 rounded-full text-[7px] font-mono bg-amber-900/60 text-amber-300 border border-amber-700/40">
                            {trades.length}
                        </span>
                    </button>
                </div>

                <LivePaperBadge />
            </div>
            
            {viewMode === 'TRADES' ? (
                /* Historical Executed Orders View */
                <div className="flex-1 flex flex-col min-h-0">
                    <HistoricalTradesView />
                </div>
            ) : (
                /* Live Market Watch Tickers View */
                <div className="flex-1 flex flex-col min-h-0">
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
                        {/* Quick Sorting Toolbar */}
                        <div className="flex items-center justify-between px-1.5 py-1 mb-1.5 bg-black/40 rounded border border-slate-800/80 text-[8px] font-mono">
                            <div className="flex items-center gap-1">
                                <span className="text-slate-500 uppercase tracking-wider">SORT:</span>
                                <span className="text-amber-400 font-bold uppercase">{sortField} {sortOrder === 'asc' ? '▲' : '▼'}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => handleSort('symbol')}
                                    className={`px-1.5 py-0.5 rounded text-[7.5px] font-bold border transition ${
                                        sortField === 'symbol' 
                                        ? 'bg-amber-950/80 border-amber-500/80 text-amber-300 shadow-[0_0_6px_rgba(245,158,11,0.25)]' 
                                        : 'bg-black/40 border-slate-800 text-slate-500 hover:text-slate-300 hover:border-slate-700'
                                    }`}
                                    title="Toggle Sort by Symbol / Name"
                                >
                                    NAME {sortField === 'symbol' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                                </button>
                                <button
                                    onClick={() => handleSort('price')}
                                    className={`px-1.5 py-0.5 rounded text-[7.5px] font-bold border transition ${
                                        sortField === 'price' 
                                        ? 'bg-amber-950/80 border-amber-500/80 text-amber-300 shadow-[0_0_6px_rgba(245,158,11,0.25)]' 
                                        : 'bg-black/40 border-slate-800 text-slate-500 hover:text-slate-300 hover:border-slate-700'
                                    }`}
                                    title="Toggle Sort by Price"
                                >
                                    PRICE {sortField === 'price' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                                </button>
                                <button
                                    onClick={() => handleSort('change')}
                                    className={`px-1.5 py-0.5 rounded text-[7.5px] font-bold border transition ${
                                        sortField === 'change' 
                                        ? 'bg-amber-950/80 border-amber-500/80 text-amber-300 shadow-[0_0_6px_rgba(245,158,11,0.25)]' 
                                        : 'bg-black/40 border-slate-800 text-slate-500 hover:text-slate-300 hover:border-slate-700'
                                    }`}
                                    title="Toggle Sort by 24h Percentage Change"
                                >
                                    24H % {sortField === 'change' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                                </button>
                            </div>
                        </div>

                        {/* Sortable Column Headers */}
                        <div className="grid grid-cols-12 font-mono text-[9px] text-slate-400 px-1.5 pb-1 border-b border-slate-800 uppercase tracking-wider select-none items-center">
                            <button 
                                onClick={() => handleSort('symbol')}
                                className={`col-span-3 flex items-center gap-1 text-left font-bold transition hover:text-amber-300 ${
                                    sortField === 'symbol' ? 'text-amber-400' : 'text-slate-500'
                                }`}
                                title="Click to Sort by Symbol / Name"
                            >
                                <span>SYM</span>
                                {renderSortIcon('symbol')}
                            </button>
                            <span className="col-span-2 text-center text-slate-600">TREND</span>
                            <button 
                                onClick={() => handleSort('price')}
                                className={`col-span-3 flex items-center justify-end gap-1 text-right font-bold transition hover:text-amber-300 ${
                                    sortField === 'price' ? 'text-amber-400' : 'text-slate-500'
                                }`}
                                title="Click to Sort by Current Price"
                            >
                                <span>PRICE</span>
                                {renderSortIcon('price')}
                            </button>
                            <button 
                                onClick={() => handleSort('change')}
                                className={`col-span-3 flex items-center justify-end gap-1 text-right font-bold transition hover:text-amber-300 ${
                                    sortField === 'change' ? 'text-amber-400' : 'text-slate-500'
                                }`}
                                title="Click to Sort by 24h Percentage Change"
                            >
                                <span>24H %</span>
                                {renderSortIcon('change')}
                            </button>
                            <span className="col-span-1 border-transparent text-center text-slate-600" title="Price Alerts">🔔</span>
                        </div>

                        {/* List of Tickers with Glowing Visual Indicators */}
                        <div className="space-y-0.5 overflow-y-auto flex-1 p-1 -m-1 custom-scrollbar">
                            {sortedSymbols.map((symbol) => {
                                const data = marketData[symbol];
                                const history = historicalMarketData[symbol] || [];
                                const formattedVolume = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact' }).format(data.volume);
                                const isUp = history.length > 1 && history[history.length - 1] >= history[0];
                                const hasAlert = priceAlerts[symbol]?.high || priceAlerts[symbol]?.low;
                                const indicator = getThresholdIndicator(data.change);

                                return (
                                    <div 
                                        key={symbol} 
                                        className={`relative grid grid-cols-12 items-center font-mono text-[10px] p-1 rounded-sm transition-colors cursor-crosshair hover:bg-white/5 ${
                                            priceChanges[symbol] === 'up' ? 'flash-green' : priceChanges[symbol] === 'down' ? 'flash-red' : ''
                                        }`}
                                        onMouseEnter={() => setHoveredSymbol(symbol)}
                                        onMouseLeave={() => setHoveredSymbol(null)}
                                    >
                                        {/* Symbol with Glowing Real-time Threshold Beacon Indicator */}
                                        <div className="col-span-3 flex items-center gap-1.5 min-w-0">
                                            <span 
                                                className={`w-2 h-2 rounded-full flex-shrink-0 transition-all ${indicator.dotClass} ${indicator.glowClass}`} 
                                                title={`${symbol}: ${indicator.label}`}
                                            />
                                            <span className="text-slate-200 truncate font-bold text-[9.5px]">{symbol}</span>
                                        </div>

                                        {/* Sparkline Trend */}
                                        <div className="col-span-2 h-4 flex items-center justify-center opacity-85">
                                            <Sparkline data={history} width={38} height={15} color={isUp ? '#4ade80' : '#f87171'} strokeWidth={1} />
                                        </div>

                                        {/* Current Price */}
                                        <div className="col-span-3 text-right font-medium text-[9.5px]">
                                            <span className={getPriceColorClass(symbol)}>${data.price.toFixed(2)}</span>
                                        </div>

                                        {/* 24h Percentage Change with Glowing Threshold Pill */}
                                        <div className="col-span-3 flex justify-end">
                                            <div 
                                                className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[8px] font-mono border transition-all ${indicator.badgeBg} ${indicator.badgeBorder} ${indicator.textClass} ${indicator.badgeGlow}`}
                                                title={`${symbol} 24h: ${data.change >= 0 ? '+' : ''}${data.change.toFixed(2)}% (${indicator.label})`}
                                            >
                                                <span className="text-[7px]">{indicator.icon}</span>
                                                <span>{data.change >= 0 ? '+' : ''}{data.change.toFixed(2)}%</span>
                                            </div>
                                        </div>

                                        {/* Price Alert Bell */}
                                        <button 
                                            className={`col-span-1 flex items-center justify-center transition-colors ${hasAlert ? 'text-amber-400' : 'text-slate-700 hover:text-slate-400'}`}
                                            onClick={(e) => openAlertModal(symbol, e)}
                                            title={`Set Price Alert for ${symbol} (Vol: ${formattedVolume})`}
                                        >
                                            <BellIcon className="w-3 h-3" />
                                        </button>

                                        {hoveredSymbol === symbol && history.length > 1 && <PriceTrendTooltip history={history} />}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Real-time Threshold Indicators Legend */}
                        <div className="flex items-center justify-between px-1.5 pt-1 mt-1 border-t border-slate-800/60 text-[7px] font-mono text-slate-500">
                            <div className="flex items-center gap-2">
                                <span className="flex items-center gap-1" title="Surge Bullish (>= +2.5%)">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 glow-beacon-green-high animate-pulse" />
                                    <span className="text-emerald-400/90">&ge;+2.5%</span>
                                </span>
                                <span className="flex items-center gap-1" title="Bullish Gain (> 0%)">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 glow-beacon-green-mid" />
                                    <span className="text-emerald-400/70">&gt;0%</span>
                                </span>
                                <span className="flex items-center gap-1" title="Bearish Retrace (< 0%)">
                                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 glow-beacon-red-mid" />
                                    <span className="text-rose-400/70">&lt;0%</span>
                                </span>
                                <span className="flex items-center gap-1" title="Hyper Bearish (<= -2.5%)">
                                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 glow-beacon-red-high animate-pulse" />
                                    <span className="text-rose-400/90">&le;-2.5%</span>
                                </span>
                            </div>
                            <span className="text-[6.5px] uppercase tracking-wider text-slate-600">THRESHOLD BEACONS</span>
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
                </div>
            )}

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


