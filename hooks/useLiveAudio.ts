
import { useState, useCallback, useRef } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Blob } from '@google/genai';
import { LogEntry } from '../types';
import { encode, decode, decodeAudioData } from '../utils/audio';

interface TranscriptionEntry {
    author: 'user' | 'model';
    text: string;
}

// Define a local interface for the LiveSession object since it's not exported.
interface LiveSession {
    sendRealtimeInput: (input: { media: Blob }) => void;
    close: () => void;
}

// Always create a new instance to get the latest API key from the environment.
const getAi = () => {
    const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("API_KEY is not defined. Please ensure it's set in the environment.");
        throw new Error("API_KEY is missing. Cannot initialize GoogleGenAI for Live Audio.");
    }
    return new GoogleGenAI({ apiKey });
}

function createBlob(data: Float32Array): Blob {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}

export const useLiveAudio = ({ addLog }: { addLog: (source: LogEntry['source'], message: string) => void }) => {
    const [isSessionActive, setIsSessionActive] = useState(false);
    const [transcriptionHistory, setTranscriptionHistory] = useState<TranscriptionEntry[]>([]
);
    const [currentInterimTranscription, setCurrentInterimTranscription] = useState('');
    const [error, setError] = useState<string | null>(null);

    const sessionPromiseRef = useRef<Promise<LiveSession> | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const outputAudioContextRef = useRef<AudioContext | null>(null);
    let nextStartTime = 0;
    const sources = new Set<AudioBufferSourceNode>();

    const closeSession = useCallback(async () => {
        if (!sessionPromiseRef.current) return;

        addLog('AI_TOOLKIT', 'Live audio session closing...');
        setIsSessionActive(false);

        if (streamRef.current) { // Stop all tracks from the stream
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (scriptProcessorRef.current) {
            scriptProcessorRef.current.disconnect();
            scriptProcessorRef.current = null;
        }
        if (mediaStreamSourceRef.current) {
            mediaStreamSourceRef.current.disconnect();
            mediaStreamSourceRef.current = null;
        }
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
            await audioContextRef.current.close();
            audioContextRef.current = null;
        }
        if(outputAudioContextRef.current && outputAudioContextRef.current.state !== 'closed') {
            await outputAudioContextRef.current.close();
            outputAudioContextRef.current = null;
        }
        
        try {
            const session = await sessionPromiseRef.current;
            session.close();
        } catch(e) {
            console.warn("Error closing live session:", e);
        }
        sessionPromiseRef.current = null;

        setTranscriptionHistory([]);
        setCurrentInterimTranscription('');
        setError(null);
        addLog('AI_TOOLKIT', 'Live audio session closed.');
    }, [addLog]);

    const streamRef = useRef<MediaStream | null>(null); // Ref to hold the MediaStream

    const startSession = useCallback(async (mode: 'live' | 'transcribe') => {
        if (isSessionActive) return;
        addLog('AI_TOOLKIT', `Live audio session starting in ${mode} mode...`);

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream; // Store the stream in the ref
            const ai = getAi();
            
            let currentInputTranscription = '';
            let currentOutputTranscription = '';

            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            
            sessionPromiseRef.current = ai.live.connect({
                model: 'gemini-3.1-flash-live-preview',
                callbacks: {
                    onopen: () => {
                        addLog('AI_TOOLKIT', 'Live audio connection opened.');
                        if (!audioContextRef.current) return;
                        mediaStreamSourceRef.current = audioContextRef.current.createMediaStreamSource(stream);
                        scriptProcessorRef.current = audioContextRef.current.createScriptProcessor(4096, 1, 1);
                        
                        scriptProcessorRef.current.onaudioprocess = (audioProcessingEvent) => {
                            const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                            const pcmBlob = createBlob(inputData);
                            // CRITICAL: Solely rely on sessionPromise resolves and then call session.sendRealtimeInput
                            if (sessionPromiseRef.current) {
                                sessionPromiseRef.current.then((session) => {
                                    session.sendRealtimeInput({ media: pcmBlob });
                                });
                            }
                        };
                        mediaStreamSourceRef.current.connect(scriptProcessorRef.current);
                        scriptProcessorRef.current.connect(audioContextRef.current.destination);
                    },
                    onmessage: async (message: LiveServerMessage) => {
                        if (message.serverContent?.inputTranscription) {
                            const text = message.serverContent.inputTranscription.text;
                            setCurrentInterimTranscription(text);
                        }
                        
                        if(mode === 'live' && message.serverContent?.outputTranscription) {
                            currentOutputTranscription += message.serverContent.outputTranscription.text;
                        }

                        if (message.serverContent?.turnComplete) {
                            const finalInput = currentInterimTranscription;
                            setTranscriptionHistory(prev => [...prev, { author: 'user', text: finalInput }]);
                             if (mode === 'live' && currentOutputTranscription) {
                                setTranscriptionHistory(prev => [...prev, {author: 'model', text: currentOutputTranscription}]);
                            }
                            setCurrentInterimTranscription('');
                            currentOutputTranscription = '';
                        }

                        const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                        if (mode === 'live' && base64Audio && outputAudioContextRef.current) {
                            nextStartTime = Math.max(nextStartTime, outputAudioContextRef.current.currentTime);
                            const audioBuffer = await decodeAudioData(decode(base64Audio), outputAudioContextRef.current, 24000, 1);
                            const source = outputAudioContextRef.current.createBufferSource();
                            source.buffer = audioBuffer;
                            source.connect(outputAudioContextRef.current.destination);
                            source.addEventListener('ended', () => sources.delete(source));
                            source.start(nextStartTime);
                            nextStartTime += audioBuffer.duration;
                            sources.add(source);
                        }
                    },
                    onerror: (e: ErrorEvent) => {
                        setError('A connection error occurred.');
                        addLog('ERROR', `Live audio error: ${e.message}`);
                        closeSession();
                    },
                    onclose: () => {
                        addLog('AI_TOOLKIT', 'Live audio connection closed by server.');
                        closeSession();
                    },
                },
                config: {
                    // @google/genai Fix: responseModalities MUST contain exactly one modality: Modality.AUDIO.
                    responseModalities: [Modality.AUDIO],
                    inputAudioTranscription: {},
                    outputAudioTranscription: mode === 'live' ? {} : undefined,
                },
            });
            setIsSessionActive(true);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
            setError(`Failed to start session: ${errorMessage}`);
            addLog('ERROR', `Live audio start failed: ${errorMessage}`);
            setIsSessionActive(false);
        }

    }, [isSessionActive, addLog, closeSession]);

    return {
        isSessionActive,
        startSession,
        closeSession,
        transcriptionHistory,
        currentInterimTranscription,
        error,
    };
};
