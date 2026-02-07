import React, { useState, useRef, useEffect } from 'react';
import { Music, Volume2, Pause } from 'lucide-react';

const MusicPlayer: React.FC = () => {
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        // Calm Lo-Fi Track
        const audio = new Audio('https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lo-fi-chill-medium-version-120935.mp3');
        audio.loop = true;
        audio.volume = 0.4;
        audioRef.current = audio;

        // Attempt to play on mount (will likely be blocked by browsers until interaction)
        const attemptPlay = async () => {
            try {
                await audio.play();
                setIsPlaying(true);
            } catch (err) {
                // Autoplay blocked, user must interact first
                console.log("Autoplay blocked");
                setIsPlaying(false);
            }
        };

        attemptPlay();

        return () => {
            audio.pause();
            audioRef.current = null;
        };
    }, []);

    const togglePlay = () => {
        if (!audioRef.current) return;
        
        if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
        } else {
            audioRef.current.play().catch(e => console.error("Play failed", e));
            setIsPlaying(true);
        }
    };

    return (
        <div className="fixed bottom-6 left-6 z-[60] flex flex-col items-center gap-2 animate-[fadeIn_1s_ease-out]">
            <button
                onClick={togglePlay}
                className={`
                    group relative flex items-center justify-center w-14 h-14 rounded-full shadow-2xl transition-all duration-500
                    ${isPlaying ? 'bg-white border-2 border-bac-blue/20 scale-105' : 'bg-white/90 backdrop-blur-md border border-brand-200 hover:scale-105'}
                `}
                title={isPlaying ? "Désactiver la musique" : "Activer l'ambiance zen"}
            >
                {/* Ping animation when playing */}
                {isPlaying && (
                    <span className="absolute inset-0 rounded-full animate-ping bg-bac-blue/10 duration-[2s]"></span>
                )}
                
                {isPlaying ? (
                    <div className="flex gap-1 items-end h-5 mb-1 justify-center w-6">
                         <span className="w-1 bg-bac-blue rounded-t-full animate-[music-bar_0.6s_ease-in-out_infinite]"></span>
                         <span className="w-1 bg-bac-blue rounded-t-full animate-[music-bar_0.8s_ease-in-out_infinite_0.1s]"></span>
                         <span className="w-1 bg-bac-blue rounded-t-full animate-[music-bar_0.5s_ease-in-out_infinite_0.2s]"></span>
                         <span className="w-1 bg-bac-blue rounded-t-full animate-[music-bar_0.7s_ease-in-out_infinite_0.3s]"></span>
                    </div>
                ) : (
                    <div className="relative">
                        <Music className="w-6 h-6 text-brand-400 group-hover:text-bac-blue transition-colors" />
                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-brand-300 rounded-full group-hover:bg-bac-blue transition-colors"></div>
                    </div>
                )}
            </button>
            
            {/* Tooltip bubble on hover */}
            <div className={`
                absolute left-full ml-4 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-brand-900/90 backdrop-blur text-white text-xs font-bold rounded-xl 
                transition-all duration-300 pointer-events-none whitespace-nowrap
                ${isPlaying ? 'opacity-0 group-hover:opacity-100 translate-x-0' : 'opacity-100 translate-x-0'}
            `}>
                {isPlaying ? "Pause" : "Mode Zen 🎵"}
                <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 border-4 border-transparent border-r-brand-900/90"></div>
            </div>
            
            <style>{`
                @keyframes music-bar {
                    0%, 100% { height: 20%; }
                    50% { height: 100%; }
                }
            `}</style>
        </div>
    );
};

export default MusicPlayer;