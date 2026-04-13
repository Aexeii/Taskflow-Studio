import '../entities/track.dart';

class LibraryState {
  final List<Track> tracks;
  final String searchQuery;

  const LibraryState({
    required this.tracks,
    this.searchQuery = '',
  });

  List<Track> get filteredTracks {
    final String query = searchQuery.trim().toLowerCase();
    if (query.isEmpty) {
      return tracks;
    }

    return tracks.where((Track track) {
      return track.title.toLowerCase().contains(query) ||
          track.artist.toLowerCase().contains(query);
    }).toList();
  }

  LibraryState copyWith({
    List<Track>? tracks,
    String? searchQuery,
  }) {
    return LibraryState(
      tracks: tracks ?? this.tracks,
      searchQuery: searchQuery ?? this.searchQuery,
    );
  }
}
