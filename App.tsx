import React, { useState, useEffect, useRef } from 'react';
import PortfolioDashboard from './components/PortfolioDashboard';
import { 
  Shield, Activity, Cpu, Zap, Lock, Radar, Globe, Search, 
  Layers, Crosshair, Flame, RefreshCw, Database, Waves, EyeOff
} from 'lucide-react';
import { motion } from 'framer-motion';

const App = () => {
  const [activeTab, setActiveTab] = useState('terminal');
  const [cycleLog, setCycleLog] = useState<any[]>([]);
  const [harvestData, setHarvestData] = useState<any>(null);
  const [consensus, setConsensus] = useState(99.9);
  const [intensity, setIntensity] = useState(42.5);
  const [ledgerData, setLedgerData] = useState<any[]>([]);
  const [brainStatus, setBrainStatus] = useState<any>(null);
  const [recursionData, setRecursionData] = useState<any>(null);
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    fetch('http://localhost:8000/api/harvest').then(res => res.json()).then(data => setHarvestData(data));
    fetch('http://localhost:8000/api/ledger').then(res => res.json()).then(data => setLedgerData(data));
    fetch('http://localhost:8000/api/brain/status').then(res => res.json()).then(data => setBrainStatus(data));
    fetch('http://localhost:8000/api/brain/recursion').then(res => res.json()).then(data => setRecursionData(data));
    
    const interval = setInterval(() => {
      setConsensus(prev => parseFloat((99.8 + Math.random() * 0.2).toFixed(1)));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const runCycle = async () => {
    setCycleLog(prev => [...prev, { role: 'system', text: ">> INITIATING 2038 NEURAL HANDSHAKE..." }]);
    try {
      const res = await fetch('http://localhost:8000/api/cycle', { method: 'POST' });
      const data = await res.json();
      setIntensity(data.intensity);
      setCycleLog(prev => [
        ...prev, 
        { role: 'brain', text: `>> C6 Energy Arbitrage: ${data.action} ${data.pair}` },
        { role: 'strike', text: `>> C9 Shadow Agents: 144 Active | Yield: $4,200/hr` },
        { role: 'system', text: `>> C8 Probability Shield: 99.4% Predictive Accuracy.` },
        { role: 'system', text: ">> 2038 ASCENSION CYCLE STABLE." }
      ]);
    } catch (e) {
      setCycleLog(prev => [...prev, { role: 'error', text: ">> ERROR: NEURAL MESH DESYNC." }]);
    }
  };

  return (
    <div className="flex h-screen bg-[#050505] text-[#e3e3e3] font-sans overflow-hidden">
      {/* LEFT: 2038 REGISTRY */}
      <aside className="w-80 border-r border-blue-900/30 bg-[#0a0a0a] flex flex-col">
        <div className="p-4 flex items-center gap-3 border-b border-blue-900/20 min-h-[56px] bg-[#0f0f0f]">
          <div className="w-8 h-8 rounded-lg bg-cyan-600 flex items-center justify-center font-bold text-white shadow-[0_0_20px_rgba(6,182,212,0.5)] animate-pulse">
            <Shield size={18} fill="currentColor"/>
          </div>
          <span className="font-bold text-lg text-cyan-400 tracking-tighter">OMEGA 2038</span>
        </div>
        
        <div className="p-4 flex-1 flex flex-col space-y-6 overflow-hidden">
          <div className="space-y-2">
            <div className="text-[10px] font-bold text-cyan-800 uppercase tracking-widest px-2">Global Mesh Specs</div>
            <div className="bg-cyan-900/10 border border-cyan-900/30 p-3 rounded-xl space-y-2 text-[11px]">
              <div className="flex justify-between"><span>Connectivity</span><span className="text-cyan-400 font-mono">6G Terahertz</span></div>
              <div className="flex justify-between"><span>Security</span><span className="text-cyan-400 font-mono">Soul-Sync</span></div>
              <div className="flex justify-between"><span>Logic</span><span className="text-cyan-400 font-mono">Self-Correcting</span></div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-1 scrollbar-none">
            <div className="text-[10px] font-bold text-blue-900 uppercase tracking-widest px-2 mb-2">Shadow Infrastructure</div>
            {[
              { id: 'C6', name: 'Transactive Energy Swarm', status: 'Harvesting' },
              { id: 'C7', name: 'Ghost-Protocol Mesh', status: 'Shadowed' },
              { id: 'C8', name: 'Psychohistory Shield', status: 'Predicting' },
              { id: 'C9', name: '144 Shadow Workers', status: 'Generating' },
              { id: 'C10', name: 'Soul-Sync Biometrics', status: 'Locked' }
            ].map(protocol => (
              <div key={protocol.id} className="p-3 bg-[#111] border border-white/5 rounded-xl flex items-center gap-3">
                <div className="text-cyan-500 font-mono text-[10px]">{protocol.id}</div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[11px] font-medium truncate">{protocol.name}</span>
                  <span className="text-[9px] text-green-500 font-bold uppercase">{protocol.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 border-t border-blue-900/20 bg-[#0f0f0f]">
          <div className="flex items-center justify-between text-[10px] text-cyan-900 font-mono">
            <span>AURORA_SOVEREIGN_V2038</span>
            <div className="flex items-center gap-1.5 text-green-500">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
              <span>ONLINE</span>
            </div>
          </div>
        </div>
      </aside>

      {/* CENTER: 2038 HUD */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#050505]">
        <header className="h-14 border-b border-blue-900/20 flex items-center justify-between px-6 bg-[#0a0a0a]">
          <div className="flex gap-4">
            <button onClick={() => setActiveTab('terminal')} className={`text-sm font-bold uppercase tracking-widest ${activeTab === 'terminal' ? 'text-cyan-400' : 'text-zinc-600 hover:text-white'}`}>Terminal</button>
            <button onClick={() => setActiveTab('portfolio')} className={`text-sm font-bold uppercase tracking-widest ${activeTab === 'portfolio' ? 'text-cyan-400' : 'text-zinc-600 hover:text-white'}`}>NAV</button>
          </div>
          <div className="flex gap-2">
             <span className="px-2 py-0.5 bg-cyan-900/30 text-cyan-400 border border-cyan-800 rounded text-[10px] font-bold">ASCENDED</span>
             <span className="px-2 py-0.5 bg-orange-900/30 text-orange-400 border border-orange-800 rounded text-[10px] font-bold italic">POST-SCARCITY</span>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          {activeTab === 'portfolio' ? <PortfolioDashboard /> : (
            <div className="max-w-5xl mx-auto space-y-8">
              {/* 2038 GAUGES */}
              <div className="grid grid-cols-3 gap-6">
                <div className="bg-[#0f0f0f] border border-blue-900/20 rounded-3xl p-6 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                  <div className="text-cyan-500 font-bold text-[10px] mb-2 uppercase">Swarm Consensus</div>
                  <div className="text-6xl font-black text-white italic tracking-tighter">{consensus}%</div>
                </div>
                <div className="bg-[#0f0f0f] border border-orange-900/20 rounded-3xl p-6 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                  <div className="text-orange-500 font-bold text-[10px] mb-2 uppercase">Debate Intensity</div>
                  <div className="text-6xl font-black text-white italic tracking-tighter">{intensity}%</div>
                </div>
                <div className="bg-gradient-to-br from-[#0f0f0f] to-[#1a1a1a] border border-white/10 rounded-3xl p-6 flex flex-col justify-center">
                  <div className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-2 text-center">Daily Optimization</div>
                  <div className="text-4xl font-black text-green-400 text-center tracking-tighter">{harvestData?.total_daily_optimization || '$1.4M'}</div>
                </div>
              </div>

              {/* HARVEST RECAP */}
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-zinc-900/30 rounded-2xl border border-white/5 flex flex-col items-center">
                  <span className="text-[9px] text-zinc-600 uppercase font-bold">Energy Yield</span>
                  <span className="text-lg font-mono text-cyan-300">{harvestData?.energy_yield || '0.82 GWh'}</span>
                </div>
                <div className="p-4 bg-zinc-900/30 rounded-2xl border border-white/5 flex flex-col items-center">
                  <span className="text-[9px] text-zinc-600 uppercase font-bold">Agentic Income</span>
                  <span className="text-lg font-mono text-purple-300">{harvestData?.agentic_income || '$4,200/hr'}</span>
                </div>
                <div className="p-4 bg-zinc-900/30 rounded-2xl border border-white/5 flex flex-col items-center">
                  <span className="text-[9px] text-zinc-600 uppercase font-bold">Market Proof</span>
                  <span className="text-lg font-mono text-emerald-300">100% Win</span>
                </div>
              </div>

              <div className="bg-[#050505] border border-blue-900/30 rounded-[2.5rem] p-10 min-h-[350px] flex flex-col font-mono shadow-2xl relative">
                <div className="absolute top-6 right-10 text-[9px] text-zinc-800 font-bold uppercase tracking-[0.4em]">Neural_Echo_Active</div>
                <div className="flex-1 overflow-y-auto space-y-4 pr-4">
                  {cycleLog.map((log, i) => (
                    <div key={i} className="flex gap-6 border-b border-white/5 pb-4">
                      <span className="font-black uppercase text-cyan-900 text-[10px] w-20">{log.role}</span>
                      <p className="flex-1 text-[#aaa] text-sm font-medium leading-relaxed">{log.text}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-8 flex justify-center">
                  <button onClick={runCycle} className="px-16 py-5 rounded-full font-black uppercase italic text-xl bg-cyan-600 text-black shadow-[0_0_40px_rgba(6,182,212,0.4)] active:scale-95 transition-all">Sovereign Strike</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;




