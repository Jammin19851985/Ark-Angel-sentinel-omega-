
import React, { useState, useCallback } from 'react';
import { auditCode, generatePatchedCode } from '../../services/geminiService';
import CodeInput from '../CodeInput';
import ReviewOutput from '../ReviewOutput';
import { useAppContext } from '../../contexts/AppContext';
import { SparklesIcon } from '../icons/SparklesIcon';
import Loader from '../Loader';
import { SpeakerIcon } from '../icons/SpeakerIcon';
import { CopyIcon } from '../icons/CopyIcon';
import { CheckCircleIcon } from '../icons/CheckCircleIcon';
import { TerminalIcon } from '../icons/TerminalIcon';
import { BookOpenIcon } from '../icons/BookOpenIcon';

const CodeAuditorTab: React.FC = () => {
    const { addLog } = useAppContext();
    const [code, setCode] = useState('');
    const [language, setLanguage] = useState('Python');
    const [review, setReview] = useState<string | null>(null);
    const [patchedCode, setPatchedCode] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isPatching, setIsPatching] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeView, setActiveView] = useState<'REVIEW' | 'PATCH' | 'EXPLAIN'>('REVIEW');
    const [copied, setCopied] = useState(false);

    const handleSubmit = useCallback(async () => {
        if (!code.trim() || isLoading) return;
        setIsLoading(true);
        setError(null);
        setReview(null);
        setPatchedCode(null);
        setActiveView('REVIEW');
        addLog('AI_TOOLKIT', `Forensic code audit initiated for ${language} codebase.`);
        try {
            const result = await auditCode(code, language);
            setReview(result);
            addLog('AI_TOOLKIT', 'Review manifest generated via OMEGA-tier scrutiny.');
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Initialization failed.";
            setError(errorMessage);
            addLog('ERROR', `Audit Failure: ${errorMessage}`);
        } finally {
            setIsLoading(false);
        }
    }, [code, language, isLoading, addLog]);

    const handleAutoPatch = useCallback(async () => {
        if (!review || !code || isPatching) return;
        setIsPatching(true);
        setActiveView('PATCH');
        addLog('AI_TOOLKIT', 'Initiating ACMD Auto-Patch protocol...');
        try {
            const result = await generatePatchedCode(code, language, review);
            setPatchedCode(result);
            addLog('AI_TOOLKIT', 'SKP Patch synthesized. Causal drift nullified.');
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Synthesis failure.";
            setError(errorMessage);
            addLog('ERROR', `Auto-Patch Failure: ${errorMessage}`);
        } finally {
            setIsPatching(false);
        }
    }, [code, language, review, isPatching, addLog]);

    const speakText = useCallback((text: string) => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 1.25;
            utterance.pitch = 0.75;
            const voices = window.speechSynthesis.getVoices();
            const voice = voices.find(v => v.name.includes('Google US English') || v.name.includes('Samantha')) || voices[0];
            utterance.voice = voice;
            window.speechSynthesis.speak(utterance);
        }
    }, []);

    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy', err);
        }
    };

    return (
        <div className="h-full flex flex-col font-mono text-xs overflow-hidden min-h-0">
            {/* Control Bar */}
            <div className="flex flex-col lg:flex-row justify-between items-center mb-4 gap-4 p-3 border border-slate-800 bg-black/60 rounded shadow-inner shrink-0">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-950/20 border border-amber-500/30 rounded">
                        <TerminalIcon className="w-5 h-5 text-amber-500 animate-pulse" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-slate-100 uppercase tracking-widest">Code Assist Ω</h3>
                        <p className="text-[9px] text-slate-500 uppercase tracking-tighter">AODE ACMD Protocol v3.4 // SKP Logic</p>
                    </div>
                </div>
                <div className="flex gap-2 w-full lg:w-auto">
                    <button
                        onClick={handleSubmit}
                        disabled={isLoading || !code.trim()}
                        className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-amber-600 hover:bg-amber-500 text-black font-bold rounded-sm transition-all shadow-[0_0_20px_rgba(245,158,11,0.2)] disabled:opacity-30 uppercase tracking-widest"
                    >
                        {isLoading ? <Loader /> : <SparklesIcon className="w-4 h-4" />}
                        <span>{isLoading ? 'Scanning...' : 'Run Audit'}</span>
                    </button>
                </div>
            </div>
            
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 overflow-hidden min-h-0">
                {/* Source Column */}
                <div className="flex flex-col h-full overflow-hidden border border-slate-800 bg-black/40 rounded p-2">
                    <div className="flex justify-between items-center mb-2 px-1">
                        <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Input Buffer</span>
                        <select
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            className="bg-black/80 border border-slate-700 rounded px-2 py-0.5 text-[10px] text-amber-500 outline-none focus:border-amber-400"
                        >
                            <option value="Python">PYTHON</option>
                            <option value="TypeScript">TYPESCRIPT</option>
                            <option value="Rust">RUST</option>
                            <option value="Solidity">SOLIDITY</option>
                        </select>
                    </div>
                    <div className="flex-1 min-h-0">
                        <CodeInput
                            code={code}
                            setCode={setCode}
                            language={language}
                            setLanguage={setLanguage}
                            isLoading={isLoading}
                        />
                    </div>
                </div>
                
                {/* Result Column */}
                <div className="flex flex-col h-full overflow-hidden bg-black/20 border border-slate-800 rounded">
                    {/* Local Navigation */}
                    <div className="flex items-center justify-between p-2 border-b border-slate-800 bg-slate-900/60 backdrop-blur-sm shrink-0">
                        <div className="flex gap-1">
                            <button 
                                onClick={() => setActiveView('REVIEW')}
                                className={`px-2.5 py-1 rounded-sm text-[9px] font-bold uppercase transition-all ${activeView === 'REVIEW' ? 'bg-amber-900/50 text-amber-400 border border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.2)]' : 'text-slate-500 hover:text-slate-300'}`}
                            >
                                Analysis
                            </button>
                            <button 
                                onClick={() => setActiveView('PATCH')}
                                className={`px-2.5 py-1 rounded-sm text-[9px] font-bold uppercase transition-all ${activeView === 'PATCH' ? 'bg-emerald-900/50 text-emerald-400 border border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.2)]' : 'text-slate-500 hover:text-slate-300'}`}
                            >
                                Optimized
                            </button>
                        </div>
                        
                        <div className="flex gap-2">
                            {review && activeView === 'REVIEW' && (
                                <>
                                    <button 
                                        onClick={() => speakText(review)}
                                        className="p-1.5 rounded-sm bg-black/40 border border-slate-800 hover:border-amber-500 text-slate-400 hover:text-amber-400 transition-all group" 
                                        title="Neural Read Aloud"
                                    >
                                        <SpeakerIcon className="w-3.5 h-3.5 group-hover:scale-110" />
                                    </button>
                                    <button 
                                        onClick={handleAutoPatch}
                                        disabled={isPatching}
                                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-emerald-600/20 hover:bg-emerald-600/40 border border-emerald-500/50 text-emerald-400 text-[9px] font-bold uppercase transition-all disabled:opacity-30"
                                    >
                                        {isPatching ? <Loader /> : <SparklesIcon className="w-3.5 h-3.5" />}
                                        Patch Core
                                    </button>
                                </>
                            )}
                            {activeView === 'PATCH' && patchedCode && (
                                <button 
                                    onClick={() => copyToClipboard(patchedCode)}
                                    className="flex items-center gap-1.5 px-3 py-1 rounded-sm bg-slate-800 border border-slate-600 text-slate-300 text-[9px] font-bold uppercase transition-all hover:bg-slate-700"
                                >
                                    {copied ? <CheckCircleIcon className="w-3.5 h-3.5 text-emerald-400" /> : <CopyIcon className="w-3.5 h-3.5" />}
                                    {copied ? 'Copied' : 'Clone'}
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar min-h-0">
                        {error ? (
                            <div className="p-5 border border-red-900/40 bg-red-950/20 text-red-400 rounded text-center font-bold">
                                <TerminalIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                <p className="tracking-widest">SYSTEM_DECOHERENCE</p>
                                <p className="text-[10px] mt-1 font-normal opacity-70">{error}</p>
                            </div>
                        ) : activeView === 'REVIEW' ? (
                            <ReviewOutput review={review} isLoading={isLoading} error={null} />
                        ) : (
                            <div className="h-full">
                                {isPatching ? (
                                    <div className="h-full flex flex-col items-center justify-center space-y-4">
                                        <div className="relative w-16 h-16">
                                            <div className="absolute inset-0 border-2 border-emerald-500/20 rounded-full"></div>
                                            <div className="absolute inset-0 border-t-2 border-emerald-500 rounded-full animate-spin"></div>
                                            <SparklesIcon className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-emerald-400 animate-pulse" />
                                        </div>
                                        <div className="text-center">
                                            <p className="text-emerald-400 font-bold uppercase tracking-[0.2em] animate-pulse">Synthesis in Progress...</p>
                                            <p className="text-slate-500 text-[9px] mt-1 uppercase">Applying Causal Reversal to Errors</p>
                                        </div>
                                    </div>
                                ) : patchedCode ? (
                                    <div className="bg-black/40 p-4 rounded border border-emerald-500/20 shadow-inner">
                                        <pre className="font-mono text-xs text-emerald-400/90 whitespace-pre-wrap leading-relaxed selection:bg-emerald-500/20">
                                            {patchedCode}
                                        </pre>
                                    </div>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center text-slate-700 opacity-40">
                                        <BookOpenIcon className="w-10 h-10 mb-2" />
                                        <p className="text-[10px] uppercase tracking-[0.5em]">Awaiting Simulation Result</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CodeAuditorTab;
