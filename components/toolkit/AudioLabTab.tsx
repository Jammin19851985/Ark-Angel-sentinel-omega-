
import React, { useState } from 'react';
import { useLiveAudio } from '../../hooks/useLiveAudio';
import { generateSpeech } from '../../services/geminiService';
import Loader from '../Loader';
import { MicrophoneIcon } from '../icons/MicrophoneIcon';
import { StopCircleIcon } from '../icons/StopCircleIcon';
import { useAppContext } from '../../contexts/AppContext';

interface AudioLabTabProps {}

type Mode = 'live' | 'transcribe' | 'tts';

const VOICES = ['Kore', 'Puck', 'Zephyr', 'Charon', 'Fenrir'];

const AudioLabTab: React.FC<AudioLabTabProps> = () => {
    const { addLog } = useAppContext();
    const [ttsText, setTtsText] = useState('');
    const [selectedVoice, setSelectedVoice] = useState('Kore');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [mode, setMode] = useState<Mode>('live');

    const {
        isSessionActive,
        startSession,
        closeSession,
        transcriptionHistory,
        currentInterimTranscription,
        error: liveError,
    } = useLiveAudio({ addLog });

    const handleTtsSubmit = async () => {
        if (!ttsText.trim() || isLoading) return;
        setIsLoading(true);
        setError(null);
        try {
            addLog('AI_TOOLKIT', `TTS generation started for: "${ttsText}" with voice ${selectedVoice}`);
            const audioBuffer = await generateSpeech(ttsText, selectedVoice);
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            const source = audioContext.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(audioContext.destination);
            source.start();
            addLog('AI_TOOLKIT', 'TTS audio playback started.');
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
            setError(errorMessage);
            addLog('ERROR', `TTS Error: ${errorMessage}`);
        } finally {
            setIsLoading(false);
        }
    };
    
    const ModeButton: React.FC<{ m: Mode, label: string }> = ({ m, label }) => (
        <button onClick={() => setMode(m)} className={`px-4 py-2 text-sm font-medium rounded-md transition border ${
            mode === m 
            ? 'bg-amber-600 border-amber-400 text-white shadow-[0_0_10px_rgba(245,158,11,0.5)]' 
            : 'bg-black border-slate-700 hover:border-amber-500/50 hover:text-amber-400 text-slate-400'
        }`}>
            {label}
        </button>
    );

    const renderContent = () => {
        switch (mode) {
            case 'live':
            case 'transcribe':
                return (
                    <div className="h-full flex flex-col">
                        <div className="flex-1 bg-black/40 backdrop-blur-sm rounded-lg border border-slate-800 p-4 space-y-2 overflow-y-auto">
                            {transcriptionHistory.map((entry, index) => (
                                <div key={index} className={`p-2 rounded-md ${entry.author === 'user' ? 'text-amber-300' : 'text-slate-300'}`}>
                                    <span className="font-bold capitalize">{entry.author}: </span>{entry.text}
                                </div>
                            ))}
                             {currentInterimTranscription && (
                                <div className="p-2 rounded-md text-amber-300/70">
                                    <span className="font-bold">User: </span>{currentInterimTranscription}
                                </div>
                            )}
                        </div>
                        <div className="pt-4 flex justify-center">
                            <button
                                onClick={isSessionActive ? closeSession : () => startSession(mode)}
                                className={`flex items-center space-x-2 px-6 py-3 rounded-full text-white font-bold transition shadow-lg ${
                                    isSessionActive ? 'bg-red-600 hover:bg-red-700 shadow-[0_0_15px_rgba(220,38,38,0.5)]' : 'bg-green-600 hover:bg-green-700 shadow-[0_0_15px_rgba(22,163,74,0.5)]'
                                }`}
                            >
                                {isSessionActive ? <StopCircleIcon className="w-6 h-6" /> : <MicrophoneIcon className="w-6 h-6" />}
                                <span>{isSessionActive ? 'Stop Session' : `Start ${mode === 'live' ? 'Conversation' : 'Transcription'}`}</span>
                            </button>
                        </div>
                        {liveError && <p className="text-red-400 text-sm mt-2 text-center">{liveError}</p>}
                    </div>
                );
            case 'tts':
                return (
                    <div className="space-y-4">
                         <div>
                            <label htmlFor="voice-select" className="block text-sm font-medium text-slate-300 mb-2">Voice</label>
                            <select
                                id="voice-select"
                                value={selectedVoice}
                                onChange={(e) => setSelectedVoice(e.target.value)}
                                className="w-full bg-black border border-slate-700 rounded-md p-2 text-sm text-slate-200 focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
                            >
                                {VOICES.map(voice => (
                                    <option key={voice} value={voice}>{voice}</option>
                                ))}
                            </select>
                        </div>
                        <textarea value={ttsText} onChange={(e) => setTtsText(e.target.value)} rows={5} placeholder="Enter text to generate speech..." className="w-full bg-black border border-slate-700 rounded-md p-2 text-sm text-slate-200 focus:ring-1 focus:ring-amber-500 focus:border-amber-500" />
                        <button onClick={handleTtsSubmit} disabled={isLoading} className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 px-4 rounded-md disabled:bg-slate-600 shadow-[0_0_15px_rgba(245,158,11,0.3)] transition-all">
                           {isLoading ? <span className="flex items-center justify-center"><Loader /> Generating...</span> : 'Generate & Play Audio'}
                        </button>
                        {error && <p className="text-red-400 text-sm">{error}</p>}
                    </div>
                );
        }
    }


    return (
        <div className="h-full flex flex-col">
            <h3 className="text-lg font-bold text-slate-200 mb-1">Audio Lab</h3>
            <p className="text-sm text-slate-400 mb-4">Engage in real-time conversations, transcribe audio, or generate speech.</p>

            <div className="flex space-x-2 mb-4">
                <ModeButton m="live" label="Live Conversation" />
                <ModeButton m="transcribe" label="Transcribe" />
                <ModeButton m="tts" label="Text-to-Speech" />
            </div>
            
            <div className="flex-1">
                {renderContent()}
            </div>
        </div>
    );
};

export default AudioLabTab;
