
import React, { useState } from 'react';
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
import { HardDrive } from 'lucide-react';
import { useAppStore } from '../store/appStore';

interface NavigationDeckProps {
    activeView: ActiveView;
    setActiveView: (view: ActiveView) => void;
    focusMode: boolean;
    setFocusMode: (focus: boolean) => void;
}

// Subtle synthesized cybernetic micro-haptic chirp
const triggerHapticFeedback = () => {
    try {
        if (typeof window !== 'undefined' && 'vibrate' in navigator) {
            navigator.vibrate?.([10, 15, 10]);
        }
        if (typeof window !== 'undefined' && window.AudioContext) {
            const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
            if (ctx.state === 'running') {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(1400, ctx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(700, ctx.currentTime + 0.04);
                gain.gain.setValueAtTime(0.025, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start();
                osc.stop(ctx.currentTime + 0.04);
            }
        }
    } catch {
        // Fallback gracefully if audio/vibration is restricted
    }
};

const CyberKey: React.FC<{
    view: ActiveView;
    label: string;
    icon: React.ReactNode;
    id: string;
    activeView: ActiveView;
    isClicked: boolean;
    onClick: () => void;
    isNew?: boolean;
}> = ({ view, label, icon, id, activeView, isClicked, onClick, isNew }) => {
    const isActive = activeView === view;
    const isSovereign = useAppStore(state => state.isSovereign);

    return (
        <button 
            id={id}
            onClick={onClick}
            className={`cyber-button cyber-key relative flex items-center justify-center space-x-1.5 px-2 py-1.5 md:py-2 w-full lg:w-auto flex-1 transition-all duration-200 select-none overflow-hidden rounded ${
                isClicked ? 'animate-haptic-click scale-95' : ''
            } ${
                isActive 
                    ? isSovereign 
                        ? 'active shadow-[inset_0_0_18px_rgba(255,0,85,0.4)] border-[#ff0055] text-[#ff0055] cyber-key-active-glow'
                        : 'active shadow-[inset_0_0_15px_rgba(6,182,212,0.35)] border-cyan-500 text-cyan-400 cyber-key-active-glow' 
                    : 'opacity-70 hover:opacity-100 hover:border-cyan-500/50 hover:text-white'
            }`}
        >
            {/* Visual Haptic Burst Wave */}
            {isClicked && (
                <span 
                    className="absolute inset-0 rounded pointer-events-none animate-ping opacity-60"
                    style={{
                        backgroundColor: isSovereign ? 'rgba(255, 0, 85, 0.3)' : 'rgba(0, 243, 255, 0.3)'
                    }}
                />
            )}

            {isNew && (
                <div className="absolute -top-1 -right-1 flex h-2 w-2 z-10">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                </div>
            )}
            
            <div className={`p-0.5 rounded transition-transform duration-150 ${isClicked ? 'scale-110' : 'scale-100'} ${
                isActive 
                    ? isSovereign 
                        ? 'bg-rose-950/60 text-[#ff0055] drop-shadow-[0_0_8px_rgba(255,0,85,0.8)]' 
                        : 'bg-cyan-900/50 text-cyan-400 drop-shadow-[0_0_5px_rgba(0,243,255,0.8)]' 
                    : 'text-slate-500 group-hover:text-cyan-400'
            }`}>
                {icon}
            </div>
            
            <span className={`hidden xl:inline text-[9px] md:text-[10px] font-bold tracking-wider uppercase ${
                isActive 
                    ? isSovereign ? 'text-[#ff0055] drop-shadow-[0_0_6px_rgba(255,0,85,0.7)]' : 'text-cyan-400 glow-text-cyan' 
                    : 'text-slate-500'
            }`}>
                {label}
            </span>
        </button>
    );
};

const NavigationDeck: React.FC<NavigationDeckProps> = ({ activeView, setActiveView, focusMode, setFocusMode }) => {
    const [clickedView, setClickedView] = useState<ActiveView | null>(null);
    
    const handleViewChange = (view: ActiveView) => {
        triggerHapticFeedback();
        setClickedView(view);
        setTimeout(() => setClickedView(null), 350);

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
                isClicked={clickedView === 'nexus'}
                onClick={() => handleViewChange('nexus')} 
            />
            <CyberKey 
                view="sentinel" 
                label="Spine" 
                icon={<TerminalIcon className="w-2.5 h-2.5"/>} 
                id="tab-sentinel" 
                activeView={activeView} 
                isClicked={clickedView === 'sentinel'}
                onClick={() => handleViewChange('sentinel')} 
            />
            <CyberKey 
                view="orchestrator" 
                label="Swarm" 
                icon={<NetworkIcon className="w-2.5 h-2.5"/>} 
                id="tab-orchestrator" 
                activeView={activeView} 
                isClicked={clickedView === 'orchestrator'}
                onClick={() => handleViewChange('orchestrator')} 
            />
            <CyberKey 
                view="shadow_terminal" 
                label="Vault" 
                icon={<BeakerIcon className="w-2.5 h-2.5"/>} 
                id="tab-vault" 
                activeView={activeView} 
                isClicked={clickedView === 'shadow_terminal'}
                onClick={() => handleViewChange('shadow_terminal')} 
            />
            <CyberKey 
                view="sonar" 
                label="Sonar" 
                icon={<SonarIcon className="w-2.5 h-2.5"/>} 
                id="tab-sonar" 
                activeView={activeView} 
                isClicked={clickedView === 'sonar'}
                onClick={() => handleViewChange('sonar')} 
            />
            <CyberKey 
                view="analytics" 
                label="Intel" 
                icon={<ChartPieIcon className="w-2.5 h-2.5"/>} 
                id="tab-analytics" 
                activeView={activeView} 
                isClicked={clickedView === 'analytics'}
                onClick={() => handleViewChange('analytics')} 
            />
            <CyberKey 
                view="toolkit" 
                label="Toolkit" 
                icon={<SparklesIcon className="w-2.5 h-2.5"/>} 
                id="tab-toolkit" 
                activeView={activeView} 
                isClicked={clickedView === 'toolkit'}
                onClick={() => handleViewChange('toolkit')} 
            />
            <CyberKey 
                view="backtester" 
                label="Audit" 
                icon={<ChartBarIcon className="w-2.5 h-2.5"/>} 
                id="tab-backtester" 
                activeView={activeView} 
                isClicked={clickedView === 'backtester'}
                onClick={() => handleViewChange('backtester')} 
            />
            <CyberKey 
                view="intel" 
                label="Codex" 
                icon={<BookOpenIcon className="w-2.5 h-2.5"/>} 
                id="tab-intel" 
                activeView={activeView} 
                isClicked={clickedView === 'intel'}
                onClick={() => handleViewChange('intel')} 
            />
            <CyberKey 
                view="keep" 
                label="Mnemosyne" 
                icon={<BookOpenIcon className="w-2.5 h-2.5 text-amber-400"/>} 
                id="tab-keep" 
                activeView={activeView} 
                isClicked={clickedView === 'keep'}
                onClick={() => handleViewChange('keep')}
                isNew={true}
            />
            <CyberKey 
                view="gdrive" 
                label="Workspace" 
                icon={<HardDrive className="w-2.5 h-2.5 text-amber-400"/>} 
                id="tab-gdrive" 
                activeView={activeView} 
                isClicked={clickedView === 'gdrive'}
                onClick={() => handleViewChange('gdrive')}
                isNew={true}
            />
            <CyberKey 
                view="banking" 
                label="Banking" 
                icon={<BookOpenIcon className="w-2.5 h-2.5 text-amber-400"/>} 
                id="tab-banking" 
                activeView={activeView} 
                isClicked={clickedView === 'banking'}
                onClick={() => handleViewChange('banking')}
                isNew={true}
            />
        </div>
    );
};

export default NavigationDeck;
