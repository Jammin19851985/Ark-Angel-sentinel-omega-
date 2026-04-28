import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Wallet, ArrowUpRight, BarChart2 } from 'lucide-react';

const PortfolioDashboard = () => {
  const [totalValue, setTotalValue] = useState(0);
  const [assets] = useState([
    { symbol: 'BTC', amount: 2.5, broker: 'Kraken_Global', value: 165000, pnl: '+12.5%', trend: 'up' },
    { symbol: 'ETH', amount: 15.2, broker: 'Coinbase_Adv', value: 45000, pnl: '+8.2%', trend: 'up' },
    { symbol: 'AAPL', amount: 100, broker: 'IBKR_Pro', value: 18000, pnl: '-1.5%', trend: 'down' },
    { symbol: 'NQ_FUT', amount: 10, broker: 'Archangel_Vault', value: 850000, pnl: '+4.2%', trend: 'up' }
  ]);

  useEffect(() => {
    const total = assets.reduce((sum, asset) => sum + asset.value, 0);
    setTotalValue(total);
  }, [assets]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* HEADER SECTION */}
      <div className="bg-[#1e1f20] border border-[#3c4043] rounded-3xl p-8 shadow-xl flex justify-between items-end relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
          <Wallet size={120} />
        </div>
        <div className="relative z-10">
          <h2 className="text-3xl font-light text-white tracking-tight mb-2">Master Enterprise Portfolio</h2>
          <p className="text-blue-400 text-sm font-medium uppercase tracking-widest flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e]"></div>
            Unified Sovereign Net Asset Value
          </p>
        </div>
        <div className="text-right relative z-10">
          <p className="text-[10px] text-[#9aa0a6] font-bold uppercase tracking-[0.2em] mb-1">Portfolio Valuation</p>
          <div className="text-6xl font-light text-white font-mono tracking-tighter">
            <span className="text-green-400 opacity-50 mr-2">$</span>
            {totalValue.toLocaleString()}
          </div>
        </div>
      </div>

      {/* QUICK STATS */}
      <div className="grid grid-cols-4 gap-6">
        {[
          { label: 'Kraken Global', val: '$165,000', color: 'blue' },
          { label: 'Coinbase Advanced', val: '$45,000', color: 'blue' },
          { label: 'IBKR Pro', val: '$18,000', color: 'blue' },
          { label: 'Sovereign Vault', val: '$850,000', color: 'purple' }
        ].map((stat, i) => (
          <div key={stat.label} className="bg-[#1e1f20] border border-[#3c4043] rounded-2xl p-6 shadow-md transition-all hover:border-[#5f6368] group">
            <p className="text-[10px] text-[#9aa0a6] font-bold uppercase tracking-wider mb-2">{stat.label}</p>
            <p className={`text-2xl font-mono text-white group-hover:text-${stat.color}-400 transition-colors`}>{stat.val}</p>
          </div>
        ))}
      </div>

      {/* ASSETS TABLE */}
      <div className="bg-[#131314] border border-[#3c4043] rounded-3xl overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-[#3c4043] flex items-center justify-between bg-[#1e1f20]">
          <h3 className="text-sm font-bold text-[#e3e3e3] uppercase tracking-widest flex items-center gap-2">
            <BarChart2 size={16} className="text-blue-400"/> Asset Allocations
          </h3>
          <button className="text-[10px] text-blue-400 font-bold uppercase tracking-wider hover:underline">View All Positions</button>
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-[10px] text-[#9aa0a6] font-bold uppercase tracking-widest border-b border-[#3c4043] bg-[#1e1f20]/50">
              <th className="p-5 font-bold">Asset Instance</th>
              <th className="p-5 font-bold">Broker Bridge</th>
              <th className="p-5 font-bold">Position Size</th>
              <th className="p-5 font-bold text-right">Value (USD)</th>
              <th className="p-5 font-bold text-right">Performance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#3c4043]/50">
            {assets.map((asset, idx) => (
              <tr key={idx} className="hover:bg-[#1e1f20] transition-all group">
                <td className="p-5">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#1e1f20] border border-[#3c4043] flex items-center justify-center text-blue-400 font-bold text-sm shadow-inner group-hover:border-blue-500/50 transition-colors">
                      {asset.symbol[0]}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white font-mono">{asset.symbol}</div>
                      <div className="text-[10px] text-[#9aa0a6] uppercase font-mono">Instance_{idx + 100}</div>
                    </div>
                  </div>
                </td>
                <td className="p-5">
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#1e1f20] border border-[#3c4043] text-[10px] text-[#bdc1c6] font-mono">
                    <div className="w-1 h-1 rounded-full bg-blue-500"></div>
                    {asset.broker}
                  </div>
                </td>
                <td className="p-5 text-sm font-mono text-[#e3e3e3]">{asset.amount}</td>
                <td className="p-5 text-right text-sm font-bold font-mono text-white">${asset.value.toLocaleString()}</td>
                <td className="p-5 text-right">
                  <div className={`inline-flex items-center gap-1.5 font-mono font-bold text-xs ${asset.trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
                    {asset.trend === 'up' ? <ArrowUpRight size={14}/> : <TrendingDown size={14}/>}
                    {asset.pnl}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PortfolioDashboard;
