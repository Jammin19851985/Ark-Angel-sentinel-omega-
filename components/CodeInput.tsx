
import React from 'react';
import { PROGRAMMING_LANGUAGES } from '../constants';
import { SparklesIcon } from './icons/SparklesIcon';

interface CodeInputProps {
    code: string;
    setCode: (code: string) => void;
    language: string;
    setLanguage: (language: string) => void;
    onSubmit: () => void;
    isLoading: boolean;
}

const CodeInput: React.FC<CodeInputProps> = ({ code, setCode, language, setLanguage, onSubmit, isLoading }) => {
    return (
        <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-between">
                 <label htmlFor="language-select" className="text-sm font-medium text-slate-400">
                    Language
                </label>
                <select
                    id="language-select"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="bg-black/50 backdrop-blur-sm border border-slate-700 rounded-md px-3 py-2 text-sm text-slate-200 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition"
                >
                    {PROGRAMMING_LANGUAGES.map((lang) => (
                        <option key={lang} value={lang}>
                            {lang}
                        </option>
                    ))}
                </select>
            </div>

            <div className="bg-black/30 backdrop-blur-sm rounded-lg border border-slate-800 focus-within:border-amber-500 focus-within:ring-1 focus-within:ring-amber-500 transition-all duration-300 shadow-lg">
                <textarea
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Paste your code here..."
                    className="w-full h-96 bg-black/50 text-slate-200 p-4 font-mono text-sm resize-none focus:outline-none"
                    spellCheck="false"
                />
            </div>
            <button
                onClick={onSubmit}
                disabled={isLoading}
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-amber-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors group"
            >
                {isLoading ? (
                    'Consulting the Swarm...'
                ) : (
                    <>
                        <SparklesIcon className="w-5 h-5 mr-2 -ml-1 text-amber-300 group-hover:animate-pulse" />
                        Consult the Swarm
                    </>
                )}
            </button>
        </div>
    );
};

export default CodeInput;