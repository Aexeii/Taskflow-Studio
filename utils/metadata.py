from __future__ import annotations

from pathlib import Path

from mutagen import File as MutagenFile

from models.track import Track


def _extract_text(tags: object, keys: tuple[str, ...], default: str) -> str:
    if not tags:
        return default

    for key in keys:
        value = None
        if hasattr(tags, "get"):
            value = tags.get(key)
        if value:
            if isinstance(value, list):
                return str(value[0]).strip() or default
            text = getattr(value, "text", None)
            if text:
                return str(text[0]).strip() or default
            return str(value).strip() or default
    return default


def load_track_metadata(file_path: str) -> Track:
    file_name = Path(file_path).stem
    title = file_name
    artist = "Unknown Artist"
    duration = 0.0

    try:
        audio = MutagenFile(file_path, easy=True)
        if audio is not None:
            duration = float(getattr(getattr(audio, "info", None), "length", 0.0) or 0.0)
            title = _extract_text(audio.tags, ("title",), file_name)
            artist = _extract_text(audio.tags, ("artist",), artist)
        else:
            raw_audio = MutagenFile(file_path)
            if raw_audio is not None:
                duration = float(getattr(getattr(raw_audio, "info", None), "length", 0.0) or 0.0)
    except Exception:
        pass

    return Track(
        file_path=file_path,
        title=title,
        artist=artist,
        duration=duration,
    )
