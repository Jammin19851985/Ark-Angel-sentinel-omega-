
import React, { useState, useCallback, useEffect } from 'react';
import Loader from '../Loader';
import { useAppContext } from '../../contexts/AppContext';
import { LearningParams } from '../../types';
import { SparklesIcon } from '../icons/SparklesIcon';

const LearningParamsConfigTab: React.FC = () => {
    const { addLog, aiToolkitState, setAiToolkitState } = useAppContext();
    const { learningParams: currentLearningParams } = aiToolkitState;

    const [tempLearningParams, setTempLearningParams] = useState<LearningParams>(currentLearningParams);
    const [isLoading, setIsLoading] = useState(false);
    const [isApplied, setIsApplied] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Synchronize local state with global context on initial load or if context changes externally
        setTempLearningParams(currentLearningParams);
    }, [currentLearningParams]);

    const handleParamChange = useCallback((key: keyof LearningParams, value: any) => {
        setTempLearningParams(prev => ({
            ...prev,
            [key]: value
        }));
    }, []);

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        if (isLoading) return;

        setIsLoading(true);
        setError(null);
        setIsApplied(false);
        addLog('AI_TOOLKIT', `Applying AI learning parameters configuration...`);

        try {
            // Simulate network/AI processing delay
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Update the global context state
            setAiToolkitState(prev => ({
                ...prev,
                learningParams: tempLearningParams
            }));

            const configSummary = Object.entries(tempLearningParams)
                .map(([key, value]) => `${key}: ${value}`)
                .join(', ');

            addLog('AI_TOOLKIT', `AI Learning Parameters Applied: { ${configSummary} }`);
            setIsApplied(true);
            setTimeout(() => setIsApplied(false), 3000); // Hide confirmation after 3 seconds

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
            setError(errorMessage);
            addLog('ERROR', `Failed to apply learning parameters: ${errorMessage}`);
        } finally {
            setIsLoading(false);
        }
    }, [isLoading, tempLearningParams, setAiToolkitState, addLog]);

    return (
        <div className="h-full flex flex-col">
            <h3 className="text-lg font-bold text-slate-200 mb-1">Learning Parameters Config</h3>
            <p className="text-sm text-slate-400 mb-4">
                Configure the core learning parameters for the AI models.
                (Simulated changes for demonstration purposes.)
            </p>

            <form onSubmit={handleSubmit} className="flex-1 flex flex-col space-y-6 overflow-y-auto pr-2">
                <div className="bg-black/50 backdrop-blur-sm rounded-lg border border-slate-800 p-4 space-y-4">
                    {/* Learning Rate */}
                    <div>
                        <label htmlFor="learning-rate" className="block text-sm font-medium text-slate-300 mb-2">Learning Rate</label>
                        <input
                            id="learning-rate"
                            type="range"
                            min="0.0001"
                            max="0.1"
                            step="0.0001"
                            value={tempLearningParams.learningRate}
                            onChange={(e) => handleParamChange('learningRate', parseFloat(e.target.value))}
                            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer range-lg accent-amber-500"
                            disabled={isLoading}
                        />
                        <span className="text-xs text-slate-400 mt-1 block">Current: {tempLearningParams.learningRate.toFixed(4)}</span>
                    </div>

                    {/* Batch Size */}
                    <div>
                        <label htmlFor="batch-size" className="block text-sm font-medium text-slate-300 mb-2">Batch Size</label>
                        <select
                            id="batch-size"
                            value={Number.isNaN(tempLearningParams.batchSize) ? '' : tempLearningParams.batchSize}
                            onChange={(e) => handleParamChange('batchSize', e.target.value ? parseInt(e.target.value) : '')}
                            className="w-full bg-black/50 backdrop-blur-sm border border-slate-700 rounded-md p-2 text-sm text-slate-200 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition disabled:opacity-50"
                            disabled={isLoading}
                        >
                            {[16, 32, 64, 128, 256].map(size => (
                                <option key={size} value={size}>{size}</option>
                            ))}
                        </select>
                    </div>

                    {/* Activation Function */}
                    <div>
                        <label htmlFor="activation-function" className="block text-sm font-medium text-slate-300 mb-2">Activation Function</label>
                        <select
                            id="activation-function"
                            value={tempLearningParams.activationFunction}
                            onChange={(e) => handleParamChange('activationFunction', e.target.value as LearningParams['activationFunction'])}
                            className="w-full bg-black/50 backdrop-blur-sm border border-slate-700 rounded-md p-2 text-sm text-slate-200 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition disabled:opacity-50"
                            disabled={isLoading}
                        >
                            {['ReLU', 'Sigmoid', 'Tanh', 'Leaky ReLU'].map(func => (
                                <option key={func} value={func}>{func}</option>
                            ))}
                        </select>
                    </div>

                    {/* Epochs */}
                    <div>
                        <label htmlFor="epochs" className="block text-sm font-medium text-slate-300 mb-2">Number of Epochs</label>
                        <input
                            id="epochs"
                            type="number"
                            min="1"
                            max="1000"
                            step="1"
                            value={Number.isNaN(tempLearningParams.epochs) ? '' : tempLearningParams.epochs}
                            onChange={(e) => handleParamChange('epochs', e.target.value ? parseInt(e.target.value) : '')}
                            className="w-full bg-black/50 backdrop-blur-sm border border-slate-700 rounded-md p-2 text-sm text-slate-200 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition disabled:opacity-50"
                            disabled={isLoading}
                        />
                    </div>

                    {/* Optimizer */}
                    <div>
                        <label htmlFor="optimizer" className="block text-sm font-medium text-slate-300 mb-2">Optimization Algorithm</label>
                        <select
                            id="optimizer"
                            value={tempLearningParams.optimizer}
                            onChange={(e) => handleParamChange('optimizer', e.target.value as LearningParams['optimizer'])}
                            className="w-full bg-black/50 backdrop-blur-sm border border-slate-700 rounded-md p-2 text-sm text-slate-200 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition disabled:opacity-50"
                            disabled={isLoading}
                        >
                            {['Adam', 'SGD', 'RMSprop'].map(opt => (
                                <option key={opt} value={opt}>{opt}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-amber-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors group"
                >
                    {isLoading ? (
                        <>
                            <Loader />
                            <span className="ml-2">Applying Configuration...</span>
                        </>
                    ) : (
                        <>
                            <SparklesIcon className="w-5 h-5 mr-2 -ml-1 text-amber-300 group-hover:animate-pulse" />
                            Apply Configuration
                        </>
                    )}
                </button>

                {isApplied && (
                    <div className="bg-green-900/50 border border-green-700 text-green-300 px-4 py-3 rounded-md text-sm mt-4 animate-fade-in-fast">
                        <p className="font-bold">Configuration Applied!</p>
                        <p>The AI learning parameters have been updated.</p>
                    </div>
                )}
                {error && (
                    <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-md text-sm mt-4">
                        <p className="font-bold">Error:</p>
                        <p>{error}</p>
                    </div>
                )}
            </form>

            <div className="mt-6 pt-4 border-t border-slate-800">
                <h4 className="text-sm font-bold text-slate-300 mb-2">// CURRENTLY APPLIED CONFIGURATION</h4>
                <div className="bg-black/50 backdrop-blur-sm rounded-lg border border-slate-700 p-3 font-mono text-xs text-slate-400">
                    <p><strong>Learning Rate:</strong> <span className="text-amber-300">{currentLearningParams.learningRate.toFixed(4)}</span></p>
                    <p><strong>Batch Size:</strong> <span className="text-amber-300">{currentLearningParams.batchSize}</span></p>
                    <p><strong>Activation Function:</strong> <span className="text-amber-300">{currentLearningParams.activationFunction}</span></p>
                    <p><strong>Epochs:</strong> <span className="text-amber-300">{currentLearningParams.epochs}</span></p>
                    <p><strong>Optimizer:</strong> <span className="text-amber-300">{currentLearningParams.optimizer}</span></p>
                </div>
            </div>
        </div>
    );
};

export default LearningParamsConfigTab;
