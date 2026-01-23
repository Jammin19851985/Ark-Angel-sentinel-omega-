
import React, { useState, useEffect, useRef } from 'react';
import { ActivityIcon } from './icons/ActivityIcon';

const MAX_HISTORY = 30;

const SystemMonitor: React.FC = () => {
    const [cpuLoad, setCpuLoad] = useState<number[]>([45, 30, 60, 20]);
    const [memoryUsage, setMemoryUsage] = useState(64);
    const [netHistory, setNetHistory] = useState<number[]>(new Array(MAX_HISTORY).fill(10));
    
    useEffect(() => {
        const interval = setInterval(() => {
            // Simulate CPU fluctuations for 4 cores
            setCpuLoad(prev => prev.map(load => {
                const change = (Math.random() - 0.5) * 20;
                return Math.max(5, Math.min(99, load + change));
            }));

            // Simulate Memory fluctuation
            setMemoryUsage(prev => Math.max(40, Math.min(95, prev + (Math.random() - 0.5) * 5)));

            // Simulate Network Traffic (Subspace I/O)
            setNetHistory(prev => {
                const newPoint = Math.max(5, Math.min(100, prev[prev.length - 1] + (Math.random() - 0.5) * 40));
                return [...prev.slice(1), newPoint];
            });

        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const renderNetChart = () => {
        const points = netHistory.map((val, i) => {
            const x = (i / (MAX_HISTORY - 1)) * 100;
            const y = 100 - val;
            return `${x},${y}`;
        }).join(' ');

        return (
            <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                <defs>
                    <linearGradient id="net-gradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.5" />
                        <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
                    </linearGradient>
                </defs>
                <path d={`M0,100 ${points} L100,100 Z`} fill="url(#net-gradient)" />
                <polyline points={points} fill="none" stroke="#22d3ee" strokeWidth="2" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
            </svg>
        );
    };

    return (
        <div className="bg-black/40 border border-slate-800 rounded-sm p-3 font-mono flex flex-col space-y-3 relative overflow-hidden group hover:border-cyan-500/30 transition-colors duration-500">
            {/* Header */}
            <div className="flex justify-between items-center border-b border-white/5 pb-1 mb-1">
                <h3 className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-2">
                    <ActivityIcon className="w-3 h-3 text-cyan-500" />
                    System_Monitor
                </h3>
                <span className="text-[8px] text-slate-500 font-bold bg-slate-900 px-1 rounded">UPTIME: 99.9%</span>
            </div>

            {/* CPU Cores */}
            <div className="space-y-1">
                <div className="flex justify-between text-[8px] text-slate-500 uppercase">
                    <span>Neural Cores (4x)</span>
                    <span className="text-amber-500">{(cpuLoad.reduce((a, b) => a + b, 0) / 4).toFixed(0)}% AVG</span>
                </div>
                <div className="flex gap-1 h-8">
                    {cpuLoad.map((load, i) => (
                        <div key={i} className="flex-1 bg-slate-900 rounded-sm relative overflow-hidden flex flex-col justify-end">
                            <div 
                                className="w-full bg-amber-500/80 transition-all duration-500 ease-out"
                                style={{ height: `${load}%` }}
                            />
                            {/* Scanline overlay for bar */}
                            <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.5)_50%)] bg-[length:100%_2px] pointer-events-none opacity-50"></div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Memory */}
            <div className="space-y-1">
                <div className="flex justify-between text-[8px] text-slate-500 uppercase">
                    <span>Q-RAM Heap</span>
                    <span className="text-violet-400">{memoryUsage.toFixed(1)} TB / 128 TB</span>
                </div>
                <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden flex">
                    <div 
                        className="h-full bg-violet-500 shadow-[0_0_5px_#8b5cf6] transition-all duration-700 ease-out"
                        style={{ width: `${memoryUsage}%` }}
                    />
                </div>
            </div>

            {/* Network */}
            <div className="space-y-1 flex-1 min-h-[40px] flex flex-col">
                <div className="flex justify-between text-[8px] text-slate-500 uppercase">
                    <span>Subspace I/O</span>
                    <span className="text-cyan-400 animate-pulse">{(netHistory[netHistory.length-1] * 0.8).toFixed(1)} Tbps</span>
                </div>
                <div className="flex-1 bg-slate-900/30 border border-white/5 rounded-sm relative overflow-hidden">
                    <div className="absolute inset-0 p-0.5 opacity-80">
                        {renderNetChart()}
                    </div>
                    {/* Grid overlay */}
                    <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[length:10px_10px] pointer-events-none"></div>
                </div>
            </div>
        </div>
    );
};

export default SystemMonitor;
