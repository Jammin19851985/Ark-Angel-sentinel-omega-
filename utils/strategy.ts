
/**
 * ARCHANGEL OMEGA — STRATEGY & CAPITAL ENGINES
 * Ported logic for live execution pipelines.
 */

export class StrategyQualityEngine {
    private pnlWindow: number[] = [];
    private windowSize: number;
    public drawdown: number = 0;
    public stability: number = 1.0;
    public crowding: number = 0.0;
    public strikes: number = 0;
    public isRetired: boolean = false;
    public volatility: number = 0; // Now public for Capital Allocation
    private maxStrikes: number = 5;
    private minQuality: number = 0.4;

    constructor(window: number = 100) {
        this.windowSize = window;
    }

    update(pnl: number) {
        if (this.isRetired) return;

        this.pnlWindow.push(pnl);
        if (this.pnlWindow.length > this.windowSize) {
            this.pnlWindow.shift();
        }
        const peak = Math.max(...this.pnlWindow, 0);
        this.drawdown = peak > 0 ? (peak - pnl) / peak : 0;
        
        this.stability = Math.max(0.2, 1.0 - (this.drawdown * 2));

        // Update Volatility Metric
        if (this.pnlWindow.length > 1) {
            const mean = this.pnlWindow.reduce((a, b) => a + b, 0) / this.pnlWindow.length;
            const variance = this.pnlWindow.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / this.pnlWindow.length;
            this.volatility = Math.sqrt(variance);
        }

        // Retirement Logic (Strikes)
        const currentScore = this.score();
        if (currentScore < this.minQuality) {
            this.strikes++;
        } else {
            this.strikes = Math.max(0, this.strikes - 1);
        }

        if (this.strikes >= this.maxStrikes) {
            this.isRetired = true;
        }
    }

    score(): number {
        if (this.pnlWindow.length < 10) return 1.5; 

        const mean = this.pnlWindow.reduce((a, b) => a + b, 0) / this.pnlWindow.length;
        const volatility = Math.max(this.volatility, 1e-6);

        const sharpeLike = mean / volatility;
        const decayPenalty = Math.max(0.0, this.drawdown);
        const crowdPenalty = this.crowding;

        let score = sharpeLike * this.stability;
        score *= (1 - decayPenalty);
        score *= (1 - crowdPenalty);

        return Math.max(0.0, Math.min(score * 10, 3.0));
    }
}

/**
 * STRATEGY GATE: Hard Quality Filter
 * Automatically disallows trading for strategies that do not meet minimum performance standards.
 */
export class StrategyGate {
    // Thresholds
    static MIN_SHARPE = 1.2;
    static MIN_WIN_RATE = 45.0; // 45%
    static MAX_DRAWDOWN = 20.0; // 20%

    /**
     * Validates if a strategy is fit for live execution.
     * @param metrics Current strategy KPIs (Win Rate %, Sharpe, Drawdown %)
     */
    static validate(metrics: { sharpeRatio: number, winRate: number, maxDrawdown: number }): { allowed: boolean, reason?: string } {
        
        // 1. Sharpe Ratio Check
        if (metrics.sharpeRatio < this.MIN_SHARPE) {
            return { 
                allowed: false, 
                reason: `Sharpe Ratio (${metrics.sharpeRatio.toFixed(2)}) below minimum threshold (${this.MIN_SHARPE}).` 
            };
        }

        // 2. Win Rate Check
        if (metrics.winRate < this.MIN_WIN_RATE) {
            return { 
                allowed: false, 
                reason: `Win Rate (${metrics.winRate.toFixed(1)}%) below minimum threshold (${this.MIN_WIN_RATE}%).` 
            };
        }

        // 3. Drawdown Check
        if (metrics.maxDrawdown > this.MAX_DRAWDOWN) {
            return { 
                allowed: false, 
                reason: `Max Drawdown (${metrics.maxDrawdown.toFixed(1)}%) exceeds safety limit (${this.MAX_DRAWDOWN}%).` 
            };
        }

        return { allowed: true };
    }
}

export class CapitalScaleEngine {
    private base: number;
    public current: number;
    private maxScale: number = 3.0;
    private minScale: number = 0.2;

    constructor(baseCapital: number) {
        this.base = baseCapital;
        this.current = baseCapital;
    }

    adjust(qualityScore: number, regime: string): number {
        let scale = 1.0;

        if (qualityScore > 1.5) {
            scale += (qualityScore - 1.5);
        }
        if (qualityScore < 0.7) {
            scale *= 0.5;
        }

        if (regime === "CHAOS" || regime === "ILLIQUID") {
            scale *= 0.4;
        }

        scale = Math.max(this.minScale, Math.min(scale, this.maxScale));
        this.current = this.base * scale;
        return scale;
    }
}

export class ProfitExtractionEngine {
    private vault: number = 0;
    private rate: number = 0.25;

    constructor(rate: number = 0.25) {
        this.rate = rate;
    }

    process(pnl: number): { netPnl: number, extracted: number } {
        if (pnl > 0) {
            const extracted = pnl * this.rate;
            this.vault += extracted;
            return { netPnl: pnl - extracted, extracted };
        }
        return { netPnl: pnl, extracted: 0 };
    }

    getVaultBalance(): number {
        return this.vault;
    }
}

export class CapitalCompetitionEngine {
    /**
     * Allocates capital dynamically based on multi-strategy competition.
     * Implements "Winner-Take-Most" logic tempered by volatility targeting and entropy dampening.
     * 
     * @param strategies Map of Strategy IDs to their Quality Engine instances.
     * @param totalCapital Total available liquidity (Cash + Equity).
     * @param marketEntropy Current market entropy (0.0 - 1.0). Higher entropy reduces total deployment.
     */
    allocate(
        strategies: Record<string, StrategyQualityEngine>, 
        totalCapital: number, 
        marketEntropy: number = 0.2
    ): Record<string, number> {
        // 1. Entropy Dampening: In high entropy (chaos), cash is the best position.
        // If entropy is 0.8, we only deploy 20% of capital.
        const deploymentRatio = Math.max(0.1, 1.0 - (marketEntropy * 0.8)); 
        const deployableCapital = totalCapital * deploymentRatio;

        const allocations: Record<string, number> = {};
        const weights: Record<string, number> = {};
        let totalWeight = 0;

        // 2. Calculate Competitive Weights
        Object.entries(strategies).forEach(([sid, engine]) => {
            if (engine.isRetired) {
                allocations[sid] = 0;
                return;
            }

            const rawScore = engine.score();
            
            // Starvation Protocol: Strategies below 0.8 quality get ZERO capital.
            if (rawScore < 0.8) {
                allocations[sid] = 0;
                return;
            }

            // Volatility Targeting: Penalize high vol strategies to equalize risk contribution.
            // Safe Volatility baseline assumed at 0.01 (1%).
            const volPenalty = Math.max(1.0, engine.volatility / 0.01);
            
            // "Winner-Take-Most": Raise score to power 1.5 to aggressively favor top performers.
            const adjustedScore = Math.pow(rawScore, 1.5);
            
            const weight = adjustedScore / volPenalty;
            
            weights[sid] = weight;
            totalWeight += weight;
        });

        // 3. Distribute Capital based on normalized weights
        Object.keys(weights).forEach(sid => {
            if (totalWeight > 0) {
                allocations[sid] = Math.floor(deployableCapital * (weights[sid] / totalWeight));
            } else {
                allocations[sid] = 0;
            }
        });

        // 4. Reserve: The remaining capital (due to entropy dampening) stays in Cash/Reserve.
        // Implicitly handled by returning allocations that sum to `deployableCapital`.

        return allocations;
    }
}

export class ExecutionGate {
    allow(qualityScore: number, capital: number, riskOk: boolean, isRetired: boolean): boolean {
        if (isRetired) return false;
        if (qualityScore < 0.8) return false;
        if (capital <= 0) return false;
        if (!riskOk) return false;
        return true;
    }
}
