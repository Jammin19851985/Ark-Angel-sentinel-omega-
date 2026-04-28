
import React, { useState, useEffect, useRef } from 'react';
import { HeartbeatIcon } from './icons/HeartbeatIcon';

// A tiny, silent WAV file encoded in Base64. This is used to keep the browser tab active.
const SILENT_AUDIO_DATA_URI = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';


const KeepAwakeToggle: React.FC = () => {
    const [isAwake, setIsAwake] = useState(true);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        if (!audioRef.current) {
            audioRef.current = new Audio(SILENT_AUDIO_DATA_URI);
            audioRef.current.loop = true;
        }

        if (isAwake) {
            // The play() method returns a promise which can be rejected if the user hasn't interacted with the page yet.
            audioRef.current.play().catch(e => console.warn("Keep Awake audio failed to play:", e));
        } else {
            audioRef.current.pause();
        }
    }, [isAwake]);

    return (
        <div className="flex items-center space-x-3">
             <span className={`text-sm font-medium transition-colors ${isAwake ? 'text-amber-400' : 'text-slate-400'}`}>
                Keep Awake
            </span>
            <button
                onClick={() => setIsAwake(!isAwake)}
                type="button"
                className={`${
                isAwake ? 'bg-amber-600' : 'bg-slate-700'
                } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-slate-900`}
                role="switch"
                aria-checked={isAwake}
                aria-label={isAwake ? 'Deactivate Keep Awake' : 'Activate Keep Awake'}
                title={isAwake ? 'Deactivate: Allow browser to suspend tab' : 'Activate: Prevent browser from suspending tab'}
            >
                <span
                    aria-hidden="true"
                    className={`${isAwake ? 'translate-x-5' : 'translate-x-0'}
                    pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out flex items-center justify-center`}
                >
                    <HeartbeatIcon className={`h-3 w-3 transition-colors ${isAwake ? 'text-amber-600' : 'text-slate-500'}`} />
                </span>
            </button>
        </div>
    );
};

export default KeepAwakeToggle;