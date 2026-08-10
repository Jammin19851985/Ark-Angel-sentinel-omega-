import React, { useState, useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { BrainCircuit, Network, Cpu, Shield, Activity, Coins, Users, ArrowRightLeft, FastForward, BookOpen, Code, Layers, LineChart, Omega, ScatterChart, Percent, Crosshair, Zap, CalendarDays, Gift, RefreshCw, Globe, Grid, Bomb, UserCheck, Sliders, Dices, Radio, Search, BarChart2 } from 'lucide-react';

const OmniCoreAgent: React.FC<{ id?: string }> = ({ id }) => {
    const [activeEngine, setActiveEngine] = useState<string>('ML_ENSEMBLE');
    const [pulse, setPulse] = useState(false);
    const [operationalMode, setOperationalMode] = useState<'inference' | 'monitoring'>('inference');
    const [modeTransition, setModeTransition] = useState<boolean>(false);
    const [isDeepScanning, setIsDeepScanning] = useState<boolean>(false);
    const [scanProgress, setScanProgress] = useState<number>(0);
    const [quantumDecoherenceData, setQuantumDecoherenceData] = useState<Array<{ time: string; rate: number; noise: number; fidelity: number }>>([
        { time: '00:00', rate: 0.042, noise: 0.012, fidelity: 99.85 },
        { time: '00:02', rate: 0.048, noise: 0.015, fidelity: 99.78 },
        { time: '00:04', rate: 0.039, noise: 0.010, fidelity: 99.91 },
        { time: '00:06', rate: 0.055, noise: 0.022, fidelity: 99.64 },
        { time: '00:08', rate: 0.041, noise: 0.011, fidelity: 99.88 },
        { time: '00:10', rate: 0.037, noise: 0.009, fidelity: 99.93 },
    ]);
    const { addLog } = useAppContext();

    useEffect(() => {
        const interval = setInterval(() => setPulse(p => !p), 2000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        setModeTransition(true);
        const timer = setTimeout(() => setModeTransition(false), 1000);
        return () => clearTimeout(timer);
    }, [operationalMode]);

    const handleDeepSystemScan = () => {
        setIsDeepScanning(true);
        setScanProgress(0);
        addLog?.('QUANTUM', 'Initiating Deep System Scan: Measuring quantum decoherence rates across q-bits...');
        
        let current = 0;
        const timer = setInterval(() => {
            current += 20;
            setScanProgress(current);
            if (current >= 100) {
                clearInterval(timer);
                setIsDeepScanning(false);
                const now = new Date();
                const timeStr = `${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
                const newRate = Number((0.03 + Math.random() * 0.03).toFixed(3));
                const newNoise = Number((0.008 + Math.random() * 0.015).toFixed(3));
                const newFidelity = Number((99.5 + Math.random() * 0.48).toFixed(2));
                
                setQuantumDecoherenceData(prev => [
                    ...prev.slice(-7),
                    { time: timeStr, rate: newRate, noise: newNoise, fidelity: newFidelity }
                ]);
                setActiveEngine('QUANTUM_DECOHERENCE');
                addLog?.('QUANTUM', `Deep System Scan Complete — Mean Decoherence Rate: ${newRate} ms⁻¹ | Fidelity: ${newFidelity}%`);
            }
        }, 350);
    };

    const engines = [
        { id: 'ML_ENSEMBLE', name: 'ML Ensemble', icon: BrainCircuit, color: 'text-cyan-400', borderColor: 'border-cyan-500' },
        { id: 'QUANTUM_DECOHERENCE', name: 'Quantum Scan', icon: Radio, color: 'text-rose-400', borderColor: 'border-rose-500' },
        { id: 'REGIME_DETECT', name: 'Regime Detect', icon: Network, color: 'text-amber-400', borderColor: 'border-amber-500' },
        { id: 'SENTIMENT_NLP', name: 'Sentiment NLP', icon: Cpu, color: 'text-fuchsia-400', borderColor: 'border-fuchsia-500' },
        { id: 'DARK_POOL', name: 'Dark Pool', icon: Shield, color: 'text-rose-400', borderColor: 'border-rose-500' },
        { id: 'VOL_SURFACE', name: 'Vol Surface', icon: Activity, color: 'text-violet-400', borderColor: 'border-violet-500' },
        { id: 'CRYPTO_DEFI', name: 'Crypto DeFi', icon: Coins, color: 'text-emerald-400', borderColor: 'border-emerald-500' },
        { id: 'SOCIAL_COPY', name: 'Social Copy', icon: Users, color: 'text-blue-400', borderColor: 'border-blue-500' },
        { id: 'CROSS_ARB', name: 'Cross Arb', icon: ArrowRightLeft, color: 'text-yellow-400', borderColor: 'border-yellow-500' },
        { id: 'BACKTEST', name: 'Backtest', icon: FastForward, color: 'text-orange-400', borderColor: 'border-orange-500' },
        { id: 'JOURNAL', name: 'Trade Journal', icon: BookOpen, color: 'text-indigo-400', borderColor: 'border-indigo-500' },
        { id: 'DSL', name: 'Strategy DSL', icon: Code, color: 'text-pink-400', borderColor: 'border-pink-500' },
        { id: 'WALK_FORWARD', name: 'Walk Forward', icon: Layers, color: 'text-teal-400', borderColor: 'border-teal-500' },
        { id: 'MARKET_MAKING', name: 'Market Making', icon: LineChart, color: 'text-lime-400', borderColor: 'border-lime-500' },
        { id: 'GREEKS_HEDGE', name: 'Greeks Hedge', icon: Omega, color: 'text-sky-400', borderColor: 'border-sky-500' },
        { id: 'DISPERSION', name: 'Dispersion', icon: ScatterChart, color: 'text-purple-400', borderColor: 'border-purple-500' },
        { id: 'FUNDING_ARB', name: 'Funding Arb', icon: Percent, color: 'text-yellow-200', borderColor: 'border-yellow-300' },
        { id: 'LIQUIDATION_SNIPE', name: 'Liq Sniping', icon: Crosshair, color: 'text-red-400', borderColor: 'border-red-500' },
        { id: 'FLASH_LOAN', name: 'Flash Loan', icon: Zap, color: 'text-yellow-500', borderColor: 'border-yellow-600' },
        { id: 'EARNINGS_CAL', name: 'Earnings', icon: CalendarDays, color: 'text-blue-300', borderColor: 'border-blue-400' },
        { id: 'DIVIDEND_CAP', name: 'Dividends', icon: Gift, color: 'text-emerald-300', borderColor: 'border-emerald-400' },
        { id: 'SECTOR_ROT', name: 'Sector Rotate', icon: RefreshCw, color: 'text-indigo-300', borderColor: 'border-indigo-400' },
        { id: 'ECON_CAL', name: 'Econ Calendar', icon: Globe, color: 'text-cyan-300', borderColor: 'border-cyan-400' },
        { id: 'CORR_MATRIX', name: 'Correlation', icon: Grid, color: 'text-amber-300', borderColor: 'border-amber-400' },
        { id: 'STRESS_TEST', name: 'Stress Test', icon: Bomb, color: 'text-rose-500', borderColor: 'border-rose-600' },
        { id: 'BEHAVIORAL', name: 'Behavioral', icon: UserCheck, color: 'text-fuchsia-300', borderColor: 'border-fuchsia-400' },
        { id: 'ADAPTIVE_OPT', name: 'Adaptive Opt', icon: Sliders, color: 'text-slate-300', borderColor: 'border-slate-400' },
        { id: 'MONTE_CARLO', name: 'Monte Carlo', icon: Dices, color: 'text-violet-300', borderColor: 'border-violet-400' },
    ];

    return (
        <div id={id} className={`tech-panel holographic-panel flex flex-col h-full bg-black/40 overflow-hidden relative p-4 group transition-all duration-1000 ${
            modeTransition 
                ? (operationalMode === 'inference' 
                    ? 'ring-2 ring-cyan-500/80 shadow-[0_0_30px_rgba(6,182,212,0.5)] border-cyan-400' 
                    : 'ring-2 ring-amber-500/80 shadow-[0_0_30px_rgba(245,158,11,0.5)] border-amber-400')
                : ''
        }`}>
            {/* Periodic red heartbeat glow aura layer */}
            <div className={`absolute inset-0 pointer-events-none rounded-lg transition-all duration-1000 z-10 ${
                pulse 
                    ? 'shadow-[inset_0_0_25px_rgba(239,68,68,0.22),0_0_20px_rgba(239,68,68,0.18)] border border-red-500/30' 
                    : 'shadow-none border-transparent'
            }`} />

            {/* Transient mode-switch flash overlay */}
            <div className={`absolute inset-0 pointer-events-none transition-all duration-1000 z-20 ${
                modeTransition ? 'opacity-15 scale-100' : 'opacity-0 scale-95'
            } ${
                operationalMode === 'inference' ? 'bg-cyan-500/40' : 'bg-amber-500/40'
            }`} />

            {/* 3D Holographic Base Grid */}
            <div className="absolute inset-0 pointer-events-none opacity-20" style={{
                backgroundImage: `linear-gradient(rgba(0, 243, 255, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 243, 255, 0.2) 1px, transparent 1px)`,
                backgroundSize: '20px 20px',
                transform: 'perspective(500px) rotateX(60deg) translateY(100px) scale(2)',
                transformOrigin: 'bottom center'
            }}></div>

            <div className="flex flex-wrap justify-between items-center mb-3 relative z-20 border-b border-cyan-500/30 pb-2 gap-2">
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${pulse ? 'bg-cyan-400 shadow-[0_0_8px_#00f3ff]' : 'bg-cyan-900'} transition-colors duration-500`}></div>
                    <h2 className="text-[10px] font-bold text-cyan-400 font-mono tracking-widest uppercase shadow-cyan">OmniCore v6.0.1-OMEGA</h2>
                </div>

                <div className="flex items-center gap-2">
                    {/* Active Heartbeat Badge */}
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-red-950/40 border border-red-500/30 shadow-[0_0_10px_rgba(239,68,68,0.2)]">
                        <span className={`w-1.5 h-1.5 rounded-full bg-red-500 transition-all duration-500 ${pulse ? 'scale-125 shadow-[0_0_8px_#ef4444]' : 'scale-90 opacity-60'}`} />
                        <span className="text-[8px] font-mono text-red-400 font-bold tracking-wider">HEARTBEAT</span>
                    </div>

                    {/* Diagnostic Deep System Scan Button */}
                    <button
                        onClick={handleDeepSystemScan}
                        disabled={isDeepScanning}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[8px] font-mono font-bold uppercase transition-all duration-300 border ${
                            isDeepScanning
                                ? 'bg-rose-950/80 text-rose-300 border-rose-500/60 shadow-[0_0_12px_rgba(244,63,94,0.4)] animate-pulse'
                                : 'bg-gradient-to-r from-rose-900/40 to-pink-900/40 hover:from-rose-800/60 hover:to-pink-800/60 text-rose-200 border-rose-500/40 hover:border-rose-400 shadow-[0_0_10px_rgba(244,63,94,0.2)]'
                        }`}
                    >
                        <Search className={`w-3 h-3 ${isDeepScanning ? 'animate-spin text-rose-400' : 'text-rose-300'}`} />
                        <span>{isDeepScanning ? `SCANNING (${scanProgress}%)` : 'DEEP SYSTEM SCAN'}</span>
                    </button>

                    <div className="text-[8px] font-mono text-cyan-500/50 uppercase">STATUS: {operationalMode === 'inference' ? 'ACTIVE' : 'MONITORING'}</div>
                </div>
            </div>

            {/* Operational Mode Toggle Switch */}
            <div className="flex items-center justify-between bg-cyan-950/25 border border-cyan-500/15 rounded-md p-1.5 mb-4 relative z-10">
                <span className="text-[8px] font-mono font-bold tracking-wider text-slate-400 uppercase">Operational Mode:</span>
                <div className="flex bg-black/60 rounded p-0.5 border border-cyan-500/20">
                    <button
                        onClick={() => {
                            setOperationalMode('inference');
                            addLog?.('SYSTEM', 'OmniCore Operational Mode: ACTIVE INFERENCE enabled');
                        }}
                        className={`px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase transition-all duration-300 ${
                            operationalMode === 'inference'
                                ? 'bg-cyan-500 text-black shadow-[0_0_8px_rgba(6,182,212,0.4)]'
                                : 'text-slate-500 hover:text-slate-350'
                        }`}
                    >
                        Active Inference
                    </button>
                    <button
                        onClick={() => {
                            setOperationalMode('monitoring');
                            addLog?.('SYSTEM', 'OmniCore Operational Mode: PASSIVE MONITORING enabled');
                        }}
                        className={`px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase transition-all duration-300 ${
                            operationalMode === 'monitoring'
                                ? 'bg-amber-500 text-black shadow-[0_0_8px_rgba(245,158,11,0.4)]'
                                : 'text-slate-500 hover:text-slate-350'
                        }`}
                    >
                        Passive Monitoring
                    </button>
                </div>
            </div>

            <div className="flex gap-2 mb-4 relative z-10 overflow-x-auto custom-scrollbar pb-2">
                {engines.map(engine => {
                    const Icon = engine.icon;
                    const isActive = activeEngine === engine.id;
                    return (
                        <button
                            key={engine.id}
                            onClick={() => setActiveEngine(engine.id)}
                            className={`min-w-[80px] flex-1 flex flex-col items-center justify-center p-2 rounded border transition-all duration-300 ${
                                isActive 
                                ? `bg-black/80 ${engine.borderColor} shadow-[0_0_15px_currentColor] ${engine.color}` 
                                : 'bg-black/40 border-slate-800 hover:border-slate-600'
                            }`}
                        >
                            <Icon className={`w-4 h-4 mb-1 ${isActive ? engine.color : 'text-slate-500'}`} />
                            <span className={`text-[8px] font-mono font-bold text-center whitespace-nowrap ${isActive ? 'text-slate-200' : 'text-slate-600'}`}>
                                {engine.name}
                            </span>
                        </button>
                    );
                })}
            </div>

            <div className="flex-1 relative z-10 bg-black/60 border border-cyan-900/30 rounded-lg p-4 overflow-y-auto custom-scrollbar hologram-content">
                {activeEngine === 'QUANTUM_DECOHERENCE' && (
                    <div className="space-y-4 animate-fade-in">
                        <div className="flex justify-between items-center text-[10px] font-mono text-rose-400 uppercase tracking-wider border-b border-rose-900/50 pb-1">
                            <span className="flex items-center gap-1.5">
                                <Radio className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                                Quantum Decoherence Rate Scan
                            </span>
                            <span className="text-[9px] text-slate-400">Target Q-Bits: 1,024</span>
                        </div>

                        {/* Quantum Decoherence Rate Line Chart */}
                        <div className="p-3 bg-black/80 border border-rose-900/40 rounded-lg">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-[9px] font-mono font-bold text-rose-300">Decoherence Rate γ(t) [ms⁻¹]</span>
                                <span className="text-[8px] font-mono text-slate-400">
                                    Current: <strong className="text-rose-400">{quantumDecoherenceData[quantumDecoherenceData.length - 1]?.rate || 0.042} ms⁻¹</strong>
                                </span>
                            </div>

                            {/* SVG Quantum Decoherence Chart */}
                            <div className="h-32 w-full relative my-2">
                                <svg className="w-full h-full overflow-visible" viewBox="0 0 300 100" preserveAspectRatio="none">
                                    <defs>
                                        <linearGradient id="roseGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.4" />
                                            <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.0" />
                                        </linearGradient>
                                    </defs>
                                    
                                    {/* Gridlines */}
                                    <line x1="0" y1="20" x2="300" y2="20" stroke="#881337" strokeWidth="0.5" strokeDasharray="2,2" opacity="0.4" />
                                    <line x1="0" y1="50" x2="300" y2="50" stroke="#881337" strokeWidth="0.5" strokeDasharray="2,2" opacity="0.4" />
                                    <line x1="0" y1="80" x2="300" y2="80" stroke="#881337" strokeWidth="0.5" strokeDasharray="2,2" opacity="0.4" />

                                    {/* Area fill */}
                                    <polygon
                                        fill="url(#roseGradient)"
                                        points={`0,100 ${quantumDecoherenceData.map((d, i) => {
                                            const x = (i / (quantumDecoherenceData.length - 1 || 1)) * 300;
                                            const y = 100 - (d.rate / 0.08) * 90;
                                            return `${x},${Math.max(10, Math.min(95, y))}`;
                                        }).join(' ')} 300,100`}
                                    />

                                    {/* Line path */}
                                    <polyline
                                        fill="none"
                                        stroke="#f43f5e"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        points={quantumDecoherenceData.map((d, i) => {
                                            const x = (i / (quantumDecoherenceData.length - 1 || 1)) * 300;
                                            const y = 100 - (d.rate / 0.08) * 90;
                                            return `${x},${Math.max(10, Math.min(95, y))}`;
                                        }).join(' ')}
                                    />

                                    {/* Data dots */}
                                    {quantumDecoherenceData.map((d, i) => {
                                        const x = (i / (quantumDecoherenceData.length - 1 || 1)) * 300;
                                        const y = Math.max(10, Math.min(95, 100 - (d.rate / 0.08) * 90));
                                        return (
                                            <g key={i}>
                                                <circle cx={x} cy={y} r="3" fill="#fb7185" />
                                                <circle cx={x} cy={y} r="6" fill="#f43f5e" opacity="0.3" className="animate-ping" />
                                            </g>
                                        );
                                    })}
                                </svg>
                            </div>

                            {/* Time axis ticks */}
                            <div className="flex justify-between text-[8px] font-mono text-slate-500 pt-1 border-t border-rose-900/30">
                                {quantumDecoherenceData.map((d, i) => (
                                    <span key={i}>{d.time}</span>
                                ))}
                            </div>
                        </div>

                        {/* Real-time Quantum Metrics Grid */}
                        <div className="grid grid-cols-3 gap-2">
                            <div className="p-2.5 bg-rose-950/20 border border-rose-900/30 rounded flex flex-col items-center">
                                <span className="text-[8px] text-slate-400 font-mono uppercase mb-1">Decoherence Rate</span>
                                <span className="text-[11px] text-rose-400 font-bold font-mono">
                                    {quantumDecoherenceData[quantumDecoherenceData.length - 1]?.rate || 0.042} ms⁻¹
                                </span>
                            </div>
                            <div className="p-2.5 bg-rose-950/20 border border-rose-900/30 rounded flex flex-col items-center">
                                <span className="text-[8px] text-slate-400 font-mono uppercase mb-1">Thermal Noise</span>
                                <span className="text-[11px] text-amber-400 font-bold font-mono">
                                    {quantumDecoherenceData[quantumDecoherenceData.length - 1]?.noise || 0.012} dBm
                                </span>
                            </div>
                            <div className="p-2.5 bg-rose-950/20 border border-rose-900/30 rounded flex flex-col items-center">
                                <span className="text-[8px] text-slate-400 font-mono uppercase mb-1">Phase Fidelity</span>
                                <span className="text-[11px] text-emerald-400 font-bold font-mono">
                                    {quantumDecoherenceData[quantumDecoherenceData.length - 1]?.fidelity || 99.85}%
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {activeEngine === 'ML_ENSEMBLE' && (
                    <div className="space-y-4 animate-fade-in">
                        <div className="flex justify-between items-center text-[10px] font-mono text-cyan-400 uppercase tracking-wider border-b border-cyan-900/50 pb-1">
                            <span>Target: AAPL</span>
                            <span>Confidence: 87.4%</span>
                        </div>
                        <div className="space-y-2">
                            {[
                                { model: 'Momentum XGBoost', weight: '25%', signal: 'STRONG BUY' },
                                { model: 'Mean Reversion RF', weight: '20%', signal: 'BUY' },
                                { model: 'Volatility HMM', weight: '15%', signal: 'NEUTRAL' }
                            ].map((m, i) => (
                                <div key={i} className="flex justify-between items-center p-2 bg-slate-900/50 rounded border border-slate-800 hover:border-cyan-500/30 transition-colors cursor-crosshair">
                                    <span className="text-[9px] text-slate-300 font-mono">{m.model}</span>
                                    <div className="flex items-center gap-3">
                                        <span className="text-[8px] text-slate-500 font-mono">{m.weight}</span>
                                        <span className={`text-[9px] font-bold font-mono ${m.signal.includes('BUY') ? 'text-green-400' : 'text-slate-400'}`}>{m.signal}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 p-3 bg-cyan-950/20 border border-cyan-900/50 rounded-lg">
                            <div className="text-[8px] text-cyan-500 font-mono mb-2 uppercase">Composite Signal</div>
                            <div className="text-xl text-green-400 font-mono font-bold tracking-widest text-center shadow-text">BUY_TARGET</div>
                        </div>
                    </div>
                )}

                {activeEngine === 'REGIME_DETECT' && (
                    <div className="space-y-4 animate-fade-in">
                         <div className="flex justify-between items-center text-[10px] font-mono text-amber-400 uppercase tracking-wider border-b border-amber-900/50 pb-1">
                            <span>Current Market State</span>
                            <span>HMM State: S3</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="p-3 bg-amber-950/20 border border-amber-900/30 rounded flex flex-col items-center justify-center hover:bg-amber-900/30 transition-colors">
                                <span className="text-[8px] text-slate-500 font-mono uppercase mb-1">Regime</span>
                                <span className="text-[11px] text-amber-400 font-bold font-mono text-center">HIGH_VOLATILITY</span>
                            </div>
                            <div className="p-3 bg-amber-950/20 border border-amber-900/30 rounded flex flex-col items-center justify-center hover:bg-amber-900/30 transition-colors">
                                <span className="text-[8px] text-slate-500 font-mono uppercase mb-1">Confidence</span>
                                <span className="text-[11px] text-slate-200 font-bold font-mono">92.1%</span>
                            </div>
                            <div className="p-3 bg-amber-950/20 border border-amber-900/30 rounded flex flex-col items-center justify-center hover:bg-amber-900/30 transition-colors">
                                <span className="text-[8px] text-slate-500 font-mono uppercase mb-1">VIX Proxy</span>
                                <span className="text-[11px] text-slate-200 font-bold font-mono">24.5</span>
                            </div>
                            <div className="p-3 bg-amber-950/20 border border-amber-900/30 rounded flex flex-col items-center justify-center hover:bg-amber-900/30 transition-colors">
                                <span className="text-[8px] text-slate-500 font-mono uppercase mb-1">Duration</span>
                                <span className="text-[11px] text-slate-200 font-bold font-mono">14 Periods</span>
                            </div>
                        </div>
                    </div>
                )}

                {activeEngine === 'SENTIMENT_NLP' && (
                    <div className="space-y-3 animate-fade-in">
                        <div className="text-[10px] font-mono text-fuchsia-400 uppercase tracking-wider border-b border-fuchsia-900/50 pb-1 mb-2">
                            Global NLP Sentiment Stream
                        </div>
                        {[
                            { sym: 'TSLA', score: 0.82, src: 'Reddit/WSB', urgency: 'HIGH' },
                            { sym: 'NVDA', score: 0.65, src: 'Twitter', urgency: 'MED' },
                            { sym: 'SPY', score: -0.4, src: 'NewsAPI', urgency: 'HIGH' }
                        ].map((s, i) => (
                            <div key={i} className="flex justify-between items-center p-2 bg-slate-900/50 rounded border border-slate-800 hover:border-fuchsia-500/30 transition-colors cursor-crosshair">
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] text-slate-200 font-bold font-mono w-8">{s.sym}</span>
                                    <span className="text-[8px] text-slate-500 font-mono bg-black px-1 rounded">{s.src}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className={`text-[9px] font-mono ${s.score > 0 ? 'text-green-400' : 'text-red-400'}`}>{s.score > 0 ? '+' : ''}{s.score}</span>
                                    <span className={`text-[8px] font-mono px-1 rounded ${s.urgency === 'HIGH' ? 'bg-red-900/50 text-red-400' : 'bg-amber-900/50 text-amber-400'}`}>{s.urgency}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {activeEngine === 'DARK_POOL' && (
                    <div className="space-y-4 animate-fade-in">
                         <div className="flex justify-between items-center text-[10px] font-mono text-rose-400 uppercase tracking-wider border-b border-rose-900/50 pb-1">
                            <span>Block Trade Scanner</span>
                            <span className="animate-pulse">Monitoring...</span>
                        </div>
                        <div className="space-y-2">
                            {[
                                { sym: 'MSFT', size: '250K', price: '$412.50', type: 'ACCUMULATION' },
                                { sym: 'QQQ', size: '1.2M', price: '$435.10', type: 'DISTRIBUTION' },
                            ].map((t, i) => (
                                <div key={i} className="flex justify-between items-center p-2.5 bg-slate-900/80 rounded border border-rose-900/30 hover:bg-rose-950/20 transition-colors cursor-crosshair">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-slate-200 font-bold font-mono">{t.sym}</span>
                                        <span className="text-[8px] text-slate-500 font-mono">{t.size} shares @ {t.price}</span>
                                    </div>
                                    <span className={`text-[9px] font-bold font-mono px-2 py-0.5 rounded ${t.type === 'ACCUMULATION' ? 'bg-green-950/30 text-green-400' : 'bg-red-950/30 text-red-400'}`}>
                                        {t.type}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                
                {activeEngine === 'VOL_SURFACE' && (
                    <div className="space-y-4 animate-fade-in">
                         <div className="flex justify-between items-center text-[10px] font-mono text-violet-400 uppercase tracking-wider border-b border-violet-900/50 pb-1">
                            <span>Implied Volatility Surface (SABR)</span>
                            <span>Target: SPY</span>
                        </div>
                        <div className="h-24 w-full border border-violet-900/30 bg-violet-950/10 rounded flex items-center justify-center relative overflow-hidden group">
                            {/* Simulated 3D Vol Surface via CSS gradients */}
                            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-violet-500/20 via-transparent to-transparent opacity-50 group-hover:scale-110 transition-transform duration-1000"></div>
                            <div className="absolute inset-0" style={{
                                backgroundImage: `linear-gradient(rgba(139, 92, 246, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(139, 92, 246, 0.3) 1px, transparent 1px)`,
                                backgroundSize: '15px 15px',
                                transform: 'perspective(400px) rotateX(70deg) translateY(20px) scale(1.5)',
                            }}></div>
                            <span className="relative z-10 text-[10px] font-mono text-violet-300 bg-black/50 px-2 py-1 rounded">3D Surface Render Active</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            {['ATM Vol: 14.2%', 'Skew: -2.1', 'Term: Contango'].map((v, i) => (
                                <div key={i} className="text-center p-2 bg-slate-900/50 border border-violet-900/30 rounded text-[9px] text-slate-300 font-mono">
                                    {v}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                
                {activeEngine === 'CRYPTO_DEFI' && (
                    <div className="space-y-4 animate-fade-in">
                         <div className="flex justify-between items-center text-[10px] font-mono text-emerald-400 uppercase tracking-wider border-b border-emerald-900/50 pb-1">
                            <span>DeFi Yield Arbitrage</span>
                            <span className="text-emerald-500 animate-pulse">MEV Protected</span>
                        </div>
                        <div className="space-y-2">
                            {[
                                { pool: 'Uniswap V3 USDC/ETH', apy: '14.2%', risk: 'Low', action: 'DEPLOY' },
                                { pool: 'Curve 3pool', apy: '6.8%', risk: 'Very Low', action: 'MONITOR' },
                                { pool: 'Aave V3 USDT', apy: '8.4%', risk: 'Low', action: 'DEPLOY' }
                            ].map((p, i) => (
                                <div key={i} className="flex justify-between items-center p-2.5 bg-slate-900/80 rounded border border-emerald-900/30 hover:border-emerald-500/50 transition-colors">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-slate-200 font-bold font-mono">{p.pool}</span>
                                        <span className="text-[8px] text-slate-500 font-mono">Risk: {p.risk}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-[10px] font-bold font-mono text-emerald-400">{p.apy}</span>
                                        <button className="text-[8px] font-bold font-mono px-2 py-1 rounded bg-emerald-950/50 border border-emerald-800 text-emerald-400 hover:bg-emerald-900/50">
                                            {p.action}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                
                {activeEngine === 'SOCIAL_COPY' && (
                    <div className="space-y-4 animate-fade-in">
                         <div className="flex justify-between items-center text-[10px] font-mono text-blue-400 uppercase tracking-wider border-b border-blue-900/50 pb-1">
                            <span>Leaderboard</span>
                            <span>Top Traders</span>
                        </div>
                        <div className="space-y-2">
                            {[
                                { name: 'AlphaWhale', winRate: '68%', followers: '12.4K', active: true },
                                { name: 'QuantSniper', winRate: '72%', followers: '8.1K', active: false },
                                { name: 'GammaSqueeze', winRate: '59%', followers: '45.2K', active: true }
                            ].map((t, i) => (
                                <div key={i} className="flex justify-between items-center p-2 bg-slate-900/80 rounded border border-blue-900/30 hover:bg-blue-950/20 transition-colors">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-1.5 h-1.5 rounded-full ${t.active ? 'bg-green-500' : 'bg-slate-600'}`}></div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] text-slate-200 font-bold font-mono">{t.name}</span>
                                            <span className="text-[8px] text-slate-500 font-mono">{t.followers} followers</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="text-[10px] font-bold font-mono text-blue-400">WR: {t.winRate}</span>
                                        <span className="text-[8px] text-cyan-500 font-mono cursor-pointer hover:underline">COPY TRADE</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                
                {activeEngine === 'CROSS_ARB' && (
                    <div className="space-y-4 animate-fade-in">
                         <div className="flex justify-between items-center text-[10px] font-mono text-yellow-400 uppercase tracking-wider border-b border-yellow-900/50 pb-1">
                            <span>Cross-Exchange Arbitrage</span>
                            <span className="text-yellow-500 animate-pulse">Scanning</span>
                        </div>
                        <div className="space-y-2">
                            {[
                                { sym: 'BTC/USDT', exA: 'Binance', exB: 'Kraken', spread: '0.15%', profit: '+$84.20' },
                                { sym: 'ETH/USDT', exA: 'Coinbase', exB: 'Binance', spread: '0.08%', profit: '+$12.50' }
                            ].map((a, i) => (
                                <div key={i} className="flex flex-col p-2 bg-slate-900/80 rounded border border-yellow-900/30 hover:border-yellow-500/50 transition-colors">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-[10px] text-slate-200 font-bold font-mono">{a.sym}</span>
                                        <span className="text-[10px] font-bold font-mono text-yellow-400">{a.spread} Spread</span>
                                    </div>
                                    <div className="flex justify-between items-center text-[8px] font-mono text-slate-400">
                                        <div className="flex items-center gap-1">
                                            <span className="bg-black px-1 rounded">{a.exA}</span>
                                            <span>→</span>
                                            <span className="bg-black px-1 rounded">{a.exB}</span>
                                        </div>
                                        <span className="text-green-400 font-bold">{a.profit}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeEngine === 'BACKTEST' && (
                    <div className="space-y-4 animate-fade-in">
                        <div className="flex justify-between items-center text-[10px] font-mono text-orange-400 uppercase tracking-wider border-b border-orange-900/50 pb-1">
                            <span>Historical Replay Engine</span>
                            <span>Status: IDLE</span>
                        </div>
                        <div className="p-3 bg-orange-950/20 border border-orange-900/30 rounded flex flex-col items-center justify-center hover:bg-orange-900/30 transition-colors cursor-pointer">
                            <FastForward className="w-8 h-8 text-orange-400 mb-2" />
                            <span className="text-[10px] text-slate-200 font-bold font-mono">INITIATE BACKTEST</span>
                            <span className="text-[8px] text-slate-500 font-mono text-center mt-1">Load multi-year historical data & execute strategy DSL</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                             <div className="text-center p-2 bg-slate-900/50 border border-slate-800 rounded">
                                <span className="block text-[8px] text-slate-500 font-mono mb-1">Win Rate</span>
                                <span className="block text-[10px] text-slate-300 font-mono">--</span>
                             </div>
                             <div className="text-center p-2 bg-slate-900/50 border border-slate-800 rounded">
                                <span className="block text-[8px] text-slate-500 font-mono mb-1">Max Drawdown</span>
                                <span className="block text-[10px] text-slate-300 font-mono">--</span>
                             </div>
                        </div>
                    </div>
                )}

                {activeEngine === 'JOURNAL' && (
                    <div className="space-y-4 animate-fade-in">
                        <div className="flex justify-between items-center text-[10px] font-mono text-indigo-400 uppercase tracking-wider border-b border-indigo-900/50 pb-1">
                            <span>Post-Trade Analytics</span>
                            <span>Behavioral Flags: 2</span>
                        </div>
                        <div className="space-y-2">
                            {[
                                { id: 'T-8492', sym: 'NVDA', pnl: '+$450.20', time: '14m ago', flags: ['FOMO_AVOIDED'] },
                                { id: 'T-8491', sym: 'TSLA', pnl: '-$120.00', time: '2h ago', flags: ['OVERTRADING', 'REVENGE_RISK'] }
                            ].map((j, i) => (
                                <div key={i} className="p-2 bg-slate-900/80 rounded border border-indigo-900/30 hover:border-indigo-500/50 transition-colors">
                                    <div className="flex justify-between items-center mb-1">
                                        <div className="flex gap-2">
                                            <span className="text-[9px] text-slate-400 font-mono">{j.id}</span>
                                            <span className="text-[10px] text-slate-200 font-bold font-mono">{j.sym}</span>
                                        </div>
                                        <span className={`text-[10px] font-bold font-mono ${j.pnl.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>{j.pnl}</span>
                                    </div>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {j.flags.map(f => (
                                            <span key={f} className="text-[7px] font-mono px-1 py-0.5 rounded bg-indigo-950/50 text-indigo-300 border border-indigo-800/50">
                                                {f}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeEngine === 'DSL' && (
                    <div className="space-y-4 animate-fade-in">
                        <div className="flex justify-between items-center text-[10px] font-mono text-pink-400 uppercase tracking-wider border-b border-pink-900/50 pb-1">
                            <span>Strategy DSL Compiler</span>
                            <span>Ready</span>
                        </div>
                        <div className="p-2 bg-black/80 border border-pink-900/30 rounded font-mono text-[9px] text-pink-300 leading-relaxed overflow-x-auto whitespace-pre">
{`BUY WHEN rsi < 30 AND price > sma(20)
SELL WHEN rsi > 70
size_pct = 5.0
timeframe = 5m`}
                        </div>
                        <button className="w-full py-2 bg-pink-950/30 border border-pink-900/50 rounded hover:bg-pink-900/40 text-[9px] font-bold font-mono text-pink-400 transition-colors">
                            COMPILE & DEPLOY
                        </button>
                    </div>
                )}

                {activeEngine === 'WALK_FORWARD' && (
                    <div className="space-y-4 animate-fade-in">
                        <div className="flex justify-between items-center text-[10px] font-mono text-teal-400 uppercase tracking-wider border-b border-teal-900/50 pb-1">
                            <span>Walk-Forward Optimization</span>
                            <span className="animate-pulse">Optimizing...</span>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <div className="flex justify-between text-[8px] font-mono text-slate-500 mb-1">
                                    <span>In-Sample (Train)</span>
                                    <span className="text-teal-400">Sharpe: 2.4</span>
                                </div>
                                <div className="w-full h-1 bg-slate-800 rounded overflow-hidden">
                                    <div className="h-full bg-teal-500 w-[70%]"></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-[8px] font-mono text-slate-500 mb-1">
                                    <span>Out-of-Sample (Test)</span>
                                    <span className="text-cyan-400">Sharpe: 1.8</span>
                                </div>
                                <div className="w-full h-1 bg-slate-800 rounded overflow-hidden">
                                    <div className="h-full bg-cyan-500 w-[30%] ml-[70%]"></div>
                                </div>
                            </div>
                            <div className="p-2 bg-teal-950/20 border border-teal-900/30 rounded text-center">
                                <span className="block text-[8px] text-slate-500 font-mono uppercase mb-1">Robustness Score</span>
                                <span className="text-lg text-teal-400 font-bold font-mono">0.75</span>
                            </div>
                        </div>
                    </div>
                )}

                {activeEngine === 'MARKET_MAKING' && (
                    <div className="space-y-4 animate-fade-in">
                        <div className="flex justify-between items-center text-[10px] font-mono text-lime-400 uppercase tracking-wider border-b border-lime-900/50 pb-1">
                            <span>Market Making Engine</span>
                            <span>Target: BTC/USD</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="p-2 bg-lime-950/20 border border-lime-900/30 rounded text-center">
                                <span className="block text-[8px] text-slate-500 font-mono uppercase mb-1">Spread</span>
                                <span className="text-[10px] text-lime-400 font-bold font-mono">5.2 BPS</span>
                            </div>
                            <div className="p-2 bg-lime-950/20 border border-lime-900/30 rounded text-center">
                                <span className="block text-[8px] text-slate-500 font-mono uppercase mb-1">Inventory Skew</span>
                                <span className="text-[10px] text-lime-400 font-bold font-mono">+12.4%</span>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <div className="flex justify-between text-[9px] font-mono p-1 bg-red-950/30 border border-red-900/50 text-red-400">
                                <span>ASK L2</span><span>64,215.50</span><span>2.4 BTC</span>
                            </div>
                            <div className="flex justify-between text-[9px] font-mono p-1 bg-red-950/50 border border-red-900/80 text-red-400">
                                <span>ASK L1</span><span>64,210.00</span><span>1.1 BTC</span>
                            </div>
                            <div className="flex justify-between text-[10px] font-mono p-1 text-slate-400 font-bold">
                                <span>MID</span><span>64,205.00</span><span></span>
                            </div>
                            <div className="flex justify-between text-[9px] font-mono p-1 bg-green-950/50 border border-green-900/80 text-green-400">
                                <span>BID L1</span><span>64,200.00</span><span>1.5 BTC</span>
                            </div>
                            <div className="flex justify-between text-[9px] font-mono p-1 bg-green-950/30 border border-green-900/50 text-green-400">
                                <span>BID L2</span><span>64,195.50</span><span>3.2 BTC</span>
                            </div>
                        </div>
                    </div>
                )}

                {activeEngine === 'GREEKS_HEDGE' && (
                    <div className="space-y-4 animate-fade-in">
                        <div className="flex justify-between items-center text-[10px] font-mono text-sky-400 uppercase tracking-wider border-b border-sky-900/50 pb-1">
                            <span>Dynamic Greeks Hedging</span>
                            <span className="text-sky-500 animate-pulse">Auto-Hedge ON</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            {[
                                { name: 'Delta (Δ)', val: '+124.5', target: '0.0', status: 'HEDGING' },
                                { name: 'Gamma (Γ)', val: '-45.2', target: 'N/A', status: 'MONITOR' },
                                { name: 'Theta (Θ)', val: '+$84/day', target: '>0', status: 'OK' },
                                { name: 'Vega (ν)', val: '+$120/1%', target: 'N/A', status: 'OK' }
                            ].map((g, i) => (
                                <div key={i} className="p-2 bg-sky-950/20 border border-sky-900/30 rounded flex flex-col hover:border-sky-500/50 transition-colors">
                                    <span className="text-[9px] text-sky-400 font-bold font-mono">{g.name}</span>
                                    <span className="text-[12px] text-slate-200 font-mono mt-1">{g.val}</span>
                                    <div className="flex justify-between mt-2">
                                        <span className="text-[7px] text-slate-500 font-mono">TGT: {g.target}</span>
                                        <span className={`text-[7px] font-bold font-mono ${g.status === 'OK' ? 'text-green-400' : 'text-amber-400'}`}>{g.status}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeEngine === 'DISPERSION' && (
                    <div className="space-y-4 animate-fade-in">
                        <div className="flex justify-between items-center text-[10px] font-mono text-purple-400 uppercase tracking-wider border-b border-purple-900/50 pb-1">
                            <span>Dispersion Trading</span>
                            <span>Target: SPX / Components</span>
                        </div>
                        <div className="p-3 bg-purple-950/20 border border-purple-900/30 rounded flex flex-col items-center">
                            <span className="text-[8px] text-slate-400 font-mono uppercase">Implied Correlation</span>
                            <span className="text-xl text-purple-400 font-bold font-mono my-1">0.82</span>
                            <span className="text-[9px] text-purple-300 font-mono bg-purple-900/30 px-2 py-1 rounded">HIGH CORRELATION REGIME</span>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center p-2 bg-slate-900/50 border border-slate-800 rounded">
                                <span className="text-[9px] text-slate-300 font-mono">Index IV (SPX)</span>
                                <span className="text-[10px] text-slate-200 font-bold font-mono">14.5%</span>
                            </div>
                            <div className="flex justify-between items-center p-2 bg-slate-900/50 border border-slate-800 rounded">
                                <span className="text-[9px] text-slate-300 font-mono">Component Avg IV</span>
                                <span className="text-[10px] text-slate-200 font-bold font-mono">11.2%</span>
                            </div>
                            <button className="w-full py-2 bg-purple-950/30 border border-purple-900/50 rounded hover:bg-purple-900/40 text-[9px] font-bold font-mono text-purple-400">
                                EXECUTE SHORT DISPERSION (SELL SPX, BUY COMPS)
                            </button>
                        </div>
                    </div>
                )}

                {activeEngine === 'FUNDING_ARB' && (
                    <div className="space-y-4 animate-fade-in">
                        <div className="flex justify-between items-center text-[10px] font-mono text-yellow-200 uppercase tracking-wider border-b border-yellow-900/50 pb-1">
                            <span>Funding Rate Arbitrage</span>
                            <span>Spot vs Perp</span>
                        </div>
                        <div className="space-y-2">
                            {[
                                { sym: 'BTC', rate: '+0.015%', action: 'SHORT PERP / LONG SPOT', yield: '16.4% APR' },
                                { sym: 'ETH', rate: '-0.021%', action: 'LONG PERP / SHORT SPOT', yield: '23.1% APR' },
                                { sym: 'SOL', rate: '+0.035%', action: 'SHORT PERP / LONG SPOT', yield: '38.3% APR' }
                            ].map((f, i) => (
                                <div key={i} className="p-2 bg-slate-900/80 rounded border border-yellow-900/30 hover:border-yellow-500/50 transition-colors">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-[10px] text-slate-200 font-bold font-mono">{f.sym}</span>
                                        <span className={`text-[10px] font-bold font-mono ${f.rate.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>{f.rate}/8h</span>
                                    </div>
                                    <div className="flex justify-between items-center mt-2">
                                        <span className="text-[7px] text-slate-400 font-mono bg-black px-1 rounded">{f.action}</span>
                                        <span className="text-[9px] text-yellow-300 font-bold font-mono">{f.yield}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeEngine === 'LIQUIDATION_SNIPE' && (
                    <div className="space-y-4 animate-fade-in">
                        <div className="flex justify-between items-center text-[10px] font-mono text-red-400 uppercase tracking-wider border-b border-red-900/50 pb-1">
                            <span>Liquidation Sniping</span>
                            <span className="text-red-500 animate-pulse">Scanning Cascades</span>
                        </div>
                        <div className="p-3 bg-red-950/20 border border-red-900/30 rounded flex items-center justify-between">
                            <div className="flex flex-col">
                                <span className="text-[8px] text-slate-400 font-mono uppercase">Global Liquidations (1H)</span>
                                <span className="text-lg text-red-400 font-bold font-mono">$142.5M</span>
                            </div>
                            <Activity className="w-6 h-6 text-red-500 animate-bounce" />
                        </div>
                        <div className="space-y-2">
                            {[
                                { sym: 'ETH-PERP', drop: '-5.2% / 1m', cascade: 'DETECTED', price: '2840.50' },
                                { sym: 'SOL-PERP', drop: '-8.1% / 1m', cascade: 'DETECTED', price: '121.20' }
                            ].map((l, i) => (
                                <div key={i} className="flex justify-between items-center p-2 bg-slate-900/80 border border-red-900/50 rounded hover:bg-red-950/30 cursor-pointer">
                                    <div className="flex flex-col">
                                        <span className="text-[9px] text-slate-200 font-bold font-mono">{l.sym}</span>
                                        <span className="text-[8px] text-red-400 font-mono">{l.drop}</span>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="text-[7px] font-mono bg-red-900 text-red-100 px-1 rounded mb-1">{l.cascade}</span>
                                        <span className="text-[9px] text-slate-300 font-mono">Bids @ {l.price}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeEngine === 'FLASH_LOAN' && (
                    <div className="space-y-4 animate-fade-in">
                        <div className="flex justify-between items-center text-[10px] font-mono text-yellow-500 uppercase tracking-wider border-b border-yellow-900/50 pb-1">
                            <span>Flash Loan Arbitrage</span>
                            <span>Mempool Monitor</span>
                        </div>
                        <div className="space-y-2">
                            {[
                                { route: 'Uniswap -> Sushiswap', pair: 'USDC/WETH', size: '$10M', gas: '45 Gwei', net: '+$4,250' },
                                { route: 'Curve -> Balancer', pair: 'USDT/DAI', size: '$5M', gas: '42 Gwei', net: '+$1,120' }
                            ].map((f, i) => (
                                <div key={i} className="p-2 bg-slate-900/80 rounded border border-yellow-900/30 hover:border-yellow-500/50 transition-colors">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-[9px] text-slate-300 font-mono">{f.route}</span>
                                        <span className="text-[10px] text-green-400 font-bold font-mono">{f.net}</span>
                                    </div>
                                    <div className="flex justify-between items-center mt-1">
                                        <span className="text-[8px] text-slate-400 font-mono">{f.pair} • Size: {f.size}</span>
                                        <span className="text-[8px] text-yellow-500 font-mono">Gas: {f.gas}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button className="w-full py-1.5 bg-yellow-950/30 border border-yellow-900/50 rounded hover:bg-yellow-900/40 text-[9px] font-bold font-mono text-yellow-500">
                            DEPLOY BUNDLE (FLASHBOTS)
                        </button>
                    </div>
                )}

                {activeEngine === 'EARNINGS_CAL' && (
                    <div className="space-y-4 animate-fade-in">
                        <div className="flex justify-between items-center text-[10px] font-mono text-blue-300 uppercase tracking-wider border-b border-blue-900/50 pb-1">
                            <span>Earnings Play Engine</span>
                            <span>Next 7 Days</span>
                        </div>
                        <div className="space-y-2">
                            {[
                                { sym: 'NVDA', date: 'Tomorrow AMC', est: '$0.85', implied_move: '±8.4%', strat: 'Iron Condor' },
                                { sym: 'CRWD', date: 'Thu BMO', est: '$0.42', implied_move: '±12.1%', strat: 'Long Straddle' }
                            ].map((e, i) => (
                                <div key={i} className="p-2 bg-slate-900/80 rounded border border-blue-900/30 hover:border-blue-500/50 transition-colors">
                                    <div className="flex justify-between items-center mb-1">
                                        <div className="flex gap-2 items-center">
                                            <span className="text-[10px] text-slate-200 font-bold font-mono">{e.sym}</span>
                                            <span className="text-[8px] text-blue-400 font-mono">{e.date}</span>
                                        </div>
                                        <span className="text-[8px] text-slate-400 font-mono">EPS Est: {e.est}</span>
                                    </div>
                                    <div className="flex justify-between items-center mt-2">
                                        <span className="text-[8px] text-amber-400 font-mono">Implied: {e.implied_move}</span>
                                        <span className="text-[8px] font-bold font-mono bg-blue-950/50 text-blue-300 px-1 rounded">{e.strat}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeEngine === 'DIVIDEND_CAP' && (
                    <div className="space-y-4 animate-fade-in">
                        <div className="flex justify-between items-center text-[10px] font-mono text-emerald-300 uppercase tracking-wider border-b border-emerald-900/50 pb-1">
                            <span>Dividend Capture</span>
                            <span>Upcoming Ex-Dates</span>
                        </div>
                        <div className="space-y-2">
                            {[
                                { sym: 'VZ', ex: 'Tomorrow', div: '$0.66', yield: '6.4%', action: 'BUY EOD' },
                                { sym: 'T', ex: 'Thursday', div: '$0.28', yield: '6.1%', action: 'MONITOR' }
                            ].map((d, i) => (
                                <div key={i} className="flex justify-between items-center p-2 bg-slate-900/80 rounded border border-emerald-900/30 hover:border-emerald-500/50">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-slate-200 font-bold font-mono">{d.sym}</span>
                                        <span className="text-[8px] text-slate-400 font-mono">Ex: {d.ex}</span>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="text-[9px] text-emerald-400 font-mono font-bold">{d.div} ({d.yield})</span>
                                        <span className="text-[7px] font-mono bg-emerald-950 text-emerald-300 px-1 rounded mt-0.5">{d.action}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeEngine === 'SECTOR_ROT' && (
                    <div className="space-y-4 animate-fade-in">
                        <div className="flex justify-between items-center text-[10px] font-mono text-indigo-300 uppercase tracking-wider border-b border-indigo-900/50 pb-1">
                            <span>Sector Rotation Detector</span>
                            <span>20-Day Momentum</span>
                        </div>
                        <div className="space-y-2">
                            {[
                                { sector: 'Technology (XLK)', flow: '+4.2%', status: 'LEADING' },
                                { sector: 'Energy (XLE)', flow: '+1.1%', status: 'IMPROVING' },
                                { sector: 'Healthcare (XLV)', flow: '-0.5%', status: 'WEAKENING' },
                                { sector: 'Financials (XLF)', flow: '-2.8%', status: 'LAGGING' }
                            ].map((s, i) => (
                                <div key={i} className="flex justify-between items-center p-2 bg-slate-900/80 border border-slate-800 rounded">
                                    <span className="text-[9px] text-slate-300 font-mono">{s.sector}</span>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-[9px] font-mono ${s.flow.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>{s.flow}</span>
                                        <span className={`text-[7px] font-bold font-mono w-14 text-center rounded ${s.status === 'LEADING' ? 'bg-green-900/50 text-green-300' : s.status === 'LAGGING' ? 'bg-red-900/50 text-red-300' : 'bg-slate-800 text-slate-400'}`}>{s.status}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeEngine === 'ECON_CAL' && (
                    <div className="space-y-4 animate-fade-in">
                        <div className="flex justify-between items-center text-[10px] font-mono text-cyan-300 uppercase tracking-wider border-b border-cyan-900/50 pb-1">
                            <span>Economic Calendar</span>
                            <span>Impact Models</span>
                        </div>
                        <div className="space-y-2">
                            {[
                                { event: 'FOMC Rate Decision', date: 'Wed 14:00', est: '5.25%', impact: 'EXTREME' },
                                { event: 'CPI (YoY)', date: 'Thu 08:30', est: '3.1%', impact: 'HIGH' }
                            ].map((e, i) => (
                                <div key={i} className="p-2 bg-slate-900/80 rounded border border-cyan-900/30 hover:border-cyan-500/50">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-[9px] text-slate-200 font-bold font-mono">{e.event}</span>
                                        <span className="text-[7px] font-bold font-mono bg-red-950/80 text-red-400 px-1 rounded">{e.impact}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-[8px] font-mono text-slate-400">
                                        <span>{e.date}</span>
                                        <span>Forecast: {e.est}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeEngine === 'CORR_MATRIX' && (
                    <div className="space-y-4 animate-fade-in">
                        <div className="flex justify-between items-center text-[10px] font-mono text-amber-300 uppercase tracking-wider border-b border-amber-900/50 pb-1">
                            <span>Dynamic Correlation</span>
                            <span>30-Day Window</span>
                        </div>
                        <div className="grid grid-cols-4 gap-1 p-2 bg-slate-900/80 border border-slate-800 rounded">
                            {['', 'AAPL', 'MSFT', 'SPY', 
                              'AAPL', '1.00', '0.82', '0.91',
                              'MSFT', '0.82', '1.00', '0.88',
                              'SPY', '0.91', '0.88', '1.00'].map((cell, i) => (
                                <div key={i} className={`text-center p-1 text-[8px] font-mono ${i < 4 || i % 4 === 0 ? 'text-slate-400 font-bold' : parseFloat(cell) > 0.8 ? 'text-green-400' : 'text-amber-400'}`}>
                                    {cell}
                                </div>
                            ))}
                        </div>
                        <div className="text-[8px] text-slate-500 font-mono text-center">Identifying pairs trading opportunities...</div>
                    </div>
                )}

                {activeEngine === 'STRESS_TEST' && (
                    <div className="space-y-4 animate-fade-in">
                        <div className="flex justify-between items-center text-[10px] font-mono text-rose-500 uppercase tracking-wider border-b border-rose-900/50 pb-1">
                            <span>Portfolio Stress Test</span>
                            <span>Historical Scenarios</span>
                        </div>
                        <div className="space-y-2">
                            {[
                                { name: '2008 Financial Crisis', dd: '-24.5%', sim: 'PASS' },
                                { name: '2020 COVID Crash', dd: '-18.2%', sim: 'PASS' },
                                { name: 'Flash Crash Simulation', dd: '-32.1%', sim: 'FAIL (KS_TRIGGER)' }
                            ].map((s, i) => (
                                <div key={i} className="flex justify-between items-center p-2 bg-slate-900/80 border border-rose-900/30 rounded">
                                    <span className="text-[9px] text-slate-300 font-mono">{s.name}</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[9px] text-red-400 font-mono font-bold">{s.dd}</span>
                                        <span className={`text-[7px] font-bold font-mono w-10 text-center rounded ${s.sim === 'PASS' ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'}`}>{s.sim.split(' ')[0]}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeEngine === 'BEHAVIORAL' && (
                    <div className="space-y-4 animate-fade-in">
                        <div className="flex justify-between items-center text-[10px] font-mono text-fuchsia-300 uppercase tracking-wider border-b border-fuchsia-900/50 pb-1">
                            <span>Behavioral Analytics</span>
                            <span className="text-fuchsia-400 animate-pulse">Monitoring</span>
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                            <div className="p-2 bg-slate-900/80 border border-green-900/50 rounded flex justify-between items-center">
                                <div className="flex flex-col">
                                    <span className="text-[9px] text-slate-200 font-bold font-mono">Overtrading Risk</span>
                                    <span className="text-[8px] text-slate-500 font-mono">3 trades in 60m</span>
                                </div>
                                <span className="text-[9px] text-green-400 font-bold font-mono">LOW</span>
                            </div>
                            <div className="p-2 bg-slate-900/80 border border-amber-900/50 rounded flex justify-between items-center">
                                <div className="flex flex-col">
                                    <span className="text-[9px] text-slate-200 font-bold font-mono">Revenge Trade Risk</span>
                                    <span className="text-[8px] text-slate-500 font-mono">Recent loss detected</span>
                                </div>
                                <span className="text-[9px] text-amber-400 font-bold font-mono">ELEVATED</span>
                            </div>
                            <div className="p-2 bg-slate-900/80 border border-green-900/50 rounded flex justify-between items-center">
                                <div className="flex flex-col">
                                    <span className="text-[9px] text-slate-200 font-bold font-mono">FOMO Indicator</span>
                                    <span className="text-[8px] text-slate-500 font-mono">Market rally context</span>
                                </div>
                                <span className="text-[9px] text-green-400 font-bold font-mono">LOW</span>
                            </div>
                        </div>
                    </div>
                )}

                {activeEngine === 'ADAPTIVE_OPT' && (
                    <div className="space-y-4 animate-fade-in">
                        <div className="flex justify-between items-center text-[10px] font-mono text-slate-300 uppercase tracking-wider border-b border-slate-700 pb-1">
                            <span>Adaptive Optimizer</span>
                            <span>Auto-Tuning</span>
                        </div>
                        <div className="space-y-2">
                            <div className="p-2 bg-slate-900/80 border border-slate-700 rounded">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-[9px] text-slate-200 font-bold font-mono">Mean Reversion Algo</span>
                                    <span className="text-[9px] text-green-400 font-bold font-mono">Win Rate: 62%</span>
                                </div>
                                <span className="text-[8px] text-slate-400 font-mono">Action: INCREASE_SIZE (1.2x)</span>
                            </div>
                            <div className="p-2 bg-slate-900/80 border border-slate-700 rounded">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-[9px] text-slate-200 font-bold font-mono">Momentum Algo</span>
                                    <span className="text-[9px] text-red-400 font-bold font-mono">Win Rate: 38%</span>
                                </div>
                                <span className="text-[8px] text-slate-400 font-mono">Action: REDUCE_SIZE (0.5x)</span>
                            </div>
                        </div>
                    </div>
                )}

                {activeEngine === 'MONTE_CARLO' && (
                    <div className="space-y-4 animate-fade-in">
                        <div className="flex justify-between items-center text-[10px] font-mono text-violet-300 uppercase tracking-wider border-b border-violet-900/50 pb-1">
                            <span>Monte Carlo Simulation</span>
                            <span>10,000 Paths</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="p-2 bg-violet-950/20 border border-violet-900/30 rounded text-center">
                                <span className="block text-[8px] text-slate-500 font-mono uppercase mb-1">Value at Risk (95%)</span>
                                <span className="text-[10px] text-violet-300 font-bold font-mono">-$2,450.00</span>
                            </div>
                            <div className="p-2 bg-violet-950/20 border border-violet-900/30 rounded text-center">
                                <span className="block text-[8px] text-slate-500 font-mono uppercase mb-1">Expected Return</span>
                                <span className="text-[10px] text-green-400 font-bold font-mono">+$8,120.00</span>
                            </div>
                            <div className="p-2 bg-violet-950/20 border border-violet-900/30 rounded text-center">
                                <span className="block text-[8px] text-slate-500 font-mono uppercase mb-1">Prob. of Profit</span>
                                <span className="text-[10px] text-violet-300 font-bold font-mono">72.4%</span>
                            </div>
                            <div className="p-2 bg-violet-950/20 border border-violet-900/30 rounded text-center">
                                <span className="block text-[8px] text-slate-500 font-mono uppercase mb-1">Prob. of Ruin</span>
                                <span className="text-[10px] text-red-400 font-bold font-mono">0.1%</span>
                            </div>
                        </div>
                    </div>
                )}

            </div>
            
            {/* Holographic projection beams */}
            <div className="absolute bottom-0 left-1/4 right-1/4 h-24 bg-gradient-to-t from-cyan-500/10 to-transparent pointer-events-none transform perspective-500 rotate-x-45 blur-md"></div>
        </div>
    );
};

export default OmniCoreAgent;
