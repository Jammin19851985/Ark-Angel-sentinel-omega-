
import React from 'react';
import { ChatBubbleIcon } from './components/icons/ChatBubbleIcon';
import { ImageIcon } from './components/icons/ImageIcon';
import { VideoIcon } from './components/icons/VideoIcon';
import { MicrophoneIcon } from './components/icons/MicrophoneIcon';
import { CodeBracketsIcon } from './components/icons/CodeBracketsIcon';
import { NewspaperIcon } from './components/icons/NewspaperIcon';
import { DatabaseIcon } from './components/icons/DatabaseIcon';
import { EyeIcon } from './components/icons/EyeIcon';
import ChatTab from './components/toolkit/ChatTab';
import ImageStudioTab from './components/toolkit/ImageStudioTab';
import VideoStudioTab from './components/toolkit/VideoStudioTab';
import AudioLabTab from './components/toolkit/AudioLabTab';
import CodeAuditorTab from './components/toolkit/CodeAuditorTab';
import SentimentAnalysisTab from './components/toolkit/SentimentAnalysisTab';
import { RagTab } from './components/toolkit/RagTab';
import LearningParamsConfigTab from './components/toolkit/LearningParamsConfigTab';
import OmniSentryTab from './components/toolkit/OmniSentryTab';
import { GearsIcon } from './components/icons/GearsIcon';
import { useAppContext } from './contexts/AppContext';
import { ToolkitTab } from './types';

interface AIToolkitProps {
    id: string; 
}

const AIToolkit: React.FC<AIToolkitProps> = ({ id }) => {
    const { aiToolkitState, setAiToolkitState } = useAppContext();
    const { activeTab } = aiToolkitState;

    const handleTabChange = (tab: ToolkitTab) => {
        setAiToolkitState(prev => ({ ...prev, activeTab: tab }));
    };

    const TabButton: React.FC<{tab: ToolkitTab, label: string, icon: React.ReactNode}> = ({ tab, label, icon }) => (
         <button
            onClick={() => handleTabChange(tab)}
            className={`flex items-center space-x-2 px-3 py-3 text-sm font-medium rounded-md transition-colors w-full text-left ${
                activeTab === tab
                    ? 'text-amber-300 bg-amber-900/50 backdrop-blur-sm' 
                    : 'text-slate-400 hover:text-amber-400 bg-black/50 backdrop-blur-sm hover:bg-slate-800/50' 
            }`}
        >
            {icon}
            <span>{label}</span>
        </button>
    );

    const renderTabContent = () => {
        switch (activeTab) {
            case 'chat':
                return <ChatTab />;
            case 'sentiment':
                return <SentimentAnalysisTab />;
            case 'rag':
                return <RagTab />;
            case 'sentry':
                return <OmniSentryTab />;
            case 'image':
                return <ImageStudioTab />;
            case 'video':
                return <VideoStudioTab />;
            case 'audio':
                return <AudioLabTab />;
            case 'code':
                return <CodeAuditorTab />;
            case 'learning_params': 
                return <LearningParamsConfigTab />;
            default:
                return null;
        }
    }

    return (
        <div id={id} className="bg-black/30 backdrop-blur-sm border border-slate-800 rounded-b-lg rounded-tr-lg shadow-lg flex flex-col lg:flex-row h-full glow-border flex-1">
            <div className="w-full lg:w-48 p-4 border-b lg:border-b-0 lg:border-r border-slate-800 flex flex-row lg:flex-col gap-2">
                 <TabButton tab="chat" label="Chat Studio" icon={<ChatBubbleIcon className="w-5 h-5"/>} />
                 <TabButton tab="sentiment" label="Sentiment" icon={<NewspaperIcon className="w-5 h-5"/>} />
                 <TabButton tab="rag" label="Intel RAG" icon={<DatabaseIcon className="w-5 h-5"/>} />
                 <TabButton tab="sentry" label="Omni-Sentry" icon={<EyeIcon className="w-5 h-5"/>} />
                 <TabButton tab="image" label="Image Studio" icon={<ImageIcon className="w-5 h-5"/>} />
                 <TabButton tab="video" label="Video Studio" icon={<VideoIcon className="w-5 h-5"/>} />
                 <TabButton tab="audio" label="Audio Lab" icon={<MicrophoneIcon className="w-5 h-5"/>} />
                 <TabButton tab="code" label="Code Auditor" icon={<CodeBracketsIcon className="w-5 h-5"/>} />
                 <TabButton tab="learning_params" label="Learning Config" icon={<GearsIcon className="w-5 h-5"/>} />
            </div>
            <div className="flex-1 p-4 lg:p-6 overflow-y-auto">
                {renderTabContent()}
            </div>
        </div>
    );
};

export default AIToolkit;
