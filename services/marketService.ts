
import { MarketData } from '../types';

const COINBASE_API_BASE = 'https://api.coinbase.com/v2';

// Mapping internal symbols to Coinbase Product IDs
const SYMBOL_MAP: Record<string, string> = {
    'BTC': 'BTC-USD',
    'ETH': 'ETH-USD',
    'SOL': 'SOL-USD',
    'ADA': 'ADA-USD',
};

// Fallback for stocks/equities since we can't easily get free real-time stock data 
// without a paid API key like Polygon/Alpaca on the frontend directly without exposing keys.
// For "Real World" configuration, we assume the backend (Python) handles equities 
// and exposes them via the /status or /market endpoint, or we use a public delay feed.
// Here we will focus on the Crypto real-time feed which is accessible.

export const marketService = {
    /**
     * Fetches real-time spot price for a single crypto asset.
     */
    async getPrice(symbol: string): Promise<number> {
        const pair = SYMBOL_MAP[symbol];
        if (!pair) {
            // Non-crypto assets would typically be fetched from the backend Python bridge
            // For now, return 0 to indicate "Feed Unavailable" rather than fake data
            return 0; 
        }

        try {
            const response = await fetch(`${COINBASE_API_BASE}/prices/${pair}/spot`);
            const data = await response.json();
            return parseFloat(data.data.amount);
        } catch (error) {
            console.error(`MARKET_FEED_ERROR [${symbol}]:`, error);
            throw error;
        }
    },

    /**
     * Fetches a batch of real-time data.
     */
    async getBatchPrices(symbols: string[]): Promise<Partial<MarketData>> {
        const updates: Partial<MarketData> = {};
        
        // Execute in parallel
        await Promise.all(symbols.map(async (sym) => {
            try {
                const price = await this.getPrice(sym);
                if (price > 0) {
                    // Note: Public spot API doesn't give 24h change/vol directly in one call.
                    // We would typically calculate this against our own store or fetch /stats product endpoint.
                    // Fetching 24hr stats:
                    const stats = await this.get24hStats(sym);
                    updates[sym] = {
                        price,
                        change: stats.changePercent,
                        changeAbsolute: stats.changeAbs,
                        volume: stats.volume
                    };
                }
            } catch (e) {
                // Ignore failures for specific symbols to keep the stream alive
            }
        }));

        return updates;
    },

    async get24hStats(symbol: string): Promise<{ changePercent: number, changeAbs: number, volume: number }> {
        const pair = SYMBOL_MAP[symbol];
        if (!pair) return { changePercent: 0, changeAbs: 0, volume: 0 };

        try {
            // Coinbase Pro / Exchange API for stats (public)
            const response = await fetch(`https://api.exchange.coinbase.com/products/${pair}/stats`);
            const data = await response.json();
            
            const open = parseFloat(data.open);
            const last = parseFloat(data.last);
            const volume = parseFloat(data.volume);
            
            const changeAbs = last - open;
            const changePercent = (changeAbs / open) * 100;

            return { changePercent, changeAbs, volume };
        } catch (e) {
            return { changePercent: 0, changeAbs: 0, volume: 0 };
        }
    },

    /**
     * Fetches historical candles for charting from Coinbase.
     */
    async getHistory(symbol: string, granularity: number = 3600): Promise<number[]> {
        const pair = SYMBOL_MAP[symbol];
        if (!pair) return [];

        try {
            const response = await fetch(`https://api.exchange.coinbase.com/products/${pair}/candles?granularity=${granularity}`);
            const data = await response.json();
            // Data is [time, low, high, open, close, volume]
            // We want closing prices, reversed to be chronological
            return data.map((d: any) => d[4]).reverse();
        } catch (e) {
            console.error("HISTORY_FETCH_ERROR", e);
            return [];
        }
    }
};
