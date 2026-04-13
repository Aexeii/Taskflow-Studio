import 'dart:async';
import 'dart:convert';
import 'dart:html' as html;

import 'package:core/core.dart';
import 'package:flutter/foundation.dart';

class WebCompanionController extends ChangeNotifier {
  WebCompanionController()
      : libraryController = LibraryController(),
        playlistController = PlaylistController(),
        playbackController = PlaybackController(
          initialState: PlayerState(queue: SampleData.libraryTracks),
        ) {
    _audio = html.AudioElement();
    _restorePersistedState();
    _wireAudio();
  }

  final LibraryController libraryController;
  final PlaylistController playlistController;
  final PlaybackController playbackController;
  late final html.AudioElement _audio;
  Timer? _progressTimer;
  final Set<String> _likedTrackIds = <String>{};
  final List<String> _recentTrackIds = <String>[];

  static const String _storageKey = 'aero_music_web_state';

  Set<String> get likedTrackIds => _likedTrackIds;
  List<String> get recentTrackIds => List<String>.unmodifiable(_recentTrackIds);

  void dispose() {
    _progressTimer?.cancel();
    _audio.pause();
    _audio.src = '';
    super.dispose();
  }

  void setSearchQuery(String value) {
    libraryController.setSearchQuery(value);
    _persistState();
    notifyListeners();
  }

  void selectPlaylist(String playlistId) {
    playlistController.selectPlaylist(playlistId);
    _persistState();
    notifyListeners();
  }

  void playTrack(Track track) {
    final int queueIndex = playbackController.state.queue.indexWhere((Track item) => item.id == track.id);
    if (queueIndex >= 0) {
      playbackController.setTrackIndex(queueIndex);
    }
    _recordRecent(track.id);
    _loadAudioForCurrentTrack(autoPlay: true);
    _persistState();
    notifyListeners();
  }

  void togglePlayback() {
    final Track? currentTrack = playbackController.state.currentTrack;
    if (currentTrack == null) {
      return;
    }

    if (playbackController.state.isPlaying) {
      _audio.pause();
      playbackController.togglePlayback();
    } else {
      _loadAudioForCurrentTrack(autoPlay: true);
      if (!playbackController.state.isPlaying) {
        playbackController.togglePlayback();
      }
    }
    _persistState();
    notifyListeners();
  }

  void nextTrack() {
    playbackController.next();
    _recordCurrentIfAny();
    _loadAudioForCurrentTrack(autoPlay: true);
    _persistState();
    notifyListeners();
  }

  void previousTrack() {
    playbackController.previous();
    _recordCurrentIfAny();
    _loadAudioForCurrentTrack(autoPlay: true);
    _persistState();
    notifyListeners();
  }

  void seek(double value) {
    playbackController.setProgress(value);
    final Track? currentTrack = playbackController.state.currentTrack;
    if (currentTrack != null && _audio.duration.isFinite && _audio.duration > 0) {
      _audio.currentTime = _audio.duration * value;
    }
    _persistState();
    notifyListeners();
  }

  void setVolume(double value) {
    playbackController.setVolume(value);
    _audio.volume = value;
    _persistState();
    notifyListeners();
  }

  void toggleShuffle() {
    playbackController.toggleShuffle();
    _persistState();
    notifyListeners();
  }

  void toggleRepeat() {
    playbackController.toggleRepeat();
    _persistState();
    notifyListeners();
  }

  void toggleLike(String trackId) {
    if (_likedTrackIds.contains(trackId)) {
      _likedTrackIds.remove(trackId);
    } else {
      _likedTrackIds.add(trackId);
    }
    _persistState();
    notifyListeners();
  }

  List<Track> recentTracks() {
    return _recentTrackIds.map(_trackById).whereType<Track>().toList();
  }

  List<Track> likedTracks() {
    return SampleData.libraryTracks.where((Track track) => _likedTrackIds.contains(track.id)).toList();
  }

  void _wireAudio() {
    _audio.onEnded.listen((_) {
      if (playbackController.state.repeatEnabled) {
        _loadAudioForCurrentTrack(autoPlay: true);
        return;
      }
      nextTrack();
    });

    _audio.onPlay.listen((_) {
      if (!playbackController.state.isPlaying) {
        playbackController.togglePlayback();
      }
      _startProgressSync();
      notifyListeners();
    });

    _audio.onPause.listen((_) {
      if (playbackController.state.isPlaying) {
        playbackController.togglePlayback();
      }
      notifyListeners();
    });
  }

  void _loadAudioForCurrentTrack({required bool autoPlay}) {
    final Track? track = playbackController.state.currentTrack;
    if (track == null) {
      return;
    }

    final String source = track.previewUrl ?? '';
    if (source.isEmpty) {
      return;
    }

    if (_audio.src != source) {
      _audio.src = source;
      _audio.load();
    }

    _audio.volume = playbackController.state.volume;

    if (autoPlay) {
      _audio.play();
    }
  }

  void _startProgressSync() {
    _progressTimer?.cancel();
    _progressTimer = Timer.periodic(const Duration(milliseconds: 300), (_) {
      if (!_audio.duration.isFinite || _audio.duration <= 0) {
        return;
      }
      final double progress = (_audio.currentTime / _audio.duration).clamp(0, 1);
      playbackController.setProgress(progress);
      notifyListeners();
    });
  }

  void _recordCurrentIfAny() {
    final Track? current = playbackController.state.currentTrack;
    if (current != null) {
      _recordRecent(current.id);
    }
  }

  void _recordRecent(String trackId) {
    _recentTrackIds.remove(trackId);
    _recentTrackIds.insert(0, trackId);
    if (_recentTrackIds.length > 8) {
      _recentTrackIds.removeLast();
    }
  }

  Track? _trackById(String id) {
    for (final Track track in SampleData.libraryTracks) {
      if (track.id == id) {
        return track;
      }
    }
    return null;
  }

  void _restorePersistedState() {
    final String? raw = html.window.localStorage[_storageKey];
    if (raw == null || raw.isEmpty) {
      return;
    }

    final Map<String, dynamic> data = jsonDecode(raw) as Map<String, dynamic>;
    final String query = (data['searchQuery'] as String?) ?? '';
    final String? selectedPlaylistId = data['selectedPlaylistId'] as String?;
    final int? currentIndex = data['currentIndex'] as int?;
    final double volume = ((data['volume'] as num?) ?? 0.72).toDouble();
    final bool shuffle = data['shuffleEnabled'] as bool? ?? false;
    final bool repeat = data['repeatEnabled'] as bool? ?? false;
    final List<dynamic> likedIds = (data['likedTrackIds'] as List<dynamic>?) ?? <dynamic>[];
    final List<dynamic> recentIds = (data['recentTrackIds'] as List<dynamic>?) ?? <dynamic>[];

    libraryController.setSearchQuery(query);
    if (selectedPlaylistId != null) {
      playlistController.selectPlaylist(selectedPlaylistId);
    }
    if (currentIndex != null) {
      playbackController.setTrackIndex(currentIndex);
      if (playbackController.state.isPlaying) {
        playbackController.togglePlayback();
      }
    }
    playbackController.setVolume(volume);
    if (shuffle != playbackController.state.shuffleEnabled) {
      playbackController.toggleShuffle();
    }
    if (repeat != playbackController.state.repeatEnabled) {
      playbackController.toggleRepeat();
    }

    _likedTrackIds
      ..clear()
      ..addAll(likedIds.whereType<String>());
    _recentTrackIds
      ..clear()
      ..addAll(recentIds.whereType<String>());
    notifyListeners();
  }

  void _persistState() {
    final Map<String, dynamic> data = <String, dynamic>{
      'searchQuery': libraryController.state.searchQuery,
      'selectedPlaylistId': playlistController.state.selectedPlaylistId,
      'currentIndex': playbackController.state.currentIndex,
      'volume': playbackController.state.volume,
      'shuffleEnabled': playbackController.state.shuffleEnabled,
      'repeatEnabled': playbackController.state.repeatEnabled,
      'likedTrackIds': _likedTrackIds.toList(),
      'recentTrackIds': _recentTrackIds,
    };
    html.window.localStorage[_storageKey] = jsonEncode(data);
  }
}
