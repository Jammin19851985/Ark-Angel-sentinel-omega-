
import React, { useState, useCallback } from 'react';
import { RagQueryResult } from '../../types';
import { queryRagStore } from '../../services/geminiService';
import Loader from '../Loader';
import { BookOpenIcon } from '../icons/BookOpenIcon'; 
import { DatabaseIcon } from '../icons/DatabaseIcon';
import { ShieldCheckIcon } from '../icons/ShieldCheckIcon';
import { useAppContext } from '../../contexts/AppContext';

export const RagTab: React.FC = () => {
    const { addLog } = useAppContext();
    const [query, setQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [synthesisStep, setSynthesisStep] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<RagQueryResult | null>(null);

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim() || isLoading) return;

        setIsLoading(true);
        setError(null);
        setResult(null);
        addLog('AI_TOOLKIT', `Intel RAG query submitted: "${query}"`);

        try {
            setSynthesisStep("RETRIEVING_EMBEDDINGS...");
            await new Promise(r => setTimeout(r, 800));
            setSynthesisStep("RANKING_CONTEXT_CHUNKS...");
            await new Promise(r => setTimeout(r, 600));
            setSynthesisStep("NEURAL_SYNTHESIS_ACTIVE...");
            
            const ragData = await queryRagStore(query);
            
            setSynthesisStep("MLEM_VERIFICATION...");
            await new Promise(r => setTimeout(r, 400));
            
            setResult(ragData);
            addLog('AI_TOOLKIT', 'Intel RAG response synthesized.');
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
            setError(errorMessage);
            addLog('ERROR', `Intel RAG Error: ${errorMessage}`);
        } finally {
            setIsLoading(false);
            setSynthesisStep(null);
        }
    }, [query, isLoading, addLog]);

    return (
        <div className="h-full flex flex-col font-mono">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="text-xl font-bold text-amber-500 uppercase tracking-tighter flex items-center gap-2">
                        <DatabaseIcon className="w-5 h-5" /> // INTEL RAG MATRIX
                    </h3>
                    <p className="text-[10px] text-slate-500 uppercase tracking-[0.3em] mt-1">Sovereign Knowledge Retrieval Engine v4.0</p>
                </div>
                <div className="bg-amber-950/20 border border-amber-500/20 px-2 py-1 rounded text-[8px] text-amber-400">
                    CORE_INGESTION: 100%
                </div>
            </div>

            <form onSubmit={handleSubmit} className="mb-6 relative group">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="// DECRYPT SYSTEM PROTOCOLS..."
                    disabled={isLoading}
                    className="w-full bg-black/60 border border-slate-700 rounded-lg pl-4 pr-12 py-4 text-xs text-amber-500 placeholder-amber-900/50 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all shadow-[inset_0_0_10px_rgba(0,0,0,0.5)]"
                />
                <button 
                    type="submit" 
                    disabled={isLoading || !query.trim()} 
                    className="absolute inset-y-0 right-0 flex items-center pr-4 text-amber-500 hover:text-amber-400 disabled:text-slate-700 transition-colors"
                >
                    {isLoading ? <Loader /> : (
                        <svg className="w-5 h-5 transform rotate-90" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009.207 16H12a1 1 0 00.925-1.378l-2.031-4.062a1 1 0 01.34-1.42l4.062-2.031a1 1 0 00.22-1.716l-7-3.5z" />
                        </svg>
                    )}
                </button>
                {/* Search progress bar */}
                {isLoading && (
                    <div className="absolute bottom-0 left-0 h-0.5 bg-amber-500 animate-[shimmer_1.5s_infinite]" style={{ width: '100%' }}></div>
                )}
            </form>

            <div className="flex-1 bg-black/40 backdrop-blur-md rounded-lg border border-slate-800 p-6 flex flex-col overflow-y-auto relative shadow-2xl">
                {isLoading && (
                    <div className="m-auto text-center space-y-6">
                        <div className="relative inline-block">
                             <div className="w-16 h-16 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin"></div>
                             <BookOpenIcon className="w-6 h-6 text-amber-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs text-amber-500 font-bold animate-pulse uppercase tracking-[0.2em]">{synthesisStep}</p>
                            <p className="text-[10px] text-slate-600">QUERYING ARCHANGEL_CODEX_V204...</p>
                        </div>
                    </div>
                )}
                
                {error && (
                    <div className="m-auto text-center p-6 border border-red-500/30 bg-red-950/10 rounded-lg max-w-sm">
                        <p className="text-red-400 text-xs uppercase font-bold mb-2">Retrieval Failed</p>
                        <p className="text-[10px] text-red-300 font-sans italic">{error}</p>
                    </div>
                )}

                {!isLoading && !error && !result && (
                    <div className="m-auto text-center opacity-30 group">
                        <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-800 group-hover:border-amber-500/50 transition-colors">
                            <ShieldCheckIcon className="w-10 h-10 text-slate-700 group-hover:text-amber-500 transition-colors" />
                        </div>
                        <p className="text-[10px] text-slate-500 font-mono tracking-[0.5em] uppercase">Matrix Awaiting Input</p>
                    </div>
                )}

                {result && (
                    <div className="space-y-8 animate-fade-in-fast">
                        {/* Answer Section */}
                        <div className="relative">
                            <div className="absolute -left-6 top-0 bottom-0 w-1 bg-amber-500 shadow-[0_0_10px_amber]"></div>
                            <div className="flex justify-between items-center mb-4">
                                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-widest flex items-center gap-2">
                                    // SYNTHESIZED_RESPONSE
                                </h4>
                                <span className="text-[8px] text-slate-600 font-mono">HASH: {Math.random().toString(36).substring(7).toUpperCase()}</span>
                            </div>
                            <div className="text-sm text-slate-200 leading-relaxed font-sans bg-white/5 p-5 rounded border border-white/5 shadow-inner selection:bg-amber-500/30">
                                <p className="whitespace-pre-wrap">{result.text}</p>
                            </div>
                        </div>

                        {/* Sources Section */}
                        <div>
                             <div className="flex items-center gap-2 mb-4">
                                 <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Grounded_Sources</h4>
                                 <div className="flex-1 h-px bg-slate-800"></div>
                             </div>
                             <div className="grid grid-cols-1 gap-3">
                                {result.sources.map((source, index) => (
                                     <details key={index} className="bg-black/40 border border-slate-800 rounded-md group transition-all hover:border-slate-600">
                                        <summary className="px-4 py-3 text-[10px] font-mono text-slate-400 cursor-pointer flex justify-between items-center hover:text-amber-300">
                                            <span className="flex items-center gap-2">
                                                <span className="w-4 h-4 rounded-full border border-slate-700 flex items-center justify-center text-[8px] font-bold group-hover:border-amber-500 group-hover:text-amber-500">
                                                    {index + 1}
                                                </span>
                                                PROTOCOL_LOG_CHUNK_{index.toString().padStart(2, '0')}
                                            </span>
                                            <span className="text-[8px] opacity-0 group-hover:opacity-100 transition-opacity uppercase">Inspect Fragment</span>
                                        </summary>
                                        <div className="p-4 border-t border-slate-800 text-[11px] text-slate-400 font-sans leading-relaxed italic bg-white/[0.02]">
                                            "{source}"
                                        </div>
                                     </details>
                                ))}
                             </div>
                        </div>
                        
                        <div className="pt-6 border-t border-slate-800 flex justify-between items-center">
                            <div className="flex gap-4 text-[8px] font-mono text-slate-700">
                                <span>VERIFIER: UPB-1_OMEGA</span>
                                <span>CAUSAL_DRIFT: 0.00000ns</span>
                            </div>
                            <button 
                                onClick={() => { setQuery(""); setResult(null); }}
                                className="text-[9px] text-amber-900 hover:text-amber-500 transition-colors uppercase font-bold"
                            >
                                Clear_Buffer
                            </button>
                        </div>
                    </div>
                )}
            </div>
            
            {/* Ambient Background Glow for RAG Matrix */}
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-amber-500/5 blur-[120px] rounded-full pointer-events-none"></div>
        </div>
    );
};
