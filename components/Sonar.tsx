
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { LogEntry, SonarSignal, SentimentResult } from '../types';
import { ArrowUpIcon } from './icons/ArrowUpIcon';
import { ArrowDownIcon } from './icons/ArrowDownIcon';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';
import { ArrowRightIcon } from './icons/ArrowRightIcon';
import { RefreshIcon } from './icons/RefreshIcon';
import { getSignalAnalysis, analyzeSentiment, analyzeQuantumVolatility } from '../services/geminiService';
import Loader from './Loader';
import { useAppContext } from '../contexts/AppContext';


// A simplified, valid SVG path for the world map to ensure it renders without errors.
const WorldMapSVG: React.FC = () => (
    <svg viewBox="0 0 1000 500" className="w-full h-full object-contain" preserveAspectRatio="xMidYMid meet">
        <path fill="currentColor" d="m998.4 236.9c-1.4-0.3-2.8-0.5-4.3-0.5-4.1 0-7.8 1.1-10.9 2.9-2.2 1.3-4.1 3-5.7 4.9-1.3 1.5-2.5 3.2-3.6 4.9-1.8 2.8-3.4 5.8-4.7 8.9-1.9 4.3-3 9-3.2 13.8-0.2 4.2 0.3 8.4 1.5 12.5 0.9 2.9 2.1 5.7 3.6 8.3 1.1 1.8 2.3 3.5 3.6 5.1 1.9 2.3 4 4.3 6.4 5.9 3.2 2.2 6.8 3.4 10.7 3.5 4 .1 7.8-0.7 11.3-2.5 2.1-1.1 4-2.5 5.6-4.1 1.8-1.8 3.3-3.9 4.4-6.2 1.4-2.8 2.4-5.8 2.8-8.9 0.6-4.3 0.3-8.6-0.8-12.8-0.9-3.2-2.1-6.3-3.7-9.2-1.2-2.2-2.6-4.3-4.2-6.2-2-2.3-4.3-4.3-6.8-5.9-3.2-2-6.8-3.1-10.6-3.2z m-85.1-118.6c-2.3-1.4-4.8-2.4-7.4-3.2-4.5-1.3-9.1-1.6-13.6-0.8-4.3 0.7-8.4 2.3-12.2 4.7-2.6 1.6-5 3.5-7.1 5.6-1.5 1.5-2.9 3.1-4.2 4.8-1.8 2.4-3.3 5-4.6 7.7-1.7 3.8-2.8 7.8-3.2 11.9-0.4 4.5 0.1 9 1.5 13.3 1.1 3.4 2.6 6.6 4.5 9.6 1.4 2.2 3 4.2 4.8 6.1 2.4 2.5 5.1 4.6 8.1 6.2 3.8 2.1 7.9 3.2 12.1 3.2 4.5 0 8.9-1.1 12.9-3.2 2.7-1.4 5.2-3.2 7.3-5.4 1.7-1.7 3.1-3.6 4.3-5.6 1.5-2.6 2.6-5.4 3.3-8.3 0.9-3.8 1.1-7.7 0.6-11.6-0.5-4.1-1.7-8.1-3.6-11.8-1.4-2.8-3.1-5.4-5-7.8-1.5-1.8-3.2-3.5-5-5z m-222.6 142.2c-3.1-0.2-6.2-0.8-9.2-1.8-4.7-1.6-9-3.9-12.8-6.9-2.5-1.9-4.8-4.2-6.7-6.6-1.3-1.6-2.5-3.4-3.5-5.2-1.4-2.5-2.5-5.2-3.3-7.9-1.1-3.9-1.4-7.9-0.8-11.8 0.6-4.2 2-8.3 4.1-12.1 1.6-2.8 3.5-5.5 5.6-7.9 1.6-1.8 3.3-3.5 5.2-5 2.5-2 5.2-3.7 8.1-5.1 4-1.9 8.2-2.9 12.5-2.9 4.6 0 9.1 1 13.3 3 2.8 1.3 5.4 3 7.7 5 1.7 1.5 3.3 3.1 4.7 4.8 2 2.3 3.7 4.9 5.1 7.7 1.7 3.5 2.8 7.2 3.2 11 0.5 4.3-0.1 8.6-1.5 12.8-1.1 3.2-2.6 6.2-4.5 9-1.4 2.1-3 4-4.8 5.8-2.4 2.3-5 4.3-7.9 5.9-3.8 2.1-7.9 3.2-12.1 3.2z"/>
    </svg>
);


const threatConfig = {
    Low: { color: 'text-sky-400', ring: 'border-sky-400/50' },
    Medium: { color: 'text-amber-400', ring: 'border-amber-400/50' },
    High: { color: 'text-red-500', ring: 'border-red-500/50' },
};

const signalTypeColors: { [key in SonarSignal['type']]: string } = {
    Financial: 'text-green-400',
    Geopolitical: 'text-amber-400',
    Cyber: 'text-red-400',
    Quantum: 'text-violet-400',
};

const SentimentGauge: React.FC<{ score: number }> = ({ score }) => {
    const percentage = (score + 1) / 2 * 100;
    let colorClass = 'bg-yellow-500';
    if (percentage > 60) colorClass = 'bg-green-500';
    if (percentage < 40) colorClass = 'bg-red-500';

    return (
        <div className="w-full bg-slate-700 rounded-full h-1.5">
            <div
                className={`${colorClass} h-1.5 rounded-full transition-all duration-500`}
                style={{ width: `${percentage}%` }}
            ></div>
        </div>
    );
};

// Simple Wavefunction Visualization Component
const WavefunctionVisualizer: React.FC = () => {
    return (
        <div className="relative w-full h-32 bg-black/50 overflow-hidden rounded-md border border-violet-500/30">
             <svg className="w-full h-full" preserveAspectRatio="none">
                <path 
                    d="M0 64 Q 25 20, 50 64 T 100 64 T 150 64 T 200 64 T 250 64 T 300 64 T 350 64" 
                    fill="none" 
                    stroke="rgba(167, 139, 250, 0.5)" 
                    strokeWidth="2"
                >
                    <animate attributeName="d" 
                        dur="3s" 
                        repeatCount="indefinite"
                        values="
                        M0 64 Q 25 10, 50 64 T 100 64 T 150 64 T 200 64 T 250 64 T 300 64 T 350 64;
                        M0 64 Q 25 110, 50 64 T 100 64 T 150 64 T 200 64 T 250 64 T 300 64 T 350 64;
                        M0 64 Q 25 10, 50 64 T 100 64 T 150 64 T 200 64 T 250 64 T 300 64 T 350 64" 
                    />
                </path>
                <path 
                    d="M0 64 Q 50 100, 100 64 T 200 64 T 300 64" 
                    fill="none" 
                    stroke="rgba(139, 92, 246, 0.8)" 
                    strokeWidth="2"
                >
                    <animate attributeName="d" 
                        dur="4s" 
                        repeatCount="indefinite"
                        values="
                        M0 64 Q 50 100, 100 64 T 200 64 T 300 64;
                        M0 64 Q 50 20, 100 64 T 200 64 T 300 64;
                        M0 64 Q 50 100, 100 64 T 200 64 T 300 64" 
                    />
                </path>
                 <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" className="text-xs fill-violet-200 font-mono opacity-80">
                    WAVEFUNCTION COLLAPSING...
                </text>
            </svg>
        </div>
    )
}

interface SonarProps {
    id: string; // New: Add ID prop for tour targeting
}

const Sonar: React.FC<SonarProps> = ({ id }) => {
    // Consume global Sonar State to prevent jumping
    const { sonarSignals: signals, addLog, sonarState, setSonarState } = useAppContext();
    const { zoom, pan, activeFilters } = sonarState;

    const [selectedSignal, setSelectedSignal] = useState<SonarSignal | null>(null);
    const [analysis, setAnalysis] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisError, setAnalysisError] = useState<string | null>(null);
    const [sentimentResult, setSentimentResult] = useState<SentimentResult | null>(null);
    const [isSentimentAnalyzing, setIsSentimentAnalyzing] = useState(false);
    const [sentimentError, setSentimentError] = useState<string | null>(null);
    
    // NANO BANANAS MODE (Visual Enhancement Toggle)
    const [isNanoMode, setIsNanoMode] = useState(true);

    const PAN_STEP = 50;

    const prevSignalsLength = useRef(signals.length);
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const isDraggingRef = useRef(false);
    const startPanRef = useRef({ x: 0, y: 0 });
    const startPositionRef = useRef({ x: 0, y: 0 });


    useEffect(() => {
        if (signals.length > 0) {
            const latestSignal = signals[signals.length - 1];
            if (signals.length > prevSignalsLength.current) {
                // Reduced logging to prevent console spam, only log major events if needed
            }
            if (!selectedSignal || selectedSignal.id !== latestSignal.id) {
                // Do NOT auto-select latest signal if user is inspecting another one, 
                // but for now we stick to original behavior or maybe only if nothing selected.
                // Keeping original behavior:
                setSelectedSignal(latestSignal);
            }
        }
        prevSignalsLength.current = signals.length;
    }, [signals, selectedSignal]);

    useEffect(() => {
        if (selectedSignal) {
            const runAnalyses = () => {
                setIsAnalyzing(true);
                setAnalysis(null);
                setAnalysisError(null);
                
                setIsSentimentAnalyzing(true);
                setSentimentResult(null);
                setSentimentError(null);

                // addLog('AI_TOOLKIT', `Analyzing Sonar signal ${selectedSignal.id}...`);

                if (selectedSignal.type === 'Quantum') {
                    analyzeQuantumVolatility(selectedSignal.details)
                        .then(result => setAnalysis(result))
                        .catch(e => {
                            const msg = e instanceof Error ? e.message : "Quantum analysis failed.";
                            setAnalysisError(msg);
                        })
                        .finally(() => setIsAnalyzing(false));
                } else {
                    getSignalAnalysis(selectedSignal.details)
                        .then(result => setAnalysis(result))
                        .catch(e => {
                            const msg = e instanceof Error ? e.message : "Briefing analysis failed.";
                            setAnalysisError(msg);
                        })
                        .finally(() => setIsAnalyzing(false));
                }

                analyzeSentiment(selectedSignal.details, addLog)
                    .then(result => setSentimentResult(result))
                    .catch(e => {
                        const msg = e instanceof Error ? e.message : "Sentiment analysis failed.";
                        setSentimentError(msg);
                    })
                    .finally(() => setIsSentimentAnalyzing(false));
            };
            runAnalyses();
        }
    }, [selectedSignal, addLog]);

    // Update Global State Helpers
    const setZoom = (newZoom: number) => {
        setSonarState(prev => ({ ...prev, zoom: Math.max(0.5, Math.min(newZoom, 5)) }));
    };

    const setPan = (newPan: {x: number, y: number}) => {
        setSonarState(prev => ({ ...prev, pan: newPan }));
    };

    const handleZoom = (factor: number) => {
        setZoom(zoom * factor);
    };

    const handlePan = (dx: number, dy: number) => {
        setPan({ x: pan.x + dx, y: pan.y + dy });
    };

    const handleReset = () => {
        setSonarState(prev => ({ ...prev, zoom: 1, pan: { x: 0, y: 0 } }));
    };

    const handleFilterToggle = (filterType: SonarSignal['type']) => {
        setSonarState(prev => {
            const newFilters = new Set(prev.activeFilters);
            if (newFilters.has(filterType)) {
                newFilters.delete(filterType);
            } else {
                newFilters.add(filterType);
            }
            return { ...prev, activeFilters: newFilters };
        });
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        if (mapContainerRef.current) {
            e.preventDefault();
            isDraggingRef.current = true;
            startPanRef.current = pan;
            startPositionRef.current = { x: e.clientX, y: e.clientY };
            mapContainerRef.current.classList.remove('cursor-grab');
            mapContainerRef.current.classList.add('cursor-grabbing');
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDraggingRef.current) return;
        const dx = e.clientX - startPositionRef.current.x;
        const dy = e.clientY - startPositionRef.current.y;
        setPan({
            x: startPanRef.current.x + dx / zoom,
            y: startPanRef.current.y + dy / zoom,
        });
    };

    const handleMouseUp = () => {
        if (isDraggingRef.current && mapContainerRef.current) {
            isDraggingRef.current = false;
            mapContainerRef.current.classList.remove('cursor-grabbing');
            mapContainerRef.current.classList.add('cursor-grab');
        }
    };

    const filteredSignalPositions = useMemo(() => {
        return signals
            .filter(signal => activeFilters.has(signal.type))
            .map(signal => {
                const x = (signal.lon + 180) / 3.6; 
                const y = (90 - signal.lat) / 1.8;
                return { ...signal, x, y };
            });
    }, [signals, activeFilters]);

    const renderMarkdown = (text: string) => {
        return text.split('\n').map((line, i) => {
            if (line.startsWith('### ')) return <h3 key={i} className="text-md font-semibold text-slate-100 mt-3 mb-1">{line.substring(4)}</h3>;
            if (line.startsWith('## ')) return <h2 key={i} className="text-lg font-bold text-slate-50 mt-4 mb-2">{line.substring(3)}</h2>;
            if (line.startsWith('* ')) return <li key={i} className="ml-4">{line.substring(2)}</li>;
            if (line.trim() === '') return <br key={i}/>;
            return <p key={i} className="leading-relaxed">{line}</p>;
        });
    };

    const ControlButton: React.FC<{ onClick: () => void; children: React.ReactNode; className?: string }> = ({ onClick, children, className }) => (
        <button onClick={onClick} className={`bg-black/80 hover:bg-slate-700/80 text-slate-300 rounded-md p-1.5 transition-colors ${className}`}>
            {children}
        </button>
    );

    const FilterButton: React.FC<{ type: SonarSignal['type'], isActive: boolean, onClick: (type: SonarSignal['type']) => void }> = ({ type, isActive, onClick }) => (
        <button
            onClick={() => onClick(type)}
            className={`px-3 py-1 text-xs font-mono rounded-full transition-colors ${
                isActive ? 'bg-amber-600 text-white' : 'bg-black/50 backdrop-blur-sm hover:bg-slate-600/50 text-slate-300'
            }`}
        >
            {type}
        </button>
    );


    return (
        <div id={id} className="bg-black/30 backdrop-blur-sm flex flex-col lg:flex-row h-full overflow-hidden relative">
            <div
                ref={mapContainerRef}
                className="flex-1 relative flex items-center justify-center overflow-hidden god-mode cursor-grab"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            >
                <div 
                    className="w-full h-full transition-transform duration-300 ease-out will-change-transform" // Use ease-out and will-change for smoothness
                    style={{ transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)` }}
                >
                    <div className="absolute inset-0 z-0 text-amber-500/30 opacity-50">
                        <WorldMapSVG />
                    </div>
                    
                    {filteredSignalPositions.map(signal => {
                        const isSelected = selectedSignal?.id === signal.id;
                        const isQuantum = signal.type === 'Quantum';
                        return (
                            <div
                                key={signal.id}
                                className="absolute z-10 transition-all duration-500 ease-out" // Animate position changes smoothly
                                style={{ left: `${signal.x}%`, top: `${signal.y}%` }}
                            >
                                <button 
                                    onClick={() => setSelectedSignal(signal)}
                                    className={`relative w-4 h-4 rounded-full flex items-center justify-center focus:outline-none focus:ring-2 ${isQuantum ? 'border-violet-500/50' : threatConfig[signal.threat].ring}`}
                                    title={`Signal: ${signal.type} - ${signal.threat}`}
                                    aria-label={`Select signal ${signal.id}`}
                                >
                                    <div className={`w-2 h-2 rounded-full bg-current ${isQuantum ? 'text-violet-400' : threatConfig[signal.threat].color}`} style={{animation: 'signal-pulse 1.5s infinite'}}></div>
                                    {isSelected && <div className={`signal-selected-highlight ${isQuantum ? '!border-violet-500' : ''}`} />}
                                </button>
                            </div >
                        )
                    })}
                </div >
                
                {/* Nano Bananas Visuals: High-tech grid and scanning rings */}
                {isNanoMode && (
                    <>
                        <div className="sonar-grid opacity-30 pointer-events-none"></div>
                        <div className="sonar-sweep pointer-events-none"></div>
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="sonar-ring pointer-events-none opacity-20 border-amber-500/30" style={{ width: `${i * 25}vh`, height: `${i * 25}vh` }}></div>
                        ))}
                    </>
                )}

                <div className="absolute bottom-4 right-4 z-30 flex flex-col items-end space-y-2">
                    <div className="flex bg-black/80 rounded-md p-1">
                        <ControlButton onClick={() => handleZoom(1.2)}>
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                        </ControlButton>
                        <ControlButton onClick={() => handleZoom(0.8)}>
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6" /></svg>
                        </ControlButton>
                    </div >
                    <div className="bg-black/80 rounded-md p-1 w-24 grid grid-cols-3 grid-rows-3 gap-1">
                        <div className="col-start-2 row-start-1">
                            <ControlButton onClick={() => handlePan(0, PAN_STEP)}><ArrowUpIcon className="w-5 h-5 mx-auto" /></ControlButton>
                        </div >
                        <div className="col-start-1 row-start-2">
                             <ControlButton onClick={() => handlePan(PAN_STEP, 0)}><ArrowLeftIcon className="w-5 h-5 mx-auto" /></ControlButton>
                        </div >
                        <div className="col-start-2 row-start-2">
                            <ControlButton onClick={handleReset}><RefreshIcon className="w-5 h-5 mx-auto" /></ControlButton>
                        </div >
                        <div className="col-start-3 row-start-2">
                             <ControlButton onClick={() => handlePan(-PAN_STEP, 0)}><ArrowRightIcon className="w-5 h-5 mx-auto" /></ControlButton>
                        </div >
                        <div className="col-start-2 row-start-3">
                            <ControlButton onClick={() => handlePan(0, -PAN_STEP)}><ArrowDownIcon className="w-5 h-5 mx-auto" /></ControlButton>
                        </div >
                    </div >
                </div >
            </div >

            <div className="w-full lg:w-96 bg-black/50 backdrop-blur-sm border-l border-slate-800 flex flex-col z-20">
                <div className="p-4 border-b border-slate-800">
                    <div className="flex justify-between items-center mb-3">
                        <h2 className="text-sm font-bold text-amber-400 font-mono">// SONAR // THREAT ANALYSIS</h2>
                        <button 
                            onClick={() => setIsNanoMode(!isNanoMode)} 
                            className={`text-[10px] font-mono border px-2 py-0.5 rounded ${isNanoMode ? 'border-amber-500 text-amber-400' : 'border-slate-600 text-slate-500'}`}
                        >
                            NANO_VISUALS: {isNanoMode ? 'ON' : 'OFF'}
                        </button>
                    </div>
                    <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                        <span className="text-xs text-slate-500 font-mono">FILTERS:</span >
                        <FilterButton type="Financial" isActive={activeFilters.has('Financial')} onClick={handleFilterToggle} />
                        <FilterButton type="Geopolitical" isActive={activeFilters.has('Geopolitical')} onClick={handleFilterToggle} />
                        <FilterButton type="Cyber" isActive={activeFilters.has('Cyber')} onClick={handleFilterToggle} />
                        <FilterButton type="Quantum" isActive={activeFilters.has('Quantum')} onClick={handleFilterToggle} />
                    </div >
                </div >
                <div className="flex-1 p-4 overflow-y-auto">
                    {selectedSignal ? (
                        <div className="space-y-4 font-mono text-sm animate-fade-in-fast">
                             <div >
                                <h3 className={`text-lg font-bold ${selectedSignal.type === 'Quantum' ? 'text-violet-400' : threatConfig[selectedSignal.threat].color}`}>{selectedSignal.threat.toUpperCase()} THREAT</h3 >
                                <p className={`text-xs ${signalTypeColors[selectedSignal.type]}`}>{selectedSignal.type} Event</p >
                            </div >
                            <div className="space-y-2 text-xs">
                                <div className="flex justify-between">
                                    <span className="text-slate-500">ID:</span >
                                    <span className="text-slate-300">{selectedSignal.id}</span >
                                </div >
                                 <div className="flex justify-between">
                                    <span className="text-slate-500">TIME:</span >
                                    <span className="text-slate-300">{selectedSignal.timestamp}</span >
                                </div >
                                <div className="flex justify-between">
                                    <span className="text-slate-500">COORDS:</span >
                                    <span className="text-slate-300">{selectedSignal.lat.toFixed(2)}, {selectedSignal.lon.toFixed(2)}</span >
                                </div >
                                <div className="flex justify-between">
                                    <span className="text-slate-500">DETAILS:</span >
                                    <span className="text-slate-300 text-right">{selectedSignal.details}</span >
                                </div >
                            </div >
                            
                            {selectedSignal.type === 'Quantum' && (
                                <div className="border border-violet-500/30 p-2 rounded">
                                    <h4 className="text-xs font-bold text-violet-400 mb-2">// QUANTUM WAVEFUNCTION STATE</h4>
                                    <WavefunctionVisualizer />
                                </div>
                            )}

                            <div >
                                <h4 className="text-xs font-bold text-slate-400 mb-2">// SENTIMENT ANALYSIS</h4 >
                                <div className="text-slate-300 bg-black/50 backdrop-blur-sm p-3 rounded space-y-3">
                                    {isSentimentAnalyzing && <div className="flex items-center justify-center py-4"><Loader /></div >}
                                    {sentimentError && <p className="text-red-400 text-xs">{sentimentError}</p >}
                                    {sentimentResult && (
                                        <>
                                            <div className="flex justify-between items-center text-xs">
                                                <span className="font-bold">Overall Sentiment</span >
                                                <span className={`px-2 py-0.5 rounded-full font-medium ${
                                                    sentimentResult.overall_sentiment > 0.1 ? 'bg-green-900 text-green-300' :
                                                    sentimentResult.overall_sentiment < -0.1 ? 'bg-red-900 text-red-300' :
                                                    'bg-slate-700 text-slate-300'
                                                }`}>
                                                    {sentimentResult.sentiment_label}
                                                </span >
                                            </div >
                                            <SentimentGauge score={sentimentResult.overall_sentiment} />
                                            <p className="text-xs text-slate-400 pt-2 border-t border-slate-700/50">{sentimentResult.summary}</p >
                                            <ul className="text-xs text-amber-300 space-y-1">
                                                {sentimentResult.key_topics.map((topic, i) => <li key={i} className="bg-amber-950/70 px-2 py-1 rounded truncate">› {topic}</li>)}
                                            </ul>
                                            {sentimentResult.sources && sentimentResult.sources.length > 0 && (
                                                <div className="mt-3 pt-2 border-t border-slate-700/50">
                                                    <h5 className="text-xs font-bold text-slate-400 mb-1">Sources:</h5>
                                                    <ul className="list-disc list-inside text-xs space-y-1">
                                                        {sentimentResult.sources.map((source, i) => (
                                                            <li key={i}>
                                                                <a href={source} target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:underline break-all">
                                                                    {source}
                                                                </a>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div >
                            </div >
                            <div >
                                <h4 className="text-xs font-bold text-slate-400 mb-1">// {selectedSignal.type === 'Quantum' ? 'QUANTUM VOLATILITY REPORT' : 'ORACLE BRIEFING'}</h4 >
                                <div className="text-slate-300 bg-black/50 backdrop-blur-sm p-3 rounded min-h-[150px] prose prose-sm prose-invert max-w-none">
                                    {isAnalyzing && (
                                        <div className="flex items-center justify-center h-full">
                                            <Loader />
                                        </div >
                                    )}
                                    {analysisError && <p className="text-red-400 text-xs">{analysisError}</p >}
                                    {analysis && renderMarkdown(analysis)}
                                </div >
                            </div >
                        </div >
                    ) : (
                        <div className="h-full flex items-center justify-center text-center text-slate-500">
                            <p>No signal selected.<br />Awaiting new threat vectors.</p >
                        </div >
                    )}
                </div >
                <div className="p-4 border-t border-slate-800 text-xs font-mono text-slate-500">
                    <p>STATUS: <span className="text-green-400">NOMINAL</span ></p >
                    <p>SIGNALS TRACKED: <span className="text-slate-300">{signals.length}</span ></p >
                </div >
            </div >
        </div >
    );
};

export default Sonar;
