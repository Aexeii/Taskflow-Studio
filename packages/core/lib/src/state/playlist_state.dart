import '../entities/playlist.dart';

class PlaylistState {
  final List<Playlist> playlists;
  final String? selectedPlaylistId;

  const PlaylistState({
    required this.playlists,
    this.selectedPlaylistId,
  });

  Playlist? get selectedPlaylist {
    if (selectedPlaylistId == null) {
      return playlists.isEmpty ? null : playlists.first;
    }

    for (final Playlist playlist in playlists) {
      if (playlist.id == selectedPlaylistId) {
        return playlist;
      }
    }
    return playlists.isEmpty ? null : playlists.first;
  }

  PlaylistState copyWith({
    List<Playlist>? playlists,
    String? selectedPlaylistId,
  }) {
    return PlaylistState(
      playlists: playlists ?? this.playlists,
      selectedPlaylistId: selectedPlaylistId ?? this.selectedPlaylistId,
    );
  }
}
