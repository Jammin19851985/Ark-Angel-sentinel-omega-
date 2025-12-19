
import React from 'react';
import { useAppContext } from '../contexts/AppContext';

const LiveWallpaper: React.FC = () => {
    const { wallpaperVideoSrc } = useAppContext();

    if (!wallpaperVideoSrc) {
        return null; // Fallback to CSS background if no video is set
    }

    return (
        <div className="fixed inset-0 w-full h-full -z-50 overflow-hidden pointer-events-none">
            <video
                autoPlay
                loop
                muted
                playsInline
                className="absolute top-1/2 left-1/2 min-w-full min-h-full w-auto h-auto -translate-x-1/2 -translate-y-1/2 object-cover opacity-60"
            >
                <source src={wallpaperVideoSrc} type="video/mp4" />
                Your browser does not support the video tag.
            </video>
            {/* Overlay to ensure text readability */}
            <div className="absolute inset-0 bg-black/40 mix-blend-overlay"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40"></div>
        </div>
    );
};

export default LiveWallpaper;
