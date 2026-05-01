# Ingestion Guide

How to add new sounds to the GFlow Sound Catalogue.

---

## Method 1 — Manual JSON Entry

Edit `data/catalogue.json` directly and add a new object to the `"sounds"` array.
Follow the schema in `docs/METADATA_SCHEMA.md`.

**Minimal required fields:**

```json
{
  "id": "kick-002",
  "title": "Dark Room Kick",
  "type": "sample",
  "category": "drums",
  "subcategory": "kick",
  "file_path": "library/drums/kicks/dark_room_kick.wav"
}
```

All other fields will gracefully render as `—` or be hidden in the UI.

---

## Method 2 — Scanner Script (Recommended for bulk import)

### Prerequisites

```bash
pip install mutagen          # optional, for duration/sample_rate/bit_depth detection
python --version             # requires Python 3.8+
```

### Basic scan

```bash
python scripts/scan_library.py /path/to/your/audio/library
```

Output: `data/scanned_YYYYMMDD.json`

### Scan with custom output path

```bash
python scripts/scan_library.py /path/to/library --output data/my_scan.json
```

### Merge scan results into existing catalogue

```bash
python scripts/scan_library.py /path/to/library --merge data/catalogue.json
```

This updates `data/catalogue.json` in-place, preserving existing hand-edited metadata and only appending genuinely new files.

### Specifying a library root for cleaner relative paths

```bash
python scripts/scan_library.py /Volumes/SSD/Library/Drums \
  --library-root /Volumes/SSD/Library \
  --output data/drums_scan.json
```

---

## Folder Structure Conventions

The scanner infers `category`, `subcategory`, and `type` from folder names:

```
library/
├── drums/          → category: drums, type: sample
│   ├── kicks/      → subcategory: kicks
│   ├── snares/
│   └── hihats/
├── loops/          → type: loop
│   ├── melodic/
│   └── bass/
├── instruments/    → type: instrument
├── presets/        → type: preset
├── kits/           → type: kit
├── collections/    → type: collection
└── references/     → type: reference
```

---

## Adding Preview Audio

The player uses `preview_path` first, falling back to `file_path`.

To add a preview:
1. Create a short MP3 or OGG clip (≤30s, 128kbps recommended) of the sound.
2. Place it in `sounds/previews/` (this folder is `.gitignore`d by default).
3. Set `"preview_path": "sounds/previews/your_file.mp3"` in the catalogue entry.

> **Note:** If serving the app from a local HTTP server, `file_path` paths like `library/drums/kick.wav` will resolve relative to the server root.

---

## Adding Waveform Images

The detail page displays a waveform image if `waveform_path` is set.

To generate waveforms:
1. Install [audiowaveform](https://github.com/bbc/audiowaveform) (BBC, open source).
2. Run:
   ```bash
   audiowaveform -i library/drums/kick.wav -o sounds/waveforms/kick.png --pixels-per-second 100 --bits 8
   ```
3. Set `"waveform_path": "sounds/waveforms/kick.png"` in the catalogue entry.

> Waveform images are `.gitignore`d by default. Commit them explicitly if you want them in the repo.

---

## Editing Metadata After Scanning

After running the scanner, open the output JSON and fill in:

| Field | How to fill |
|-------|-------------|
| `title` | Rename from filename-style to human-readable |
| `description` | One-sentence description of the sound |
| `tags` | Add relevant production tags |
| `bpm` | Manual or detected from filename |
| `key` | Manual or detected from filename |
| `license` | Royalty-Free / Commercial / etc. |
| `source` | Where the sound came from |
| `production_notes` | Mixing tips, layering suggestions |

---

## Filename Conventions for Auto-Detection

The scanner auto-detects BPM and key from filenames if they follow these patterns:

| Pattern | Example | Detected as |
|---------|---------|-------------|
| `_90bpm` or `_090BPM` | `bass_loop_90bpm.wav` | BPM: 90 |
| `_Am` or `_am` | `piano_chop_Am.wav` | Key: Am |
| `_F#m` | `synth_F#m_128bpm.wav` | Key: F#m |

---

## Serving the App Locally

Because the app uses ES modules and `fetch()`, you need a local HTTP server:

```bash
# Python 3
python -m http.server 8080

# Node.js (npx)
npx serve .

# VS Code: use the "Live Server" extension
```

Then open: http://localhost:8080
