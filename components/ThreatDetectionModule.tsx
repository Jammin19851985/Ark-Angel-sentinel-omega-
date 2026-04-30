
import React, { useState, useEffect, useMemo } from 'react';
import { ShieldAlertIcon } from './icons/ShieldAlertIcon';
import { NetworkIcon } from './icons/NetworkIcon';
import { TerminalIcon } from './icons/TerminalIcon';
import Loader from './Loader';

interface TrafficPacket {
    id: string;
    timestamp: string;
    source: string;
    destination: string;
    protocol: 'TCP' | 'UDP' | 'HTTP' | 'HTTPS';
    size: number;
    status: 'CLEAN' | 'SUSPICIOUS' | 'MALICIOUS';
    signature?: string;
}

const MALICIOUS_SIGNATURES = [
    { pattern: 'SYN_FLOOD', description: 'Rapid sequence of SYN packets without ACK' },
    { pattern: 'SQL_INJECT', description: 'Common SQL injection characters in payload' },
    { pattern: 'BRUTE_FORCE', description: 'Multiple failed login attempts from single IP' },
    { pattern: 'XSS_PAYLOAD', description: 'Script tags detected in HTTP request' },
    { pattern: 'PORT_SCAN', description: 'Sequential port connection attempts' },
];

const ThreatDetectionModule: React.FC = () => {
    const [traffic, setTraffic] = useState<TrafficPacket[]>([]);
    const [isScanning, setIsScanning] = useState(true);
    const [threatLevel, setThreatLevel] = useState(15); // 0-100

    useEffect(() => {
        const interval = setInterval(() => {
            if (!isScanning) return;

            const newPacket: TrafficPacket = {
                id: Math.random().toString(36).substring(2, 9).toUpperCase(),
                timestamp: new Date().toLocaleTimeString(),
                source: `192.168.1.${Math.floor(Math.random() * 255)}`,
                destination: `10.0.0.${Math.floor(Math.random() * 255)}`,
                protocol: ['TCP', 'UDP', 'HTTP', 'HTTPS'][Math.floor(Math.random() * 4)] as any,
                size: Math.floor(Math.random() * 1500),
                status: 'CLEAN'
            };

            // Randomly inject malicious traffic
            if (Math.random() > 0.85) {
                const sig = MALICIOUS_SIGNATURES[Math.floor(Math.random() * MALICIOUS_SIGNATURES.length)];
                newPacket.status = Math.random() > 0.5 ? 'MALICIOUS' : 'SUSPICIOUS';
                newPacket.signature = sig.pattern;
                
                setThreatLevel(prev => Math.min(100, prev + (newPacket.status === 'MALICIOUS' ? 10 : 5)));
            } else {
                setThreatLevel(prev => Math.max(5, prev - 1));
            }

            setTraffic(prev => [newPacket, ...prev].slice(0, 20));
        }, 1500);

        return () => clearInterval(interval);
    }, [isScanning]);

    const threatColor = useMemo(() => {
        if (threatLevel > 70) return 'text-red-500';
        if (threatLevel > 30) return 'text-amber-500';
        return 'text-emerald-500';
    }, [threatLevel]);

    const threatBg = useMemo(() => {
        if (threatLevel > 70) return 'bg-red-500/20 border-red-500/50';
        if (threatLevel > 30) return 'bg-amber-500/20 border-amber-500/50';
        return 'bg-emerald-500/20 border-emerald-500/50';
    }, [threatLevel]);

    return (
        <div className="flex flex-col h-full font-mono text-[11px] animate-fade-in-fast">
            <div className={`p-3 rounded border mb-4 transition-colors duration-500 ${threatBg}`}>
                <div className="flex justify-between items-center mb-2">
                    <span className="font-bold uppercase tracking-widest flex items-center gap-2">
                        <ShieldAlertIcon className={`w-4 h-4 ${threatColor}`} />
                        Intrusion Confidence
                    </span>
                    <span className={`text-lg font-bold ${threatColor}`}>{threatLevel}%</span>
                </div>
                <div className="w-full bg-black/40 rounded-full h-1.5 overflow-hidden">
                    <div 
                        className={`h-full transition-all duration-500 ${threatLevel > 70 ? 'bg-red-500' : threatLevel > 30 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                        style={{ width: `${threatLevel}%` }}
                    ></div>
                </div>
            </div>

            <div className="flex justify-between items-center mb-2 px-1">
                <h4 className="text-slate-400 font-bold uppercase tracking-widest flex items-center gap-2">
                    <NetworkIcon className="w-3 h-3 text-cyan-400" />
                    Live Traffic Stream
                </h4>
                <button 
                    onClick={() => setIsScanning(!isScanning)}
                    className={`px-2 py-0.5 rounded text-[9px] border transition-all ${isScanning ? 'bg-cyan-900 border-cyan-500 text-cyan-300' : 'bg-black border-slate-700 text-slate-500'}`}
                >
                    {isScanning ? 'SCANNING' : 'PAUSED'}
                </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar pr-1">
                {traffic.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-32 opacity-30">
                        <Loader />
                        <span className="mt-2">INITIALIZING SENSORS...</span>
                    </div>
                ) : (
                    traffic.map(packet => (
                        <div 
                            key={packet.id} 
                            className={`p-2 rounded border bg-black/40 transition-all ${
                                packet.status === 'MALICIOUS' ? 'border-red-500/50 bg-red-950/10' : 
                                packet.status === 'SUSPICIOUS' ? 'border-amber-500/50 bg-amber-950/10' : 
                                'border-slate-800 hover:border-slate-700'
                            }`}
                        >
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-slate-500 font-bold">#{packet.id}</span>
                                <span className={`px-1.5 py-0.5 rounded-[2px] text-[8px] font-bold ${
                                    packet.status === 'MALICIOUS' ? 'bg-red-600 text-white' : 
                                    packet.status === 'SUSPICIOUS' ? 'bg-amber-600 text-black' : 
                                    'bg-slate-800 text-slate-400'
                                }`}>
                                    {packet.status}
                                </span>
                            </div>
                            <div className="grid grid-cols-2 gap-x-2 text-[9px]">
                                <div className="truncate"><span className="text-slate-600">SRC:</span> {packet.source}</div>
                                <div className="truncate"><span className="text-slate-600">DST:</span> {packet.destination}</div>
                                <div><span className="text-slate-600">PRO:</span> {packet.protocol}</div>
                                <div><span className="text-slate-600">LEN:</span> {packet.size}B</div>
                            </div>
                            {packet.signature && (
                                <div className="mt-1 pt-1 border-t border-white/5 text-[8px] text-amber-400 flex items-center gap-1">
                                    <TerminalIcon className="w-2.5 h-2.5" />
                                    SIG_MATCH: {packet.signature}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            <div className="mt-4 p-3 bg-black/60 border border-slate-800 rounded">
                <h4 className="text-[9px] font-bold text-slate-500 uppercase mb-2 tracking-widest">Signature Database</h4>
                <div className="space-y-1.5">
                    {MALICIOUS_SIGNATURES.slice(0, 3).map(sig => (
                        <div key={sig.pattern} className="flex flex-col">
                            <span className="text-cyan-500 font-bold text-[8px]">{sig.pattern}</span>
                            <span className="text-slate-600 text-[8px] leading-tight">{sig.description}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ThreatDetectionModule;
