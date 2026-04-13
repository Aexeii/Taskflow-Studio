import '../entities/sample_data.dart';
import '../state/library_state.dart';

class LibraryController {
  LibraryState _state = LibraryState(tracks: SampleData.libraryTracks);

  LibraryState get state => _state;

  void setSearchQuery(String value) {
    _state = _state.copyWith(searchQuery: value);
  }
}
