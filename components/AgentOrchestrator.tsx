
import React, { useState, useCallback, useMemo } from 'react';
import { OrchestrationStep } from '../types';
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
import { useAppContext } from '../contexts/AppContext';

interface AgentOrchestratorProps {
    id: string; // New: Add ID prop for tour targeting
    mission: string;
    handleMissionChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}


const AgentOrchestrator: React.FC<AgentOrchestratorProps> = ({ 
    id, // Destructure the new ID prop
    mission,
    handleMissionChange,
}) => {
    // Destructure persisted state from AppContext
    const { 
        addLog, 
        isGodMode, 
        setIsGodMode, 
        isGodModeUnlocked, 
        optimizeSwarm,
        isSwarmOptimized, // Persisted state
        swarmOptimizationReport // Persisted report
    } = useAppContext();

    const [plan, setPlan] = useState<OrchestrationStep[]>([]);
    const [finalResult, setFinalResult] = useState<string | null>(null);
    const [isExecuting, setIsExecuting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    // Local loading state for optimization
    const [isOptimizing, setIsOptimizing] = useState(false);

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
            await optimizeSwarm(); // State updates handled in AppContext
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
            <div className="p-4 border-b border-slate-800">
                <h2 className="text-sm font-bold text-amber-400 font-mono">// AGENT ORCHESTRATOR</h2>
            </div>
            <div className="flex-1 p-4 grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-y-auto">
                {/* Controls */}
                <div className="flex flex-col space-y-4">
                     <div>
                        <label htmlFor="mission-prompt" className="block text-sm font-medium text-slate-300 mb-2">Mission Objective</label>
                        <textarea
                            id="mission-prompt"
                            value={mission}
                            onChange={handleMissionChange}
                            rows={5}
                            className="w-full bg-black/50 backdrop-blur-sm border border-slate-700 rounded-md p-3 text-sm text-slate-200 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition"
                            placeholder="Define a complex, multi-step objective for the agent swarm..."
                        />
                    </div>
                    <div className="flex items-center justify-between gap-4">
                        <button
                            onClick={executeMission}
                            disabled={isExecuting || !mission.trim() || isOptimizing}
                            className="inline-flex flex-grow items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-amber-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors group"
                        >
                            {isExecuting ? (
                                <>
                                    <Loader />
                                    <span className="ml-2">Mission in Progress...</span>
                                </>
                            ) : (
                                <>
                                    <PlayCircleIcon className="w-5 h-5 mr-2 -ml-1 text-amber-300" />
                                    Deploy Swarm
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
                         <h3 className="text-sm font-medium text-slate-300">Swarm Performance</h3>
                         <button
                            onClick={handleOptimizeSwarm}
                            disabled={isExecuting || isOptimizing || isSwarmOptimized}
                            className="w-full inline-flex items-center justify-center px-4 py-2 border text-sm font-medium rounded-md shadow-sm transition-colors group disabled:cursor-not-allowed bg-black/50 backdrop-blur-sm border-slate-600 text-slate-200 hover:bg-slate-600 disabled:opacity-50"
                        >
                            {isOptimizing ? (
                                <>
                                    <Loader />
                                    <span className="ml-2">Synthesizing...</span>
                                </>
                            ) : isSwarmOptimized ? (
                                 <>
                                    <CheckCircleIcon className="w-5 h-5 mr-2 -ml-1 text-green-400" />
                                    Swarm Optimized
                                </>
                            ) : (
                                <>
                                    <CpuChipIcon className="w-5 h-5 mr-2 -ml-1 text-amber-300" />
                                    Engage Quantum Synthesis
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

                {/* Execution Plan & Results */}
                <div className="bg-black/50 backdrop-blur-sm rounded-lg border border-slate-800 p-4 shadow-inner flex flex-col space-y-4">
                    <h3 className="text-base font-semibold text-slate-200">Execution Log</h3>
                    <div className="flex-1 space-y-3 overflow-y-auto pr-2">
                        {swarmOptimizationReport && (
                            <div className="bg-black/50 backdrop-blur-sm p-3 rounded-lg border border-amber-500/50">
                               <h4 className="font-bold text-amber-400 mb-2 text-sm">// QUANTUM SYNTHESIS REPORT</h4>
                               <div className="prose prose-sm prose-invert max-w-none text-slate-300">
                                   {renderMarkdown(swarmOptimizationReport)}
                               </div>
                            </div>
                        )}
                        {plan.map(step => (
                            <div key={step.id} className={`bg-black/50 backdrop-blur-sm p-3 rounded-lg border border-transparent ${step.status === 'in_progress' ? 'glow-border' : ''}`}>
                                <div className="flex items-start space-x-3">
                                    <div className="mt-0.5">
                                      <StatusIcon status={step.status} />
                                    </div>
                                    <div className="flex-1">
                                      <p className="text-sm text-slate-300">{step.description}</p>
                                      {step.toolName && (
                                        <div className="mt-1 text-xs text-slate-500 font-mono" title={allTools.get(step.toolName)?.description}>
                                          TOOL: {step.toolName}
                                        </div>
                                      )}
                                    </div>
                                </div>
                                {step.result && (
                                    <div className="mt-2 pl-8">
                                        {step.result.type === 'text' && <div className="text-xs text-slate-400 bg-black/50 backdrop-blur-sm p-2 rounded whitespace-pre-wrap font-mono">{step.result.content}</div>}
                                        {step.result.type === 'image' && <img src={step.result.url} alt="Generated" className="max-w-xs rounded-md border-2 border-slate-700" />}
                                    </div>
                                )}
                                 {step.error && (
                                    <div className="mt-2 pl-8 text-xs text-red-400 bg-red-950 p-2 rounded font-mono">
                                        Error: {step.error}
                                    </div>
                                )}
                            </div>
                        ))}
                        {finalResult && (
                             <div className="bg-green-900/50 border border-green-700 p-3 rounded-lg">
                                <h4 className="font-bold text-green-300 mb-2">Mission Complete</h4>
                                <p className="text-sm text-green-200 whitespace-pre-wrap">{finalResult}</p>
                            </div>
                        )}
                        {!isExecuting && !isOptimizing && plan.length === 0 && !swarmOptimizationReport && (
                             <div className="flex-1 flex items-center justify-center h-full">
                                <p className="text-slate-500 text-sm">Awaiting deployment...</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AgentOrchestrator;
