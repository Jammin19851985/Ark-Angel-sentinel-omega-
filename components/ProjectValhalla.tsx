
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
        <div className="p-4 bg-gradient-to-br from-indigo-900/30 to-black border border-indigo-500/30 rounded-lg font-mono">
            <div className="flex justify-between items-center mb-3">
                <h3 className="text-indigo-400 font-bold text-xs uppercase tracking-[0.2em]">Project Valhalla</h3>
                <span className="text-[10px] text-indigo-700 animate-pulse">GATE: OPEN</span>
            </div>
            <p className="text-[9px] text-slate-500 mb-4">Ultimate 'Exit to Fiat' bridge via Sovereign Non-Territorial Hyper-State protocol.</p>
            
            <div className="flex space-x-2 mb-4">
                <input 
                    type="number" 
                    value={amount} 
                    onChange={e => setAmount(Number(e.target.value))}
                    className="flex-1 bg-black border border-indigo-900/50 rounded p-2 text-indigo-400 text-xs focus:border-indigo-400 outline-none"
                    placeholder="Migration Amount ($)"
                />
                <button 
                    onClick={handleExit}
                    disabled={isBridging}
                    className="px-4 py-2 bg-indigo-950 border border-indigo-500 text-indigo-400 rounded text-[10px] font-bold hover:bg-indigo-900 transition-all disabled:opacity-50"
                >
                    {isBridging ? "BRIDGING..." : "MIGRATE"}
                </button>
            </div>
            
            <div className="grid grid-cols-3 gap-1">
                {[25, 50, 100].map(p => (
                    <button 
                        key={p}
                        onClick={() => setAmount(Math.floor(fiatBalance * (p / 100)))}
                        className="bg-black/40 border border-slate-800 text-[8px] text-slate-500 py-1 hover:border-indigo-400 hover:text-indigo-400"
                    >
                        {p}% CAP
                    </button>
                ))}
            </div>
        </div>
    );
};

export default ProjectValhalla;
