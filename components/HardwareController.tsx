
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
        <div className="bg-black/60 backdrop-blur-md border border-slate-800 rounded-lg p-4 font-mono flex flex-col space-y-4 relative overflow-hidden group">
            {/* Background scanner line effect */}
            <div className="absolute top-0 left-0 w-full h-[1px] bg-amber-500/10 animate-scan pointer-events-none" />

            <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <h3 className="text-xs font-bold text-amber-500 uppercase tracking-widest flex items-center gap-2">
                    <CpuChipIcon className="w-4 h-4 animate-pulse" /> // HARDWARE_AUTHORITY
                </h3>
                <div className="flex flex-col items-end">
                    <div className="text-[10px] text-slate-500">
                        QUORUM: <span className={hardwareSignedDevices.length >= hardwareQuorumRequired ? 'text-green-400' : 'text-red-400'}>
                            {hardwareSignedDevices.length}/{hardwareQuorumRequired}
                        </span>
                    </div>
                </div>
            </div>

            <div className="space-y-3">
                {hardwareDevices.map(device => {
                    const isSigned = hardwareSignedDevices.includes(device.id);
                    const isTampered = device.status === 'TAMPERED';
                    // Correctly check processing state by comparing strings
                    const processingAction = isProcessing && isProcessing.endsWith(device.id);

                    return (
                        <div key={device.id} className={`p-3 rounded border transition-all duration-500 ${isTampered ? 'bg-red-950/20 border-red-500 shadow-[0_0_15px_rgba(255,0,0,0.2)]' : 'bg-black/40 border-slate-700 hover:border-slate-500'}`}>
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <div className={`text-[10px] font-bold ${isTampered ? 'text-red-400' : 'text-slate-100'}`}>{device.id}</div>
                                    <div className="text-[8px] text-slate-500 uppercase tracking-tighter">
                                        {device.type} <span className="text-slate-700 mx-1">|</span> FW: {device.firmwareVersion}
                                    </div>
                                </div>
                                <div className={`text-[8px] font-bold px-1.5 py-0.5 rounded border ${isTampered ? 'bg-red-600 border-red-400 text-white animate-pulse' : 'bg-slate-800 border-slate-700 text-slate-400'}`}>
                                    {device.status}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 mt-3">
                                <button 
                                    onClick={() => handleAttest(device.id)}
                                    disabled={!!isProcessing || isTampered || killSwitchActive}
                                    className="flex items-center justify-center gap-1.5 py-1.5 rounded bg-slate-900 border border-slate-700 hover:border-cyan-500 hover:bg-slate-800 text-[9px] font-bold text-slate-300 transition-all disabled:opacity-30 disabled:cursor-not-allowed group/btn"
                                >
                                    {isProcessing === `ATTEST_${device.id}` ? <Loader /> : <ShieldCheckIcon className="w-3 h-3 group-hover/btn:text-cyan-400" />}
                                    ATTEST
                                </button>
                                <button 
                                    onClick={() => handleSign(device.id)}
                                    disabled={!!isProcessing || isTampered || isSigned || killSwitchActive}
                                    className={`flex items-center justify-center gap-1.5 py-1.5 rounded border text-[9px] font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed group/btn ${isSigned ? 'bg-green-950/30 border-green-500 text-green-400' : 'bg-slate-900 border-slate-700 hover:border-amber-500 hover:bg-slate-800 text-slate-300'}`}
                                >
                                    {isProcessing === `SIGN_${device.id}` ? <Loader /> : <KeyIcon className="w-3 h-3 group-hover/btn:text-amber-400" />}
                                    {isSigned ? 'VERIFIED' : 'SIGN_CHALLENGE'}
                                </button>
                            </div>
                            
                            {isTampered && (
                                <div className="mt-2 text-[8px] text-red-500 font-bold animate-pulse text-center uppercase tracking-widest border border-red-900/50 p-1 rounded bg-red-950/30">
                                    {'>> SECURITY ENCLOSURE COMPROMISED. AUTHORITY REVOKED.'}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
            
            <div className="pt-2 flex justify-between items-center text-[8px] text-slate-700 uppercase font-mono border-t border-white/5">
                <span>FIPS-140-3 SECURITY: L3</span>
                <span>DEVICE_ID_ATTEST: ACTIVE</span>
            </div>
        </div>
    );
};

export default HardwareController;
