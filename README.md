# GFlow — Sound Catalogue

A production-focused, browser-based audio library for instruments, samples, loops, presets, kits, and sound collections. Browse, search, audition, and organise your production sounds — no server or database required.

---

## Quick Start

```bash
# Clone the repo
git clone https://github.com/hn3tdevops-jpg/gflow-assistant.git
cd gflow-assistant

# Serve locally (ES modules require an HTTP server)
python -m http.server 8080

# Open in browser
open http://localhost:8080
```

---

## File Tree

```
gflow-assistant/
├── index.html              ← App entry point
├── src/
│   ├── app.js              ← Hash-based router
│   ├── styles.css          ← Dark theme (CSS custom properties)
│   ├── components/
│   │   ├── nav.js          ← Top navigation bar
│   │   ├── player.js       ← Bottom audio player bar
│   │   ├── soundCard.js    ← Sound card component
│   │   └── filters.js      ← Filter sidebar
│   ├── pages/
│   │   ├── home.js         ← Library home with stats
│   │   ├── browse.js       ← Searchable/filterable browse
│   │   ├── detail.js       ← Sound detail page
│   │   ├── collections.js  ← Collections browser
│   │   └── crates.js       ← Crates & favorites manager
│   └── utils/
│       ├── catalogue.js    ← Data loading & filtering
│       └── storage.js      ← localStorage (crates + favorites)
├── data/
│   └── catalogue.json      ← Starter catalogue (20 entries)
├── scripts/
│   └── scan_library.py     ← Audio library scanner
└── docs/
    ├── SOUND_CATALOGUE_PLAN.md
    ├── INGESTION_GUIDE.md
    └── METADATA_SCHEMA.md
```

---

## Adding New Sounds

### Option A — Manual

Edit `data/catalogue.json` and add an entry. See `docs/METADATA_SCHEMA.md` for all fields.

### Option B — Scanner script

```bash
# Scan a folder
python scripts/scan_library.py /path/to/audio/library

# Scan and merge into existing catalogue
python scripts/scan_library.py /path/to/library --merge data/catalogue.json

# Install mutagen for duration/sample_rate/bit_depth detection
pip install mutagen
```

See `docs/INGESTION_GUIDE.md` for full instructions.

---

## Pages

| Page | URL | Description |
|------|-----|-------------|
| Home | `#/` | Stats, recent sounds, type quick-links |
| Browse | `#/browse` | Full-text search + type/category/tag/BPM/key filters |
| Detail | `#/detail/:id` | Full metadata, waveform placeholder, player, crate add |
| Collections | `#/collections` | Collection cards + category browser |
| Crates | `#/crates` | Named crates + favorites (localStorage) |

---

## Known Limitations

- Audio preview requires `preview_path` or `file_path` to be accessible via the local server.
- Crates and favorites are stored in `localStorage` (not synced across devices).
- Waveform display is a synthetic placeholder unless `waveform_path` is set.
- Large audio files are excluded from git via `.gitignore`.

See `docs/SOUND_CATALOGUE_PLAN.md` for the full architecture and upgrade path to FastAPI + SQLite.
