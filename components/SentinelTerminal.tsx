
import React, { useEffect, useRef, useMemo, useState } from 'react';
import { Message } from '../types';
import Loader from './Loader';
import { BrainCircuitIcon } from './icons/BrainCircuitIcon';
import { RefreshIcon } from './icons/RefreshIcon';
import ReactMarkdown, { Components } from 'react-markdown'; 

interface SentinelTerminalProps {
    id: string; 
    messages: Message[];
    input: string;
    setInput: (value: string) => void;
    isLoading: boolean;
    error: string | null;
    handleSendMessage: (e: React.FormEvent) => void;
    handleTroubleshoot: (errorMessage: string) => void;
    suggestions: string[];
    onAddAllSuggestions: () => void;
}

const SentinelTerminal: React.FC<SentinelTerminalProps> = ({
    id, 
    messages,
    input,
    setInput,
    isLoading,
    error,
    handleSendMessage,
    handleTroubleshoot,
    suggestions,
    onAddAllSuggestions
}) => {
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [currentSuggestions, setCurrentSuggestions] = useState<string[]>([]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const rotateSuggestions = () => {
        if (!suggestions || suggestions.length === 0) return;
        const shuffled = [...suggestions].sort(() => 0.5 - Math.random());
        setCurrentSuggestions(shuffled.slice(0, 10));
    };

    useEffect(() => {
        if (currentSuggestions.length === 0 && suggestions.length > 0) {
            rotateSuggestions();
        }
    }, [suggestions]);

    const markdownComponents: Components = useMemo(() => ({
        pre: ({node, ...props}) => <pre className="bg-black/50 backdrop-blur-sm rounded-md p-4 my-2 overflow-x-auto border border-slate-700" {...props} />,
        code: ({ inline, className, children, ...props }: any) => {
            return (
                <code className="font-mono text-sm text-amber-300" {...props}>
                    {children}
                </code>
            );
        },
        p: ({node, ...props}) => <p className="whitespace-pre-wrap" {...props} />, 
        li: ({node, ...props}) => <li className="ml-4" {...props} />,
        h1: ({node, ...props}) => <h1 className="text-2xl font-bold text-slate-50 mt-4 mb-2" {...props} />,
        h2: ({node, ...props}) => <h2 className="text-xl font-semibold text-slate-100 mt-3 mb-1" {...props} />,
        h3: ({node, ...props}) => <h3 className="text-lg font-medium text-slate-200 mt-2 mb-1" {...props} />,
        strong: ({node, ...props}) => <strong className="text-white" {...props} />,
        em: ({node, ...props}) => <em className="italic" {...props} />,
    }), []);

    const renderMessageContent = (msg: Message) => {
        const processedContent = msg.content;
        const validSources = Array.isArray(msg.sources) && msg.sources.length > 0;

        return (
            <>
                <div className="prose prose-sm prose-invert max-w-none text-slate-300">
                    <ReactMarkdown components={markdownComponents}>
                        {processedContent}
                    </ReactMarkdown>
                </div>
                {validSources && (
                    <div className="mt-3 pt-2 border-t border-slate-600">
                        <p className="text-xs font-bold text-slate-400 mb-1">Sources:</p>
                        <ul className="list-disc list-inside text-xs space-y-1">
                            {msg.sources!.map((chunk, i) => (
                                (chunk.web?.uri || chunk.maps?.uri) &&
                                <li key={i}>
                                    <a id={`source-${i + 1}`} href={chunk.web?.uri || chunk.maps?.uri} target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:underline">
                                        [{i + 1}] {chunk.web?.title || chunk.maps?.title || chunk.web?.uri || chunk.maps?.uri || 'Source'}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </>
        );
    };

    return (
        <div id={id} className="bg-black/30 backdrop-blur-sm border border-slate-800 rounded-b-lg rounded-tr-lg shadow-lg flex flex-col h-full glow-border flex-1">
            <div className="p-4 border-b border-slate-800">
                <h2 className="text-sm font-bold text-amber-400 font-mono">// SENTINEL-A TERMINAL</h2>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-6 font-mono text-sm">
                 {messages.map((msg, index) => (
                    <div key={index} className="flex flex-col items-start relative">
                         <div className={`rounded-lg p-4 max-w-2xl w-full ${msg.author === 'user' ? 'bg-amber-900/50 backdrop-blur-sm text-slate-200 self-end' : 'bg-black/50 backdrop-blur-sm text-slate-300'}`}>
                            {msg.author === 'sentinel' ? <div className="text-xs font-bold text-amber-400 mb-2">// SENTINEL-A</div> : <div className="text-xs font-bold text-slate-400 mb-2">// OPERATOR</div>}
                            {renderMessageContent(msg)}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
                 {isLoading && messages.length > 0 && (
                     <div className="flex items-start space-x-3 p-4">
                        <div className="text-xs font-bold text-amber-400 mt-1 self-center">// SENTINEL-A</div>
                        <Loader />
                     </div>
                )}
            </div>
             {error && (
                <div className="p-4">
                    <div className="bg-red-900/50 backdrop-blur-sm border border-red-700 text-red-300 px-4 py-3 rounded-md font-sans">
                        <div className="flex justify-between items-start gap-4">
                            <div>
                                <p className="font-bold">Error</p>
                                <p className="text-sm">{error}</p>
                            </div>
                            <button
                                onClick={() => handleTroubleshoot(error)}
                                className="inline-flex items-center space-x-1.5 ml-4 px-2 py-1 text-xs font-medium rounded-md bg-red-800 hover:bg-red-700 text-red-200 transition-colors flex-shrink-0"
                            >
                                <BrainCircuitIcon className="w-4 h-4" />
                                <span>Forensic Scan</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
             {!isLoading && (
                 <div className="px-4 pb-2 animate-fade-in-fast">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                            <div className="text-xs font-mono text-slate-500">// PRIME_DIRECTIVES</div>
                            <button 
                                onClick={rotateSuggestions}
                                className="text-slate-500 hover:text-amber-400 transition-colors p-1"
                            >
                                <RefreshIcon className="w-3 h-3" />
                            </button>
                        </div>
                        <button
                            onClick={onAddAllSuggestions}
                            className="bg-black/50 backdrop-blur-sm border border-amber-900/50 hover:border-amber-400 text-amber-500 text-[10px] font-mono px-3 py-1 rounded-md transition-all animate-pulse"
                        >
                            [EXECUTE_ALL_PRIME_DIRECTIVES]
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {currentSuggestions.map((suggestion, idx) => (
                            <button
                                key={`${suggestion}-${idx}`}
                                onClick={() => setInput(suggestion)}
                                className="bg-black/50 border border-white/5 hover:border-amber-900/50 text-slate-400 hover:text-amber-300 text-[10px] font-mono px-2 py-1 rounded transition-colors text-left"
                            >
                                {suggestion}
                            </button>
                        ))}
                    </div>
                </div>
            )}
            <div className="p-4 border-t border-slate-800">
                <form onSubmit={handleSendMessage} className="relative">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="// Awaiting mission parameters..."
                        disabled={isLoading}
                        className="w-full bg-black/50 backdrop-blur-sm border border-slate-700 rounded-lg pl-4 pr-12 py-3 font-mono text-sm text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition disabled:opacity-50"
                    />
                     <button type="submit" disabled={isLoading} className="absolute inset-y-0 right-0 flex items-center pr-3">
                        <svg className={`w-6 h-6 transform rotate-90 ${isLoading ? 'text-slate-600' : 'text-amber-500 hover:text-amber-400'}`} fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009.207 16H12a1 1 0 00.925-1.378l-2.031-4.062a1 1 0 01.34-1.42l4.062-2.031a1 1 0 00.22-1.716l-7-3.5z"></path>
                        </svg>
                    </button>
                </form>
            </div>
        </div>
    );
};

export default SentinelTerminal;
