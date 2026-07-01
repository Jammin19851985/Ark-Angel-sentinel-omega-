// Simple Technical Indicators
function calculateSMA(data, period) {
    if (data.length < period) return null;
    const slice = data.slice(-period);
    const sum = slice.reduce((acc, val) => acc + val.close, 0);
    return sum / period;
}

function calculateRSI(data, period) {
    if (data.length < period + 1) return null;
    let gains = 0;
    let losses = 0;

    for (let i = data.length - period; i < data.length; i++) {
        const difference = data[i].close - data[i - 1].close;
        if (difference >= 0) gains += difference;
        else losses -= difference;
    }

    const avgGain = gains / period;
    const avgLoss = losses / period;

    if (avgLoss === 0) return 100;
    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
}

class SwarmManager {
    constructor() {
        this.models = [
            { name: "MomentumAgent", weight: 0.4 },
            { name: "MeanReversionAgent", weight: 0.3 },
            { name: "VolumeBreakoutAgent", weight: 0.3 }
        ];
    }

    // Process candlestick data (OHLCV)
    async getCommitteeStrikeDecision(telemetry, ohlcv) {
        if (!ohlcv || ohlcv.length < 20) {
            return { strike: false, confidence: 0, reason: "Insufficient OHLCV data" };
        }

        const sma20 = calculateSMA(ohlcv, 20);
        const rsi14 = calculateRSI(ohlcv, 14);
        const lastCandle = ohlcv[ohlcv.length - 1];
        const prevCandle = ohlcv[ohlcv.length - 2];

        const currentPrice = telemetry.price;

        let totalConfidence = 0;
        let buyVotes = 0;

        // 1. Momentum Agent (Trend following)
        if (currentPrice > sma20 && rsi14 > 50 && rsi14 < 70) {
            buyVotes += this.models[0].weight;
        }

        // 2. Mean Reversion Agent (Oversold bounce)
        if (rsi14 < 30) {
            buyVotes += this.models[1].weight;
        }

        // 3. Volume Breakout
        if (lastCandle.volume > prevCandle.volume * 1.5 && currentPrice > sma20) {
            buyVotes += this.models[2].weight;
        }

        // Final tally
        const confidence = buyVotes;
        const strike = confidence >= 0.70; // Requires at least 70% confidence

        return {
            strike,
            confidence,
            metrics: { sma20, rsi14 }
        };
    }
}

module.exports = { SwarmManager };
