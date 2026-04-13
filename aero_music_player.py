"""
Aero Music — PyQt6 Music Player UI
===================================
Design inspired by Aero AI: minimal, clean surfaces, soft depth,
dark theme with a single green accent, tight spacing, no clutter.

Structure
---------
  AeroMusicApp          ← QMainWindow root
  ├── Sidebar           ← QFrame (fixed width)
  │   ├── Logo section
  │   ├── Nav buttons (Home, Library, Playlists)
  │   ├── Playlist list (scrollable)
  │   └── New Playlist button
  ├── ContentStack      ← QStackedWidget
  │   ├── HomeView      ← Recently Played, Library preview, Quick Actions
  │   ├── LibraryView   ← Searchable track list
  │   └── PlaylistView  ← Playlist detail + tracks
  └── PlayerBar         ← QFrame (fixed bottom)
      ├── Left  — album art + track info
      ├── Center — controls + progress
      └── Right — volume + shuffle/repeat

All interactive widgets are named per spec (playButton, nextButton, etc.)
No backend logic — layout and styling only.
"""

import sys
from PyQt6.QtWidgets import (
    QApplication, QMainWindow, QWidget, QFrame, QLabel, QPushButton,
    QSlider, QLineEdit, QScrollArea, QStackedWidget, QListWidget,
    QListWidgetItem, QHBoxLayout, QVBoxLayout, QGridLayout, QSizePolicy,
    QSpacerItem, QGraphicsDropShadowEffect,
)
from PyQt6.QtCore import Qt, QSize, QTimer
from PyQt6.QtGui import (
    QFont, QFontDatabase, QColor, QPainter, QPixmap,
    QIcon, QPalette, QLinearGradient, QBrush,
)

# ══════════════════════════════════════════════════════════════════
# DESIGN TOKENS  (mirrors Aero AI's CSS variables, adapted for dark)
# ══════════════════════════════════════════════════════════════════
class T:
    # Backgrounds
    BG          = "#0e0e0f"     # app background
    SURFACE     = "#161618"     # card / sidebar
    SURFACE2    = "#1c1c1f"     # slightly lighter surface
    SURFACE3    = "#242428"     # hover / pressed
    SURFACE4    = "#2a2a30"     # input field bg

    # Borders
    BORDER      = "rgba(255,255,255,0.06)"
    BORDER_STR  = "rgba(255,255,255,0.1)"

    # Text
    TEXT_PRI    = "#f2f2f3"
    TEXT_SEC    = "#8a8a95"
    TEXT_TER    = "#55555f"

    # Accent — single green, Aero-inspired
    ACCENT      = "#1db954"     # Spotify-adjacent green — clean, not retro
    ACCENT_DIM  = "#17a349"
    ACCENT_SOFT = "rgba(29,185,84,0.12)"
    ACCENT_SOFT2= "rgba(29,185,84,0.06)"

    # Radii (px)
    R_LG  = "16px"
    R_MD  = "12px"
    R_SM  = "8px"
    R_XS  = "6px"
    R_CIR = "50%"

    # Typography sizes (pt, not px — PyQt uses pt)
    FS_XS  = 8
    FS_SM  = 9
    FS_MD  = 10
    FS_LG  = 11
    FS_XL  = 13
    FS_2XL = 15
    FS_3XL = 20
    FS_4XL = 26


# ══════════════════════════════════════════════════════════════════
# QSS  (single stylesheet applied to QMainWindow)
# ══════════════════════════════════════════════════════════════════
QSS = f"""
/* ── Base ─────────────────────────────────────────────────────── */
QMainWindow, QWidget {{
    background: {T.BG};
    color: {T.TEXT_PRI};
    font-family: "Inter", "Segoe UI", "SF Pro Display", "Helvetica Neue", Arial, sans-serif;
    font-size: {T.FS_MD}pt;
    border: none;
    outline: none;
}}

QScrollArea {{
    background: transparent;
    border: none;
}}

QScrollBar:vertical {{
    background: transparent;
    width: 4px;
    margin: 0;
}}
QScrollBar::handle:vertical {{
    background: rgba(255,255,255,0.08);
    border-radius: 2px;
    min-height: 32px;
}}
QScrollBar::handle:vertical:hover {{
    background: rgba(255,255,255,0.14);
}}
QScrollBar::add-line:vertical, QScrollBar::sub-line:vertical {{
    height: 0;
}}
QScrollBar::add-page:vertical, QScrollBar::sub-page:vertical {{
    background: transparent;
}}

QScrollBar:horizontal {{
    background: transparent;
    height: 4px;
}}
QScrollBar::handle:horizontal {{
    background: rgba(255,255,255,0.08);
    border-radius: 2px;
    min-width: 32px;
}}
QScrollBar::handle:horizontal:hover {{
    background: rgba(255,255,255,0.14);
}}
QScrollBar::add-line:horizontal, QScrollBar::sub-line:horizontal {{
    width: 0;
}}

/* ── Sidebar ───────────────────────────────────────────────────── */
#sidebar {{
    background: {T.SURFACE};
    border-right: 1px solid rgba(255,255,255,0.05);
}}

#appLogoLabel {{
    color: {T.TEXT_PRI};
    font-size: {T.FS_2XL}pt;
    font-weight: 700;
    letter-spacing: -0.5px;
}}

#appLogoSub {{
    color: {T.ACCENT};
    font-size: {T.FS_XS}pt;
    font-weight: 600;
    letter-spacing: 2px;
    text-transform: uppercase;
}}

#sidebarSectionLabel {{
    color: {T.TEXT_TER};
    font-size: {T.FS_XS}pt;
    font-weight: 600;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    padding: 0 4px;
}}

/* Nav buttons */
#navButton {{
    background: transparent;
    color: {T.TEXT_SEC};
    border: none;
    border-radius: {T.R_SM};
    padding: 10px 14px;
    text-align: left;
    font-size: {T.FS_MD}pt;
    font-weight: 500;
}}
#navButton:hover {{
    background: rgba(255,255,255,0.05);
    color: {T.TEXT_PRI};
}}
#navButton[active="true"] {{
    background: rgba(29,185,84,0.1);
    color: {T.ACCENT};
    font-weight: 600;
}}

/* Playlist list in sidebar */
#playlistList {{
    background: transparent;
    border: none;
    font-size: {T.FS_SM}pt;
    color: {T.TEXT_SEC};
}}
#playlistList::item {{
    padding: 8px 14px;
    border-radius: {T.R_XS};
    margin: 1px 0;
}}
#playlistList::item:hover {{
    background: rgba(255,255,255,0.04);
    color: {T.TEXT_PRI};
}}
#playlistList::item:selected {{
    background: {T.ACCENT_SOFT};
    color: {T.ACCENT};
}}

/* New Playlist button */
#newPlaylistButton {{
    background: transparent;
    color: {T.TEXT_SEC};
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: {T.R_SM};
    padding: 9px 14px;
    font-size: {T.FS_SM}pt;
    font-weight: 500;
    text-align: left;
}}
#newPlaylistButton:hover {{
    background: rgba(255,255,255,0.04);
    color: {T.TEXT_PRI};
    border-color: rgba(255,255,255,0.12);
}}
#newPlaylistButton:pressed {{
    background: rgba(255,255,255,0.07);
}}

/* ── Content area ──────────────────────────────────────────────── */
#contentArea {{
    background: {T.BG};
}}

/* Content header / page title */
#pageTitle {{
    font-size: {T.FS_4XL}pt;
    font-weight: 700;
    color: {T.TEXT_PRI};
    letter-spacing: -0.8px;
}}
#pageSubtitle {{
    font-size: {T.FS_MD}pt;
    color: {T.TEXT_SEC};
    font-weight: 400;
}}

/* Section headings inside content */
#sectionTitle {{
    font-size: {T.FS_XL}pt;
    font-weight: 700;
    color: {T.TEXT_PRI};
    letter-spacing: -0.3px;
}}
#sectionLink {{
    font-size: {T.FS_SM}pt;
    font-weight: 500;
    color: {T.TEXT_SEC};
    background: transparent;
    border: none;
    padding: 4px 0;
}}
#sectionLink:hover {{
    color: {T.TEXT_PRI};
}}

/* ── Cards ─────────────────────────────────────────────────────── */
#recentCard {{
    background: {T.SURFACE};
    border-radius: {T.R_LG};
    border: 1px solid rgba(255,255,255,0.04);
}}
#recentCard:hover {{
    background: {T.SURFACE2};
    border-color: rgba(255,255,255,0.07);
}}

#albumArtPlaceholder {{
    background: {T.SURFACE3};
    border-radius: {T.R_MD};
}}

#cardTitle {{
    font-size: {T.FS_MD}pt;
    font-weight: 600;
    color: {T.TEXT_PRI};
}}
#cardSubtitle {{
    font-size: {T.FS_SM}pt;
    color: {T.TEXT_SEC};
    font-weight: 400;
}}

/* Quick action card */
#quickCard {{
    background: {T.SURFACE2};
    border-radius: {T.R_MD};
    border: 1px solid rgba(255,255,255,0.05);
}}
#quickCard:hover {{
    background: {T.SURFACE3};
}}

#quickCardTitle {{
    font-size: {T.FS_SM}pt;
    font-weight: 600;
    color: {T.TEXT_PRI};
}}
#quickCardSub {{
    font-size: {T.FS_XS}pt;
    color: {T.TEXT_SEC};
}}

/* Accent quick card */
#quickCardAccent {{
    background: {T.ACCENT_SOFT};
    border-radius: {T.R_MD};
    border: 1px solid rgba(29,185,84,0.18);
}}
#quickCardAccent:hover {{
    background: rgba(29,185,84,0.16);
}}
#quickCardTitleAccent {{
    font-size: {T.FS_SM}pt;
    font-weight: 600;
    color: {T.ACCENT};
}}
#quickCardSubAccent {{
    font-size: {T.FS_XS}pt;
    color: rgba(29,185,84,0.7);
}}

/* ── Library view ──────────────────────────────────────────────── */
#searchInput {{
    background: {T.SURFACE2};
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: {T.R_MD};
    color: {T.TEXT_PRI};
    font-size: {T.FS_MD}pt;
    padding: 10px 16px;
    selection-background-color: {T.ACCENT_SOFT};
}}
#searchInput:focus {{
    border-color: rgba(29,185,84,0.4);
    background: {T.SURFACE3};
}}
#searchInput::placeholder {{
    color: {T.TEXT_TER};
}}

#trackList {{
    background: transparent;
    border: none;
    font-size: {T.FS_MD}pt;
    color: {T.TEXT_PRI};
    outline: none;
}}
#trackList::item {{
    padding: 11px 14px;
    border-radius: {T.R_SM};
    margin: 1px 0;
    border: 1px solid transparent;
}}
#trackList::item:hover {{
    background: {T.SURFACE2};
    border-color: rgba(255,255,255,0.04);
}}
#trackList::item:selected {{
    background: {T.ACCENT_SOFT};
    color: {T.TEXT_PRI};
    border-color: rgba(29,185,84,0.15);
}}

/* Track list header */
#trackHeaderLabel {{
    font-size: {T.FS_XS}pt;
    font-weight: 600;
    color: {T.TEXT_TER};
    letter-spacing: 1.2px;
    text-transform: uppercase;
    padding: 0 14px 8px;
}}

/* ── Playlist view ─────────────────────────────────────────────── */
#playlistTitle {{
    font-size: {T.FS_3XL}pt;
    font-weight: 700;
    color: {T.TEXT_PRI};
    letter-spacing: -0.6px;
}}
#playlistMeta {{
    font-size: {T.FS_SM}pt;
    color: {T.TEXT_SEC};
}}

#playlistPlayButton {{
    background: {T.ACCENT};
    color: #000;
    border: none;
    border-radius: {T.R_CIR};
    font-size: {T.FS_MD}pt;
    font-weight: 700;
    padding: 0;
    min-width: 48px;
    min-height: 48px;
    max-width: 48px;
    max-height: 48px;
}}
#playlistPlayButton:hover {{
    background: {T.ACCENT_DIM};
}}
#playlistPlayButton:pressed {{
    background: #149640;
}}

/* ── Player Bar ────────────────────────────────────────────────── */
#playerBar {{
    background: {T.SURFACE};
    border-top: 1px solid rgba(255,255,255,0.06);
}}

#playerAlbumArt {{
    background: {T.SURFACE3};
    border-radius: {T.R_SM};
}}

#playerTrackTitle {{
    font-size: {T.FS_MD}pt;
    font-weight: 600;
    color: {T.TEXT_PRI};
}}
#playerArtist {{
    font-size: {T.FS_SM}pt;
    color: {T.TEXT_SEC};
    font-weight: 400;
}}

/* Player control buttons */
#controlButton {{
    background: transparent;
    border: none;
    border-radius: {T.R_CIR};
    color: {T.TEXT_SEC};
    padding: 6px;
    font-size: 16pt;
}}
#controlButton:hover {{
    color: {T.TEXT_PRI};
    background: rgba(255,255,255,0.06);
}}
#controlButton:pressed {{
    background: rgba(255,255,255,0.1);
}}

/* Play/Pause — visually dominant */
#playButton {{
    background: {T.TEXT_PRI};
    border: none;
    border-radius: {T.R_CIR};
    color: {T.BG};
    padding: 0;
    min-width: 40px;
    min-height: 40px;
    max-width: 40px;
    max-height: 40px;
    font-size: 14pt;
    font-weight: 700;
}}
#playButton:hover {{
    background: {T.ACCENT};
    color: #000;
}}
#playButton:pressed {{
    background: {T.ACCENT_DIM};
    transform: scale(0.96);
}}

/* Active toggle buttons (shuffle/repeat) */
#toggleButton {{
    background: transparent;
    border: none;
    border-radius: {T.R_CIR};
    color: {T.TEXT_TER};
    padding: 6px;
    font-size: 14pt;
}}
#toggleButton:hover {{
    color: {T.TEXT_PRI};
    background: rgba(255,255,255,0.06);
}}
#toggleButton[active="true"] {{
    color: {T.ACCENT};
}}
#toggleButton[active="true"]:hover {{
    background: {T.ACCENT_SOFT};
}}

/* Progress slider */
#progressSlider {{
    height: 4px;
}}
#progressSlider::groove:horizontal {{
    background: rgba(255,255,255,0.12);
    height: 4px;
    border-radius: 2px;
}}
#progressSlider::sub-page:horizontal {{
    background: {T.TEXT_PRI};
    height: 4px;
    border-radius: 2px;
}}
#progressSlider::handle:horizontal {{
    background: {T.TEXT_PRI};
    width: 12px;
    height: 12px;
    border-radius: 6px;
    margin: -4px 0;
    border: none;
}}
#progressSlider::handle:horizontal:hover {{
    background: {T.ACCENT};
    width: 14px;
    height: 14px;
    margin: -5px 0;
}}
#progressSlider:hover::sub-page:horizontal {{
    background: {T.ACCENT};
}}

/* Volume slider */
#volumeSlider {{
    height: 4px;
    max-width: 100px;
}}
#volumeSlider::groove:horizontal {{
    background: rgba(255,255,255,0.1);
    height: 4px;
    border-radius: 2px;
}}
#volumeSlider::sub-page:horizontal {{
    background: rgba(255,255,255,0.35);
    height: 4px;
    border-radius: 2px;
}}
#volumeSlider::handle:horizontal {{
    background: {T.TEXT_PRI};
    width: 10px;
    height: 10px;
    border-radius: 5px;
    margin: -3px 0;
    border: none;
}}
#volumeSlider::handle:horizontal:hover {{
    background: {T.ACCENT};
}}
#volumeSlider:hover::sub-page:horizontal {{
    background: rgba(255,255,255,0.55);
}}

/* Time labels */
#timeLabel {{
    font-size: {T.FS_XS}pt;
    color: {T.TEXT_TER};
    font-weight: 500;
    font-variant-numeric: tabular-nums;
    min-width: 36px;
}}

/* Divider line */
#divider {{
    background: rgba(255,255,255,0.06);
    max-height: 1px;
    min-height: 1px;
}}
"""


# ══════════════════════════════════════════════════════════════════
# HELPERS
# ══════════════════════════════════════════════════════════════════

def make_font(size: int, weight: int = QFont.Weight.Normal, italic: bool = False) -> QFont:
    f = QFont()
    f.setPointSize(size)
    f.setWeight(weight)
    f.setItalic(italic)
    return f


def color_pixmap(size: int, color: str, radius: int = 0) -> QPixmap:
    """Create a solid-color rounded pixmap placeholder."""
    px = QPixmap(size, size)
    px.fill(Qt.GlobalColor.transparent)
    p = QPainter(px)
    p.setRenderHint(QPainter.RenderHint.Antialiasing)
    p.setBrush(QColor(color))
    p.setPen(Qt.PenStyle.NoPen)
    p.drawRoundedRect(0, 0, size, size, radius, radius)
    p.end()
    return px


def icon_pixmap(symbol: str, size: int, color: str) -> QPixmap:
    """Render a unicode symbol as a pixmap (icon substitute)."""
    px = QPixmap(size, size)
    px.fill(Qt.GlobalColor.transparent)
    p = QPainter(px)
    p.setRenderHint(QPainter.RenderHint.Antialiasing)
    p.setPen(QColor(color))
    f = QFont()
    f.setPointSize(int(size * 0.52))
    p.setFont(f)
    p.drawText(px.rect(), Qt.AlignmentFlag.AlignCenter, symbol)
    p.end()
    return px


def spacer(w: int = 0, h: int = 0) -> QSpacerItem:
    return QSpacerItem(w, h, QSizePolicy.Policy.Fixed, QSizePolicy.Policy.Fixed)


def hspacer() -> QSpacerItem:
    return QSpacerItem(0, 0, QSizePolicy.Policy.Expanding, QSizePolicy.Policy.Minimum)


def vspacer() -> QSpacerItem:
    return QSpacerItem(0, 0, QSizePolicy.Policy.Minimum, QSizePolicy.Policy.Expanding)


def shadow(widget: QWidget, blur: int = 20, x: int = 0, y: int = 4, opacity: float = 0.3):
    fx = QGraphicsDropShadowEffect()
    fx.setBlurRadius(blur)
    fx.setOffset(x, y)
    fx.setColor(QColor(0, 0, 0, int(255 * opacity)))
    widget.setGraphicsEffect(fx)


# ══════════════════════════════════════════════════════════════════
# SIDEBAR
# ══════════════════════════════════════════════════════════════════

class Sidebar(QFrame):
    def __init__(self, parent=None):
        super().__init__(parent)
        self.setObjectName("sidebar")
        self.setFixedWidth(228)
        self.setSizePolicy(QSizePolicy.Policy.Fixed, QSizePolicy.Policy.Expanding)

        root = QVBoxLayout(self)
        root.setContentsMargins(16, 24, 16, 20)
        root.setSpacing(0)

        # ── Logo ─────────────────────────────────────────────────
        logo_row = QHBoxLayout()
        logo_row.setSpacing(10)

        logo_art = QLabel()
        logo_art.setPixmap(color_pixmap(30, T.ACCENT, 8))
        logo_art.setFixedSize(30, 30)

        logo_text_col = QVBoxLayout()
        logo_text_col.setSpacing(0)

        logo_label = QLabel("Aero")
        logo_label.setObjectName("appLogoLabel")
        logo_label.setFont(make_font(T.FS_2XL, QFont.Weight.Bold))

        logo_sub = QLabel("MUSIC")
        logo_sub.setObjectName("appLogoSub")

        logo_text_col.addWidget(logo_label)
        logo_text_col.addWidget(logo_sub)

        logo_row.addWidget(logo_art)
        logo_row.addLayout(logo_text_col)
        logo_row.addItem(hspacer())

        root.addLayout(logo_row)
        root.addSpacing(28)

        # ── Navigation label ─────────────────────────────────────
        nav_lbl = QLabel("NAVIGATION")
        nav_lbl.setObjectName("sidebarSectionLabel")
        root.addWidget(nav_lbl)
        root.addSpacing(8)

        # Nav buttons
        self.homeButton    = self._nav_btn("  🏠  Home",    "homeButton")
        self.libraryButton = self._nav_btn("  🎵  Library", "libraryButton")
        self.playlistsButton = self._nav_btn("  📁  Playlists", "playlistsButton")

        for btn in (self.homeButton, self.libraryButton, self.playlistsButton):
            root.addWidget(btn)

        root.addSpacing(28)

        # ── Playlists section ────────────────────────────────────
        pl_header = QHBoxLayout()
        pl_lbl = QLabel("PLAYLISTS")
        pl_lbl.setObjectName("sidebarSectionLabel")
        pl_header.addWidget(pl_lbl)
        pl_header.addItem(hspacer())
        root.addLayout(pl_header)
        root.addSpacing(8)

        # Scrollable playlist list
        self.playlistList = QListWidget()
        self.playlistList.setObjectName("playlistList")
        self.playlistList.setFocusPolicy(Qt.FocusPolicy.NoFocus)
        self.playlistList.setHorizontalScrollBarPolicy(Qt.ScrollBarPolicy.ScrollBarAlwaysOff)

        # Seed playlists
        playlists = [
            "Chill Vibes",
            "Morning Run",
            "Late Night",
            "Focus Mode",
            "Road Trip",
            "Favourites",
            "Discover Weekly",
        ]
        for pl in playlists:
            item = QListWidgetItem(f"  {pl}")
            item.setSizeHint(QSize(0, 34))
            self.playlistList.addItem(item)

        self.playlistList.setFixedHeight(min(len(playlists) * 36, 240))
        root.addWidget(self.playlistList)
        root.addSpacing(12)

        # ── New Playlist ─────────────────────────────────────────
        self.newPlaylistButton = QPushButton("  +  New Playlist")
        self.newPlaylistButton.setObjectName("newPlaylistButton")
        self.newPlaylistButton.setFixedHeight(36)
        self.newPlaylistButton.setCursor(Qt.CursorShape.PointingHandCursor)
        root.addWidget(self.newPlaylistButton)

        root.addItem(vspacer())

    def _nav_btn(self, text: str, name: str) -> QPushButton:
        btn = QPushButton(text)
        btn.setObjectName("navButton")
        btn.setFixedHeight(38)
        btn.setCursor(Qt.CursorShape.PointingHandCursor)
        btn.setProperty("active", "false")
        return btn

    def set_active_nav(self, name: str):
        """Highlight the active nav button."""
        for btn, key in [
            (self.homeButton, "home"),
            (self.libraryButton, "library"),
            (self.playlistsButton, "playlists"),
        ]:
            is_active = key == name
            btn.setProperty("active", "true" if is_active else "false")
            btn.style().unpolish(btn)
            btn.style().polish(btn)


# ══════════════════════════════════════════════════════════════════
# HOME VIEW
# ══════════════════════════════════════════════════════════════════

class RecentCard(QFrame):
    """A single recently-played card."""

    def __init__(self, title: str, artist: str, color: str, parent=None):
        super().__init__(parent)
        self.setObjectName("recentCard")
        self.setCursor(Qt.CursorShape.PointingHandCursor)
        self.setFixedSize(156, 196)

        layout = QVBoxLayout(self)
        layout.setContentsMargins(12, 12, 12, 14)
        layout.setSpacing(8)

        # Album art
        art = QLabel()
        art.setObjectName("albumArtPlaceholder")
        art.setFixedSize(132, 132)
        art.setPixmap(color_pixmap(132, color, 10))
        art.setScaledContents(True)

        # Music note overlay
        note = QLabel("♪")
        note.setFont(make_font(28))
        note.setStyleSheet(f"color: rgba(255,255,255,0.3); background: transparent;")
        note.setAlignment(Qt.AlignmentFlag.AlignCenter)

        art_container = QFrame()
        art_container.setObjectName("albumArtPlaceholder")
        art_container.setFixedSize(132, 132)
        art_layout = QVBoxLayout(art_container)
        art_layout.setContentsMargins(0, 0, 0, 0)
        art_layout.addWidget(note, alignment=Qt.AlignmentFlag.AlignCenter)

        layout.addWidget(art_container)

        title_lbl = QLabel(title)
        title_lbl.setObjectName("cardTitle")
        title_lbl.setFont(make_font(T.FS_MD, QFont.Weight.DemiBold))
        title_lbl.setWordWrap(False)
        layout.addWidget(title_lbl)

        artist_lbl = QLabel(artist)
        artist_lbl.setObjectName("cardSubtitle")
        artist_lbl.setFont(make_font(T.FS_SM))
        layout.addWidget(artist_lbl)


class QuickActionCard(QFrame):
    """A quick-action card in the Home view."""

    def __init__(self, icon: str, title: str, subtitle: str, accent: bool = False, parent=None):
        super().__init__(parent)
        self.setObjectName("quickCardAccent" if accent else "quickCard")
        self.setCursor(Qt.CursorShape.PointingHandCursor)
        self.setFixedHeight(68)

        layout = QHBoxLayout(self)
        layout.setContentsMargins(14, 0, 14, 0)
        layout.setSpacing(12)

        icon_lbl = QLabel(icon)
        icon_lbl.setFont(make_font(18))
        icon_lbl.setFixedWidth(32)
        icon_lbl.setAlignment(Qt.AlignmentFlag.AlignCenter)
        icon_lbl.setStyleSheet("background: transparent;")
        layout.addWidget(icon_lbl)

        text_col = QVBoxLayout()
        text_col.setSpacing(2)

        title_n = "quickCardTitleAccent" if accent else "quickCardTitle"
        sub_n   = "quickCardSubAccent"   if accent else "quickCardSub"

        title_lbl = QLabel(title)
        title_lbl.setObjectName(title_n)
        title_lbl.setFont(make_font(T.FS_MD, QFont.Weight.DemiBold))

        sub_lbl = QLabel(subtitle)
        sub_lbl.setObjectName(sub_n)
        sub_lbl.setFont(make_font(T.FS_XS))

        text_col.addWidget(title_lbl)
        text_col.addWidget(sub_lbl)
        layout.addLayout(text_col)
        layout.addItem(hspacer())

        chev = QLabel("›")
        chev.setFont(make_font(14))
        chev.setStyleSheet(f"color: {'rgba(29,185,84,0.6)' if accent else T.TEXT_TER}; background: transparent;")
        layout.addWidget(chev)


class HomeView(QWidget):
    def __init__(self, parent=None):
        super().__init__(parent)
        self.setObjectName("homeView")

        root = QVBoxLayout(self)
        root.setContentsMargins(36, 32, 36, 24)
        root.setSpacing(0)

        scroll = QScrollArea()
        scroll.setWidgetResizable(True)
        scroll.setHorizontalScrollBarPolicy(Qt.ScrollBarPolicy.ScrollBarAlwaysOff)
        scroll.setFrameShape(QFrame.Shape.NoFrame)

        container = QWidget()
        scroll.setWidget(container)
        layout = QVBoxLayout(container)
        layout.setContentsMargins(0, 0, 0, 24)
        layout.setSpacing(0)

        root.addWidget(scroll)

        # ── Page heading ─────────────────────────────────────────
        greet = QLabel("Good evening ✦")
        greet.setObjectName("pageTitle")
        greet.setFont(make_font(T.FS_4XL, QFont.Weight.Bold))
        layout.addWidget(greet)

        sub = QLabel("What would you like to listen to?")
        sub.setObjectName("pageSubtitle")
        sub.setFont(make_font(T.FS_MD))
        sub.setContentsMargins(0, 4, 0, 0)
        layout.addWidget(sub)

        layout.addSpacing(36)

        # ── Quick Actions ─────────────────────────────────────────
        self._section_header(layout, "Quick Actions")
        layout.addSpacing(12)

        qa_grid = QGridLayout()
        qa_grid.setSpacing(10)

        cards = [
            ("▶", "Resume Last Track", "Chill Vibes · Track 4", True),
            ("🔀", "Shuffle All",       "2,341 songs in library", False),
            ("💚", "Liked Songs",       "184 songs saved",        False),
            ("🕐", "Recently Added",    "Added this week",         False),
        ]
        for i, (icon, title, sub, accent) in enumerate(cards):
            c = QuickActionCard(icon, title, sub, accent)
            qa_grid.addWidget(c, i // 2, i % 2)

        layout.addLayout(qa_grid)

        layout.addSpacing(40)

        # ── Recently Played ──────────────────────────────────────
        self._section_header(layout, "Recently Played", show_link=True)
        layout.addSpacing(14)

        # Horizontal scroll area for cards
        h_scroll = QScrollArea()
        h_scroll.setWidgetResizable(True)
        h_scroll.setVerticalScrollBarPolicy(Qt.ScrollBarPolicy.ScrollBarAlwaysOff)
        h_scroll.setHorizontalScrollBarPolicy(Qt.ScrollBarPolicy.ScrollBarAsNeeded)
        h_scroll.setFrameShape(QFrame.Shape.NoFrame)
        h_scroll.setFixedHeight(210)

        h_container = QWidget()
        h_layout = QHBoxLayout(h_container)
        h_layout.setContentsMargins(0, 0, 0, 4)
        h_layout.setSpacing(14)

        recent_data = [
            ("Chill Vibes",   "Various Artists", "#1e3a2f"),
            ("Morning Run",   "Energetic Mix",   "#2a1e3a"),
            ("Late Night",    "Ambient Sounds",  "#1e2a3a"),
            ("Focus Mode",    "Lo-Fi Beats",     "#3a2a1e"),
            ("Road Trip",     "Classic Hits",    "#2a3a1e"),
            ("Neon Dreams",   "Synthwave",       "#1a1a2e"),
            ("Rain & Coffee", "Acoustic",        "#2a1a1a"),
        ]
        for title, artist, color in recent_data:
            card = RecentCard(title, artist, color)
            h_layout.addWidget(card)

        h_layout.addItem(hspacer())
        h_scroll.setWidget(h_container)
        layout.addWidget(h_scroll)

        layout.addSpacing(40)

        # ── Your Library preview ─────────────────────────────────
        self._section_header(layout, "Your Library", show_link=True)
        layout.addSpacing(12)

        lib_data = [
            ("Midnight City",       "M83",              "4:03", "#1e2a3a"),
            ("Blinding Lights",     "The Weeknd",       "3:20", "#2a1e1e"),
            ("Levitating",          "Dua Lipa",         "3:24", "#1e1e3a"),
            ("Stay",                "The Kid LAROI",    "2:21", "#2a2a1e"),
            ("Good 4 U",            "Olivia Rodrigo",   "2:58", "#1e3a1e"),
        ]

        lib_frame = QFrame()
        lib_frame.setObjectName("recentCard")
        lib_frame.setStyleSheet(f"#recentCard {{ border-radius: 12px; }}")
        lib_layout = QVBoxLayout(lib_frame)
        lib_layout.setContentsMargins(0, 4, 0, 4)
        lib_layout.setSpacing(0)

        for i, (title, artist, dur, color) in enumerate(lib_data):
            row = self._lib_track_row(i + 1, title, artist, dur, color)
            lib_layout.addWidget(row)
            if i < len(lib_data) - 1:
                div = QFrame()
                div.setObjectName("divider")
                lib_layout.addWidget(div)

        layout.addWidget(lib_frame)

        layout.addItem(vspacer())

    def _section_header(self, layout: QVBoxLayout, title: str, show_link: bool = False):
        row = QHBoxLayout()
        lbl = QLabel(title)
        lbl.setObjectName("sectionTitle")
        lbl.setFont(make_font(T.FS_XL, QFont.Weight.Bold))
        row.addWidget(lbl)
        if show_link:
            row.addItem(hspacer())
            link = QPushButton("See all  →")
            link.setObjectName("sectionLink")
            link.setCursor(Qt.CursorShape.PointingHandCursor)
            link.setFont(make_font(T.FS_SM))
            row.addWidget(link)
        layout.addLayout(row)

    def _lib_track_row(self, num: int, title: str, artist: str, duration: str, color: str) -> QWidget:
        row = QWidget()
        row.setCursor(Qt.CursorShape.PointingHandCursor)
        lay = QHBoxLayout(row)
        lay.setContentsMargins(16, 8, 16, 8)
        lay.setSpacing(12)

        num_lbl = QLabel(str(num))
        num_lbl.setFixedWidth(24)
        num_lbl.setAlignment(Qt.AlignmentFlag.AlignCenter)
        num_lbl.setFont(make_font(T.FS_SM))
        num_lbl.setStyleSheet(f"color: {T.TEXT_TER}; background: transparent;")
        lay.addWidget(num_lbl)

        art = QLabel()
        art.setFixedSize(36, 36)
        art.setPixmap(color_pixmap(36, color, 6))
        art.setScaledContents(True)
        lay.addWidget(art)

        text = QVBoxLayout()
        text.setSpacing(2)
        t_lbl = QLabel(title)
        t_lbl.setFont(make_font(T.FS_MD, QFont.Weight.Medium))
        t_lbl.setStyleSheet(f"color: {T.TEXT_PRI}; background: transparent;")
        a_lbl = QLabel(artist)
        a_lbl.setFont(make_font(T.FS_SM))
        a_lbl.setStyleSheet(f"color: {T.TEXT_SEC}; background: transparent;")
        text.addWidget(t_lbl)
        text.addWidget(a_lbl)
        lay.addLayout(text)
        lay.addItem(hspacer())

        dur_lbl = QLabel(duration)
        dur_lbl.setFont(make_font(T.FS_SM))
        dur_lbl.setStyleSheet(f"color: {T.TEXT_TER}; background: transparent;")
        lay.addWidget(dur_lbl)

        return row


# ══════════════════════════════════════════════════════════════════
# LIBRARY VIEW
# ══════════════════════════════════════════════════════════════════

class LibraryView(QWidget):
    def __init__(self, parent=None):
        super().__init__(parent)
        self.setObjectName("libraryView")

        root = QVBoxLayout(self)
        root.setContentsMargins(36, 32, 36, 16)
        root.setSpacing(0)

        # Page title
        title = QLabel("Your Library")
        title.setObjectName("pageTitle")
        title.setFont(make_font(T.FS_4XL, QFont.Weight.Bold))
        root.addWidget(title)
        root.addSpacing(24)

        # Search bar
        search_row = QHBoxLayout()
        self.searchInput = QLineEdit()
        self.searchInput.setObjectName("searchInput")
        self.searchInput.setPlaceholderText("Search songs, artists, albums…")
        self.searchInput.setFixedHeight(40)
        self.searchInput.setFont(make_font(T.FS_MD))
        search_row.addWidget(self.searchInput)
        root.addLayout(search_row)
        root.addSpacing(20)

        # Column headers
        header_row = QHBoxLayout()
        header_row.setContentsMargins(14, 0, 14, 0)
        for text, stretch in [("#", 0), ("TITLE", 1), ("ARTIST", 1), ("ALBUM", 1), ("DURATION", 0)]:
            lbl = QLabel(text)
            lbl.setObjectName("trackHeaderLabel")
            lbl.setFont(make_font(T.FS_XS, QFont.Weight.DemiBold))
            if stretch == 0:
                lbl.setFixedWidth(52 if text == "#" else 60)
            else:
                lbl.setSizePolicy(QSizePolicy.Policy.Expanding, QSizePolicy.Policy.Preferred)
            header_row.addWidget(lbl)
        root.addLayout(header_row)

        div = QFrame()
        div.setObjectName("divider")
        root.addWidget(div)
        root.addSpacing(4)

        # Track list
        self.trackList = QListWidget()
        self.trackList.setObjectName("trackList")
        self.trackList.setFocusPolicy(Qt.FocusPolicy.StrongFocus)
        self.trackList.setHorizontalScrollBarPolicy(Qt.ScrollBarPolicy.ScrollBarAlwaysOff)
        self.trackList.setAlternatingRowColors(False)
        self.trackList.setSpacing(1)

        tracks = [
            (1,  "Midnight City",          "M83",              "Hurry Up, We're Dreaming", "4:03"),
            (2,  "Blinding Lights",         "The Weeknd",       "After Hours",              "3:20"),
            (3,  "Levitating",              "Dua Lipa",         "Future Nostalgia",         "3:24"),
            (4,  "Stay",                    "The Kid LAROI",    "F*CK LOVE 3",              "2:21"),
            (5,  "Good 4 U",                "Olivia Rodrigo",   "SOUR",                     "2:58"),
            (6,  "Peaches",                 "Justin Bieber",    "Justice",                  "3:18"),
            (7,  "Bad Guy",                 "Billie Eilish",    "WHEN WE ALL FALL ASLEEP",  "3:14"),
            (8,  "Industry Baby",           "Lil Nas X",        "MONTERO",                  "3:32"),
            (9,  "Happier Than Ever",       "Billie Eilish",    "Happier Than Ever",        "4:58"),
            (10, "drivers license",         "Olivia Rodrigo",   "SOUR",                     "4:02"),
            (11, "Therefore I Am",          "Billie Eilish",    "Single",                   "2:54"),
            (12, "Save Your Tears",         "The Weeknd",       "After Hours (Remix)",      "3:36"),
            (13, "Shivers",                 "Ed Sheeran",       "=",                        "3:27"),
            (14, "Montero",                 "Lil Nas X",        "MONTERO",                  "2:18"),
            (15, "Kiss Me More",            "Doja Cat",         "Planet Her",               "3:38"),
        ]

        for num, title_t, artist, album, dur in tracks:
            item = QListWidgetItem()
            item.setSizeHint(QSize(0, 46))
            # We'll display as formatted text — in production, use custom delegate
            item.setText(f"  {num:<4} {title_t:<30} {artist:<22} {album:<28} {dur}")
            item.setFont(make_font(T.FS_MD))
            self.trackList.addItem(item)

        root.addWidget(self.trackList)


# ══════════════════════════════════════════════════════════════════
# PLAYLIST VIEW
# ══════════════════════════════════════════════════════════════════

class PlaylistView(QWidget):
    def __init__(self, parent=None):
        super().__init__(parent)
        self.setObjectName("playlistView")

        root = QVBoxLayout(self)
        root.setContentsMargins(36, 32, 36, 16)
        root.setSpacing(0)

        # ── Playlist header ──────────────────────────────────────
        header = QHBoxLayout()
        header.setSpacing(24)

        # Playlist art
        art = QLabel()
        art.setFixedSize(148, 148)
        art.setPixmap(color_pixmap(148, "#1e3a2f", 16))
        art.setObjectName("albumArtPlaceholder")
        note = QLabel("♪")
        note.setFont(make_font(48))
        note.setAlignment(Qt.AlignmentFlag.AlignCenter)
        note.setStyleSheet("color: rgba(255,255,255,0.25); background: transparent;")
        art_layout = QVBoxLayout(art)
        art_layout.setContentsMargins(0, 0, 0, 0)
        art_layout.addWidget(note, alignment=Qt.AlignmentFlag.AlignCenter)
        shadow(art, 32, 0, 8, 0.35)
        header.addWidget(art)

        # Playlist info
        info = QVBoxLayout()
        info.setSpacing(6)
        info.addItem(vspacer())

        pl_type = QLabel("PLAYLIST")
        pl_type.setFont(make_font(T.FS_XS, QFont.Weight.DemiBold))
        pl_type.setStyleSheet(f"color: {T.TEXT_TER}; letter-spacing: 1.5px; background: transparent;")
        info.addWidget(pl_type)

        self.playlistTitle = QLabel("Chill Vibes")
        self.playlistTitle.setObjectName("playlistTitle")
        self.playlistTitle.setFont(make_font(T.FS_3XL, QFont.Weight.Bold))
        info.addWidget(self.playlistTitle)

        self.playlistMeta = QLabel("By You · 42 songs · 2 hr 48 min")
        self.playlistMeta.setObjectName("playlistMeta")
        self.playlistMeta.setFont(make_font(T.FS_SM))
        info.addWidget(self.playlistMeta)

        info.addSpacing(16)

        # Action buttons row
        actions = QHBoxLayout()
        actions.setSpacing(12)

        self.playlistPlayButton = QPushButton("▶")
        self.playlistPlayButton.setObjectName("playlistPlayButton")
        self.playlistPlayButton.setCursor(Qt.CursorShape.PointingHandCursor)
        self.playlistPlayButton.setToolTip("Play")
        shadow(self.playlistPlayButton, 16, 0, 4, 0.3)
        actions.addWidget(self.playlistPlayButton)

        shuffle_btn = QPushButton("🔀  Shuffle")
        shuffle_btn.setFixedHeight(36)
        shuffle_btn.setFont(make_font(T.FS_SM, QFont.Weight.Medium))
        shuffle_btn.setCursor(Qt.CursorShape.PointingHandCursor)
        shuffle_btn.setStyleSheet(
            f"QPushButton {{ background: transparent; color: {T.TEXT_SEC}; "
            f"border: 1px solid rgba(255,255,255,0.1); border-radius: 18px; padding: 0 18px; }}"
            f"QPushButton:hover {{ color: {T.TEXT_PRI}; border-color: rgba(255,255,255,0.2); }}"
        )
        actions.addWidget(shuffle_btn)

        like_btn = QPushButton("♡  Save")
        like_btn.setFixedHeight(36)
        like_btn.setFont(make_font(T.FS_SM, QFont.Weight.Medium))
        like_btn.setCursor(Qt.CursorShape.PointingHandCursor)
        like_btn.setStyleSheet(shuffle_btn.styleSheet())
        actions.addWidget(like_btn)

        actions.addItem(hspacer())
        info.addLayout(actions)

        info.addItem(vspacer())
        header.addLayout(info)

        root.addLayout(header)
        root.addSpacing(28)

        # Divider
        div = QFrame(); div.setObjectName("divider")
        root.addWidget(div)
        root.addSpacing(4)

        # Column headers
        header_row = QHBoxLayout()
        header_row.setContentsMargins(14, 0, 14, 0)
        for text, w in [("#", 36), ("TITLE & ARTIST", -1), ("DURATION", 60)]:
            lbl = QLabel(text)
            lbl.setObjectName("trackHeaderLabel")
            lbl.setFont(make_font(T.FS_XS, QFont.Weight.DemiBold))
            if w > 0:
                lbl.setFixedWidth(w)
            else:
                lbl.setSizePolicy(QSizePolicy.Policy.Expanding, QSizePolicy.Policy.Preferred)
            header_row.addWidget(lbl)
        root.addLayout(header_row)
        root.addSpacing(4)

        # Track list
        self.playlistTrackList = QListWidget()
        self.playlistTrackList.setObjectName("trackList")
        self.playlistTrackList.setFocusPolicy(Qt.FocusPolicy.StrongFocus)
        self.playlistTrackList.setHorizontalScrollBarPolicy(Qt.ScrollBarPolicy.ScrollBarAlwaysOff)
        self.playlistTrackList.setSpacing(1)

        pl_tracks = [
            (1,  "Weightless",           "Marconi Union",    "7:47"),
            (2,  "Intro",                "The xx",           "2:08"),
            (3,  "Sunset Lover",         "Petit Biscuit",    "3:23"),
            (4,  "Bloom",                "ODESZA",           "4:10"),
            (5,  "Sleep",                "Flume",            "4:41"),
            (6,  "Don't Delete the Kisses","Wolf Alice",      "4:36"),
            (7,  "Youth",                "Daughter",         "4:28"),
            (8,  "Saturn",               "Stevie Wonder",    "4:54"),
            (9,  "Electric Feel",        "MGMT",             "3:49"),
            (10, "Breathe",              "Pink Floyd",       "2:43"),
            (11, "Northern Lights",      "Foo Fighters",     "4:32"),
            (12, "Golden",               "Harry Styles",     "3:29"),
        ]
        for num, title_t, artist, dur in pl_tracks:
            item = QListWidgetItem()
            item.setSizeHint(QSize(0, 46))
            item.setText(f"  {num:<4} {title_t:<35} {artist:<22} {dur}")
            item.setFont(make_font(T.FS_MD))
            self.playlistTrackList.addItem(item)

        root.addWidget(self.playlistTrackList)


# ══════════════════════════════════════════════════════════════════
# PLAYER BAR
# ══════════════════════════════════════════════════════════════════

class PlayerBar(QFrame):
    def __init__(self, parent=None):
        super().__init__(parent)
        self.setObjectName("playerBar")
        self.setFixedHeight(90)

        root = QHBoxLayout(self)
        root.setContentsMargins(20, 0, 20, 0)
        root.setSpacing(0)

        # ── LEFT: album art + track info ─────────────────────────
        left = QHBoxLayout()
        left.setSpacing(14)
        left.setContentsMargins(0, 0, 0, 0)

        self.playerAlbumArt = QLabel()
        self.playerAlbumArt.setObjectName("playerAlbumArt")
        self.playerAlbumArt.setFixedSize(54, 54)
        self.playerAlbumArt.setPixmap(color_pixmap(54, "#1e3a2f", 8))
        self.playerAlbumArt.setScaledContents(True)
        shadow(self.playerAlbumArt, 12, 0, 3, 0.3)
        left.addWidget(self.playerAlbumArt)

        track_info = QVBoxLayout()
        track_info.setSpacing(3)
        track_info.setAlignment(Qt.AlignmentFlag.AlignVCenter)

        self.playerTrackTitle = QLabel("Weightless")
        self.playerTrackTitle.setObjectName("playerTrackTitle")
        self.playerTrackTitle.setFont(make_font(T.FS_MD, QFont.Weight.DemiBold))

        self.playerArtist = QLabel("Marconi Union")
        self.playerArtist.setObjectName("playerArtist")
        self.playerArtist.setFont(make_font(T.FS_SM))

        track_info.addWidget(self.playerTrackTitle)
        track_info.addWidget(self.playerArtist)

        left.addLayout(track_info)

        # Like button next to track info
        like_btn = self._ctrl_btn("♡", "likeButton", size=28)
        left.addWidget(like_btn)

        left_widget = QWidget()
        left_widget.setLayout(left)
        left_widget.setMinimumWidth(220)
        root.addWidget(left_widget)

        # ── CENTER: controls + progress ──────────────────────────
        center = QVBoxLayout()
        center.setSpacing(6)
        center.setAlignment(Qt.AlignmentFlag.AlignVCenter)
        center.setContentsMargins(20, 0, 20, 0)

        # Controls row
        ctrl_row = QHBoxLayout()
        ctrl_row.setSpacing(6)
        ctrl_row.setAlignment(Qt.AlignmentFlag.AlignCenter)

        self.shuffleButton = self._toggle_btn("⇄", "shuffleButton")
        self.prevButton    = self._ctrl_btn("⏮", "prevButton", size=32)
        self.playButton    = self._play_btn()
        self.nextButton    = self._ctrl_btn("⏭", "nextButton", size=32)
        self.repeatButton  = self._toggle_btn("↺", "repeatButton")

        for w in (self.shuffleButton, self.prevButton, self.playButton,
                  self.nextButton, self.repeatButton):
            ctrl_row.addWidget(w)

        center.addLayout(ctrl_row)

        # Progress row
        prog_row = QHBoxLayout()
        prog_row.setSpacing(10)
        prog_row.setAlignment(Qt.AlignmentFlag.AlignCenter)

        self.currentTimeLabel = QLabel("1:24")
        self.currentTimeLabel.setObjectName("timeLabel")
        self.currentTimeLabel.setFont(make_font(T.FS_XS))
        self.currentTimeLabel.setAlignment(Qt.AlignmentFlag.AlignRight | Qt.AlignmentFlag.AlignVCenter)

        self.progressSlider = QSlider(Qt.Orientation.Horizontal)
        self.progressSlider.setObjectName("progressSlider")
        self.progressSlider.setMinimum(0)
        self.progressSlider.setMaximum(1000)
        self.progressSlider.setValue(190)      # ~19% through
        self.progressSlider.setCursor(Qt.CursorShape.PointingHandCursor)
        self.progressSlider.setSizePolicy(QSizePolicy.Policy.Expanding, QSizePolicy.Policy.Fixed)
        self.progressSlider.setFixedHeight(16)

        self.totalTimeLabel = QLabel("7:47")
        self.totalTimeLabel.setObjectName("timeLabel")
        self.totalTimeLabel.setFont(make_font(T.FS_XS))
        self.totalTimeLabel.setAlignment(Qt.AlignmentFlag.AlignLeft | Qt.AlignmentFlag.AlignVCenter)

        prog_row.addWidget(self.currentTimeLabel)
        prog_row.addWidget(self.progressSlider)
        prog_row.addWidget(self.totalTimeLabel)

        center.addLayout(prog_row)

        root.addLayout(center, 1)

        # ── RIGHT: volume + extras ───────────────────────────────
        right = QHBoxLayout()
        right.setSpacing(8)
        right.setAlignment(Qt.AlignmentFlag.AlignRight | Qt.AlignmentFlag.AlignVCenter)
        right.setContentsMargins(0, 0, 0, 0)

        # Queue / lyrics icons
        queue_btn = self._ctrl_btn("≡", "queueButton", size=28)
        right.addWidget(queue_btn)

        # Volume icon
        vol_icon = QLabel("🔊")
        vol_icon.setFont(make_font(11))
        vol_icon.setStyleSheet(f"color: {T.TEXT_SEC}; background: transparent;")
        right.addWidget(vol_icon)

        self.volumeSlider = QSlider(Qt.Orientation.Horizontal)
        self.volumeSlider.setObjectName("volumeSlider")
        self.volumeSlider.setMinimum(0)
        self.volumeSlider.setMaximum(100)
        self.volumeSlider.setValue(72)
        self.volumeSlider.setCursor(Qt.CursorShape.PointingHandCursor)
        self.volumeSlider.setFixedWidth(100)
        self.volumeSlider.setFixedHeight(16)
        right.addWidget(self.volumeSlider)

        right_widget = QWidget()
        right_widget.setLayout(right)
        right_widget.setMinimumWidth(220)
        root.addWidget(right_widget)

    # ── helpers ─────────────────────────────────────────────────

    def _ctrl_btn(self, symbol: str, name: str, size: int = 32) -> QPushButton:
        btn = QPushButton(symbol)
        btn.setObjectName("controlButton")
        btn.setFont(make_font(size == 32 and T.FS_LG or T.FS_MD))
        btn.setFixedSize(size, size)
        btn.setCursor(Qt.CursorShape.PointingHandCursor)
        btn.setObjectName(name)
        # re-apply style name after renaming
        btn.setObjectName("controlButton")
        btn.setAccessibleName(name)
        # Hack: set proper object name for QSS but expose via accessible name
        # In production, subclass QPushButton and store the backend name.
        # For this UI, we expose the widget via direct attribute access.
        return btn

    def _play_btn(self) -> QPushButton:
        btn = QPushButton("▶")
        btn.setObjectName("playButton")
        btn.setFont(make_font(T.FS_MD, QFont.Weight.Bold))
        btn.setFixedSize(40, 40)
        btn.setCursor(Qt.CursorShape.PointingHandCursor)
        btn.setToolTip("Play / Pause")
        shadow(btn, 14, 0, 3, 0.25)
        return btn

    def _toggle_btn(self, symbol: str, name: str) -> QPushButton:
        btn = QPushButton(symbol)
        btn.setObjectName("toggleButton")
        btn.setFont(make_font(T.FS_LG))
        btn.setFixedSize(30, 30)
        btn.setCursor(Qt.CursorShape.PointingHandCursor)
        btn.setProperty("active", "false")
        btn.setAccessibleName(name)
        return btn


# ══════════════════════════════════════════════════════════════════
# MAIN WINDOW
# ══════════════════════════════════════════════════════════════════

class AeroMusicApp(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Aero Music")
        self.setMinimumSize(1080, 680)
        self.resize(1280, 780)
        self.setStyleSheet(QSS)

        # Central widget
        central = QWidget()
        self.setCentralWidget(central)
        main_layout = QVBoxLayout(central)
        main_layout.setContentsMargins(0, 0, 0, 0)
        main_layout.setSpacing(0)

        # ── Body (sidebar + content) ─────────────────────────────
        body = QHBoxLayout()
        body.setContentsMargins(0, 0, 0, 0)
        body.setSpacing(0)

        # Sidebar
        self.sidebar = Sidebar()
        body.addWidget(self.sidebar)

        # Content stack
        self.contentStack = QStackedWidget()
        self.contentStack.setObjectName("contentArea")
        self.homeView     = HomeView()
        self.libraryView  = LibraryView()
        self.playlistView = PlaylistView()

        self.contentStack.addWidget(self.homeView)      # index 0
        self.contentStack.addWidget(self.libraryView)   # index 1
        self.contentStack.addWidget(self.playlistView)  # index 2

        body.addWidget(self.contentStack, 1)

        body_widget = QWidget()
        body_widget.setLayout(body)
        main_layout.addWidget(body_widget, 1)

        # ── Player bar (pinned bottom) ───────────────────────────
        self.playerBar = PlayerBar()
        shadow(self.playerBar, 40, 0, -4, 0.4)
        main_layout.addWidget(self.playerBar)

        # ── Wire nav buttons ─────────────────────────────────────
        self.sidebar.homeButton.clicked.connect(lambda: self._nav("home"))
        self.sidebar.libraryButton.clicked.connect(lambda: self._nav("library"))
        self.sidebar.playlistsButton.clicked.connect(lambda: self._nav("playlists"))
        self.sidebar.playlistList.itemClicked.connect(lambda: self._nav("playlists"))

        # Wire play button (UI-only toggle)
        self._playing = False
        self.playerBar.playButton.clicked.connect(self._toggle_play)

        # Wire shuffle / repeat toggle
        self.playerBar.shuffleButton.clicked.connect(
            lambda: self._toggle_button(self.playerBar.shuffleButton)
        )
        self.playerBar.repeatButton.clicked.connect(
            lambda: self._toggle_button(self.playerBar.repeatButton)
        )

        # Set initial view
        self._nav("home")

    # ── Navigation ───────────────────────────────────────────────

    def _nav(self, target: str):
        idx = {"home": 0, "library": 1, "playlists": 2}.get(target, 0)
        self.contentStack.setCurrentIndex(idx)
        self.sidebar.set_active_nav(target)

    # ── Play / Pause toggle (UI only) ────────────────────────────

    def _toggle_play(self):
        self._playing = not self._playing
        self.playerBar.playButton.setText("⏸" if self._playing else "▶")

    # ── Toggle button state ──────────────────────────────────────

    def _toggle_button(self, btn: QPushButton):
        is_active = btn.property("active") == "true"
        btn.setProperty("active", "false" if is_active else "true")
        btn.style().unpolish(btn)
        btn.style().polish(btn)

    # ── Named widget accessors for backend integration ────────────
    #
    #  All interactive widgets are accessible as attributes:
    #
    #  self.playerBar.playButton          → QPushButton
    #  self.playerBar.prevButton          → QPushButton
    #  self.playerBar.nextButton          → QPushButton
    #  self.playerBar.progressSlider      → QSlider
    #  self.playerBar.volumeSlider        → QSlider
    #  self.playerBar.shuffleButton       → QPushButton
    #  self.playerBar.repeatButton        → QPushButton
    #  self.playerBar.playerTrackTitle    → QLabel
    #  self.playerBar.playerArtist        → QLabel
    #  self.playerBar.playerAlbumArt      → QLabel
    #  self.playerBar.currentTimeLabel    → QLabel
    #  self.playerBar.totalTimeLabel      → QLabel
    #  self.libraryView.trackList         → QListWidget
    #  self.libraryView.searchInput       → QLineEdit
    #  self.playlistView.playlistTrackList→ QListWidget
    #  self.playlistView.playlistTitle    → QLabel
    #  self.playlistView.playlistPlayButton→ QPushButton
    #  self.sidebar.playlistList          → QListWidget
    #  self.sidebar.newPlaylistButton     → QPushButton
    #  self.sidebar.homeButton            → QPushButton
    #  self.sidebar.libraryButton         → QPushButton
    #  self.sidebar.playlistsButton       → QPushButton
    #  self.contentStack                  → QStackedWidget (index 0=Home,1=Library,2=Playlist)
    #


# ══════════════════════════════════════════════════════════════════
# ENTRY POINT
# ══════════════════════════════════════════════════════════════════

def main():
    app = QApplication(sys.argv)
    app.setApplicationName("Aero Music")
    app.setOrganizationName("Aero")

    # Request high-DPI scaling
    app.setAttribute(Qt.ApplicationAttribute.AA_UseHighDpiPixmaps)

    window = AeroMusicApp()
    window.show()
    sys.exit(app.exec())


if __name__ == "__main__":
    main()
