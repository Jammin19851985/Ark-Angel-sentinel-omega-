
import React, { useRef, useEffect, useState } from 'react';

const ChaosFractal: React.FC<{ entropy: number }> = ({ entropy }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isHyperActive, setIsHyperActive] = useState(false);
    const [rotation, setRotation] = useState({ x: 0, y: 0 });

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        setRotation({ x: y * -20, y: x * 20 }); // Max 20deg tilt
    };

    const handleMouseLeave = () => setRotation({ x: 0, y: 0 });

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        
        // Lorenz Attractor Parameters
        let x = 0.1, y = 0, z = 0;
        const a = 10;
        const b = 28;
        const c = 8.0 / 3.0;
        const dt = 0.01;
        
        const points: {x: number, y: number, z: number, hue: number}[] = [];
        let hue = 0;

        const draw = () => {
            // Fade out previous frame for trails
            ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Speed multiplier based on entropy and interaction
            const steps = isHyperActive ? 20 : 5 + Math.floor(entropy * 10);
            const scale = 3.5;
            const cx = canvas.width / 2;
            const cy = canvas.height / 2;

            ctx.lineWidth = isHyperActive ? 2 : 1;

            for (let i = 0; i < steps; i++) {
                const dx = (a * (y - x)) * dt;
                const dy = (x * (b - z) - y) * dt;
                const dz = (x * y - c * z) * dt;

                x += dx;
                y += dy;
                z += dz;

                hue = (hue + 0.5) % 360;
                points.push({ x, y, z, hue });
                if (points.length > 500) points.shift(); // Limit trail length

                // Project 3D to 2D (Simple isometric-ish projection)
                // Rotate points slowly over time
                const time = Date.now() * 0.0005;
                const rx = x * Math.cos(time) - z * Math.sin(time);
                const rz = x * Math.sin(time) + z * Math.cos(time);

                const screenX = cx + rx * scale;
                const screenY = cy + (y * scale) + (isHyperActive ? Math.random() * 2 : 0);

                ctx.beginPath();
                if (points.length > 1) {
                    const prev = points[points.length - 2];
                    const prx = prev.x * Math.cos(time) - prev.z * Math.sin(time);
                    const prevScreenX = cx + prx * scale;
                    const prevScreenY = cy + (prev.y * scale);
                    ctx.moveTo(prevScreenX, prevScreenY);
                    ctx.lineTo(screenX, screenY);
                }
                
                // Color dynamic: Shift towards Neon Green/Pink
                // Hue 120 is Green, 300 is Pink/Magenta
                // We oscillate between them based on Z depth
                const baseHue = (rz * 50) + (isHyperActive ? 300 : 120); 
                const color = isHyperActive 
                    ? `hsl(${baseHue}, 100%, 60%)` 
                    : `hsla(${baseHue}, 80%, 60%, 0.7)`;
                
                ctx.strokeStyle = color;
                ctx.stroke();
            }

            animationFrameId = requestAnimationFrame(draw);
        };

        draw();
        return () => cancelAnimationFrame(animationFrameId);
    }, [entropy, isHyperActive]);

    return (
        <div 
            ref={containerRef}
            className="relative w-full h-40 perspective-1000 cursor-pointer group"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onClick={() => setIsHyperActive(!isHyperActive)}
        >
            <div 
                className="w-full h-full relative transition-transform duration-100 ease-out preserve-3d"
                style={{ 
                    transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) scale(${isHyperActive ? 0.95 : 1})`,
                    boxShadow: isHyperActive ? '0 0 30px rgba(57, 255, 20, 0.4)' : 'none'
                }}
            >
                {/* 3D Glass Casing */}
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
                    <canvas ref={canvasRef} width={300} height={200} className="w-full h-full object-cover" />
                    
                    {/* Holographic Overlay UI */}
                    <div className="absolute top-2 left-3 flex flex-col pointer-events-none">
                        <span className="text-[9px] font-bold text-neon-green font-mono tracking-widest animate-pulse">CHAOS_ENGINE v1.1</span>
                        <span className="text-[7px] text-cyan-700 font-mono">LORENZ_ATTRACTOR_RUNNING</span>
                    </div>

                    <div className="absolute bottom-2 right-3 pointer-events-none text-right">
                        <div className="text-[8px] text-slate-500 font-mono">ENTROPY</div>
                        <div className={`text-xs font-bold font-mono ${isHyperActive ? 'text-neon-pink glitch-text' : 'text-neon-green'}`}>
                            {isHyperActive ? 'MAX_LOAD' : entropy.toFixed(4)}
                        </div>
                    </div>

                    {/* Interactive 'Button' feel */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-neon-green/5 to-white/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                </div>
                
                {/* Floating Shadow */}
                <div className="absolute -bottom-4 left-4 right-4 h-4 bg-neon-green/20 blur-xl rounded-[100%] opacity-0 group-hover:opacity-60 transition-opacity duration-500 transform translate-z-[-20px]"></div>
            </div>
        </div>
    );
};

export default ChaosFractal;
