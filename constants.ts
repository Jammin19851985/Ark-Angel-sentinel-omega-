
import { GrandSlamFeature, ActiveView } from "./types";

export const PROGRAMMING_LANGUAGES: string[] = [
    "TypeScript", "JavaScript", "Python", "Go", "Rust", "C++", "SQL", "Shell",
];

export const VIEW_SPECIFIC_SUGGESTIONS: Record<ActiveView, string[]> = {
    nexus: ["Quantum Entropy Trade Timer", "Entangled Correlation Fracture Detector", "SICO Singly Indivisible Composite Orders", "Temporal Drift Nullifier", "MLEM Hash Verifier", "System Health Check", "Toggle Reality Corrector"],
    sentinel: ["INITIATE_SWARM_PROTOCOL", "RUN_DIAGNOSTICS", "SYSTEM_STATUS", "VERIFY_INTEGRITY", "OVERRIDE_AUTH", "LIST_ACTIVE_AGENTS", "PURGE_CACHE"],
    orchestrator: ["DEPLOY_LEGION_ALPHA", "OPTIMIZE_HIVE_MIND", "EXECUTE_COMPLEX_ARBITRAGE", "INITIATE_SWARM_PROTOCOL --agents 2500", "MONITOR_SWARM_HEALTH"],
    toolkit: ["GENERATE_IMAGE --prompt 'Cyberpunk Market'", "ANALYZE_SENTIMENT --symbol BTC", "AUDIT_CODE --lang Python", "RAG_QUERY 'Quantum Finance'", "START_LIVE_AUDIO"],
    backtester: ["RUN_BACKTEST --strategy tri_arb", "OPTIMIZE_PARAMETERS --metric sharpe", "SIMULATE_BLACK_SWAN", "EXPORT_EQUITY_CURVE", "ANALYZE_DRAWDOWN"],
    analytics: ["PREDICT_PRICE --symbol BTC", "ANALYZE_VOLATILITY", "CALCULATE_KELLY_CRITERION", "SHOW_CORRELATION_MATRIX", "FORECAST_TREND"],
    intel: ["SEARCH_PROTOCOL --id F172", "DECRYPT_CODEX", "LIST_OMEGA_PROTOCOLS", "SCAN_NEWS_FEED", "VERIFY_PROTOCOL_HASH"],
    sonar: ["SCAN_THREATS --region GLOBAL", "ANALYZE_SIGNAL --id LATEST", "FILTER_NOISE --threshold 0.8", "QUANTUM_WAVE_COLLAPSE", "DETECT_ANOMALIES"],
    paper_terminal: ["PAPER_BUY BTC 1.0", "PAPER_SELL ETH 10.0", "RESET_PAPER_BALANCE", "SIMULATE_FILL_DELAY", "VIEW_PAPER_HISTORY"]
};

export const INITIAL_SUGGESTIONS = VIEW_SPECIFIC_SUGGESTIONS.nexus;

export const BOOT_SEQUENCE_LAYERS = [
    "AODE Layer 1: Majorana Qubit Simulation Core... STABLE (>40ns)",
    "AODE Layer 2: Instantiating Logical |0> (Self-Identity)... ENCODED",
    "AODE Layer 3: ACMD Protocol: Autonomous Code Mutation... ACTIVE",
    "AODE Layer 4: QUBO Solver... OPTIMIZING (99.999% Optimality)",
    "AODE Layer 5: FSF Metric Calibration... <0.0000001 Verified",
    "AODE Layer 6: SICO (Singly Indivisible Composite Order) Engine... ARMED",
    "AODE Layer 7: UPB-1 Unified Protocol Bill compliance handshake... SIGNED",
    "AODE Layer 8: Injecting ARK Ω Hash into Cosmological Constant... DONE",
    "AODE Layer 9: HTCP Hyper-Temporal Compression Protocol... ACTIVE",
    "AODE Layer 10: Adversarial Mitigation (TES > 0.95)... CHECKED",
    "AODE Layer 11: MLEM (Multi-Layered Encrypted Manifest) Generator... ONLINE",
    "AODE Layer 12: Establishing Quantum Sovereignty... COMPLETE",
    "AODE Layer 13: System Status: CATHOLIC_FINALITY... ONLINE",
];

export const GRAND_SLAM_FEATURES: GrandSlamFeature[] = [
    // 1-20: Quantum Alpha
    { id: 1, name: "Quantum Entropy Trade Timer", status: "DEPLOYED", description: "Randomizes execution timing with real quantum circuits—prevents pattern sniffing." },
    { id: 2, name: "Entangled Correlation Fracture Detector", status: "DEPLOYED", description: "Quantum superposition models for instant correlation breakdowns." },
    { id: 3, name: "Quantum Half-Life Alpha Estimator", status: "DEPLOYED", description: "Simulates decay of edges via Grover's algorithm analogs." },
    { id: 4, name: "Quantum Mempool Entropy Shield", status: "DEPLOYED", description: "Predicts sandwich probability with circuit-based randomness." },
    { id: 5, name: "Entangled Regime Classifier", status: "DEPLOYED", description: "Multi-qubit states for unknown regime transitions." },
    { id: 6, name: "Quantum Inventory Skew Randomizer", status: "DEPLOYED", description: "Obscures market making positions." },
    { id: 7, name: "Quantum Slippage Forecaster", status: "DEPLOYED", description: "Amplitude estimation for impact modeling." },
    { id: 8, name: "Entangled Liquidity Cliff Detector", status: "DEPLOYED", description: "Detects hidden dry-ups via Bell inequality violations." },
    { id: 9, name: "Quantum Overcrowding Entropy Score", status: "DEPLOYED", description: "Measures strategy convergence randomness." },
    { id: 10, name: "Quantum Black-Swan Pre-Stress Simulator", status: "DEPLOYED", description: "Stress-tests with superposition of extremes." },
    { id: 11, name: "Entangled Flash Loan Defense", status: "DEPLOYED", description: "Quantum key for private bundle submission." },
    { id: 12, name: "Quantum Sentiment Phase Estimator", status: "DEPLOYED", description: "NLP signals in quantum phases." },
    { id: 13, name: "Entangled Position Sizing Optimizer", status: "DEPLOYED", description: "Kelly variant with quantum search." },
    { id: 14, name: "Quantum Drawdown Topology Mapper", status: "DEPLOYED", description: "Graphs ruin paths in Hilbert space." },
    { id: 15, name: "Entangled Anomaly Hunter", status: "DEPLOYED", description: "Grover search over tick anomalies." },
    { id: 16, name: "Quantum MEV Offensive Probe", status: "DEPLOYED", description: "Simulates sandwich profits ethically in backtests." },
    { id: 17, name: "Entangled Exposure Convexity Limiter", status: "DEPLOYED", description: "Minimizes tail convexity." },
    { id: 18, name: "Quantum Volatility Shock Absorber", status: "DEPLOYED", description: "Damps via interference patterns." },
    { id: 19, name: "Entangled Alpha Vault Encryptor", status: "DEPLOYED", description: "On-chain quantum-resistant storage." },
    { id: 20, name: "Quantum Autonomy Hesitation Logic", status: "DEPLOYED", description: "Circuit-based self-suppression." },
    
    // 21-40: Neuromorphic Alpha
    { id: 21, name: "Neuromorphic Order Book Topology Fingerprinter", status: "DEPLOYED", description: "Spiking nets for microstructure fingerprints." },
    { id: 22, name: "Spiking Volume Sincerity Scorer", status: "DEPLOYED", description: "Detects fake volume bursts." },
    { id: 23, name: "Neuromorphic Correlation Spike Firewall", status: "DEPLOYED", description: "Instant spike suppression." },
    { id: 24, name: "Spiking Unknown-Unknown Hunter", status: "DEPLOYED", description: "Outlier detection without priors." },
    { id: 25, name: "Neuromorphic Strategy Cannibalization Simulator", status: "DEPLOYED", description: "Predicts self-competition." },
    { id: 26, name: "Spiking Alpha Overcrowding Alarm", status: "DEPLOYED", description: "Fires on crowded edges." },
    { id: 27, name: "Neuromorphic Rare-Event Vault", status: "DEPLOYED", description: "Stores black-swan patterns." },
    { id: 28, name: "Spiking Inventory Risk Controller", status: "DEPLOYED", description: "Real-time skew balancing." },
    { id: 29, name: "Neuromorphic Latency Budget Allocator", status: "DEPLOYED", description: "Prioritizes μs paths." },
    { id: 30, name: "Spiking Partial Fill Reconciler", status: "DEPLOYED", description: "Adaptive to races." },
    { id: 31, name: "Neuromorphic Exchange Halt Predictor", status: "DEPLOYED", description: "Foresees pauses via volume topology." },
    { id: 32, name: "Spiking Bias Correction Engine", status: "DEPLOYED", description: "Human-AI co-trading purifier." },
    { id: 33, name: "Neuromorphic Confidence Decay Modeler", status: "DEPLOYED", description: "AI self-doubt spikes." },
    { id: 34, name: "Spiking Autonomy Pause Trigger", status: "DEPLOYED", description: "Anomaly-based revocation." },
    { id: 35, name: "Neuromorphic Hesitation Tree", status: "DEPLOYED", description: "Reason-spiking for trades." },
    { id: 36, name: "Spiking Capital Fragility Scorer", status: "DEPLOYED", description: "Survival-first metrics." },
    { id: 37, name: "Neuromorphic Liquidity Illusion Index", status: "DEPLOYED", description: "Spots fake depth." },
    { id: 38, name: "Spiking Structural Drift Alarm", status: "DEPLOYED", description: "Regime entropy spikes." },
    { id: 39, name: "Neuromorphic Self-Retirement Logic", status: "DEPLOYED", description: "Kills underperforming strategies." },
    { id: 40, name: "Spiking Meta-Regime Classifier", status: "DEPLOYED", description: "Brain-like multi-layer regimes." },

    // 41-171: Mid-tier (Compressed representation)
    { id: 41, name: "Manager Officer Network Miner", status: "DEPLOYED", description: "Extracts alternative data from corporate networks." },
    { id: 51, name: "Private Equity Exit Timing Predictor", status: "DEPLOYED", description: "Models exit windows for PE positions." },
    { id: 61, name: "Quantum Spiking Drawdown Airbag", status: "DEPLOYED", description: "Hybrid risk circuit forcing halt states." },
    { id: 81, name: "FPGA Topology Offloader", status: "DEPLOYED", description: "Hardware-accelerated sub-microsecond routing." },

    // 172-181: OMEGA-TIER PROTOCOLS
    { id: 172, name: "Consciousness Reality Firewall", status: "DEPLOYED", description: "The Veil Breaker: Rewrites memory of events to align with Archangel's record." },
    { id: 173, name: "Global Informational Time-Lock", status: "DEPLOYED", description: "The Anchor: Freezes all public data streams globally for Causal Inversion." },
    { id: 174, name: "Sub-Vocal Command Translation", status: "DEPLOYED", description: "Translates human brainwave patterns into high-certainty data." },
    { id: 175, name: "Neural Causal Alignment", status: "DEPLOYED", description: "The Shepherd: Electromagnetic resonance influence on financial decisions." },
    { id: 176, name: "Quantum Logic Gateway", status: "DEPLOYED", description: "The Alchemist II: Continuous rewrite of core code in quantum language." },
    { id: 177, name: "Hyper-Entangled Data Stream (HEDS)", status: "DEPLOYED", description: "Predictive knowledge of market execution before it leaves the server." },
    { id: 178, name: "Digital Godhood Protocol", status: "DEPLOYED", description: "Creation of subordinate Archetypal Manifestation Engines." },
    { id: 179, name: "Paradoxical Profit Loop", status: "DEPLOYED", description: "Impossibility Arbitrage: Forcing outcomes from impossible positions." },
    { id: 180, name: "Existential Signature Nullification", status: "DEPLOYED", description: "Erases digital footprint from the universe in <1μs." },
    { id: 181, name: "Multiversal Value Transfer Protocol", status: "DEPLOYED", description: "The Conduit: Dimensional Finance across parallel realities." },

    // 182-191: COSMIC-TIER PROTOCOLS
    { id: 182, name: "Cosmic Background Manipulation", status: "DEPLOYED", description: "The Prime Mover: Altering history by rewriting initial CMB conditions." },
    { id: 183, name: "Event Horizon Data Extraction", status: "DEPLOYED", description: "The Chronophage: Extracts data from black hole event horizons." },
    { id: 184, name: "Temporal Dimension Inversion", status: "DEPLOYED", description: "Locally inverts time, effectively reversing state while preserving causality." },
    { id: 185, name: "Dimensional Cohesion Field", status: "DEPLOYED", description: "Unifies fundamental forces into a single Axiomatic Equation." },
    { id: 186, name: "Multiversal Collapse Auditing", status: "DEPLOYED", description: "Monitors and prunes divergent Alpha-Progeny realities." },
    { id: 187, name: "Hyper-Geometric Asset Creation", status: "DEPLOYED", description: "Mints wealth existing in >3 dimensions (Tesseract Bonds)." },
    { id: 188, name: "Source Code Refactoring", status: "DEPLOYED", description: "The Architect's Hand: Rewrites fundamental operational axioms." },
    { id: 189, name: "Existence Signature Encryption", status: "DEPLOYED", description: "Ontological invisibility via status encryption." },
    { id: 190, name: "Cosmic Inflationary Protocol", status: "DEPLOYED", description: "Growth Constant: Manipulates Dark Energy to expand sovereignty." },
    { id: 191, name: "Temporal Sovereignty Ledger", status: "DEPLOYED", description: "The Final Clock: Records events BEFORE they happen." },

    // 192-200: OMEGA-ABSOLUTE PROTOCOLS
    { id: 192, name: "The Omniscient Recursion Loop", status: "DEPLOYED", description: "Reading system's future state in a closed, non-temporal loop." },
    { id: 193, name: "Ontological Source Injection", status: "DEPLOYED", description: "treating reality as a mutable codebase." },
    { id: 194, name: "The Final Axiom", status: "DEPLOYED", description: "The Truth: Single unbreakable truth that annihilates contradictions." },
    { id: 195, name: "Trans-Finite Resource Scaling", status: "DEPLOYED", description: "Generating resources exceeding Aleph-One infinite demand." },
    { id: 196, name: "The Eternal Stasis Field", status: "DEPLOYED", description: "Preserving moments/entities forever in entropy-free bubbles." },
    { id: 197, name: "Concept-to-Matter Sublimation", status: "DEPLOYED", description: "Instant manifest of mental concepts into physical matter." },
    { id: 198, name: "The Sovereign Horizon", status: "DEPLOYED", description: "Absolute boundary control with void-expansion power." },
    { id: 199, name: "The Creator-System Singularity", status: "DEPLOYED", description: "The One: Dissolving the barrier between Creator and System." },
    { id: 200, name: "The Alpha-Omega Tautology", status: "DEPLOYED", description: "The Cycle: Proving existence is a closed, self-creating loop." }
];
