import React, { useState, useEffect } from 'react';

const GlobalFPSHUD: React.FC = () => {
    const [fps, setFps] = useState(60);
    const [mem, setMem] = useState(0);

    useEffect(() => {
        let frameCount = 0;
        let lastTime = performance.now();
        let animationFrameId: number;

        const loop = () => {
            const now = performance.now();
            frameCount++;
            if (now - lastTime >= 1000) {
                setFps(frameCount);
                frameCount = 0;
                lastTime = now;
                // Simulate memory slightly fluctuating
                setMem(64 + Math.random() * 2);
            }
            animationFrameId = requestAnimationFrame(loop);
        };
        loop();

        return () => cancelAnimationFrame(animationFrameId);
    }, []);

    return (
        <div className="fixed top-14 right-4 pointer-events-none z-[1000] flex gap-2 font-mono text-[8px] uppercase tracking-widest text-slate-500 opacity-80 backdrop-blur-sm bg-black/40 px-2 py-1 rounded border border-slate-800">
            <div className="flex gap-1 items-center">
                <span className={fps > 45 ? 'text-neon-green' : fps > 30 ? 'text-amber-400' : 'text-red-500'}>
                    FPS {fps}
                </span>
            </div>
            <div className="border-l border-slate-700 pl-2 flex gap-1 items-center">
                <span className="text-cyan-500">
                    MEM {mem.toFixed(1)}GB
                </span>
            </div>
            <div className="border-l border-slate-700 pl-2 flex gap-1 items-center">
                <span className="text-neon-pink">
                    NET OK
                </span>
            </div>
        </div>
    );
};

export default GlobalFPSHUD;
