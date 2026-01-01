
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { generateImage, analyzeImage, editImage } from '../../services/geminiService';
import Loader from '../Loader';
import { useAppContext } from '../../contexts/AppContext';
import { CameraIcon } from '../icons/CameraIcon'; 
import { UploadCloudIcon } from '../UploadCloudIcon';

interface ImageStudioTabProps {}

type Mode = 'generate' | 'analyze' | 'edit';
type InputMethod = 'file' | 'camera';
type AspectRatio = '1:1' | '16:9' | '9:16' | '4:3' | '3:4';

const ImageStudioTab: React.FC<ImageStudioTabProps> = () => {
    const { addLog } = useAppContext();
    const [mode, setMode] = useState<Mode>('generate');
    const [inputMethod, setInputMethod] = useState<InputMethod>('file'); 
    const [prompt, setPrompt] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null); 
    const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
    const [analysisResult, setAnalysisResult] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');

    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
    const [isCameraActive, setIsCameraActive] = useState(false);
    const [cameraError, setCameraError] = useState<string | null>(null);

    // Effect to manage camera stream
    useEffect(() => {
        if (inputMethod === 'camera' && !isCameraActive) {
            startCamera();
        } else if (inputMethod !== 'camera' && isCameraActive) {
            stopCamera();
        }

        return () => {
            stopCamera(); // Cleanup on unmount
        };
    }, [inputMethod]); // Only re-run when inputMethod changes

    const startCamera = useCallback(async () => {
        setCameraError(null);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.play();
                setCameraStream(stream);
                setIsCameraActive(true);
                addLog('AI_TOOLKIT', 'Camera stream started.');
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "An unknown camera error occurred.";
            setCameraError(`Failed to access camera: ${errorMessage}. Please ensure permissions are granted.`);
            addLog('ERROR', `Camera error: ${errorMessage}`);
            setIsCameraActive(false);
        }
    }, [addLog]);

    const stopCamera = useCallback(() => {
        if (cameraStream) {
            cameraStream.getTracks().forEach(track => track.stop());
            setCameraStream(null);
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
        setIsCameraActive(false);
        addLog('AI_TOOLKIT', 'Camera stream stopped.');
    }, [cameraStream, addLog]);

    const takePhoto = useCallback(() => {
        if (!videoRef.current || !canvasRef.current) {
            setError("Camera not ready.");
            addLog('ERROR', "Camera not ready for photo capture.");
            return;
        }

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        if (!context) {
            setError("Could not get canvas context.");
            addLog('ERROR', "Could not get canvas context for photo capture.");
            return;
        }

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);

        canvas.toBlob((blob) => {
            if (blob) {
                const capturedFile = new File([blob], `capture-${Date.now()}.png`, { type: 'image/png' });
                setImageFile(capturedFile);
                setImageUrl(URL.createObjectURL(capturedFile));
                setGeneratedImageUrl(null);
                setAnalysisResult(null);
                addLog('AI_TOOLKIT', 'Photo captured from camera.');
            } else {
                setError("Failed to capture image from canvas.");
                addLog('ERROR', "Failed to capture image from canvas.");
            }
        }, 'image/png');
    }, [addLog]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            setImageUrl(URL.createObjectURL(file));
            setGeneratedImageUrl(null);
            setAnalysisResult(null);
            setError(null);
            setCameraError(null);
            addLog('AI_TOOLKIT', 'Image file selected.');
        }
    };
    
    const handleSubmit = async () => {
        if (!prompt.trim() || isLoading) return;
        if ((mode === 'analyze' || mode === 'edit') && !imageFile) {
            const err = "Please upload or capture an image first.";
            setError(err);
            addLog('ERROR', `Image Studio: ${err}`);
            return;
        }

        setIsLoading(true);
        setError(null);
        setGeneratedImageUrl(null);
        setAnalysisResult(null);

        try {
            switch (mode) {
                case 'generate':
                    addLog('AI_TOOLKIT', `Image generation started for: "${prompt}"`);
                    const genImg = await generateImage(prompt, aspectRatio);
                    setGeneratedImageUrl(genImg);
                    addLog('AI_TOOLKIT', 'Image generation successful.');
                    break;
                case 'analyze':
                    if (!imageFile) throw new Error("Please upload an image to analyze.");
                    addLog('AI_TOOLKIT', `Image analysis started for: "${prompt}"`);
                    const analysis = await analyzeImage(imageFile, prompt);
                    setAnalysisResult(analysis);
                    addLog('AI_TOOLKIT', 'Image analysis successful.');
                    break;
                case 'edit':
                    if (!imageFile) throw new Error("Please upload an animage to edit.");
                    addLog('AI_TOOLKIT', `Image editing started for: "${prompt}"`);
                    const editImg = await editImage(imageFile, prompt);
                    setGeneratedImageUrl(editImg);
                    addLog('AI_TOOLKIT', 'Image editing successful.');
                    break;
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
            setError(errorMessage);
            addLog('ERROR', `Image Studio Error: ${errorMessage}`);
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

    const InputMethodButton: React.FC<{ method: InputMethod, label: string, icon: React.ReactNode }> = ({ method, label, icon }) => (
        <button
            onClick={() => setInputMethod(method)}
            className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-md transition border ${
                inputMethod === method
                    ? 'bg-amber-900 border-amber-500 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                    : 'bg-black border-slate-700 hover:border-amber-500/50 hover:text-amber-400 text-slate-400'
            }`}
        >
            {icon}
            <span>{label}</span>
        </button>
    );

    return (
        <div className="h-full flex flex-col">
            <h3 className="text-lg font-bold text-slate-200 mb-1">Image Studio</h3>
            <p className="text-sm text-slate-400 mb-4">Generate, analyze, and edit images using powerful AI models.</p>
            
            <div className="flex space-x-2 mb-4">
                <ModeButton m="generate" label="Generate" />
                <ModeButton m="analyze" label="Analyze" />
                <ModeButton m="edit" label="Edit" />
            </div>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 overflow-y-auto">
                {/* Left/Top Panel: Controls */}
                <div className="flex flex-col space-y-4">
                    {(mode === 'analyze' || mode === 'edit') && (
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Image Source</label>
                            <div className="flex space-x-2 mb-3">
                                <InputMethodButton method="file" label="Upload File" icon={<UploadCloudIcon className="w-4 h-4"/>} />
                                <InputMethodButton method="camera" label="Camera" icon={<CameraIcon className="w-4 h-4"/>} />
                            </div>

                            {inputMethod === 'file' && (
                                <input type="file" accept="image/*" onChange={handleFileChange} className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-amber-900 file:text-amber-300 hover:file:bg-amber-800" />
                            )}
                            {inputMethod === 'camera' && (
                                <div className="flex flex-col items-center justify-center p-4 bg-black border border-slate-700 rounded-md">
                                    {cameraError && <p className="text-red-400 text-sm mb-2">{cameraError}</p>}
                                    {!isCameraActive && !cameraError && <Loader />}
                                    <video ref={videoRef} className="w-full h-auto rounded-md" autoPlay muted playsInline style={{ display: isCameraActive ? 'block' : 'none' }} />
                                    <canvas ref={canvasRef} className="hidden" /> {/* Hidden canvas for photo capture */}
                                    <button
                                        onClick={takePhoto}
                                        disabled={!isCameraActive}
                                        className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 px-4 rounded-md disabled:bg-slate-600 mt-3 shadow-[0_0_10px_rgba(245,158,11,0.4)]" 
                                    >
                                        Take Photo
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                    {mode === 'generate' && (
                         <div>
                            <label htmlFor="aspect-ratio" className="block text-sm font-medium text-slate-300 mb-2">Aspect Ratio</label>
                             <select id="aspect-ratio" value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value as AspectRatio)} className="w-full bg-black border border-slate-700 rounded-md p-2 text-sm focus:ring-1 focus:ring-amber-500 focus:border-amber-500">
                                <option value="1:1">Square (1:1)</option>
                                <option value="16:9">Landscape (16:9)</option>
                                <option value="9:16">Portrait (9:16)</option>
                                <option value="4:3">Standard (4:3)</option>
                                <option value="3:4">Vertical (3:4)</option>
                            </select>
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Prompt</label>
                        <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={4} placeholder={
                            mode === 'generate' ? 'e.g., A futuristic city skyline at dusk...' :
                            mode === 'analyze' ? 'e.g., What is the main subject of this image?' :
                            'e.g., Add a retro sci-fi filter...'
                        } className="w-full bg-black border border-slate-700 rounded-md p-2 text-sm focus:ring-1 focus:ring-amber-500 focus:border-amber-500" />
                    </div>
                     <button onClick={handleSubmit} disabled={isLoading} className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 px-4 rounded-md disabled:bg-slate-600 shadow-[0_0_15px_rgba(245,158,11,0.3)] transition-all">
                        {isLoading ? 'Processing...' : 'Execute'}
                    </button>
                </div>

                {/* Right/Bottom Panel: Output */}
                <div className="bg-black/40 backdrop-blur-sm rounded-lg border border-slate-800 p-4 flex items-center justify-center min-h-[250px]">
                    {isLoading && <Loader />}
                    {error && <p className="text-red-400 text-sm text-center">{error}</p>}
                    {!isLoading && !error && (
                        <>
                            {mode === 'generate' && generatedImageUrl && <img src={generatedImageUrl} alt="Generated" className="max-h-full max-w-full object-contain rounded-md shadow-lg" />}
                            {mode === 'analyze' && (
                                <div className="flex flex-col md:flex-row gap-4 w-full h-full">
                                    {(imageUrl || imageFile) && <img src={imageUrl || URL.createObjectURL(imageFile as File)} alt="For analysis" className="max-h-full md:max-h-64 md:max-w-[50%] object-contain rounded-md" />}
                                    {analysisResult && <div className="text-sm text-slate-300 overflow-y-auto flex-1"><p className="whitespace-pre-wrap">{analysisResult}</p></div>}
                                </div>
                            )}
                            {(mode === 'edit') && (
                                <div className="flex gap-2 w-full h-full">
                                    {(imageUrl || imageFile) && <img src={imageUrl || URL.createObjectURL(imageFile as File)} alt="Original" className="max-h-full max-w-[50%] object-contain rounded-md" />}
                                    {generatedImageUrl && <img src={generatedImageUrl} alt="Edited" className="max-h-full max-w-[50%] object-contain rounded-md shadow-lg" />}
                                </div>
                            )}
                             {!imageUrl && !generatedImageUrl && !analysisResult && <p className="text-slate-500 text-sm">Output will appear here</p>}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ImageStudioTab;
