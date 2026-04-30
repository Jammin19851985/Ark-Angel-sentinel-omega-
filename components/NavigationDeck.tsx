
import React from 'react';
import { ActiveView } from '../types';
import { QuantumIcon } from './icons/QuantumIcon';
import { TerminalIcon } from './icons/TerminalIcon';
import { NetworkIcon } from './icons/NetworkIcon';
import { BeakerIcon } from './icons/BeakerIcon';
import { SonarIcon } from './icons/SonarIcon';
import { ChartPieIcon } from './icons/ChartPieIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { ChartBarIcon } from './icons/ChartBarIcon';
import { BookOpenIcon } from './icons/BookOpenIcon';

interface NavigationDeckProps {
    activeView: ActiveView;
    setActiveView: (view: ActiveView) => void;
    focusMode: boolean;
    setFocusMode: (focus: boolean) => void;
}

const CyberKey: React.FC<{view: ActiveView, label: string, icon: React.ReactNode, id: string, activeView: ActiveView, onClick: () => void }> = ({ view, label, icon, id, activeView, onClick }) => {
    const isActive = activeView === view;
    return (
        <button 
            id={id}
            onClick={onClick}
            className={`cyber-button cyber-key flex items-center justify-center space-x-1.5 px-2 py-1.5 md:py-2 w-full lg:w-auto flex-1 transition-all duration-200 ${isActive ? 'active shadow-[inset_0_0_15px_rgba(6,182,212,0.3)] border-cyan-500 text-cyan-400' : 'opacity-70 hover:opacity-100 hover:border-cyan-500/50 hover:text-white'}`}
        >
            <div className={`p-0.5 rounded ${isActive ? 'bg-cyan-900/50 text-cyan-400 drop-shadow-[0_0_5px_rgba(0,243,255,0.8)]' : 'text-slate-500 group-hover:text-cyan-400'}`}>{icon}</div>
            <span className={`hidden xl:inline text-[9px] md:text-[10px] font-bold tracking-wider uppercase ${isActive ? 'text-cyan-400 glow-text-cyan' : 'text-slate-500'}`}>{label}</span>
        </button>
    );
};

const NavigationDeck: React.FC<NavigationDeckProps> = ({ activeView, setActiveView, focusMode, setFocusMode }) => {
    
    const handleViewChange = (view: ActiveView) => {
        setActiveView(view);
        if (focusMode) setFocusMode(false);
    };

    return (
        <div className="w-full px-2 md:px-3 py-1.5 bg-[#020203]/90 border-b border-[#1e293b] flex gap-1 overflow-x-auto custom-scrollbar flex-shrink-0 items-center shadow-lg relative z-30 backdrop-blur-md min-h-[40px]">
            <CyberKey 
                view="nexus" 
                label="Hub" 
                icon={<QuantumIcon className="w-2.5 h-2.5"/>} 
                id="tab-nexus" 
                activeView={activeView} 
                onClick={() => handleViewChange('nexus')} 
            />
            <CyberKey 
                view="sentinel" 
                label="Spine" 
                icon={<TerminalIcon className="w-2.5 h-2.5"/>} 
                id="tab-sentinel" 
                activeView={activeView} 
                onClick={() => handleViewChange('sentinel')} 
            />
            <CyberKey 
                view="orchestrator" 
                label="Swarm" 
                icon={<NetworkIcon className="w-2.5 h-2.5"/>} 
                id="tab-orchestrator" 
                activeView={activeView} 
                onClick={() => handleViewChange('orchestrator')} 
            />
            <CyberKey 
                view="shadow_terminal" 
                label="Vault" 
                icon={<BeakerIcon className="w-2.5 h-2.5"/>} 
                id="tab-vault" 
                activeView={activeView} 
                onClick={() => handleViewChange('shadow_terminal')} 
            />
            <CyberKey 
                view="sonar" 
                label="Sonar" 
                icon={<SonarIcon className="w-2.5 h-2.5"/>} 
                id="tab-sonar" 
                activeView={activeView} 
                onClick={() => handleViewChange('sonar')} 
            />
            <CyberKey 
                view="analytics" 
                label="Intel" 
                icon={<ChartPieIcon className="w-2.5 h-2.5"/>} 
                id="tab-analytics" 
                activeView={activeView} 
                onClick={() => handleViewChange('analytics')} 
            />
            <CyberKey 
                view="toolkit" 
                label="Toolkit" 
                icon={<SparklesIcon className="w-2.5 h-2.5"/>} 
                id="tab-toolkit" 
                activeView={activeView} 
                onClick={() => handleViewChange('toolkit')} 
            />
            <CyberKey 
                view="backtester" 
                label="Audit" 
                icon={<ChartBarIcon className="w-2.5 h-2.5"/>} 
                id="tab-backtester" 
                activeView={activeView} 
                onClick={() => handleViewChange('backtester')} 
            />
            <CyberKey 
                view="intel" 
                label="Codex" 
                icon={<BookOpenIcon className="w-2.5 h-2.5"/>} 
                id="tab-intel" 
                activeView={activeView} 
                onClick={() => handleViewChange('intel')} 
            />
        </div>
    );
};

export default NavigationDeck;
