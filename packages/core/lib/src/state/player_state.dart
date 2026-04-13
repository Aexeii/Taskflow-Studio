import '../entities/track.dart';

class PlayerState {
  final List<Track> queue;
  final int currentIndex;
  final bool isPlaying;
  final double progress;
  final double volume;
  final bool shuffleEnabled;
  final bool repeatEnabled;

  const PlayerState({
    required this.queue,
    this.currentIndex = 0,
    this.isPlaying = false,
    this.progress = 0,
    this.volume = 0.72,
    this.shuffleEnabled = false,
    this.repeatEnabled = false,
  });

  Track? get currentTrack {
    if (queue.isEmpty || currentIndex < 0 || currentIndex >= queue.length) {
      return null;
    }
    return queue[currentIndex];
  }

  PlayerState copyWith({
    List<Track>? queue,
    int? currentIndex,
    bool? isPlaying,
    double? progress,
    double? volume,
    bool? shuffleEnabled,
    bool? repeatEnabled,
  }) {
    return PlayerState(
      queue: queue ?? this.queue,
      currentIndex: currentIndex ?? this.currentIndex,
      isPlaying: isPlaying ?? this.isPlaying,
      progress: progress ?? this.progress,
      volume: volume ?? this.volume,
      shuffleEnabled: shuffleEnabled ?? this.shuffleEnabled,
      repeatEnabled: repeatEnabled ?? this.repeatEnabled,
    );
  }
}
