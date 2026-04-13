import '../state/player_state.dart';

class PlaybackController {
  PlaybackController({
    required PlayerState initialState,
  }) : _state = initialState;

  PlayerState _state;

  PlayerState get state => _state;

  void togglePlayback() {
    _state = _state.copyWith(isPlaying: !_state.isPlaying);
  }

  void setTrackIndex(int index) {
    if (_state.queue.isEmpty) {
      return;
    }
    if (index < 0 || index >= _state.queue.length) {
      return;
    }
    _state = _state.copyWith(currentIndex: index, isPlaying: true, progress: 0);
  }

  void next() {
    if (_state.queue.isEmpty) {
      return;
    }
    final int nextIndex = (_state.currentIndex + 1) % _state.queue.length;
    _state = _state.copyWith(currentIndex: nextIndex, isPlaying: true, progress: 0);
  }

  void previous() {
    if (_state.queue.isEmpty) {
      return;
    }
    final int previousIndex =
        (_state.currentIndex - 1 + _state.queue.length) % _state.queue.length;
    _state = _state.copyWith(currentIndex: previousIndex, isPlaying: true, progress: 0);
  }

  void setProgress(double value) {
    _state = _state.copyWith(progress: value.clamp(0, 1));
  }

  void setVolume(double value) {
    _state = _state.copyWith(volume: value.clamp(0, 1));
  }

  void toggleShuffle() {
    _state = _state.copyWith(shuffleEnabled: !_state.shuffleEnabled);
  }

  void toggleRepeat() {
    _state = _state.copyWith(repeatEnabled: !_state.repeatEnabled);
  }
}
