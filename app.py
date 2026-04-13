from __future__ import annotations

import sys

from PyQt6.QtWidgets import QApplication

from controller import MusicPlayerController


def main() -> int:
    try:
        from aero_music_player import AeroMusicApp
    except ImportError as exc:
        raise RuntimeError(
            "Expected UI class 'aero_music_player.AeroMusicApp' was not found."
        ) from exc

    app = QApplication(sys.argv)
    window = AeroMusicApp()
    MusicPlayerController(window)
    window.show()
    return app.exec()


if __name__ == "__main__":
    raise SystemExit(main())
