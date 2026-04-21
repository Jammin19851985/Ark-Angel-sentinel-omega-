
import React, { useState } from 'react';
import { useAppContext } from '../contexts/AppContext';

const ProjectValhalla: React.FC = () => {
    const { addNexusLog, fiatBalance, withdrawFiat } = useAppContext();
    const [amount, setAmount] = useState(0);
    const [isBridging, setIsBridging] = useState(false);

    const handleExit = async () => {
        if (amount <= 0 || amount > fiatBalance) {
            addNexusLog(">> VALHALLA ERROR: Insufficient capital for migration.");
            return;
        }

        setIsBridging(true);
        addNexusLog(">> PROJECT VALHALLA: Initiating capital migration to Valhalla Cold Storage...");
        addNexusLog(">> Protocol: Dimensional Bypass Synthesis (F148) active.");
        
        await new Promise(r => setTimeout(r, 3000));
        
        const success = withdrawFiat(amount, "VALHALLA_SECURE_VAULT");
        if (success) {
            addNexusLog(`>> MIGRATION COMPLETE: $${amount.toFixed(2)} secured in Valhalla.`);
        }
        setIsBridging(false);
    };

    return (
        <div className="p-4 bg-gradient-to-br from-[#0a0a1a] to-black border border-slate-800 rounded-lg font-mono tech-panel relative overflow-hidden">
            {/* Ambient Purple Glow */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-600/20 blur-[50px] rounded-full pointer-events-none"></div>

            <div className="flex justify-between items-center mb-3 relative z-10">
                <h3 className="text-purple-400 font-bold text-xs uppercase tracking-[0.2em] drop-shadow-[0_0_5px_rgba(168,85,247,0.5)]">Project Valhalla</h3>
                <span className="text-[10px] text-purple-300 animate-pulse border border-purple-500/30 px-1 rounded bg-purple-900/20">GATE: OPEN</span>
            </div>
            <p className="text-[9px] text-slate-500 mb-4 relative z-10">Ultimate 'Exit to Fiat' bridge via Sovereign Non-Territorial Hyper-State protocol.</p>
            
            <div className="flex space-x-2 mb-4 relative z-10">
                <input 
                    type="number" 
                    value={amount} 
                    onChange={e => setAmount(Number(e.target.value))}
                    className="flex-1 bg-black border border-purple-900/50 rounded p-2 text-purple-300 text-xs focus:border-purple-500 focus:shadow-[0_0_10px_rgba(168,85,247,0.3)] outline-none transition-all"
                    placeholder="Migration Amount ($)"
                />
                <button 
                    onClick={handleExit}
                    disabled={isBridging}
                    className="px-4 py-2 bg-purple-950/50 border border-purple-500 text-purple-300 rounded text-[10px] font-bold hover:bg-purple-900 transition-all disabled:opacity-50 hover:shadow-[0_0_15px_rgba(168,85,247,0.4)]"
                >
                    {isBridging ? "BRIDGING..." : "MIGRATE"}
                </button>
            </div>
            
            <div className="grid grid-cols-3 gap-1 relative z-10">
                {[25, 50, 100].map(p => (
                    <button 
                        key={p}
                        onClick={() => setAmount(Math.floor(fiatBalance * (p / 100)))}
                        className="bg-black/40 border border-slate-800 text-[8px] text-slate-500 py-1 hover:border-purple-500 hover:text-purple-400 transition-colors"
                    >
                        {p}% CAP
                    </button>
                ))}
            </div>
        </div>
    );
};

export default ProjectValhalla;
