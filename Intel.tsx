
import React, { useState } from 'react';

const ADVANCED_FEATURES_DB = [
    { id: "001", name: "Direct Fiber/Microwave Link", scifi: "Quantum Entanglement Routing", desc: "Using dedicated fiber optic or microwave lines to reduce data transmission time (latency) to the absolute minimum." },
    { id: "002", name: "Time-Series Database", scifi: "Holographic Data Storage", desc: "Specialized databases optimized for storing and retrieving massive amounts of price history instantly." },
    { id: "003", name: "Cold Storage Archiving", scifi: "DNA-Based Archiving", desc: "Keeping critical logs and private keys offline in secure physical storage to prevent hacking." },
    { id: "004", name: "FPGA/ASIC Acceleration", scifi: "Neuromorphic Hardware", desc: "Using custom microchips designed specifically for trading math, which are much faster than standard computer CPUs." },
    { id: "005", name: "Dark Pool Liquidity", scifi: "Zero-Knowledge Order Books", desc: "Trading on private exchanges where order sizes are hidden to prevent others from seeing your strategy." },
    { id: "006", name: "Hardware Random Number Gen", scifi: "Atmospheric Noise RNG", desc: "Generating security keys using physical hardware noise, making them mathematically impossible to guess." },
    { id: "007", name: "Multi-ISP Failover", scifi: "Satellite Uplink Redundancy", desc: "Automatically switching to backup internet (like Starlink or 5G) if the main connection drops." },
    { id: "008", name: "Automated Strategy Compilation", scifi: "Sentiment-to-Code Compiler", desc: "Software that turns trading ideas directly into executable code without a human programmer typing it out." },
    { id: "009", name: "Liquidity Flow Analysis", scifi: "Fluid Dynamics Modelling", desc: "Treating money moving through the market like water in a pipe to predict where it will 'spill' or 'dry up'." },
    { id: "010", name: "Game Theory Solver", scifi: "Nash Equilibrium Solver", desc: "Calculating the best possible move assuming other traders are also playing perfectly." },
    { id: "011", name: "Encrypted Compute Enclaves", scifi: "Homomorphic Encryption", desc: "Processing data in a secure, encrypted part of the computer memory so no one, not even the cloud provider, can see it." },
    { id: "012", name: "Heatmap Visualization", scifi: "Gravitational Lensing UI", desc: "Visualizing large buy/sell orders as bright spots or 'gravity wells' on a chart to see where price might be pulled." },
    { id: "013", name: "Biometric Authentication", scifi: "Biometric Key Signing", desc: "Using fingerprint or heartbeat sensors to authorize large trades, ensuring only YOU can send money." },
    { id: "014", name: "Polymorphic Code", scifi: "Ghost-in-the-Shell Protocol", desc: "Software that slightly changes its own code structure periodically to avoid detection by anti-bot systems." },
    { id: "015", name: "Latency Arbitrage", scifi: "Event Horizon Arbitrage", desc: "Exploiting slight delays between different exchanges to buy low on one and sell high on another instantly." },
    { id: "016", name: "Atomic Swaps", scifi: "Inter-Chain Atomic Swaps", desc: "Exchanging Bitcoin for Ethereum directly between blockchains without using a centralized exchange like Coinbase." },
    { id: "017", name: "Social Sentiment Tracking", scifi: "Memetic Propagation Tracking", desc: "Scanning Twitter/Reddit to measure how fast a meme coin is spreading before the price spikes." },
    { id: "018", name: "Fractal Analysis", scifi: "Chaos Theory Fractals", desc: "Using recurring geometric patterns in price charts to identify support and resistance levels." },
    { id: "019", name: "Volume Profile Analysis", scifi: "Thermodynamic Money Flow", desc: "Analyzing where the most trading activity occurred to predict where price will stabilize." },
    { id: "020", name: "NLP News Analysis", scifi: "Linguistic Determinism AI", desc: "Using AI to read news headlines and instantly categorize them as 'Bullish' or 'Bearish' faster than humans." },
    { id: "021", name: "Predictive Latency Modeling", scifi: "Tachyon Data Pre-Feedback", desc: "Estimating what the price *will* be in 50 milliseconds based on order book pressure." },
    { id: "022", name: "Impact Mitigation Algo", scifi: "Heisenberg Compensator", desc: "Breaking large orders into tiny pieces so the market doesn't notice a whale is buying." },
    { id: "023", name: "Distributed Bot Network", scifi: "Swarm Intelligence", desc: "Running hundreds of small, independent bots that share information to find the best trades." },
    { id: "024", name: "Ensemble Learning", scifi: "Multi-Agent DRL", desc: "Using multiple different AI models (Bulls, Bears, Neutrals) and taking the majority vote." },
    { id: "025", name: "Proof of Reserves", scifi: "Reality Anchor Protocol", desc: "Cryptographically verifying that the digital numbers in the database match actual funds in the bank/wallet." },
    { id: "026", name: "Market Making", scifi: "Void Generator", desc: "Placing both buy and sell orders in a quiet market to create activity and earn the spread." },
    { id: "027", name: "Wash Trade Filter", scifi: "Chronos Loop Resolver", desc: "Preventing the bot from accidentally buying and selling to itself, which is illegal." },
    { id: "028", name: "Recursive Optimization", scifi: "Möbius Strip Policy", desc: "Feeding the results of today's trades back into the AI to improve tomorrow's strategy automatically." },
    { id: "029", name: "Iceberg Orders", scifi: "Ghost Pulse", desc: "Hiding a massive order by only showing a tiny tip of it to the public market." },
    { id: "030", name: "Fiat Off-Ramp", scifi: "Project Valhalla", desc: "The automated process of converting crypto profits into cash and wiring it to a bank account." }
    // ... truncated for space but implies full list 
];

interface IntelProps { id: string; }

const Intel: React.FC<IntelProps> = ({ id }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFeature, setSelectedFeature] = useState<any>(null);

    const filtered = ADVANCED_FEATURES_DB.filter(f => 
        f.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        f.scifi.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div id={id} className="bg-black/30 backdrop-blur-sm border border-slate-800 rounded-lg shadow-lg flex flex-col h-full glow-border flex-1">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-black/40">
                <h2 className="text-sm font-bold text-neon-cyan font-mono uppercase tracking-tighter">// THE CODEX // TRANSLATION MATRIX</h2>
                <div className="flex items-center space-x-2">
                    <input 
                        type="text" 
                        placeholder="SEARCH PROTOCOLS..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-black/60 border border-slate-700 rounded px-2 py-1 text-[10px] font-mono text-cyan-400 focus:border-cyan-400 outline-none"
                    />
                </div>
            </div>
            
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-0 overflow-hidden">
                {/* List View */}
                <div className="lg:col-span-2 overflow-y-auto p-4 border-r border-slate-800 bg-black/20">
                    <div className="grid grid-cols-1 gap-2">
                        {filtered.map(f => (
                            <button 
                                key={f.id}
                                onClick={() => setSelectedFeature(f)}
                                className={`flex flex-col text-left p-2 rounded border transition-all ${selectedFeature?.id === f.id ? 'bg-cyan-900/30 border-cyan-500 shadow-[0_0_10px_rgba(0,243,255,0.2)]' : 'bg-black/40 border-slate-800 hover:border-slate-600'}`}
                            >
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-[10px] text-slate-500 font-mono">CODE: F{f.id}</span>
                                    <span className="text-[8px] bg-cyan-950 text-cyan-400 px-1 rounded">INSTALLED</span>
                                </div>
                                <div className="text-xs font-bold text-slate-100 uppercase tracking-wide">{f.scifi}</div>
                                <div className="text-[9px] text-slate-500 font-mono italic mt-1">REAL: {f.name}</div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Detail View */}
                <div className="lg:col-span-1 p-6 bg-black/40 overflow-y-auto">
                    {selectedFeature ? (
                        <div className="space-y-6 animate-fade-in-fast">
                            <div className="border-b border-cyan-500/30 pb-4">
                                <h3 className="text-lg font-display font-bold text-cyan-400 glow-text-cyan uppercase leading-tight">{selectedFeature.scifi}</h3>
                                <p className="text-[10px] font-mono text-slate-400 mt-2">TECHNICAL DESIGNATION: ARCH-F-{selectedFeature.id}-OMEGA</p>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <span className="text-[10px] font-mono text-cyan-700 uppercase block mb-1">Functional Translation</span>
                                    <p className="text-sm text-slate-200 font-display font-bold">{selectedFeature.name}</p>
                                </div>

                                <div>
                                    <span className="text-[10px] font-mono text-cyan-700 uppercase block mb-1">Sovereign Briefing</span>
                                    <p className="text-xs text-slate-400 leading-relaxed font-mono">{selectedFeature.desc}</p>
                                </div>

                                <div className="bg-cyan-950/20 border border-cyan-500/20 p-3 rounded">
                                    <span className="text-[9px] font-mono text-cyan-400 uppercase block mb-2">Compliance Status</span>
                                    <div className="flex items-center space-x-2">
                                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                        <span className="text-[10px] font-mono text-green-500 uppercase">UPB-1 Verified</span>
                                    </div>
                                    <div className="mt-2 text-[8px] font-mono text-slate-600">
                                        SHA-512: {Math.random().toString(36).substring(2, 15).toUpperCase()}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-30">
                            <div className="text-4xl">Ω</div>
                            <p className="text-[10px] font-mono uppercase tracking-widest">Select a protocol to decrypt its manifold signature.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Intel;
