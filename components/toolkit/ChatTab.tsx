
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Geolocation, ChatMessage } from '../../types';
import { getGroundedResponse } from '../../services/geminiService';
import Loader from '../Loader';
import { SearchIcon } from '../icons/SearchIcon';
import { MapPinIcon } from '../icons/MapPinIcon';
import { BrainCircuitIcon } from '../icons/BrainCircuitIcon';
import { GenerateContentResponse } from '@google/genai';
import { useAppContext } from '../../contexts/AppContext';
import ReactMarkdown, { Components } from 'react-markdown'; 

const ChatTab: React.FC = () => {
    const { addLog, aiToolkitState, setAiToolkitState } = useAppContext();
    const { chatSettings } = aiToolkitState;
    
    // Local state for non-persisted items
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Helpers to update context state
    const toggleSetting = (key: keyof typeof chatSettings) => {
        setAiToolkitState(prev => ({
            ...prev,
            chatSettings: {
                ...prev.chatSettings,
                [key]: !prev.chatSettings[key]
            }
        }));
    };

    const [location, setLocation] = useState<Geolocation | null>(null);
    const [locationError, setLocationError] = useState<string | null>(null);

    useEffect(() => {
        if (chatSettings.useMaps && !location) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLocation({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                    });
                    setLocationError(null);
                    addLog('SYSTEM', `Geolocation acquired for Maps Grounding.`);
                },
                (err) => {
                    const errorMessage = `Could not get location: ${err.message}. Maps Grounding will be less effective.`;
                    setLocationError(errorMessage);
                    // Disable maps if location fails
                    setAiToolkitState(prev => ({
                        ...prev,
                        chatSettings: { ...prev.chatSettings, useMaps: false }
                    }));
                    addLog('ERROR', `Geolocation failed: ${err.message}`);
                }
            );
        }
    }, [chatSettings.useMaps, location, addLog, setAiToolkitState]);

    const handleSendMessage = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: ChatMessage = { author: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        addLog('AI_TOOLKIT', `Chat query submitted: "${input}"`);
        setInput('');
        setIsLoading(true);
        setError(null);

        try {
            const response: GenerateContentResponse = await getGroundedResponse(
                input, 
                chatSettings.useSearch, 
                chatSettings.useMaps, 
                chatSettings.useThinking, 
                location
            );
            const geminiMessage: ChatMessage = { 
                author: 'gemini', 
                content: response.text || "",
                sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || [],
            };
            setMessages(prev => [...prev, geminiMessage]);
            addLog('AI_TOOLKIT', 'Chat response received.');
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
            setError(errorMessage);
            addLog('ERROR', `Chat Error: ${errorMessage}`);
        } finally {
            setIsLoading(false);
        }
    }, [input, isLoading, chatSettings, location, addLog]);
    
    const Toggle: React.FC<{ enabled: boolean; onToggle: () => void; label: string; icon: React.ReactNode }> = ({ enabled, onToggle, label, icon }) => (
        <div className="flex items-center space-x-2">
            <button
                type="button"
                role="switch"
                aria-checked={enabled}
                onClick={onToggle}
                className={`alien-switch ${enabled ? 'active' : ''}`}
            >
                <div className="alien-switch-thumb"></div>
            </button>
            <div className={`flex items-center space-x-1.5 text-xs font-mono uppercase tracking-wider ${enabled ? 'text-cyan-300' : 'text-slate-500'}`}>
                {icon}
                <span>{label}</span>
            </div>
        </div>
    );

    const markdownComponents: Components = useMemo(() => ({
        pre: ({node, ...props}) => <pre className="bg-black/50 backdrop-blur-sm rounded-md p-3 my-2 overflow-x-auto border border-slate-700" {...props} />,
        code: ({ inline, className, children, ...props }: any) => {
            const match = /language-(\w+)/.exec(className || '');
            return !inline && match ? (
                <code className="font-mono text-sm text-amber-300" {...props}>
                    {children}
                </code>
            ) : (
                <code className="font-mono text-sm text-amber-300" {...props}>
                    {children}
                </code>
            );
        },
        p: ({node, ...props}) => <div className="whitespace-pre-wrap" {...props} />,
        li: ({node, ...props}) => <li className="ml-4" {...props} />,
        h1: ({node, ...props}) => <h1 className="text-2xl font-bold text-slate-50 mt-4 mb-2" {...props} />,
        h2: ({node, ...props}) => <h2 className="text-xl font-semibold text-slate-100 mt-3 mb-1" {...props} />,
        h3: ({node, ...props}) => <h3 className="text-lg font-medium text-slate-200 mt-2 mb-1" {...props} />,
        strong: ({node, ...props}) => <strong className="text-white" {...props} />,
        em: ({node, ...props}) => <em className="italic" {...props} />,
    }), []);

    const renderMessageContent = (msg: ChatMessage) => {
        const validSources = Array.isArray(msg.sources) && msg.sources.length > 0;

        return (
            <>
                <div className="prose prose-sm prose-invert max-w-none text-slate-300">
                    <ReactMarkdown components={markdownComponents}>
                        {msg.content}
                    </ReactMarkdown>
                </div>
                {validSources && (
                    <div className="mt-4 pt-3 border-t border-slate-700/50 bg-black/20 -mx-4 px-4 pb-2 rounded-b-lg">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></span>
                            Verified Sources
                        </p>
                        <ul className="space-y-1.5">
                            {msg.sources!.map((chunk, i) => {
                                const uri = chunk.web?.uri || chunk.maps?.uri;
                                const title = chunk.web?.title || chunk.maps?.title || 'Source';
                                
                                if (!uri) return null;

                                return (
                                    <li key={i} className="flex items-start space-x-2 text-xs group">
                                        <span className="text-slate-600 font-mono mt-0.5">[{i + 1}]</span>
                                        <a 
                                            href={uri} 
                                            target="_blank" 
                                            rel="noopener noreferrer" 
                                            className="text-amber-400 hover:text-amber-300 hover:underline transition-colors break-all"
                                            title={title}
                                        >
                                            {title}
                                        </a>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                )}
            </>
        );
    };

    return (
        <div className="h-full flex flex-col">
            <h3 className="text-lg font-bold text-slate-200 mb-1">Chat Studio</h3>
            <p className="text-sm text-slate-400 mb-4">Converse with Gemini. Enhance responses with real-time information and advanced reasoning.</p>
            
            <div className="flex items-center space-x-6 mb-4 p-3 bg-black/60 border border-slate-800 rounded-lg">
                <Toggle enabled={chatSettings.useSearch} onToggle={() => toggleSetting('useSearch')} label="Search Grounding" icon={<SearchIcon className="w-3 h-3" />} />
                <Toggle enabled={chatSettings.useMaps} onToggle={() => toggleSetting('useMaps')} label="Maps Grounding" icon={<MapPinIcon className="w-3 h-3" />} />
                <Toggle enabled={chatSettings.useThinking} onToggle={() => toggleSetting('useThinking')} label="Thinking Mode" icon={<BrainCircuitIcon className="w-3 h-3" />} />
            </div>

            {locationError && <p className="text-xs text-red-400 mb-4">{locationError}</p>}
            
            <div className="flex-1 overflow-y-auto p-4 bg-black/40 backdrop-blur-sm rounded-lg border border-slate-800 space-y-4 custom-scrollbar">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex flex-col ${msg.author === 'user' ? 'items-end' : 'items-start'}`}>
                        <div className={`rounded-lg px-4 py-2 max-w-xl border ${msg.author === 'user' ? 'bg-amber-950/40 border-amber-900 text-amber-100' : 'bg-slate-900/60 border-slate-800 text-slate-300'}`}>
                           {renderMessageContent(msg)}
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-slate-900/60 border border-slate-800 rounded-lg px-4 py-2 flex items-center space-x-2">
                           <Loader />
                           <span className="text-sm text-slate-300 font-mono">Thinking...</span>
                        </div>
                    </div>
                )}
                 {error && (
                    <div className="bg-red-950 border border-red-900 text-red-300 px-4 py-3 rounded-md">
                        <p className="font-bold">An error occurred: <span className="font-normal">{error}</span></p>
                    </div>
                )}
            </div>

            <form onSubmit={handleSendMessage} className="mt-4 relative group">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask Gemini anything..."
                    disabled={isLoading}
                    className="w-full bg-black/80 border border-slate-700 rounded-lg pl-4 pr-12 py-3 text-sm text-slate-200 placeholder-slate-500 focus:ring-1 focus:ring-amber-500 focus:border-amber-500 transition disabled:opacity-50"
                />
                 <button type="submit" disabled={isLoading} className="absolute inset-y-0 right-0 flex items-center pr-3" aria-label="Send message">
                    <svg className={`w-6 h-6 transform rotate-90 ${isLoading ? 'text-slate-600' : 'text-amber-500 hover:text-amber-400'}`} fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009.207 16H12a1 1 0 00.925-1.378l-2.031-4.062a1 1 0 01.34-1.42l4.062-2.031a1 1 0 00.22-1.716l-7-3.5z"></path>
                    </svg>
                </button>
            </form>
        </div>
    );
};

export default ChatTab;
