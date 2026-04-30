
import React from 'react';
import { useAppContext } from '../contexts/AppContext';

export const LivePaperBadge: React.FC<{ className?: string }> = ({ className }) => {
    const { isLiveMode } = useAppContext();
    
    return (
        <div className={`flex items-center gap-2 px-2 py-0.5 rounded-sm bg-black/60 border ${isLiveMode ? 'border-red-900 shadow-[0_0_10px_rgba(239,68,68,0.2)]' : 'border-slate-800'} ${className}`}>
            <div className="flex gap-0.5 h-2 items-end">
                <div className={`w-0.5 h-1.5 ${isLiveMode ? 'bg-red-500' : 'bg-emerald-500'} animate-pulse`}></div>
                <div className={`w-0.5 h-2 ${isLiveMode ? 'bg-red-400' : 'bg-amber-500'} animate-pulse delay-75`}></div>
                <div className={`w-0.5 h-1 ${isLiveMode ? 'bg-red-600' : 'bg-emerald-500'} animate-pulse delay-150`}></div>
            </div>
            <span className="text-[8px] font-bold font-mono tracking-widest uppercase text-slate-400">
                {isLiveMode ? (
                    <span className="text-red-500">LIVE_CAPITAL</span>
                ) : (
                    <><span className="text-emerald-500">PROD</span>_<span className="text-amber-500">EXECUTION</span></>
                )}
            </span>
        </div>
    );
};
