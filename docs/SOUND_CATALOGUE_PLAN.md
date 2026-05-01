# Sound Catalogue Plan

## Overview

GFlow Sound Catalogue is a production-focused, browser-based audio library for instruments, samples, loops, presets, kits, and sound collections. It runs entirely in the browser using static files — no server or database required for v1.

---

## Goals

- Provide a fast, searchable, filterable catalogue of production sounds.
- Allow auditioning samples directly in the browser with a persistent bottom player bar.
- Support organising sounds into named **crates** (stored in localStorage).
- Keep all metadata in human-readable JSON files (`data/catalogue.json`).
- Make it easy to upgrade to a FastAPI + SQLite/Postgres backend later.

---

## Architecture

```
gflow-assistant/
├── index.html              ← Single-page app entry point
├── src/
│   ├── app.js              ← Hash-based router
│   ├── styles.css          ← Dark theme (CSS custom properties)
│   ├── components/
│   │   ├── nav.js          ← Top nav bar
│   │   ├── player.js       ← Bottom audio player
│   │   ├── soundCard.js    ← Sound card component
│   │   └── filters.js      ← Filter sidebar
│   ├── pages/
│   │   ├── home.js         ← Library home with stats
│   │   ├── browse.js       ← Searchable/filterable browse
│   │   ├── detail.js       ← Sound detail page
│   │   ├── collections.js  ← Collections browser
│   │   └── crates.js       ← Crates & favorites manager
│   └── utils/
│       ├── catalogue.js    ← Data loading & filtering logic
│       └── storage.js      ← localStorage (crates + favorites)
├── data/
│   └── catalogue.json      ← Starter catalogue data
├── scripts/
│   └── scan_library.py     ← Audio library scanner
└── docs/
    ├── SOUND_CATALOGUE_PLAN.md  ← This file
    ├── INGESTION_GUIDE.md
    └── METADATA_SCHEMA.md
```

---

## Pages

| Page | Route | Purpose |
|------|-------|---------|
| Home | `#/` | Stats, recent sounds, quick type links |
| Browse | `#/browse` | Full search + filter + grid/list view |
| Detail | `#/detail/:id` | Full metadata, waveform, player, crate add |
| Collections | `#/collections` | Collection cards + category browser |
| Crates | `#/crates` | Named crates + favorites management |

---

## Data Flow

1. `src/utils/catalogue.js` fetches `data/catalogue.json` once and caches it.
2. Pages call `applyFilters()` on the cached array — no server requests.
3. `src/utils/storage.js` reads/writes localStorage for crates and favorites.
4. The audio player (`src/components/player.js`) manages a single `HTMLAudioElement`.

---

## Upgrade Path to FastAPI + SQLite

When ready to upgrade:

1. **Backend**: Create a FastAPI app in `api/` that reads from `data/catalogue.json` or a SQLite DB.
2. **API routes**:
   - `GET /api/sounds` — list with filter query params
   - `GET /api/sounds/:id` — single sound detail
   - `GET /api/crates` — crate list (move from localStorage)
   - `POST /api/crates` — create crate
3. **Frontend**: Replace `fetch('data/catalogue.json')` in `catalogue.js` with `fetch('/api/sounds')`.
4. **Migration**: Use `scan_library.py --merge` to build the initial DB seed.

---

## UI Design Principles

- **Dark background** (`#0d0e11`) inspired by DAW interfaces.
- **Orange accent** (`#f97316`) for interactive elements and CTAs.
- **Type badges** use distinct colours per item type for fast visual scanning.
- **Fixed player bar** at the bottom persists across page navigation.
- **CSS custom properties** for easy theme customisation.

---

## Known Limitations (v1)

- Audio preview requires `preview_path` or `file_path` to be a URL accessible to the browser (local server or CDN). Large audio files are not committed to git.
- Waveform visualisation is synthetic (placeholder bars) unless `waveform_path` points to an image.
- Crates and favorites are stored in localStorage — not shared across devices or browsers.
- No drag-and-drop reordering within crates.
- BPM and key are currently stored as strings; no automatic beat-matching.
- The scanner script does not auto-generate previews or waveform images.

---

## Next Steps

- [ ] Serve audio files via a local Python/FastAPI dev server
- [ ] Add waveform generation using `pydub` + peak extraction
- [ ] Add batch audio preview generation (MP3 @ 128kbps)
- [ ] Add drag-and-drop crate ordering
- [ ] Add bulk import/export of crate definitions (JSON)
- [ ] Add dark/light theme toggle
- [ ] Add keyboard shortcuts (Space = play/pause, Arrow keys = seek)
- [ ] Migrate to FastAPI + SQLite for multi-device sync
- [ ] Add tag management UI (add/remove tags from detail page)
