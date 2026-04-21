
import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { TourStep } from '../types';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';
import { ArrowRightIcon } from './icons/ArrowRightIcon';
import { XCircleIcon } from './icons/XCircleIcon';

interface OnboardingTourProps {
    currentStepIndex: number;
    onNext: () => void;
    onPrevious: () => void;
    onComplete: () => void;
    onSkip: () => void;
}

const tourSteps: TourStep[] = [
    {
        selector: '#sentinel-terminal',
        title: 'Sentinel-A Terminal',
        content: 'This is your primary interface to Sentinel-A. Send commands, receive reports, and interact directly with the core AI here.',
        placement: 'right',
    },
    {
        selector: '#tab-nexus',
        title: 'Nexus (Omni-Presence Engine)',
        content: 'Access the TURMOX Ω Core. Visualize quantum tick states, manage entropy, and execute higher-order reality protocols.',
        placement: 'bottom',
    },
    {
        selector: '#sovereign-finance',
        title: 'Sovereign Broker Bridge',
        content: 'Execute manual trades, manage PayPal banking capital, and interact with the shadow execution engine (Coinbase).',
        placement: 'left',
    },
    {
        selector: '#market-watch',
        title: 'Market Watch',
        content: 'Track real-time market data, price changes, and critical market intelligence feeds.',
        placement: 'left',
    },
    {
        selector: '#portfolio-overview',
        title: 'Portfolio Overview',
        content: 'Monitor your current holdings, total value, and profit/loss metrics in real-time.',
        placement: 'left',
    },
    {
        selector: '#alpha-gauge',
        title: 'Estimated Alpha',
        content: 'This gauge displays the swarm\'s current estimated annualized alpha. Aim for high values!',
        placement: 'left',
    },
    {
        selector: '#swarm-visualizer',
        title: 'AI Swarm Status',
        content: 'Observe the operational status of individual AI bots within the Archangel swarm.',
        placement: 'left',
    },
    {
        selector: '#system-log',
        title: 'System Log',
        content: 'All critical system events, AI responses, trades, and errors are logged here for forensic analysis.',
        placement: 'top',
    },
    {
        selector: '#tab-orchestrator',
        title: 'Agent Orchestrator',
        content: 'Deploy the AI swarm for complex, multi-step missions. Define objectives and monitor execution plans.',
        placement: 'bottom',
    },
    {
        selector: '#tab-sonar',
        title: 'Sonar Threat Analysis',
        content: 'Detect and analyze global financial, geopolitical, and cyber threat signals in real-time.',
        placement: 'bottom',
    },
    {
        selector: '#tab-analytics',
        title: 'Analytics Dashboard',
        content: 'Access predictive forecasts, trade history, and key performance indicators for deep insights.',
        placement: 'bottom',
    },
    {
        selector: '#tab-toolkit',
        title: 'AI Toolkit',
        content: 'A suite of specialized AI tools for chat, image/video/audio processing, code auditing, sentiment analysis, and RAG queries.',
        placement: 'bottom',
    },
    {
        selector: '#tab-backtester',
        title: 'Backtester',
        content: 'Simulate trading strategies on historical data and get AI-powered insights on their viability.',
        placement: 'bottom',
    },
    {
        selector: '#tab-intel',
        title: 'Intel Feed / Codex',
        content: 'Review core system instructions, research initiatives, and strategic blueprints for Sentinel-A.',
        placement: 'bottom',
    },
];

const OnboardingTour: React.FC<OnboardingTourProps> = ({
    currentStepIndex,
    onNext,
    onPrevious,
    onComplete,
    onSkip,
}) => {
    const [position, setPosition] = useState<{ top: number; left: number; width?: number } | null>(null);
    const tooltipRef = useRef<HTMLDivElement>(null);
    const currentStep = tourSteps[currentStepIndex];

    const calculatePosition = useCallback(() => {
        if (!currentStep || !tooltipRef.current) return;

        const targetElement = document.querySelector<HTMLElement>(currentStep.selector);
        if (!targetElement) {
            console.warn(`OnboardingTour: Selector "${currentStep.selector}" not found.`);
            if (currentStepIndex < tourSteps.length - 1) {
                onNext();
            } else {
                onComplete();
            }
            return;
        }

        const targetRect = targetElement.getBoundingClientRect();
        const tooltipRect = tooltipRef.current.getBoundingClientRect();
        const padding = 20;

        let newTop = 0;
        let newLeft = 0;

        switch (currentStep.placement) {
            case 'top':
                newTop = targetRect.top - tooltipRect.height - padding;
                newLeft = targetRect.left + (targetRect.width / 2) - (tooltipRect.width / 2);
                break;
            case 'bottom':
                newTop = targetRect.bottom + padding;
                newLeft = targetRect.left + (targetRect.width / 2) - (tooltipRect.width / 2);
                break;
            case 'left':
                newTop = targetRect.top + (targetRect.height / 2) - (tooltipRect.height / 2);
                newLeft = targetRect.left - tooltipRect.width - padding;
                break;
            case 'right':
                newTop = targetRect.top + (targetRect.height / 2) - (tooltipRect.height / 2);
                newLeft = targetRect.right + padding;
                break;
            default:
                newTop = targetRect.top + (targetRect.height / 2);
                newLeft = targetRect.left + (targetRect.width / 2);
        }

        newTop = Math.max(padding, newTop);
        newLeft = Math.max(padding, newLeft);
        newLeft = Math.min(newLeft, window.innerWidth - tooltipRect.width - padding);
        newTop = Math.min(newTop, window.innerHeight - tooltipRect.height - padding);

        setPosition({ top: newTop, left: newLeft });
    }, [currentStep, currentStepIndex, onNext, onComplete]);

    useEffect(() => {
        if (currentStep) {
            calculatePosition();
            window.addEventListener('resize', calculatePosition);
            const targetElement = document.querySelector<HTMLElement>(currentStep.selector);
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                targetElement.classList.add('glow-border');
                setTimeout(() => targetElement.classList.remove('glow-border'), 2000);
            }
        }
        return () => window.removeEventListener('resize', calculatePosition);
    }, [currentStep, calculatePosition]);

    if (currentStepIndex === -1 || !currentStep || !position) {
        return null;
    }

    const isLastStep = currentStepIndex === tourSteps.length - 1;

    if (!currentStep) return null;

    return ReactDOM.createPortal(
        <div 
            ref={tooltipRef}
            className="fixed z-[10000] p-0.5 rounded-xl transition-all duration-300 ease-out animate-fade-in"
            style={{ 
                top: position.top, 
                left: position.left,
                background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.5), rgba(0,0,0,0) 40%, rgba(245, 158, 11, 0.2))',
                boxShadow: '0 0 20px rgba(245, 158, 11, 0.2), 0 0 40px rgba(0,0,0,0.5)'
            }}
        >
            <div className="bg-black/90 backdrop-blur-xl rounded-xl overflow-hidden relative max-w-sm border border-slate-700/50">
                {/* Scanline Effect */}
                <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-0 bg-[length:100%_2px,3px_100%] opacity-20" />
                
                {/* Top Bar */}
                <div className="h-1 w-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 relative z-10">
                    <div className="absolute right-0 top-0 h-full w-full bg-white/30 animate-[shimmer_2s_infinite]" />
                </div>

                <div className="p-5 relative z-10">
                    <div className="flex justify-between items-start mb-3">
                        <div>
                            <span className="text-[10px] font-mono text-amber-500 tracking-widest uppercase mb-1 block">System Tour // Step {currentStepIndex + 1}/{tourSteps.length}</span>
                            <h4 className="text-lg font-bold text-white font-mono tracking-tight">{currentStep.title}</h4>
                        </div>
                        <button onClick={onSkip} className="text-slate-500 hover:text-red-400 transition-colors p-1 hover:bg-white/5 rounded" aria-label="Close tour">
                            <XCircleIcon className="w-5 h-5" />
                        </button>
                    </div>
                    
                    <div className="text-sm text-slate-300 leading-relaxed font-sans border-l-2 border-amber-500/30 pl-3 mb-5">
                        {currentStep.content}
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-white/10">
                        {currentStepIndex > 0 ? (
                            <button onClick={onPrevious} className="text-slate-400 hover:text-white text-xs font-mono uppercase tracking-wider flex items-center transition-colors">
                                <ArrowLeftIcon className="w-3 h-3 mr-1" /> PREV
                            </button>
                        ) : <div />}
                        
                        <div className="flex space-x-3">
                            <button onClick={onSkip} className="text-[10px] text-slate-500 hover:text-slate-300 font-mono uppercase tracking-wider transition-colors">
                                Terminate
                            </button>
                            {isLastStep ? (
                                <button onClick={onComplete} className="bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold font-mono uppercase px-4 py-1.5 rounded shadow-[0_0_15px_rgba(245,158,11,0.4)] transition-all hover:shadow-[0_0_25px_rgba(245,158,11,0.6)]">
                                    Initialize
                                </button>
                            ) : (
                                <button onClick={onNext} className="bg-slate-800 hover:bg-slate-700 border border-slate-600 text-amber-400 hover:text-amber-300 text-xs font-bold font-mono uppercase px-4 py-1.5 rounded flex items-center transition-all group">
                                    Next <ArrowRightIcon className="w-3 h-3 ml-1 group-hover:translate-x-0.5 transition-transform" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default OnboardingTour;
