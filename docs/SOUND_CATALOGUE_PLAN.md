# gflow Sound Catalogue — Documentation

## Overview

gflow is a producer-focused sound library and catalogue app built with Vite + React + TypeScript. It allows music producers to organise, browse, filter, and preview their entire sound library through a clean dark web UI — with no backend required in v1 (JSON + localStorage).

---

## Architecture

```
gflow-assistant/
├── src/
│   ├── types/           # TypeScript types (SoundItem, FilterState, Crate)
│   ├── hooks/           # Custom React hooks (localStorage, favorites, crates)
│   ├── components/
│   │   ├── layout/      # Navbar, Layout wrapper
│   │   ├── audio/       # AudioPlayer (HTML5, WaveSurfer-ready)
│   │   ├── sounds/      # SoundCard, SoundGrid
│   │   └── filters/     # FilterPanel
│   ├── pages/           # HomePage, BrowsePage, SoundDetailPage, CollectionsPage, CratesPage
│   └── utils/           # Filter logic (applyFilters)
├── data/
│   └── catalogue.json   # Source-of-truth catalogue data
├── public/
│   └── data/
│       └── catalogue.json  # Runtime-accessible copy (served by Vite)
├── scripts/
│   └── scan-library.js  # Node.js CLI for generating catalogue entries
└── docs/                # This documentation
```

---

## Data Model

All sound library entries are typed as `SoundItem`. See `src/types/catalogue.ts` and `docs/METADATA_SCHEMA.md` for full schema.

Key fields:
- `id` — unique string identifier
- `type` — one of: `instrument | sample | loop | preset | kit | collection | reference`
- `category` / `subcategory` — hierarchical classification
- `tags` — free-form string array for filtering
- `bpm`, `key` — musical metadata
- `preview_path` — path to audio preview file (null if unavailable)
- `file_path` — path to the actual sound file

---

## Planned Features (v2+)

### WaveSurfer.js Integration
- Replace the HTML5 `<input type="range">` seek bar with a visual waveform display
- Each `SoundCard` will render a mini waveform on hover
- `AudioPlayer` already has a `// TODO` comment ready for this integration

### Tagging Improvements
- Tag autocomplete when browsing
- Tag cloud view on homepage
- Multi-tag filtering (AND / OR mode toggle)

### BPM Detection
- Integrate `essentia.js` or `bpm-detective` for automatic BPM detection during ingestion
- Add to `scan-library.js` pipeline

### Backend / Sync (v3)
- SQLite or Supabase backend for multi-device sync
- User authentication
- Shared crates / collaborative playlists

### Waveform Generation
- Auto-generate waveform PNG thumbnails using `audiowaveform` CLI
- Store in `waveforms/` directory (gitignored)
- Display in `SoundCard` hover state

---

## File Structure (detailed)

| Path | Purpose |
|------|---------|
| `data/catalogue.json` | Source catalogue data — edit this to add sounds |
| `public/data/catalogue.json` | Runtime copy fetched by the app — keep in sync with `data/` |
| `scripts/scan-library.js` | CLI tool to generate entries from a directory scan |
| `src/types/catalogue.ts` | All TypeScript types for the app |
| `src/hooks/useLocalStorage.ts` | Generic localStorage React hook |
| `src/hooks/useFavorites.ts` | Favorites management (persisted in localStorage) |
| `src/hooks/useCrates.ts` | Crate CRUD operations (persisted in localStorage) |
| `src/utils/filters.ts` | Pure filter logic — `applyFilters(items, filters, favorites)` |
