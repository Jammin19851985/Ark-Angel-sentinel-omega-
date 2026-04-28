
import React from 'react';
import Loader from './Loader';

interface ReviewOutputProps {
    review: string | null;
    isLoading: boolean;
    error: string | null;
}

const FormattedLine: React.FC<{ line: string }> = ({ line }) => {
    if (line.startsWith('### ')) {
        return <h3 className="text-xl font-semibold text-slate-100 mt-6 mb-2">{line.substring(4)}</h3>;
    }
    if (line.startsWith('## ')) {
        return <h2 className="text-2xl font-bold text-slate-50 mt-8 mb-3">{line.substring(3)}</h2>;
    }
    if (line.startsWith('# ')) {
        return <h1 className="text-3xl font-extrabold text-white mt-10 mb-4">{line.substring(2)}</h1>;
    }
    if (line.startsWith('* ') || line.startsWith('- ')) {
        return <li className="ml-5 text-slate-300">{line.substring(2)}</li>;
    }
    if (line.match(/^`{3}/)) { // Matches ```, ```javascript etc.
        return null; // Handled by the main parser logic
    }
    if (line.startsWith('---')) {
        return <hr className="border-slate-700 my-6" />;
    }
    return <p className="text-slate-300 leading-relaxed">{line}</p>;
};

const ReviewOutput: React.FC<ReviewOutputProps> = ({ review, isLoading, error }) => {
    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="flex flex-col items-center justify-center h-full space-y-4">
                    <Loader />
                    <p className="mt-2 text-slate-400">The Swarm is analyzing...</p>
                    <p className="text-sm text-slate-500 text-center">Ark Angel AI is generating your code review.</p>
                </div>
            );
        }

        if (error) {
            return (
                <div className="flex items-center justify-center h-full">
                    <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-md">
                        <p className="font-bold">An error occurred</p>
                        <p className="text-sm">{error}</p>
                    </div>
                </div>
            );
        }

        if (!review) {
            return (
                <div className="flex flex-col items-center justify-center h-full p-8 text-center border-2 border-dashed border-slate-700 rounded-lg">
                    <h3 className="text-lg font-medium text-slate-300">Awaiting Swarm Analysis</h3>
                    <p className="mt-1  text-sm text-slate-500">
                        Your code review from the Ark Angel swarm will appear here.
                    </p>
                </div>
            );
        }

        const lines = review.split('\n');
        const elements: React.ReactNode[] = [];
        let isCodeBlock = false;
        let codeBlockContent: string[] = [];

        lines.forEach((line, index) => {
            if (line.match(/^`{3}/)) {
                if (isCodeBlock) {
                    elements.push(
                        <pre key={`code-${index}`} className="bg-black/50 backdrop-blur-sm rounded-md p-4 my-4 overflow-x-auto">
                            <code className="font-mono text-sm text-amber-300">
                                {codeBlockContent.join('\n')}
                            </code>
                        </pre>
                    );
                    codeBlockContent = [];
                }
                isCodeBlock = !isCodeBlock;
            } else {
                if (isCodeBlock) {
                    codeBlockContent.push(line);
                } else {
                    elements.push(<FormattedLine key={index} line={line} />);
                }
            }
        });
        
        return elements;
    };

    return (
        <div className="bg-black/30 backdrop-blur-sm rounded-lg border border-slate-800 h-[30rem] lg:h-auto lg:min-h-[30rem] p-6 shadow-2xl glow-border">
             <div className="h-full overflow-y-auto pr-2">
                {renderContent()}
            </div>
        </div>
    );
};

export default ReviewOutput;