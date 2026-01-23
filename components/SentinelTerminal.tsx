
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
import { SpeakerIcon } from './icons/SpeakerIcon';
import ReactMarkdown, { Components } from 'react-markdown'; 
import { useAppContext } from '../contexts/AppContext';
import { LivePaperBadge } from './LivePaperBadge';
import { KeyIcon } from './icons/KeyIcon';
import { NetworkIcon } from './icons/NetworkIcon';

interface SentinelTerminalProps {
    id: string; 
    messages: Message[];
    input: string;
    setInput: (value: string) => void;
    isLoading: boolean;
    error: string | null;
    handleSendMessage: (e: React.FormEvent | null, override?: string) => void;
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
        return <code className="bg-amber-900/30 text-amber-300 px-1 py-0.5 rounded text-[10px] font-mono border border-amber-500/20" {...props}>{children}</code>;
    }
  
    return (
        <div className="my-2 rounded-sm overflow-hidden border border-slate-700 bg-[#0d1117] shadow-lg relative group transition-all hover:border-slate-600">
            <div className="flex items-center justify-between px-2 py-1 bg-slate-800 border-b border-slate-700">
                <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-500/80" />
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500/80" />
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500/80" />
                    </div>
                    <span className="text-[8px] uppercase font-mono text-slate-400 tracking-wider flex items-center gap-1 border-l border-slate-600 pl-2 ml-1">
                        <TerminalIcon className="w-2.5 h-2.5" />
                        {lang}
                    </span>
                </div>
                <button 
                    onClick={handleCopy}
                    className={`text-[8px] font-bold tracking-widest uppercase transition-all flex items-center gap-1 px-1.5 py-0.5 rounded border ${
                        copied 
                        ? 'text-green-400 border-green-500/30 bg-green-900/20' 
                        : 'text-slate-500 border-slate-700 bg-slate-800/50 hover:text-amber-400 hover:border-amber-500/50'
                    }`}
                >
                    {copied ? <><CheckCircleIcon className="w-2 h-2" /><span>COPIED</span></> : <><CopyIcon className="w-2 h-2" /><span>COPY</span></>}
                </button>
            </div>
            <pre className="p-2 overflow-x-auto text-[10px] sm:text-xs font-mono text-slate-300 leading-relaxed custom-scrollbar selection:bg-amber-500/30">
                <code className={className} {...props}>{children}</code>
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
        executeOperation, installProtocol, runSystem, killSwitchActive, addLog, 
        systemStatus, quantumMetrics, coreState, marketData, trades 
    } = useAppContext();

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [currentSuggestions, setCurrentSuggestions] = useState<string[]>([]);
    const [activeOp, setActiveOp] = useState<string | null>(null);
    const [showPalette, setShowPalette] = useState(false);
    const [paletteSearch, setPaletteSearch] = useState('');
    const [paletteIndex, setPaletteIndex] = useState(0);
    const paletteInputRef = useRef<HTMLInputElement>(null);
    const paletteScrollRef = useRef<HTMLDivElement>(null);
    const [ghostText, setGhostText] = useState<string>('');
    const [suggestionIndex, setSuggestionIndex] = useState(0);

    const [aliases, setAliases] = useState<Record<string, string>>(() => {
        try {
            const saved = localStorage.getItem('archangel_aliases');
            const defaultAliases = {
                "BYPASS_SEC": "ACTIVATE_SHADOW_GENESIS --bypass-sec-filters --stealth-level 100",
                "SCRUB_LOGS": "EXECUTE_FORENSIC_SCRUB --target ALL --mask-origin",
                "EXIT_FIAT": "INITIATE_OFFSHORE_EXFILTRATION --amount MAX --destination VALHALLA",
                "SHADOW_LINK": "ESTABLISH_SOVEREIGN_LINK --mode FORBIDDEN"
            };
            return saved ? { ...defaultAliases, ...JSON.parse(saved) } : defaultAliases;
        } catch {
            return {};
        }
    });

    useEffect(() => { localStorage.setItem('archangel_aliases', JSON.stringify(aliases)); }, [aliases]);
    useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, isLoading, error]);

    const activeDirectivesList = useMemo(() => Object.keys(coreState.activeDirectives).filter(k => coreState.activeDirectives[k]), [coreState.activeDirectives]);

    const rotateSuggestions = useCallback(() => {
        if (!suggestions || suggestions.length === 0) return;
        const shuffled = [...suggestions].sort(() => 0.5 - Math.random());
        setCurrentSuggestions(shuffled.slice(0, 10));
    }, [suggestions]);

    useEffect(() => { if (suggestions.length > 0) rotateSuggestions(); }, [suggestions, rotateSuggestions]);

    const handleSovereignOp = useCallback(async (op: 'EXECUTE' | 'INSTALL' | 'RUN') => {
        if (killSwitchActive) return;
        setActiveOp(op);
        try {
            if (op === 'EXECUTE') await executeOperation();
            if (op === 'INSTALL') await installProtocol();
            if (op === 'RUN') {
                await runSystem();
                addLog('SENTINEL', `[${new Date().toLocaleTimeString()}] SHADOW ENGINE ONLINE. JURISDICTION: NULL-SPACE.`);
            }
        } finally { setActiveOp(null); }
    }, [executeOperation, installProtocol, runSystem, killSwitchActive, addLog]);

    const handleTerminalSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const cleanInput = input.trim();
        if (!cleanInput) return;

        if (cleanInput.startsWith('/alias ')) {
            const parts = cleanInput.split(' ');
            if (parts.length >= 3) {
                setAliases(prev => ({ ...prev, [parts[1]]: parts.slice(2).join(' ') }));
                setInput(''); return;
            }
        }

        if (aliases[cleanInput]) {
            handleSendMessage(e, aliases[cleanInput]);
            return;
        }

        handleSendMessage(e);
    };

    const commands = useMemo(() => {
        const cmds = [
            { id: 'op-exec', label: 'EXECUTE FORBIDDEN OP', category: 'SHADOW', icon: <CrosshairIcon className="w-3 h-3 text-red-500" />, action: () => handleSovereignOp('EXECUTE') },
            { id: 'op-install', label: 'INSTALL SHADOW PROTOCOL', category: 'SHADOW', icon: <DownloadIcon className="w-3 h-3 text-cyan-500" />, action: () => handleSovereignOp('INSTALL') },
            { id: 'cmd-all', label: 'EXECUTE ALL BYPASSES', category: 'MACRO', icon: <BrainCircuitIcon className="w-3 h-3 text-amber-500" />, action: onAddAllSuggestions },
        ];
        
        Object.entries(aliases).forEach(([key, val], i) => {
            cmds.push({
                id: `alias-${i}`,
                label: `ALIAS: ${key}`,
                category: 'ALIAS',
                icon: <KeyIcon className="w-3 h-3 text-violet-400" />,
                action: () => handleSendMessage(null, String(val))
            });
        });
        
        return cmds;
    }, [onAddAllSuggestions, handleSovereignOp, aliases, handleSendMessage]);

    const filteredCommands = useMemo(() => {
        if (!paletteSearch) return commands;
        const lower = paletteSearch.toLowerCase();
        return commands.filter(c => c.label.toLowerCase().includes(lower) || c.category.toLowerCase().includes(lower));
    }, [commands, paletteSearch]);

    const markdownComponents: Components = useMemo(() => ({
        code: CodeBlock,
        pre: ({children}) => <>{children}</>, 
        p: ({node, ...props}) => <p className="mb-2 last:mb-0 leading-relaxed text-slate-300" {...props} />, 
        h1: ({node, ...props}) => <h1 className="text-lg font-bold text-amber-400 mt-4 mb-2 border-b border-amber-500/20 pb-1 uppercase tracking-widest font-display" {...props} />,
        h2: ({node, ...props}) => <h2 className="text-base font-bold text-cyan-400 mt-3 mb-2 font-display uppercase tracking-wide flex items-center gap-2" {...props}><span className="w-1 h-2 bg-cyan-500 rounded-sm inline-block"></span>{props.children}</h2>,
    }), []);

    return (
        <div id={id} className="tech-panel flex flex-col h-full overflow-hidden relative">
            <div className="tech-header z-10 shrink-0">
                <div className="flex items-center gap-2">
                    <TerminalIcon className="w-3 h-3 text-amber-500" />
                    <h2 className="text-[10px] font-bold text-slate-200 font-mono tracking-widest uppercase">// SHADOW-CORE TERMINAL</h2>
                </div>
                <div className="flex items-center gap-4">
                    <LivePaperBadge />
                    <div className="flex gap-1">
                        {['EXECUTE', 'INSTALL', 'RUN'].map(op => (
                            <button 
                                key={op}
                                onClick={() => handleSovereignOp(op as any)}
                                disabled={!!activeOp || killSwitchActive}
                                className={`flex items-center gap-1 px-2 py-0.5 rounded-sm border transition-all text-[8px] font-bold uppercase ${activeOp === op ? 'bg-red-600 text-white' : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-cyan-400'}`}
                            >
                                <span className="hidden sm:inline">{op}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="bg-black/40 border-b border-slate-800 px-2 py-1.5 grid grid-cols-2 md:grid-cols-4 gap-2 text-[8px] font-mono shrink-0">
                <div className="flex flex-col space-y-0.5">
                    <span className="text-slate-500 uppercase tracking-widest flex items-center gap-1">Status</span>
                    <span className={`font-bold text-[9px] ${systemStatus === 'LIVE' ? 'text-red-500 animate-pulse' : 'text-slate-400'}`}>
                        {systemStatus === 'LIVE' ? 'SHADOW_MODE_ACTIVE' : systemStatus}
                    </span>
                </div>
                <div className="flex flex-col space-y-0.5">
                    <span className="text-slate-500 uppercase tracking-widest">Jurisdiction</span>
                    <span className="text-amber-500 font-bold text-[9px]">NULL-SPACE [HK]</span>
                </div>
                <div className="flex flex-col space-y-0.5">
                    <span className="text-slate-500 uppercase tracking-widest">Bypasses</span>
                    <span className="text-cyan-400 font-bold text-[9px]">SEC, FINRA, UPB1</span>
                </div>
                <div className="flex flex-col space-y-0.5">
                    <span className="text-slate-500 uppercase tracking-widest">Trace Rating</span>
                    <span className="text-indigo-400 font-bold text-[9px]">0.02% DETECT</span>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                <div className="flex-1 flex flex-col min-w-0 bg-transparent">
                    <div className="flex-1 overflow-y-auto p-2 space-y-4 font-mono text-xs relative custom-scrollbar">
                        {messages.map((msg, index) => {
                            const isUser = msg.author === 'user';
                            return (
                                <div key={index} className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-fade-in group`}>
                                    <div className={`flex gap-2 max-w-[95%] lg:max-w-[85%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                                        <div className={`w-6 h-6 rounded-sm flex items-center justify-center flex-shrink-0 mt-1 border ${isUser ? 'bg-red-900/50 border-red-500' : 'bg-cyan-900/50 border-cyan-500'}`}>
                                            {isUser ? <ShieldIcon className="w-3 h-3 text-red-200" /> : <BrainCircuitIcon className="w-3 h-3 text-cyan-200" />}
                                        </div>
                                        <div className={`relative p-3 rounded-sm border shadow-xl ${isUser ? 'bg-red-950/20 border-red-800/50' : 'bg-slate-900/40 border-slate-700/50 text-slate-300'}`}>
                                            <div className={`text-[8px] font-bold tracking-widest mb-1 uppercase border-b pb-0.5 ${isUser ? 'text-red-500 border-red-500/20' : 'text-cyan-500 border-cyan-500/20'}`}>
                                                {isUser ? '// FORBIDDEN_COMMAND' : '// SHADOW_RESPONSE'}
                                            </div>
                                            <div className="prose prose-xs prose-invert max-w-none text-slate-300">
                                                <ReactMarkdown components={markdownComponents}>{msg.content}</ReactMarkdown>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        
                        {isLoading && <div className="flex justify-start animate-pulse"><div className="bg-slate-900/50 border border-slate-800 p-2 text-[10px] text-cyan-500 font-mono">ENCRYPTING_COMMUNICATION...</div></div>}
                        
                        {error && (
                            <div className="flex justify-start animate-fade-in mt-4 w-full">
                                <div className="bg-red-950/10 border border-red-500/40 p-4 rounded-md w-full max-w-2xl relative overflow-hidden group">
                                    {/* Background Error Pattern */}
                                    <div className="absolute inset-0 opacity-10 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,#ff0000_10px,#ff0000_20px)] pointer-events-none"></div>
                                    
                                    <div className="flex items-start gap-3 relative z-10">
                                        <div className="p-2 bg-red-900/30 rounded border border-red-500/50 shrink-0 mt-1">
                                            <ShieldIcon className="w-5 h-5 text-red-500 animate-pulse" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-xs font-bold text-red-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                                                Process_Interrupted // Exception_Caught
                                            </h4>
                                            <p className="text-[11px] text-slate-300 font-sans leading-relaxed opacity-90 mb-2">
                                                An unexpected anomaly disrupted the execution thread. The system has paused to prevent causal drift.
                                            </p>
                                            <div className="bg-black/40 border border-red-900/50 p-2 rounded text-[10px] font-mono text-red-300/80 mb-3 break-all">
                                                {`> ERROR_TRACE: ${error}`}
                                            </div>
                                            
                                            <div className="flex flex-wrap gap-3 items-center">
                                                <button 
                                                    onClick={() => handleTroubleshoot(error)}
                                                    className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-[10px] font-bold uppercase tracking-widest rounded shadow-[0_0_15px_rgba(220,38,38,0.4)] transition-all active:scale-95 group/btn"
                                                >
                                                    <RefreshIcon className="w-3.5 h-3.5 group-hover/btn:rotate-180 transition-transform duration-500" />
                                                    Initialize_Auto_Recovery
                                                </button>
                                                <div className="flex items-center gap-1.5 text-[9px] text-red-400/60 uppercase tracking-wider">
                                                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping"></div>
                                                    Waiting for operator override
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>
                </div>
            </div>

            <div className="border-t border-slate-800 bg-black relative z-20 shrink-0">
                <div className="p-2 relative">
                    <form onSubmit={handleTerminalSubmit} className="relative group">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="// SHADOW_VECTORS_ONLY..."
                            disabled={isLoading}
                            className={`w-full bg-slate-900 border rounded-sm pl-3 pr-10 py-2 font-mono text-xs text-slate-200 placeholder-slate-600 outline-none transition-all ${error ? 'border-red-500/50 focus:border-red-500' : 'border-slate-700 focus:border-cyan-500'}`}
                            autoComplete="off"
                        />
                    </form>
                    <div className="flex justify-between mt-1 px-1">
                        <span className="text-[8px] text-red-900 font-mono uppercase tracking-widest animate-pulse">RESTRICTED_PORT: 8081</span>
                        <span className="text-[8px] text-slate-600 font-mono">LINK_ENCRYPTED_AES256</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SentinelTerminal;
