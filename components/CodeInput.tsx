
import React from 'react';
import { PROGRAMMING_LANGUAGES } from '../constants';

interface CodeInputProps {
    code: string;
    setCode: (code: string) => void;
    language: string;
    setLanguage: (language: string) => void;
    isLoading: boolean;
}

const CodeInput: React.FC<CodeInputProps> = ({ code, setCode, language, setLanguage, isLoading }) => {
    return (
        <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-between font-mono">
                 <label htmlFor="language-select" className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                    Target_Language
                </label>
                <select
                    id="language-select"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="bg-black/60 backdrop-blur-md border border-slate-800 rounded px-3 py-1.5 text-xs text-amber-500 focus:border-amber-500 transition outline-none cursor-pointer"
                    disabled={isLoading}
                >
                    {PROGRAMMING_LANGUAGES.map((lang) => (
                        <option key={lang} value={lang}>
                            {lang.toUpperCase()}
                        </option>
                    ))}
                </select>
            </div>

            <div className="bg-black/40 backdrop-blur-md rounded-lg border border-slate-800 focus-within:border-amber-500 transition-all duration-300 shadow-2xl relative group">
                <div className="absolute top-2 right-4 text-[8px] font-mono text-slate-700 uppercase pointer-events-none group-focus-within:text-amber-900 transition-colors">
                    Buffer_Input_Stream
                </div>
                <textarea
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="PASTE SYSTEM_LOG_CODE OR PROTOCOL SOURCE..."
                    className="w-full h-96 bg-transparent text-slate-300 p-4 font-mono text-xs resize-none focus:outline-none selection:bg-amber-500/30"
                    spellCheck="false"
                    disabled={isLoading}
                />
            </div>
        </div>
    );
};

export default CodeInput;
