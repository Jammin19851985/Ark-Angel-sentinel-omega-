
import React, { useState } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { CpuChipIcon } from './icons/CpuChipIcon';
import { ShieldCheckIcon } from './icons/ShieldCheckIcon';
import { KeyIcon } from './icons/KeyIcon';
import Loader from './Loader';

const HardwareController: React.FC = () => {
    const { coreState, signDevice, attestHardware, addLog } = useAppContext();
    const { hardwareDevices, hardwareSignedDevices, hardwareQuorumRequired, killSwitchActive } = coreState;
    const [isProcessing, setIsProcessing] = useState<string | null>(null);

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
                {hardwareDevices.map(device => {
                    const isSigned = hardwareSignedDevices.includes(device.id);
                    const isTampered = device.status === 'TAMPERED';
                    const processingAction = isProcessing && isProcessing.endsWith(device.id);

                    return (
                        <div key={device.id} className={`p-2 rounded border transition-all duration-500 relative overflow-hidden ${isTampered ? 'bg-red-950/20 border-red-500 shadow-[0_0_15px_rgba(255,0,0,0.2)]' : 'bg-black/40 border-slate-700 hover:border-neon-pink/50'}`}>
                            {isSigned && <div className="absolute inset-0 bg-neon-green/5 pointer-events-none"></div>}
                            
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
