/**
 * ARCHANGEL OMEGA — OMNI-BROKER CLUSTER (v210.5)
 * Secure real-world exchange connectivity via CCXT.
 * Enhanced with robust dynamic loading and error resilience.
 */

export class OmniBroker {
    private static instance: OmniBroker;
    private exchanges: Record<string, any> = {};
    private marketsLoaded: Record<string, boolean> = {};
    private initializationPromise: Promise<void> | null = null;
    private ccxt: any = null;
    public clusterStatus: 'OFFLINE' | 'SYNCING' | 'OPERATIONAL' = 'OFFLINE';

    private constructor() {
        this.initializationPromise = this.initializeExchanges();
    }

    public static getInstance(): OmniBroker {
        if (!OmniBroker.instance) {
            OmniBroker.instance = new OmniBroker();
        }
        return OmniBroker.instance;
    }

    private async initializeExchanges() {
        this.clusterStatus = 'SYNCING';
        try {
            console.log("[OmniBroker] Initializing Sovereign Bridge Cluster...");
            
            const importWithTimeout = async (moduleName: string, timeoutMs: number) => {
                const timeout = new Promise((_, reject) => 
                    setTimeout(() => reject(new Error(`Import timeout for ${moduleName}`)), timeoutMs)
                );
                const moduleImport = import(moduleName);
                return Promise.race([moduleImport, timeout]);
            };

            // CCXT is massive, using a longer timeout for CDN resolution
            const ccxtModule: any = await importWithTimeout('ccxt', 45000).catch(err => {
                console.warn("[OmniBroker] CCXT failed via CDN. Real-world bridge connectivity unavailable.", err);
                return null;
            });

            if (!ccxtModule) {
                this.clusterStatus = 'OFFLINE';
                return;
            }
            
            this.ccxt = ccxtModule.default || ccxtModule;

            // Check for API credentials in environment
            const krakenKey = process.env.KRAKEN_API_KEY;
            const krakenSecret = process.env.KRAKEN_SECRET;
            
            if (krakenKey && krakenSecret && this.ccxt.kraken) {
                this.exchanges['kraken'] = new this.ccxt.kraken({
                    apiKey: krakenKey,
                    secret: krakenSecret,
                    enableRateLimit: true,
                });
            }

            const cbKey = process.env.COINBASE_API_KEY;
            const cbSecret = process.env.COINBASE_SECRET;
            
            if (cbKey && cbSecret && this.ccxt.coinbase) {
                this.exchanges['coinbase'] = new this.ccxt.coinbase({
                    apiKey: cbKey,
                    secret: cbSecret,
                    enableRateLimit: true,
                });
            }

            this.clusterStatus = Object.keys(this.exchanges).length > 0 ? 'OPERATIONAL' : 'OFFLINE';
            console.log(`[OmniBroker] Connectivity Cluster: ${this.clusterStatus}. Active Bridges: ${Object.keys(this.exchanges).join(', ') || 'NONE'}`);
        } catch (error) {
            this.clusterStatus = 'OFFLINE';
            console.error("[OmniBroker] CRITICAL: Cluster Initialization Error:", error);
        }
    }

    private async ensureReady(exchangeId: string): Promise<any> {
        if (this.initializationPromise) await this.initializationPromise;
        const ex = this.exchanges[exchangeId];
        if (!ex) throw new Error(`[OmniBroker] AUTH_FAULT: ${exchangeId.toUpperCase()} not configured.`);
        if (!this.marketsLoaded[exchangeId]) {
            try {
                await ex.loadMarkets();
                this.marketsLoaded[exchangeId] = true;
            } catch (err: any) {
                throw new Error(`[OmniBroker] TOPOLOGY_FETCH_FAILED [${exchangeId}]: ${err.message}`);
            }
        }
        return ex;
    }

    private normalizeSymbol(symbol: string): string {
        const clean = symbol.toUpperCase();
        if (clean.includes('/')) return clean;
        return `${clean}/USD`;
    }

    async createOrder(exchangeId: 'kraken' | 'coinbase', symbol: string, side: 'buy' | 'sell', amount: number, price?: number): Promise<any> {
        try {
            const ex = await this.ensureReady(exchangeId);
            const targetSymbol = this.normalizeSymbol(symbol);
            const type = price ? 'limit' : 'market';
            const order = await ex.createOrder(targetSymbol, type, side, amount, price);
            console.log(`[OmniBroker] REAL_ORDER_FILLED: ${targetSymbol} ${side} ${amount} on ${exchangeId}`);
            return order;
        } catch (error: any) {
            console.error(`[OmniBroker] EXECUTION_ABORTED [${exchangeId}]:`, error.message);
            throw error;
        }
    }

    async fetchBalances(exchangeId?: 'kraken' | 'coinbase'): Promise<Record<string, any>> {
        try {
            if (exchangeId) {
                const ex = await this.ensureReady(exchangeId);
                return { [exchangeId]: await ex.fetchBalance() };
            }
            const results: Record<string, any> = {};
            for (const id of Object.keys(this.exchanges)) {
                try {
                    const ex = await this.ensureReady(id);
                    results[id] = await ex.fetchBalance();
                } catch (e: any) {
                    results[id] = { status: 'OFFLINE', error: e.message };
                }
            }
            return results;
        } catch (error: any) {
            console.error("[OmniBroker] Audit Failure:", error.message);
            throw error;
        }
    }

    async fetchTicker(exchangeId: 'kraken' | 'coinbase', symbol: string): Promise<any> {
        const ex = await this.ensureReady(exchangeId);
        const targetSymbol = this.normalizeSymbol(symbol);
        return await ex.fetchTicker(targetSymbol);
    }
}

export const omniBroker = OmniBroker.getInstance();