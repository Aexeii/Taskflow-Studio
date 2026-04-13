import '../entities/playlist.dart';

abstract class PlaylistRepository {
  Future<List<Playlist>> loadPlaylists();
  Future<void> savePlaylist(Playlist playlist);
}
