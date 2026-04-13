import 'package:core/core.dart';
import 'package:flutter/material.dart';
import 'package:ui_kit/ui_kit.dart';

import '../application/web_companion_controller.dart';

class HomePage extends StatefulWidget {
  const HomePage({super.key});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  late final WebCompanionController _controller;
  String _activeSection = 'library';

  @override
  void initState() {
    super.initState();
    _controller = WebCompanionController();
    _controller.addListener(_refresh);
  }

  @override
  void dispose() {
    _controller.removeListener(_refresh);
    _controller.dispose();
    super.dispose();
  }

  void _refresh() {
    setState(() {});
  }

  @override
  Widget build(BuildContext context) {
    final LibraryState libraryState = _controller.libraryController.state;
    final PlaylistState playlistState = _controller.playlistController.state;
    final PlayerState playerState = _controller.playbackController.state;
    final Playlist? selectedPlaylist = playlistState.selectedPlaylist;
    final List<Track> likedTracks = _controller.likedTracks();
    final List<Track> recentTracks = _controller.recentTracks();
    final List<Track> visibleTracks = _activeSection == 'playlists' && selectedPlaylist != null
        ? selectedPlaylist.tracks
        : _activeSection == 'liked'
            ? likedTracks
            : _activeSection == 'recent'
                ? recentTracks
        : libraryState.filteredTracks;

    return Scaffold(
      body: Column(
        children: <Widget>[
          Expanded(
            child: Row(
              children: <Widget>[
                Sidebar(
                  activeSection: _activeSection,
                  playlists: playlistState.playlists
                      .map((Playlist playlist) => SidebarPlaylistItem(id: playlist.id, name: playlist.name))
                      .toList(),
                  onSectionSelected: (String value) {
                    _activeSection = value;
                    _refresh();
                  },
                  onPlaylistSelected: (String playlistId) {
                    _controller.selectPlaylist(playlistId);
                    _activeSection = 'playlists';
                    _refresh();
                  },
                  onNewPlaylist: () {},
                ),
                Expanded(
                  child: SingleChildScrollView(
                    padding: const EdgeInsets.fromLTRB(28, 28, 28, 24),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: <Widget>[
                        Row(
                          children: <Widget>[
                            Expanded(
                              child: SearchField(
                                hintText: 'Search tracks, artists, or playlists',
                                onChanged: (String value) {
                                  _controller.setSearchQuery(value);
                                  _refresh();
                                },
                              ),
                            ),
                            const SizedBox(width: 16),
                            FilledButton.icon(
                              onPressed: () {
                                _activeSection = 'recent';
                                _refresh();
                              },
                              icon: const Icon(Icons.cloud_upload_rounded),
                              label: const Text('Open Recent'),
                            ),
                          ],
                        ),
                        const SizedBox(height: 28),
                        Text(
                          _activeSection == 'playlists'
                              ? (selectedPlaylist?.name ?? 'Playlist')
                              : _activeSection == 'liked'
                                  ? 'Liked Tracks'
                                  : _activeSection == 'recent'
                                      ? 'Recently Played'
                              : 'Aero Music Web',
                          style: AppTypography.pageTitle,
                        ),
                        const SizedBox(height: 8),
                        const Text(
                          'A browser companion for discovery, queue review, and synced listening controls.',
                          style: TextStyle(color: Color(0xFF9AA4B2)),
                        ),
                        const SizedBox(height: 28),
                        Row(
                          children: <Widget>[
                            Expanded(
                              child: SizedBox(
                                height: 160,
                                child: PlaylistCard(
                                  title: 'Library Overview',
                                  subtitle: '${libraryState.filteredTracks.length} tracks ready in the shared mock library.',
                                  icon: Icons.library_music_rounded,
                                  onTap: () {
                                    _activeSection = 'library';
                                    _refresh();
                                  },
                                ),
                              ),
                            ),
                            const SizedBox(width: 16),
                            Expanded(
                              child: SizedBox(
                                height: 160,
                                child: PlaylistCard(
                                  title: 'Active Playlist',
                                  subtitle: selectedPlaylist == null
                                      ? 'Choose a playlist from the sidebar.'
                                      : '${selectedPlaylist.name} with ${selectedPlaylist.tracks.length} tracks.',
                                  icon: Icons.queue_music_rounded,
                                  onTap: () {
                                    _activeSection = 'playlists';
                                    _refresh();
                                  },
                                ),
                              ),
                            ),
                            const SizedBox(width: 16),
                            Expanded(
                              child: SizedBox(
                                height: 160,
                                child: PlaylistCard(
                                  title: 'Now Playing',
                                  subtitle: playerState.currentTrack == null
                                      ? 'No track selected.'
                                      : '${playerState.currentTrack!.title} by ${playerState.currentTrack!.artist}',
                                  icon: Icons.graphic_eq_rounded,
                                  onTap: () {
                                    if (playerState.currentTrack != null) {
                                      _controller.toggleLike(playerState.currentTrack!.id);
                                      _refresh();
                                    }
                                  },
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 24),
                        Container(
                          height: 520,
                          decoration: BoxDecoration(
                            color: const Color(0xFF10141B),
                            borderRadius: BorderRadius.circular(24),
                          ),
                          padding: const EdgeInsets.all(16),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: <Widget>[
                              Row(
                                children: <Widget>[
                                  Expanded(
                                    child: Text(
                                      _activeSection == 'liked'
                                          ? 'Tracks you liked in this browser'
                                          : _activeSection == 'recent'
                                              ? 'Your recent plays are saved locally'
                                              : 'Click any track to start browser playback',
                                      style: const TextStyle(color: Color(0xFF9AA4B2)),
                                    ),
                                  ),
                                  if (playerState.currentTrack != null)
                                    TextButton.icon(
                                      onPressed: () {
                                        _controller.toggleLike(playerState.currentTrack!.id);
                                        _refresh();
                                      },
                                      icon: Icon(
                                        _controller.likedTrackIds.contains(playerState.currentTrack!.id)
                                            ? Icons.favorite_rounded
                                            : Icons.favorite_border_rounded,
                                      ),
                                      label: const Text('Like Current'),
                                    ),
                                ],
                              ),
                              const SizedBox(height: 12),
                              Expanded(
                                child: TrackList(
                                  tracks: visibleTracks,
                                  currentTrackId: playerState.currentTrack?.id,
                                  onTrackTap: (int index) {
                                    _controller.playTrack(visibleTracks[index]);
                                    _refresh();
                                  },
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
          PlayerBar(
            state: playerState,
            onPlayPause: () {
              _controller.togglePlayback();
              _refresh();
            },
            onNext: () {
              _controller.nextTrack();
              _refresh();
            },
            onPrevious: () {
              _controller.previousTrack();
              _refresh();
            },
            onSeek: (double value) {
              _controller.seek(value);
              _refresh();
            },
            onVolumeChanged: (double value) {
              _controller.setVolume(value);
              _refresh();
            },
            onShuffleToggle: () {
              _controller.toggleShuffle();
              _refresh();
            },
            onRepeatToggle: () {
              _controller.toggleRepeat();
              _refresh();
            },
          ),
        ],
      ),
    );
  }
}
