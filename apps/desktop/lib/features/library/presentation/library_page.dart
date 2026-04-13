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
  String _activeSection = 'library';

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
    final Playlist? selectedPlaylist = playlistState.selectedPlaylist;
    final List<Track> visibleTracks = _activeSection == 'playlists' && selectedPlaylist != null
        ? selectedPlaylist.tracks
        : libraryState.filteredTracks;

    return Scaffold(
      backgroundColor: const Color(0xFF0F1115),
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
                    _playlistController.selectPlaylist(playlistId);
                    _activeSection = 'playlists';
                    _refresh();
                  },
                  onNewPlaylist: () {},
                ),
                Expanded(
                  child: Padding(
                    padding: const EdgeInsets.fromLTRB(28, 28, 28, 20),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: <Widget>[
                        Row(
                          children: <Widget>[
                            Expanded(
                              child: SearchField(
                                hintText: 'Search tracks or artists',
                                onChanged: (String value) {
                                  _libraryController.setSearchQuery(value);
                                  _refresh();
                                },
                              ),
                            ),
                            const SizedBox(width: 18),
                            FilledButton.icon(
                              onPressed: () {},
                              icon: const Icon(Icons.folder_open_rounded),
                              label: const Text('Import Folder'),
                            ),
                          ],
                        ),
                        const SizedBox(height: 26),
                        Text(
                          _activeSection == 'playlists'
                              ? (selectedPlaylist?.name ?? 'Playlist')
                              : 'Your Library',
                          style: AppTypography.pageTitle,
                        ),
                        const SizedBox(height: 10),
                        Text(
                          _activeSection == 'playlists'
                              ? '${selectedPlaylist?.tracks.length ?? 0} tracks in this playlist'
                              : '${libraryState.filteredTracks.length} tracks available',
                          style: const TextStyle(color: Color(0xFF9AA4B2)),
                        ),
                        const SizedBox(height: 24),
                        Expanded(
                          child: Row(
                            children: <Widget>[
                              Expanded(
                                flex: 5,
                                child: TrackList(
                                  tracks: visibleTracks,
                                  currentTrackId: playerState.currentTrack?.id,
                                  onTrackTap: (int index) {
                                    final Track selectedTrack = visibleTracks[index];
                                    final int queueIndex = SampleData.libraryTracks.indexWhere(
                                      (Track track) => track.id == selectedTrack.id,
                                    );
                                    if (queueIndex >= 0) {
                                      _playbackController.setTrackIndex(queueIndex);
                                      _refresh();
                                    }
                                  },
                                ),
                              ),
                              const SizedBox(width: 20),
                              SizedBox(
                                width: 280,
                                child: Column(
                                  children: <Widget>[
                                    Expanded(
                                      child: PlaylistCard(
                                        title: selectedPlaylist?.name ?? 'Library Mix',
                                        subtitle: 'A polished starter desktop shell for your future production app.',
                                        onTap: () {},
                                      ),
                                    ),
                                    const SizedBox(height: 18),
                                    Expanded(
                                      child: Container(
                                        padding: const EdgeInsets.all(20),
                                        decoration: BoxDecoration(
                                          color: const Color(0xFF171A21),
                                          borderRadius: BorderRadius.circular(20),
                                        ),
                                        child: Column(
                                          crossAxisAlignment: CrossAxisAlignment.start,
                                          children: <Widget>[
                                            const Text('Up Next', style: AppTypography.sectionTitle),
                                            const SizedBox(height: 16),
                                            Expanded(
                                              child: ListView.builder(
                                                itemCount: SampleData.libraryTracks.length,
                                                itemBuilder: (BuildContext context, int index) {
                                                  final Track track = SampleData.libraryTracks[index];
                                                  return ListTile(
                                                    dense: true,
                                                    contentPadding: EdgeInsets.zero,
                                                    title: Text(
                                                      track.title,
                                                      maxLines: 1,
                                                      overflow: TextOverflow.ellipsis,
                                                    ),
                                                    subtitle: Text(
                                                      track.artist,
                                                      maxLines: 1,
                                                      overflow: TextOverflow.ellipsis,
                                                    ),
                                                  );
                                                },
                                              ),
                                            ),
                                          ],
                                        ),
                                      ),
                                    ),
                                  ],
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
            onVolumeChanged: (double value) {
              _playbackController.setVolume(value);
              _refresh();
            },
            onShuffleToggle: () {
              _playbackController.toggleShuffle();
              _refresh();
            },
            onRepeatToggle: () {
              _playbackController.toggleRepeat();
              _refresh();
            },
          ),
        ],
      ),
    );
  }
}
