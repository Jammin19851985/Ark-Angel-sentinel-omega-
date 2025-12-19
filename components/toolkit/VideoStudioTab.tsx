import React, { useState, useCallback } from 'react';
import { generateVideo, analyzeVideo } from '../../services/geminiService';
import Loader from '../Loader';
import { useAppContext } from '../../contexts/AppContext';

interface VideoStudioTabProps {}

type Mode = 'generate' | 'analyze';
type AspectRatio = '16:9' | '9:16';

const VideoStudioTab: React.FC<VideoStudioTabProps> = () => {
    const { addLog } = useAppContext();
    const [mode, setMode] = useState<Mode>('generate');
    const [prompt, setPrompt] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
    const [analysisResult, setAnalysisResult] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
        const file = e.target.files?.[0];
        if (file) {
            if (type === 'image') setImageFile(file);
            if (type === 'video') setVideoFile(file);
        }
    };
    
    const handleSubmit = async () => {
        if ((!prompt.trim() && !imageFile) || isLoading) return;
        setIsLoading(true);
        setError(null);
        setGeneratedVideoUrl(null);
        setAnalysisResult(null);

        try {
            if (mode === 'generate') {
                setLoadingMessage('Initializing Veo generation...');
                addLog('AI_TOOLKIT', `Video generation started for: "${prompt}"`);
                const videoUrl = await generateVideo(prompt, aspectRatio, imageFile || undefined);
                setGeneratedVideoUrl(videoUrl);
                addLog('AI_TOOLKIT', 'Video generation successful.');
            } else { // analyze
                if (!videoFile) {
                    const err = "Please upload a video to analyze.";
                    setError(err);
                    addLog('ERROR', `Video Studio: ${err}`);
                    throw new Error(err);
                }
                setLoadingMessage('Analyzing video content...');
                addLog('AI_TOOLKIT', `Video analysis started for: "${prompt}"`);
                const analysis = await analyzeVideo(videoFile, prompt);
                setAnalysisResult(analysis);
                addLog('AI_TOOLKIT', 'Video analysis successful.');
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
            if (errorMessage.includes("Requested entity was not found")) {
                setError("API key is invalid or lacks permissions for Veo. Please check project settings.");
                addLog('ERROR', `Video Studio Error: ${errorMessage}. API key issue.`);
            } else {
                setError(errorMessage);
                addLog('ERROR', `Video Studio Error: ${errorMessage}`);
            }
        } finally {
            setIsLoading(false);
            setLoadingMessage('');
        }
    };

    return (
        <div className="h-full flex flex-col">
            <h3 className="text-lg font-bold text-slate-200 mb-1">Video Studio</h3>
            <p className="text-sm text-slate-400 mb-4">Generate high-quality videos from text or images using Veo.</p>
            
            {/* Controls */}
            <div className="flex flex-col space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Prompt</label>
                    <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={3} placeholder="e.g., A majestic eagle soaring over mountains..." className="w-full bg-black/50 backdrop-blur-sm border-slate-700 rounded-md p-2 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Starting Image (Optional)</label>
                        <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'image')} className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-amber-900/50 backdrop-blur-sm file:text-amber-300 hover:file:bg-amber-900" />
                    </div>
                    <div>
                        <label htmlFor="aspect-ratio-vid" className="block text-sm font-medium text-slate-300 mb-2">Aspect Ratio</label>
                         <select id="aspect-ratio-vid" value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value as AspectRatio)} className="w-full bg-black/50 backdrop-blur-sm border-slate-700 rounded-md p-2.5 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500">
                            <option value="16:9">Landscape (16:9)</option>
                            <option value="9:16">Portrait (9:16)</option>
                        </select>
                    </div>
                </div>
                 <button onClick={handleSubmit} disabled={isLoading} className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 px-4 rounded-md disabled:bg-slate-600">
                    {isLoading ? 'Generating...' : 'Generate Video'}
                </button>
            </div>

            {/* Output */}
            <div className="mt-4 flex-1 bg-black/30 backdrop-blur-sm rounded-lg border border-slate-800 p-4 flex items-center justify-center min-h-[250px]">
                {isLoading && (
                    <div className="text-center">
                        <Loader />
                        <p className="mt-2 text-slate-400">{loadingMessage}</p>
                        <p className="text-xs text-slate-500">Video generation can take several minutes.</p>
                    </div>
                )}
                {error && <p className="text-red-400 text-sm">{error}</p>}
                {!isLoading && !error && (
                    <>
                        {generatedVideoUrl && (
                            <video src={generatedVideoUrl} controls autoPlay loop className="max-h-full max-w-full object-contain rounded-md" />
                        )}
                        {!generatedVideoUrl && <p className="text-slate-500 text-sm">Generated video will appear here</p>}
                    </>
                )}
            </div>
        </div>
    );
};

export default VideoStudioTab;