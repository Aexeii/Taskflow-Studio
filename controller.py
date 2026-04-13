from __future__ import annotations

import random
from pathlib import Path

from PyQt6.QtCore import QObject, QRunnable, QSize, QThreadPool, QTimer, Qt, pyqtSignal
from PyQt6.QtGui import QAction
from PyQt6.QtWidgets import QFileDialog, QListWidgetItem, QMainWindow, QMessageBox, QPushButton

from models.playlist import Playlist
from models.track import Track
from player.vlc_player import VLCPlayer
from utils.metadata import load_track_metadata
from utils.scanner import scan_music_folder


def format_milliseconds(value: int) -> str:
    total_seconds = max(0, value // 1000)
    minutes, seconds = divmod(total_seconds, 60)
    return f"{minutes}:{seconds:02d}"


def format_duration_seconds(value: float) -> str:
    total_seconds = max(0, int(round(value)))
    minutes, seconds = divmod(total_seconds, 60)
    return f"{minutes}:{seconds:02d}"


class ScanWorkerSignals(QObject):
    finished = pyqtSignal(list)
    failed = pyqtSignal(str)


class LibraryScanWorker(QRunnable):
    def __init__(self, folder_path: str) -> None:
        super().__init__()
        self.folder_path = folder_path
        self.signals = ScanWorkerSignals()

    def run(self) -> None:
        try:
            file_paths = scan_music_folder(self.folder_path)
            tracks = [load_track_metadata(file_path) for file_path in file_paths]
            self.signals.finished.emit(tracks)
        except Exception as exc:
            self.signals.failed.emit(str(exc))


class MusicPlayerController(QObject):
    def __init__(self, window: QMainWindow) -> None:
        super().__init__(window)
        self.window = window
        self.player = VLCPlayer()
        self.thread_pool = QThreadPool.globalInstance()
        self.progress_timer = QTimer(self)
        self.progress_timer.setInterval(250)
        self.progress_timer.timeout.connect(self._sync_progress)

        self.library_playlist = Playlist(name="Library")
        self.visible_library_tracks: list[Track] = []
        self.user_scrubbing = False
        self.shuffle_enabled = False
        self.repeat_enabled = False
        self.current_folder: str | None = None

        self.sidebar = window.sidebar
        self.library_view = window.libraryView
        self.playlist_view = window.playlistView
        self.player_bar = window.playerBar

        self.track_list = self.library_view.trackList
        self.playlist_list = self.sidebar.playlistList
        self.playlist_track_list = self.playlist_view.playlistTrackList
        self.search_input = self.library_view.searchInput
        self.new_playlist_button = self.sidebar.newPlaylistButton
        self.play_button = self.player_bar.playButton
        self.prev_button = self._resolve_button("prevButton")
        self.next_button = self._resolve_button("nextButton")
        self.shuffle_button = self._resolve_button("shuffleButton")
        self.repeat_button = self._resolve_button("repeatButton")
        self.progress_slider = self.player_bar.progressSlider
        self.volume_slider = self.player_bar.volumeSlider
        self.current_time_label = self.player_bar.currentTimeLabel
        self.total_time_label = self.player_bar.totalTimeLabel
        self.song_title_label = self.player_bar.playerTrackTitle
        self.song_artist_label = self.player_bar.playerArtist
        self.album_art_label = self.player_bar.playerAlbumArt

        self._disconnect_ui_only_signals()
        self._configure_widgets()
        self._connect_signals()
        self._install_select_folder_action()
        self._sync_playlist_sidebar()
        self._refresh_library_views()
        self._update_now_playing(None)

    def _resolve_button(self, name: str) -> QPushButton:
        for button in self.player_bar.findChildren(QPushButton):
            if button.objectName() == name or button.accessibleName() == name:
                return button
        raise RuntimeError(f"Required button '{name}' was not found in AeroMusicApp.")

    def _disconnect_ui_only_signals(self) -> None:
        try:
            self.play_button.clicked.disconnect()
        except TypeError:
            pass
        for button in (self.shuffle_button, self.repeat_button):
            try:
                button.clicked.disconnect()
            except TypeError:
                pass

    def _configure_widgets(self) -> None:
        self.track_list.clear()
        self.playlist_track_list.clear()
        self.progress_slider.setRange(0, 1000)
        self.progress_slider.setValue(0)
        self.volume_slider.setRange(0, 100)
        self.volume_slider.setValue(72)
        self.player.set_volume(72)
        self.track_list.setSelectionMode(self.track_list.SelectionMode.SingleSelection)
        self.playlist_track_list.setSelectionMode(self.playlist_track_list.SelectionMode.SingleSelection)
        self.current_time_label.setText("0:00")
        self.total_time_label.setText("0:00")
        self.play_button.setText("▶")
        self.playlist_view.playlistTitle.setText("Library")
        self.playlist_view.playlistMeta.setText("No songs loaded")

    def _connect_signals(self) -> None:
        self.play_button.clicked.connect(self.toggle_playback)
        self.prev_button.clicked.connect(self.play_previous_track)
        self.next_button.clicked.connect(self.play_next_track)
        self.shuffle_button.clicked.connect(self._toggle_shuffle)
        self.repeat_button.clicked.connect(self._toggle_repeat)
        self.volume_slider.valueChanged.connect(self.player.set_volume)
        self.progress_slider.sliderPressed.connect(self._start_scrubbing)
        self.progress_slider.sliderReleased.connect(self._finish_scrubbing)
        self.progress_slider.sliderMoved.connect(self._scrub_preview)
        self.track_list.itemDoubleClicked.connect(self._play_library_item)
        self.track_list.itemClicked.connect(self._select_library_item)
        self.playlist_track_list.itemDoubleClicked.connect(self._play_playlist_item)
        self.playlist_track_list.itemClicked.connect(self._select_playlist_item)
        self.search_input.textChanged.connect(self._filter_tracks)
        self.playlist_view.playlistPlayButton.clicked.connect(self._play_from_playlist_view)
        self.playlist_list.itemClicked.connect(self._handle_sidebar_playlist_click)
        self.new_playlist_button.clicked.connect(self.select_folder)
        self.player.playback_finished.connect(self._handle_track_finished)

    def _install_select_folder_action(self) -> None:
        action = self.window.findChild(QAction, "selectFolderAction")
        if action is None and self.window.menuBar() is not None:
            file_menu = self.window.menuBar().addMenu("File")
            action = QAction("Select Folder", self.window)
            action.setObjectName("selectFolderAction")
            file_menu.addAction(action)
        if action is not None:
            action.triggered.connect(self.select_folder)

    def select_folder(self) -> None:
        folder_path = QFileDialog.getExistingDirectory(
            self.window,
            "Select Music Folder",
            self.current_folder or str(Path.home()),
        )
        if not folder_path:
            return

        self.current_folder = folder_path
        self.library_view.searchInput.setPlaceholderText("Scanning music folder...")
        worker = LibraryScanWorker(folder_path)
        worker.signals.finished.connect(self._load_tracks)
        worker.signals.failed.connect(self._handle_scan_error)
        self.thread_pool.start(worker)

    def _load_tracks(self, tracks: list[Track]) -> None:
        self.library_playlist = Playlist(
            name=Path(self.current_folder).name if self.current_folder else "Library",
            tracks=tracks,
            current_index=0 if tracks else -1,
        )
        self.visible_library_tracks = list(tracks)
        self._refresh_library_views()
        self._sync_playlist_sidebar()
        self._update_playlist_meta()
        self.library_view.searchInput.setPlaceholderText("Search songs, artists, albums…")
        if tracks:
            self.window._nav("library")
        else:
            QMessageBox.information(self.window, "No Music Found", "No supported audio files were found in that folder.")

    def _handle_scan_error(self, message: str) -> None:
        self.library_view.searchInput.setPlaceholderText("Search songs, artists, albums…")
        QMessageBox.critical(self.window, "Scan Failed", message or "Unable to scan the selected folder.")

    def _refresh_library_views(self) -> None:
        self.track_list.clear()
        self.playlist_track_list.clear()

        for index, track in enumerate(self.visible_library_tracks, start=1):
            library_item = QListWidgetItem(self._format_library_row(index, track))
            library_item.setData(Qt.ItemDataRole.UserRole, track.file_path)
            library_item.setData(Qt.ItemDataRole.UserRole + 1, track.title)
            library_item.setData(Qt.ItemDataRole.UserRole + 2, track.artist)
            library_item.setSizeHint(self._row_size_hint())
            self.track_list.addItem(library_item)

        for index, track in enumerate(self.library_playlist.tracks, start=1):
            playlist_item = QListWidgetItem(self._format_playlist_row(index, track))
            playlist_item.setData(Qt.ItemDataRole.UserRole, track.file_path)
            playlist_item.setData(Qt.ItemDataRole.UserRole + 1, track.title)
            playlist_item.setData(Qt.ItemDataRole.UserRole + 2, track.artist)
            playlist_item.setSizeHint(self._row_size_hint())
            self.playlist_track_list.addItem(playlist_item)

        self._highlight_current_track()

    def _row_size_hint(self):
        return QSize(0, 46)

    def _format_library_row(self, index: int, track: Track) -> str:
        album = "Local Files"
        return f"  {index:<4} {track.title:<30.30} {track.artist:<22.22} {album:<28.28} {track.display_duration:>5}"

    def _format_playlist_row(self, index: int, track: Track) -> str:
        return f"  {index:<4} {track.title:<35.35} {track.artist:<22.22} {track.display_duration:>5}"

    def _sync_playlist_sidebar(self) -> None:
        entries = [self.playlist_list.item(i).text().strip() for i in range(self.playlist_list.count())]
        library_name = self.library_playlist.name
        if library_name and library_name not in entries:
            item = QListWidgetItem(f"  {library_name}")
            item.setSizeHint(self.playlist_list.item(0).sizeHint() if self.playlist_list.count() else item.sizeHint())
            self.playlist_list.addItem(item)

    def _update_playlist_meta(self) -> None:
        track_count = len(self.library_playlist.tracks)
        total_seconds = sum(track.duration_seconds for track in self.library_playlist.tracks)
        hours, remainder = divmod(total_seconds, 3600)
        minutes = remainder // 60
        if hours:
            duration_text = f"{hours} hr {minutes} min"
        else:
            duration_text = f"{minutes} min"

        self.playlist_view.playlistTitle.setText(self.library_playlist.name or "Library")
        self.playlist_view.playlistMeta.setText(f"Local Files · {track_count} songs · {duration_text}")

    def _play_library_item(self, item: QListWidgetItem) -> None:
        row = self.track_list.row(item)
        if not (0 <= row < len(self.visible_library_tracks)):
            return
        track = self.visible_library_tracks[row]
        actual_index = next(
            (index for index, candidate in enumerate(self.library_playlist.tracks) if candidate.file_path == track.file_path),
            -1,
        )
        if actual_index >= 0:
            self.play_track_at_index(actual_index)

    def _play_playlist_item(self, item: QListWidgetItem) -> None:
        row = self.playlist_track_list.row(item)
        self.play_track_at_index(row)

    def _select_library_item(self, item: QListWidgetItem) -> None:
        row = self.track_list.row(item)
        if not (0 <= row < len(self.visible_library_tracks)):
            return
        track = self.visible_library_tracks[row]
        actual_index = next(
            (index for index, candidate in enumerate(self.library_playlist.tracks) if candidate.file_path == track.file_path),
            -1,
        )
        if actual_index >= 0:
            self.library_playlist.set_current(actual_index)
            self._highlight_current_track()

    def _select_playlist_item(self, item: QListWidgetItem) -> None:
        row = self.playlist_track_list.row(item)
        self.library_playlist.set_current(row)
        self._highlight_current_track()

    def _play_from_playlist_view(self) -> None:
        if self.library_playlist.current_track() is None and self.library_playlist.tracks:
            self.play_track_at_index(0)
            return
        self.toggle_playback()

    def play_track_at_index(self, index: int) -> None:
        track = self.library_playlist.set_current(index)
        if track is None:
            return

        self.player.load(track.file_path)
        self.player.play()
        self.progress_timer.start()
        self._update_now_playing(track)
        self._highlight_current_track()
        self._set_playing_state(True)

    def toggle_playback(self) -> None:
        current_track = self.library_playlist.current_track()
        if current_track is None:
            if self.library_playlist.tracks:
                self.play_track_at_index(0)
            return

        if self.player.is_playing():
            self.player.pause()
            self._set_playing_state(False)
        else:
            self.player.play()
            self.progress_timer.start()
            self._set_playing_state(True)

    def play_next_track(self) -> None:
        if not self.library_playlist.tracks:
            return

        if self.shuffle_enabled and len(self.library_playlist.tracks) > 1:
            choices = [i for i in range(len(self.library_playlist.tracks)) if i != self.library_playlist.current_index]
            self.play_track_at_index(random.choice(choices))
            return

        next_track = self.library_playlist.next_track()
        if next_track is not None:
            self.play_track_at_index(self.library_playlist.current_index)

    def play_previous_track(self) -> None:
        if not self.library_playlist.tracks:
            return
        previous_track = self.library_playlist.previous_track()
        if previous_track is not None:
            self.play_track_at_index(self.library_playlist.current_index)

    def _handle_track_finished(self) -> None:
        if self.repeat_enabled and self.library_playlist.current_track() is not None:
            self.play_track_at_index(self.library_playlist.current_index)
            return
        self.play_next_track()

    def _start_scrubbing(self) -> None:
        self.user_scrubbing = True

    def _finish_scrubbing(self) -> None:
        self.user_scrubbing = False
        self.player.set_position(self.progress_slider.value() / 1000)

    def _scrub_preview(self, value: int) -> None:
        total_length = self.player.get_length()
        preview = int(total_length * (value / 1000))
        self.current_time_label.setText(format_milliseconds(preview))

    def _sync_progress(self) -> None:
        if self.user_scrubbing:
            return

        current_time = self.player.get_time()
        total_time = self.player.get_length()
        if total_time > 0:
            self.progress_slider.setValue(int((current_time / total_time) * 1000))

        self.current_time_label.setText(format_milliseconds(current_time))
        self.total_time_label.setText(format_milliseconds(total_time))

    def _update_now_playing(self, track: Track | None) -> None:
        if track is None:
            self.song_title_label.setText("No track selected")
            self.song_artist_label.setText("Select a folder to begin")
            self.current_time_label.setText("0:00")
            self.total_time_label.setText("0:00")
            return

        self.song_title_label.setText(track.title)
        self.song_artist_label.setText(track.artist)
        self.total_time_label.setText(track.display_duration)

    def _highlight_current_track(self) -> None:
        current_index = self.library_playlist.current_index
        self.playlist_track_list.blockSignals(True)
        self.playlist_track_list.clearSelection()
        if 0 <= current_index < self.playlist_track_list.count():
            self.playlist_track_list.setCurrentRow(current_index)
        self.playlist_track_list.blockSignals(False)

        self.track_list.blockSignals(True)
        self.track_list.clearSelection()
        current_track = self.library_playlist.current_track()
        if current_track is not None:
            for row in range(self.track_list.count()):
                item = self.track_list.item(row)
                if item.data(Qt.ItemDataRole.UserRole) == current_track.file_path:
                    self.track_list.setCurrentRow(row)
                    break
        self.track_list.blockSignals(False)

    def _toggle_shuffle(self) -> None:
        self.shuffle_enabled = not self.shuffle_enabled
        self._set_toggle_state(self.shuffle_button, self.shuffle_enabled)

    def _toggle_repeat(self) -> None:
        self.repeat_enabled = not self.repeat_enabled
        self._set_toggle_state(self.repeat_button, self.repeat_enabled)

    def _set_toggle_state(self, button: QPushButton, active: bool) -> None:
        button.setProperty("active", "true" if active else "false")
        button.style().unpolish(button)
        button.style().polish(button)

    def _set_playing_state(self, playing: bool) -> None:
        self.play_button.setText("⏸" if playing else "▶")
        self.playlist_view.playlistPlayButton.setText("⏸" if playing else "▶")

    def _filter_tracks(self, text: str) -> None:
        query = text.strip().lower()
        if not query:
            self.visible_library_tracks = list(self.library_playlist.tracks)
        else:
            self.visible_library_tracks = [
                track
                for track in self.library_playlist.tracks
                if query in track.title.lower() or query in track.artist.lower() or query in Path(track.file_path).stem.lower()
            ]
        self._refresh_library_views()

    def _handle_sidebar_playlist_click(self, item: QListWidgetItem) -> None:
        name = item.text().strip()
        if name == self.library_playlist.name:
            self.playlist_view.playlistTitle.setText(self.library_playlist.name)
            self._update_playlist_meta()
        self.window._nav("playlists")
