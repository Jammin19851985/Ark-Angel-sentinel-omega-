
import React, { useEffect, useRef, useMemo, useState, useCallback } from 'react';
import { Message, Trade } from '../types';
import Loader from './Loader';
import { BrainCircuitIcon } from './icons/BrainCircuitIcon';
import { RefreshIcon } from './icons/RefreshIcon';
import { TerminalIcon } from './icons/TerminalIcon';
import { ShieldIcon } from './icons/ShieldIcon';
import { PlayCircleIcon } from './icons/PlayCircleIcon';
import { DownloadIcon } from './icons/DownloadIcon';
import { CrosshairIcon } from './icons/CrosshairIcon';
import { SearchIcon } from './icons/SearchIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { ActivityIcon } from './icons/ActivityIcon';
import { ChartBarIcon } from './icons/ChartBarIcon';
import { ArrowUpIcon } from './icons/ArrowUpIcon';
import { ArrowDownIcon } from './icons/ArrowDownIcon';
import { CopyIcon } from './icons/CopyIcon';
import ReactMarkdown, { Components } from 'react-markdown'; 
import { useAppContext } from '../contexts/AppContext';

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

const CodeBlock = ({ inline, className, children, ...props }: any) => {
    const match = /language-(\w+)/.exec(className || '');
    const lang = match ? match[1] : 'text';
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        if (!children) return;
        try {
            await navigator.clipboard.writeText(String(children).replace(/\n$/, ''));
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy code block:', err);
        }
    };
    
    if (inline) {
        return <code className="bg-amber-900/30 text-amber-300 px-1.5 py-0.5 rounded text-xs font-mono border border-amber-500/20" {...props}>{children}</code>;
    }
  
    return (
        <div className="my-4 rounded-lg overflow-hidden border border-slate-700 bg-[#0d1117] shadow-2xl relative group transition-all hover:border-slate-600">
            {/* Terminal Header */}
            <div className="flex items-center justify-between px-4 py-2 bg-slate-800 border-b border-slate-700">
                <div className="flex items-center gap-3">
                    <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_5px_rgba(239,68,68,0.8)]" />
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_5px_rgba(245,158,11,0.8)]" />
                        <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.8)]" />
                    </div>
                    <span className="text-[10px] uppercase font-mono text-slate-400 tracking-wider flex items-center gap-2 border-l border-slate-600 pl-3 ml-1">
                        <TerminalIcon className="w-3 h-3" />
                        {lang}
                    </span>
                </div>
                <button 
                    onClick={handleCopy}
                    className={`text-[9px] font-bold tracking-widest uppercase transition-all flex items-center gap-1.5 px-2 py-1 rounded border ${
                        copied 
                        ? 'text-green-400 border-green-500/30 bg-green-900/20' 
                        : 'text-slate-500 border-slate-700 bg-slate-800/50 hover:text-amber-400 hover:border-amber-500/50 hover:bg-slate-800'
                    }`}
                    title="Copy to Clipboard"
                >
                    {copied ? (
                        <>
                            <CheckCircleIcon className="w-3 h-3" />
                            <span>COPIED</span>
                        </>
                    ) : (
                        <>
                            <CopyIcon className="w-3 h-3" />
                            <span>COPY</span>
                        </>
                    )}
                </button>
            </div>
            {/* Code Content */}
            <pre className="p-4 overflow-x-auto text-xs sm:text-sm font-mono text-slate-300 leading-relaxed custom-scrollbar selection:bg-amber-500/30">
                <code className={className} {...props}>
                    {children}
                </code>
            </pre>
        </div>
    );
};

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
    const { 
        executeOperation, 
        installProtocol, 
        runSystem, 
        killSwitchActive,
        addLog,
        systemStatus,
        quantumMetrics,
        coreState,
        marketData,
        trades
    } = useAppContext();

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [currentSuggestions, setCurrentSuggestions] = useState<string[]>([]);
    const [activeOp, setActiveOp] = useState<string | null>(null);

    // Command Palette State
    const [showPalette, setShowPalette] = useState(false);
    const [paletteSearch, setPaletteSearch] = useState('');
    const [paletteIndex, setPaletteIndex] = useState(0);
    const paletteInputRef = useRef<HTMLInputElement>(null);

    // Ghost Text & Autocomplete State
    const [ghostText, setGhostText] = useState<string>('');
    const [suggestionIndex, setSuggestionIndex] = useState(0);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages, isLoading]);

    const activeDirectivesList = useMemo(() => Object.keys(coreState.activeDirectives).filter(k => coreState.activeDirectives[k]), [coreState.activeDirectives]);

    const rotateSuggestions = useCallback(() => {
        if (!suggestions || suggestions.length === 0) return;
        const shuffled = [...suggestions].sort(() => 0.5 - Math.random());
        setCurrentSuggestions(shuffled.slice(0, 10));
    }, [suggestions]);

    useEffect(() => {
        if (suggestions.length > 0) {
            rotateSuggestions();
        }
    }, [suggestions, rotateSuggestions]);

    const handleSovereignOp = useCallback(async (op: 'EXECUTE' | 'INSTALL' | 'RUN') => {
        if (killSwitchActive) return;
        setActiveOp(op);
        
        try {
            if (op === 'EXECUTE') await executeOperation();
            if (op === 'INSTALL') await installProtocol();
            if (op === 'RUN') {
                await runSystem();
                const now = new Date().toLocaleTimeString();
                addLog('SENTINEL', `[${now}] SENTINEL ONLINE. MONITORING 4 EXCHANGES.`);
            }
        } finally {
            setActiveOp(null);
        }
    }, [executeOperation, installProtocol, runSystem, killSwitchActive, addLog]);

    // --- Command Palette Logic ---
    const commands = useMemo(() => {
        const cmds = [
            { id: 'op-exec', label: 'EXECUTE SOVEREIGN OP', category: 'SYSTEM', icon: <CrosshairIcon className="w-3 h-3 text-red-500" />, action: () => handleSovereignOp('EXECUTE') },
            { id: 'op-install', label: 'INSTALL PROTOCOL', category: 'SYSTEM', icon: <DownloadIcon className="w-3 h-3 text-cyan-500" />, action: () => handleSovereignOp('INSTALL') },
            { id: 'op-run', label: 'RUN SYSTEM', category: 'SYSTEM', icon: <PlayCircleIcon className="w-3 h-3 text-green-500" />, action: () => handleSovereignOp('RUN') },
            { id: 'cmd-clear', label: 'CLEAR INPUT BUFFER', category: 'TERMINAL', icon: <TerminalIcon className="w-3 h-3 text-slate-500" />, action: () => setInput('') },
            { id: 'cmd-all', label: 'EXECUTE ALL DIRECTIVES', category: 'MACRO', icon: <BrainCircuitIcon className="w-3 h-3 text-amber-500" />, action: onAddAllSuggestions },
        ];
        
        suggestions.forEach((s, i) => {
            cmds.push({
                id: `sugg-${i}`,
                label: s,
                category: 'SUGGESTION',
                icon: <SparklesIcon className="w-3 h-3 text-amber-300" />,
                action: () => setInput(s)
            });
        });
        
        return cmds;
    }, [suggestions, onAddAllSuggestions, setInput, handleSovereignOp]);

    const filteredCommands = useMemo(() => {
        if (!paletteSearch) return commands;
        const lower = paletteSearch.toLowerCase();
        return commands.filter(c => c.label.toLowerCase().includes(lower) || c.category.toLowerCase().includes(lower));
    }, [commands, paletteSearch]);

    const suggestionMatches = useMemo(() => {
        if (!input.trim()) return [];
        return suggestions.filter(s => s.toLowerCase().startsWith(input.toLowerCase()) && s.toLowerCase() !== input.toLowerCase());
    }, [input, suggestions]);

    // Update Ghost Text based on input and selection
    useEffect(() => {
        if (!input.trim()) {
            setGhostText('');
            return;
        }
        
        // If we have matches, use the selected one for ghost text if applicable
        if (suggestionMatches.length > 0) {
            const match = suggestionMatches[suggestionIndex] || suggestionMatches[0];
            if (match && match.toLowerCase().startsWith(input.toLowerCase())) {
                setGhostText(match);
            } else {
                setGhostText('');
            }
        } else {
            setGhostText('');
        }
    }, [input, suggestionMatches, suggestionIndex]);

    // Reset selection when input changes
    useEffect(() => {
        setSuggestionIndex(0);
    }, [input]);

    const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Tab') {
            e.preventDefault();
            if (ghostText) {
                setInput(ghostText);
                setGhostText('');
                setSuggestionIndex(0);
            }
        } else if (e.key === 'ArrowUp') {
            if (suggestionMatches.length > 0) {
                e.preventDefault();
                setSuggestionIndex(prev => (prev > 0 ? prev - 1 : suggestionMatches.length - 1));
            }
        } else if (e.key === 'ArrowDown') {
            if (suggestionMatches.length > 0) {
                e.preventDefault();
                setSuggestionIndex(prev => (prev < suggestionMatches.length - 1 ? prev + 1 : 0));
            }
        }
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                setShowPalette(prev => !prev);
                setPaletteSearch('');
                setPaletteIndex(0);
            }
            
            if (showPalette) {
                if (e.key === 'Escape') {
                    setShowPalette(false);
                } else if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    setPaletteIndex(prev => (prev + 1) % filteredCommands.length);
                } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    setPaletteIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length);
                } else if (e.key === 'Enter') {
                    e.preventDefault();
                    const cmd = filteredCommands[paletteIndex];
                    if (cmd) {
                        cmd.action();
                        setShowPalette(false);
                    }
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [showPalette, filteredCommands, paletteIndex]);

    useEffect(() => {
        if (showPalette && paletteInputRef.current) {
            paletteInputRef.current.focus();
        }
    }, [showPalette]);

    const markdownComponents: Components = useMemo(() => ({
        code: CodeBlock,
        pre: ({children}) => <>{children}</>, 
        p: ({node, ...props}) => <p className="mb-3 last:mb-0 leading-relaxed text-slate-300" {...props} />, 
        ul: ({node, ...props}) => <ul className="list-disc list-outside ml-4 mb-4 space-y-2 text-slate-300 marker:text-cyan-500" {...props} />,
        ol: ({node, ...props}) => <ol className="list-decimal list-outside ml-4 mb-4 space-y-2 text-slate-300 marker:text-amber-500" {...props} />,
        li: ({node, ...props}) => <li className="pl-1" {...props} />,
        h1: ({node, ...props}) => <h1 className="text-2xl font-bold text-amber-400 mt-6 mb-4 border-b border-amber-500/20 pb-2 uppercase tracking-widest font-display" {...props} />,
        h2: ({node, ...props}) => <h2 className="text-lg font-bold text-cyan-400 mt-5 mb-3 font-display uppercase tracking-wide flex items-center gap-2" {...props}><span className="w-1.5 h-4 bg-cyan-500 rounded-sm inline-block"></span>{props.children}</h2>,
        h3: ({node, ...props}) => <h3 className="text-base font-bold text-slate-200 mt-4 mb-2 font-mono uppercase tracking-tight" {...props} />,
        strong: ({node, ...props}) => <strong className="text-white font-extrabold" {...props} />,
        blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-amber-500/50 pl-4 py-2 my-4 bg-amber-900/10 italic text-slate-400 rounded-r" {...props} />,
        a: ({node, href, children, ...props}) => <a href={href} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300 hover:underline transition-colors break-all" {...props}>{children}</a>,
        hr: ({node, ...props}) => <hr className="border-slate-700/50 my-6" {...props} />,
        table: ({node, ...props}) => <div className="overflow-x-auto my-4 border border-slate-700 rounded"><table className="w-full text-left text-sm" {...props} /></div>,
        thead: ({node, ...props}) => <thead className="bg-slate-800 text-slate-200" {...props} />,
        tbody: ({node, ...props}) => <tbody className="divide-y divide-slate-700" {...props} />,
        tr: ({node, ...props}) => <tr className="hover:bg-slate-800/50 transition-colors" {...props} />,
        th: ({node, ...props}) => <th className="px-3 py-2 font-bold uppercase tracking-wider text-[10px]" {...props} />,
        td: ({node, ...props}) => <td className="px-3 py-2 text-slate-400" {...props} />,
    }), []);

    const renderMessageContent = (msg: Message) => {
        const validSources = Array.isArray(msg.sources) && msg.sources.length > 0;

        return (
            <div className="flex-1 min-w-0">
                <div className="prose prose-sm prose-invert max-w-none text-slate-300 font-sans">
                    <ReactMarkdown components={markdownComponents}>
                        {msg.content}
                    </ReactMarkdown>
                </div>
                {validSources && (
                    <div className="mt-4 pt-3 border-t border-slate-700/50">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse"></span>
                            Intel Fragments
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {msg.sources!.map((chunk, i) => {
                                const uri = chunk.web?.uri || chunk.maps?.uri;
                                const title = chunk.web?.title || chunk.maps?.title || 'Source';
                                if (!uri) return null;
                                return (
                                    <a 
                                        key={i}
                                        href={uri} 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        className="bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-cyan-500/50 rounded px-2 py-1 text-[10px] text-cyan-400/80 hover:text-cyan-300 transition-all truncate max-w-[200px]"
                                        title={title}
                                    >
                                        [{i + 1}] {title}
                                    </a>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    // Derived active command for display
    const activeCommandDisplay = useMemo(() => {
        if (activeOp) return `PROTOCOL_${activeOp}`;
        if (isLoading) {
             const lastUser = [...messages].reverse().find(m => m.author === 'user');
             if (lastUser) return `EXEC: ${lastUser.content.slice(0, 15).toUpperCase()}${lastUser.content.length > 15 ? '...' : ''}`;
             return 'PROCESSING_VECTOR...';
        }
        return 'AWAITING_INPUT';
    }, [activeOp, isLoading, messages]);

    const activeDirectivesCount = useMemo(() => Object.values(coreState.activeDirectives).filter(Boolean).length, [coreState.activeDirectives]);

    return (
        <div id={id} className="bg-black/60 backdrop-blur-md border border-slate-800 rounded-lg shadow-2xl flex flex-col h-full glow-border flex-1 overflow-hidden relative">
            {/* Command Palette Overlay */}
            {showPalette && (
                <div className="absolute inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col p-4 animate-fade-in-fast items-center justify-center">
                    <div className="w-full max-w-2xl bg-slate-900 border border-amber-500/50 rounded-xl shadow-[0_0_100px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col max-h-[80%] transform scale-100 transition-transform">
                        <div className="flex items-center px-4 py-4 border-b border-slate-700/50 bg-slate-800/50">
                            <SearchIcon className="w-5 h-5 text-amber-500 mr-3" />
                            <input 
                                ref={paletteInputRef}
                                type="text" 
                                value={paletteSearch}
                                onChange={(e) => {
                                    setPaletteSearch(e.target.value);
                                    setPaletteIndex(0);
                                }}
                                placeholder="Execute command..."
                                className="flex-1 bg-transparent border-none outline-none text-slate-200 font-mono text-base placeholder-slate-500"
                            />
                            <div className="flex gap-2">
                                <div className="text-[10px] text-slate-500 font-mono px-2 py-1 border border-slate-700 rounded bg-slate-900">ESC</div>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar bg-black/20">
                            {filteredCommands.length === 0 ? (
                                <div className="text-center py-12 text-slate-500 text-xs font-mono">NO COMMANDS FOUND</div>
                            ) : (
                                filteredCommands.map((cmd, idx) => (
                                    <button
                                        key={cmd.id}
                                        onClick={() => {
                                            cmd.action();
                                            setShowPalette(false);
                                        }}
                                        className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-left transition-all group ${idx === paletteIndex ? 'bg-amber-600 text-white shadow-lg' : 'hover:bg-white/5 text-slate-400'}`}
                                        onMouseEnter={() => setPaletteIndex(idx)}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`p-1.5 rounded-md ${idx === paletteIndex ? 'bg-white/20 text-white' : 'bg-slate-800 border border-slate-700 text-slate-400'}`}>
                                                {cmd.icon}
                                            </div>
                                            <span className={`text-sm font-mono font-bold tracking-tight ${idx === paletteIndex ? 'text-white' : 'text-slate-300'}`}>{cmd.label}</span>
                                        </div>
                                        <span className={`text-[9px] uppercase tracking-widest font-bold ${idx === paletteIndex ? 'text-amber-200' : 'text-slate-600'}`}>{cmd.category}</span>
                                    </button>
                                ))
                            )}
                        </div>
                        <div className="px-4 py-2 bg-slate-950 border-t border-slate-800 text-[10px] text-slate-500 flex justify-between font-mono items-center">
                            <span className="flex gap-4">
                                <span><strong className="text-slate-400">↑↓</strong> Navigate</span>
                                <span><strong className="text-slate-400">↵</strong> Select</span>
                            </span>
                            <span className="text-amber-500/50">ARCHANGEL COMMAND KERNEL</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="p-3 border-b border-slate-800 bg-slate-900 flex justify-between items-center z-10">
                <div className="flex items-center gap-2">
                    <TerminalIcon className="w-4 h-4 text-amber-500" />
                    <h2 className="text-xs font-bold text-slate-200 font-mono tracking-widest">// SENTINEL-A TERMINAL</h2>
                </div>
                <div className="flex items-center gap-4">
                    <div className="hidden md:flex items-center gap-2 text-[9px] text-slate-500 font-mono border border-slate-700 px-2 py-1 rounded bg-black hover:border-amber-500/50 transition-colors cursor-pointer" onClick={() => setShowPalette(true)}>
                        <span>CMD PALETTE</span>
                        <span className="text-slate-300 bg-slate-800 px-1 rounded">CTRL+K</span>
                    </div>
                    <div className="flex gap-2">
                        <button 
                            onClick={() => handleSovereignOp('EXECUTE')}
                            disabled={!!activeOp || killSwitchActive}
                            className={`flex items-center gap-1 p-1.5 rounded border transition-all ${activeOp === 'EXECUTE' ? 'bg-amber-600 text-white border-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.6)]' : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-amber-400 hover:border-amber-500/50'}`}
                            title="Execute Sovereign Op"
                        >
                            {activeOp === 'EXECUTE' ? <Loader /> : <CrosshairIcon className="w-3 h-3" />}
                            <span className="text-[9px] font-bold uppercase hidden sm:inline">Exec</span>
                        </button>
                        <button 
                            onClick={() => handleSovereignOp('INSTALL')}
                            disabled={!!activeOp || killSwitchActive}
                            className={`flex items-center gap-1 p-1.5 rounded border transition-all ${activeOp === 'INSTALL' ? 'bg-cyan-600 text-white border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.6)]' : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/50'}`}
                            title="Install Protocol"
                        >
                            {activeOp === 'INSTALL' ? <Loader /> : <DownloadIcon className="w-3 h-3" />}
                            <span className="text-[9px] font-bold uppercase hidden sm:inline">Install</span>
                        </button>
                        <button 
                            onClick={() => handleSovereignOp('RUN')}
                            disabled={!!activeOp || killSwitchActive}
                            className={`flex items-center gap-1 p-1.5 rounded border transition-all ${activeOp === 'RUN' ? 'bg-green-600 text-white border-green-400 shadow-[0_0_10px_rgba(34,197,94,0.6)]' : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-green-400 hover:border-green-500/50'}`}
                            title="Run System"
                        >
                            {activeOp === 'RUN' ? <Loader /> : <PlayCircleIcon className="w-3 h-3" />}
                            <span className="text-[9px] font-bold uppercase hidden sm:inline">Run</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Status Dashboard */}
            <div className="bg-slate-950 border-b border-slate-800 px-4 py-2 grid grid-cols-2 md:grid-cols-4 gap-4 text-[10px] font-mono shadow-inner">
                <div className="flex flex-col space-y-0.5">
                    <span className="text-slate-500 uppercase tracking-widest flex items-center gap-1">
                        <ActivityIcon className={`w-3 h-3 ${systemStatus === 'LIVE' ? 'text-green-500 animate-pulse' : 'opacity-50'}`} /> 
                        System Status
                    </span>
                    <span className={`font-bold text-xs ${systemStatus === 'LIVE' || systemStatus === 'OPERATIONAL' ? 'text-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.3)]' : systemStatus === 'RUNNING' ? 'text-amber-400 animate-pulse' : 'text-slate-400'}`}>
                        {systemStatus}
                    </span>
                </div>
                <div className="flex flex-col space-y-0.5 md:col-span-1">
                    <span className="text-slate-500 uppercase tracking-widest">Active Process</span>
                    <span className={`font-bold text-xs truncate ${isLoading || activeOp ? 'text-amber-400 animate-pulse' : 'text-slate-300'}`}>
                        {activeCommandDisplay}
                    </span>
                </div>
                <div className="flex flex-col space-y-0.5">
                    <span className="text-slate-500 uppercase tracking-widest">Directives</span>
                    <span className="text-cyan-400 font-bold text-xs">{activeDirectivesCount} ACTIVE</span>
                </div>
                <div className="flex flex-col space-y-0.5">
                    <span className="text-slate-500 uppercase tracking-widest">Coherence</span>
                    <span className="text-indigo-400 font-bold text-xs">{quantumMetrics.qubitCoherence.toFixed(1)}ns</span>
                </div>
            </div>

            {/* Main Content Area: Split View for Messages and Live Feed */}
            <div className="flex-1 flex overflow-hidden">
                {/* Messages Area */}
                <div className="flex-1 flex flex-col min-w-0 bg-transparent">
                    <div className="flex-1 overflow-y-auto p-4 space-y-6 font-mono text-sm relative custom-scrollbar">
                        {messages.map((msg, index) => {
                            const isUser = msg.author === 'user';
                            return (
                                <div key={index} className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                                    <div className={`flex gap-3 max-w-[95%] lg:max-w-[85%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                                        {/* Avatar */}
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-1 border shadow-lg ${isUser ? 'bg-amber-900 border-amber-500' : 'bg-cyan-900 border-cyan-500'}`}>
                                            {isUser ? <ShieldIcon className="w-4 h-4 text-amber-200" /> : <BrainCircuitIcon className="w-4 h-4 text-cyan-200" />}
                                        </div>
                                        
                                        {/* Bubble */}
                                        <div className={`relative p-4 rounded-lg border shadow-xl ${
                                            isUser 
                                            ? 'bg-amber-950 border-amber-800 text-slate-200 rounded-tr-none' 
                                            : 'bg-slate-900 border-slate-700 text-slate-300 rounded-tl-none shadow-[0_0_20px_rgba(0,0,0,0.5)]'
                                        }`}>
                                            {/* Sender Label */}
                                            <div className={`text-[9px] font-bold tracking-widest mb-2 uppercase border-b pb-1 ${isUser ? 'text-amber-500 text-right border-amber-500/20' : 'text-cyan-500 border-cyan-500/20'}`}>
                                                {isUser ? '// OPERATOR_COMMAND' : '// SENTINEL_CORE_RESPONSE'}
                                            </div>
                                            
                                            {renderMessageContent(msg)}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        
                        {isLoading && (
                            <div className="flex justify-start animate-pulse">
                                <div className="flex gap-3 max-w-[75%]">
                                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-1 border bg-slate-800 border-cyan-500/30">
                                        <BrainCircuitIcon className="w-4 h-4 text-cyan-400" />
                                    </div>
                                    <div className="bg-slate-900/50 border border-slate-800 p-3 rounded-lg rounded-tl-none flex items-center gap-2">
                                        <Loader />
                                        <span className="text-xs text-cyan-500 font-mono tracking-widest">THINKING...</span>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                </div>

                {/* Right Panel: Real-Time Market Data & Trade History (Visible on LG screens) */}
                <div className="w-72 bg-black border-l border-slate-800 hidden lg:flex flex-col">
                    {/* Agent Status Section */}
                    <div className="p-3 border-b border-slate-800 bg-slate-900 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <BrainCircuitIcon className={`w-4 h-4 ${systemStatus === 'LIVE' ? 'text-green-400' : 'text-slate-400'}`} />
                            <h3 className="text-xs font-bold text-slate-300 font-mono tracking-widest uppercase">Agent Uplink</h3>
                        </div>
                        <div className={`w-2 h-2 rounded-full ${systemStatus === 'LIVE' ? 'bg-green-500 shadow-[0_0_8px_#22c55e] animate-pulse' : 'bg-red-500'}`} />
                    </div>
                    
                    <div className="p-3 border-b border-slate-800 flex flex-col gap-2 bg-black">
                        <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 uppercase">
                            <span>Core State</span>
                            <span className={systemStatus === 'LIVE' ? 'text-green-400 font-bold' : 'text-slate-400'}>{systemStatus}</span>
                        </div>
                        
                        {/* Active Operation Indicator */}
                        {activeOp ? (
                            <div className="bg-amber-900 border border-amber-500 rounded p-2 flex items-center gap-2 animate-pulse">
                                <svg className="animate-spin h-3 w-3 text-amber-200" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span className="text-[10px] font-bold text-amber-100 font-mono tracking-wider">EXECUTING: {activeOp}</span>
                            </div>
                        ) : (
                            <div className="bg-slate-900 border border-slate-800 rounded p-2 text-center">
                                <span className="text-[10px] text-slate-600 font-mono tracking-wider">SYSTEM IDLE</span>
                            </div>
                        )}

                        {/* Active Directives List */}
                        {activeDirectivesList.length > 0 && (
                            <div className="space-y-1 mt-1 border-t border-slate-800/50 pt-2">
                                <div className="text-[9px] text-slate-500 font-mono uppercase tracking-widest mb-1">Active Protocols</div>
                                <div className="max-h-24 overflow-y-auto custom-scrollbar space-y-1">
                                    {activeDirectivesList.map((dir, i) => (
                                        <div key={i} className="flex items-center gap-1.5 text-[9px] font-mono text-cyan-400/80">
                                            <span className="w-1 h-1 bg-cyan-500 rounded-full"></span>
                                            <span className="truncate">{dir}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Market Data Header */}
                    <div className="p-3 border-b border-slate-800 bg-slate-900 flex items-center gap-2">
                        <ChartBarIcon className="w-4 h-4 text-amber-500" />
                        <h3 className="text-xs font-bold text-slate-300 font-mono tracking-widest uppercase">Live Market Data</h3>
                    </div>
                    {/* Market Data List */}
                    <div className="flex-1 overflow-y-auto p-2 space-y-2 border-b border-slate-800 custom-scrollbar bg-black">
                        {Object.entries(marketData).map(([symbol, data]) => {
                            const isUp = data.change >= 0;
                            return (
                                <div key={symbol} className="bg-slate-900 p-2 rounded border border-slate-800 flex justify-between items-center text-xs font-mono">
                                    <span className="text-slate-300 font-bold">{symbol}</span>
                                    <div className="text-right">
                                        <div className="text-white">${data.price.toFixed(2)}</div>
                                        <div className={`text-[10px] flex items-center justify-end ${isUp ? 'text-green-400' : 'text-red-400'}`}>
                                            {isUp ? <ArrowUpIcon className="w-3 h-3 mr-0.5" /> : <ArrowDownIcon className="w-3 h-3 mr-0.5" />}
                                            {Math.abs(data.change).toFixed(2)}%
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Recent Trades Header */}
                    <div className="p-3 border-b border-slate-800 bg-slate-900 flex items-center gap-2">
                        <ActivityIcon className="w-4 h-4 text-cyan-500" />
                        <h3 className="text-xs font-bold text-slate-300 font-mono tracking-widest uppercase">Trade History</h3>
                    </div>
                    {/* Recent Trades List */}
                    <div className="h-1/2 overflow-y-auto p-2 space-y-1 custom-scrollbar bg-black">
                        {trades.length === 0 ? (
                            <div className="text-center text-slate-600 text-[10px] mt-4 italic">NO_TRADES_RECORDED</div>
                        ) : (
                            trades.slice(0, 15).map((trade) => (
                                <div key={trade.id} className="flex justify-between items-center text-[10px] font-mono p-1.5 border-b border-slate-800 hover:bg-slate-900 rounded">
                                    <div className="flex items-center gap-2">
                                        <span className={`font-bold ${trade.action === 'BUY' ? 'text-green-500' : 'text-red-500'}`}>
                                            {trade.action}
                                        </span>
                                        <span className="text-slate-300">{trade.symbol}</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-slate-400 block">${trade.price.toFixed(2)}</span>
                                        <span className={`block ${trade.pnl > 0 ? 'text-green-400' : trade.pnl < 0 ? 'text-red-400' : 'text-slate-600'}`}>
                                            {trade.pnl !== 0 ? (trade.pnl > 0 ? '+' : '') + trade.pnl.toFixed(2) : '-'}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Error Display */}
             {error && (
                <div className="px-4 py-2 bg-red-950 border-t border-red-900 relative z-20">
                    <div className="flex justify-between items-center gap-4">
                        <div className="flex items-center gap-2 text-red-400">
                            <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping" />
                            <span className="text-xs font-bold font-mono">ERROR: {error}</span>
                        </div>
                        <button
                            onClick={() => handleTroubleshoot(error)}
                            className="px-3 py-1 text-[10px] font-bold rounded bg-red-900 hover:bg-red-800 text-red-200 border border-red-700 transition-colors uppercase tracking-wider"
                        >
                            Run Forensic Scan
                        </button>
                    </div>
                </div>
            )}

            {/* Input & Controls */}
            <div className="border-t border-slate-800 bg-black relative z-20">
                 {/* Suggestion Chips */}
                 {!isLoading && suggestionMatches.length === 0 && (
                     <div className="px-3 py-2 border-b border-slate-800 flex items-center gap-2 overflow-x-auto custom-scrollbar">
                        <div className="text-[10px] text-slate-500 font-mono whitespace-nowrap uppercase flex items-center gap-1">
                            <RefreshIcon className="w-3 h-3 cursor-pointer hover:text-amber-400" onClick={rotateSuggestions} />
                            SUGGESTIONS:
                        </div>
                        {currentSuggestions.map((suggestion, idx) => (
                            <button
                                key={`${suggestion}-${idx}`}
                                onClick={() => setInput(suggestion)}
                                className="flex-shrink-0 bg-slate-900 border border-cyan-900 text-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.4)] hover:shadow-[0_0_12px_rgba(6,182,212,0.6)] hover:border-cyan-400 hover:text-cyan-200 text-[10px] font-mono px-2 py-1 rounded transition-all"
                            >
                                {suggestion}
                            </button>
                        ))}
                    </div>
                )}
                
                <div className="p-3 relative">
                    {/* Auto-Suggestion Dropup List */}
                    {suggestionMatches.length > 0 && !isLoading && (
                        <div className="absolute bottom-full left-3 right-3 bg-slate-900 border border-slate-700 rounded-t-lg shadow-2xl overflow-hidden z-30 max-h-48 overflow-y-auto custom-scrollbar mb-0.5">
                            {suggestionMatches.map((match, idx) => (
                                <div 
                                    key={match}
                                    onClick={() => {
                                        setInput(match);
                                        setGhostText('');
                                    }}
                                    className={`px-4 py-2 text-xs font-mono cursor-pointer transition-colors flex justify-between items-center group ${idx === suggestionIndex ? 'bg-amber-900 text-amber-300 border-l-2 border-amber-500' : 'text-slate-400 hover:bg-slate-800 border-l-2 border-transparent'}`}
                                >
                                    <div className="flex items-center gap-2">
                                        <span className={`w-1 h-1 rounded-full ${idx === suggestionIndex ? 'bg-amber-500' : 'bg-slate-600'}`}></span>
                                        <span>
                                            <span className="text-slate-500">{input}</span>
                                            <span className={idx === suggestionIndex ? 'text-amber-200' : 'text-slate-300'}>{match.substring(input.length)}</span>
                                        </span>
                                    </div>
                                    {idx === suggestionIndex && <span className="text-[9px] opacity-50 bg-black px-1 rounded border border-white/10">TAB</span>}
                                </div>
                            ))}
                        </div>
                    )}

                    <form onSubmit={handleSendMessage} className="relative group">
                        <div className="relative w-full">
                            {/* Ghost Text Overlay */}
                            {ghostText && (
                                <div className="absolute inset-0 pl-4 py-3 font-mono text-sm text-slate-600 pointer-events-none whitespace-pre overflow-hidden z-0">
                                    <span className="opacity-0">{input}</span>
                                    <span className="opacity-50">{ghostText.substring(input.length)}</span>
                                </div>
                            )}
                            
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleInputKeyDown}
                                placeholder="// Enter command or query..."
                                disabled={isLoading}
                                className="w-full bg-slate-900 border border-slate-700 rounded-md pl-4 pr-12 py-3 font-mono text-sm text-slate-200 placeholder-slate-600 focus:ring-1 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all disabled:opacity-50 relative z-10"
                                autoComplete="off"
                            />
                        </div>
                        
                         <button 
                            type="submit" 
                            disabled={isLoading || !input.trim()} 
                            className="absolute inset-y-0 right-0 flex items-center pr-3 z-20"
                        >
                            <div className={`p-1.5 rounded transition-all ${input.trim() && !isLoading ? 'bg-amber-600 text-white hover:scale-105 shadow-[0_0_10px_rgba(245,158,11,0.5)]' : 'bg-slate-800 text-slate-500'}`}>
                                <svg className="w-4 h-4 transform rotate-90" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009.207 16H12a1 1 0 00.925-1.378l-2.031-4.062a1 1 0 01.34-1.42l4.062-2.031a1 1 0 00.22-1.716l-7-3.5z"></path>
                                </svg>
                            </div>
                        </button>
                    </form>
                    <div className="flex justify-between mt-2">
                        <div className="flex gap-2">
                             <button onClick={onAddAllSuggestions} className="text-[9px] text-slate-500 hover:text-amber-400 font-mono transition-colors uppercase tracking-wider">
                                [EXEC_ALL_DIRECTIVES]
                            </button>
                        </div>
                        <div className="flex gap-4">
                            {suggestionMatches.length > 0 && <span className="text-[9px] text-amber-500/70 font-mono animate-pulse">↑↓ NAVIGATE • TAB COMPLETE</span>}
                            {!suggestionMatches.length && <span className="text-[9px] text-slate-600 font-mono">SECURE_LINK_ESTABLISHED</span>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SentinelTerminal;
