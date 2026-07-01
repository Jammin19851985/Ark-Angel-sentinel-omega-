import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import Fuse from 'fuse.js';
import { useAppContext } from '../contexts/AppContext';
import { ActiveView } from '../types';
import { SearchIcon } from './icons/SearchIcon';
import { TerminalIcon } from './icons/TerminalIcon';
import { QuantumIcon } from './icons/QuantumIcon';
import { NetworkIcon } from './icons/NetworkIcon';
import { BeakerIcon } from './icons/BeakerIcon';
import { SonarIcon } from './icons/SonarIcon';
import { ChartPieIcon } from './icons/ChartPieIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { ChartBarIcon } from './icons/ChartBarIcon';
import { BookOpenIcon } from './icons/BookOpenIcon';
import { ShieldIcon } from './icons/ShieldIcon';
import { PowerIcon } from './icons/PowerIcon';
import { MoonIcon } from './icons/MoonIcon';
import { SunIcon } from './icons/SunIcon';
import { KeyIcon } from './icons/KeyIcon';
import { ActivityIcon } from './icons/ActivityIcon';

interface CommandPaletteProps {
    isOpen: boolean;
    onClose: () => void;
    setActiveView: (view: ActiveView) => void;
}

interface Command {
    id: string;
    label: string;
    description: string;
    category: 'NAVIGATION' | 'SYSTEM' | 'AUTHORITY';
    icon: React.ReactNode;
    action: () => void;
}

const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, setActiveView }) => {
    const { 
        isGodMode, setIsGodMode, triggerKillSwitch, theme, toggleTheme,
        executeOperation, installProtocol, runSystem, addLog
    } = useAppContext();

    const [search, setSearch] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLDivElement>(null);

    const commands: Command[] = useMemo(() => [
        { id: 'nav-hub', label: 'Navigate: Hub', description: 'Switch to TURMOX Ω Nexus Hub', category: 'NAVIGATION', icon: <QuantumIcon className="w-4 h-4" />, action: () => setActiveView('nexus') },
        { id: 'nav-spine', label: 'Navigate: Spine', description: 'Access Sentinel-A Command Terminal', category: 'NAVIGATION', icon: <TerminalIcon className="w-4 h-4" />, action: () => setActiveView('sentinel') },
        { id: 'nav-swarm', label: 'Navigate: Swarm', description: 'Open Agent Orchestrator', category: 'NAVIGATION', icon: <NetworkIcon className="w-4 h-4" />, action: () => setActiveView('orchestrator') },
        { id: 'nav-vault', label: 'Navigate: Vault', description: 'Monitor Shadow Execution Vault', category: 'NAVIGATION', icon: <BeakerIcon className="w-4 h-4" />, action: () => setActiveView('shadow_terminal') },
        { id: 'nav-sonar', label: 'Navigate: Sonar', description: 'Threat Analysis & Global Intelligence', category: 'NAVIGATION', icon: <SonarIcon className="w-4 h-4" />, action: () => setActiveView('sonar') },
        { id: 'nav-intel', label: 'Navigate: Intel', description: 'Predictive Analytics Dashboard', category: 'NAVIGATION', icon: <ChartPieIcon className="w-4 h-4" />, action: () => setActiveView('analytics') },
        { id: 'nav-toolkit', label: 'Navigate: Toolkit', description: 'AI Multimodal Research Lab', category: 'NAVIGATION', icon: <SparklesIcon className="w-4 h-4" />, action: () => setActiveView('toolkit') },
        { id: 'nav-audit', label: 'Navigate: Audit', description: 'Forensic Strategy Backtester', category: 'NAVIGATION', icon: <ChartBarIcon className="w-4 h-4" />, action: () => setActiveView('backtester') },
        { id: 'nav-codex', label: 'Navigate: Codex', description: 'AODE Sovereignty Instructions', category: 'NAVIGATION', icon: <BookOpenIcon className="w-4 h-4" />, action: () => setActiveView('intel') },
        { id: 'nav-banking', label: 'Navigate: Banking', description: 'Real-World Banking & Autonomy Directives', category: 'NAVIGATION', icon: <BookOpenIcon className="w-4 h-4" />, action: () => setActiveView('banking') },
        
        { id: 'sys-god', label: isGodMode ? 'Disable God Mode' : 'Enable God Mode', description: 'Toggle Higher-Order Authority protocols', category: 'AUTHORITY', icon: <ShieldIcon className="w-4 h-4" />, action: () => setIsGodMode(!isGodMode) },
        { id: 'sys-theme', label: `Theme: ${theme === 'dark' ? 'Light' : 'Dark'}`, description: 'Toggle system interface visual regime', category: 'SYSTEM', icon: theme === 'dark' ? <SunIcon className="w-4 h-4" /> : <MoonIcon className="w-4 h-4" />, action: toggleTheme },
        { id: 'sys-kill', label: 'TRIGGER KILL SWITCH', description: 'Emergency halt of all execution spines', category: 'AUTHORITY', icon: <PowerIcon className="w-4 h-4 text-red-500" />, action: triggerKillSwitch },
        
        { id: 'op-exec', label: 'Operation: EXECUTE', description: 'Force immediate causal collapse', category: 'SYSTEM', icon: <ActivityIcon className="w-4 h-4 text-amber-500" />, action: executeOperation },
        { id: 'op-install', label: 'Protocol: INSTALL', description: 'Inject new axiomatic constants', category: 'SYSTEM', icon: <KeyIcon className="w-4 h-4 text-cyan-500" />, action: installProtocol },
        { id: 'op-run', label: 'Protocol: AWAKEN', description: 'Trigger Living System resonance', category: 'SYSTEM', icon: <ActivityIcon className="w-4 h-4 text-green-500" />, action: runSystem },
    ], [isGodMode, theme, setActiveView, setIsGodMode, toggleTheme, triggerKillSwitch, executeOperation, installProtocol, runSystem]);

    // Fuzzy search engine
    const fuse = useMemo(() => new Fuse(commands, {
        keys: ['label', 'description', 'category'],
        threshold: 0.4,
        includeMatches: true
    }), [commands]);

    const filteredCommands = useMemo(() => {
        if (!search) return commands;
        return fuse.search(search).map(result => result.item);
    }, [fuse, search, commands]);

    useEffect(() => {
        if (isOpen) {
            setSearch('');
            setSelectedIndex(0);
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [isOpen]);

    const handleSelect = (cmd: Command) => {
        addLog('SYSTEM', `Executing Command: ${cmd.label}`);
        cmd.action();
        onClose();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => (prev + 1) % filteredCommands.length);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length);
        } else if (e.key === 'Enter') {
            if (filteredCommands[selectedIndex]) {
                handleSelect(filteredCommands[selectedIndex]);
            }
        } else if (e.key === 'Escape') {
            onClose();
        }
    };

    // Auto-scroll logic
    useEffect(() => {
        const activeItem = listRef.current?.children[selectedIndex] as HTMLElement;
        if (activeItem) {
            activeItem.scrollIntoView({ block: 'nearest' });
        }
    }, [selectedIndex, filteredCommands.length]);

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[200000] flex items-start justify-center pt-[15vh] px-4">
            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={onClose}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        />
                        
                        <motion.div
                            initial={{ opacity: 0, y: -20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -20, scale: 0.95 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className="relative w-full max-w-2xl bg-[#0a0a0c] border border-slate-800 rounded-xl shadow-[0_0_50px_rgba(0,0,0,1),0_0_20px_rgba(6,182,212,0.1)] overflow-hidden font-mono"
                        >
                            {/* Holographic Header */}
                            <div className="relative flex items-center px-4 py-4 border-b border-slate-800 bg-black/40">
                                <SearchIcon className="w-5 h-5 text-cyan-500 mr-3 animate-pulse" />
                                <input 
                                    ref={inputRef}
                                    type="text"
                                    value={search}
                                    onChange={(e) => {
                                        setSearch(e.target.value);
                                        setSelectedIndex(0);
                                    }}
                                    onKeyDown={handleKeyDown}
                                    placeholder="ENTER_SOVEREIGN_COMMAND..."
                                    className="flex-1 bg-transparent border-none text-slate-100 placeholder-slate-700 outline-none text-lg tracking-wider"
                                />
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] text-slate-600 bg-black px-1.5 py-0.5 rounded border border-slate-800 uppercase font-bold tracking-tighter">Ctrl+K</span>
                                    <span className="text-[10px] text-slate-600 bg-black px-1.5 py-0.5 rounded border border-slate-800 uppercase font-bold tracking-tighter">ESC</span>
                                </div>
                            </div>

                            {/* Command List */}
                            <div 
                                ref={listRef}
                                className="max-h-[60vh] overflow-y-auto custom-scrollbar p-2"
                            >
                                {filteredCommands.length === 0 ? (
                                    <div className="py-12 text-center text-slate-600">
                                        <span className="text-xs uppercase tracking-[0.4em] opacity-50">Null_Vector // No Matches</span>
                                    </div>
                                ) : (
                                    <div className="space-y-1">
                                        {filteredCommands.map((cmd, idx) => {
                                            const isSelected = idx === selectedIndex;
                                            return (
                                                <button
                                                    key={cmd.id}
                                                    onClick={() => handleSelect(cmd)}
                                                    onMouseEnter={() => setSelectedIndex(idx)}
                                                    className={`w-full flex items-center px-3 py-3 rounded-lg transition-all text-left group relative overflow-hidden ${
                                                        isSelected 
                                                        ? 'bg-cyan-950/40 border-cyan-500/30' 
                                                        : 'border border-transparent hover:bg-white/5'
                                                    }`}
                                                >
                                                    {/* Selected Highlight Bar */}
                                                    <AnimatePresence>
                                                        {isSelected && (
                                                            <motion.div 
                                                                layoutId="active-pill"
                                                                className="absolute inset-0 bg-cyan-500/10 z-0"
                                                                initial={false}
                                                                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                                                            />
                                                        )}
                                                    </AnimatePresence>
                                                    
                                                    {isSelected && (
                                                        <motion.div 
                                                            layoutId="active-indicator"
                                                            className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-500 shadow-[0_0_15px_#06b6d4] z-10"
                                                        />
                                                    )}
                                                    
                                                    <div className={`p-2 rounded-md mr-4 transition-colors z-10 ${isSelected ? 'bg-cyan-900/40 text-cyan-400 ring-1 ring-cyan-500/30' : 'bg-slate-900 text-slate-500'}`}>
                                                        {cmd.icon}
                                                    </div>

                                                    <div className="flex-1 min-w-0 z-10">
                                                        <div className="flex items-center justify-between">
                                                            <span className={`text-sm font-bold tracking-widest uppercase transition-colors ${isSelected ? 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]' : 'text-slate-400'}`}>
                                                                {cmd.label}
                                                            </span>
                                                            <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded border transition-colors ${
                                                                isSelected 
                                                                ? 'bg-cyan-950/50 border-cyan-500/50 text-cyan-500' 
                                                                : 'bg-slate-900 border-slate-800 text-slate-700'
                                                            }`}>
                                                                {cmd.category}
                                                            </span>
                                                        </div>
                                                        <div className={`text-[10px] mt-0.5 truncate transition-colors ${isSelected ? 'text-cyan-200/80' : 'text-slate-600'}`}>
                                                            {cmd.description}
                                                        </div>
                                                    </div>

                                                    {isSelected && (
                                                        <motion.div 
                                                            initial={{ x: 10, opacity: 0 }}
                                                            animate={{ x: 0, opacity: 1 }}
                                                            className="ml-4 text-[10px] text-cyan-400 animate-pulse font-bold z-10"
                                                        >
                                                            &gt;&gt;
                                                        </motion.div>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* Footer Status */}
                            <div className="px-4 py-2 border-t border-slate-800 bg-black/60 flex justify-between items-center text-[9px] text-slate-600 uppercase tracking-widest">
                                <div className="flex gap-4">
                                    <span>Items: {filteredCommands.length}</span>
                                    <span>Auth: {isGodMode ? 'GOD_LEVEL' : 'STANDARD'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="animate-pulse w-1.5 h-1.5 rounded-full bg-cyan-500" />
                                    <span>ARK_OMEGA_CORE_V2.0</span>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>,
        document.body
    );
};

export default CommandPalette;