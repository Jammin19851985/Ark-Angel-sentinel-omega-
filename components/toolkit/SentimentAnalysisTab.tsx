
import React, { useState, useCallback } from 'react';
import { SentimentResult } from '../../types';
import { analyzeSentiment } from '../../services/geminiService';
import Loader from '../Loader';
import { SparklesIcon } from '../icons/SparklesIcon';
import { useAppContext } from '../../contexts/AppContext';

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


const SentimentAnalysisTab: React.FC = () => {
    const { addLog } = useAppContext();
    const [query, setQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<SentimentResult | null>(null);

    const handleSubmit = useCallback(async () => {
        if (!query.trim() || isLoading) return;

        setIsLoading(true);
        setError(null);
        setResult(null);
        addLog('AI_TOOLKIT', `Sentiment analysis started for: "${query}"`);

        try {
            const sentimentData = await analyzeSentiment(query);
            setResult(sentimentData);
            addLog('AI_TOOLKIT', 'Sentiment analysis successful.');
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
            setError(errorMessage);
            addLog('ERROR', `Sentiment Analysis Error: ${errorMessage}`);
        } finally {
            setIsLoading(false);
        }
    }, [query, isLoading, addLog]);

    return (
        <div className="h-full flex flex-col">
            <h3 className="text-lg font-bold text-slate-200 mb-1">Sentiment Analysis</h3>
            <p className="text-sm text-slate-400 mb-4">Analyze market sentiment using v17.0 Search Grounding.</p>

            <div className="flex flex-col space-y-4">
                <div className="flex space-x-2">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="e.g., 'BTC outlook' or 'NVDA news'"
                        disabled={isLoading}
                        className="flex-grow bg-black/50 backdrop-blur-sm border border-slate-700 rounded-lg px-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition disabled:opacity-50"
                    />
                    <button
                        onClick={handleSubmit}
                        disabled={isLoading || !query.trim()}
                        className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-amber-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors group"
                    >
                        {isLoading ? 'Analyzing...' : 'Analyze'}
                    </button>
                </div>

                <div className="flex-1 bg-black/30 backdrop-blur-sm rounded-lg border border-slate-800 p-4 min-h-[300px] flex flex-col justify-center overflow-y-auto">
                    {isLoading && (
                        <div className="text-center">
                            <Loader />
                            <p className="mt-2 text-slate-400">Analyzing v17.0 real-time streams...</p>
                        </div>
                    )}
                    {error && <p className="text-red-400 text-sm text-center">{error}</p>}
                    {!isLoading && !error && !result && (
                        <p className="text-slate-500 text-sm text-center">Sentiment results will appear here.</p>
                    )}
                    {result && (
                        <div className="space-y-4 animate-fade-in">
                            <div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="font-bold">Overall Sentiment</span>
                                    <span className={`px-2 py-0.5 rounded-full font-medium ${
                                        result.overall_sentiment > 0.1 ? 'bg-green-900 text-green-300' :
                                        result.overall_sentiment < -0.1 ? 'bg-red-900 text-red-300' :
                                        'bg-slate-700 text-slate-300'
                                    }`}>
                                        {result.sentiment_label}
                                    </span>
                                </div>
                                <SentimentGauge score={result.overall_sentiment} />
                            </div>
                            <div>
                                <h4 className="text-xs font-bold text-slate-400 mb-1">Summary</h4>
                                <p className="text-sm text-slate-300 whitespace-pre-wrap">{result.summary}</p>
                            </div>
                            {result.sources && result.sources.length > 0 && (
                                <div className="mt-4 pt-4 border-t border-slate-700">
                                    <h4 className="text-xs font-bold text-slate-400 mb-2">Grounded Sources:</h4>
                                    <ul className="space-y-1">
                                        {result.sources.map((source, index) => (
                                            <li key={index} className="truncate">
                                                <a href={source} target="_blank" rel="noopener noreferrer" className="text-xs text-amber-400 hover:underline">
                                                    [{index + 1}] {source}
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SentimentAnalysisTab;
