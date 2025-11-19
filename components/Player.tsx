import React from 'react';
import { Play, Pause, SkipForward, SkipBack } from 'lucide-react';
import { Song } from '../types';

interface PlayerProps {
  currentSong: Song | null;
  isPlaying: boolean;
  onPlayPause: () => void;
  onNext: () => void;
  onPrev: () => void;
}

const Player: React.FC<PlayerProps> = ({ currentSong, isPlaying, onPlayPause, onNext, onPrev }) => {
  if (!currentSong) {
    return null;
  }

  return (
    <div className="fixed z-40 bg-[#252525] border-t border-white/5 px-4 py-3 shadow-2xl
                    left-0 right-0 
                    bottom-[80px] md:bottom-0 
                    md:left-64 md:h-[90px] md:flex md:items-center">
      
      <div className="w-full max-w-screen-xl mx-auto flex items-center justify-between gap-3">
        
        {/* Info */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <img 
            src={currentSong.coverArt} 
            alt="Cover" 
            className={`w-10 h-10 rounded bg-gray-800 object-cover ${isPlaying ? 'animate-[spin_10s_linear_infinite]' : ''}`}
          />
          <div className="flex flex-col min-w-0">
            <h4 className="text-sm font-bold text-white truncate leading-tight">{currentSong.title}</h4>
            <p className="text-xs text-subsonic-secondary truncate">{currentSong.artist}</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4">
          
          <button onClick={onPrev} className="text-white hover:text-subsonic-primary transition-colors">
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

        {/* Right spacer for alignment if needed, or volume controls in future */}
        <div className="hidden sm:block w-8"></div> 

      </div>
      
      {/* Progress Bar (Visual only for demo) */}
      <div className="absolute top-0 left-0 w-full h-0.5 bg-white/10">
        <div 
            className="h-full bg-subsonic-primary transition-all duration-500 ease-linear" 
            style={{ width: isPlaying ? '45%' : '45%' }} 
        />
      </div>
    </div>
  );
};

export default Player;