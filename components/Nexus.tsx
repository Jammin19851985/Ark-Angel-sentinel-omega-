import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { SovereignCommandCenter } from './SovereignCommandCenter';
import GammaScalper from './GammaScalper';
import ActiveGodProtocol from './ActiveGodProtocol';
import ForensicAuditLog from './ForensicAuditLog';
import HyperTemporalExecution from './HyperTemporalExecution';
import ChaosFractal from './ChaosFractal';
import SovereignFinancialManifestation from './SovereignFinancialManifestation';
import HardwareController from './HardwareController';
import SystemMonitor from './SystemMonitor';
import SICOControl from './SICOControl';
import AlphaGauge from './AlphaGauge';
import SwarmVisualizer from './SwarmVisualizer';
import CandlestickChart from './charts/CandlestickChart';
import { CandlestickData } from '../types';
import { LivePaperBadge } from './LivePaperBadge';
import { marketService } from '../services/marketService';
import Loader from './Loader';
import GlitchText from './GlitchText';
import { ActivityIcon } from './icons/ActivityIcon';

interface NexusProps { id: string; }

const StatusIndicator: React.FC<{ label: string, value: number, color?: string, animate?: boolean }> = ({ label, value, color = 'bg-cyan-500', animate }) => (
    <div className="space-y-1 group">
        <div className="flex justify-between text-[8px] font-mono text-slate-500 uppercase group-hover:text-cyan-400 transition-colors">
            <span>{label}</span>
            <span className={animate ? 'text-cyan-400 animate-pulse' : 'text-slate-300'}>{(value * 100).toFixed(2)}%</span>
        </div>
        <div className="w-full h-1 bg-black rounded-sm overflow-hidden border border-slate-800 group-hover:border-cyan-500/30 transition-colors">
            <div 
                className={`h-full ${color} transition-all duration-1000 ease-out relative`} 
                style={{ width: `${Math.min(100, Math.max(0, value * 100))}%` }}
            >
                <div className="absolute inset-0 bg-white/20 animate-[shimmer_1s_infinite]"></div>
            </div>
        </div>
    </div>
);

const YellowHubTerminal: React.FC = () => {
    const [lines, setLines] = useState<string[]>([]);
    const logPool = [
        "[COMMAND CENTER] RECEIVING UPDATE PACKET...",
        "[SUCCESS] CANADIAN_MARKET_UNIFICATION SYNCED.",
        "[SENTINEL] Pete_The_Raccoon monitoring Tweed Node.",
        "[MEMORY] Woodworking_Joinery_Solid verified.",
        "[RHYTHM] Open_G_Resonance: 1.01e41 Hz",
        "[STATUS] MASTER_LOADER: READY FOR TSX ORDERS."
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setLines(prev => [...prev, logPool[Math.floor(Math.random() * logPool.length)]].slice(-6));
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="bg-black/80 border border-yellow-500/30 rounded p-2 h-32 overflow-hidden font-mono text-[9px]">
            <div className="text-yellow-500 font-bold mb-1 border-b border-yellow-500/20 pb-1 flex justify-between">
                <span>YELLOW_HUB // ONTARIO_NODE</span>
                <span className="animate-pulse">ONLINE</span>
            </div>
            {lines.map((line, i) => (
                <div key={i} className="text-yellow-400 opacity-80 animate-fade-in truncate">
                    <span className="text-yellow-700 mr-1">&gt;&gt;&gt;</span>{line}
                </div>
            ))}
        </div>
    );
};

const Nexus: React.FC<NexusProps> = ({ id }) => {
    const { 
        isNexusOnline, setNexusOnline, nexusLogs, addNexusLog, 
        quantumMetrics, inversionLogs, killSwitchActive,
        coreState, systemStatus,
        marketData, isGodMode,
        sicoCollapses, payPalReserves,
        performRealityCorrection
    } = useAppContext();
    
    const logRef = useRef<HTMLDivElement>(null);
    const [realityCorrectorActive, setRealityCorrectorActive] = useState(false);
    const [historyData, setHistoryData] = useState<CandlestickData[]>([]);
    const [isHistoryLoading, setIsHistoryLoading] = useState(true);

    useEffect(() => {
        if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
    }, [nexusLogs]);

    useEffect(() => {
        const fetchHistory = async () => {
            setIsHistoryLoading(true);
            try {
                const data = await marketService.getHistory('SHOP.TO', 3600);
                setHistoryData(data);
            } catch (e) {
                console.error("Nexus History Error:", e);
            } finally {
                setIsHistoryLoading(false);
            }
        };
        if (isNexusOnline) fetchHistory();
    }, [isNexusOnline]);

    useEffect(() => {
        const interval = setInterval(() => {
            if (isNexusOnline && Math.random() > 0.97) {
                setRealityCorrectorActive(true);
                addNexusLog(">> REALITY_AUTO_CORRECTOR: CANADIAN DRIFT NULLIFIED.");
                setTimeout(() => setRealityCorrectorActive(false), 500);
            }
        }, 8000);
        return () => clearInterval(interval);
    }, [isNexusOnline, addNexusLog]);

    const handleToggleLaunch = () => {
        if (isNexusOnline) {
            setNexusOnline(false);
            addNexusLog(">> YELLOW_HUB OFFLINE.");
        } else {
            setNexusOnline(true);
            addNexusLog(">> ARCHANGEL OMEGA: Tweed Node Active.");
            addNexusLog(">> Pete_The_Raccoon: Jurisdiction Tweed, ON.");
        }
    };

    return (
        <div id={id} className={`flex flex-col h-full w-full bg-[#030304] relative transition-all duration-700 ${realityCorrectorActive ? 'shadow-[inset_0_0_150px_rgba(255,0,0,0.3)]' : ''}`}>
            
            <div className="relative z-20 flex flex-col lg:flex-row justify-between items-center p-3 border-b border-slate-800 bg-black/80 backdrop-blur-xl gap-4 shrink-0">
                <div className="flex flex-col">
                    <div className="flex items-center gap-3">
                        <h2 className={`text-2xl font-display font-bold tracking-[0.2em] uppercase ${killSwitchActive ? 'text-red-500' : isGodMode ? 'text-yellow-500' : 'text-cyan-400'}`}>
                            <GlitchText text={`ARK Ω // ${killSwitchActive ? 'HALTED' : isGodMode ? 'YELLOW_HUB' : 'TWEED_ONTARIO'}`} isActive={isGodMode || killSwitchActive} />
                        </h2>
                        <div className="flex items-center gap-2">
                            <span className={`bg-black border ${isGodMode ? 'border-yellow-900 text-yellow-500' : 'border-slate-700 text-slate-300'} px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest shadow-lg`}>
                                STATUS: <span className="animate-pulse">{systemStatus}</span>
                            </span>
                            <div className="flex items-center gap-2 px-2 py-0.5 bg-amber-900/20 border border-amber-500/30 rounded text-[9px] font-mono text-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.2)]">
                                <ActivityIcon className="w-3 h-3" />
                                <span className="font-bold">SICO_COLLAPSES: {sicoCollapses.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center space-x-3">
                    <div className="hidden lg:flex items-center gap-4 mr-4 bg-blue-950/20 px-3 py-1 border border-blue-900/50 rounded">
                         <span className="text-[8px] text-blue-400 uppercase font-bold tracking-widest">PayPal Reserves:</span>
                         <span className="text-xs text-blue-200 font-mono font-bold">${payPalReserves.totalUSD.toLocaleString()}</span>
                    </div>
                    <LivePaperBadge />
                    <button
                        onClick={handleToggleLaunch}
                        className={`px-4 py-1.5 font-bold text-[10px] tracking-[0.2em] border transition-all hover:bg-white/5 ${isNexusOnline ? 'text-red-500 border-red-900' : 'text-yellow-500 border-yellow-900'}`}
                    >
                        {isNexusOnline ? 'SEVER_UPLINK' : 'INIT_MASTER_LOADER'}
                    </button>
                </div>
            </div>

            <div className="relative flex-1 grid grid-cols-1 xl:grid-cols-4 gap-4 p-4 z-10 overflow-y-auto min-h-0 custom-scrollbar">
                {/* Left Sidebar: Logic & Monitoring */}
                <div className="flex flex-col space-y-3 shrink-0">
                    <SovereignCommandCenter />
                    <YellowHubTerminal />
                    <SystemMonitor />
                    <SICOControl />
                    <div className="p-3 bg-black/40 border border-slate-800/60 rounded-sm flex flex-col space-y-3">
                        <h3 className="text-[10px] font-bold text-yellow-500 tracking-widest uppercase border-b border-slate-800 pb-1">Pete's Authority</h3>
                        <StatusIndicator label="Ontario Resonance" value={0.999} color="bg-yellow-500" />
                        <StatusIndicator label="Crockett Handshake" value={coreState.confidence} color="bg-violet-500" />
                        <StatusIndicator label="Reality Stability" value={quantumMetrics.realityAnchorStability} color="bg-emerald-500" />
                        <StatusIndicator label="Quantum Entropy" value={quantumMetrics.entropy} color="bg-red-500" />
                    </div>
                    <div className="h-40 shrink-0 overflow-hidden rounded border border-slate-800">
                        <ChaosFractal entropy={quantumMetrics.entropy} />
                    </div>
                </div>

                {/* Central Focus: Charts & God Protocols */}
                <div className="xl:col-span-2 flex flex-col space-y-4 shrink-0 h-full min-h-[600px]">
                    <div className="flex-1 flex flex-col relative border border-slate-800/30 bg-black/40 rounded-sm overflow-hidden group">
                        <div className="absolute top-4 left-4 z-20 flex flex-col gap-1">
                            <h3 className="text-xs font-bold text-yellow-500 font-mono tracking-widest uppercase flex items-center gap-2">
                                <span className="w-2 h-2 bg-yellow-500 rounded-full animate-ping"></span>
                                SHOP.TO // TSX_NATIVE_STREAM
                            </h3>
                        </div>
                        <div className="flex-1 w-full p-4 flex flex-col">
                            {isHistoryLoading ? (
                                <div className="flex-1 flex flex-col items-center justify-center gap-4">
                                    <Loader />
                                    <span className="text-[10px] font-mono text-yellow-500 animate-pulse tracking-widest uppercase">SYPHONING_NATIVE...</span>
                                </div>
                            ) : (
                                <div className="flex-1 animate-fade-in">
                                    <CandlestickChart data={historyData} />
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-64 shrink-0">
                         <div className="tech-panel overflow-hidden">
                             <AlphaGauge id="nexus-alpha" />
                         </div>
                         <div className="tech-panel overflow-hidden">
                             <GammaScalper id="nexus-gamma" />
                         </div>
                    </div>
                    <div className="h-48 shrink-0">
                         <ActiveGodProtocol />
                    </div>
                </div>

                {/* Right Sidebar: Execution & Logistics */}
                <div className="flex flex-col space-y-3 shrink-0">
                    <div className="h-64 shrink-0 tech-panel">
                        <SwarmVisualizer id="nexus-swarm" />
                    </div>
                    <HardwareController />
                    <SovereignFinancialManifestation />
                    <div className="flex-1 min-h-[300px]">
                        <HyperTemporalExecution />
                    </div>
                </div>
            </div>
            
            {/* Background Decorative Overlay */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] z-0" style={{backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)', backgroundSize: '24px 24px'}}></div>
        </div>
    );
};

export default Nexus;