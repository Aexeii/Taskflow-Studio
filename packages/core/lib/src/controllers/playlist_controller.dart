import '../entities/sample_data.dart';
import '../state/playlist_state.dart';

class PlaylistController {
  PlaylistState _state = PlaylistState(
    playlists: SampleData.playlists,
    selectedPlaylistId: SampleData.playlists.first.id,
  );

  PlaylistState get state => _state;

  void selectPlaylist(String playlistId) {
    _state = _state.copyWith(selectedPlaylistId: playlistId);
  }
}
