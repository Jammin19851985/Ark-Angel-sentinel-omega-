import { Trade, AnalyticsKPIs } from '../types';

// Mock data and calculation helpers
const MOCK_TRADE_HISTORY: Omit<Trade, 'pnl' | 'id' | 'timestamp'>[] = [
    { symbol: 'SOL', action: 'BUY', quantity: 50, price: 145.00 },
    { symbol: 'ETH', action: 'SELL', quantity: 10, price: 3550.00 },
    { symbol: 'SOL', action: 'SELL', quantity: 50, price: 152.00 },
    { symbol: 'BTC', action: 'BUY', quantity: 0.1, price: 66000.00 },
    { symbol: 'ADA', action: 'BUY', quantity: 1000, price: 0.45 },
    { symbol: 'ETH', action: 'BUY', quantity: 5, price: 3400.00 },
    { symbol: 'BTC', action: 'SELL', quantity: 0.05, price: 68000.00 },
];

export const generateInitialTrades = (): Trade[] => {
    return MOCK_TRADE_HISTORY.map((trade, i) => {
        // Find the last buy for this symbol to calculate PnL
        const lastBuy = MOCK_TRADE_HISTORY.slice(0, i).reverse().find(t => t.symbol === trade.symbol && t.action === 'BUY');
        const costBasis = lastBuy ? lastBuy.price : trade.price * 0.98; // Assume 2% gain if no prior buy found
        
        const pnl = trade.action === 'SELL' 
            ? (trade.price - costBasis) * trade.quantity
            : 0; // PnL is realized on sell

        return {
            ...trade,
            id: `trade-${i}-${Date.now()}`,
            timestamp: new Date(Date.now() - (MOCK_TRADE_HISTORY.length - i) * 3600000).toLocaleTimeString(),
            pnl
        }
    }).reverse();
};

export const calculateKPIs = (trades: Trade[], initialCapital: number): AnalyticsKPIs => {
    const sellTrades = trades.filter(t => t.action === 'SELL');

    if (sellTrades.length === 0) {
        return {
            winRate: 0,
            sharpeRatio: 0,
            maxDrawdown: 0,
            totalPnl: 0,
            pnlPercent: 0,
        };
    }

    const totalPnl = sellTrades.reduce((sum, trade) => sum + trade.pnl, 0);
    const pnlPercent = initialCapital > 0 ? (totalPnl / initialCapital) * 100 : 0;
    
    const winningTrades = sellTrades.filter(t => t.pnl > 0).length;
    const winRate = (winningTrades / sellTrades.length) * 100;

    // Calculate Sharpe Ratio (simplified, assuming trades are periodic returns)
    const pnlValues = sellTrades.map(t => t.pnl);
    const meanPnl = totalPnl / sellTrades.length;
    const stdDev = Math.sqrt(pnlValues.map(x => Math.pow(x - meanPnl, 2)).reduce((a, b) => a + b, 0) / (sellTrades.length - 1 || 1) );
    const sharpeRatio = stdDev > 0 ? meanPnl / stdDev : 0; // Assuming risk-free rate is 0

    // Calculate Max Drawdown based on equity curve
    let equity = initialCapital;
    let peakEquity = initialCapital;
    let maxDrawdown = 0; // As a percentage

    // Trades are stored newest-first, so reverse to process chronologically
    const chronologicalTrades = trades.slice().reverse();

    chronologicalTrades.forEach(trade => {
        if (trade.action === 'SELL') {
            equity += trade.pnl;
        }
        if (equity > peakEquity) {
            peakEquity = equity;
        }
        const drawdown = peakEquity > 0 ? (peakEquity - equity) / peakEquity : 0;
        if (drawdown > maxDrawdown) {
            maxDrawdown = drawdown;
        }
    });

    return {
        winRate,
        sharpeRatio,
        maxDrawdown: maxDrawdown * 100,
        totalPnl,
        pnlPercent,
    };
};
