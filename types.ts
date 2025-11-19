export interface SubsonicCredentials {
  url: string;
  username: string;
  password?: string; 
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  coverArt: string;
  duration: number; // seconds
  streamUrl?: string; // Optional, generated on demand
}

export interface Album {
  id: string;
  title: string;
  artist: string;
  coverArt: string;
  year?: number;
}

export interface Playlist {
  id: string;
  name: string;
  songCount: number;
  coverArt: string;
}

export enum ViewState {
  HOME = 'HOME',
  PLAYLISTS = 'PLAYLISTS',
  ALBUMS = 'ALBUMS',
  SONGS = 'SONGS'
}

export type SubsonicContextType = {
  credentials: SubsonicCredentials;
  updateCredentials: (creds: SubsonicCredentials) => void;
  isDemoMode: boolean;
  setDemoMode: (isDemo: boolean) => void;
};