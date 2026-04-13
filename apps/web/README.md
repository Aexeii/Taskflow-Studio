# Web Companion App

Flutter web companion for the music player project.

This target is the one intended for browser deployment platforms such as Vercel.

It shares:

- `packages/core`
- `packages/ui_kit`

It currently provides a polished browser UI shell, not real playback or local file scanning.

Current browser functionality:

- searchable library
- playlist switching
- browser audio playback for demo preview URLs
- seek, volume, shuffle, repeat toggles
- liked tracks stored in browser local storage
- recently played tracks stored in browser local storage

Still not included:

- user accounts
- cloud sync
- uploaded user music
- backend APIs
- database-backed playlists
