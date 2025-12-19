import React, { useState, useCallback } from 'react';
import { auditCode } from '../../services/geminiService';
import CodeInput from '../CodeInput';
import ReviewOutput from '../ReviewOutput';
import { useAppContext } from '../../contexts/AppContext';

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
        addLog('AI_TOOLKIT', `Code audit started for ${language}.`);
        try {
            const result = await auditCode(code, language);
            setReview(result);
            addLog('AI_TOOLKIT', 'Code audit successful.');
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
            setError(errorMessage);
            addLog('ERROR', `Code Audit Error: ${errorMessage}`);
        } finally {
            setIsLoading(false);
        }
    }, [code, language, isLoading, addLog]);

    return (
        <div className="h-full flex flex-col">
            <h3 className="text-lg font-bold text-slate-200 mb-1">Code Auditor</h3>
            <p className="text-sm text-slate-400 mb-4">Get an expert AI review of your code for bugs, performance, and best practices.</p>
            
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 overflow-y-auto">
                <CodeInput
                    code={code}
                    setCode={setCode}
                    language={language}
                    setLanguage={setLanguage}
                    onSubmit={handleSubmit}
                    isLoading={isLoading}
                />
                
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