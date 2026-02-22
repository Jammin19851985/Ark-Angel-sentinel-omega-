
import React, { useState, useEffect, useCallback } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { ApexTarget, InterceptedAsset, ArbOpportunity } from '../../types';
import Loader from '../Loader';
import { ShieldIcon } from '../icons/ShieldIcon';
import { SearchIcon } from '../icons/SearchIcon';
import { RadarIcon } from '../icons/RadarIcon';
import { CrosshairIcon } from '../icons/CrosshairIcon';
import { NetworkIcon } from '../icons/NetworkIcon';
import { ShieldCheckIcon } from '../icons/ShieldCheckIcon';

const INITIAL_TARGETS: ApexTarget[] = [
    { alias: "Market_Maker_Alpha", address: "0x7a2...", threatLevel: 5, lastVector: "FRONT_RUN_DETECTION", confidence: 0.99 },
    { alias: "Insider_Cabal_X", address: "0x99c...", threatLevel: 4, lastVector: "ACCUMULATION_BURST", confidence: 0.95 },
    { alias: "Shadow_Whale_Ω", address: "0x3f5...", threatLevel: 3, lastVector: "OFF_RAMP_SIMULATION", confidence: 0.88 },
];

const StatusIndicator: React.FC<{ label: string, value: number, color?: string }> = ({ label, value, color = 'bg-cyan-500' }) => (
    <div className="space-y-1">
        <div className="flex justify-between text-[8px] font-mono text-slate-500 uppercase">
            <span>{label}</span>
            <span className="text-slate-300">{(value * 100).toFixed(1)}%</span>
        </div>
        <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden border border-white/5">
            <div 
                className={`h-full ${color} transition-all duration-1000 ease-out`} 
                style={{ width: `${value * 100}%` }}
            ></div>
        </div>
    </div>
);

const OmniSentryTab: React.FC = () => {
    const { addLog, externalExchangeData, arbOpportunities, coreState, setCoreState } = useAppContext();
    const [isScanning, setIsScanning] = useState(false);
    const [apexTargets, setApexTargets] = useState<ApexTarget[]>(INITIAL_TARGETS);
    const [intercepts, setIntercepts] = useState<InterceptedAsset[]>([]);
    const [sonarActive, setSonarActive] = useState(true);

    const toggleFlashbots = () => {
        setCoreState(prev => ({
            ...prev,
            mevMetrics: {
                ...prev.mevMetrics,
                isFlashbotsBypassActive: !prev.mevMetrics.isFlashbotsBypassActive
            }
        }));
        addLog('MEV_GUARD', `Flashbots RPC: ${!coreState.mevMetrics.isFlashbotsBypassActive ? 'ENGAGED' : 'DISENGAGED'}`);
    };

    const startScan = useCallback(() => {
        setIsScanning(true);
        addLog('SENTRY', 'Omni-Sentry surveillance systems active. Scanning sectors...');
        
        setTimeout(() => {
            setIsScanning(false);
            const newIntercept: InterceptedAsset = {
                codename: `PROJECT_${Math.floor(Math.random() * 1000)}`,
                contract: `0x${Math.random().toString(16).slice(2, 10)}...`,
                auditStatus: 'PASSED',
                liquidity: 'LOW'
            };
            setIntercepts(prev => [newIntercept, ...prev].slice(0, 5));
            addLog('SENTRY', `[ZERO-BLOCK] New genesis block intercepted: ${newIntercept.codename}`);
        }, 2000);
    }, [addLog]);

    return (
        <div className="h-full flex flex-col font-mono text-xs">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-lg font-bold text-amber-500 uppercase tracking-widest">// OMNI-SENTRY WING // PROPRIETARY RECON</h3>
                    <p className="text-slate-500">APEX TARGETING // DARK FOREST SONAR // MEV SHIELD</p>
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={startScan}
                        disabled={isScanning}
                        className="bg-amber-600 hover:bg-amber-500 text-white border border-amber-400 px-4 py-2 rounded font-bold transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(245,158,11,0.5)]"
                    >
                        {isScanning ? <Loader /> : <CrosshairIcon className="w-4 h-4" />}
                        {isScanning ? 'SCANNING...' : 'INITIATE RECON'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
                {/* Sector 1: MEV Shield & Flashbots */}
                <div className="flex flex-col space-y-4">
                    <div className="bg-black/50 border border-slate-800 p-4 rounded-lg flex flex-col space-y-4">
                        <h4 className="text-emerald-400 font-bold mb-1 flex items-center gap-2 uppercase">
                            <ShieldCheckIcon className="w-3 h-3" /> MEV Shield (Flashbots)
                        </h4>
                        
                        <div className="p-3 bg-black/40 border border-emerald-500/20 rounded space-y-3">
                             <div className="flex justify-between items-center">
                                <span className="text-[10px] text-slate-400 uppercase tracking-widest">Private RPC Bypass</span>
                                <button 
                                    onClick={toggleFlashbots}
                                    className={`px-3 py-1 rounded text-[10px] font-bold transition-all border ${
                                        coreState.mevMetrics.isFlashbotsBypassActive 
                                        ? 'bg-emerald-600 border-emerald-400 text-white shadow-[0_0_10px_rgba(16,185,129,0.6)]' 
                                        : 'bg-slate-900 border-slate-700 text-slate-500'
                                    }`}
                                >
                                    {coreState.mevMetrics.isFlashbotsBypassActive ? 'ACTIVE' : 'INACTIVE'}
                                </button>
                             </div>
                             <div className="flex justify-between items-center">
                                <span className="text-[10px] text-slate-400 uppercase tracking-widest">Slippage Guard</span>
                                <span className="text-emerald-400 font-bold">{(coreState.mevMetrics.currentSlippageLimit * 100).toFixed(3)}%</span>
                             </div>
                             <StatusIndicator 
                                label="Mempool Visibility" 
                                value={coreState.mevMetrics.mempoolExposure} 
                                color={coreState.mevMetrics.mempoolExposure < 0.1 ? 'bg-emerald-500 shadow-[0_0_5px_emerald]' : 'bg-red-500'} 
                             />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                             <div className="bg-slate-900/40 p-2 rounded border border-white/5">
                                <div className="text-[8px] text-slate-500 uppercase">Bundles Sent</div>
                                <div className="text-xs font-bold text-white">{coreState.mevMetrics.bundlesSent}</div>
                             </div>
                             <div className="bg-slate-900/40 p-2 rounded border border-white/5">
                                <div className="text-[8px] text-slate-500 uppercase">Sandwiches Blocked</div>
                                <div className="text-xs font-bold text-amber-500">{coreState.mevMetrics.sandwichAttemptsBlocked}</div>
                             </div>
                        </div>
                    </div>

                    <div className="bg-black/50 border border-slate-800 p-4 rounded-lg flex-1 overflow-hidden flex flex-col">
                        <h4 className="text-cyan-400 font-bold mb-3 flex items-center gap-2 uppercase">
                            <RadarIcon className="w-3 h-3" /> Arbitrage Matrix
                        </h4>
                        <div className="flex-1 overflow-y-auto space-y-2">
                            {arbOpportunities.length === 0 ? (
                                <div className="text-[10px] text-slate-600 italic">Awaiting spread divergence...</div>
                            ) : (
                                arbOpportunities.map((arb, i) => (
                                    <div key={i} className="bg-cyan-950/20 border border-cyan-500/20 p-2 rounded animate-fade-in-fast">
                                        <div className="flex justify-between font-bold mb-1">
                                            <span className="text-slate-300">{arb.symbol}</span>
                                            <span className="text-green-400">+{arb.spreadPercent.toFixed(3)}%</span>
                                        </div>
                                        <div className="text-[8px] text-slate-500 flex justify-between uppercase">
                                            <span>Buy: {arb.buyVenue}</span>
                                            <span>Sell: {arb.sellVenue}</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Sector 2: Apex Predators */}
                <div className="lg:col-span-1 bg-black/50 border border-slate-800 p-4 rounded-lg flex flex-col">
                    <h4 className="text-amber-500 font-bold mb-3 flex items-center gap-2 uppercase tracking-tighter">
                        [APEX TARGETS]
                    </h4>
                    <div className="flex-1 overflow-y-auto space-y-2">
                        {apexTargets.map((target, i) => (
                            <div key={i} className="bg-black/40 border border-slate-700 p-2 rounded hover:border-amber-500/50 transition-colors">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="font-bold text-slate-200 uppercase">{target.alias}</span>
                                    <span className="text-[8px] bg-black/80 border border-red-500/50 text-red-400 px-2 py-0.5 rounded shadow-[0_0_5px_rgba(239,68,68,0.4)]">THREAT: {target.threatLevel}</span>
                                </div>
                                <div className="text-[10px] text-slate-500 flex justify-between">
                                    <span className="font-mono">{target.address}</span>
                                    <span className="text-amber-500/80">{target.lastVector}</span>
                                </div>
                                <div className="mt-1 flex gap-1">
                                    {[...Array(5)].map((_, j) => (
                                        <div key={j} className={`h-0.5 w-full ${j < target.threatLevel ? 'bg-red-500' : 'bg-slate-800'} shadow-[0_0_2px_red]`}></div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Sector 3: Dark Forest Sonar */}
                <div className="bg-black/50 border border-slate-800 p-4 rounded-lg flex flex-col relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-10">
                        <div className="sonar-grid"></div>
                        {sonarActive && <div className="sonar-sweep"></div>}
                    </div>
                    
                    <h4 className="text-violet-400 font-bold mb-3 flex items-center gap-2 uppercase z-10">
                        <RadarIcon className="w-3 h-3" /> DARK FOREST SONAR
                    </h4>
                    
                    <div className="flex-1 border border-violet-900/30 rounded flex items-center justify-center relative z-10 mb-4 bg-violet-950/5">
                        <div className="relative w-32 h-32 rounded-full border border-violet-500/20 flex items-center justify-center">
                            <div className="w-1 h-1 bg-violet-400 rounded-full animate-ping"></div>
                            <div className="absolute inset-0 border border-violet-500/10 rounded-full scale-75"></div>
                            <div className="absolute inset-0 border border-violet-500/10 rounded-full scale-50"></div>
                        </div>
                    </div>

                    <div className="space-y-1 text-[10px] z-10">
                        <div className="flex justify-between text-violet-300 animate-pulse font-bold">
                            <span>MEV_ACTIVE:</span>
                            <span>8 UNITS (CLUSTER_B)</span>
                        </div>
                        <div className="text-slate-500 italic">&gt;&gt; ROUTING GHOST PATHS... BLINDING BOTS.</div>
                    </div>
                </div>
            </div>

            {/* Sector 4: Zero-Block Intercepts */}
            <div className="mt-6 bg-black/50 border border-amber-900/30 p-4 rounded-lg">
                <h4 className="text-amber-500 font-bold mb-3 uppercase tracking-[0.2em]">[GENESIS INTERCEPTOR FEED]</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {intercepts.length === 0 ? (
                        <div className="col-span-full py-4 text-center text-slate-600 italic">No genesis blocks currently intercepted. Null-space clear.</div>
                    ) : (
                        intercepts.map((asset, i) => (
                            <div key={i} className="border-l-2 border-amber-600 pl-3 py-1 bg-amber-900/5 hover:bg-amber-900/10 transition-colors cursor-pointer">
                                <div className="text-slate-200 font-bold uppercase">{asset.codename}</div>
                                <div className="text-[9px] text-slate-500 font-mono mb-1">{asset.contract}</div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[8px] text-green-500 bg-green-900/20 px-1 font-bold uppercase">Audit: {asset.auditStatus}</span>
                                    <span className="text-[8px] text-slate-400 uppercase">Liq: {asset.liquidity}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default OmniSentryTab;
