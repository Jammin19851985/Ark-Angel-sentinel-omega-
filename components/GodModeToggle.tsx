
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
        <div className="flex items-center space-x-3">
             <span className={`text-sm font-medium transition-colors ${isGodMode ? 'text-amber-400' : 'text-slate-400'}`}>
                {isGodMode ? 'God Mode' : 'Safe Mode'}
            </span>
            <button
                onClick={toggleGodMode}
                disabled={isLoading}
                type="button"
                className={`${
                isGodMode ? 'god-mode-toggle-active' : 'bg-slate-700'
                } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50`}
                role="switch"
                aria-checked={isGodMode}
                aria-label={isGodMode ? 'Deactivate God Mode' : 'Activate God Mode'}
            >
                <span
                    aria-hidden="true"
                    className={`${isGodMode ? 'translate-x-5' : 'translate-x-0'}
                    pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                >
                     <span
                        className={`${
                        isGodMode ? 'opacity-0 duration-100 ease-out' : 'opacity-100 duration-200 ease-in'
                        } absolute inset-0 flex h-full w-full items-center justify-center transition-opacity`}
                        aria-hidden="true"
                    >
                         <ShieldIcon className="h-3 w-3 text-slate-500 toggle-icon" />
                    </span>
                    <span
                        className={`${
                        isGodMode ? 'opacity-100 duration-200 ease-in' : 'opacity-0 duration-100 ease-out'
                        } absolute inset-0 flex h-full w-full items-center justify-center transition-opacity`}
                        aria-hidden="true"
                    >
                         <UnlockedLockIcon className="h-3 w-3 text-amber-300 toggle-icon" />
                    </span>
                </span>
            </button>
        </div>
    );
};

export default GodModeToggle;