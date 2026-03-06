
import React from 'react';

export const LivePaperBadge: React.FC<{ className?: string }> = ({ className }) => (
    <div className={`flex items-center gap-2 px-2 py-0.5 rounded-sm bg-black/60 border border-slate-800 ${className}`}>
        <div className="flex gap-0.5 h-2 items-end">
            <div className="w-0.5 h-1.5 bg-emerald-500 animate-pulse"></div>
            <div className="w-0.5 h-2 bg-amber-500 animate-pulse delay-75"></div>
            <div className="w-0.5 h-1 bg-emerald-500 animate-pulse delay-150"></div>
        </div>
        <span className="text-[8px] font-bold font-mono tracking-widest uppercase text-slate-400">
            <span className="text-emerald-500">PROD</span>_<span className="text-amber-500">EXECUTION</span>
        </span>
    </div>
);
