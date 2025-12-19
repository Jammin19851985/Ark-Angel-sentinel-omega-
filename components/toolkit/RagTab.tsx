
import React, { useState, useCallback } from 'react';
import { RagQueryResult } from '../../types';
import { queryRagStore } from '../../services/geminiService';
import Loader from '../Loader';
import { BookOpenIcon } from '../icons/BookOpenIcon'; 
import { useAppContext } from '../../contexts/AppContext';

export const RagTab: React.FC = () => {
    const { addLog } = useAppContext();
    const [query, setQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
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
            const ragData = await queryRagStore(query);
            setResult(ragData);
            addLog('AI_TOOLKIT', 'Intel RAG response received.');
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
            setError(errorMessage);
            addLog('ERROR', `Intel RAG Error: ${errorMessage}`);
        } finally {
            setIsLoading(false);
        }
    }, [query, isLoading, addLog]);

    return (
        <div className="h-full flex flex-col">
            <h3 className="text-lg font-bold text-slate-200 mb-1">Intel RAG</h3>
            <p className="text-sm text-slate-400 mb-4">Query the ingested knowledge base on the Archangel Project's System Instructions for Sentinel-A.</p>

            <form onSubmit={handleSubmit} className="mb-4">
                <div className="relative">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="e.g., 'What is the primary mission?' or 'Describe the startup protocol.'"
                        disabled={isLoading}
                        className="w-full bg-black/50 backdrop-blur-sm border border-slate-700 rounded-lg pl-4 pr-12 py-3 text-sm text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition disabled:opacity-50"
                    />
                     <button type="submit" disabled={isLoading || !query.trim()} className="absolute inset-y-0 right-0 flex items-center pr-3" aria-label="Send query">
                        <svg className={`w-6 h-6 transform rotate-90 ${isLoading || !query.trim() ? 'text-slate-600' : 'text-amber-500 hover:text-amber-400'}`} fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009.207 16H12a1 1 0 00.925-1.378l-2.031-4.062a1 1 0 01.34-1.42l4.062-2.031a1 1 0 00.22-1.716l-7-3.5z"></path>
                        </svg>
                    </button>
                </div>
            </form>

            <div className="flex-1 bg-black/30 backdrop-blur-sm rounded-lg border border-slate-800 p-4 min-h-[300px] flex flex-col overflow-y-auto">
                {isLoading && (
                    <div className="m-auto text-center">
                        <Loader />
                        <p className="mt-2 text-slate-400">Retrieving and generating answer...</p>
                    </div>
                )}
                {error && <p className="m-auto text-red-400 text-sm text-center">{error}</p>}
                {!isLoading && !error && !result && (
                    <div className="m-auto text-center">
                        <BookOpenIcon className="w-10 h-10 mx-auto text-slate-600" />
                        <p className="mt-2 text-slate-500 text-sm">
                            Ask a question to query the knowledge base.
                        </p>
                    </div>
                )}
                {result && (
                    <div className="space-y-6 animate-fade-in">
                        {/* Answer Section */}
                        <div>
                            <h4 className="text-base font-semibold text-amber-400 mb-2">Answer</h4>
                            <div className="text-sm text-slate-300 bg-black/50 backdrop-blur-sm p-3 rounded-md prose prose-sm prose-invert max-w-none">
                                <p className="whitespace-pre-wrap">{result.text}</p>
                            </div>
                        </div>

                        {/* Sources Section */}
                        <div>
                             <h4 className="text-base font-semibold text-amber-300 mb-2">Sources</h4>
                             <div className="space-y-2">
                                {result.sources.map((source, index) => (
                                     <details key={index} className="bg-black/50 backdrop-blur-sm rounded-lg">
                                        <summary className="px-3 py-2 text-xs font-mono text-slate-400 cursor-pointer">
                                            Source Chunk {index + 1}
                                        </summary>
                                        <div className="p-3 border-t border-slate-700 text-xs text-slate-400">
                                            {source}
                                        </div>
                                     </details>
                                ))}
                             </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
