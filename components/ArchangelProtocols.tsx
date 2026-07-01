import React, { useState, useEffect } from 'react';

const ArchangelProtocols: React.FC<{ id?: string }> = ({ id }) => {
    const [packetVelocity, setPacketVelocity] = useState(0);
    const [dailyTotal, setDailyTotal] = useState(0);
    const [activeTarget, setActiveTarget] = useState('adampriestley811@kohotransfers.ca');
    const [protocols, setProtocols] = useState({
        quantum_masking: true,
        temporal_arbitrage: true,
        sentiment_inversion: false,
        mempool_frontrun: false,
        predator_identification: false
    });
    
    // Simulate packet velocity
    useEffect(() => {
        const interval = setInterval(() => {
            const newVelocity = Math.floor(Math.random() * 1000);
            setPacketVelocity(newVelocity);
            
            if (newVelocity > 800) {
                // Anomaly detected
                setDailyTotal(prev => {
                    const newTotal = prev + 500;
                    if (newTotal > 10000) {
                        setActiveTarget('adampriestley420@gmail.com');
                    } else {
                        setActiveTarget('adampriestley811@kohotransfers.ca');
                    }
                    return newTotal;
                });
            }
        }, 1500);
        return () => clearInterval(interval);
    }, []);

    // Staggered protocol deployment simulation
    useEffect(() => {
        const timeout1 = setTimeout(() => setProtocols(p => ({ ...p, sentiment_inversion: true })), 5000);
        const timeout2 = setTimeout(() => setProtocols(p => ({ ...p, mempool_frontrun: true })), 12000);
        const timeout3 = setTimeout(() => setProtocols(p => ({ ...p, predator_identification: true })), 18000);
        return () => { clearTimeout(timeout1); clearTimeout(timeout2); clearTimeout(timeout3); };
    }, []);

    return (
        <div id={id} className="tech-panel p-3 h-full flex flex-col gap-2 relative overflow-hidden group border border-amber-900/40">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-[40px] pointer-events-none group-hover:bg-amber-500/10 transition-colors"></div>
            
            <div className="flex justify-between items-center mb-1 border-b border-amber-500/20 pb-1 relative z-10">
                <h3 className="micro-label text-amber-500 drop-shadow-[0_0_5px_rgba(245,158,11,0.5)] flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-ping"></span>
                    ARCHANGEL PROTOCOLS
                </h3>
                <span className="text-[8px] font-mono text-amber-500/70 border border-amber-500/30 px-1 rounded">OPENSTACK_LIVE</span>
            </div>

            {/* Blind-Packet Inference Gate */}
            <div className="bg-black/60 border border-slate-800 rounded p-2 relative z-10">
                <div className="text-[8px] text-slate-400 font-mono mb-1 uppercase tracking-widest border-b border-slate-800 pb-1">Blind-Packet Inference Gate</div>
                <div className="flex flex-col gap-1 text-[9px] font-mono">
                    <div className="flex justify-between">
                        <span className="text-slate-500">PACKET_VELOCITY</span>
                        <span className={packetVelocity > 800 ? 'text-neon-pink animate-pulse' : 'text-neon-green'}>{packetVelocity} mb/s</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-slate-500">QUANTUM_TOTAL</span>
                        <span className="text-cyan-400">{dailyTotal}</span>
                    </div>
                    <div className="flex flex-col mt-1">
                        <span className="text-slate-500">ACTIVE_TARGET:</span>
                        <span className={`truncate text-xs ${activeTarget.includes('420') ? 'text-amber-400' : 'text-slate-300'}`}>{activeTarget}</span>
                    </div>
                </div>
                {packetVelocity > 800 && (
                    <div className="mt-1 text-[7px] text-red-500 uppercase tracking-widest animate-pulse border border-red-500/30 bg-red-950/30 px-1 rounded">
                        ANOMALY DETECTED. PREDICTIVE FRONT-RUN ENGAGED.
                    </div>
                )}
            </div>

            {/* Cybernetic Swarm */}
            <div className="flex-1 bg-black/60 border border-slate-800 rounded p-2 relative z-10 overflow-y-auto custom-scrollbar">
                <div className="text-[8px] text-slate-400 font-mono mb-2 uppercase tracking-widest border-b border-slate-800 pb-1">Archangel Swarm Logic</div>
                <div className="space-y-1.5">
                    {Object.entries(protocols).map(([key, active]) => (
                        <div key={key} className="flex items-center justify-between group/prot">
                            <span className="text-[8px] font-mono uppercase text-slate-400 group-hover/prot:text-slate-200 transition-colors">
                                {key.replace('_', ' ')}
                            </span>
                            <span className={`text-[7px] border px-1 rounded ${active ? 'bg-green-950/40 border-green-500/50 text-green-400' : 'bg-slate-900 border-slate-700 text-slate-500'}`}>
                                {active ? 'ACTIVE' : 'COMPILING...'}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ArchangelProtocols;
