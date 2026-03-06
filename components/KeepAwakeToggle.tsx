
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
        <div className="flex items-center space-x-2">
             <span className={`text-[10px] font-mono tracking-widest uppercase transition-colors ${isAwake ? 'text-amber-400' : 'text-slate-500'}`}>
                STASIS_FIELD
            </span>
            <button
                onClick={() => setIsAwake(!isAwake)}
                type="button"
                className={`alien-switch ${isAwake ? 'active' : ''}`}
                aria-checked={isAwake}
                title={isAwake ? 'Deactivate: Allow browser to suspend tab' : 'Activate: Prevent browser from suspending tab'}
            >
                <div className="alien-switch-thumb flex items-center justify-center">
                    <HeartbeatIcon className={`h-2.5 w-2.5 ${isAwake ? 'text-black animate-pulse' : 'text-slate-300'}`} />
                </div>
            </button>
        </div>
    );
};

export default KeepAwakeToggle;
