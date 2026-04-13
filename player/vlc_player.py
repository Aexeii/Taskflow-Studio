from __future__ import annotations

import vlc
from PyQt6.QtCore import QObject, pyqtSignal


class VLCPlayer(QObject):
    playback_finished = pyqtSignal()

    def __init__(self) -> None:
        super().__init__()
        self._instance = vlc.Instance()
        self._player = self._instance.media_player_new()
        self._bind_events()

    def _bind_events(self) -> None:
        event_manager = self._player.event_manager()
        event_manager.event_attach(vlc.EventType.MediaPlayerEndReached, self._handle_end_reached)

    def _handle_end_reached(self, event: object) -> None:
        self.playback_finished.emit()

    def load(self, file_path: str) -> None:
        media = self._instance.media_new(file_path)
        self._player.set_media(media)

    def play(self) -> None:
        self._player.play()

    def pause(self) -> None:
        self._player.pause()

    def stop(self) -> None:
        self._player.stop()

    def is_playing(self) -> bool:
        return bool(self._player.is_playing())

    def set_position(self, position: float) -> None:
        self._player.set_position(max(0.0, min(position, 1.0)))

    def get_position(self) -> float:
        position = self._player.get_position()
        return max(0.0, float(position if position >= 0 else 0.0))

    def get_time(self) -> int:
        current = self._player.get_time()
        return max(0, int(current if current >= 0 else 0))

    def get_length(self) -> int:
        total = self._player.get_length()
        return max(0, int(total if total >= 0 else 0))

    def set_volume(self, volume: int) -> None:
        self._player.audio_set_volume(max(0, min(volume, 100)))

    def get_volume(self) -> int:
        return max(0, int(self._player.audio_get_volume()))
