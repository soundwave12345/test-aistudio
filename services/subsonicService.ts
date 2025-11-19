import { Album, Playlist, Song, SubsonicCredentials } from "../types";

const APP_NAME = 'GeminiStream';
const CLIENT_VERSION = '1.0.0';

/**
 * Internal helper to log and fetch
 */
const fetchWithLogging = async (url: string, endpoint: string) => {
  console.log(`[Subsonic] [${endpoint}] -> Requesting: ${url}`);
  try {
    const response = await fetch(url);
    console.log(`[Subsonic] [${endpoint}] <- Status: ${response.status} ${response.statusText}`);

    const text = await response.text();
    
    if (!response.ok) {
      console.error(`[Subsonic] [${endpoint}] Error Body:`, text);
      throw new Error(`HTTP ${response.status} - ${response.statusText}`);
    }

    try {
      const data = JSON.parse(text);
      return data;
    } catch (e) {
      console.error(`[Subsonic] [${endpoint}] Failed to parse JSON. Response was:`, text);
      throw new Error('Invalid JSON response from server');
    }
  } catch (error: any) {
    console.error(`[Subsonic] [${endpoint}] NETWORK ERROR:`, error);
    
    if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
       if (url.startsWith('http:') && window.location.protocol === 'https:') {
           console.error("!!! MIXED CONTENT ERROR !!!");
           console.error("You are trying to access an HTTP server from an HTTPS app.");
           console.error("Solution: Ensure capacitor.config.ts has 'androidScheme': 'http'.");
       }
    }
    
    throw error;
  }
};

const getAuthParams = (creds: SubsonicCredentials) => {
  const params = new URLSearchParams();
  params.append('u', creds.username);
  if (creds.password) {
     const hexPassword = creds.password.split('').map(c => c.charCodeAt(0).toString(16)).join('');
     params.append('p', `enc:${hexPassword}`);
  }
  params.append('v', '1.16.1');
  params.append('c', APP_NAME);
  params.append('f', 'json');
  return params.toString();
};

export const getCoverArtUrl = (creds: SubsonicCredentials, id: string | undefined, size: number = 300): string => {
  if (!id) return 'https://picsum.photos/300/300';
  const baseUrl = creds.url.replace(/\/$/, '');
  const params = getAuthParams(creds);
  return `${baseUrl}/rest/getCoverArt?id=${id}&size=${size}&${params}`;
};

export const getStreamUrl = (creds: SubsonicCredentials, id: string): string => {
  const baseUrl = creds.url.replace(/\/$/, '');
  const params = getAuthParams(creds);
  const url = `${baseUrl}/rest/stream?id=${id}&${params}`;
  // console.log(`[Subsonic] Generated Stream URL: ${url}`);
  return url;
};

export const getRandomSongs = async (creds: SubsonicCredentials): Promise<Song[]> => {
  try {
    const baseUrl = creds.url.replace(/\/$/, '');
    const params = getAuthParams(creds);
    const url = `${baseUrl}/rest/getRandomSongs?size=20&${params}`;
    
    const data = await fetchWithLogging(url, 'getRandomSongs');
    
    const songs = data['subsonic-response']?.randomSongs?.song || [];
    
    return songs.map((s: any) => ({
      id: s.id,
      title: s.title,
      artist: s.artist,
      album: s.album,
      coverArt: getCoverArtUrl(creds, s.coverArt || s.id),
      duration: s.duration,
    }));
  } catch (error) {
    console.error("[Subsonic] getRandomSongs failed:", error);
    return [];
  }
};

export const getRecentAlbums = async (creds: SubsonicCredentials): Promise<Album[]> => {
  try {
    const baseUrl = creds.url.replace(/\/$/, '');
    const params = getAuthParams(creds);
    const url = `${baseUrl}/rest/getAlbumList2?type=newest&size=10&${params}`;

    const data = await fetchWithLogging(url, 'getRecentAlbums');

    const albums = data['subsonic-response']?.albumList2?.album || [];

    return albums.map((a: any) => ({
      id: a.id,
      title: a.title || a.name,
      artist: a.artist,
      year: a.year,
      coverArt: getCoverArtUrl(creds, a.coverArt || a.id),
    }));
  } catch (error) {
    console.error("[Subsonic] getRecentAlbums failed:", error);
    return [];
  }
};

export const getPlaylists = async (creds: SubsonicCredentials): Promise<Playlist[]> => {
  try {
    const baseUrl = creds.url.replace(/\/$/, '');
    const params = getAuthParams(creds);
    const url = `${baseUrl}/rest/getPlaylists?${params}`;

    const data = await fetchWithLogging(url, 'getPlaylists');

    const playlists = data['subsonic-response']?.playlists?.playlist || [];

    return playlists.map((p: any) => ({
      id: p.id,
      name: p.name,
      songCount: p.songCount,
      coverArt: p.coverArt ? getCoverArtUrl(creds, p.coverArt) : 'https://picsum.photos/300/300?random=playlist',
    }));
  } catch (error) {
    console.error("[Subsonic] getPlaylists failed:", error);
    return [];
  }
};

export const getAlbumDetails = async (creds: SubsonicCredentials, albumId: string): Promise<Album | null> => {
    try {
        const baseUrl = creds.url.replace(/\/$/, '');
        const params = getAuthParams(creds);
        const url = `${baseUrl}/rest/getAlbum?id=${albumId}&${params}`;
    
        const data = await fetchWithLogging(url, 'getAlbumDetails');
        const albumData = data['subsonic-response']?.album;

        if (!albumData) return null;

        const songs = (albumData.song || []).map((s: any) => ({
            id: s.id,
            title: s.title,
            artist: s.artist,
            album: albumData.title || albumData.name,
            coverArt: getCoverArtUrl(creds, s.coverArt || s.id),
            duration: s.duration,
            track: s.track
        }));

        return {
            id: albumData.id,
            title: albumData.title || albumData.name,
            artist: albumData.artist,
            coverArt: getCoverArtUrl(creds, albumData.coverArt || albumData.id),
            year: albumData.year,
            songCount: albumData.songCount,
            songs: songs
        };

    } catch (error) {
        console.error("[Subsonic] getAlbumDetails failed:", error);
        return null;
    }
}

export const getPlaylistDetails = async (creds: SubsonicCredentials, playlistId: string): Promise<Playlist | null> => {
    try {
        const baseUrl = creds.url.replace(/\/$/, '');
        const params = getAuthParams(creds);
        const url = `${baseUrl}/rest/getPlaylist?id=${playlistId}&${params}`;
    
        const data = await fetchWithLogging(url, 'getPlaylistDetails');
        const playlistData = data['subsonic-response']?.playlist;

        if (!playlistData) return null;

        const songs = (playlistData.entry || []).map((s: any) => ({
            id: s.id,
            title: s.title,
            artist: s.artist,
            album: s.album,
            coverArt: getCoverArtUrl(creds, s.coverArt || s.id),
            duration: s.duration,
        }));

        return {
            id: playlistData.id,
            name: playlistData.name,
            songCount: playlistData.songCount,
            coverArt: playlistData.coverArt ? getCoverArtUrl(creds, playlistData.coverArt) : 'https://picsum.photos/300/300?random=playlist',
            songs: songs
        };

    } catch (error) {
        console.error("[Subsonic] getPlaylistDetails failed:", error);
        return null;
    }
}

// Mock fallback
export const getMockSongs = (): Song[] => [
  { id: '1', title: 'Debug Song 1', artist: 'Mock Artist', album: 'Debug Album', duration: 243, coverArt: 'https://picsum.photos/300/300?random=1' },
];

export const getMockAlbums = (): Album[] => [
    { id: 'a1', title: 'Debug Album', artist: 'Mock Artist', year: 2024, coverArt: 'https://picsum.photos/300/300?random=6' },
];

export const getMockPlaylists = (): Playlist[] => [
    { id: 'p1', name: 'Debug Playlist', songCount: 10, coverArt: 'https://picsum.photos/300/300?random=10' },
];