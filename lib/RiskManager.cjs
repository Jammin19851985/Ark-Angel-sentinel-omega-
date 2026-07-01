class RiskManager {
    constructor(config) {
        this.maxDrawdown = config.maxDrawdown || 0.1; // 10% max global drawdown
        this.maxPositionSize = config.maxPositionSize || 0.05; // 5% of portfolio per trade
        this.baseBalance = 10000; // Simulated starting balance
        this.currentBalance = this.baseBalance;
        this.dailyLossLimit = this.baseBalance * 0.02; // 2% daily loss limit
        this.currentDailyLoss = 0;
    }

    updateBalance(newBalance) {
        this.currentBalance = newBalance;
    }

    recordLoss(amount) {
        this.currentDailyLoss += amount;
    }

    isTradingAllowed() {
        if (this.currentDailyLoss >= this.dailyLossLimit) {
            return { allowed: false, reason: "Daily loss limit reached. System halted." };
        }
        
        const currentDrawdown = (this.baseBalance - this.currentBalance) / this.baseBalance;
        if (currentDrawdown >= this.maxDrawdown) {
            return { allowed: false, reason: "Max global drawdown reached. System halted." };
        }

        return { allowed: true };
    }

    calculatePositionSize(price, confidence) {
        // Adjust position size based on confidence (0.9 to 1.0 translates to 50% to 100% of max position)
        const adjustedRisk = (confidence - 0.9) * 10; 
        const sizePercentage = this.maxPositionSize * Math.max(0.5, Math.min(1.0, adjustedRisk));
        
        const usdAmount = this.currentBalance * sizePercentage;
        return usdAmount / price;
    }
}

module.exports = { RiskManager };
