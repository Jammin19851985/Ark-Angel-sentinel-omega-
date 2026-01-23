import React, { useState, useEffect, useRef, useMemo } from 'react';
import { MarketData } from '../types';
import PriceTrendTooltip from './charts/PriceTrendTooltip';
import { Sparkline } from './charts/Sparkline';
import { SearchIcon } from './icons/SearchIcon';
import { useAppContext } from '../contexts/AppContext';
import { LivePaperBadge } from './LivePaperBadge';
import { ActivityIcon } from './icons/ActivityIcon';
import Loader from './Loader';

// Helper hook for previous value
function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>(undefined);
  useEffect(() => {
    ref.current = value;
  }, [value]); 
  return ref.current;
}

const MARKET_NEWS_HEADLINES = [
    { headline: "Global markets react to new AI advancements, tech stocks surge.", source: "Financial Times" },
    { headline: "Inflation concerns ease as central banks signal cautious approach.", source: "Reuters" },
    { headline: "Energy sector volatility rises amidst geopolitical tensions.", source: "Bloomberg" },
    { headline: "Cryptocurrency adoption grows, institutional interest picks up.", source: "CoinDesk" },
    { headline: "Supply chain disruptions continue, impacting manufacturing outlook.", source: "Wall Street Journal" },
    { headline: "Tech giants invest heavily in quantum computing research.", source: "Nature" },
    { headline: "New regulations proposed for AI ethics in financial services.", source: "Government Gazette" },
    { headline: "Emerging markets show resilience despite global headwinds.", source: "Economist" },
];

interface MarketWatchProps {
    id: string;
}

const CRYPTO_SYMBOLS = ['BTC', 'ETH', 'SOL', 'ADA'];

const MarketWatch: React.FC<MarketWatchProps> = ({ id }) => {
    const { marketData, historicalMarketData, marketFilter, setMarketFilter, fetchSymbolData } = useAppContext();
    const [priceChanges, setPriceChanges] = useState<Record<string, 'up' | 'down'>>({});
    const prevMarketData = usePrevious(marketData);
    const [hoveredSymbol, setHoveredSymbol] = useState<string | null>(null);
    const [currentNewsIndex, setCurrentNewsIndex] = useState(0);
    const [activeTab, setActiveTab] = useState<'ALL' | 'CRYPTO' | 'STOCKS'>('ALL');
    const [isFetching, setIsFetching] = useState(false);

    useEffect(() => {
        if (!prevMarketData) return;

        const changes: Record<string, 'up' | 'down'> = {};
        let hasChanges = false;

        Object.keys(marketData).forEach(symbol => {
            const currentPrice = marketData[symbol]?.price;
            const previousPrice = prevMarketData[symbol]?.price;

            if (currentPrice !== undefined && previousPrice !== undefined && currentPrice !== 0 && previousPrice !== 0) {
                if (currentPrice > previousPrice) {
                    changes[symbol] = 'up';
                    hasChanges = true;
                } else if (currentPrice < previousPrice) {
                    changes[symbol] = 'down';
                    hasChanges = true;
                }
            }
        });

        if (hasChanges) {
            setPriceChanges(changes);
            const timer = setTimeout(() => {
                setPriceChanges({});
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, [marketData, prevMarketData]);

    useEffect(() => {
        const newsInterval = setInterval(() => {
            setCurrentNewsIndex(prevIndex => (prevIndex + 1) % MARKET_NEWS_HEADLINES.length);
        }, 7000);

        return () => clearInterval(newsInterval);
    }, []);

    const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && marketFilter.trim()) {
            setIsFetching(true);
            await fetchSymbolData(marketFilter.trim());
            setIsFetching(false);
        }
    };

    const getRowFlashClass = (symbol: string) => {
        if (priceChanges[symbol] === 'up') return 'flash-green';
        if (priceChanges[symbol] === 'down') return 'flash-red';
        return '';
    };

    const getPriceColorClass = (symbol: string) => {
        const changeStatus = priceChanges[symbol];
        if (changeStatus === 'up') return 'text-green-300';
        if (changeStatus === 'down') return 'text-red-300';
        const data = marketData[symbol];
        return (data?.change ?? 0) >= 0 ? 'text-green-400' : 'text-red-400';
    };

    const filteredSymbols = Object.keys(marketData).filter(symbol => {
        const matchesSearch = symbol.toLowerCase().includes(marketFilter.toLowerCase());
        const isCrypto = CRYPTO_SYMBOLS.includes(symbol);
        const matchesTab = activeTab === 'ALL' || (activeTab === 'CRYPTO' && isCrypto) || (activeTab === 'STOCKS' && !isCrypto);
        return matchesSearch && matchesTab;
    });
    
    const currentNewsItem = MARKET_NEWS_HEADLINES[currentNewsIndex];

    // Calculate Market Velocity (Average absolute change)
    const marketVelocity = useMemo(() => {
        const changes = Object.values(marketData).map((d: any) => Math.abs(d.change));
        const avg = changes.reduce((a: number, b: number) => a + b, 0) / (changes.length || 1);
        return avg;
    }, [marketData]);

    const TabButton: React.FC<{ tab: 'ALL' | 'CRYPTO' | 'STOCKS', label: string }> = ({ tab, label }) => (
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

    return (
        <div id={id} className="tech-panel p-3 flex flex-col h-full bg-black/60">
            <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                    <h2 className="text-xs font-bold text-amber-400 font-mono uppercase tracking-widest">// MARKET WATCH</h2>
                    <div className="flex items-center space-x-1 text-[8px] font-mono text-slate-500 bg-slate-900/50 px-1.5 py-0.5 rounded border border-slate-800">
                        <ActivityIcon className={`w-2.5 h-2.5 ${marketVelocity > 1.0 ? 'text-red-500 animate-pulse' : 'text-slate-400'}`} />
                        <span>VEL: {marketVelocity.toFixed(2)}</span>
                    </div>
                </div>
                <LivePaperBadge />
            </div>
            
            <div className="flex gap-1 mb-2">
                <TabButton tab="ALL" label="All" />
                <TabButton tab="CRYPTO" label="Crypto" />
                <TabButton tab="STOCKS" label="Equities" />
            </div>

            <div className="relative mb-3 group">
                <input 
                    type="text"
                    value={marketFilter}
                    onChange={(e) => setMarketFilter(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="SCAN_TICKER (ENTER TO FETCH)..."
                    disabled={isFetching}
                    className="w-full bg-black/80 border border-slate-700 rounded-sm pl-8 pr-8 py-1 text-[10px] font-mono text-slate-200 placeholder-slate-600 focus:border-amber-500 transition outline-none disabled:opacity-50"
                />
                <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-600 pointer-events-none" />
                {isFetching && (
                    <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
                        <Loader />
                    </div>
                )}
            </div>
            
            <div className="flex-1 flex flex-col min-h-0">
                <div className="grid grid-cols-12 font-mono text-[9px] text-slate-600 px-2 pb-1 border-b border-slate-800 uppercase tracking-wider">
                    <span className="col-span-2">Sym</span>
                    <span className="col-span-2 text-center">Trend</span>
                    <span className="col-span-2 text-right">Price</span>
                    <span className="col-span-2 text-right">%Chg</span>
                    <span className="col-span-2 text-right">Abs</span>
                    <span className="col-span-2 text-right">Vol</span>
                </div>
                <div className="space-y-0.5 overflow-y-auto flex-1 p-1 -m-1 custom-scrollbar">
                    {filteredSymbols.map((symbol) => {
                        const data = marketData[symbol];
                        if (!data) return null;
                        const rowFlashClass = getRowFlashClass(symbol);
                        const history = historicalMarketData[symbol] || [];
                        const formattedVolume = data.volume > 0 
                            ? new Intl.NumberFormat('en-US', {
                                style: 'currency',
                                currency: 'USD',
                                notation: 'compact',
                                maximumFractionDigits: 1
                              }).format(data.volume) 
                            : '-';
                        
                        const isUp = history.length > 1 && history[history.length - 1] >= history[0];
                        const sparkColor = isUp ? '#4ade80' : '#f87171';

                        return (
                            <div 
                                key={symbol} 
                                className={`relative grid grid-cols-12 items-center font-mono text-[10px] p-1 rounded-sm transition-colors cursor-crosshair hover:bg-white/5 ${rowFlashClass}`}
                                onMouseEnter={() => setHoveredSymbol(symbol)}
                                onMouseLeave={() => setHoveredSymbol(null)}
                            >
                                <span className="text-slate-300 col-span-2 truncate font-bold">{symbol}</span>
                                
                                {/* Sparkline Column */}
                                <div className="col-span-2 h-4 flex items-center justify-center opacity-80">
                                    <Sparkline data={history} width={40} height={16} color={sparkColor} strokeWidth={1} />
                                </div>

                                <span className={`font-medium text-right col-span-2 transition-colors duration-500 ${getPriceColorClass(symbol)}`}>
                                    {data.price.toFixed(data.price > 10 ? 2 : 4)}
                                </span>
                                <span className={`text-right col-span-2 ${data.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                    {data.change >= 0 ? '+' : ''}{data.change.toFixed(2)}%
                                </span>
                                <span className={`text-right col-span-2 ${data.changeAbsolute >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                    {data.changeAbsolute >= 0 ? '+' : ''}{data.changeAbsolute.toFixed(data.price > 10 ? 2 : 4)}
                                </span>
                                <span className="text-slate-500 text-right col-span-2">
                                    {formattedVolume}
                                </span>
                                
                                {hoveredSymbol === symbol && history && history.length > 1 && (
                                    <PriceTrendTooltip history={history} />
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="mt-3 pt-2 border-t border-slate-800">
                <h3 className="text-[9px] font-bold text-slate-500 mb-1 font-mono uppercase tracking-widest">// INTEL_FEED</h3>
                {currentNewsItem && (
                    <div key={currentNewsIndex} className="animate-fade-in-fast min-h-[30px]">
                        <p className="text-[10px] text-slate-400 leading-tight truncate">{currentNewsItem.headline}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default React.memo(MarketWatch);