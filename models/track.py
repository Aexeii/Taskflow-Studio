from __future__ import annotations

from dataclasses import dataclass


@dataclass(slots=True)
class Track:
    file_path: str
    title: str
    artist: str
    duration: float

    @property
    def duration_seconds(self) -> int:
        return max(0, int(round(self.duration)))

    @property
    def display_duration(self) -> str:
        minutes, seconds = divmod(self.duration_seconds, 60)
        return f"{minutes}:{seconds:02d}"
