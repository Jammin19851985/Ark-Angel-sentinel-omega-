
import React from 'react';
import { ChatBubbleIcon } from './icons/ChatBubbleIcon';
import { ImageIcon } from './icons/ImageIcon';
import { VideoIcon } from './icons/VideoIcon';
import { MicrophoneIcon } from './icons/MicrophoneIcon';
import { CodeBracketsIcon } from './icons/CodeBracketsIcon';
import { NewspaperIcon } from './icons/NewspaperIcon';
import { DatabaseIcon } from './icons/DatabaseIcon';
import { EyeIcon } from './icons/EyeIcon';
import ChatTab from './toolkit/ChatTab';
import ImageStudioTab from './toolkit/ImageStudioTab';
import VideoStudioTab from './toolkit/VideoStudioTab';
import AudioLabTab from './toolkit/AudioLabTab';
import CodeAuditorTab from './toolkit/CodeAuditorTab';
import SentimentAnalysisTab from './toolkit/SentimentAnalysisTab';
import { RagTab } from './toolkit/RagTab';
import LearningParamsConfigTab from './toolkit/LearningParamsConfigTab';
import OmniSentryTab from './toolkit/OmniSentryTab';
import { GearsIcon } from './icons/GearsIcon';
import { useAppContext } from '../contexts/AppContext';
import { ToolkitTab } from '../types';
import { LivePaperBadge } from './LivePaperBadge';

interface AIToolkitProps {
    id: string; // New: Add ID prop for tour targeting
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
            className={`flex items-center space-x-2 px-3 py-3 text-sm font-medium rounded-md transition-all w-full text-left border ${
                activeTab === tab
                    ? 'bg-amber-600 border-amber-400 text-white shadow-[0_0_15px_rgba(245,158,11,0.4)]' 
                    : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-amber-400 hover:border-amber-500/50 hover:bg-slate-800'
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
        <div id={id} className="bg-black/40 backdrop-blur-md border border-slate-800 rounded-b-lg rounded-tr-lg shadow-lg flex flex-col lg:flex-row h-full glow-border flex-1 tech-panel">
            <div className="absolute top-2 right-2 z-50 lg:hidden">
                <LivePaperBadge />
            </div>
            <div className="w-full lg:w-48 p-4 border-b lg:border-b-0 lg:border-r border-slate-800 flex flex-row lg:flex-col gap-2 bg-black/60 overflow-x-auto">
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
            <div className="flex-1 p-4 lg:p-6 overflow-y-auto bg-black/20 relative">
                <div className="hidden lg:block absolute top-4 right-4">
                    <LivePaperBadge />
                </div>
                {renderTabContent()}
            </div>
        </div>
    );
};

export default AIToolkit;
