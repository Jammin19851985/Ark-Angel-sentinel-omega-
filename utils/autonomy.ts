
/**
 * ARCHANGEL OMEGA — AUTONOMY CORE (v∞.4)
 * Ported logic from production Python scripts for high-fidelity simulation.
 */

import { QuantumMetrics, StrategyMetrics, AutonomyMetrics } from "../types";

export interface AutonomyState {
    unlocked: boolean;
    drawdownLimit: number;
    minConfidence: number;
}

export class AutonomyEngine {
    // Thresholds for autonomy unlock
    static PERFORMANCE_UNLOCK_THRESHOLD = 5000.0; // $5k profit to unlock
    static DRAWDOWN_REVOCATION_THRESHOLD = 0.15; // 15% DD revokes autonomy
    static RECOVERY_COOLDOWN_MS = 60000; // 60s cooldown

    /**
     * AI is not always allowed to act.
     * Unlocks autonomy only if performance + regime allow it.
     */
    static evaluate(totalPnl: number, drawdown: number, currentState: boolean): { unlocked: boolean; reason: string } {
        if (drawdown > this.DRAWDOWN_REVOCATION_THRESHOLD) {
            return { unlocked: false, reason: "DRAWDOWN_EXCEEDED" };
        }

        // Even if unlocked, if drawdown is spiking, stay cautious
        if (drawdown > 0.08 && currentState) {
            return { unlocked: true, reason: "CAUTIOUS_ACTIVE" };
        }

        if (!currentState && totalPnl >= this.PERFORMANCE_UNLOCK_THRESHOLD) {
            return { unlocked: true, reason: "PERFORMANCE_MILESTONE_MET" };
        }

        return { unlocked: currentState, reason: currentState ? "NOMINAL_ACTIVE" : "AWAITING_PROFIT_MILESTONE" };
    }

    /**
     * AI Hesitation Logic: Calculates if the AI should 'pause' based on market noise.
     */
    static calculateHesitation(entropy: number, volatility: number, activeDirectives: Record<string, boolean>): number {
        // High entropy (randomness) + high volatility = higher hesitation
        let score = (entropy * 0.4) + (volatility * 1.5);

        // Directive Modification: Entangled Correlation Fracture Detector
        if (activeDirectives['Entangled Correlation Fracture Detector']) {
            score *= 1.2; // Increase caution when correlation breakdown is being monitored
        }

        return Math.min(1.0, Math.max(0.0, score));
    }

    /**
     * Confidence Decay: Reduces AI confidence over time if no feedback or successful actions are logged.
     */
    static decayConfidence(currentConfidence: number, lastActionTime: number, decayFactor: number): number {
        const elapsedSeconds = (Date.now() - lastActionTime) / 1000;
        if (elapsedSeconds < 15) return currentConfidence; // No decay in the first 15 seconds
        
        // Exponential decay
        const decay = Math.pow(1 - decayFactor, elapsedSeconds / 30);
        return Math.max(0.1, currentConfidence * decay);
    }
}

export class DirectiveProcessor {
    /**
     * Handles the specific logic for the 10 Prime Suggestions.
     */
    static process(activeDirectives: Record<string, boolean>, metrics: { quantum: QuantumMetrics, strategy: StrategyMetrics, alpha: number }): Partial<QuantumMetrics> {
        const updates: Partial<QuantumMetrics> = {};

        if (activeDirectives['Temporal Drift Nullifier']) {
            updates.executionLatency = Math.max(0.0001, metrics.quantum.executionLatency * 0.8);
        }

        if (activeDirectives['Quantum Entropy Trade Timer']) {
            // High entropy leads to slower (more precise) timing sequences
            updates.fsfMetric = metrics.quantum.entropy < 0.2 ? 0.000000001 : 0.00000005;
        }

        if (activeDirectives['SICO Singly Indivisible Composite Orders']) {
            updates.tesScore = 0.999; // Absolute peak evasion
        }

        return updates;
    }
}

export class SelfSuppressionEngine {
    /**
     * Logic for AI deciding to stay quiet even if unlocked.
     * Triggered by low health score or high hesitation.
     */
    static shouldSuppress(healthScore: number, hesitation: number): boolean {
        // Suppress if health is critical or AI is extremely hesitant due to market noise
        return healthScore < 0.3 || hesitation > 0.92;
    }
}

export class ContractLockEngine {
    /**
     * Manages a blacklist of symbols the AI is forbidden to touch autonomously.
     */
    static isLocked(symbol: string, lockedContracts: string[]): boolean {
        return lockedContracts.includes(symbol.toUpperCase());
    }

    /**
     * Decides if a contract should be locked based on recent failure patterns (Strikes).
     */
    static evaluateLock(symbol: string, strategyStrikes: number): boolean {
        return strategyStrikes >= 4; // Lock after 4 quality strikes
    }
}

export class AutonomyHealthScore {
    /**
     * Aggregated score of system health from an autonomy perspective.
     */
    static calculate(
        strategy: StrategyMetrics, 
        quantum: QuantumMetrics, 
        confidence: number,
        hesitation: number
    ): number {
        const strategyWeight = strategy.qualityScore / 3; // 0..1 scale (since quality is up to 3)
        const quantumWeight = quantum.trustScore;
        const confidenceWeight = confidence;
        
        // Base health is the average of core sub-scores
        let health = (strategyWeight + quantumWeight + confidenceWeight) / 3;
        
        // Hesitation directly penalties the actionable health
        const actionableHealth = Math.max(0, health - (hesitation * 0.15));
        
        return parseFloat(actionableHealth.toFixed(4));
    }
}

export class StructuralAlphaLayer {
    /**
     * Regime-based gating logic to determine if current market conditions are favorable for autonomous action.
     */
    static isRegimeTradeable(entropy: number, fsf: number, regime: string): boolean {
        if (entropy > 0.85 || fsf > 0.0005) return false;
        
        const nonTradeableRegimes = ["CHAOS", "DECOHERENT", "HIGH_VIX_EQUIV"];
        if (nonTradeableRegimes.includes(regime)) return false;
        
        return true;
    }
}

export class AutonomousRecoveryEngine {
    /**
     * Automated error recovery: Checks for failed states and attempts a 'hot-fix' or reset.
     */
    static attemptRecovery(metrics: AutonomyMetrics): { shouldReset: boolean; patchLevel: number } {
        if (metrics.healthScore < 0.2) {
            return { shouldReset: true, patchLevel: 1.0 };
        }
        if (metrics.anomalyDetected) {
            return { shouldReset: false, patchLevel: 0.5 };
        }
        return { shouldReset: false, patchLevel: 0 };
    }
}
