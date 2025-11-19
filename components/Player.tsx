import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipForward, SkipBack, Sparkles, Volume2, VolumeX, Loader2 } from 'lucide-react';
import { Song } from '../types';
import { generateTrackAnnouncement } from '../services/geminiService';

interface PlayerProps {
  currentSong: Song | null;
  isPlaying: boolean;
  onPlayPause: () => void;
  onNext: () => void;
  onPrev: () => void;
}

const Player: React.FC<PlayerProps> = ({ currentSong, isPlaying, onPlayPause, onNext, onPrev }) => {
  const [isAnnouncing, setIsAnnouncing] = useState(false);
  const [announcementError, setAnnouncementError] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);

  if (!currentSong) {
    return null;
  }

  const handleAnnounce = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isAnnouncing) return;
    
    setIsAnnouncing(true);
    setAnnouncementError(false);

    try {
      const buffer = await generateTrackAnnouncement(currentSong.artist, currentSong.title);
      
      if (buffer) {
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        const ctx = audioContextRef.current;
        if (ctx.state === 'suspended') {
             await ctx.resume();
        }

        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        source.onended = () => setIsAnnouncing(false);
        source.start();
      } else {
        setAnnouncementError(true);
        setIsAnnouncing(false);
        setTimeout(() => setAnnouncementError(false), 3000);
      }
    } catch (err) {
      console.error("TTS Error", err);
      setAnnouncementError(true);
      setIsAnnouncing(false);
      setTimeout(() => setAnnouncementError(false), 3000);
    }
  };

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
          
          {/* Gemini TTS Button */}
           <button 
            onClick={handleAnnounce}
            disabled={isAnnouncing}
            className={`hidden sm:flex items-center justify-center w-8 h-8 rounded-full transition-all ${
                announcementError ? 'bg-red-500/20 text-red-500' : 
                isAnnouncing ? 'bg-subsonic-accent/20 text-subsonic-accent animate-pulse' : 'text-subsonic-secondary hover:text-subsonic-accent hover:bg-white/5'
            }`}
            title="Announce Track with AI"
          >
            {isAnnouncing ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
          </button>

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

        {/* Mobile TTS Button (visible only on mobile right side if space allows, otherwise hidden) */}
        <button 
            onClick={handleAnnounce}
            disabled={isAnnouncing}
            className={`sm:hidden flex items-center justify-center w-8 h-8 rounded-full transition-all ${
                announcementError ? 'bg-red-500/20 text-red-500' : 
                isAnnouncing ? 'bg-subsonic-accent/20 text-subsonic-accent animate-pulse' : 'text-subsonic-secondary hover:text-subsonic-accent'
            }`}
          >
             {isAnnouncing ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={18} />}
        </button>

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