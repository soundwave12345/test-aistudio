import React, { useState, useEffect } from 'react';
import { MobileBottomNav, DesktopSidebar } from './components/Navigation';
import Header from './components/Header';
import SettingsModal from './components/SettingsModal';
import MediaCard from './components/MediaCard';
import Player from './components/Player';
import { SubsonicCredentials, ViewState, Song, Album, Playlist } from './types';
import { 
  getRecentAlbums, 
  getPlaylists, 
  getRandomSongs,
  getMockSongs,
  getMockAlbums,
  getMockPlaylists
} from './services/subsonicService';

const App: React.FC = () => {
  // --- State ---
  const [activeTab, setActiveTab] = useState<ViewState>(ViewState.HOME);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // Init creds from local storage
  const [isDemoMode, setIsDemoMode] = useState(() => {
    return localStorage.getItem('subsonic_demo') !== 'false';
  });
  
  const [credentials, setCredentials] = useState<SubsonicCredentials>(() => {
    const saved = localStorage.getItem('subsonic_creds');
    return saved ? JSON.parse(saved) : {
      url: 'https://music.demo.com',
      username: 'guest',
      password: '',
    };
  });

  // Player State
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPlayerExpanded, setIsPlayerExpanded] = useState(false);

  // Data State
  const [songs, setSongs] = useState<Song[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);

  // --- Effects ---
  useEffect(() => {
    const fetchData = async () => {
      if (isDemoMode) {
        setSongs(getMockSongs());
        setAlbums(getMockAlbums());
        setPlaylists(getMockPlaylists());
      } else {
        console.log("Fetching from real server: ", credentials.url);
        try {
          const [fetchedSongs, fetchedAlbums, fetchedPlaylists] = await Promise.all([
            getRandomSongs(credentials),
            getRecentAlbums(credentials),
            getPlaylists(credentials)
          ]);
          setSongs(fetchedSongs);
          setAlbums(fetchedAlbums);
          setPlaylists(fetchedPlaylists);
        } catch (e) {
          console.error("Failed to fetch data", e);
        }
      }
    };

    fetchData();
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
    // Automatically expand player if desired, or keep mini
    setIsPlayerExpanded(true);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleNext = () => {
    if (!currentSong) return;
    const idx = songs.findIndex(s => s.id === currentSong.id);
    if (idx === -1 && songs.length > 0) {
        setCurrentSong(songs[0]);
        return;
    }
    const nextIdx = (idx + 1) % songs.length;
    setCurrentSong(songs[nextIdx]);
    setIsPlaying(true);
  };

  const handlePrev = () => {
     if (!currentSong) return;
    const idx = songs.findIndex(s => s.id === currentSong.id);
    if (idx === -1 && songs.length > 0) {
        setCurrentSong(songs[0]);
        return;
    }
    const prevIdx = (idx - 1 + songs.length) % songs.length;
    setCurrentSong(songs[prevIdx]);
    setIsPlaying(true);
  };

  // --- Render Content ---
  const renderContent = () => {
    switch (activeTab) {
      case ViewState.HOME:
        return (
          <div className="space-y-8 pb-32 animate-in fade-in duration-500">
            {/* Songs Section */}
            <section className="space-y-3">
               <div className="flex items-center justify-between px-4">
                <h2 className="text-lg font-bold text-white">Mix</h2>
                <button className="text-xs text-subsonic-primary font-semibold" onClick={() => setActiveTab(ViewState.SONGS)}>See All</button>
              </div>
              <div className="flex overflow-x-auto px-4 gap-4 pb-4 hide-scrollbar snap-x snap-mandatory">
                {songs.map((song) => (
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

            {/* Albums Section */}
            <section className="space-y-3">
              <div className="flex items-center justify-between px-4">
                <h2 className="text-lg font-bold text-white">Recent Albums</h2>
                <button className="text-xs text-subsonic-primary font-semibold" onClick={() => setActiveTab(ViewState.ALBUMS)}>See All</button>
              </div>
              <div className="flex overflow-x-auto px-4 gap-4 pb-4 hide-scrollbar snap-x snap-mandatory">
                {albums.map((album) => (
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

             {/* Playlists Section */}
             <section className="space-y-3">
              <div className="flex items-center justify-between px-4">
                <h2 className="text-lg font-bold text-white">Playlists</h2>
                <button className="text-xs text-subsonic-primary font-semibold" onClick={() => setActiveTab(ViewState.PLAYLISTS)}>See All</button>
              </div>
              <div className="flex overflow-x-auto px-4 gap-4 pb-4 hide-scrollbar snap-x snap-mandatory">
                {playlists.map((playlist) => (
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
             {playlists.length === 0 ? <div className="text-gray-500 col-span-full text-center">No playlists found</div> : 
               playlists.map((playlist, i) => (
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
             {albums.length === 0 ? <div className="text-gray-500 col-span-full text-center">No albums found</div> :
               albums.map((album, i) => (
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
             {songs.length === 0 ? <div className="text-gray-500 col-span-full text-center">No songs found</div> :
               songs.map((song) => (
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

        {/* Player handles its own fixed positioning and full screen mode */}
        <Player 
          currentSong={currentSong} 
          isPlaying={isPlaying}
          onPlayPause={togglePlayPause}
          onNext={handleNext}
          onPrev={handlePrev}
          credentials={credentials}
          isExpanded={isPlayerExpanded}
          onExpand={() => setIsPlayerExpanded(true)}
          onCollapse={() => setIsPlayerExpanded(false)}
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