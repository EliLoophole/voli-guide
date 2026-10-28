# Voli Guide: notes for Claude

Personal desktop app for Volibear matchup guides. Tauri 2 + React 19 (plain JavaScript, no
TypeScript) + Vite. See README.md for commands and the project map.

## Working with the user
- The user writes **all matchup content** themselves. Never draft or fill in guide text, builds or runes.
- The user is learning app development and wants to code parts themselves (search bar, matchup
  page layout, styling). Explain what you change, keep code simple and commented like the
  existing code, and don't rewrite pieces they're working on unless asked.
- Machine: Windows 10, Windows PowerShell 5.1, Node 22, Rust stable (MSVC), VS Build Tools 2022.

## How it fits together
- Game data and images come from Riot Data Dragon (no API key). Guides store runes, spells and
  items **by name**; `src/lib/ddragon.js` lookups resolve names to icons. Unknown names render a
  red "!" tile instead of breaking.
- `src/lib/storage.js` is the only code that reads/writes guides.
  - Desktop: `Documents/VoliGuides/<ChampionId>.json` via `@tauri-apps/plugin-fs`. File access is
    limited to that folder in `src-tauri/capabilities/default.json`.
  - Browser (`npm run dev`): falls back to localStorage, for UI testing only.
- The user's Documents folder is redirected to OneDrive:
  `C:\Users\elija\OneDrive\Documents\VoliGuides`. Guides are **not** in git; that folder is the
  only copy.
- `dragDropEnabled: false` in `tauri.conf.json` is required for HTML5 drag-to-reorder of items.
- Rune stat shards are not implemented yet.

## Gotchas
- PowerShell 5.1 `Set-Content`/`Out-File -Encoding utf8` writes a UTF-8 BOM. The release build's
  JSON parser rejects it (this broke the v0.1.0 build). Write files with the Write/Edit tools or
  `[IO.File]::WriteAllText(path, text, (New-Object Text.UTF8Encoding $false))`. No tracked file
  should start with the bytes EF BB BF.
- Terminals opened before Rust/gh were installed have a stale PATH ("cargo/gh not recognized").
  Fix: `$env:Path = [Environment]::GetEnvironmentVariable('Path','Machine') + ';' + [Environment]::GetEnvironmentVariable('Path','User')`
- gh is at `C:\Program Files\GitHub CLI\gh.exe` and is git's credential helper for github.com.
- The first `npm run tauri dev` compiles for ~2 minutes on all 8 cores; `src-tauri/target` grows
  to ~4 GB. `cargo clean` (in `src-tauri`) is always safe.
- Vite uses fixed port 1420 (`strictPort`); stop other dev servers before `tauri dev`.

## Releases
- The version lives only in `package.json` (`tauri.conf.json` has `"version": "../package.json"`;
  the version in `Cargo.toml` is unused).
- Release flow: `npm version patch` then `git push --follow-tags`. GitHub Actions
  (`.github/workflows/release.yml`) builds a **draft** release with `-setup.exe` and `.msi` in
  ~7 minutes. Publishing a draft is the user's decision; ask first.
- Repo is public: https://github.com/EliLoophole/voli-guide. Don't force-push or move tags.
  `v0.1.0` is a failed build with no release; `v0.1.1` is the first published release.

## Open items (as of 2026-10-28)
- Not yet confirmed that the `npm run tauri dev` window opens and stays open (on the first run the
  terminal showed the app exit).
- Ideas discussed: Tauri updater plugin (works with public GitHub releases), a private backup
  repo for `VoliGuides`, GitHub Issues as a to-do list of matchups to write.
