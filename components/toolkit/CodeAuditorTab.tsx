
import React, { useState, useCallback } from 'react';
import { auditCode } from '../../services/geminiService';
import CodeInput from '../CodeInput';
import ReviewOutput from '../ReviewOutput';
import { useAppContext } from '../../contexts/AppContext';
import { SparklesIcon } from '../icons/SparklesIcon';
import Loader from '../Loader';

const CodeAuditorTab: React.FC = () => {
    const { addLog } = useAppContext();
    const [code, setCode] = useState('');
    const [language, setLanguage] = useState('Python');
    const [review, setReview] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = useCallback(async () => {
        if (!code.trim() || isLoading) return;
        setIsLoading(true);
        setError(null);
        setReview(null);
        addLog('AI_TOOLKIT', `Code audit initiated for ${language} codebase.`);
        try {
            const result = await auditCode(code, language);
            setReview(result);
            addLog('AI_TOOLKIT', 'Forensic code audit completed. Review manifest generated.');
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "An unknown error occurred during the audit.";
            setError(errorMessage);
            addLog('ERROR', `Code Audit Failure: ${errorMessage}`);
        } finally {
            setIsLoading(false);
        }
    }, [code, language, isLoading, addLog]);

    return (
        <div className="h-full flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h3 className="text-lg font-bold text-slate-200 mb-1 font-display uppercase tracking-widest">// Forensic Code Auditor</h3>
                    <p className="text-xs text-slate-400 font-mono">Detect latency decoherence and apply SKP kernel patches.</p>
                </div>
                <button
                    onClick={handleSubmit}
                    disabled={isLoading || !code.trim()}
                    className="hidden lg:flex items-center space-x-2 px-6 py-2 bg-amber-600 hover:bg-amber-500 text-black font-bold rounded-md transition-all shadow-[0_0_15px_rgba(245,158,11,0.3)] disabled:opacity-50 disabled:cursor-not-allowed group uppercase text-xs tracking-widest"
                >
                    {isLoading ? (
                        <div className="flex items-center space-x-2">
                             <Loader />
                             <span>Auditing...</span>
                        </div>
                    ) : (
                        <>
                            <SparklesIcon className="w-4 h-4 group-hover:animate-pulse" />
                            <span>Trigger Forensic Audit</span>
                        </>
                    )}
                </button>
            </div>
            
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-y-auto pr-1">
                <div className="flex flex-col space-y-4">
                    <CodeInput
                        code={code}
                        setCode={setCode}
                        language={language}
                        setLanguage={setLanguage}
                        isLoading={isLoading}
                    />
                    {/* Mobile visible button */}
                    <button
                        onClick={handleSubmit}
                        disabled={isLoading || !code.trim()}
                        className="lg:hidden flex items-center justify-center space-x-2 px-6 py-3 bg-amber-600 hover:bg-amber-500 text-black font-bold rounded-md transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed group w-full uppercase text-sm tracking-widest"
                    >
                        {isLoading ? (
                            <div className="flex items-center space-x-2">
                                <Loader />
                                <span>Auditing Matrix...</span>
                            </div>
                        ) : (
                            <>
                                <SparklesIcon className="w-5 h-5 group-hover:animate-pulse" />
                                <span>Execute Forensic Audit</span>
                            </>
                        )}
                    </button>
                </div>
                
                <ReviewOutput
                    review={review}
                    isLoading={isLoading}
                    error={error}
                />
            </div>
        </div>
    );
};

export default CodeAuditorTab;
