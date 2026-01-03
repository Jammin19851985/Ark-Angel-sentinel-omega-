
import React, { Suspense, lazy } from 'react';
import Loader from './Loader';
import { ActiveView, Message } from '../types';

// Lazy Loaded Modules
const SentinelTerminal = lazy(() => import('./SentinelTerminal'));
const AIToolkit = lazy(() => import('./AIToolkit'));
const Backtester = lazy(() => import('./Backtester'));
const AgentOrchestrator = lazy(() => import('./AgentOrchestrator'));
const Analytics = lazy(() => import('./Analytics'));
const Intel = lazy(() => import('./Intel'));
const Sonar = lazy(() => import('./Sonar'));
const Nexus = lazy(() => import('./Nexus'));
const PaperTerminal = lazy(() => import('./PaperTerminal'));

interface ViewManagerProps {
    activeView: ActiveView;
    messages: Message[];
    input: string;
    setInput: (value: string) => void;
    isLoading: boolean;
    error: string | null;
    handleSendMessage: (e: React.FormEvent) => void;
    handleTroubleshoot: (errorMessage: string) => void;
    suggestions: string[];
    onAddAllSuggestions: () => void;
    mission: string;
    setMission: (val: string) => void;
}

const ViewManager: React.FC<ViewManagerProps> = (props) => {
    const { activeView } = props;

    // CRITICAL: The outer div must have min-h-0 to allow scrolling within the grid/flex child
    return (
        <div className="relative z-10 w-full h-full min-h-0 flex flex-col overflow-hidden">
            <Suspense fallback={
                <div className="absolute inset-0 flex items-center justify-center flex-col gap-4 bg-black/20 backdrop-blur-sm">
                    <Loader />
                    <span className="text-[10px] font-mono text-cyan-500 animate-pulse tracking-widest">LOADING_MODULE...</span>
                </div>
            }>
                {activeView === 'sonar' && <Sonar id="sonar-view" />}
                {activeView === 'nexus' && <Nexus id="nexus-view" />}
                {activeView === 'paper_terminal' && <PaperTerminal id="paper-terminal" />}
                {activeView === 'sentinel' && (
                    <SentinelTerminal 
                        id="sentinel-terminal" 
                        messages={props.messages} 
                        input={props.input} 
                        setInput={props.setInput} 
                        isLoading={props.isLoading} 
                        error={props.error} 
                        handleSendMessage={props.handleSendMessage} 
                        handleTroubleshoot={props.handleTroubleshoot} 
                        suggestions={props.suggestions} 
                        onAddAllSuggestions={props.onAddAllSuggestions} 
                    />
                )}
                {activeView === 'orchestrator' && (
                    <AgentOrchestrator 
                        id="agent-orchestrator" 
                        mission={props.mission} 
                        handleMissionChange={(e) => props.setMission(e.target.value)} 
                    />
                )}
                {activeView === 'toolkit' && <AIToolkit id="ai-toolkit" />}
                {activeView === 'backtester' && <Backtester id="backtester-view" />}
                {activeView === 'analytics' && <Analytics id="analytics-dashboard" />}
                {activeView === 'intel' && <Intel id="intel-feed" />}
            </Suspense>
        </div>
    );
};

export default ViewManager;
