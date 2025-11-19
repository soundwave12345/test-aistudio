import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, SkipForward, SkipBack, ChevronDown, Shuffle, Repeat, Cast } from 'lucide-react';
import { Song, SubsonicCredentials } from '../types';
import { getStreamUrl } from '../services/subsonicService';

interface PlayerProps {
  currentSong: Song | null;
  isPlaying: boolean;
  onPlayPause: () => void;
  onNext: () => void;
  onPrev: () => void;
  credentials: SubsonicCredentials;
  isExpanded: boolean;
  onExpand: () => void;
  onCollapse: () => void;
}

const Player: React.FC<PlayerProps> = ({ 
  currentSong, 
  isPlaying, 
  onPlayPause, 
  onNext, 
  onPrev, 
  credentials,
  isExpanded,
  onExpand,
  onCollapse
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  
  // --- AUDIO LOGIC ---
  // Handle Audio Source
  useEffect(() => {
    if (currentSong && audioRef.current) {
      const url = getStreamUrl(credentials, currentSong.id);
      if (audioRef.current.src !== url) {
        audioRef.current.src = url;
        audioRef.current.play()
          .catch(e => console.error("Autoplay blocked", e));
      }
    }
  }, [currentSong, credentials]);

  // Handle Play/Pause toggle
  useEffect(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
        audioRef.current.play().catch(e => console.warn("Play failed", e));
    } else {
        audioRef.current.pause();
    }
  }, [isPlaying]);

  // Time Update Loop
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const cur = audioRef.current.currentTime;
      const dur = audioRef.current.duration;
      setCurrentTime(cur);
      if (dur && !isNaN(dur)) setProgress((cur / dur) * 100);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (audioRef.current) {
      const val = Number(e.target.value);
      const dur = audioRef.current.duration;
      if (dur && !isNaN(dur)) {
        audioRef.current.currentTime = (val / 100) * dur;
        setProgress(val);
      }
    }
  };

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // --- CHROMECAST ---
  const handleCast = () => {
    if (window.cast && window.cast.framework) {
      window.cast.framework.CastContext.getInstance().requestSession();
    } else {
      alert("Chromecast not available. Ensure you are using Chrome or a supported browser on a secure connection.");
    }
  };

  // --- UI RENDERING ---

  return (
    <>
      {/* 1. Full Screen Player UI - Z-Index increased to 60 to cover bottom nav (z-50) */}
      {currentSong && isExpanded && (
        <div className="fixed inset-0 z-[60] bg-subsonic-bg flex flex-col animate-in slide-in-from-bottom duration-300">
            {/* Background Blur */}
            <div 
              className="absolute inset-0 z-0 opacity-30 blur-3xl scale-125 transition-all duration-1000" 
              style={{ backgroundImage: `url(${currentSong.coverArt})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
            />
            <div className="absolute inset-0 z-0 bg-black/50" />

            {/* Header */}
            <div className="relative z-10 flex items-center justify-between px-6 py-8 md:py-6">
              <button onClick={onCollapse} className="text-white hover:text-subsonic-primary p-2 rounded-full hover:bg-white/10 transition-all">
                <ChevronDown size={32} />
              </button>
              <span className="text-xs font-bold tracking-widest uppercase text-white/80">Now Playing</span>
              {/* Cast Button */}
              <button onClick={handleCast} className="text-white hover:text-subsonic-primary p-2">
                 <Cast size={24} />
              </button>
            </div>

            {/* Album Art */}
            <div className="relative z-10 flex-1 flex items-center justify-center p-8 min-h-0">
              <div className="w-full max-w-xs md:max-w-md aspect-square rounded-2xl overflow-hidden shadow-2xl border border-white/10 ring-1 ring-white/5">
                <img 
                  src={currentSong.coverArt} 
                  alt="Cover" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Info & Controls */}
            <div className="relative z-10 pb-12 px-8 w-full max-w-2xl mx-auto">
              <div className="mb-8 text-center md:text-left">
                <h2 className="text-2xl md:text-3xl font-bold text-white truncate">{currentSong.title}</h2>
                <p className="text-lg text-subsonic-secondary truncate mt-2">{currentSong.artist}</p>
                <p className="text-sm text-white/50 truncate">{currentSong.album}</p>
              </div>

              {/* Progress */}
              <div className="mb-8">
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={progress} 
                  onChange={handleSeek}
                  className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-subsonic-primary hover:accent-white transition-colors"
                />
                <div className="flex justify-between mt-2 text-xs font-medium text-white/60">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(currentSong.duration)}</span>
                </div>
              </div>

              {/* Main Controls */}
              <div className="flex flex-col gap-8">
                  <div className="flex items-center justify-between px-4 md:px-12">
                     <button className="text-subsonic-secondary hover:text-white transition-colors">
                        <Shuffle size={20} />
                     </button>
                     
                     <div className="flex items-center gap-8">
                        <button onClick={onPrev} className="text-white hover:text-subsonic-primary transition-colors active:scale-95">
                            <SkipBack size={36} fill="currentColor" />
                        </button>
                        
                        <button 
                            onClick={onPlayPause} 
                            className="w-20 h-20 flex items-center justify-center rounded-full bg-white text-black hover:scale-105 active:scale-95 transition-transform shadow-lg shadow-white/10"
                        >
                            {isPlaying ? <Pause size={36} fill="currentColor" /> : <Play size={36} fill="currentColor" className="ml-1" />}
                        </button>

                        <button onClick={onNext} className="text-white hover:text-subsonic-primary transition-colors active:scale-95">
                            <SkipForward size={36} fill="currentColor" />
                        </button>
                     </div>

                     <button className="text-subsonic-secondary hover:text-white transition-colors">
                        <Repeat size={20} />
                     </button>
                  </div>
              </div>
            </div>
        </div>
      )}

      {/* 2. Mini Player UI - Always visible when not expanded, z-index just below full screen */}
      {currentSong && !isExpanded && (
        <div 
          onClick={onExpand}
          className="fixed z-40 bg-[#252525]/95 backdrop-blur-md border-t border-white/10 px-4 py-3 shadow-2xl
                        left-0 right-0 
                        bottom-[80px] md:bottom-0 
                        md:left-64 md:h-[90px] md:flex md:items-center cursor-pointer hover:bg-[#2a2a2a] transition-colors group"
        >
          <div className="w-full max-w-screen-xl mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <img 
                src={currentSong.coverArt} 
                alt="Cover" 
                className={`w-10 h-10 rounded bg-gray-800 object-cover shadow-sm`}
              />
              <div className="flex flex-col min-w-0">
                <h4 className="text-sm font-bold text-white truncate leading-tight">{currentSong.title}</h4>
                <p className="text-xs text-subsonic-secondary truncate">{currentSong.artist}</p>
              </div>
            </div>

            {/* Mini Player Controls - Explicitly added Play/Pause here */}
            <div className="flex items-center gap-4" onClick={(e) => e.stopPropagation()}>
              <button onClick={onPrev} className="text-white hover:text-subsonic-primary transition-colors hidden sm:block">
                <SkipBack size={20} fill="currentColor" />
              </button>
              
              <button 
                onClick={onPlayPause} 
                className="w-10 h-10 flex items-center justify-center rounded-full bg-white text-black hover:scale-105 transition-transform shadow-lg shadow-white/10"
              >
                {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-0.5" />}
              </button>

              <button onClick={onNext} className="text-white hover:text-subsonic-primary transition-colors">
                <SkipForward size={20} fill="currentColor" />
              </button>
            </div>
            <div className="hidden sm:block w-8"></div> 
          </div>
          
          {/* Mini Progress Bar */}
          <div className="absolute top-0 left-0 w-full h-0.5 bg-white/10">
            <div 
                className="h-full bg-subsonic-primary transition-all duration-500 ease-linear" 
                style={{ width: `${progress}%` }} 
            />
          </div>
        </div>
      )}

      {/* 3. Persistent Audio Element */}
      {currentSong && (
          <audio 
          ref={audioRef} 
          onTimeUpdate={handleTimeUpdate}
          onEnded={onNext}
          onError={(e) => console.error("Audio error", e)}
        />
      )}
    </>
  );
};

export default Player;