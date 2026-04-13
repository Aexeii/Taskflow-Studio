import 'package:core/core.dart';
import 'package:flutter/material.dart';
import 'package:ui_kit/ui_kit.dart';

class LibraryPage extends StatefulWidget {
  const LibraryPage({super.key});

  @override
  State<LibraryPage> createState() => _LibraryPageState();
}

class _LibraryPageState extends State<LibraryPage> {
  final LibraryController _libraryController = LibraryController();
  final PlaylistController _playlistController = PlaylistController();
  late PlaybackController _playbackController;
  int _currentTabIndex = 0;

  @override
  void initState() {
    super.initState();
    _playbackController = PlaybackController(
      initialState: PlayerState(queue: SampleData.libraryTracks),
    );
  }

  void _refresh() {
    setState(() {});
  }

  @override
  Widget build(BuildContext context) {
    final LibraryState libraryState = _libraryController.state;
    final PlaylistState playlistState = _playlistController.state;
    final PlayerState playerState = _playbackController.state;
    final List<Widget> pages = <Widget>[
      _LibraryTab(
        libraryState: libraryState,
        currentTrackId: playerState.currentTrack?.id,
        onSearchChanged: (String value) {
          _libraryController.setSearchQuery(value);
          _refresh();
        },
        onTrackTap: (int index) {
          _playbackController.setTrackIndex(index);
          _refresh();
        },
      ),
      _PlaylistsTab(
        playlistState: playlistState,
        onPlaylistTap: (String playlistId) {
          _playlistController.selectPlaylist(playlistId);
          _refresh();
        },
      ),
      _NowPlayingTab(
        playerState: playerState,
        onPlayPause: () {
          _playbackController.togglePlayback();
          _refresh();
        },
        onNext: () {
          _playbackController.next();
          _refresh();
        },
        onPrevious: () {
          _playbackController.previous();
          _refresh();
        },
        onSeek: (double value) {
          _playbackController.setProgress(value);
          _refresh();
        },
      ),
    ];

    return Scaffold(
      backgroundColor: const Color(0xFF0F1115),
      body: SafeArea(child: pages[_currentTabIndex]),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _currentTabIndex,
        onDestinationSelected: (int value) {
          _currentTabIndex = value;
          _refresh();
        },
        destinations: const <Widget>[
          NavigationDestination(icon: Icon(Icons.library_music_rounded), label: 'Library'),
          NavigationDestination(icon: Icon(Icons.queue_music_rounded), label: 'Playlists'),
          NavigationDestination(icon: Icon(Icons.play_circle_fill_rounded), label: 'Now Playing'),
        ],
      ),
    );
  }
}

class _LibraryTab extends StatelessWidget {
  final LibraryState libraryState;
  final String? currentTrackId;
  final ValueChanged<String> onSearchChanged;
  final ValueChanged<int> onTrackTap;

  const _LibraryTab({
    required this.libraryState,
    required this.currentTrackId,
    required this.onSearchChanged,
    required this.onTrackTap,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          const Text('Your Library', style: AppTypography.pageTitle),
          const SizedBox(height: 18),
          SearchField(
            hintText: 'Search tracks',
            onChanged: onSearchChanged,
          ),
          const SizedBox(height: 18),
          Expanded(
            child: TrackList(
              tracks: libraryState.filteredTracks,
              currentTrackId: currentTrackId,
              showAlbumColumn: false,
              onTrackTap: onTrackTap,
            ),
          ),
        ],
      ),
    );
  }
}

class _PlaylistsTab extends StatelessWidget {
  final PlaylistState playlistState;
  final ValueChanged<String> onPlaylistTap;

  const _PlaylistsTab({
    required this.playlistState,
    required this.onPlaylistTap,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          const Text('Playlists', style: AppTypography.pageTitle),
          const SizedBox(height: 18),
          Expanded(
            child: GridView.builder(
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                crossAxisSpacing: 14,
                mainAxisSpacing: 14,
                childAspectRatio: 0.95,
              ),
              itemCount: playlistState.playlists.length,
              itemBuilder: (BuildContext context, int index) {
                final Playlist playlist = playlistState.playlists[index];
                return PlaylistCard(
                  title: playlist.name,
                  subtitle: '${playlist.tracks.length} tracks',
                  onTap: () => onPlaylistTap(playlist.id),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}

class _NowPlayingTab extends StatelessWidget {
  final PlayerState playerState;
  final VoidCallback onPlayPause;
  final VoidCallback onNext;
  final VoidCallback onPrevious;
  final ValueChanged<double> onSeek;

  const _NowPlayingTab({
    required this.playerState,
    required this.onPlayPause,
    required this.onNext,
    required this.onPrevious,
    required this.onSeek,
  });

  String _formatDuration(Duration duration) {
    final int minutes = duration.inMinutes;
    final int seconds = duration.inSeconds % 60;
    return '$minutes:${seconds.toString().padLeft(2, '0')}';
  }

  @override
  Widget build(BuildContext context) {
    final Track? track = playerState.currentTrack;
    return Padding(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: <Widget>[
          const SizedBox(height: 12),
          Container(
            width: double.infinity,
            height: 320,
            decoration: BoxDecoration(
              color: const Color(0xFF171A21),
              borderRadius: BorderRadius.circular(28),
            ),
            child: const Icon(Icons.album_rounded, size: 100, color: Color(0xFF3DDC97)),
          ),
          const SizedBox(height: 28),
          Text(
            track?.title ?? 'No track selected',
            textAlign: TextAlign.center,
            style: const TextStyle(fontSize: 28, fontWeight: FontWeight.w700),
          ),
          const SizedBox(height: 8),
          Text(
            track?.artist ?? 'Choose something from your library',
            style: const TextStyle(color: Color(0xFF9AA4B2), fontSize: 16),
          ),
          const SizedBox(height: 22),
          Slider(
            value: playerState.progress,
            onChanged: onSeek,
          ),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: <Widget>[
              Text(_formatDuration(Duration(milliseconds: ((track?.duration.inMilliseconds ?? 0) * playerState.progress).round()))),
              Text(_formatDuration(track?.duration ?? Duration.zero)),
            ],
          ),
          const Spacer(),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: <Widget>[
              IconButton(onPressed: onPrevious, icon: const Icon(Icons.skip_previous_rounded, size: 36)),
              const SizedBox(width: 18),
              FilledButton(
                onPressed: onPlayPause,
                style: FilledButton.styleFrom(
                  shape: const CircleBorder(),
                  padding: const EdgeInsets.all(24),
                ),
                child: Icon(playerState.isPlaying ? Icons.pause_rounded : Icons.play_arrow_rounded, size: 32),
              ),
              const SizedBox(width: 18),
              IconButton(onPressed: onNext, icon: const Icon(Icons.skip_next_rounded, size: 36)),
            ],
          ),
          const SizedBox(height: 24),
        ],
      ),
    );
  }
}
