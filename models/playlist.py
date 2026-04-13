from __future__ import annotations

import json
from dataclasses import asdict, dataclass, field
from pathlib import Path

from models.track import Track


@dataclass
class Playlist:
    name: str
    tracks: list[Track] = field(default_factory=list)
    current_index: int = -1

    def add_track(self, track: Track) -> None:
        self.tracks.append(track)
        if self.current_index == -1:
            self.current_index = 0

    def remove_track(self, track: Track) -> None:
        try:
            index = self.tracks.index(track)
        except ValueError:
            return

        self.tracks.pop(index)
        if not self.tracks:
            self.current_index = -1
        elif index <= self.current_index:
            self.current_index = max(0, self.current_index - 1)

    def set_current(self, index: int) -> Track | None:
        if 0 <= index < len(self.tracks):
            self.current_index = index
            return self.tracks[index]
        return None

    def current_track(self) -> Track | None:
        if 0 <= self.current_index < len(self.tracks):
            return self.tracks[self.current_index]
        return None

    def next_track(self) -> Track | None:
        if not self.tracks:
            return None
        self.current_index = (self.current_index + 1) % len(self.tracks)
        return self.tracks[self.current_index]

    def previous_track(self) -> Track | None:
        if not self.tracks:
            return None
        self.current_index = (self.current_index - 1) % len(self.tracks)
        return self.tracks[self.current_index]

    def save_json(self, file_path: str | Path) -> None:
        data = {
            "name": self.name,
            "current_index": self.current_index,
            "tracks": [asdict(track) for track in self.tracks],
        }
        Path(file_path).write_text(json.dumps(data, indent=2), encoding="utf-8")

    @classmethod
    def load_json(cls, file_path: str | Path) -> "Playlist":
        data = json.loads(Path(file_path).read_text(encoding="utf-8"))
        tracks = [Track(**track_data) for track_data in data.get("tracks", [])]
        return cls(
            name=data.get("name", "Playlist"),
            tracks=tracks,
            current_index=data.get("current_index", -1),
        )
