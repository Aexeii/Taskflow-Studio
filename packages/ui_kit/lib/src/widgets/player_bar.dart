import 'package:core/core.dart';
import 'package:flutter/material.dart';

class PlayerBar extends StatelessWidget {
  final PlayerState state;
  final VoidCallback onPlayPause;
  final VoidCallback onNext;
  final VoidCallback onPrevious;
  final ValueChanged<double> onSeek;
  final ValueChanged<double> onVolumeChanged;
  final VoidCallback onShuffleToggle;
  final VoidCallback onRepeatToggle;

  const PlayerBar({
    super.key,
    required this.state,
    required this.onPlayPause,
    required this.onNext,
    required this.onPrevious,
    required this.onSeek,
    required this.onVolumeChanged,
    required this.onShuffleToggle,
    required this.onRepeatToggle,
  });

  String _formatDuration(Duration duration) {
    final int minutes = duration.inMinutes;
    final int seconds = duration.inSeconds % 60;
    return '$minutes:${seconds.toString().padLeft(2, '0')}';
  }

  @override
  Widget build(BuildContext context) {
    final Track? track = state.currentTrack;
    final int totalMs = track?.duration.inMilliseconds ?? 0;
    final Duration currentPosition = Duration(
      milliseconds: (totalMs * state.progress).round(),
    );

    return Container(
      height: 96,
      padding: const EdgeInsets.symmetric(horizontal: 20),
      decoration: const BoxDecoration(
        color: Color(0xFF12151B),
        border: Border(top: BorderSide(color: Color(0x1AFFFFFF))),
      ),
      child: Row(
        children: <Widget>[
          SizedBox(
            width: 240,
            child: Row(
              children: <Widget>[
                Container(
                  width: 56,
                  height: 56,
                  decoration: BoxDecoration(
                    color: const Color(0xFF1C2230),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Icon(Icons.music_note_rounded, color: Color(0xFF3DDC97)),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: <Widget>[
                      Text(
                        track?.title ?? 'No track selected',
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        track?.artist ?? 'Select a track to begin',
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(color: Color(0xFF9AA4B2)),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          Expanded(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: <Widget>[
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: <Widget>[
                    _IconToggleButton(
                      icon: Icons.shuffle_rounded,
                      active: state.shuffleEnabled,
                      onTap: onShuffleToggle,
                    ),
                    const SizedBox(width: 8),
                    _IconButton(icon: Icons.skip_previous_rounded, onTap: onPrevious),
                    const SizedBox(width: 8),
                    FilledButton(
                      onPressed: onPlayPause,
                      style: FilledButton.styleFrom(
                        backgroundColor: const Color(0xFFE6EBF2),
                        foregroundColor: const Color(0xFF111318),
                        shape: const CircleBorder(),
                        padding: const EdgeInsets.all(18),
                      ),
                      child: Icon(state.isPlaying ? Icons.pause_rounded : Icons.play_arrow_rounded),
                    ),
                    const SizedBox(width: 8),
                    _IconButton(icon: Icons.skip_next_rounded, onTap: onNext),
                    const SizedBox(width: 8),
                    _IconToggleButton(
                      icon: Icons.repeat_rounded,
                      active: state.repeatEnabled,
                      onTap: onRepeatToggle,
                    ),
                  ],
                ),
                Row(
                  children: <Widget>[
                    SizedBox(
                      width: 44,
                      child: Text(
                        _formatDuration(currentPosition),
                        style: const TextStyle(fontSize: 12, color: Color(0xFF9AA4B2)),
                      ),
                    ),
                    Expanded(
                      child: Slider(
                        value: state.progress,
                        onChanged: onSeek,
                      ),
                    ),
                    SizedBox(
                      width: 44,
                      child: Text(
                        _formatDuration(track?.duration ?? Duration.zero),
                        textAlign: TextAlign.right,
                        style: const TextStyle(fontSize: 12, color: Color(0xFF9AA4B2)),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          SizedBox(
            width: 240,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: <Widget>[
                const Icon(Icons.volume_up_rounded, color: Color(0xFF9AA4B2)),
                const SizedBox(width: 10),
                SizedBox(
                  width: 120,
                  child: Slider(
                    value: state.volume,
                    onChanged: onVolumeChanged,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _IconButton extends StatelessWidget {
  final IconData icon;
  final VoidCallback onTap;

  const _IconButton({
    required this.icon,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return IconButton(
      onPressed: onTap,
      icon: Icon(icon),
      color: const Color(0xFFE6EBF2),
    );
  }
}

class _IconToggleButton extends StatelessWidget {
  final IconData icon;
  final bool active;
  final VoidCallback onTap;

  const _IconToggleButton({
    required this.icon,
    required this.active,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return IconButton(
      onPressed: onTap,
      icon: Icon(icon),
      color: active ? const Color(0xFF3DDC97) : const Color(0xFF9AA4B2),
    );
  }
}
