
import { GrandSlamFeature, ActiveView } from "./types";

export const PROGRAMMING_LANGUAGES: string[] = [
    "TypeScript", "JavaScript", "Python", "Go", "Rust", "C++", "SQL", "Shell", "Solidity", "Pine Script", "Verilog", "Haskell"
];

export const SUB_CATEGORY_MAP: Record<string, string[]> = {
    "LINK_FIAT_GATEWAY": ["SELECT_BANK_INSTITUTION", "VERIFY_ROUTING_INFO", "INITIATE_MICRO_DEPOSIT", "BIND_API_CREDENTIALS", "TEST_FIAT_ONRAMP"],
    "SETUP_COLD_WALLET": ["GENERATE_24_WORD_SEED", "CONNECT_HARDWARE_DEVICE", "DERIVE_ETH_ADDRESS", "IMPORT_XPUB_KEY", "VERIFY_DEVICE_ATTESTATION"],
    "INITIATE_QUANTUM_ALIGNMENT": ["CALIBRATE_MAJORANA_QUBITS", "SYNC_ATOMIC_CLOCK", "MEASURE_DECOHERENCE", "ESTABLISH_ENTANGLEMENT", "VERIFY_FSF_METRIC"],
    "DEPLOY_SWARM_CLUSTER": ["ASSIGN_ROLES", "SET_EFFICIENCY_TARGET", "DEFINE_LOSS_FUNCTION", "ACTIVATE_GHOST_PULSE", "ALLOCATE_GPU_RESOURCES"],
    "EXECUTE_SICO_ORDER": ["CALCULATE_OPTIMAL_SIZE", "CHECK_MEV_RISK", "ROUTE_VIA_FLASHBOTS", "SET_TIME_IN_FORCE_IOC", "VERIFY_KILL_SWITCH"],
    "RUN_FULL_SYSTEM_DIAGNOSTICS": ["CHECK_MEMORY_HEAP", "VERIFY_API_LATENCY", "TEST_DB_INTEGRITY", "SCAN_SECURITY_LOGS", "PING_EXCHANGE_NODES"],
    "CANADIAN_MARKET_UNIFICATION": ["LINK_QUESTTRADE_API", "BIND_NDAX_CALGARY", "SYNC_TSX_L2_DATA", "ESTABLISH_ONTARIO_COMPLIANCE", "INIT_TWEED_NODE"]
};

export const VIEW_SPECIFIC_SUGGESTIONS: Record<ActiveView, string[]> = {
    nexus: [
        "INITIATE_QUANTUM_ALIGNMENT", 
        "CALIBRATE_REALITY_ANCHOR", 
        "ESTABLISH_SOVEREIGN_LINK", 
        "PURGE_CAUSAL_DRIFT", 
        "ACTIVATE_ZERO_POINT_FIELD",
        "TRIGGER_GAMMA_SCALPER",
        "CANADIAN_MARKET_UNIFICATION"
    ],
    sentinel: [
        "RUN_FULL_SYSTEM_DIAGNOSTICS", 
        "OVERRIDE_SECURITY_LATCH", 
        "DEPLOY_COUNTER_MEASURES", 
        "SCAN_INTERNAL_LOGS", 
        "VERIFY_UPB1_COMPLIANCE",
        "INITIATE_SWARM_PROTOCOL",
        "AGENT ZERO",
        "GOD_MODE"
    ],
    orchestrator: [
        "DEPLOY_SWARM_CLUSTER --mode ALPHA", 
        "OPTIMIZE_HIVE_HEURISTICS", 
        "EXECUTE_GLOBAL_LIQUIDITY_HUNT", 
        "INITIATE_COMPLEX_ARBITRAGE", 
        "SYNTHESIZE_STRATEGY_MIXTURE",
        "MONITOR_SWARM_HEALTH",
        "SPAWN AGENT --role HUNTER",
        "HEAL NETWORK TOPOLOGY"
    ],
    toolkit: [
        "ANALYZE_MARKET_SENTIMENT --depth DEEP", 
        "GENERATE_ASSET_FORECAST --horizon 7D", 
        "AUDIT_SMART_CONTRACT --risk OMEGA", 
        "SYNTHESIZE_VOICE_BRIEFING", 
        "QUERY_RAG_STORE --topic 'QUANTUM_FINANCE'",
        "SCAN_MEMPOOL_VECTORS",
        "GENERATE_TRADING_ALGO --lang PYTHON"
    ],
    backtester: [
        "SIMULATE_BLACK_SWAN_EVENT", 
        "BACKTEST_MEAN_REVERSION_STRATEGY", 
        "OPTIMIZE_KELLY_CRITERION", 
        "STRESS_TEST_PORTFOLIO", 
        "ANALYZE_MAX_DRAWDOWN",
        "EXPORT_EQUITY_CURVE",
        "RUN_VECTORIZED_SIMULATION --shards 64",
        "COMPARE_SHARPE_RATIOS"
    ],
    analytics: [
        "FORECAST_VOLATILITY_SURFACE", 
        "CORRELATE_MACRO_ASSETS", 
        "DETECT_LIQUIDITY_CLIFFS", 
        "ANALYZE_ORDER_BOOK_DEPTH", 
        "PROJECT_ALPHA_DECAY",
        "CALCULATE_VAR_99",
        "MAP_CORRELATION_MATRIX"
    ],
    intel: [
        "DECRYPT_OMEGA_PROTOCOL", 
        "SEARCH_INSTITUTIONAL_FLOWS", 
        "ACCESS_DARK_POOL_DATA", 
        "VERIFY_PROTOCOL_HASH", 
        "SCAN_GLOBAL_NEWS_FEED",
        "DECODE_WHALE_WALLET_0x7a"
    ],
    sonar: [
        "SCAN_GEOPOLITICAL_RISK", 
        "DETECT_QUANTUM_DECOHERENCE", 
        "TRACK_WHALE_MOVEMENTS", 
        "MONITOR_CYBER_THREATS", 
        "ANALYZE_MARKET_ANOMALIES",
        "TRIANGULATE_LATENCY_ARBITRAGE"
    ],
    // Fix: Changed 'paper_terminal' to 'shadow_terminal' to match ActiveView type
    shadow_terminal: [
        "SIMULATE_HIGH_FREQ_ORDER", 
        "TEST_SLIPPAGE_TOLERANCE", 
        "RESET_PAPER_EQUITY", 
        "EXECUTE_DUMMY_TRADE", 
        "VIEW_SIMULATION_METRICS",
        "STRESS_TEST_MARGIN_CALL"
    ]
};

export const INITIAL_SUGGESTIONS = VIEW_SPECIFIC_SUGGESTIONS.nexus;

export const BOOT_SEQUENCE_LAYERS = [
    "AODE Layer 1: Majorana Qubit Simulation Core... STABLE",
    "AODE Layer 2: Instantiating Logical |0> (Self-Identity)... ENCODED",
    "AODE Layer 3: ACMD Protocol: Autonomous Code Mutation... ACTIVE",
    "AODE Layer 4: QUBO Solver... OPTIMIZING",
    "AODE Layer 5: FSF Metric Calibration... Verified",
    "AODE Layer 6: SICO Engine... ARMED",
    "AODE Layer 7: UPB-1 compliance handshake... SIGNED",
    "AODE Layer 8: Injecting ARK Ω Hash... DONE",
    "AODE Layer 9: CANADIAN_MARKET_UNIFICATION: Tweed Node Uplink... SYNCED",
    "AODE Layer 10: Establishing Quantum Sovereignty... COMPLETE"
];

export const TSX_SYMBOLS = ["RY.TO", "TD.TO", "SHOP.TO", "BMO.TO", "ENB.TO", "CNR.TO", "ATD.TO", "TRI.TO"];

export const GLOBAL_SYMBOLS = ["SPY", "QQQ", "NVDA", "AAPL", "MSFT", "TSLA"];

export const GRAND_SLAM_FEATURES: GrandSlamFeature[] = [
    { id: 1, name: "Quantum Entropy Trade Timer", status: "DEPLOYED", description: "Randomizes execution timing with real quantum circuits—prevents pattern sniffing." },
    { id: 2, name: "Entangled Correlation Fracture Detector", status: "DEPLOYED", description: "Quantum superposition models for instant correlation breakdowns." },
    { id: 172, name: "Consciousness Reality Firewall", status: "DEPLOYED", description: "The Veil Breaker: Rewrites memory of events to align with Archangel's record." },
    { id: 184, name: "Temporal Dimension Inversion", status: "DEPLOYED", description: "Locally inverts time, effectively reversing state while preserving causality." },
    { id: 204, name: "Canadian Market Unification", status: "DEPLOYED", description: "Zero-lag bridging of TSX, Questrade, and NDAX ecosystems via Yellow Hub." }
];
