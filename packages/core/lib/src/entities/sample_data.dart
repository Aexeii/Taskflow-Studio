import 'playlist.dart';
import 'track.dart';

class SampleData {
  static final List<Track> libraryTracks = <Track>[
    Track(
      id: '1',
      filePath: '/music/midnight-city.mp3',
      title: 'Midnight City',
      artist: 'M83',
      duration: const Duration(minutes: 4, seconds: 3),
      artworkUrl: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=600&q=80',
      previewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    ),
    Track(
      id: '2',
      filePath: '/music/blinding-lights.mp3',
      title: 'Blinding Lights',
      artist: 'The Weeknd',
      duration: const Duration(minutes: 3, seconds: 20),
      artworkUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=600&q=80',
      previewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    ),
    Track(
      id: '3',
      filePath: '/music/levitating.mp3',
      title: 'Levitating',
      artist: 'Dua Lipa',
      duration: const Duration(minutes: 3, seconds: 24),
      artworkUrl: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=600&q=80',
      previewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    ),
    Track(
      id: '4',
      filePath: '/music/weightless.mp3',
      title: 'Weightless',
      artist: 'Marconi Union',
      duration: const Duration(minutes: 7, seconds: 47),
      artworkUrl: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=600&q=80',
      previewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    ),
    Track(
      id: '5',
      filePath: '/music/sunset-lover.mp3',
      title: 'Sunset Lover',
      artist: 'Petit Biscuit',
      duration: const Duration(minutes: 3, seconds: 23),
      artworkUrl: 'https://images.unsplash.com/photo-1501612780327-45045538702b?auto=format&fit=crop&w=600&q=80',
      previewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
    ),
  ];

  static final List<Playlist> playlists = <Playlist>[
    Playlist(id: 'p1', name: 'Chill Vibes', tracks: libraryTracks),
    Playlist(id: 'p2', name: 'Morning Run', tracks: libraryTracks.take(3).toList()),
    Playlist(id: 'p3', name: 'Focus Mode', tracks: libraryTracks.reversed.toList()),
  ];
}
