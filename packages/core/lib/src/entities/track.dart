class Track {
  final String id;
  final String filePath;
  final String title;
  final String artist;
  final Duration duration;
  final String? artworkUrl;
  final String? previewUrl;

  const Track({
    required this.id,
    required this.filePath,
    required this.title,
    required this.artist,
    required this.duration,
    this.artworkUrl,
    this.previewUrl,
  });
}
