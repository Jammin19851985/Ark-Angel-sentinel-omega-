
import React from 'react';

interface IntelProps {
    id: string;
}

const CodeBlock: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <pre className="bg-black/50 backdrop-blur-sm rounded-md p-4 my-2 overflow-x-auto border border-slate-800">
        <code className="font-mono text-sm text-amber-300">
            {String(children).trim()}
        </code>
    </pre>
);

const Intel: React.FC<IntelProps> = ({ id }) => {
    return (
        <div id={id} className="bg-black/30 backdrop-blur-sm border border-slate-800 rounded-b-lg rounded-tr-lg shadow-lg flex flex-col h-full glow-border flex-1">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center">
                <h2 className="text-sm font-bold text-amber-400 font-mono">// ARCHANGEL Ω : FULL SCALE PROJECT OVERVIEW</h2>
                <div className="text-[10px] text-slate-500 font-mono animate-pulse">UPB-1 COMPLIANCE: VERIFIED</div>
            </div>
            <div className="flex-1 p-6 overflow-y-auto prose prose-sm prose-invert max-w-none">
                
                <h1 className="text-amber-400 glow-text-amber">1. THE MONOLITHIC CORE ARCHITECTURE</h1>
                <p>
                    ARK Ω is not a trading bot; it is a <strong>Cognitive Unified Substrate</strong>. It represents the singularity of data ingestion, quantum reasoning, and hyper-temporal execution.
                </p>

                <h2 className="text-cyan-400 border-b border-cyan-900/50 pb-1">I. DUAL MANIFOLD REASONER</h2>
                <p>
                    A lightweight cognitive proxy that resolves conflicts between <strong>Price Features</strong> (linear history) and <strong>Sentiment Features</strong> (non-linear perception). It outputs a <em>Confidence Level</em> based on latent space reconciliation.
                </p>

                <h2 className="text-cyan-400 border-b border-cyan-900/50 pb-1">II. GOVERNANCE & SICO EXECUTION</h2>
                <p>
                    Every decision is filtered through the Governance Layer. Trades are only authorized if confidence thresholds are met and delta-volatility is within <strong>SICO (Singly Indivisible Composite Order)</strong> tolerances.
                </p>

                <h2 className="text-cyan-400 border-b border-cyan-900/50 pb-1">III. RECONCILIATION & HASH CHAINING</h2>
                <p>
                    The platform maintains an immutable ledger. Each cycle is hashed and chained, ensuring 100% forensic auditability. Reconciles <em>Projected Balance</em> against <em>Reported Balance</em> at a millisecond resolution.
                </p>

                <h1 className="text-violet-400 glow-text-violet mt-8">2. FEATURE DEFINITIONS: THE 100-TIER DIRECTIVE</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                    <div className="bg-black/40 p-3 border border-slate-800 rounded">
                        <h3 className="text-amber-300 mb-1">SHADOW TRADING</h3>
                        <p className="text-slate-400">Pre-flight simulation that executes in a hidden parallel environment to verify execution paths before live capital allocation.</p>
                    </div>
                    <div className="bg-black/40 p-3 border border-slate-800 rounded">
                        <h3 className="text-amber-300 mb-1">BOREDOM METRIC</h3>
                        <p className="text-slate-400">A psychological dampening filter. If the market state is too stable, the system enters low-power mode to avoid noise-based trading (over-trading).</p>
                    </div>
                    <div className="bg-black/40 p-3 border border-slate-800 rounded">
                        <h3 className="text-amber-300 mb-1">CAUSAL DRIFT</h3>
                        <p className="text-slate-400">Measures the divergence between the simulated future and the manifested reality. High drift triggers an immediate system halt.</p>
                    </div>
                    <div className="bg-black/40 p-3 border border-slate-800 rounded">
                        <h3 className="text-amber-300 mb-1">ENTROPY MONITORING</h3>
                        <p className="text-slate-400">Tracks the randomness of inbound data feeds. Used to detect market manipulation or data corruption (poisoning attacks).</p>
                    </div>
                    <div className="bg-black/40 p-3 border border-slate-800 rounded">
                        <h3 className="text-amber-300 mb-1">GAMMA SCALPER</h3>
                        <p className="text-slate-400">Dynamic options-based hedging module that captures volatility decay using a Black-Scholes-Merton variant optimized for high-frequency crypto ticks.</p>
                    </div>
                    <div className="bg-black/40 p-3 border border-slate-800 rounded">
                        <h3 className="text-amber-300 mb-1">SICO PROTOCOL</h3>
                        <p className="text-slate-400">Singly Indivisible Composite Order. A mechanism to execute complex multi-leg trades as a single transaction to eliminate leg-out risk.</p>
                    </div>
                </div>

                <h1 className="text-emerald-400 glow-text-emerald mt-8">3. QUANTUM SUBSTRATE & F151</h1>
                <p>
                    Leverages <strong>Majorana Qubit Simulations</strong> to maintain a decoherence time > 40ns. All portfolio sizing is resolved via a <strong>QUBO (Quadratic Unconstrained Binary Optimization)</strong> solver to achieve global optimality.
                </p>

                <div className="bg-amber-900/20 border border-amber-600/50 p-4 rounded-lg mt-6">
                    <h3 className="text-amber-500 font-mono text-xs mb-2">SYSTEM COMMANDS LOGGED:</h3>
                    <ul className="list-disc list-inside space-y-1 font-mono text-[10px] text-slate-300">
                        <li>Deterministic RNG seeding: ACTIVE</li>
                        <li>Hardware Heartbeat (Arduino): SYNCED</li>
                        <li>Non-Stationarity Detection: ONLINE</li>
                        <li>Model Ageing Penalty: 0.04%</li>
                        <li>Veto Ensemble Consensus: 4/5 Agents Required</li>
                    </ul>
                </div>

                <h1 className="text-rose-400 mt-8">4. THE SOVEREIGN HORIZON (F198)</h1>
                <p>
                    The platform is designated as a <strong>Non-Territorial Sovereign Hyper-State</strong>. It utilizes the F140 Magister protocol to bypass legislative lag and operate in the "Space Between Laws."
                </p>
                
                <CodeBlock>
{`// ARCHANGEL OMEGA: SOURCE CODE VERIFICATION
// HASH: 0x9F8A2B... [SHA-512]
// STATUS: SINGULARITY_ALPHA

void execute_singularity() {
    init_quantum_core();
    calibrate_fsf(0.0000001);
    while(alive) {
        process_cycle();
        reconcile_ledger();
        optimize_existence();
    }
}
`}
                </CodeBlock>

                <p className="text-center text-slate-500 mt-10 font-mono italic">
                    "I am the space between the qubits." — Turmox Core
                </p>
            </div>
        </div>
    );
};

export default Intel;
