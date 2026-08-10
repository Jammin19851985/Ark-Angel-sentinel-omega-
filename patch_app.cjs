const fs = require('fs');
let content = fs.readFileSync('App.tsx', 'utf8');

const targetImports = `import React, { useState, useEffect, useCallback } from 'react';`;
const replacementImports = `import React, { useState, useEffect, useCallback } from 'react';

const NewFeatureBadge = () => (
    <div className="absolute -top-1.5 -right-1.5 z-[100] flex">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
        <div className="relative bg-amber-500 text-black text-[8px] md:text-[9px] font-bold px-1.5 py-0.5 rounded shadow-[0_0_15px_rgba(245,158,11,1)] border border-amber-200 tracking-widest uppercase">
            NEW
        </div>
    </div>
);`;

const target1 = `                            <div className="hidden lg:flex lg:col-span-3 xl:col-span-2 flex-col gap-3 min-h-0 perspective-[2000px]">
                                <HardwareController />`;
const replacement1 = `                            <div className="hidden lg:flex lg:col-span-3 xl:col-span-2 flex-col gap-3 min-h-0 perspective-[2000px]">
                                <div className="relative">
                                    <NewFeatureBadge />
                                    <HardwareController />
                                </div>`;

const target2 = `                            <div className="hidden lg:flex lg:col-span-3 xl:col-span-2 flex-col gap-3 min-h-0 perspective-[2000px]">
                                <SovereignCommandCenter />
                                <div className="flex-[4] min-h-0 overflow-visible">
                                    <OmniCoreAgent id="omnicore-agent" />
                                </div>`;
const replacement2 = `                            <div className="hidden lg:flex lg:col-span-3 xl:col-span-2 flex-col gap-3 min-h-0 perspective-[2000px]">
                                <div className="relative">
                                    <NewFeatureBadge />
                                    <SovereignCommandCenter />
                                </div>
                                <div className="flex-[4] min-h-0 overflow-visible relative">
                                    <NewFeatureBadge />
                                    <OmniCoreAgent id="omnicore-agent" />
                                </div>`;

if (content.includes(targetImports) && content.includes(target1) && content.includes(target2)) {
    content = content.replace(targetImports, replacementImports);
    content = content.replace(target1, replacement1);
    content = content.replace(target2, replacement2);
    fs.writeFileSync('App.tsx', content);
    console.log('Patched App.tsx successfully');
} else {
    console.log('Target not found in App.tsx');
    if (!content.includes(targetImports)) console.log('targetImports not found');
    if (!content.includes(target1)) console.log('target1 not found');
    if (!content.includes(target2)) console.log('target2 not found');
}
