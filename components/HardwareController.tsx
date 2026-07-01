
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { CpuChipIcon } from './icons/CpuChipIcon';
import { ShieldCheckIcon } from './icons/ShieldCheckIcon';
import { KeyIcon } from './icons/KeyIcon';
import Loader from './Loader';

const HardwareController: React.FC = () => {
    const { coreState, signDevice, attestHardware, addLog, reorderHardwareDevices } = useAppContext();
    const { hardwareDevices, hardwareSignedDevices, hardwareQuorumRequired, killSwitchActive } = coreState;
    const [isProcessing, setIsProcessing] = useState<string | null>(null);
    const [draggingIdx, setDraggingIdx] = useState<number | null>(null);
    const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);
    const [utilizations, setUtilizations] = useState<Record<string, number>>({});
    const [expandedDevices, setExpandedDevices] = useState<Record<string, boolean>>({});

    useEffect(() => {
        const interval = setInterval(() => {
            setUtilizations(prev => {
                const next = { ...prev };
                hardwareDevices.forEach(d => {
                    const current = next[d.id] || 30;
                    const change = (Math.random() * 40) - 20; // -20 to +20
                    next[d.id] = Math.max(10, Math.min(95, current + change));
                });
                return next;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [hardwareDevices]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.altKey && !isNaN(Number(e.key))) {
                const num = Number(e.key);
                if (num > 0 && num <= hardwareDevices.length) {
                    e.preventDefault();
                    const deviceId = hardwareDevices[num - 1].id;
                    setExpandedDevices(prev => ({
                        ...prev,
                        [deviceId]: !prev[deviceId]
                    }));
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [hardwareDevices]);

    const handleDragStart = (e: React.DragEvent, index: number) => {
        setDraggingIdx(index);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', index.toString());
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        if (dragOverIdx !== index) {
            setDragOverIdx(index);
        }
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOverIdx(null);
    };

    const handleDrop = (e: React.DragEvent, dropIndex: number) => {
        e.preventDefault();
        setDragOverIdx(null);
        if (draggingIdx !== null && draggingIdx !== dropIndex) {
            reorderHardwareDevices(draggingIdx, dropIndex);
        }
        setDraggingIdx(null);
    };

    const handleAttest = async (deviceId: string) => {
        setIsProcessing(`ATTEST_${deviceId}`);
        addLog('HARDWARE', `Initiating forensic attestation for device: ${deviceId}`);
        await attestHardware(deviceId);
        setIsProcessing(null);
    };

    const handleSign = async (deviceId: string) => {
        setIsProcessing(`SIGN_${deviceId}`);
        addLog('HARDWARE', `Sending nonce challenge to ${deviceId}...`);
        await signDevice(deviceId);
        setIsProcessing(null);
    };

    return (
        <div className="bg-black/60 backdrop-blur-md border border-slate-800 rounded-lg p-3 font-mono flex flex-col space-y-2 relative overflow-hidden group tech-panel shrink-0">
            {/* Background scanner line effect */}
            <div className="absolute top-0 left-0 w-full h-[1px] bg-neon-green/20 animate-scan pointer-events-none" />

            <div className="flex justify-between items-center border-b border-white/5 pb-1">
                <h3 className="text-[10px] font-bold text-neon-green uppercase tracking-widest flex items-center gap-2">
                    <CpuChipIcon className="w-3 h-3 animate-pulse text-neon-pink" /> // HARDWARE_AUTH
                </h3>
                <div className="flex flex-col items-end">
                    <div className="text-[9px] text-slate-500">
                        QUORUM: <span className={hardwareSignedDevices.length >= hardwareQuorumRequired ? 'text-neon-green' : 'text-red-500'}>
                            {hardwareSignedDevices.length}/{hardwareQuorumRequired}
                        </span>
                    </div>
                </div>
            </div>

            <div className="space-y-2">
                {hardwareDevices.map((device, index) => {
                    const isSigned = hardwareSignedDevices.includes(device.id);
                    const isTampered = device.status === 'TAMPERED';
                    const processingAction = isProcessing && isProcessing.endsWith(device.id);
                    const isDragging = draggingIdx === index;
                    const isDragOver = dragOverIdx === index;
                    const util = utilizations[device.id] || 30;

                    return (
                        <div 
                            key={device.id} 
                            draggable
                            onDragStart={(e) => handleDragStart(e, index)}
                            onDragOver={(e) => handleDragOver(e, index)}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => handleDrop(e, index)}
                            className={`p-2 rounded border transition-all duration-300 relative overflow-hidden cursor-grab active:cursor-grabbing hover:scale-[1.02] hover:z-20
                                ${isTampered ? 'bg-red-950/20 border-red-500 shadow-[0_0_15px_rgba(255,0,0,0.2)] hover:shadow-[0_0_20px_rgba(255,0,0,0.4)]' : util > 90 ? 'bg-red-950/30 border-red-500 animate-pulse shadow-[0_0_15px_rgba(255,0,0,0.5)] hover:shadow-[0_0_20px_rgba(255,0,0,0.6)]' : 'bg-black/40 border-slate-700 hover:border-neon-pink hover:shadow-[0_0_15px_rgba(255,0,255,0.3)]'}
                                ${isDragging ? 'opacity-40 border-dashed border-slate-500' : ''}
                                ${isDragOver ? 'border-neon-green/80 bg-neon-green/10' : ''}
                            `}
                        >
                            {isSigned && <div className="absolute inset-0 bg-neon-green/5 pointer-events-none"></div>}
                            {!isTampered && (
                                <div 
                                    className="absolute inset-0 pointer-events-none transition-all duration-1000 ease-in-out mix-blend-screen"
                                    style={{
                                        background: `radial-gradient(circle at center, rgba(0,255,170,${util / 100 * 0.15}) 0%, transparent 70%)`,
                                        opacity: util / 100
                                    }}
                                />
                            )}
                            
                            <div className="flex justify-between items-start mb-1 relative z-10">
                                <div>
                                    <div className={`text-[9px] font-bold ${isTampered ? 'text-red-400' : 'text-slate-100'}`}>{device.id}</div>
                                    <div className="text-[8px] text-slate-500 uppercase tracking-tighter">
                                        {device.type} <span className="text-slate-700 mx-1">|</span> FW: {device.firmwareVersion}
                                    </div>
                                </div>
                                <div className={`text-[7px] font-bold px-1 py-0.5 rounded border ${isTampered ? 'bg-red-600 border-red-400 text-white animate-pulse' : 'bg-slate-900 border-slate-700 text-slate-400'}`}>
                                    {device.status}
                                </div>
                            </div>

                            <div className="mt-1.5 mb-2 relative z-10">
                                <div className="flex justify-between text-[7px] text-slate-500 mb-0.5">
                                    <span>UTILIZATION</span>
                                    <span>{Math.round(util)}%</span>
                                </div>
                                <div className="h-1 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                                    <div 
                                        className={`h-full transition-all duration-1000 ease-in-out ${util > 80 ? 'bg-red-500' : util > 60 ? 'bg-amber-500' : 'bg-neon-green'}`}
                                        style={{ width: `${util}%` }}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-center mt-1 relative z-10">
                                <button 
                                    onClick={() => setExpandedDevices(prev => ({ ...prev, [device.id]: !prev[device.id] }))}
                                    className="text-[7px] text-slate-500 hover:text-neon-pink uppercase tracking-widest transition-colors flex items-center gap-1"
                                >
                                    {expandedDevices[device.id] ? 'HIDE DETAILS ▲' : 'SHOW DETAILS ▼'}
                                </button>
                            </div>

                            {expandedDevices[device.id] && (
                                <div className="mt-1.5 p-1.5 bg-black/50 border border-slate-800 rounded text-[8px] text-slate-400 space-y-1 relative z-10">
                                    <div className="flex justify-between">
                                        <span className="text-slate-600">TEMP:</span>
                                        <span className={util > 80 ? 'text-red-400' : util > 60 ? 'text-amber-400' : 'text-neon-green'}>
                                            {Math.round(35 + util * 0.45)}°C
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-600">SERIAL:</span>
                                        <span className="font-mono">SN-{device.id.replace(/[^A-Z0-9]/g, '').substring(0, 8)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-600">FIRMWARE:</span>
                                        <span className="text-slate-300">{device.firmwareVersion}</span>
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-1 mt-2 relative z-10">
                                <button 
                                    onClick={() => handleAttest(device.id)}
                                    disabled={!!isProcessing || isTampered || killSwitchActive}
                                    className="flex items-center justify-center gap-1 py-1 rounded bg-slate-900 border border-slate-700 hover:border-neon-green hover:text-neon-green hover:bg-black text-[8px] font-bold text-slate-300 transition-all disabled:opacity-30 disabled:cursor-not-allowed group/btn"
                                >
                                    {isProcessing === `ATTEST_${device.id}` ? <Loader /> : <ShieldCheckIcon className="w-2.5 h-2.5 group-hover/btn:text-neon-green" />}
                                    ATTEST
                                </button>
                                <button 
                                    onClick={() => handleSign(device.id)}
                                    disabled={!!isProcessing || isTampered || isSigned || killSwitchActive}
                                    className={`flex items-center justify-center gap-1 py-1 rounded border text-[8px] font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed group/btn ${isSigned ? 'bg-green-950/30 border-green-500 text-green-400' : 'bg-slate-900 border-slate-700 hover:border-neon-pink hover:text-neon-pink hover:bg-black text-slate-300'}`}
                                >
                                    {isProcessing === `SIGN_${device.id}` ? <Loader /> : <KeyIcon className="w-2.5 h-2.5 group-hover/btn:text-neon-pink" />}
                                    {isSigned ? 'VERIFIED' : 'SIGN'}
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default HardwareController;
