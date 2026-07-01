// ARK ANGEL: AUTONOMOUS EXECUTION ENGINE v2.0
const ccxt = require('ccxt');
const { SwarmManager } = require('./app/api/brain/swarm_manager.cjs');
const { RiskManager } = require('./lib/RiskManager.cjs');
const logger = require('./lib/Logger.cjs');

class AutonomousTradingEngine {
    constructor() {
        // System Configuration
        this.config = {
            paperTrading: true, // IMPORTANT: True for simulated trades
            symbols: ['BTC/USDT', 'ETH/USDT'],
            timeframe: '1m',
            cycleIntervalMs: 15000, // 15 seconds
            maxRetries: 3
        };

        this.exchange = new ccxt.kraken({
            apiKey: process.env.KRAKEN_API_KEY,
            secret: process.env.KRAKEN_SECRET,
            enableRateLimit: true,
        });

        this.brain = new SwarmManager();
        this.riskManager = new RiskManager({ maxDrawdown: 0.1, maxPositionSize: 0.05 });
        
        // Internal state
        this.portfolio = {}; // Track paper positions
        
        logger.info('SYSTEM', 'Autonomous Trading Engine initialized.');
        logger.info('SYSTEM', `Paper Trading mode: ${this.config.paperTrading ? 'ENABLED' : 'DISABLED'}`);
    }

    // Exponential backoff for API calls
    async fetchWithRetry(fn, retries = this.config.maxRetries, delay = 1000) {
        try {
            return await fn();
        } catch (error) {
            if (retries === 0) throw error;
            logger.warn('NETWORK', `API call failed, retrying in ${delay}ms... (${retries} retries left)`);
            await new Promise(r => setTimeout(r, delay));
            return this.fetchWithRetry(fn, retries - 1, delay * 2);
        }
    }

    async fetchMarketIntel(symbol) {
        try {
            const ticker = await this.fetchWithRetry(() => this.exchange.fetchTicker(symbol));
            const ohlcvRaw = await this.fetchWithRetry(() => this.exchange.fetchOHLCV(symbol, this.config.timeframe, undefined, 50));
            
            // Format OHLCV
            const ohlcv = ohlcvRaw.map(candle => ({
                timestamp: candle[0],
                open: candle[1],
                high: candle[2],
                low: candle[3],
                close: candle[4],
                volume: candle[5]
            }));

            return {
                telemetry: {
                    symbol: ticker.symbol,
                    price: ticker.last,
                    volume: ticker.baseVolume,
                    timestamp: ticker.timestamp
                },
                ohlcv
            };
        } catch (error) {
            logger.error('DATA', `Intel feed failure for ${symbol}: ${error.message}`);
            return null;
        }
    }

    async executeTrade(symbol, decision, currentPrice) {
        if (!decision.strike) {
            logger.info('EXECUTION', `[STASIS] ${symbol} - Confidence too low (${decision.confidence.toFixed(2)}). Holding.`);
            return;
        }

        // Calculate position size securely
        const tradeAmount = this.riskManager.calculatePositionSize(currentPrice, decision.confidence);
        
        if (tradeAmount <= 0) {
            logger.warn('EXECUTION', `[BLOCKED] Position size calculated as 0 for ${symbol}. Check risk parameters.`);
            return;
        }

        if (this.config.paperTrading) {
            logger.trade(`[PAPER TRADE] BUY ${tradeAmount.toFixed(6)} ${symbol} @ $${currentPrice}`);
            // Mock holding
            this.portfolio[symbol] = (this.portfolio[symbol] || 0) + tradeAmount;
        } else {
            if (!process.env.KRAKEN_API_KEY || !process.env.KRAKEN_SECRET) {
                logger.warn('EXECUTION', `[BLOCKED] Kraken API keys missing. Please configure KRAKEN_API_KEY and KRAKEN_SECRET in the deployment settings to execute real trades.`);
                return;
            }
            try {
                logger.trade(`[LIVE TRADE] Executing BUY ${tradeAmount.toFixed(6)} ${symbol} @ MARKET`);
                // LIVE EXECUTION (UNCOMMENT IN PROD)
                const order = await this.exchange.createMarketBuyOrder(symbol, tradeAmount);
                logger.trade(`Order filled: ${order.id}`);
            } catch (err) {
                if (err.message.includes('Invalid key')) {
                    logger.error('EXECUTION', `Order failed for ${symbol}: Invalid Kraken API key. Please double-check your KRAKEN_API_KEY and KRAKEN_SECRET in settings.`);
                } else {
                    logger.error('EXECUTION', `Order failed for ${symbol}: ${err.message}`);
                }
            }
        }
    }

    async runCycle() {
        const riskCheck = this.riskManager.isTradingAllowed();
        if (!riskCheck.allowed) {
            logger.error('RISK', `Trading halted: ${riskCheck.reason}`);
            return;
        }

        logger.info('SYSTEM', '--- INITIATING SOVEREIGN NODE SCAN ---');
        
        for (const symbol of this.config.symbols) {
            const data = await this.fetchMarketIntel(symbol);
            if (!data) continue;

            const { telemetry, ohlcv } = data;
            
            // Generate indicators and committee decision
            const decision = await this.brain.getCommitteeStrikeDecision(telemetry, ohlcv);
            
            logger.info('SWARM', `[${symbol}] $${telemetry.price} | RSI: ${(decision.metrics?.rsi14 || 0).toFixed(1)} | CONF: ${decision.confidence.toFixed(2)}`);

            await this.executeTrade(symbol, decision, telemetry.price);
        }
    }

    start() {
        logger.info('SYSTEM', 'Engine loop started.');
        this.runCycle();
        setInterval(() => this.runCycle(), this.config.cycleIntervalMs);
    }
}

// Instantiate and start
const system = new AutonomousTradingEngine();
system.start();
