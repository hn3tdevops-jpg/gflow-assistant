# Sound Ingestion Guide

This guide explains how to add sounds to your gflow catalogue.

---

## Option 1: Automatic Scan with scan-library.js

The `scripts/scan-library.js` tool recursively scans a directory for audio files and generates catalogue entries.

### Usage

```bash
node scripts/scan-library.js ./library > data/catalogue.json
cp data/catalogue.json public/data/catalogue.json
```

### What it detects automatically

- **Category** — parent folder name (e.g. `drums`, `synth`, `bass`)
- **Subcategory** — second-level folder name (e.g. `kicks`, `snares`)
- **BPM** — detected from filename patterns like `120bpm` or `_120_`
- **Key** — detected from filename patterns like `_Cm_`, `_F#_`
- **Title** — cleaned-up filename with underscores/hyphens replaced by spaces
- **Type** — inferred from folder name keywords (`loop`, `kit`, `preset`, etc.)
- **Format** — file extension (`.wav`, `.mp3`, etc.)

### After scanning

Review the generated JSON and manually fill in:
- `description` — a helpful text description
- `tags` — additional descriptive tags
- `license` — the applicable license
- `source` — where the sound came from
- `sample_rate` and `bit_depth` — technical specs
- `preview_path` — path to a shorter preview clip

---

## Option 2: Add Sounds Manually

Open `data/catalogue.json` and add a new entry following the schema in `docs/METADATA_SCHEMA.md`.

### Minimal example

```json
{
  "id": "snd-xxx",
  "title": "My New Sound",
  "type": "sample",
  "category": "Drums",
  "subcategory": "Kick",
  "description": null,
  "tags": ["kick", "808"],
  "bpm": null,
  "key": null,
  "duration_seconds": 1.2,
  "file_path": "library/drums/kick/my_new_sound.wav",
  "preview_path": null,
  "waveform_path": null,
  "license": "Royalty-Free",
  "source": "Original recording",
  "format": "WAV",
  "sample_rate": 44100,
  "bit_depth": 24,
  "favorite": false,
  "production_notes": null
}
```

### After adding manually

Copy the updated data to public:

```bash
cp data/catalogue.json public/data/catalogue.json
```

---

## File Naming Conventions

Use consistent naming for better auto-detection:

```
<title>_<key>_<bpm>bpm.<ext>
```

### Examples

| Filename | Detected BPM | Detected Key |
|----------|-------------|-------------|
| `deep_house_kick_C_120bpm.wav` | 120 | C |
| `trap_snare_140bpm.wav` | 140 | — |
| `soul_piano_loop_Am_90bpm.wav` | 90 | A |
| `ambient_pad_F#.wav` | — | F# |

### Folder Structure

```
library/
  drums/
    kicks/
    snares/
    hihats/
    breaks/
  bass/
    808/
    sub/
    upright/
  synth/
    presets/
    pads/
    leads/
  loops/
    drums/
    melodic/
  kits/
  collections/
  fx/
```

---

## Metadata Best Practices

1. **Always fill in `description`** — improves search quality
2. **Use consistent `category` names** — exact match filter (case-sensitive)
3. **Add at least 3-5 `tags`** — enables tag-based filtering and search
4. **Set `bpm` for all loops** — enables BPM range filter
5. **Set `key` for tonal content** — enables key filter
6. **Set `license`** — important for commercial use tracking
7. **Set `source`** — documents where the sound came from
8. **Use `production_notes`** — add mixing tips, tuning info, or usage suggestions
