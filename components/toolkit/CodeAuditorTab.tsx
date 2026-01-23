
import React, { useState, useCallback } from 'react';
import { auditCode, generatePatchedCode, sendMessageToSentinelA } from '../../services/geminiService';
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
import { ShieldCheckIcon } from '../icons/ShieldCheckIcon';

const CodeAuditorTab: React.FC = () => {
    const { addLog } = useAppContext();
    const [code, setCode] = useState('');
    const [language, setLanguage] = useState('Python');
    const [review, setReview] = useState<string | null>(null);
    const [patchedCode, setPatchedCode] = useState<string | null>(null);
    const [explanation, setExplanation] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isPatching, setIsPatching] = useState(false);
    const [isExplaining, setIsExplaining] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeView, setActiveView] = useState<'REVIEW' | 'PATCH' | 'EXPLAIN'>('REVIEW');
    const [copied, setCopied] = useState(false);
    const [scanPhase, setScanPhase] = useState<string | null>(null);

    const handleSubmit = useCallback(async () => {
        if (!code.trim() || isLoading) return;
        setIsLoading(true);
        setError(null);
        setReview(null);
        setPatchedCode(null);
        setExplanation(null);
        setActiveView('REVIEW');
        addLog('AI_TOOLKIT', `Forensic code audit initiated for ${language} codebase.`);
        
        try {
            // Forensic Scan Phases
            const phases = [
                "PHASE_1: LEXICAL_DECOMPOSITION",
                "PHASE_2: SEMANTIC_TOPOLOGY_MAPPING",
                "PHASE_3: CAUSAL_DRIFT_DETECTION",
                "PHASE_4: VULNERABILITY_LEAK_SCAN",
                "PHASE_5: OMEGA_SCALING_VERIFICATION"
            ];
            
            for (const phase of phases) {
                setScanPhase(phase);
                await new Promise(r => setTimeout(r, 600));
            }

            const result = await auditCode(code, language);
            setReview(result);
            addLog('AI_TOOLKIT', 'Review manifest generated via OMEGA-tier scrutiny.');
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Initialization failed.";
            setError(errorMessage);
            addLog('ERROR', `Audit Failure: ${errorMessage}`);
        } finally {
            setIsLoading(false);
            setScanPhase(null);
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

    const handleExplain = useCallback(async () => {
        if (!code.trim() || isExplaining) return;
        setIsExplaining(true);
        setActiveView('EXPLAIN');
        addLog('AI_TOOLKIT', 'Requesting high-level code explanation...');
        try {
            const { text } = await sendMessageToSentinelA(`Analyze the following code snippet (${language}). Provide a high-level overview of its functionality and list 3 potential improvements:\n\n${code}`);
            setExplanation(text);
            addLog('AI_TOOLKIT', 'Explanation synthesized.');
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Explanation failure.";
            setError(errorMessage);
            addLog('ERROR', `Explanation Failure: ${errorMessage}`);
        } finally {
            setIsExplaining(false);
        }
    }, [code, language, isExplaining, addLog]);

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
            <div className="flex flex-col lg:flex-row justify-between items-center mb-4 gap-4 p-3 border border-slate-800 bg-black/60 rounded shadow-inner shrink-0 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-[1px] bg-amber-500/20 animate-pulse"></div>
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-950/20 border border-amber-500/30 rounded">
                        <TerminalIcon className="w-5 h-5 text-amber-500 animate-pulse" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-slate-100 uppercase tracking-widest flex items-center gap-2">
                             Code Assist Ω // ACMD_PRO
                             {isLoading && <span className="text-[8px] bg-amber-900 text-amber-300 px-1 py-0.5 rounded animate-pulse">SCANNING</span>}
                        </h3>
                        <p className="text-[9px] text-slate-500 uppercase tracking-tighter">AODE ACMD Protocol v3.4 // SKP Logic // JURISDICTION: OFFSHORE</p>
                    </div>
                </div>
                <div className="flex gap-2 w-full lg:w-auto">
                    <button
                        onClick={handleSubmit}
                        disabled={isLoading || !code.trim()}
                        className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-amber-600 hover:bg-amber-500 text-black font-bold rounded-sm transition-all shadow-[0_0_20px_rgba(245,158,11,0.2)] disabled:opacity-30 uppercase tracking-widest border-b-4 border-amber-800 active:border-b-0 active:translate-y-1"
                    >
                        {isLoading ? <Loader /> : <SparklesIcon className="w-4 h-4" />}
                        <span>{isLoading ? 'Scanning...' : 'Execute Forensic Audit'}</span>
                    </button>
                </div>
            </div>
            
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 overflow-hidden min-h-0">
                {/* Source Column */}
                <div className="flex flex-col h-full overflow-hidden border border-slate-800 bg-black/40 rounded p-2">
                    <div className="flex justify-between items-center mb-2 px-1">
                        <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-cyan-500"></div>
                            Input Buffer (Source)
                        </span>
                        <div className="flex gap-2">
                            <span className="text-[8px] text-slate-600 self-center">LANG:</span>
                            <select
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                                className="bg-black/80 border border-slate-700 rounded px-2 py-0.5 text-[10px] text-amber-500 outline-none focus:border-amber-400"
                            >
                                <option value="Python">PYTHON</option>
                                <option value="TypeScript">TYPESCRIPT</option>
                                <option value="Rust">RUST</option>
                                <option value="Solidity">SOLIDITY</option>
                                <option value="Go">GO_ENGINE</option>
                            </select>
                        </div>
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
                <div className="flex flex-col h-full overflow-hidden bg-black/20 border border-slate-800 rounded relative">
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
                                onClick={() => setActiveView('EXPLAIN')}
                                className={`px-2.5 py-1 rounded-sm text-[9px] font-bold uppercase transition-all ${activeView === 'EXPLAIN' ? 'bg-blue-900/50 text-blue-400 border border-blue-500/50 shadow-[0_0_10px_rgba(59,130,246,0.2)]' : 'text-slate-500 hover:text-slate-300'}`}
                            >
                                Explain
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
                                <button 
                                    onClick={handleAutoPatch}
                                    disabled={isPatching}
                                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-emerald-600 hover:bg-emerald-500 text-black text-[9px] font-bold uppercase transition-all disabled:opacity-30 shadow-[0_0_10px_rgba(16,185,129,0.4)]`}
                                >
                                    {isPatching ? <Loader /> : <SparklesIcon className="w-3.5 h-3.5" />}
                                    Auto-Patch Kernel
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar min-h-0">
                        {isLoading ? (
                            <div className="h-full flex flex-col items-center justify-center space-y-6">
                                <div className="relative">
                                    <div className="w-20 h-20 border-2 border-amber-500/20 rounded-full"></div>
                                    <div className="absolute inset-0 border-t-2 border-amber-500 rounded-full animate-spin"></div>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <ShieldCheckIcon className="w-8 h-8 text-amber-500 animate-pulse" />
                                    </div>
                                </div>
                                <div className="text-center">
                                    <p className="text-amber-500 font-bold uppercase tracking-[0.3em] mb-1 animate-pulse">{scanPhase}</p>
                                    <p className="text-[8px] text-slate-600 uppercase tracking-widest font-mono">NEURAL_DECRYPTION_IN_PROGRESS</p>
                                </div>
                            </div>
                        ) : error ? (
                            <div className="p-5 border border-red-900/40 bg-red-950/20 text-red-400 rounded text-center font-bold">
                                <TerminalIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                <p className="tracking-widest uppercase">Kernel_Audit_Terminated</p>
                                <p className="text-[10px] mt-1 font-normal opacity-70 italic">"{error}"</p>
                            </div>
                        ) : activeView === 'REVIEW' ? (
                            <ReviewOutput review={review} isLoading={false} error={null} />
                        ) : activeView === 'EXPLAIN' ? (
                            <ReviewOutput review={explanation} isLoading={isExplaining} error={null} />
                        ) : (
                            <div className="h-full">
                                {isPatching ? (
                                    <div className="h-full flex flex-col items-center justify-center space-y-4">
                                        <div className="relative w-16 h-16">
                                            <div className="absolute inset-0 border-2 border-emerald-500/20 rounded-full"></div>
                                            <div className="absolute inset-0 border-t-2 border-emerald-500 rounded-full animate-spin"></div>
                                            <SparklesIcon className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-emerald-400 animate-pulse" />
                                        </div>
                                        <p className="text-emerald-500 font-bold uppercase tracking-widest text-[10px] animate-pulse">Transmuting Skp Code...</p>
                                    </div>
                                ) : patchedCode ? (
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center bg-emerald-950/20 border border-emerald-500/30 p-2 rounded">
                                            <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-widest flex items-center gap-2">
                                                <CheckCircleIcon className="w-3 h-3" />
                                                Optimized Source Ready
                                            </span>
                                            <button 
                                                onClick={() => copyToClipboard(patchedCode)}
                                                className="text-[9px] bg-emerald-600 text-black px-2 py-0.5 rounded font-bold hover:bg-emerald-400 transition-colors"
                                            >
                                                {copied ? 'Copied!' : 'Copy to Buffer'}
                                            </button>
                                        </div>
                                        <pre className="font-mono text-xs text-emerald-300 whitespace-pre-wrap leading-relaxed selection:bg-emerald-900/50 p-3 bg-black/40 rounded border border-emerald-500/10">
                                            {patchedCode}
                                        </pre>
                                    </div>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center opacity-30 text-slate-500 space-y-2">
                                        <div className="p-3 border-2 border-dashed border-slate-700 rounded-full">
                                            <SparklesIcon className="w-6 h-6" />
                                        </div>
                                        <p className="text-[10px] uppercase tracking-widest">Awaiting Synthesis Command</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
            {/* Overlay Grid for Forensic Feel */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(90deg,white_1px,transparent_1px),linear-gradient(white_1px,transparent_1px)] bg-[length:20px_20px] z-0"></div>
        </div>
    );
};

export default CodeAuditorTab;
