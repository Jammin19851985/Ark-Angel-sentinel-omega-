
import React, { useState, useCallback, useMemo } from 'react';
import { OrchestrationStep, LegionName } from '../types';
import { runAgenticOrchestration, agentTools, godModeAgentTools } from '../services/geminiService';
import Loader from './Loader';
import { PlayCircleIcon } from './icons/PlayCircleIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { XCircleIcon } from './icons/XCircleIcon';
import { HourglassIcon } from './icons/HourglassIcon';
import GodModeToggle from './GodModeToggle';
import { FunctionDeclaration } from '@google/genai';
import { ShieldIcon } from './icons/ShieldIcon';
import { CpuChipIcon } from './icons/CpuChipIcon';
import { NetworkIcon } from './icons/NetworkIcon';
import { DownloadIcon } from './icons/DownloadIcon';
import { CrosshairIcon } from './icons/CrosshairIcon';
import { useAppContext } from '../contexts/AppContext';
import { LivePaperBadge } from './LivePaperBadge';

interface AgentOrchestratorProps {
    id: string; 
    mission: string;
    handleMissionChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}


const AgentOrchestrator: React.FC<AgentOrchestratorProps> = ({ 
    id, 
    mission,
    handleMissionChange,
}) => {
    const { 
        addLog, 
        isGodMode, 
        setIsGodMode, 
        isGodModeUnlocked, 
        optimizeSwarm,
        isSwarmOptimized,
        swarmOptimizationReport,
        bots,
        executeOperation,
        installProtocol,
        runSystem,
        killSwitchActive,
        systemStatus
    } = useAppContext();

    const [plan, setPlan] = useState<OrchestrationStep[]>([]);
    const [finalResult, setFinalResult] = useState<string | null>(null);
    const [isExecuting, setIsExecuting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isOptimizing, setIsOptimizing] = useState(false);
    const [activeSovereignOp, setActiveSovereignOp] = useState<string | null>(null);
    const [stepToDelete, setStepToDelete] = useState<string | null>(null);
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

    const allTools = useMemo(() => {
        const toolMap = new Map<string, FunctionDeclaration>();
        [...agentTools, ...godModeAgentTools].forEach(tool => {
            if (tool.name) {
                toolMap.set(tool.name, tool);
            }
        });
        return toolMap;
    }, []);
    
    const handleOptimizeSwarm = useCallback(async () => {
        setIsOptimizing(true);
        setError(null);
        
        try {
            await optimizeSwarm(); 
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "An unknown error occurred during optimization.";
            setError(errorMessage);
            addLog('ERROR', `Swarm optimization failed: ${errorMessage}`);
        } finally {
            setIsOptimizing(false);
        }
    }, [optimizeSwarm, addLog]);

    const executeMission = useCallback(async () => {
        if (!mission.trim() || isExecuting) return;
        
        setIsExecuting(true);
        setError(null);
        setPlan([]);
        setFinalResult(null);

        // Special handling for Initiate Swarm Command
        if (mission.includes('INITIATE_SWARM_PROTOCOL')) {
            addLog('SWARM', `COMMAND RECEIVED: INITIATE_SWARM_PROTOCOL --files ALL --agents 2500 --mode GOD_MODE`);
            addLog('LEGION', `Legion 1 (Trading): ACTIVE. Hunting Alpha with Ghost Pulse.`);
            addLog('LEGION', `Legion 2 (Growth): ACTIVE. Generating Leads via Lead Scout agents.`);
            addLog('LEGION', `Legion 3 (Defense): ACTIVE. Scanning Ontario Car Leases for CPA violations.`);
            addLog('LEGION', `Legion 4 (Infra): ACTIVE. Securing zkTLS Bridges.`);
        }

        const mode = isGodMode ? "God Mode" : "Safe Mode";
        addLog('ORCHESTRATOR', `Executing mission in ${mode}: "${mission}"`);

        try {
            await runAgenticOrchestration(mission, isGodMode, handleStepUpdate, handlePlanReady, handleFinalResult);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "An unknown error occurred during orchestration.";
            setError(errorMessage);
            addLog('ERROR', `Mission failed: ${errorMessage}`);
        } finally {
            setIsExecuting(false);
        }
    }, [mission, isExecuting, isGodMode, addLog]);
    
    const handleStepUpdate = useCallback((updatedStep: OrchestrationStep) => {
        setPlan(prevPlan => prevPlan.map(step => step.id === updatedStep.id ? updatedStep : step));
    }, []);

    const handlePlanReady = useCallback((initialPlan: OrchestrationStep[]) => {
        addLog('ORCHESTRATOR', `Mission plan received with ${initialPlan.length} steps.`);
        setPlan(initialPlan);
    }, [addLog]);

    const handleFinalResult = useCallback((result: string) => {
        addLog('ORCHESTRATOR', 'Mission completed successfully.');
        setFinalResult(result);
    }, [addLog]);

    const triggerSovereignOp = async (op: 'EXECUTE' | 'INSTALL' | 'RUN') => {
        if (killSwitchActive) return;
        setActiveSovereignOp(op);
        
        try {
            if (op === 'EXECUTE') await executeOperation();
            if (op === 'INSTALL') await installProtocol();
            if (op === 'RUN') await runSystem();
        } finally {
             // Reset state after a delay for visual finality
             setTimeout(() => setActiveSovereignOp(null), 1000);
        }
    };

    const confirmDeleteStep = useCallback(() => {
        if (stepToDelete) {
            setPlan(prev => prev.filter(step => step.id !== stepToDelete));
            addLog('ORCHESTRATOR', `Step ${stepToDelete} purged from mission plan.`);
            setStepToDelete(null);
        }
    }, [stepToDelete, addLog]);

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
        setDraggedIndex(index);
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", index.toString());
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>, index: number) => {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === index) return;

        const newPlan = [...plan];
        const [movedItem] = newPlan.splice(draggedIndex, 1);
        newPlan.splice(index, 0, movedItem);

        setPlan(newPlan);
        setDraggedIndex(null);
    };

    const handleDragEnd = () => {
        setDraggedIndex(null);
    };

    const StatusIcon: React.FC<{ status: OrchestrationStep['status'] }> = ({ status }) => {
        switch (status) {
            case 'completed': return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
            case 'in_progress': return <Loader />;
            case 'failed': return <XCircleIcon className="w-5 h-5 text-red-500" />;
            case 'pending': return <HourglassIcon className="w-5 h-5 text-slate-500" />;
            default: return null;
        }
    };
    
    const renderMarkdown = (text: string) => {
        return text.split('\n').map((line, i) => {
            if (line.startsWith('### ')) return <h3 key={i} className="text-sm font-bold text-amber-400 mt-4 mb-2 uppercase tracking-tighter border-b border-amber-900/30 pb-1">{line.substring(4)}</h3>;
            if (line.startsWith('## ')) return <h2 key={i} className="text-md font-bold text-cyan-400 mt-6 mb-3 uppercase tracking-widest">{line.substring(3)}</h2>;
            if (line.startsWith('* ')) return <li key={i} className="ml-4 text-slate-300 mb-1 flex items-start gap-2"><span className="text-amber-500">›</span><span>{line.substring(2)}</span></li>;
            if (line.trim() === '') return <div key={i} className="h-2"></div>;
            return <p key={i} className="leading-relaxed text-slate-400 text-[11px] mb-2">{line}</p>;
        });
    };

    return (
        <div id={id} className="tech-panel flex flex-col h-full overflow-hidden relative">
            {/* Global Cascade Visual Overlays */}
            {systemStatus.includes("CASCADE") && (
                <div className="absolute inset-0 z-50 pointer-events-none border-4 border-amber-500/50 animate-pulse bg-amber-500/5 backdrop-blur-[2px]">
                    <div className="absolute top-0 left-0 w-full h-[2px] bg-amber-400 animate-scan"></div>
                </div>
            )}
            {systemStatus.includes("AWAKENING") && (
                <div className="absolute inset-0 z-50 pointer-events-none border-4 border-green-500/50 animate-pulse bg-green-500/5 backdrop-blur-[2px]">
                     <div className="absolute top-0 left-0 w-full h-[2px] bg-green-400 animate-scan"></div>
                </div>
            )}

            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-black/40">
                <div className="flex items-center gap-3">
                    <div className={`p-1 rounded ${systemStatus.includes("LIVE") ? 'bg-green-950/20 border-green-500 shadow-[0_0_10px_green]' : 'bg-amber-950/20 border-amber-900'}`}>
                         <NetworkIcon className={`w-4 h-4 ${systemStatus.includes("LIVE") ? 'text-green-400' : 'text-amber-500'}`} />
                    </div>
                    <div>
                        <h2 className="text-xs font-bold text-slate-100 font-mono tracking-widest uppercase">// AGENT ORCHESTRATOR</h2>
                        <div className="text-[8px] text-slate-500 font-mono uppercase tracking-[0.2em]">STATUS: <span className="text-cyan-400 animate-pulse">{systemStatus}</span></div>
                    </div>
                </div>
                <div className="flex gap-4 items-center">
                    <LivePaperBadge />
                    <div className="text-[10px] font-mono text-slate-500 uppercase bg-slate-900 px-2 py-1 rounded border border-slate-800">
                        Swarm_Load: <span className="text-amber-500 font-bold">{bots.length} Units</span>
                    </div>
                </div>
            </div>
            
            <div className="flex-1 p-4 grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-y-auto bg-black/20 custom-scrollbar">
                <div className="flex flex-col space-y-4">
                     {/* SOVEREIGN QUICK ACTIONS */}
                     <div className="grid grid-cols-3 gap-3">
                        <button 
                            onClick={() => triggerSovereignOp('EXECUTE')}
                            disabled={!!activeSovereignOp || killSwitchActive}
                            className={`group relative h-16 flex flex-col items-center justify-center gap-1 rounded-sm border-2 border-b-8 font-mono text-[9px] font-bold tracking-widest transition-all active:border-b-2 active:translate-y-[4px] ${
                                activeSovereignOp === 'EXECUTE' 
                                ? 'bg-amber-600 text-black border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.4)]' 
                                : 'bg-black border-amber-900/50 text-amber-500 hover:bg-amber-950/20 hover:border-amber-500'
                            }`}
                        >
                            <div className="absolute inset-0 bg-amber-500/5 group-hover:bg-amber-500/10 transition-colors pointer-events-none"></div>
                            {activeSovereignOp === 'EXECUTE' ? <Loader /> : <CrosshairIcon className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform"/>}
                            EXECUTE_CASCADE
                        </button>
                        <button 
                            onClick={() => triggerSovereignOp('INSTALL')}
                            disabled={!!activeSovereignOp || killSwitchActive}
                            className={`group relative h-16 flex flex-col items-center justify-center gap-1 rounded-sm border-2 border-b-8 font-mono text-[9px] font-bold tracking-widest transition-all active:border-b-2 active:translate-y-[4px] ${
                                activeSovereignOp === 'INSTALL' 
                                ? 'bg-cyan-600 text-black border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.4)]' 
                                : 'bg-black border-cyan-900/50 text-cyan-500 hover:bg-cyan-950/20 hover:border-cyan-500'
                            }`}
                        >
                            <div className="absolute inset-0 bg-cyan-500/5 group-hover:bg-cyan-500/10 transition-colors pointer-events-none"></div>
                            {activeSovereignOp === 'INSTALL' ? <Loader /> : <DownloadIcon className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform"/>}
                            INSTALL_AXIOMS
                        </button>
                        <button 
                            onClick={() => triggerSovereignOp('RUN')}
                            disabled={!!activeSovereignOp || killSwitchActive}
                            className={`group relative h-16 flex flex-col items-center justify-center gap-1 rounded-sm border-2 border-b-8 font-mono text-[9px] font-bold tracking-widest transition-all active:border-b-2 active:translate-y-[4px] ${
                                activeSovereignOp === 'RUN' 
                                ? 'bg-green-600 text-black border-green-400 shadow-[0_0_20px_rgba(34,197,94,0.4)]' 
                                : 'bg-black border-green-900/50 text-green-500 hover:bg-green-950/20 hover:border-green-500'
                            }`}
                        >
                            <div className="absolute inset-0 bg-green-500/5 group-hover:bg-green-500/10 transition-colors pointer-events-none"></div>
                            {activeSovereignOp === 'RUN' ? <Loader /> : <PlayCircleIcon className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform"/>}
                            AWAKEN_LIVING
                        </button>
                     </div>

                     <div className="bg-black/40 border border-slate-800 p-4 rounded shadow-inner">
                        <label htmlFor="mission-prompt" className="block text-[10px] font-bold text-amber-500 mb-3 uppercase tracking-widest flex items-center gap-2">
                             <div className="w-1 h-1 bg-amber-500 rounded-full animate-ping"></div>
                             Prime Objective Definition
                        </label>
                        <textarea
                            id="mission-prompt"
                            value={mission}
                            onChange={handleMissionChange}
                            rows={5}
                            className="w-full bg-slate-900/50 border border-slate-700 rounded p-3 text-[11px] text-slate-200 font-mono focus:ring-1 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all placeholder-slate-700"
                            placeholder="e.g. INITIATE_SWARM_PROTOCOL --agents 2500 --mode OMEGA --sector DARK_POOL"
                        />
                    </div>

                    <div className="flex items-center justify-between gap-4">
                        <button
                            onClick={executeMission}
                            disabled={isExecuting || !mission.trim() || isOptimizing}
                            className="inline-flex flex-grow items-center justify-center px-6 py-4 border-2 border-b-8 border-amber-600 text-[12px] font-bold uppercase tracking-widest rounded shadow-2xl text-white bg-amber-600 hover:bg-amber-500 active:border-b-2 active:translate-y-[6px] disabled:bg-slate-800 disabled:border-slate-900 disabled:text-slate-600 disabled:cursor-not-allowed transition-all group"
                        >
                            {isExecuting ? (
                                <>
                                    <Loader />
                                    <span className="ml-3 animate-pulse">DEPLOYING_LEGIONS...</span>
                                </>
                            ) : (
                                <>
                                    <NetworkIcon className="w-5 h-5 mr-3 text-amber-100 group-hover:scale-110 transition-transform" />
                                    Launch Swarm Cascade
                                </>
                            )}
                        </button>
                        
                        <div className="flex flex-col gap-1 items-end">
                             <span className="text-[8px] text-slate-600 font-bold uppercase mr-1">Authorization</span>
                             {isGodModeUnlocked ? (
                                <GodModeToggle 
                                    isGodMode={isGodMode}
                                    setIsGodMode={setIsGodMode}
                                    isLoading={isExecuting || isOptimizing}
                                />
                            ) : (
                                <div className="flex items-center space-x-2 text-[9px] font-mono text-slate-500 border border-slate-800 rounded px-3 py-2 bg-black/50 backdrop-blur-sm grayscale">
                                     <ShieldIcon className="w-3 h-3" />
                                     <span>RESTRICTED</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="border-t border-slate-800 pt-4 space-y-3">
                         <h3 className="text-[10px] font-bold text-slate-500 font-mono tracking-widest uppercase">Expert System Synthesis</h3>
                         <button
                            onClick={handleOptimizeSwarm}
                            disabled={isExecuting || isOptimizing || isSwarmOptimized}
                            className={`w-full inline-flex items-center justify-center px-4 py-3 border-2 border-b-4 text-[10px] font-bold uppercase tracking-widest rounded shadow-sm transition-all active:border-b-2 active:translate-y-[2px] group disabled:cursor-not-allowed ${
                                isSwarmOptimized 
                                ? 'bg-emerald-950/20 border-emerald-500 text-emerald-400' 
                                : 'bg-zinc-900 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white'
                            }`}
                        >
                            {isOptimizing ? (
                                <>
                                    <Loader />
                                    <span className="ml-3">CALCULATING_OPTIMAL_MIXTURE...</span>
                                </>
                            ) : isSwarmOptimized ? (
                                 <>
                                    <CheckCircleIcon className="w-4 h-4 mr-2 text-emerald-400" />
                                    Collective Intelligence Converged
                                </>
                            ) : (
                                <>
                                    <CpuChipIcon className="w-4 h-4 mr-2 text-amber-300" />
                                    Engage Swarm Optimization
                                </>
                            )}
                        </button>
                    </div>
                    {error && (
                         <div className="bg-red-950/40 border border-red-500/40 text-red-200 px-4 py-3 rounded text-[10px] mt-4 font-mono shadow-2xl">
                            <p className="font-bold text-red-500 mb-1 flex items-center gap-2">
                                <ShieldIcon className="w-3 h-3" />
                                EXECUTION_FAULT_DETECTED:
                            </p>
                            <p className="italic opacity-80">"{error}"</p>
                         </div>
                     )}
                </div>

                <div className="flex flex-col space-y-4 min-h-0">
                    <div className="flex-1 bg-black/50 backdrop-blur-md rounded border border-slate-800 p-4 shadow-inner flex flex-col min-h-0 overflow-hidden relative">
                         {/* Scrollable Feed */}
                         <div className="flex justify-between items-center mb-4 flex-shrink-0">
                             <h3 className="text-[10px] font-bold text-slate-500 font-mono uppercase tracking-widest flex items-center gap-2">
                                 <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse"></div>
                                 Live Execution Pipeline
                             </h3>
                             <span className="text-[8px] font-mono text-slate-700">MLEM_VERIFIED: 100%</span>
                         </div>

                        <div className="flex-1 space-y-3 overflow-y-auto pr-2 custom-scrollbar min-h-0">
                            {swarmOptimizationReport && (
                                <div className="bg-amber-950/10 backdrop-blur-sm p-4 rounded border border-amber-500/30 animate-fade-in-fast relative overflow-hidden group">
                                   <div className="absolute top-0 right-0 p-1 text-[8px] font-bold text-amber-900 group-hover:text-amber-500 transition-colors uppercase">Synthesis_Report</div>
                                   <div className="prose prose-sm prose-invert max-w-none">
                                       {renderMarkdown(swarmOptimizationReport)}
                                   </div>
                                </div>
                            )}
                            
                            {plan.map((step, index) => (
                                <div 
                                    key={step.id} 
                                    draggable={!isExecuting && !isOptimizing}
                                    onDragStart={(e) => handleDragStart(e, index)}
                                    onDragOver={handleDragOver}
                                    onDrop={(e) => handleDrop(e, index)}
                                    onDragEnd={handleDragEnd}
                                    className={`bg-black/60 backdrop-blur-sm p-3 rounded border transition-all group relative 
                                        ${!isExecuting && !isOptimizing ? 'cursor-grab active:cursor-grabbing' : ''}
                                        ${draggedIndex === index ? 'opacity-40 border-dashed border-slate-600' : 'border-slate-800'}
                                        ${step.status === 'in_progress' ? 'border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.1)]' : (!draggedIndex ? 'hover:border-slate-700 hover:bg-slate-900/40' : '')}
                                    `}
                                >
                                    <div className="flex items-start space-x-3">
                                        {!isExecuting && !isOptimizing && (
                                            <div className="mt-1.5 opacity-0 group-hover:opacity-50 cursor-grab flex-shrink-0 grid grid-cols-2 gap-[2px] w-[6px]">
                                                {[...Array(6)].map((_, i) => <div key={i} className="w-[2px] h-[2px] bg-slate-400 rounded-full"/>)}
                                            </div>
                                        )}
                                        <div className="mt-0.5 flex-shrink-0">
                                          <StatusIcon status={step.status} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <p className="text-[11px] text-slate-200 font-mono leading-relaxed select-none truncate group-hover:whitespace-normal group-hover:overflow-visible">{step.description}</p>
                                          {step.toolName && (
                                            <div className="mt-1 flex items-center gap-2">
                                                <div className="text-[8px] text-amber-500/60 font-bold font-mono uppercase bg-amber-950/20 px-1 border border-amber-900/30 rounded select-none">
                                                    TOOL: {step.toolName}
                                                </div>
                                            </div>
                                          )}
                                        </div>
                                        {!isExecuting && !isOptimizing && (
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); setStepToDelete(step.id); }}
                                                className="text-slate-700 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 p-1"
                                                title="Purge Node"
                                            >
                                                <XCircleIcon className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                    {step.result && (
                                        <div className="mt-3 pl-8">
                                            {step.result.type === 'text' && (
                                                <div className="text-[10px] text-slate-400 bg-black/80 p-3 rounded font-mono border border-white/5 relative">
                                                     <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500/50"></div>
                                                     <div className="max-h-32 overflow-y-auto custom-scrollbar">{step.result.content}</div>
                                                </div>
                                            )}
                                            {step.result.type === 'image' && <img src={step.result.url} alt="Gen_Asset" className="max-w-xs rounded border border-slate-700 shadow-2xl" />}
                                        </div>
                                    )}
                                </div>
                            ))}
                            {finalResult && (
                                 <div className="bg-emerald-950/20 border border-emerald-500/50 p-4 rounded animate-fade-in relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-1 text-[8px] font-bold text-emerald-900 group-hover:text-emerald-500 transition-colors uppercase">Success_Manifest</div>
                                    <h4 className="font-bold text-emerald-400 mb-2 text-[10px] uppercase tracking-[0.2em] flex items-center gap-2">
                                        <CheckCircleIcon className="w-4 h-4" /> Mission_Converged
                                    </h4>
                                    <p className="text-[11px] text-emerald-100/80 leading-relaxed font-mono italic">"{finalResult}"</p>
                                </div>
                            )}
                            {!isExecuting && !isOptimizing && plan.length === 0 && !swarmOptimizationReport && (
                                 <div className="flex-1 flex flex-col items-center justify-center h-full opacity-20 group">
                                    <div className="p-4 border-2 border-dashed border-slate-700 rounded-full mb-4 group-hover:border-amber-500/30 transition-colors">
                                         <NetworkIcon className="w-12 h-12 text-slate-600 group-hover:text-amber-500/50" />
                                    </div>
                                    <p className="text-slate-500 text-[10px] font-mono tracking-[0.4em] uppercase">Matrix_Dormant // Awaiting_Mission</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Confirmation Modal */}
            {stepToDelete && (
                <div className="absolute inset-0 bg-black/90 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-[#09090b] border border-red-500/50 rounded p-8 max-w-sm w-full shadow-[0_0_100px_rgba(220,38,38,0.2)] font-mono text-center">
                        <div className="w-16 h-16 bg-red-950/30 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/30">
                             <ShieldIcon className="w-8 h-8 text-red-500 animate-pulse" />
                        </div>
                        <h3 className="text-red-500 font-bold text-sm mb-3 uppercase tracking-[0.2em]">Purge_Confirmation</h3>
                        <p className="text-slate-400 text-[10px] mb-8 leading-relaxed uppercase">
                            Warning: Deleting this task node will disconnect the causal link within the swarm mixture. This operation is non-reversible.
                        </p>
                        <div className="flex justify-center gap-4">
                            <button 
                                onClick={() => setStepToDelete(null)}
                                className="px-6 py-2 rounded text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-white transition-all"
                            >
                                Abort
                            </button>
                            <button 
                                onClick={confirmDeleteStep}
                                className="px-6 py-2 rounded text-[10px] font-bold uppercase tracking-widest bg-red-600 text-white border border-red-400 hover:bg-red-500 shadow-lg active:translate-y-1 transition-all"
                            >
                                Execute_Purge
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AgentOrchestrator;
