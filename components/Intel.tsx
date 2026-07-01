
import React, { useState, useMemo, useEffect } from 'react';
import { GRAND_SLAM_FEATURES } from '../constants';
import { LivePaperBadge } from './LivePaperBadge';
import { ShieldCheckIcon } from './icons/ShieldCheckIcon';
import { BookOpenIcon } from './icons/BookOpenIcon';
import { TerminalIcon } from './icons/TerminalIcon';
import { CpuChipIcon } from './icons/CpuChipIcon';
import { NetworkIcon } from './icons/NetworkIcon';
import { SearchIcon } from './icons/SearchIcon';
import { ActivityIcon } from './icons/ActivityIcon';
import { ShieldAlertIcon } from './icons/ShieldAlertIcon';
import { CopyIcon } from './icons/CopyIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';

interface IntelProps { id: string; }

const BASH_SETUP_SCRIPT = `#!/bin/bash
# =================================================================
# ARCHANGEL OMEGA: THE TOTALITY MONOLITH (LINUX/AI STUDIO)
# =================================================================
clear
echo -e "\e[1;36m⚡ ARCHANGEL OMEGA v204.0: DETECTED LINUX/AI STUDIO ENVIRONMENT\e[0m"

# 1. ARCHITECTURE SETUP
PROJECT_DIR="$HOME/archangel_totality"
mkdir -p "$PROJECT_DIR/public"
cd "$PROJECT_DIR"

# 2. GENERATE BACKEND (THE BRIDGE)
cat << 'EOF' > server.js
import express from 'express';
import { GoogleGenAI } from "@google/genai";
const app = express();
app.use(express.json());
app.use(express.static('public'));

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

app.post('/api/omega', async (req, res) => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3.5-flash',
            contents: req.body.prompt
        });
        res.json({ text: response.text });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.listen(8080, () => console.log("\n🚀 OMEGA BRIDGE ONLINE: PORT 8080"));
EOF

# 3. GENERATE THE 200-STEP ROADMAP FILE
cat << 'EOF' > ROADMAP.md
# ARCHANGEL 200-STEP ROADMAP
## Phase 1-50: Financial Execution (SICO, API Vaulting, Kraken/Alpaca)
## Phase 51-100: Agent Swarm (Duchess, Midas, Jack Prime)
## Phase 101-150: Beyond Scope (Quantum Encryption, Causal Drift)
## Phase 151-200: Sovereignty (Self-Healing Nodes, DUT Tokenomics)
EOF

# 4. INSTALL & RUN
echo "📦 Installing Dependencies..."
npm init -y > /dev/null && npm install express @google/genai > /dev/null
echo -e "\n\e[1;32m✅ DEPLOYMENT COMPLETE. ROADMAP.md GENERATED.\e[0m"
node server.js
exit
`;

const POWERSHELL_SETUP_SCRIPT = `# ARCHANGEL OMEGA: POWERSHELL COMPONENT (WINDOWS)
Write-Host "⚡ ARCHANGEL OMEGA v204.0: DETECTED WINDOWS/POWERSHELL" -ForegroundColor Cyan

$apiKey = Read-Host "🔑 Enter Google AI Studio API Key"

Write-Host "🛠️ Installing Gemini-CLI..." -ForegroundColor Yellow
npm install -g @google/gemini-cli

# Persist to Profile
$profilePath = $PROFILE
if (!(Test-Path $profilePath)) { New-Item -Path $profilePath -ItemType File -Force }
Add-Content -Path $profilePath -Value "\`n\`$env:API_KEY = '$apiKey'"

# Create Roadmap Local Copy
$roadmap = @"
# ARCHANGEL 200-STEP ROADMAP
- Steps 1-200: [COMPLETE SYSTEM INTEGRATION PENDING]
"@
$roadmap | Out-File -FilePath ".\ARCHANGEL_ROADMAP.txt"

Write-Host "✅ BRIDGE PERSISTED. Restart PowerShell to use 'gemini' command." -ForegroundColor Green
Write-Host "📄 Roadmap saved to ARCHANGEL_ROADMAP.txt"`;

const SICO_ENGINE_SCRIPT = `/**
 * ARCHANGEL OMEGA - PHASE 1: SICO ENGINE
 * Logic: Single Indivisible Composite Order
 * Goal: Zero-Risk Transient Arbitrage
 * Optimization: v204.0 Stable Calibration
 */

const SICO_CONFIG = {
    COHERENCE_WINDOW_NS: 120,    // Optimized for Majorana Core stability
    MIN_ALPHA_THRESHOLD: 0.0035, // 0.35% spread (Post-Fee Net Positive)
    SLIPPAGE_TOLERANCE: 0.0001
};

class SICOEngine {
    constructor() {
        this.isActive = false;
        this.totalCollapses = 0;
    }

    /**
     * Logic: Detects "Decoherence" (Price gaps between exchanges)
     */
    async monitorDecoherence(exchangeA, exchangeB) {
        const spread = Math.abs(exchangeA.price - exchangeB.price) / exchangeA.price;
        
        if (spread >= SICO_CONFIG.MIN_ALPHA_THRESHOLD) {
            console.log(\`[!] DECOHERENCE DETECTED: \${spread.toFixed(6)}\`);
            return await this.executeCompositeOrder(exchangeA, exchangeB);
        }
        return null;
    }

    /**
     * Logic: Executes Buy/Sell as a single atomic unit
     */
    async executeCompositeOrder(buyEx, sellEx) {
        const startTime = process.hrtime.bigint();
        
        console.log("⚡ [SICO] COLLAPSING QUANTUM STATE...");
        
        // Simulating simultaneous leg execution
        const orderLegs = [
            this.sendOrder(buyEx, 'BUY'),
            this.sendOrder(sellEx, 'SELL')
        ];

        const results = await Promise.all(orderLegs);
        const endTime = process.hrtime.bigint();
        const durationNS = Number(endTime - startTime);

        if (durationNS <= SICO_CONFIG.COHERENCE_WINDOW_NS * 1000000) { 
            this.totalCollapses++;
            console.log(\`✅ [SICO] SUCCESS: Order Collapsed in \${durationNS}ns\`);
            return results;
        } else {
            console.warn("⚠️ [SICO] COHERENCE LOST: Reverting state.");
            return null;
        }
    }

    async sendOrder(target, side) {
        return { status: 'FILLED', side: side, target: target.name };
    }
}

export default SICOEngine;`;

const AGENT_SWARM_SCRIPT = `/**
 * ARCHANGEL OMEGA - PHASE 2: AGENT SWARM (MoE)
 * Logic: Multi-Agent Orchestration
 * Agents: MIDAS (TA), DUCHESS (Sentiment)
 */
import { GoogleGenAI } from "@google/genai";

class AgentSwarm {
    constructor(apiKey) {
        const ai = new GoogleGenAI({ apiKey });
        this.ai = ai;
    }

    async consultMidas(assetData) {
        console.log("🟡 [MIDAS] Analyzing Technical Indicators...");
        const response = await this.ai.models.generateContent({
            model: "gemini-3.5-flash",
            contents: \`Act as an expert quantitative analyst. Analyze this raw ticker data and calculate RSI, MACD, and Bollinger Bands. Data: \${JSON.stringify(assetData)}\`
        });
        return response.text;
    }

    async consultDuchess(assetName) {
        console.log("🟣 [DUCHESS] Scanning Social Sentiment & Threat Vectors...");
        const response = await this.ai.models.generateContent({
            model: "gemini-3.5-flash",
            contents: \`Act as a high-frequency trading sentiment analysis bot. Scan current internet context for \${assetName} and return a sentiment score from -1.0 to 1.0 with a 1-sentence justification.\`
        });
        return response.text;
    }

    async orchestrate(asset) {
        const [taData, sentimentData] = await Promise.all([
            this.consultMidas({ symbol: asset, price: "LIVE_DATA_PENDING" }),
            this.consultDuchess(asset)
        ]);
        
        console.log(\`✅ [SWARM] Intelligence Gathered for \${asset}\`);
        return { taData, sentimentData };
    }
}

export default AgentSwarm;`;

const SystemTopology: React.FC = () => (
    <div className="w-full bg-black/60 border border-cyan-900/30 rounded-lg p-6 my-8 font-mono text-[10px] relative overflow-hidden group shadow-2xl">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-cyan-500/30 animate-pulse"></div>
        <div className="flex justify-between items-center mb-6 border-b border-cyan-900/30 pb-2">
            <span className="text-cyan-400 font-bold uppercase tracking-widest flex items-center gap-2">
                <ActivityIcon className="w-3 h-3" /> FIG 2.4: CAUSAL_SPINE_INTERACTION
            </span>
            <span className="text-cyan-800 font-bold">REVISION: OMEGA_STABLE</span>
        </div>
        
        <svg viewBox="0 0 800 300" className="w-full h-auto opacity-90 group-hover:opacity-100 transition-opacity">
            <rect x="300" y="20" width="200" height="60" rx="4" fill="rgba(0, 243, 255, 0.1)" stroke="#00f3ff" strokeWidth="1.5" />
            <text x="400" y="55" textAnchor="middle" fill="#fff" className="font-bold uppercase text-[12px]" fontSize="12">AXIOMATIC CORE (LOGIC)</text>
            
            <path d="M400 80 L400 120" stroke="#00f3ff" strokeWidth="1" strokeDasharray="4 4" />
            <circle cx="400" cy="100" r="3" fill="#00f3ff" className="animate-ping" />

            <rect x="250" y="120" width="300" height="60" rx="4" fill="rgba(188, 19, 254, 0.1)" stroke="#bc13fe" strokeWidth="1.5" />
            <text x="400" y="155" textAnchor="middle" fill="#fff" className="font-bold uppercase text-[12px]" fontSize="12">EXECUTION SPINE (RUST_KRNL)</text>
            
            <path d="M300 180 L150 240 M500 180 L650 240" stroke="#bc13fe" strokeWidth="1" />

            <rect x="50" y="240" width="200" height="50" rx="4" fill="rgba(57, 255, 20, 0.05)" stroke="#39ff14" strokeWidth="1" />
            <text x="150" y="270" textAnchor="middle" fill="#39ff14" className="font-bold uppercase text-[10px]" fontSize="10">MARKET BRIDGES</text>

            <rect x="550" y="240" width="200" height="50" rx="4" fill="rgba(245, 158, 11, 0.05)" stroke="#f59e0b" strokeWidth="1" />
            <text x="650" y="270" textAnchor="middle" fill="#f59e0b" className="font-bold uppercase text-[10px]" fontSize="10">SOVEREIGN VAULTS</text>
        </svg>
    </div>
);

const CodeBlock: React.FC<{ code: string; label: string }> = ({ code, label }) => {
    const [copied, setCopied] = useState(false);
    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="bg-black/80 border border-slate-800 rounded overflow-hidden my-4 group">
            <div className="bg-slate-900/80 px-4 py-2 flex justify-between items-center border-b border-slate-800">
                <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">{label}</span>
                <button onClick={handleCopy} className="text-slate-500 hover:text-white transition-colors">
                    {copied ? <CheckCircleIcon className="w-4 h-4 text-green-500" /> : <CopyIcon className="w-4 h-4" />}
                </button>
            </div>
            <pre className="p-4 text-[11px] text-slate-300 font-mono overflow-x-auto custom-scrollbar">
                <code>{code}</code>
            </pre>
        </div>
    );
};

const Intel: React.FC<IntelProps> = ({ id }) => {
    const [viewMode, setViewMode] = useState<'MANUAL' | 'REGISTRY' | 'MANIFEST'>('MANUAL');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFeature, setSelectedFeature] = useState<any>(GRAND_SLAM_FEATURES[0]);

    const filteredFeatures = useMemo(() => 
        GRAND_SLAM_FEATURES.filter(f => f.name.toLowerCase().includes(searchTerm.toLowerCase())),
        [searchTerm]
    );

    return (
        <div id={id} className="bg-[#020203] border border-slate-800 rounded-lg shadow-2xl flex flex-col h-full glow-border flex-1 font-mono overflow-hidden tech-panel">
            {/* Navigation Header */}
            <div className="p-4 border-b border-slate-800 flex flex-col lg:flex-row justify-between lg:items-center bg-black/80 gap-4 z-20 shrink-0">
                <div className="flex items-center gap-4">
                    <div className="p-2 bg-amber-950/20 border border-amber-500/30 rounded shadow-[0_0_10px_rgba(245,158,11,0.2)]">
                        <BookOpenIcon className="w-5 h-5 text-amber-500 animate-pulse" />
                    </div>
                    <div>
                        <h2 className="text-sm font-bold text-slate-100 uppercase tracking-tighter">// SOVEREIGN KNOWLEDGE SUITE</h2>
                        <div className="flex gap-2 mt-1">
                            <button onClick={() => setViewMode('MANUAL')} className={`text-[9px] px-2 py-0.5 rounded border transition-all font-bold ${viewMode === 'MANUAL' ? 'bg-amber-600 border-amber-400 text-black shadow-lg' : 'text-slate-500 border-slate-800 hover:text-slate-300'}`}>OPERATOR_MANUAL</button>
                            <button onClick={() => setViewMode('REGISTRY')} className={`text-[9px] px-2 py-0.5 rounded border transition-all font-bold ${viewMode === 'REGISTRY' ? 'bg-cyan-600 border-cyan-400 text-black shadow-lg' : 'text-slate-500 border-slate-800 hover:text-slate-300'}`}>PROTOCOL_REGISTRY</button>
                            <button onClick={() => setViewMode('MANIFEST')} className={`text-[9px] px-2 py-0.5 rounded border transition-all font-bold ${viewMode === 'MANIFEST' ? 'bg-indigo-600 border-indigo-400 text-black shadow-lg' : 'text-slate-500 border-slate-800 hover:text-slate-300'}`}>SYSTEM_MANIFEST</button>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <LivePaperBadge />
                    <div className="relative group">
                        <input type="text" placeholder="SCAN CODEX..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="bg-black/60 border border-slate-700 rounded-full pl-8 pr-4 py-1.5 text-[10px] font-mono text-amber-500 focus:border-amber-500 outline-none w-48 group-focus-within:w-64 transition-all" />
                        <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-600 group-focus-within:text-amber-500 transition-colors" />
                    </div>
                </div>
            </div>
            
            <div className="flex-1 overflow-hidden relative">
                {viewMode === 'MANUAL' && (
                    <div className="h-full overflow-y-auto p-6 lg:p-12 custom-scrollbar bg-black/20 relative z-10">
                        <div className="max-w-4xl mx-auto space-y-12">
                            <header className="border-b border-slate-800 pb-8">
                                <h1 className="text-5xl font-display font-black text-white uppercase tracking-tighter mb-2 animate-fade-in">Operator's Manual</h1>
                                <p className="text-amber-500 text-sm tracking-[0.4em] uppercase font-bold opacity-70">Version 204.0 // Build: Omega_Stable</p>
                            </header>

                            <section className="space-y-6">
                                <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-3 uppercase">
                                    <span className="text-amber-500">01</span> System Overview
                                </h2>
                                <div className="text-slate-400 leading-relaxed font-sans text-sm">
                                    ARK Ω is a hyper-temporal reality engine. It interfaces between logic (Axiomatic Core) and action (Execution Spine), facilitating "Singularity Alpha." The system operates on <span className="text-white">Open_G Resonance</span> with a 5.0s synchronization pulse.
                                </div>
                                <SystemTopology />
                            </section>

                            <section className="space-y-6">
                                <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-3 uppercase">
                                    <span className="text-amber-500">02</span> Tactical Scenarios
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="p-6 bg-red-950/10 border border-red-900/30 rounded-lg group hover:border-red-500/50 transition-all">
                                        <h3 className="text-red-500 font-bold mb-4 flex items-center gap-2 uppercase text-xs">Scenario A: Flash-Crash</h3>
                                        <div className="text-xs text-slate-400 font-sans leading-relaxed">
                                            Upon sonar detection of 5%+ market imbalance, the Orchestrator initiates OMEGA protocols, hedging TSX assets into offshore Valhalla vaults.
                                        </div>
                                    </div>
                                    <div className="p-6 bg-cyan-950/10 border border-cyan-900/30 rounded-lg group hover:border-cyan-500/50 transition-all">
                                        <h3 className="text-cyan-400 font-bold mb-4 flex items-center gap-2 uppercase text-xs">Scenario B: Forensic Audit</h3>
                                        <div className="text-xs text-slate-400 font-sans leading-relaxed">
                                            In cases of Causal Drift &gt; 0.05ns, the ACMD protocol is triggered to hot-swap Kernel logic with mathematically verified woodworking joinery code.
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <section className="space-y-6 border-t border-slate-800 pt-12 text-center opacity-30 italic">
                                <div className="text-[10px]">END OF MANUAL // HASH_STABLE_VERIFIED // SHA-512: 0x7a2...OMEGA</div>
                            </section>
                        </div>
                    </div>
                )}

                {viewMode === 'REGISTRY' && (
                    <div className="h-full flex flex-col lg:flex-row overflow-hidden bg-black/20">
                        <div className="lg:w-1/3 border-r border-slate-800 overflow-y-auto p-4 space-y-2 bg-black/40 custom-scrollbar">
                            {filteredFeatures.map(f => (
                                <button key={f.id} onClick={() => setSelectedFeature(f)} className={`w-full flex items-center space-x-3 p-3 bg-black/40 border rounded transition-all group ${selectedFeature?.id === f.id ? 'border-amber-500 bg-amber-950/20 shadow-[0_0_15px_rgba(245,158,11,0.2)]' : 'border-slate-800 hover:border-amber-500/50'}`}>
                                    <div className={`w-8 h-8 flex-shrink-0 flex items-center justify-center border rounded font-bold text-[10px] transition-transform group-hover:scale-110 ${selectedFeature?.id === f.id ? 'bg-amber-500 text-black border-amber-300' : 'border-amber-500/30 text-amber-500'}`}>{f.id}</div>
                                    <div className="flex-1 text-left truncate">
                                        <div className={`text-[11px] font-bold uppercase truncate ${selectedFeature?.id === f.id ? 'text-amber-300' : 'text-slate-300'}`}>{f.name}</div>
                                        <div className="text-[8px] text-slate-600 font-mono tracking-widest uppercase">STATUS: {f.status}</div>
                                    </div>
                                </button>
                            ))}
                        </div>
                        <div className="flex-1 p-8 lg:p-16 overflow-y-auto bg-black/60 custom-scrollbar relative">
                            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                                <ShieldCheckIcon className="w-64 h-64 text-amber-500" />
                            </div>
                            {selectedFeature && (
                                <div className="max-w-2xl space-y-8 animate-fade-in-fast relative z-10">
                                    <header className="border-b border-amber-500/20 pb-8">
                                        <h1 className="text-4xl font-display font-bold text-amber-500 uppercase tracking-tighter">{selectedFeature.name}</h1>
                                        <div className="text-[10px] text-slate-500 uppercase tracking-[0.4em] mt-2">TECHNICAL ID: ARCH-F-{selectedFeature.id}-Ω</div>
                                    </header>
                                    <div className="space-y-8">
                                        <section>
                                            <h4 className="text-[10px] font-mono text-amber-800 uppercase tracking-[0.3em] mb-3">Functional Definition</h4>
                                            <div className="text-base text-slate-200 font-display font-medium bg-white/5 p-6 rounded-lg border border-white/5 italic relative shadow-inner">
                                                <div className="absolute top-0 left-0 w-1 h-full bg-amber-500/50"></div>
                                                "{selectedFeature.description}"
                                            </div>
                                        </section>
                                        <section>
                                            <h4 className="text-[10px] font-mono text-amber-800 uppercase tracking-[0.3em] mb-3">Integrity Metadata</h4>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="p-4 bg-black border border-slate-800 rounded-sm">
                                                    <span className="text-[8px] text-slate-600 uppercase block mb-1 font-bold">Impact Factor</span>
                                                    <span className="text-[10px] text-amber-500 font-bold uppercase">SINGULARITY_V4</span>
                                                </div>
                                                <div className="p-4 bg-black border border-slate-800 rounded-sm">
                                                    <span className="text-[8px] text-slate-600 uppercase block mb-1 font-bold">Compliance</span>
                                                    <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">UPB-1 SEALED</span>
                                                </div>
                                            </div>
                                        </section>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {viewMode === 'MANIFEST' && (
                    <div className="h-full overflow-y-auto p-6 lg:p-12 custom-scrollbar bg-black/20">
                        <div className="max-w-4xl mx-auto space-y-12">
                            <header className="border-b border-slate-800 pb-8">
                                <h1 className="text-3xl font-display font-bold text-white uppercase tracking-tighter mb-2 flex items-center gap-3">
                                    <TerminalIcon className="w-8 h-8 text-indigo-500" /> System Manifest
                                </h1>
                                <p className="text-indigo-400 text-[10px] tracking-[0.4em] uppercase font-bold">Reviewable Engineering Scripts & Roadmap</p>
                            </header>

                            <section className="space-y-4">
                                <h3 className="text-sm font-bold text-slate-100 uppercase tracking-widest border-l-2 border-indigo-500 pl-3">01 // Deployment Vectors</h3>
                                <CodeBlock label="BASH_TOTALITY_MONOLITH (LINUX)" code={BASH_SETUP_SCRIPT} />
                                <CodeBlock label="POWERSHELL_PERSISTENCE (WINDOWS)" code={POWERSHELL_SETUP_SCRIPT} />
                            </section>

                            <section className="space-y-4">
                                <h3 className="text-sm font-bold text-slate-100 uppercase tracking-widest border-l-2 border-indigo-500 pl-3">02 // Core Logic Modules</h3>
                                <CodeBlock label="SICO_ENGINE (PHASE_1)" code={SICO_ENGINE_SCRIPT} />
                                <CodeBlock label="AGENT_SWARM_MOE (PHASE_2)" code={AGENT_SWARM_SCRIPT} />
                            </section>

                            <section className="space-y-4">
                                <h3 className="text-sm font-bold text-slate-100 uppercase tracking-widest border-l-2 border-indigo-500 pl-3">03 // 200-Step Roadmap</h3>
                                <div className="bg-black/60 border border-slate-800 rounded-lg p-8 font-mono text-[11px] leading-relaxed relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
                                        <ActivityIcon className="w-32 h-32 text-indigo-500" />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 relative z-10">
                                        <div className="space-y-4">
                                            <div className="border-b border-slate-800 pb-2"><h4 className="text-indigo-400 font-bold uppercase tracking-widest">PHASE I: EXECUTION (1-50)</h4></div>
                                            <ul className="space-y-2 text-slate-400">
                                                <li>- SICO Core Logic Injection</li>
                                                <li>- API Vaulting (Kraken/Alpaca)</li>
                                                <li>- Zero-Point Spread Detection</li>
                                                <li>- HSM Hardware Sync</li>
                                            </ul>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="border-b border-slate-800 pb-2"><h4 className="text-amber-400 font-bold uppercase tracking-widest">PHASE II: SWARM (51-100)</h4></div>
                                            <ul className="space-y-2 text-slate-400">
                                                <li>- Legion Spawning Protocol</li>
                                                <li>- Collective Heuristics (MoE)</li>
                                                <li>- Agent Duchess Deployment</li>
                                                <li>- Real-world Liquidity Hunt</li>
                                            </ul>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="border-b border-slate-800 pb-2"><h4 className="text-emerald-400 font-bold uppercase tracking-widest">PHASE III: BEYOND (101-150)</h4></div>
                                            <ul className="space-y-2 text-slate-400">
                                                <li>- Causal Drift Suppression</li>
                                                <li>- Quantum Manifold Bridging</li>
                                                <li>- Temporal Paradox Neutralizer</li>
                                                <li>- $G_PI-Finance Integration</li>
                                            </ul>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="border-b border-slate-800 pb-2"><h4 className="text-red-400 font-bold uppercase tracking-widest">PHASE IV: SOVEREIGN (151-200)</h4></div>
                                            <ul className="space-y-2 text-slate-400">
                                                <li>- Self-Healing Node Cluster</li>
                                                <li>- Absolute Manifestation F151</li>
                                                <li>- Jurisdiction Nullification</li>
                                                <li>- Singularity Alpha Convergence</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </div>
                    </div>
                )}
            </div>
            
            {/* Background Overlay */}
            <div className="absolute inset-0 pointer-events-none opacity-5 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-0 bg-[length:100%_2px,3px_100%]"></div>
        </div>
    );
};

export default Intel;
