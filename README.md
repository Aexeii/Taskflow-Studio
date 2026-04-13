# Music Player Monorepo

Starter structure for a desktop + mobile music player.

## Layout

- `apps/desktop`: Flutter desktop app shell
- `apps/mobile`: Flutter mobile app shell
- `apps/web`: Flutter web companion app
- `backend`: FastAPI backend for auth, uploads, playlists, and sync
- `packages/core`: shared business logic contracts and controllers
- `packages/platform_services`: desktop/mobile service adapters
- `packages/ui_kit`: shared UI components and theme
- `prototype/pyqt`: placeholder area for the existing PyQt prototype

## Current Status

The current PyQt prototype still lives at the workspace root. Move these files into `prototype/pyqt/` when you are ready:

- `app.py`
- `aero_music_player.py`
- `controller.py`
- `requirements.txt`
- `models/`
- `player/`
- `utils/`

## Flutter Apps

The Flutter desktop and mobile apps are now implemented as interactive starter shells backed by shared mock domain state.

The Flutter web app is a companion experience that shares the same mock domain and visual language.

They currently provide:

- shared `core` entities and simple controllers
- shared `ui_kit` widgets for sidebar, track list, search field, playlist card, and player bar
- desktop app shell with sidebar, library view, playlist section, and bottom player
- mobile app shell with library, playlists, and now-playing tabs
- web companion app with a browser-friendly dashboard and player shell

They do not yet provide:

- full production audio playback across all targets
- file scanning/import
- metadata extraction
- Android/iOS platform integrations

The backend now provides an initial real foundation for:

- user accounts
- database persistence
- uploaded personal music
- playlist APIs
- sync-state APIs

## Build Notes

Desktop:

```bash
cd apps/desktop
flutter pub get
flutter build windows
```

Mobile APK:

```bash
cd apps/mobile
flutter pub get
flutter build apk
```

These commands require a working Flutter SDK and platform toolchains installed on your machine.

Web:

```bash
cd apps/web
flutter pub get
flutter build web
```

Vercel:

- deploy the `apps/web/build/web` output
- or configure Vercel to run `flutter build web` during build
- Vercel only applies to the web app, not the desktop/mobile/PyQt apps

Backend:

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Backend environment variables:

- `SECRET_KEY`
- `DATABASE_URL`
- `UPLOAD_DIR`
- `CORS_ORIGINS`
- `TOKEN_MAX_AGE_SECONDS`
