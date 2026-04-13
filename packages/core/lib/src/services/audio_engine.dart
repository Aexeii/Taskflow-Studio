abstract class AudioEngine {
  Future<void> load(String source);
  Future<void> play();
  Future<void> pause();
  Future<void> stop();
  Future<void> seek(Duration position);
  Future<void> setVolume(double value);
  Stream<Duration> get positionStream;
  Stream<void> get completedStream;
}
