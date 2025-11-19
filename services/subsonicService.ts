import { Album, Playlist, Song, SubsonicCredentials } from "../types";

const APP_NAME = 'GeminiStream';
const CLIENT_VERSION = '1.0.0';

/**
 * Helper to build the query parameters for Subsonic Auth
 */
const getAuthParams = (creds: SubsonicCredentials) => {
  // In a production app, we should use md5(password + salt) and token.
  // For this implementation, we use plain auth (u & p) or hex encoded 'p' 
  // which works on most servers (Navidrome, Gonic, Airsonic).
  const params = new URLSearchParams();
  params.append('u', creds.username);
  if (creds.password) {
     // Simple hex encoding to avoid sending plain text in URL logs, 
     // though it's not true encryption.
     const hexPassword = creds.password.split('').map(c => c.charCodeAt(0).toString(16)).join('');
     params.append('p', `enc:${hexPassword}`);
  }
  params.append('v', '1.16.1');
  params.append('c', APP_NAME);
  params.append('f', 'json');
  return params.toString();
};

/**
 * Helper to get the full image URL
 */
export const getCoverArtUrl = (creds: SubsonicCredentials, id: string | undefined, size: number = 300): string => {
  if (!id) return 'https://picsum.photos/300/300'; // Fallback
  const baseUrl = creds.url.replace(/\/$/, '');
  const params = getAuthParams(creds);
  return `${baseUrl}/rest/getCoverArt?id=${id}&size=${size}&${params}`;
};

/**
 * Helper to get the stream URL
 */
export const getStreamUrl = (creds: SubsonicCredentials, id: string): string => {
  const baseUrl = creds.url.replace(/\/$/, '');
  const params = getAuthParams(creds);
  return `${baseUrl}/rest/stream?id=${id}&${params}`;
};

/**
 * Fetch Random Songs (used for "Recent/Home" mix to ensure playability)
 */
export const getRandomSongs = async (creds: SubsonicCredentials): Promise<Song[]> => {
  try {
    const baseUrl = creds.url.replace(/\/$/, '');
    const params = getAuthParams(creds);
    const response = await fetch(`${baseUrl}/rest/getRandomSongs?size=20&${params}`);
    const data = await response.json();
    
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
    console.error("Error fetching songs:", error);
    return [];
  }
};

/**
 * Fetch Recent Albums
 */
export const getRecentAlbums = async (creds: SubsonicCredentials): Promise<Album[]> => {
  try {
    const baseUrl = creds.url.replace(/\/$/, '');
    const params = getAuthParams(creds);
    // getAlbumList2 with type=newest returns recently added albums
    const response = await fetch(`${baseUrl}/rest/getAlbumList2?type=newest&size=10&${params}`);
    const data = await response.json();

    const albums = data['subsonic-response']?.albumList2?.album || [];

    return albums.map((a: any) => ({
      id: a.id,
      title: a.title || a.name,
      artist: a.artist,
      year: a.year,
      coverArt: getCoverArtUrl(creds, a.coverArt || a.id),
    }));
  } catch (error) {
    console.error("Error fetching albums:", error);
    return [];
  }
};

/**
 * Fetch Playlists
 */
export const getPlaylists = async (creds: SubsonicCredentials): Promise<Playlist[]> => {
  try {
    const baseUrl = creds.url.replace(/\/$/, '');
    const params = getAuthParams(creds);
    const response = await fetch(`${baseUrl}/rest/getPlaylists?${params}`);
    const data = await response.json();

    const playlists = data['subsonic-response']?.playlists?.playlist || [];

    return playlists.map((p: any) => ({
      id: p.id,
      name: p.name,
      songCount: p.songCount,
      coverArt: p.coverArt ? getCoverArtUrl(creds, p.coverArt) : 'https://picsum.photos/300/300?random=playlist', // Playlists might not have covers in all servers
    }));
  } catch (error) {
    console.error("Error fetching playlists:", error);
    return [];
  }
};

/**
 * Ping to check connection
 */
export const pingServer = async (creds: SubsonicCredentials): Promise<boolean> => {
  try {
    const baseUrl = creds.url.replace(/\/$/, '');
    const params = getAuthParams(creds);
    const response = await fetch(`${baseUrl}/rest/ping?${params}`);
    const data = await response.json();
    return data['subsonic-response']?.status === 'ok';
  } catch (error) {
    return false;
  }
};

// Mock fallback for demo mode
export const getMockSongs = (): Song[] => [
  { id: '1', title: 'Midnight City', artist: 'M83', album: 'Hurry Up, We\'re Dreaming', duration: 243, coverArt: 'https://picsum.photos/300/300?random=1' },
  { id: '2', title: 'Blinding Lights', artist: 'The Weeknd', album: 'After Hours', duration: 200, coverArt: 'https://picsum.photos/300/300?random=2' },
  { id: '3', title: 'Levitating', artist: 'Dua Lipa', album: 'Future Nostalgia', duration: 203, coverArt: 'https://picsum.photos/300/300?random=3' },
];

export const getMockAlbums = (): Album[] => [
    { id: 'a1', title: 'Random Access Memories', artist: 'Daft Punk', year: 2013, coverArt: 'https://picsum.photos/300/300?random=6' },
    { id: 'a2', title: 'Currents', artist: 'Tame Impala', year: 2015, coverArt: 'https://picsum.photos/300/300?random=7' },
];

export const getMockPlaylists = (): Playlist[] => [
    { id: 'p1', name: 'Driving Vibes', songCount: 42, coverArt: 'https://picsum.photos/300/300?random=10' },
];