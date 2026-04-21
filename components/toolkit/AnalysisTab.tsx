
import React, { useState, useCallback } from 'react';
import { analyzeCodeDeep } from '../../services/geminiService';
import { CodeAnalysisResult } from '../../types';
import CodeInput from '../CodeInput';
import { useAppContext } from '../../contexts/AppContext';
import { SparklesIcon } from '../icons/SparklesIcon';
import Loader from '../Loader';
import { TerminalIcon } from '../icons/TerminalIcon';
import { ShieldCheckIcon } from '../icons/ShieldCheckIcon';
import { ShieldAlertIcon } from '../icons/ShieldAlertIcon';

const AnalysisTab: React.FC = () => {
    const { addLog } = useAppContext();
    const [code, setCode] = useState('');
    const [language, setLanguage] = useState('TypeScript');
    const [result, setResult] = useState<CodeAnalysisResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleAnalyze = useCallback(async () => {
        if (!code.trim() || isLoading) return;
        setIsLoading(true);
        setError(null);
        setResult(null);
        addLog('AI_TOOLKIT', `Deep code analysis initiated for ${language}.`);
        
        try {
            const analysis = await analyzeCodeDeep(code, language);
            setResult(analysis);
            addLog('AI_TOOLKIT', 'Deep analysis report generated.');
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Analysis failed.";
            setError(errorMessage);
            addLog('ERROR', `Analysis Failure: ${errorMessage}`);
        } finally {
            setIsLoading(false);
        }
    }, [code, language, isLoading, addLog]);

    return (
        <div className="h-full flex flex-col font-mono text-xs overflow-hidden min-h-0">
            <div className="flex flex-col lg:flex-row justify-between items-center mb-4 gap-4 p-3 border border-slate-800 bg-black/60 rounded shadow-inner shrink-0">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-cyan-950/20 border border-cyan-500/30 rounded">
                        <ShieldCheckIcon className="w-5 h-5 text-cyan-500" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-slate-100 uppercase tracking-widest">
                             Deep Code Analysis // OMEGA_SCAN
                        </h3>
                        <p className="text-[9px] text-slate-500 uppercase tracking-tighter">Bugs // Security // Optimizations</p>
                    </div>
                </div>
                <button
                    onClick={handleAnalyze}
                    disabled={isLoading || !code.trim()}
                    className="flex items-center justify-center gap-2 px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-black font-bold rounded transition-all disabled:opacity-30 uppercase tracking-widest"
                >
                    {isLoading ? <Loader /> : <SparklesIcon className="w-4 h-4" />}
                    <span>{isLoading ? 'Analyzing...' : 'Run Deep Scan'}</span>
                </button>
            </div>
            
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 overflow-hidden min-h-0">
                <div className="flex flex-col h-full overflow-hidden border border-slate-800 bg-black/40 rounded p-2">
                    <div className="flex justify-between items-center mb-2 px-1">
                        <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Source Code</span>
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
                
                <div className="flex flex-col h-full overflow-y-auto bg-black/20 border border-slate-800 rounded p-4 custom-scrollbar">
                    {isLoading ? (
                        <div className="h-full flex flex-col items-center justify-center space-y-4">
                            <Loader />
                            <div className="text-cyan-500 font-bold uppercase tracking-widest animate-pulse">Scanning Neural Topology...</div>
                        </div>
                    ) : error ? (
                        <div className="p-4 border border-red-900/40 bg-red-950/20 text-red-400 rounded text-center">
                            <TerminalIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <div className="uppercase font-bold">Analysis_Error</div>
                            <div className="text-[10px] mt-1">{error}</div>
                        </div>
                    ) : result ? (
                        <div className="space-y-6">
                            <div className="p-3 bg-cyan-950/20 border border-cyan-500/30 rounded">
                                <h4 className="text-cyan-400 font-bold uppercase mb-2 text-[10px] tracking-widest">Executive Summary</h4>
                                <p className="text-slate-300 leading-relaxed italic">"{result.summary}"</p>
                            </div>

                            <section>
                                <h4 className="flex items-center gap-2 text-red-400 font-bold uppercase mb-3 text-[10px] tracking-widest">
                                    <ShieldAlertIcon className="w-4 h-4" />
                                    Potential Bugs
                                </h4>
                                <ul className="space-y-2">
                                    {result.bugs.length > 0 ? result.bugs.map((bug, i) => (
                                        <li key={i} className="p-2 bg-red-950/10 border-l-2 border-red-500 text-slate-300">
                                            {bug}
                                        </li>
                                    )) : <li className="text-slate-500 italic">No critical bugs detected.</li>}
                                </ul>
                            </section>

                            <section>
                                <h4 className="flex items-center gap-2 text-amber-400 font-bold uppercase mb-3 text-[10px] tracking-widest">
                                    <ShieldCheckIcon className="w-4 h-4" />
                                    Security Vulnerabilities
                                </h4>
                                <ul className="space-y-2">
                                    {result.security.length > 0 ? result.security.map((sec, i) => (
                                        <li key={i} className="p-2 bg-amber-950/10 border-l-2 border-amber-500 text-slate-300">
                                            {sec}
                                        </li>
                                    )) : <li className="text-slate-500 italic">No immediate security threats found.</li>}
                                </ul>
                            </section>

                            <section>
                                <h4 className="flex items-center gap-2 text-emerald-400 font-bold uppercase mb-3 text-[10px] tracking-widest">
                                    <SparklesIcon className="w-4 h-4" />
                                    Optimization Suggestions
                                </h4>
                                <ul className="space-y-2">
                                    {result.optimizations.length > 0 ? result.optimizations.map((opt, i) => (
                                        <li key={i} className="p-2 bg-emerald-950/10 border-l-2 border-emerald-500 text-slate-300">
                                            {opt}
                                        </li>
                                    )) : <li className="text-slate-500 italic">Code is already highly optimized.</li>}
                                </ul>
                            </section>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center opacity-30 text-slate-500 space-y-2">
                            <TerminalIcon className="w-10 h-10" />
                            <div className="text-[10px] uppercase tracking-widest">Awaiting Source Injection</div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AnalysisTab;
