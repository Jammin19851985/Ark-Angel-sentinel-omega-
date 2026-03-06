
import React from 'react';
import { UnlockedLockIcon } from './icons/UnlockedLockIcon';
import { ShieldIcon } from './icons/ShieldIcon';

interface GodModeToggleProps {
    isGodMode: boolean;
    setIsGodMode: (isGodMode: boolean) => void;
    isLoading: boolean;
}

const GodModeToggle: React.FC<GodModeToggleProps> = ({ isGodMode, setIsGodMode, isLoading }) => {
    const toggleGodMode = () => {
        if (!isLoading) {
            setIsGodMode(!isGodMode);
        }
    };

    return (
        <div className="flex items-center space-x-3 group">
             <span className={`text-[10px] font-mono font-bold tracking-widest uppercase transition-colors ${isGodMode ? 'text-amber-400 glow-text-gold' : 'text-slate-500'}`}>
                {isGodMode ? 'GOD_MODE // ACTIVE' : 'SAFE_MODE'}
            </span>
            <button
                onClick={toggleGodMode}
                disabled={isLoading}
                type="button"
                className={`alien-switch ${isGodMode ? 'active-god' : ''} disabled:opacity-50`}
                aria-checked={isGodMode}
                aria-label={isGodMode ? 'Deactivate God Mode' : 'Activate God Mode'}
            >
                <div className="alien-switch-thumb flex items-center justify-center">
                    {isGodMode ? (
                        <UnlockedLockIcon className="w-2.5 h-2.5 text-black animate-pulse" />
                    ) : (
                        <ShieldIcon className="w-2.5 h-2.5 text-slate-300" />
                    )}
                </div>
            </button>
        </div>
    );
};

export default GodModeToggle;
