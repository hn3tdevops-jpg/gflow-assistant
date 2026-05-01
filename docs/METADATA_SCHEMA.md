# Metadata Schema

Complete reference for all fields in a GFlow catalogue sound entry.

---

## Full Example Entry

```json
{
  "id": "kick-001",
  "title": "Deep 808 Kick",
  "type": "sample",
  "category": "drums",
  "subcategory": "kick",
  "description": "Deep sub-heavy 808-style kick drum with long tail. Tuned to C.",
  "tags": ["808", "kick", "trap", "sub", "dark"],
  "bpm": null,
  "key": "C",
  "duration_seconds": 2.3,
  "file_path": "library/drums/kicks/deep_808_kick_C.wav",
  "preview_path": null,
  "waveform_path": null,
  "license": "Royalty-Free",
  "source": "GFlow Original",
  "format": "WAV",
  "sample_rate": 44100,
  "bit_depth": 24,
  "favorite": false,
  "production_notes": "Layer with a snappy click transient for extra punch.",
  "date_added": "2026-04-30"
}
```

---

## Field Reference

### Identification

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | ✅ | Unique identifier. Use `slug-001` format. Must be unique across the catalogue. |
| `title` | string | ✅ | Human-readable display name. |

### Classification

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | string | ✅ | Item type. One of: `instrument`, `sample`, `loop`, `preset`, `kit`, `collection`, `reference`. |
| `category` | string | ✅ | Top-level category (e.g. `drums`, `bass`, `melodic`, `keys`, `fx`). |
| `subcategory` | string | — | Second-level classification (e.g. `kick`, `snare`, `drum loop`). |

### Content

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `description` | string | — | One-paragraph description of the sound and its character. |
| `tags` | string[] | — | Array of lowercase tags for filtering (e.g. `["808", "dark", "trap"]`). |
| `production_notes` | string | — | Mixing/usage tips, layering suggestions, technical observations. Supports multi-line text. |

### Musical Properties

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `bpm` | number \| null | — | Beats per minute. `null` for one-shots with no tempo. |
| `key` | string \| null | — | Musical key (e.g. `Am`, `C#m`, `Fm`, `G`). `null` if not applicable. |
| `duration_seconds` | number \| null | — | Duration in seconds as a float (e.g. `2.35`). |

### File Paths

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `file_path` | string | ✅ | Path to the primary audio file, relative to the library root. |
| `preview_path` | string \| null | — | Path to a short preview clip (MP3/OGG). Used by the browser player. Falls back to `file_path`. |
| `waveform_path` | string \| null | — | Path to a waveform image (PNG/SVG). Displayed on the detail page. |

### Technical Metadata

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `format` | string | — | File format (e.g. `WAV`, `MP3`, `FLAC`, `NMSV`, `FXP`). |
| `sample_rate` | number \| null | — | Sample rate in Hz (e.g. `44100`, `48000`, `96000`). |
| `bit_depth` | number \| null | — | Bit depth (e.g. `16`, `24`, `32`). `null` for compressed formats. |

### Attribution

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `license` | string | — | License type (e.g. `Royalty-Free`, `CC0`, `CC BY 4.0`, `Commercial — Do Not Distribute`). |
| `source` | string | — | Origin of the sound (e.g. `GFlow Original`, `Splice`, `Own Recording`). |

### User Data

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `favorite` | boolean | — | Whether this sound is marked as a favorite (default `false`). Note: the UI stores favorites in localStorage; this field is for catalogue-level pre-seeded favorites. |

### Housekeeping

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `date_added` | string | — | ISO 8601 date when the sound was added to the catalogue (e.g. `2026-04-30`). Auto-populated by the scanner script. |

---

## Item Types

| Type | Description |
|------|-------------|
| `instrument` | Multi-sampled instrument (full note range, velocity layers). |
| `sample` | Single audio file: one-shot, hit, or effect. |
| `loop` | Repeating audio clip with a defined BPM and/or key. |
| `preset` | Synthesiser or plugin preset file (`.nmsv`, `.fxp`, `.vstpreset`, etc.). |
| `kit` | A collection of related samples bundled as a folder (e.g. drum kit). |
| `collection` | Curated bundle of multiple sounds across types. |
| `reference` | Commercial or personal mix/master reference for A/B comparison. |

---

## Catalogue File Structure

```json
{
  "version": "1.0.0",
  "updated_at": "YYYY-MM-DD",
  "sounds": [
    { ... },
    { ... }
  ]
}
```

The top-level object wraps the `sounds` array with versioning metadata. The frontend handles both `{ "sounds": [...] }` and bare `[...]` array formats for backwards compatibility.

---

## Tag Conventions

Use lowercase, hyphenated tags. Keep tags specific and reusable.

**Recommended tag groups:**

| Group | Examples |
|-------|---------|
| Genre | `trap`, `lo-fi`, `hip-hop`, `rnb`, `drill`, `electronic` |
| Instrument | `piano`, `bass`, `808`, `synth`, `vocal`, `guitar` |
| Character | `dark`, `warm`, `bright`, `crispy`, `fat`, `wide` |
| Function | `kick`, `snare`, `hi-hat`, `riser`, `chop`, `pad`, `lead` |
| Misc | `vintage`, `clean`, `layered`, `processed`, `raw` |
