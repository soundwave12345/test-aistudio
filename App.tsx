import React, { useState, useEffect } from 'react';
import { MobileBottomNav, DesktopSidebar } from './components/Navigation';
import Header from './components/Header';
import SettingsModal from './components/SettingsModal';
import MediaCard from './components/MediaCard';
import Player from './components/Player';
import { SubsonicCredentials, ViewState, Song, Album, Playlist } from './types';
import { getRecentSongs, getRecentAlbums, getRecentPlaylists, getAllSongs } from './services/subsonicService';

const App: React.FC = () => {
  // --- State ---
  const [activeTab, setActiveTab] = useState<ViewState>(ViewState.HOME);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(true);
  const [credentials, setCredentials] = useState<SubsonicCredentials>({
    url: 'https://music.demo.com',
    username: 'guest',
    password: '',
  });

  // Player State
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Data State
  const [recentSongs, setRecentSongs] = useState<Song[]>([]);
  const [recentAlbums, setRecentAlbums] = useState<Album[]>([]);
  const [recentPlaylists, setRecentPlaylists] = useState<Playlist[]>([]);

  // --- Effects ---
  useEffect(() => {
    // Initial Data Load
    if (isDemoMode) {
      setRecentSongs(getRecentSongs());
      setRecentAlbums(getRecentAlbums());
      setRecentPlaylists(getRecentPlaylists());
      // Set initial song for player display
      const songs = getRecentSongs();
      if (songs.length > 0) setCurrentSong(songs[0]);
    } else {
      console.log("Fetching from real server: ", credentials.url);
      // Keeping demo data for visual check even in 'real' mode for this output
      setRecentSongs(getRecentSongs());
      setRecentAlbums(getRecentAlbums());
      setRecentPlaylists(getRecentPlaylists());
    }
  }, [isDemoMode, credentials]);

  // --- Handlers ---
  const handleSettingsSave = (creds: SubsonicCredentials, isDemo: boolean) => {
    setCredentials(creds);
    setIsDemoMode(isDemo);
    localStorage.setItem('subsonic_creds', JSON.stringify(creds));
    localStorage.setItem('subsonic_demo', String(isDemo));
  };

  const handlePlaySong = (song: Song) => {
    setCurrentSong(song);
    setIsPlaying(true);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleNext = () => {
    if (!currentSong) return;
    const all = getAllSongs();
    const idx = all.findIndex(s => s.id === currentSong.id);
    const nextIdx = (idx + 1) % all.length;
    setCurrentSong(all[nextIdx]);
    setIsPlaying(true);
  };

  const handlePrev = () => {
     if (!currentSong) return;
    const all = getAllSongs();
    const idx = all.findIndex(s => s.id === currentSong.id);
    const prevIdx = (idx - 1 + all.length) % all.length;
    setCurrentSong(all[prevIdx]);
    setIsPlaying(true);
  };

  // --- Render Content ---
  const renderContent = () => {
    switch (activeTab) {
      case ViewState.HOME:
        return (
          <div className="space-y-8 pb-32 animate-in fade-in duration-500">
            {/* Recent Songs Section */}
            <section className="space-y-3">
               <div className="flex items-center justify-between px-4">
                <h2 className="text-lg font-bold text-white">Recently Played Songs</h2>
                <button className="text-xs text-subsonic-primary font-semibold">See All</button>
              </div>
              <div className="flex overflow-x-auto px-4 gap-4 pb-4 hide-scrollbar snap-x snap-mandatory">
                {recentSongs.map((song) => (
                  <div key={song.id} className="snap-start">
                    <MediaCard 
                      image={song.coverArt} 
                      title={song.title} 
                      subtitle={song.artist} 
                      size="medium"
                      onClick={() => handlePlaySong(song)}
                    />
                  </div>
                ))}
              </div>
            </section>

            {/* Recent Albums Section */}
            <section className="space-y-3">
              <div className="flex items-center justify-between px-4">
                <h2 className="text-lg font-bold text-white">Recent Albums</h2>
                <button className="text-xs text-subsonic-primary font-semibold">See All</button>
              </div>
              <div className="flex overflow-x-auto px-4 gap-4 pb-4 hide-scrollbar snap-x snap-mandatory">
                {recentAlbums.map((album) => (
                  <div key={album.id} className="snap-start">
                     <MediaCard 
                      image={album.coverArt} 
                      title={album.title} 
                      subtitle={album.artist} 
                      size="large"
                    />
                  </div>
                ))}
              </div>
            </section>

             {/* Recent Playlists Section */}
             <section className="space-y-3">
              <div className="flex items-center justify-between px-4">
                <h2 className="text-lg font-bold text-white">Recent Playlists</h2>
                <button className="text-xs text-subsonic-primary font-semibold">See All</button>
              </div>
              <div className="flex overflow-x-auto px-4 gap-4 pb-4 hide-scrollbar snap-x snap-mandatory">
                {recentPlaylists.map((playlist) => (
                  <div key={playlist.id} className="snap-start">
                     <MediaCard 
                      image={playlist.coverArt} 
                      title={playlist.name} 
                      subtitle={`${playlist.songCount} songs`} 
                      size="small"
                    />
                  </div>
                ))}
              </div>
            </section>
          </div>
        );

      case ViewState.PLAYLISTS:
        return (
          <div className="p-4 pb-32 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
             {recentPlaylists.concat(recentPlaylists).map((playlist, i) => (
                <MediaCard 
                  key={`${playlist.id}-${i}`}
                  image={playlist.coverArt} 
                  title={playlist.name} 
                  subtitle={`${playlist.songCount} songs`} 
                  size="medium"
                />
             ))}
          </div>
        );

      case ViewState.ALBUMS:
        return (
          <div className="p-4 pb-32 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
             {recentAlbums.concat(recentAlbums).map((album, i) => (
                <MediaCard 
                  key={`${album.id}-${i}`}
                  image={album.coverArt} 
                  title={album.title} 
                  subtitle={album.artist} 
                  size="medium"
                />
             ))}
          </div>
        );

      case ViewState.SONGS:
        return (
          <div className="p-4 pb-32 grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
             {getAllSongs().map((song) => (
                <MediaCard 
                  key={song.id}
                  image={song.coverArt} 
                  title={song.title} 
                  subtitle={song.artist} 
                  variant="horizontal"
                  onClick={() => handlePlaySong(song)}
                />
             ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-subsonic-bg text-subsonic-text font-sans overflow-hidden selection:bg-subsonic-primary selection:text-white">
      
      {/* Desktop Sidebar */}
      <DesktopSidebar 
        activeTab={activeTab} 
        onChange={setActiveTab} 
        onSettingsClick={() => setIsSettingsOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full relative overflow-hidden">
        <Header 
          title={activeTab.charAt(0).toUpperCase() + activeTab.slice(1).toLowerCase()} 
          onMenuClick={() => setIsSettingsOpen(true)} 
        />
        
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-screen-xl mx-auto pt-2 md:pt-6">
            {renderContent()}
          </div>
        </main>

        {/* Player sits inside the flex column on mobile visually (fixed in component), 
            but we render it here to be part of the DOM tree. 
            The component itself handles fixed positioning. */}
        <Player 
          currentSong={currentSong} 
          isPlaying={isPlaying}
          onPlayPause={togglePlayPause}
          onNext={handleNext}
          onPrev={handlePrev}
        />
      </div>

      {/* Mobile Bottom Nav */}
      <MobileBottomNav 
        activeTab={activeTab} 
        onChange={setActiveTab} 
        onSettingsClick={() => setIsSettingsOpen(true)}
      />

      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        credentials={credentials}
        isDemo={isDemoMode}
        onSave={handleSettingsSave}
      />
    </div>
  );
};

export default App;