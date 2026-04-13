import 'package:core/core.dart';
import 'package:flutter/material.dart';

class TrackList extends StatelessWidget {
  final List<Track> tracks;
  final String? currentTrackId;
  final ValueChanged<int> onTrackTap;
  final bool showAlbumColumn;

  const TrackList({
    super.key,
    required this.tracks,
    required this.onTrackTap,
    this.currentTrackId,
    this.showAlbumColumn = true,
  });

  String _formatDuration(Duration duration) {
    final int minutes = duration.inMinutes;
    final int seconds = duration.inSeconds % 60;
    return '$minutes:${seconds.toString().padLeft(2, '0')}';
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: const Color(0xFF12151B),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Column(
        children: <Widget>[
          Padding(
            padding: const EdgeInsets.fromLTRB(18, 16, 18, 12),
            child: Row(
              children: <Widget>[
                const SizedBox(
                  width: 36,
                  child: Text('#', style: TextStyle(color: Color(0xFF9AA4B2), fontSize: 12)),
                ),
                const Expanded(
                  flex: 3,
                  child: Text('TITLE', style: TextStyle(color: Color(0xFF9AA4B2), fontSize: 12)),
                ),
                const Expanded(
                  flex: 2,
                  child: Text('ARTIST', style: TextStyle(color: Color(0xFF9AA4B2), fontSize: 12)),
                ),
                if (showAlbumColumn)
                  const Expanded(
                    flex: 2,
                    child: Text('ALBUM', style: TextStyle(color: Color(0xFF9AA4B2), fontSize: 12)),
                  ),
                const SizedBox(
                  width: 56,
                  child: Text('TIME', style: TextStyle(color: Color(0xFF9AA4B2), fontSize: 12)),
                ),
              ],
            ),
          ),
          const Divider(height: 1, color: Color(0x1AFFFFFF)),
          Expanded(
            child: ListView.separated(
              padding: const EdgeInsets.all(8),
              itemCount: tracks.length,
              separatorBuilder: (_, __) => const SizedBox(height: 2),
              itemBuilder: (BuildContext context, int index) {
                final Track track = tracks[index];
                final bool active = currentTrackId == track.id;
                return InkWell(
                  borderRadius: BorderRadius.circular(14),
                  onTap: () => onTrackTap(index),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 12),
                    decoration: BoxDecoration(
                      color: active ? const Color(0xFF1C2230) : Colors.transparent,
                      borderRadius: BorderRadius.circular(14),
                    ),
                    child: Row(
                      children: <Widget>[
                        SizedBox(
                          width: 36,
                          child: Text(
                            '${index + 1}',
                            style: const TextStyle(color: Color(0xFF9AA4B2)),
                          ),
                        ),
                        Expanded(
                          flex: 3,
                          child: Text(
                            track.title,
                            overflow: TextOverflow.ellipsis,
                            style: TextStyle(
                              color: active ? Colors.white : const Color(0xFFE6EBF2),
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                        Expanded(
                          flex: 2,
                          child: Text(
                            track.artist,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(color: Color(0xFF9AA4B2)),
                          ),
                        ),
                        if (showAlbumColumn)
                          const Expanded(
                            flex: 2,
                            child: Text(
                              'Local Files',
                              overflow: TextOverflow.ellipsis,
                              style: TextStyle(color: Color(0xFF9AA4B2)),
                            ),
                          ),
                        SizedBox(
                          width: 56,
                          child: Text(
                            _formatDuration(track.duration),
                            textAlign: TextAlign.right,
                            style: const TextStyle(color: Color(0xFF9AA4B2)),
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
