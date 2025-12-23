
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
        killSwitchActive
    } = useAppContext();

    const [plan, setPlan] = useState<OrchestrationStep[]>([]);
    const [finalResult, setFinalResult] = useState<string | null>(null);
    const [isExecuting, setIsExecuting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isOptimizing, setIsOptimizing] = useState(false);
    const [activeSovereignOp, setActiveSovereignOp] = useState<string | null>(null);

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
        if (op === 'EXECUTE') await executeOperation();
        if (op === 'INSTALL') await installProtocol();
        if (op === 'RUN') await runSystem();
        setTimeout(() => setActiveSovereignOp(null), 1500);
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
            if (line.startsWith('### ')) return <h3 key={i} className="text-md font-semibold text-slate-100 mt-3 mb-1">{line.substring(4)}</h3>;
            if (line.startsWith('## ')) return <h2 key={i} className="text-lg font-bold text-slate-50 mt-4 mb-2">{line.substring(3)}</h2>;
            if (line.startsWith('* ')) return <li key={i} className="ml-4">{line.substring(2)}</li>;
            if (line.trim() === '') return <br key={i}/>;
            return <p key={i} className="leading-relaxed">{line}</p>;
        });
    };

    return (
        <div id={id} className="bg-black/30 backdrop-blur-sm border border-slate-800 rounded-b-lg rounded-tr-lg shadow-lg flex flex-col h-full glow-border flex-1 relative">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center">
                <h2 className="text-sm font-bold text-amber-400 font-mono">// AGENT ORCHESTRATOR</h2>
                <div className="flex gap-4">
                    <div className="text-[10px] font-mono text-slate-500 uppercase">Swarm Load: <span className="text-amber-500">{bots.length} Units</span></div>
                </div>
            </div>
            <div className="flex-1 p-4 grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-y-auto">
                <div className="flex flex-col space-y-4">
                     {/* SOVEREIGN QUICK ACTIONS */}
                     <div className="flex gap-2">
                        <button 
                            onClick={() => triggerSovereignOp('EXECUTE')}
                            disabled={!!activeSovereignOp || killSwitchActive}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded border font-mono text-[10px] font-bold tracking-widest transition-all ${activeSovereignOp === 'EXECUTE' ? 'bg-amber-600 text-black border-amber-400 scale-95 shadow-[0_0_15px_rgba(245,158,11,0.5)]' : 'bg-black/40 border-amber-900/50 text-amber-500 hover:bg-amber-950/30'}`}
                        >
                            {activeSovereignOp === 'EXECUTE' ? <Loader /> : <CrosshairIcon className="w-3 h-3" />}
                            EXECUTE
                        </button>
                        <button 
                            onClick={() => triggerSovereignOp('INSTALL')}
                            disabled={!!activeSovereignOp || killSwitchActive}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded border font-mono text-[10px] font-bold tracking-widest transition-all ${activeSovereignOp === 'INSTALL' ? 'bg-cyan-600 text-black border-cyan-400 scale-95 shadow-[0_0_15px_rgba(6,182,212,0.5)]' : 'bg-black/40 border-cyan-900/50 text-cyan-500 hover:bg-cyan-950/30'}`}
                        >
                            {activeSovereignOp === 'INSTALL' ? <Loader /> : <DownloadIcon className="w-3 h-3" />}
                            INSTALL
                        </button>
                        <button 
                            onClick={() => triggerSovereignOp('RUN')}
                            disabled={!!activeSovereignOp || killSwitchActive}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded border font-mono text-[10px] font-bold tracking-widest transition-all ${activeSovereignOp === 'RUN' ? 'bg-green-600 text-black border-green-400 scale-95 shadow-[0_0_15px_rgba(34,197,94,0.5)]' : 'bg-black/40 border-green-900/50 text-green-500 hover:bg-green-950/30'}`}
                        >
                            {activeSovereignOp === 'RUN' ? <Loader /> : <PlayCircleIcon className="w-3 h-3" />}
                            RUN
                        </button>
                     </div>

                     <div>
                        <label htmlFor="mission-prompt" className="block text-sm font-medium text-slate-300 mb-2">Mission Objective</label>
                        <textarea
                            id="mission-prompt"
                            value={mission}
                            onChange={handleMissionChange}
                            rows={5}
                            className="w-full bg-black/50 backdrop-blur-sm border border-slate-700 rounded-md p-3 text-sm text-slate-200 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition"
                            placeholder="e.g. INITIATE_SWARM_PROTOCOL --agents 2500"
                        />
                    </div>
                    <div className="flex items-center justify-between gap-4">
                        <button
                            onClick={executeMission}
                            disabled={isExecuting || !mission.trim() || isOptimizing}
                            className="inline-flex flex-grow items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-amber-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors group shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                        >
                            {isExecuting ? (
                                <>
                                    <Loader />
                                    <span className="ml-2">Orchestrating Legions...</span>
                                </>
                            ) : (
                                <>
                                    <NetworkIcon className="w-5 h-5 mr-2 -ml-1 text-amber-300 group-hover:scale-110 transition-transform" />
                                    Deploy Master Swarm
                                </>
                            )}
                        </button>
                        
                        {isGodModeUnlocked ? (
                            <GodModeToggle 
                                isGodMode={isGodMode}
                                setIsGodMode={setIsGodMode}
                                isLoading={isExecuting || isOptimizing}
                            />
                        ) : (
                            <div className="flex items-center space-x-2 text-sm font-mono text-slate-500 border border-slate-700 rounded-md px-3 py-2 bg-black/50 backdrop-blur-sm">
                                 <ShieldIcon className="w-4 h-4" />
                                 <span>LOCKED</span>
                            </div>
                        )}

                    </div>
                    <div className="border-t border-slate-800 pt-4 space-y-3">
                         <h3 className="text-sm font-medium text-slate-300 font-mono tracking-widest uppercase">Swarm Synthesis</h3>
                         <button
                            onClick={handleOptimizeSwarm}
                            disabled={isExecuting || isOptimizing || isSwarmOptimized}
                            className="w-full inline-flex items-center justify-center px-4 py-2 border text-sm font-medium rounded-md shadow-sm transition-colors group disabled:cursor-not-allowed bg-black/50 backdrop-blur-sm border-slate-600 text-slate-200 hover:bg-slate-600 disabled:opacity-50"
                        >
                            {isOptimizing ? (
                                <>
                                    <Loader />
                                    <span className="ml-2">Synthesizing Mixture of Experts...</span>
                                </>
                            ) : isSwarmOptimized ? (
                                 <>
                                    <CheckCircleIcon className="w-5 h-5 mr-2 -ml-1 text-green-400" />
                                    Collective Intelligence Optimized
                                </>
                            ) : (
                                <>
                                    <CpuChipIcon className="w-5 h-5 mr-2 -ml-1 text-amber-300" />
                                    Engage Swarm Optimization
                                </>
                            )}
                        </button>
                    </div>
                    {error && (
                         <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-md text-sm mt-4">
                            <p className="font-bold">Execution Error:</p>
                            <p>{error}</p>
                         </div>
                     )}
                </div>

                <div className="bg-black/50 backdrop-blur-sm rounded-lg border border-slate-800 p-4 shadow-inner flex flex-col space-y-4">
                    <h3 className="text-xs font-bold text-slate-400 font-mono uppercase tracking-widest">Global State Feed</h3>
                    <div className="flex-1 space-y-3 overflow-y-auto pr-2">
                        {swarmOptimizationReport && (
                            <div className="bg-black/50 backdrop-blur-sm p-3 rounded-lg border border-amber-500/50 animate-fade-in-fast">
                               <h4 className="font-bold text-amber-400 mb-2 text-sm uppercase tracking-tighter">// QUANTUM SYNTHESIS REPORT</h4>
                               <div className="prose prose-sm prose-invert max-w-none text-slate-300">
                                   {renderMarkdown(swarmOptimizationReport)}
                               </div>
                            </div>
                        )}
                        {plan.map(step => (
                            <div key={step.id} className={`bg-black/50 backdrop-blur-sm p-3 rounded-lg border border-transparent transition-all ${step.status === 'in_progress' ? 'border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.1)]' : ''}`}>
                                <div className="flex items-start space-x-3">
                                    <div className="mt-0.5">
                                      <StatusIcon status={step.status} />
                                    </div>
                                    <div className="flex-1">
                                      <p className="text-sm text-slate-300 font-sans leading-relaxed">{step.description}</p>
                                      {step.toolName && (
                                        <div className="mt-1 text-[10px] text-amber-500/60 font-mono uppercase" title={allTools.get(step.toolName)?.description}>
                                          LEGION_TOOL: {step.toolName}
                                        </div>
                                      )}
                                    </div>
                                </div>
                                {step.result && (
                                    <div className="mt-2 pl-8">
                                        {step.result.type === 'text' && <div className="text-xs text-slate-400 bg-black/50 backdrop-blur-sm p-2 rounded whitespace-pre-wrap font-mono border border-white/5">{step.result.content}</div>}
                                        {step.result.type === 'image' && <img src={step.result.url} alt="Generated" className="max-w-xs rounded-md border border-slate-700" />}
                                    </div>
                                )}
                            </div>
                        ))}
                        {finalResult && (
                             <div className="bg-green-900/20 border border-green-800/50 p-4 rounded-lg animate-fade-in">
                                <h4 className="font-bold text-green-400 mb-2 text-xs uppercase tracking-[0.2em]">Mission Formalized</h4>
                                <p className="text-sm text-green-200/80 leading-relaxed font-sans">{finalResult}</p>
                            </div>
                        )}
                        {!isExecuting && !isOptimizing && plan.length === 0 && !swarmOptimizationReport && (
                             <div className="flex-1 flex flex-col items-center justify-center h-full opacity-30">
                                <NetworkIcon className="w-12 h-12 text-slate-600 mb-2" />
                                <p className="text-slate-500 text-xs font-mono tracking-widest uppercase">Awaiting Swarm Command</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AgentOrchestrator;
