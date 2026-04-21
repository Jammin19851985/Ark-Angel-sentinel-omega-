
import React, { useEffect, useRef } from 'react';
import { useAppContext } from '../contexts/AppContext';

const LiveWallpaper: React.FC = () => {
    const { wallpaperVideoSrc, wallpaperOpacity, wallpaperBlur } = useAppContext();
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (wallpaperVideoSrc) return; // If video exists, skip canvas

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let width = canvas.width = window.innerWidth;
        let height = canvas.height = window.innerHeight;

        const particles: { x: number; y: number; vx: number; vy: number; size: number }[] = [];
        const particleCount = Math.min(100, (width * height) / 15000); // Density control

        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                size: Math.random() * 2
            });
        }

        let animationFrameId: number;

        const draw = () => {
            // Dark trail effect
            ctx.fillStyle = 'rgba(2, 2, 3, 0.1)'; 
            ctx.fillRect(0, 0, width, height);

            ctx.fillStyle = 'rgba(0, 243, 255, 0.5)'; // Neon Cyan
            ctx.strokeStyle = 'rgba(0, 243, 255, 0.15)';

            particles.forEach((p, i) => {
                p.x += p.vx;
                p.y += p.vy;

                // Bounce
                if (p.x < 0 || p.x > width) p.vx *= -1;
                if (p.y < 0 || p.y > height) p.vy *= -1;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();

                // Connect nearby particles
                for (let j = i + 1; j < particles.length; j++) {
                    const p2 = particles[j];
                    const dx = p.x - p2.x;
                    const dy = p.y - p2.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < 150) {
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.stroke();
                    }
                }
            });

            animationFrameId = requestAnimationFrame(draw);
        };

        const handleResize = () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        };

        window.addEventListener('resize', handleResize);
        draw();

        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animationFrameId);
        };
    }, [wallpaperVideoSrc]);

    return (
        <div className="fixed inset-0 w-full h-full -z-50 overflow-hidden pointer-events-none bg-[#020203]">
            {wallpaperVideoSrc ? (
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute top-1/2 left-1/2 min-w-full min-h-full w-auto h-auto -translate-x-1/2 -translate-y-1/2 object-cover"
                    style={{ 
                        opacity: wallpaperOpacity, 
                        filter: `blur(${wallpaperBlur}px)` 
                    }}
                >
                    <source src={wallpaperVideoSrc} type="video/mp4" />
                </video>
            ) : (
                <canvas 
                    ref={canvasRef}
                    className="absolute inset-0 w-full h-full opacity-60"
                />
            )}
            {/* Unified Overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60 pointer-events-none"></div>
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none mix-blend-overlay"></div>
        </div>
    );
};

export default LiveWallpaper;
