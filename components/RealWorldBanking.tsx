import React, { useState, useEffect } from 'react';
import { db, auth, OperationType, handleFirestoreError } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

const SUGGESTIONS = [
    // Banking Integration & Infrastructure
    "Integrate Plaid for real-time account verification and balance checking.",
    "Implement Stripe Identity to verify KYC/AML for high-tier accounts.",
    "Utilize Treasury Prime API for white-label banking and direct ledger access.",
    "Deploy Synapse or Unit to issue virtual and physical debit cards for traders.",
    "Enable FedNow / RTP (Real-Time Payments) for instant fiat deposits.",
    "Automate ACH transfers for sweeping idle funds into interest-bearing accounts.",
    "Set up multi-signature cold storage for crypto assets via Fireblocks.",
    "Establish direct FIX protocol connections to institutional dark pools.",
    "Implement ISO 20022 messaging standards for cross-border banking operations.",
    "Create a reconciliation engine to match bank statements with trading ledgers daily.",

    // Risk Management & Compliance
    "Implement dynamic VaR (Value at Risk) modeling synced with live bank balances.",
    "Deploy a real-time anti-money laundering (AML) transaction monitoring engine.",
    "Set up automated tax-loss harvesting execution integrated with broker APIs.",
    "Establish hard kill-switches linked to sudden portfolio drawdowns (>5%).",
    "Monitor global systemic liquidity metrics to adjust autonomous leverage.",
    "Integrate ComplyAdvantage for global sanctions and PEP screening.",
    "Develop a fractional reserve alarm to prevent liquidity traps across bank accounts.",
    "Require multi-factor biometric approval for autonomous capital withdrawals.",
    "Run continuous Monte Carlo simulations to stress-test the banking infrastructure.",
    "Auto-generate SEC/FINRA compliant audit logs and trade receipts.",

    // Execution & Algorithmic Trading
    "Integrate Alpaca API for zero-commission programmable stock execution.",
    "Deploy Binance/Kraken websocket adapters for ultra-low latency crypto trading.",
    "Implement Smart Order Routing (SOR) across fragmented liquidity venues.",
    "Use Interactive Brokers (IBKR) API for advanced options and futures trading.",
    "Code a TWAP (Time-Weighted Average Price) algorithm for large institutional orders.",
    "Code a VWAP (Volume-Weighted Average Price) algorithm to minimize market impact.",
    "Integrate MEV (Miner Extractable Value) protection via Flashbots for on-chain trades.",
    "Deploy a statistical arbitrage engine using cointegration pairs trading.",
    "Enable flash loans via Aave/dYdX for capital-efficient arbitrage.",
    "Implement hardware-accelerated FPGA trading logic for nanosecond execution.",

    // Data Ingestion & Analytics
    "Ingest real-time Level 2 Order Book data directly via UDP multicast.",
    "Integrate Bloomberg Terminal API (B-PIPE) for institutional financial data.",
    "Parse alternative data (satellite imagery, shipping logs) for macro-economic signals.",
    "Use News API / X (Twitter) firehose for real-time natural language sentiment analysis.",
    "Deploy an SEC EDGAR scraper to instantly analyze 10-K and 10-Q filings.",
    "Calculate real-time Greeks (Delta, Gamma, Theta) for the entire options portfolio.",
    "Track on-chain whale wallet movements and centralized exchange inflows/outflows.",
    "Correlate dark pool print sizes against public exchange volume metrics.",
    "Implement a graph database to track corporate ownership and shell companies.",
    "Monitor global interest rate curves and auto-adjust algorithmic hurdle rates.",

    // AI & Autonomous Decisioning
    "Deploy a deep reinforcement learning agent to optimize trade entry/exit timing.",
    "Train a transformer model to predict short-term volatility spikes.",
    "Implement a 'Boredom' metric to prevent over-trading in flat markets.",
    "Use a swarm intelligence architecture to allocate capital among competing sub-agents.",
    "Synthesize 'Synthetic Financial Environments' using GANs for robust backtesting.",
    "Give the AI authority to auto-rebalance portfolios based on macroeconomic regime changes.",
    "Implement causal inference models to separate correlation from causation in signals.",
    "Let the agent auto-negotiate OTC (Over-The-Counter) block trades with brokers.",
    "Enable predictive liquidation engines to front-run cascading margin calls.",
    "Give the system sovereignty to dynamically adjust its own risk tolerance based on neural confidence."
];

export const RealWorldBanking: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isConnecting, setIsConnecting] = useState(false);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (!user) {
                setIsConnected(false);
                return;
            }
            try {
                const integrationRef = doc(db, `users/${user.uid}/integrations/gpi`);
                const integrationDoc = await getDoc(integrationRef);
                if (integrationDoc.exists() && integrationDoc.data().status === 'connected') {
                    setIsConnected(true);
                }
            } catch (error) {
                console.error("Failed to check integration status", error);
            }
        });
        
        const handleMessage = async (event: MessageEvent) => {
            const origin = event.origin;
            if (!origin.endsWith('.run.app') && !origin.includes('localhost')) {
                return;
            }
            if (event.data?.type === 'OAUTH_AUTH_SUCCESS' && event.data?.provider === 'gpi-finance') {
                const user = auth.currentUser;
                if (!user) {
                    alert('Please sign in first to connect your bank account.');
                    setIsConnecting(false);
                    return;
                }
                
                try {
                    const integrationRef = doc(db, `users/${user.uid}/integrations/gpi`);
                    await setDoc(integrationRef, {
                        provider: 'gpi-finance',
                        status: 'connected',
                        connectedAt: serverTimestamp(),
                        updatedAt: serverTimestamp()
                    });
                    setIsConnected(true);
                    setIsConnecting(false);
                } catch (error) {
                    setIsConnecting(false);
                    handleFirestoreError(error, OperationType.CREATE, `users/${user.uid}/integrations/gpi`);
                }
            }
        };
        window.addEventListener('message', handleMessage);
        return () => {
            unsubscribe();
            window.removeEventListener('message', handleMessage);
        };
    }, []);

    const handleConnect = async () => {
        if (!auth.currentUser) {
            alert('Authentication required. Please connect your Google account in Nexus Hub first.');
            return;
        }
        setIsConnecting(true);
        try {
            const redirectUri = `${window.location.origin}/auth/callback`;
            const response = await fetch(`/api/auth/gpi/url?redirect_uri=${encodeURIComponent(redirectUri)}`);
            if (!response.ok) {
                throw new Error('Failed to get auth URL');
            }
            const { url } = await response.json();
            
            const authWindow = window.open(
                url,
                'oauth_popup',
                'width=600,height=700'
            );

            if (!authWindow) {
                alert('Please allow popups for this site to connect your account.');
                setIsConnecting(false);
            }
        } catch (error) {
            console.error('OAuth error:', error);
            setIsConnecting(false);
        }
    };

    const filteredSuggestions = SUGGESTIONS.filter(s => 
        s.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex flex-col h-full bg-[#050505] text-slate-200 p-4 border-l border-cyan-900/30 overflow-y-auto custom-scrollbar relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500/20 via-cyan-400/80 to-cyan-500/20 shadow-[0_0_10px_rgba(34,211,238,0.5)] z-10" />
            
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                <div>
                    <h2 className="text-xl md:text-2xl font-bold font-orbitron tracking-widest text-cyan-400 uppercase glow-text-cyan flex items-center">
                        <span className="mr-3">🏦</span> Real-World Banking & Autonomy
                    </h2>
                    <p className="text-xs text-slate-500 font-mono mt-1">
                        50 Platform Improvement Directives for Sovereign Infrastructure
                    </p>
                </div>
                
                <div className="flex items-center">
                    {isConnected ? (
                        <div className="flex items-center gap-2 bg-cyan-900/20 border border-cyan-500/50 text-cyan-400 px-4 py-2 rounded font-mono text-xs shadow-[0_0_10px_rgba(34,211,238,0.2)]">
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                            </span>
                            $G_PI-Finance Connected
                        </div>
                    ) : (
                        <button 
                            onClick={handleConnect}
                            disabled={isConnecting}
                            className={`flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-300 px-4 py-2 rounded font-mono text-xs transition-colors ${isConnecting ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
                            {isConnecting ? 'Connecting...' : 'Link $G_PI-Finance'}
                        </button>
                    )}
                </div>
            </div>

            <div className="mb-6 relative">
                <input 
                    type="text" 
                    placeholder="Search directives..." 
                    className="w-full bg-black/50 border border-slate-700/50 rounded p-3 text-sm font-mono text-cyan-300 focus:outline-none focus:border-cyan-500 transition-colors"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredSuggestions.map((suggestion, index) => (
                    <div key={index} className="bg-[#0a0a0c] border border-slate-800 p-4 rounded hover:border-cyan-500/50 transition-colors group relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-cyan-900 group-hover:bg-cyan-500 transition-colors" />
                        <div className="flex gap-3">
                            <span className="text-cyan-500 font-mono text-xs opacity-50 mt-1">
                                {(SUGGESTIONS.indexOf(suggestion) + 1).toString().padStart(2, '0')}
                            </span>
                            <p className="text-sm font-mono text-slate-300 group-hover:text-cyan-100 transition-colors">
                                {suggestion}
                            </p>
                        </div>
                    </div>
                ))}
                
                {filteredSuggestions.length === 0 && (
                    <div className="col-span-1 md:col-span-2 text-center text-slate-600 font-mono py-10">
                        NO DIRECTIVES MATCHING YOUR QUERY.
                    </div>
                )}
            </div>
        </div>
    );
};

export default RealWorldBanking;
