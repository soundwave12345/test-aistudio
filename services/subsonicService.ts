import { Album, Playlist, Song } from "../types";

// Mock Data Generation
export const getRecentSongs = (): Song[] => [
  { id: '1', title: 'Midnight City', artist: 'M83', album: 'Hurry Up, We\'re Dreaming', duration: 243, coverArt: 'https://picsum.photos/300/300?random=1' },
  { id: '2', title: 'Blinding Lights', artist: 'The Weeknd', album: 'After Hours', duration: 200, coverArt: 'https://picsum.photos/300/300?random=2' },
  { id: '3', title: 'Levitating', artist: 'Dua Lipa', album: 'Future Nostalgia', duration: 203, coverArt: 'https://picsum.photos/300/300?random=3' },
  { id: '4', title: 'Do I Wanna Know?', artist: 'Arctic Monkeys', album: 'AM', duration: 272, coverArt: 'https://picsum.photos/300/300?random=4' },
  { id: '5', title: 'The Less I Know The Better', artist: 'Tame Impala', album: 'Currents', duration: 216, coverArt: 'https://picsum.photos/300/300?random=5' },
];

export const getRecentAlbums = (): Album[] => [
  { id: 'a1', title: 'Random Access Memories', artist: 'Daft Punk', year: 2013, coverArt: 'https://picsum.photos/300/300?random=6' },
  { id: 'a2', title: 'Currents', artist: 'Tame Impala', year: 2015, coverArt: 'https://picsum.photos/300/300?random=7' },
  { id: 'a3', title: 'Rumours', artist: 'Fleetwood Mac', year: 1977, coverArt: 'https://picsum.photos/300/300?random=8' },
  { id: 'a4', title: 'Abbey Road', artist: 'The Beatles', year: 1969, coverArt: 'https://picsum.photos/300/300?random=9' },
];

export const getRecentPlaylists = (): Playlist[] => [
  { id: 'p1', name: 'Driving Vibes', songCount: 42, coverArt: 'https://picsum.photos/300/300?random=10' },
  { id: 'p2', name: 'Workout Pumping', songCount: 15, coverArt: 'https://picsum.photos/300/300?random=11' },
  { id: 'p3', name: 'Late Night Coding', songCount: 128, coverArt: 'https://picsum.photos/300/300?random=12' },
];

export const getAllSongs = (): Song[] => [
    ...getRecentSongs(),
    { id: '6', title: 'Bohemian Rhapsody', artist: 'Queen', album: 'A Night at the Opera', duration: 354, coverArt: 'https://picsum.photos/300/300?random=13' },
    { id: '7', title: 'Hotel California', artist: 'Eagles', album: 'Hotel California', duration: 391, coverArt: 'https://picsum.photos/300/300?random=14' },
];
