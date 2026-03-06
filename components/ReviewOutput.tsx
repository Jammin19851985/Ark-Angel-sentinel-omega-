
import React from 'react';
import Loader from './Loader';
import { ShieldAlertIcon } from './icons/ShieldAlertIcon';
// Fix: Added missing import for TerminalIcon
import { TerminalIcon } from './icons/TerminalIcon';

interface ReviewOutputProps {
    review: string | null;
    isLoading: boolean;
    error: string | null;
}

const FormattedLine: React.FC<{ line: string }> = ({ line }) => {
    // Advanced Forensic Parsing
    if (line.startsWith('### ')) {
        return <h3 className="text-amber-400 font-bold text-xs uppercase tracking-widest mt-4 mb-2 flex items-center gap-2 border-b border-amber-900/50 pb-1">
            <div className="w-1.5 h-3 bg-amber-500 rounded-full"></div>
            {line.substring(4)}
        </h3>;
    }
    if (line.startsWith('## ')) {
        return <h2 className="text-cyan-400 font-display font-bold text-sm uppercase tracking-[0.2em] mt-6 mb-3 border-l-2 border-cyan-500 pl-3 bg-cyan-950/20 py-1">
            {line.substring(3)}
        </h2>;
    }
    if (line.startsWith('# ')) {
        return <h1 className="text-white font-display font-extrabold text-lg uppercase tracking-[0.4em] mt-8 mb-4 border-b-2 border-white/10 pb-2 text-center bg-gradient-to-r from-transparent via-white/5 to-transparent">
            {line.substring(2)}
        </h1>;
    }
    
    // Severity Highlighting
    if (line.toLowerCase().includes('omega') || line.toLowerCase().includes('critical')) {
         return <div className="text-red-400 font-bold bg-red-950/30 p-1.5 border-l-2 border-red-500 my-1 flex items-center gap-2">
            <span className="text-[10px] animate-pulse">!!!</span> {line}
         </div>;
    }
    
    if (line.toLowerCase().includes('caution') || line.toLowerCase().includes('warning')) {
         return <div className="text-amber-300 bg-amber-950/20 p-1.5 border-l-2 border-amber-500 my-1 italic">
            {line}
         </div>;
    }

    if (line.startsWith('* ') || line.startsWith('- ')) {
        return <li className="ml-5 text-slate-300 mb-1 list-none flex items-start gap-2">
            <span className="text-cyan-600 mt-1">›</span>
            <span>{line.substring(2)}</span>
        </li>;
    }
    
    if (line.match(/^`{3}/)) { 
        return null; 
    }
    
    if (line.startsWith('---')) {
        return <hr className="border-slate-800 my-6 border-dashed" />;
    }
    
    return <div className="text-slate-400 leading-relaxed mb-2 text-[11px] font-sans">{line}</div>;
};

const ReviewOutput: React.FC<ReviewOutputProps> = ({ review, isLoading, error }) => {
    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="flex flex-col items-center justify-center h-full space-y-4">
                    <Loader />
                    <p className="mt-2 text-amber-500 font-mono text-[10px] animate-pulse uppercase tracking-widest">Compiling Swarm Intelligence...</p>
                </div>
            );
        }

        if (error) {
            return (
                <div className="flex items-center justify-center h-full">
                    <div className="bg-red-950/40 border border-red-500/50 text-red-200 px-6 py-4 rounded-md shadow-2xl backdrop-blur-md">
                        <div className="flex items-center gap-3 mb-2">
                             <ShieldAlertIcon className="w-5 h-5 text-red-500" />
                             <p className="font-bold uppercase tracking-widest">Analysis Void</p>
                        </div>
                        <p className="text-[10px] opacity-80 italic">{error}</p>
                    </div>
                </div>
            );
        }

        if (!review) {
            return (
                <div className="flex flex-col items-center justify-center h-full p-8 text-center border-2 border-dashed border-slate-800 rounded-lg bg-black/20 group hover:border-amber-500/30 transition-all">
                    <div className="w-16 h-16 mb-4 rounded-full bg-slate-900 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <TerminalIcon className="w-8 h-8 text-slate-700 group-hover:text-amber-500" />
                    </div>
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Awaiting Forensic Ingest</h3>
                    <p className="mt-2 text-[10px] text-slate-600 max-w-xs leading-relaxed uppercase">
                        Feed the AODE-Kernel code vectors to initiate high-fidelity forensic scrutiny.
                    </p>
                </div>
            );
        }

        const lines = review.split('\n');
        const elements: React.ReactNode[] = [];
        let isCodeBlock = false;
        let codeBlockContent: string[] = [];

        lines.forEach((line, index) => {
            if (line.match(/^`{3}/)) {
                if (isCodeBlock) {
                    elements.push(
                        <div key={`code-container-${index}`} className="relative group/code mb-4">
                            <div className="absolute top-0 right-0 px-2 py-0.5 bg-amber-900/80 text-amber-300 text-[8px] font-bold rounded-bl uppercase">Synthesized_Logic</div>
                            <pre className="bg-black/60 border border-slate-700 rounded-md p-4 overflow-x-auto shadow-inner">
                                <code className="font-mono text-[10px] text-amber-300/90 leading-tight">
                                    {codeBlockContent.join('\n')}
                                </code>
                            </pre>
                        </div>
                    );
                    codeBlockContent = [];
                }
                isCodeBlock = !isCodeBlock;
            } else {
                if (isCodeBlock) {
                    codeBlockContent.push(line);
                } else {
                    elements.push(<FormattedLine key={index} line={line} />);
                }
            }
        });
        
        return <div className="animate-fade-in-slow pb-10">{elements}</div>;
    };

    return (
        <div className="h-full overflow-hidden relative font-mono">
            {/* Background Dossier Aesthetics */}
            <div className="absolute top-0 right-0 opacity-[0.02] text-[100px] pointer-events-none select-none font-bold">CLASSIFIED</div>
            <div className="h-full overflow-y-auto pr-2 custom-scrollbar">
                {renderContent()}
            </div>
        </div>
    );
};

export default ReviewOutput;
