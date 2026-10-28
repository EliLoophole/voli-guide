# Voli Guide

A desktop app for Volibear matchup guides: search a champion, see (and edit) runes,
summoner spells, build, trading patterns, and early/mid/late game plans.

Built with [Tauri](https://tauri.app) + React. Game data and images come from Riot's
[Data Dragon](https://developer.riotgames.com/docs/lol#data-dragon).

## Run it

```bash
npm install          # first time only
npm run tauri dev    # desktop app (needs Rust + Visual Studio C++ tools)
npm run dev          # browser-only preview at http://localhost:1420
npm run check        # check your guides for typos / removed items
npm run tauri build  # make an installer in src-tauri/target/release/bundle
```

## Make a new release (installer)

GitHub builds the Windows installer for you whenever you push a version tag.

```bash
npm version patch        # 0.1.0 -> 0.1.1 (use "minor" for 0.2.0); commits + tags v0.1.1
git push --follow-tags   # pushes the commit and the tag, which starts the build
```

The build takes a few minutes (watch it on the repo's **Actions** tab, or `gh run watch`).
Every push to `main` also runs a compile-only build that keeps the Rust cache warm, so
release builds don't recompile everything. GitHub deletes caches unused for 7 days, so the
first release after a long break takes longer (~8 minutes).
When it finishes, a **draft** release appears on the **Releases** page with the
`-setup.exe` attached. Check it and click **Publish**. Once it's published, installed copies
of the app show an **Update to v…** button in the top bar: one click downloads, installs and
restarts. (Versions before 0.1.3 don't have this and need one manual install.)

### Update signing key (one-time setup)

Updates are signed so the app only installs files you built. The private key lives at
`%USERPROFILE%\.tauri\voli-guide.key` and is **not** in git. Back it up (with its password)
in a password manager: if it's lost, installed apps can't update anymore and everyone has to
reinstall by hand once. The public half is `plugins.updater.pubkey` in `src-tauri/tauri.conf.json`.
GitHub gets the private key through two repo secrets, `TAURI_SIGNING_PRIVATE_KEY` and
`TAURI_SIGNING_PRIVATE_KEY_PASSWORD`, which the release workflow reads.

The version number only lives in `package.json`; the app reads it from there.
The installer isn't code-signed, so Windows shows "Windows protected your PC" the first
time. Click **More info → Run anyway**.

## Where guides are saved

- Desktop app: one JSON file per champion in `Documents/VoliGuides` (e.g. `Darius.json`).
  You can back up that folder or edit files by hand. Each file holds a list of `playstyles`
  (the tabs on the matchup page). Guides saved before playstyles existed are converted when
  opened, and the original file is copied to `VoliGuides/_before-playstyles` first.
- Browser preview (`npm run dev`): browser storage only. Handy for trying UI changes.

## Project map

| File | What it does |
|---|---|
| `src/App.jsx` | Top bar, loads game data, switches between home and matchup page |
| `src/components/Home.jsx` | Start screen: big centered search over the Thunder Lord splash |
| `src/components/SearchBar.jsx` | Champion search (`/` to focus, arrows + Enter) |
| `src/components/ChampionGrid.jsx` | "Browse all champions" grid with written/not-written filter |
| `src/components/MatchupPage.jsx` | One matchup: view/edit toggle, autosave |
| `src/components/PlaystyleTabs.jsx` | Playstyle tabs: switch, and while editing rename / add / duplicate / delete, or copy one and paste it into another matchup |
| `src/components/RuneEditor.jsx` | Rune tree + rune picking |
| `src/components/ItemRow.jsx` / `SpellSlots.jsx` / `IconPicker.jsx` | Build, spells, and the icon picker pop-up |
| `src/components/TextSection.jsx` | Markdown text sections with live preview |
| `src/lib/ddragon.js` | Fetches champions/items/runes/spells, finds them by name |
| `src/lib/storage.js` | `listGuides` / `loadGuide` / `saveGuide` — the only code that touches files |
| `src/lib/updates.js` / `src/components/UpdateNotice.jsx` | On startup, asks GitHub for the latest published release and shows a button if it's newer |
| `src/lib/guideTemplate.js` | The shape of a guide, its playstyles and sections; converts old guides |
| `src/App.css` | Theme (colors are variables at the top) |
| `src-tauri/` | Desktop wrapper config; `capabilities/default.json` limits file access to `Documents/VoliGuides` |
| `src-tauri/icons/app-icon.svg` | Source for the app icon. After editing it, run `npx tauri icon src-tauri/icons/app-icon.svg` and delete the `android`/`ios` folders and `64x64.png` it adds |

---

Voli Guide isn't endorsed by Riot Games and doesn't reflect the views or opinions of Riot Games
or anyone officially involved in producing or managing Riot Games properties. Riot Games, and all
associated properties are trademarks or registered trademarks of Riot Games, Inc.
