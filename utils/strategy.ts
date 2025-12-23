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
        const variance = this.pnlWindow.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / this.pnlWindow.length;
        const volatility = Math.sqrt(variance);

        const sharpeLike = mean / Math.max(volatility, 1e-6);
        const decayPenalty = Math.max(0.0, this.drawdown);
        const crowdPenalty = this.crowding;

        let score = sharpeLike * this.stability;
        score *= (1 - decayPenalty);
        score *= (1 - crowdPenalty);

        return Math.max(0.0, Math.min(score * 10, 3.0));
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
    allocate(strategyScores: Record<string, number>, totalCapital: number): Record<string, number> {
        const totalScore = Object.values(strategyScores).reduce((a, b) => a + Math.max(b, 0), 0);
        const allocations: Record<string, number> = {};

        Object.keys(strategyScores).forEach(sid => {
            if (totalScore === 0) {
                allocations[sid] = 0;
            } else {
                allocations[sid] = totalCapital * (Math.max(strategyScores[sid], 0) / totalScore);
            }
        });

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
