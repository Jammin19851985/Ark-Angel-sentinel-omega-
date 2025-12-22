
import React, { useState, useEffect, useCallback } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { ApexTarget, InterceptedAsset } from '../../types';
import Loader from '../Loader';
import { ShieldIcon } from '../icons/ShieldIcon';
import { SearchIcon } from '../icons/SearchIcon';
import { RadarIcon } from '../icons/RadarIcon';
import { CrosshairIcon } from '../icons/CrosshairIcon';

const INITIAL_TARGETS: ApexTarget[] = [
    { alias: "Market_Maker_Alpha", address: "0x7a2...", threatLevel: 5, lastVector: "FRONT_RUN_DETECTION", confidence: 0.99 },
    { alias: "Insider_Cabal_X", address: "0x99c...", threatLevel: 4, lastVector: "ACCUMULATION_BURST", confidence: 0.95 },
    { alias: "Shadow_Whale_Ω", address: "0x3f5...", threatLevel: 3, lastVector: "OFF_RAMP_SIMULATION", confidence: 0.88 },
];

const OmniSentryTab: React.FC = () => {
    const { addLog } = useAppContext();
    const [isScanning, setIsScanning] = useState(false);
    const [apexTargets, setApexTargets] = useState<ApexTarget[]>(INITIAL_TARGETS);
    const [intercepts, setIntercepts] = useState<InterceptedAsset[]>([]);
    const [sonarActive, setSonarActive] = useState(true);

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
                    <h3 className="text-lg font-bold text-amber-500 uppercase tracking-widest">// OMNI-SENTRY WING</h3>
                    <p className="text-slate-500">PROPRIETARY RECONNAISSANCE & INTERCEPTION</p>
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={startScan}
                        disabled={isScanning}
                        className="bg-amber-600 hover:bg-amber-500 text-black px-4 py-2 rounded font-bold transition-all flex items-center gap-2"
                    >
                        {isScanning ? <Loader /> : <CrosshairIcon className="w-4 h-4" />}
                        {isScanning ? 'SCANNING...' : 'INITIATE RECON'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
                {/* Sector 1: Vectors & Pressure */}
                <div className="flex flex-col space-y-4">
                    <div className="bg-black/50 border border-slate-800 p-4 rounded-lg">
                        <h4 className="text-amber-400 font-bold mb-3 flex items-center gap-2">
                            <SearchIcon className="w-3 h-3" /> VELOCITY VECTORS
                        </h4>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-slate-400">BTC-SIG</span>
                                <span className="text-green-400 font-bold">+88.2 (High)</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400">ETH-SIG</span>
                                <span className="text-red-400 font-bold">-12.4 (Weak)</span>
                            </div>
                            <div className="w-full bg-slate-900 h-1 rounded overflow-hidden">
                                <div className="bg-amber-500 h-full w-3/4 animate-pulse"></div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-black/50 border border-slate-800 p-4 rounded-lg">
                        <h4 className="text-cyan-400 font-bold mb-3 flex items-center gap-2">
                            <ShieldIcon className="w-3 h-3" /> BASIS PRESSURE
                        </h4>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-slate-400">BTC-PERP</span>
                                <span className="text-cyan-400">Contango (+0.5%)</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400">ETH-PERP</span>
                                <span className="text-slate-500">Backward (-0.1%)</span>
                            </div>
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
                                    <span className="font-bold text-slate-200">{target.alias}</span>
                                    <span className="text-[8px] bg-red-950 text-red-400 px-1 rounded">THREAT: {target.threatLevel}</span>
                                </div>
                                <div className="text-[10px] text-slate-500 flex justify-between">
                                    <span>{target.address}</span>
                                    <span className="text-amber-500/80">{target.lastVector}</span>
                                </div>
                                <div className="mt-1 flex gap-1">
                                    {[...Array(target.threatLevel)].map((_, j) => (
                                        <div key={j} className="h-0.5 w-full bg-red-500 shadow-[0_0_2px_red]"></div>
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
                        <div className="flex justify-between text-violet-300 animate-pulse">
                            <span>MEV_DETECTED:</span>
                            <span>3 UNITS</span>
                        </div>
                        <div className="text-slate-500 italic">>> Routing avoidance paths...</div>
                    </div>
                </div>
            </div>

            {/* Sector 4: Zero-Block Intercepts */}
            <div className="mt-6 bg-black/50 border border-amber-900/30 p-4 rounded-lg">
                <h4 className="text-amber-500 font-bold mb-3 uppercase tracking-[0.2em]">[ZERO-BLOCK INTERCEPTS]</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {intercepts.length === 0 ? (
                        <div className="col-span-full py-4 text-center text-slate-600 italic">No genesis blocks currently intercepted.</div>
                    ) : (
                        intercepts.map((asset, i) => (
                            <div key={i} className="border-l-2 border-amber-600 pl-3 py-1 bg-amber-900/5">
                                <div className="text-slate-200 font-bold">{asset.codename}</div>
                                <div className="text-[9px] text-slate-500 font-mono mb-1">{asset.contract}</div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[8px] text-green-500 bg-green-900/20 px-1">AUDIT: {asset.auditStatus}</span>
                                    <span className="text-[8px] text-slate-400">LIQ: {asset.liquidity}</span>
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
