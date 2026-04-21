
/**
 * ARK ANGEL — LIVE EXECUTION SPINE (TS PORT)
 * Optimized for high-frequency deterministic gating with AODE Mandates.
 * Includes Quantum-Resistant Signing (Dilithium/Kyber Simulation).
 * Enhanced with MEV Protection Logic.
 */

export class ExecutionBlockedError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ExecutionBlockedError';
    }
}

export class HardwareViolationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'HardwareViolationError';
    }
}

export class BiometricAuthError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'BiometricAuthError';
    }
}

export interface SpineContext {
    device: string;
    equity: number;
    volatility: number;
    drawdown: number;
    structureScore: number;
    signedDevices: string[];
    requiredQuorum: number;
    fsfMetric: number;
    qubitCoherence: number;
    biometricAuthorized: boolean;
    mevExposure?: number;
    privateRpcActive?: boolean;
}

export interface ExecutionIntent {
    symbol: string;
    side: 'BUY' | 'SELL';
    quantity: number;
    price: number;
    bracket?: {
        stopLoss?: number;
        takeProfit?: number;
    };
}

export class SpineEngine {
    // AODE Mandates & Script Constants
    static MAX_ACCOUNT_RISK_PCT = 0.02;
    static MAX_SYMBOL_RISK_PCT = 0.005; // 0.5% per script
    static MAX_DRAWDOWN = 0.25;
    static ALPHA_THRESHOLD = 0.65;
    static FSF_THRESHOLD = 0.0000001;
    static MIN_QUBIT_COHERENCE_NS = 40.0;
    static MAX_MEV_EXPOSURE = 0.3; // 30% exposure limit for standard trades

    /**
     * Capital Allocation Gate
     */
    static authorizeCapital(intent: ExecutionIntent, equity: number) {
        const max_symbol_risk = equity * this.MAX_SYMBOL_RISK_PCT;
        const est_risk = intent.quantity * intent.price;
        if (est_risk > max_symbol_risk) {
            throw new ExecutionBlockedError(`CAPITAL GATE: Trade risk $${est_risk.toFixed(2)} exceeds symbol limit $${max_symbol_risk.toFixed(2)}.`);
        }
    }

    /**
     * Gated verification against AODE physical and causal constraints.
     */
    static authorize(context: SpineContext, intent: ExecutionIntent) {
        // --- FEATURE 102: BIOMETRIC AUTHORITY ---
        if (!context.biometricAuthorized) {
            throw new BiometricAuthError("BIO-METRIC AUTHORITY LATCH: Operator stress levels outside safe parameters (HRV Lock).");
        }

        // --- MEV PROTECTION GATE ---
        if (context.mevExposure && context.mevExposure > this.MAX_MEV_EXPOSURE && !context.privateRpcActive) {
             throw new ExecutionBlockedError(`MEV RISK: High mempool exposure detected (${(context.mevExposure * 100).toFixed(1)}%). Engage Private RPC before execution.`);
        }

        // --- QUBIT STABILITY MANDATE (1.1) ---
        if (context.qubitCoherence < this.MIN_QUBIT_COHERENCE_NS) {
            throw new HardwareViolationError(`QUBIT DECOHERENCE: ${context.qubitCoherence.toFixed(2)}ns below 40ns threshold.`);
        }

        // --- FSF METRIC CALIBRATION (1.3) ---
        if (context.fsfMetric > this.FSF_THRESHOLD) {
            throw new ExecutionBlockedError(`FSF EXCEEDED: ${context.fsfMetric.toFixed(9)} above threshold.`);
        }

        // --- HARDWARE QUORUM ---
        if (context.signedDevices.length < context.requiredQuorum) {
            throw new HardwareViolationError(`HARDWARE QUORUM NOT MET: ${context.signedDevices.length}/${context.requiredQuorum}. Signature required from physically connected devices.`);
        }

        // --- CAPITAL GATE ---
        this.authorizeCapital(intent, context.equity);

        // --- BRACKET ORDER VALIDATION ---
        if (intent.bracket) {
            if (intent.side === 'BUY') {
                if (intent.bracket.stopLoss && intent.bracket.stopLoss >= intent.price) {
                    throw new ExecutionBlockedError(`INVALID BRACKET: Buy Stop Loss (${intent.bracket.stopLoss}) must be below Entry (${intent.price}).`);
                }
                if (intent.bracket.takeProfit && intent.bracket.takeProfit <= intent.price) {
                    throw new ExecutionBlockedError(`INVALID BRACKET: Buy Take Profit (${intent.bracket.takeProfit}) must be above Entry (${intent.price}).`);
                }
            } else if (intent.side === 'SELL') {
                if (intent.bracket.stopLoss && intent.bracket.stopLoss <= intent.price) {
                    throw new ExecutionBlockedError(`INVALID BRACKET: Sell Stop Loss (${intent.bracket.stopLoss}) must be above Entry (${intent.price}).`);
                }
                if (intent.bracket.takeProfit && intent.bracket.takeProfit >= intent.price) {
                    throw new ExecutionBlockedError(`INVALID BRACKET: Sell Take Profit (${intent.bracket.takeProfit}) must be below Entry (${intent.price}).`);
                }
            }
        }

        // --- SURVIVAL ENGINE ---
        if (context.drawdown >= this.MAX_DRAWDOWN) {
            throw new ExecutionBlockedError(`SURVIVAL ENGINE BLOCK: Drawdown ${context.drawdown.toFixed(4)} exceeds limit ${this.MAX_DRAWDOWN}`);
        }

        // --- STRUCTURAL ALPHA ---
        if (context.structureScore <= this.ALPHA_THRESHOLD) {
            throw new ExecutionBlockedError(`STRUCTURAL ALPHA BLOCK: Alpha score ${context.structureScore.toFixed(4)} below threshold ${this.ALPHA_THRESHOLD}`);
        }
    }

    /**
     * Generates SHA-512 MLEM (Multi-Layered Encrypted Manifest).
     * Now includes a simulated post-quantum Dilithium sig wrapper.
     */
    private static async generateMLEM(payload: any): Promise<string> {
        const msgUint8 = new TextEncoder().encode(JSON.stringify(payload));
        const hashBuffer = await window.crypto.subtle.digest('SHA-512', msgUint8);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const baseHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        
        // Simulation of NIST Dilithium Signature
        const quantumSig = `SIG_DILITHIUM_${Math.random().toString(36).substring(7).toUpperCase()}`;
        return `${baseHash}.${quantumSig}`;
    }

    /**
     * Executes pre-flight checks and returns final execution manifest.
     */
    static async preflight(intent: ExecutionIntent, context: SpineContext) {
        this.authorize(context, intent);
        
        // Final XEDO data object construction
        const xedo = {
            intent,
            equity: context.equity,
            timestamp: Date.now(),
            qubo_energy: -24.5,
            qubit_coherence: context.qubitCoherence,
            upb1_compliance: true,
            network_tomography: "STABLE",
            lazarus_status: "NOMINAL",
            biometric_handshake: "SECURE",
            mev_protection: context.privateRpcActive ? "FLASHBOTS_ACTIVE" : "STANDARD_MEMPOOL"
        };

        const mlemHash = await this.generateMLEM(xedo);
        
        return {
            valid: true,
            complianceHash: mlemHash.toUpperCase(),
            xedo
        };
    }
}
