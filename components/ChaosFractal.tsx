
import React, { useRef, useEffect } from 'react';

const ChaosFractal: React.FC<{ entropy: number }> = ({ entropy }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        let time = 0;

        const draw = () => {
            time += 0.01 + (entropy * 0.05);
            ctx.fillStyle = 'rgba(5, 5, 5, 0.1)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            const size = 60 + (entropy * 40);

            ctx.beginPath();
            ctx.strokeStyle = `hsla(${200 + entropy * 100}, 100%, 50%, 0.5)`;
            ctx.lineWidth = 0.5;

            for (let i = 0; i < 200; i++) {
                const angle = i * (Math.PI * 2 / 100) + time;
                const r = size * Math.sin(angle * (2 + entropy * 10));
                const x = centerX + r * Math.cos(angle);
                const y = centerY + r * Math.sin(angle);
                
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }

            ctx.stroke();
            animationFrameId = requestAnimationFrame(draw);
        };

        draw();
        return () => cancelAnimationFrame(animationFrameId);
    }, [entropy]);

    return (
        <div className="relative w-full h-full bg-black/40 border border-slate-800 rounded-lg overflow-hidden group">
            <canvas ref={canvasRef} width={200} height={200} className="w-full h-full opacity-60 group-hover:opacity-100 transition-opacity" />
            <div className="absolute top-2 left-2 pointer-events-none">
                <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest">Chaos Engine v1.1</span>
            </div>
            <div className="absolute bottom-2 right-2 pointer-events-none">
                <span className="text-[9px] font-mono text-cyan-400">ENTROPY: {entropy.toFixed(4)}</span>
            </div>
        </div>
    );
};

export default ChaosFractal;
