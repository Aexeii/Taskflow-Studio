import '../entities/track.dart';

abstract class MetadataReader {
  Future<Track> readTrack(String filePath);
}
