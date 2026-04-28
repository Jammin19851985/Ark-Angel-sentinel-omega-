import React, { useState, useEffect, useRef } from 'react';
import { MarketData } from '../types';
import PriceTrendTooltip from './charts/PriceTrendTooltip';
import { SearchIcon } from './icons/SearchIcon';
import { useAppContext } from '../contexts/AppContext';

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

const MarketWatch: React.FC<MarketWatchProps> = ({ id }) => {
    const { marketData, historicalMarketData, marketFilter, setMarketFilter } = useAppContext();
    const [priceChanges, setPriceChanges] = useState<Record<string, 'up' | 'down'>>({});
    const prevMarketData = usePrevious(marketData);
    const [hoveredSymbol, setHoveredSymbol] = useState<string | null>(null);
    const [currentNewsIndex, setCurrentNewsIndex] = useState(0);

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

    const getRowFlashClass = (symbol: string) => {
        if (priceChanges[symbol] === 'up') return 'flash-green';
        if (priceChanges[symbol] === 'down') return 'flash-red';
        return '';
    };

    const getPriceColorClass = (symbol: string) => {
        const changeStatus = priceChanges[symbol];
        if (changeStatus === 'up') return 'text-green-300';
        if (changeStatus === 'down') return 'text-red-300';
        return marketData[symbol]?.change >= 0 ? 'text-green-400' : 'text-red-400';
    };

    const filteredSymbols = Object.keys(marketData).filter(symbol => 
        symbol.toLowerCase().includes(marketFilter.toLowerCase())
    );
    
    const currentNewsItem = MARKET_NEWS_HEADLINES[currentNewsIndex];

    return (
        <div id={id} className="bg-black/30 backdrop-blur-sm border border-slate-800 rounded-lg p-4 shadow-lg glow-border flex flex-col h-full">
            <h2 className="text-sm font-bold text-amber-400 mb-3 font-mono">// MARKET WATCH</h2>
            <div className="relative mb-3">
                <input 
                    type="text"
                    value={marketFilter}
                    onChange={(e) => setMarketFilter(e.target.value)}
                    placeholder="Filter symbols..."
                    className="w-full bg-black/50 backdrop-blur-sm border border-slate-700 rounded-md pl-8 pr-4 py-1.5 text-sm text-slate-200 placeholder-slate-500 focus:ring-1 focus:ring-amber-500 focus:border-amber-500 transition"
                />
                <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
            </div>
            
            <div className="flex-1 flex flex-col min-h-0">
                <div className="grid grid-cols-12 font-mono text-xs text-slate-500 px-2 pb-1 border-b border-slate-800">
                    <span className="col-span-3">SYMBOL</span>
                    <span className="col-span-2 text-right">PRICE</span>
                    <span className="col-span-2 text-right">%CHANGE</span>
                    <span className="col-span-2 text-right">ABS</span>
                    <span className="col-span-3 text-right">VOLUME(24H)</span>
                </div>
                <div className="space-y-0.5 overflow-y-auto flex-1 p-1 -m-1">
                    {filteredSymbols.map((symbol) => {
                        const data = marketData[symbol];
                        if (!data) return null;
                        const rowFlashClass = getRowFlashClass(symbol);
                        const history = historicalMarketData[symbol];
                        const formattedVolume = data.volume > 0 
                            ? new Intl.NumberFormat('en-US', {
                                style: 'currency',
                                currency: 'USD',
                                notation: 'compact',
                                maximumFractionDigits: 2
                              }).format(data.volume) 
                            : '-';

                        return (
                            <div 
                                key={symbol} 
                                className={`relative grid grid-cols-12 items-center font-mono text-sm p-1.5 rounded-md transition-colors ${rowFlashClass}`}
                                onMouseEnter={() => setHoveredSymbol(symbol)}
                                onMouseLeave={() => setHoveredSymbol(null)}
                            >
                                <span className="text-slate-300 col-span-3 truncate">{symbol}</span>
                                <span className={`font-medium text-right col-span-2 transition-colors duration-500 ${getPriceColorClass(symbol)}`}>
                                    {data.price.toFixed(data.price > 10 ? 2 : 4)}
                                </span>
                                <span className={`text-xs text-right col-span-2 ${data.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                    {data.change >= 0 ? '+' : ''}{data.change.toFixed(2)}%
                                </span>
                                <span className={`text-xs text-right col-span-2 ${data.changeAbsolute >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                    {data.changeAbsolute >= 0 ? '+' : ''}{data.changeAbsolute.toFixed(data.price > 10 ? 2 : 4)}
                                </span>
                                <span className="text-xs text-slate-400 text-right col-span-3">
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

            <div className="mt-4 pt-3 border-t border-slate-800">
                <h3 className="text-xs font-bold text-amber-400 mb-2 font-mono">// MARKET INTEL</h3>
                {currentNewsItem && (
                    <div key={currentNewsIndex} className="animate-fade-in-fast h-10">
                        <p className="text-xs text-slate-300 leading-snug">{currentNewsItem.headline}</p>
                        <p className="text-[10px] text-slate-500 mt-1">{currentNewsItem.source}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default React.memo(MarketWatch);