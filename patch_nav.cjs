const fs = require('fs');
let content = fs.readFileSync('components/NavigationDeck.tsx', 'utf8');

const target1 = `const CyberKey: React.FC<{view: ActiveView, label: string, icon: React.ReactNode, id: string, activeView: ActiveView, onClick: () => void }> = ({ view, label, icon, id, activeView, onClick }) => {
    const isActive = activeView === view;
    return (
        <button 
            id={id}
            onClick={onClick}
            className={\`cyber-button cyber-key flex items-center justify-center space-x-1.5 px-2 py-1.5 md:py-2 w-full lg:w-auto flex-1 transition-all duration-200 \${isActive ? 'active shadow-[inset_0_0_15px_rgba(6,182,212,0.3)] border-cyan-500 text-cyan-400' : 'opacity-70 hover:opacity-100 hover:border-cyan-500/50 hover:text-white'}\`}
        >
            <div className={\`p-0.5 rounded \${isActive ? 'bg-cyan-900/50 text-cyan-400 drop-shadow-[0_0_5px_rgba(0,243,255,0.8)]' : 'text-slate-500 group-hover:text-cyan-400'}\`}>{icon}</div>
            <span className={\`hidden xl:inline text-[9px] md:text-[10px] font-bold tracking-wider uppercase \${isActive ? 'text-cyan-400 glow-text-cyan' : 'text-slate-500'}\`}>{label}</span>
        </button>
    );
};`;

const replacement1 = `const CyberKey: React.FC<{view: ActiveView, label: string, icon: React.ReactNode, id: string, activeView: ActiveView, onClick: () => void, isNew?: boolean }> = ({ view, label, icon, id, activeView, onClick, isNew }) => {
    const isActive = activeView === view;
    return (
        <button 
            id={id}
            onClick={onClick}
            className={\`cyber-button cyber-key relative flex items-center justify-center space-x-1.5 px-2 py-1.5 md:py-2 w-full lg:w-auto flex-1 transition-all duration-200 \${isActive ? 'active shadow-[inset_0_0_15px_rgba(6,182,212,0.3)] border-cyan-500 text-cyan-400' : 'opacity-70 hover:opacity-100 hover:border-cyan-500/50 hover:text-white'}\`}
        >
            {isNew && (
                <div className="absolute -top-1 -right-1 flex h-2 w-2 z-10">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                </div>
            )}
            <div className={\`p-0.5 rounded \${isActive ? 'bg-cyan-900/50 text-cyan-400 drop-shadow-[0_0_5px_rgba(0,243,255,0.8)]' : 'text-slate-500 group-hover:text-cyan-400'}\`}>{icon}</div>
            <span className={\`hidden xl:inline text-[9px] md:text-[10px] font-bold tracking-wider uppercase \${isActive ? 'text-cyan-400 glow-text-cyan' : 'text-slate-500'}\`}>{label}</span>
        </button>
    );
};`;

const target2 = `            <CyberKey 
                view="keep" 
                label="Mnemosyne" 
                icon={<BookOpenIcon className="w-2.5 h-2.5 text-cyan-400"/>} 
                id="tab-keep" 
                activeView={activeView} 
                onClick={() => handleViewChange('keep')} 
            />
            <CyberKey 
                view="gdrive" 
                label="Workspace" 
                icon={<HardDrive className="w-2.5 h-2.5 text-cyan-400"/>} 
                id="tab-gdrive" 
                activeView={activeView} 
                onClick={() => handleViewChange('gdrive')} 
            />
            <CyberKey 
                view="banking" 
                label="Banking" 
                icon={<BookOpenIcon className="w-2.5 h-2.5 text-cyan-400"/>} 
                id="tab-banking" 
                activeView={activeView} 
                onClick={() => handleViewChange('banking')} 
            />`;

const replacement2 = `            <CyberKey 
                view="keep" 
                label="Mnemosyne" 
                icon={<BookOpenIcon className="w-2.5 h-2.5 text-amber-400"/>} 
                id="tab-keep" 
                activeView={activeView} 
                onClick={() => handleViewChange('keep')}
                isNew={true}
            />
            <CyberKey 
                view="gdrive" 
                label="Workspace" 
                icon={<HardDrive className="w-2.5 h-2.5 text-amber-400"/>} 
                id="tab-gdrive" 
                activeView={activeView} 
                onClick={() => handleViewChange('gdrive')}
                isNew={true}
            />
            <CyberKey 
                view="banking" 
                label="Banking" 
                icon={<BookOpenIcon className="w-2.5 h-2.5 text-amber-400"/>} 
                id="tab-banking" 
                activeView={activeView} 
                onClick={() => handleViewChange('banking')}
                isNew={true}
            />`;

if (content.includes(target1) && content.includes(target2)) {
    content = content.replace(target1, replacement1);
    content = content.replace(target2, replacement2);
    fs.writeFileSync('components/NavigationDeck.tsx', content);
    console.log('Patched NavigationDeck.tsx successfully');
} else {
    console.log('Target not found in NavigationDeck.tsx');
}
