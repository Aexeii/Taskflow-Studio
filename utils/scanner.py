from __future__ import annotations

from pathlib import Path


SUPPORTED_EXTENSIONS = {".mp3", ".wav"}


def scan_music_folder(folder_path: str) -> list[str]:
    root = Path(folder_path)
    if not root.exists() or not root.is_dir():
        return []

    return sorted(
        [
        str(path)
        for path in root.rglob("*")
        if path.is_file() and path.suffix.lower() in SUPPORTED_EXTENSIONS
        ]
    )
