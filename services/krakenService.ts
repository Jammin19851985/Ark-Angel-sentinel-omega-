
/**
 * ARCHANGEL OMEGA — KRAKEN EXCHANGE ADAPTER (v∞.1)
 * High-performance public API polling for cross-exchange arbitrage.
 */

export interface KrakenTicker {
    symbol: string;
    ask: number;
    bid: number;
    last: number;
    volume: number;
}

const SYMBOL_MAP: Record<string, string> = {
    'BTC': 'XXBTZUSD',
    'ETH': 'XETHZUSD',
    'SOL': 'SOLUSD',
    'ADA': 'ADAUSD'
};

const REVERSE_MAP: Record<string, string> = Object.fromEntries(
    Object.entries(SYMBOL_MAP).map(([k, v]) => [v, k])
);

export const krakenService = {
    /**
     * Fetches public ticker data for key assets.
     */
    async getTickers(): Promise<KrakenTicker[]> {
        try {
            const pairs = Object.values(SYMBOL_MAP).join(',');
            const response = await fetch(`https://api.kraken.com/0/public/Ticker?pair=${pairs}`);
            const data = await response.json();

            if (data.error && data.error.length > 0) {
                throw new Error(`Kraken API Error: ${data.error.join(', ')}`);
            }

            const results: KrakenTicker[] = [];
            Object.keys(data.result).forEach(pair => {
                const ticker = data.result[pair];
                const internalSymbol = REVERSE_MAP[pair] || pair;
                results.push({
                    symbol: internalSymbol,
                    ask: parseFloat(ticker.a[0]),
                    bid: parseFloat(ticker.b[0]),
                    last: parseFloat(ticker.c[0]),
                    volume: parseFloat(ticker.v[1]),
                });
            });

            return results;
        } catch (error) {
            console.error("KRAKEN_FETCH_FAILURE:", error);
            throw error;
        }
    }
};
