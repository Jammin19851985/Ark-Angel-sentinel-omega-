
import React from 'react';

export interface ChartInfo {
    title: string;
    description: string;
    useCase: string;
    benefits: string;
    howToUse: string;
}

interface ChartInfoOverlayProps {
    info?: ChartInfo;
}

export const ChartInfoOverlay: React.FC<ChartInfoOverlayProps> = ({ info }) => {
    if (!info) return null;

    return (
        <div className="absolute inset-0 z-50 bg-black/90 backdrop-blur-md p-6 opacity-0 hover:opacity-100 transition-opacity duration-300 flex flex-col justify-center text-left border border-slate-700 pointer-events-auto">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-amber-500 to-purple-500"></div>
            
            <h4 className="text-amber-400 font-display font-bold uppercase tracking-[0.2em] text-lg mb-3 border-b border-white/10 pb-2">
                {info.title} // BRIEFING
            </h4>
            
            <div className="space-y-3 font-mono">
                <div>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-0.5">MISSION</p>
                    <p className="text-xs text-slate-200 leading-relaxed">{info.description}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-[10px] text-cyan-500 uppercase tracking-widest mb-0.5">TACTICS (Use Case)</p>
                        <p className="text-[10px] text-slate-400">{info.useCase}</p>
                    </div>
                    <div>
                        <p className="text-[10px] text-green-500 uppercase tracking-widest mb-0.5">INTEL (Benefits)</p>
                        <p className="text-[10px] text-slate-400">{info.benefits}</p>
                    </div>
                </div>

                <div>
                    <p className="text-[10px] text-purple-500 uppercase tracking-widest mb-0.5">EXECUTION (Readout)</p>
                    <p className="text-[10px] text-slate-300 italic">"{info.howToUse}"</p>
                </div>
            </div>

            <div className="absolute bottom-2 right-2 text-[8px] text-slate-600 uppercase tracking-widest">
                AODE_EDU_LAYER_V4
            </div>
        </div>
    );
};
