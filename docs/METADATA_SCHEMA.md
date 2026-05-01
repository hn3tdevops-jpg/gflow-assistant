# Sound Item Metadata Schema

Full reference for all fields in the `SoundItem` type (`src/types/catalogue.ts`).

---

## Fields

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `id` | `string` | ✅ | Unique identifier for the sound. Use `snd-NNN` format or any unique slug. | `"snd-001"` |
| `title` | `string` | ✅ | Display name of the sound. | `"Roland TR-808 Bass Drum"` |
| `type` | `ItemType` | ✅ | Classification of the item. One of the 7 types (see below). | `"sample"` |
| `category` | `string` | ✅ | Top-level grouping for browse/filter. | `"Drums"` |
| `subcategory` | `string \| null` | ❌ | Second-level grouping within a category. | `"Kick"` |
| `description` | `string \| null` | ❌ | Human-readable description. Used in search. | `"Classic analog kick from the TR-808"` |
| `tags` | `string[]` | ✅ | Searchable tags. Use lowercase, no spaces (use hyphens). | `["808", "kick", "trap", "analog"]` |
| `bpm` | `number \| null` | ❌ | Tempo in BPM. Required for loops. | `140` |
| `key` | `string \| null` | ❌ | Musical key (note only, no mode). Use sharps not flats. | `"C"`, `"F#"`, `"A#"` |
| `duration_seconds` | `number \| null` | ❌ | Duration in seconds (for individual samples/loops). | `1.8` |
| `file_path` | `string` | ✅ | Relative path to the audio file from the project root. | `"library/drums/kicks/808_kick_01.wav"` |
| `preview_path` | `string \| null` | ❌ | Path to a shorter preview clip for the AudioPlayer. | `"library/previews/808_kick_preview.mp3"` |
| `waveform_path` | `string \| null` | ❌ | Path to a waveform PNG image. | `"waveforms/808_kick.png"` |
| `license` | `string \| null` | ❌ | License type. | `"Royalty-Free"`, `"Creative Commons CC0"`, `"Sample License"` |
| `source` | `string \| null` | ❌ | Origin of the sound. | `"Roland TR-808 Hardware"` |
| `format` | `string \| null` | ❌ | File format/extension in uppercase. | `"WAV"`, `"MP3"`, `"FLAC"`, `"SFZ"`, `"FXP"` |
| `sample_rate` | `number \| null` | ❌ | Sample rate in Hz. | `44100`, `48000`, `96000` |
| `bit_depth` | `number \| null` | ❌ | Bit depth. | `16`, `24`, `32` |
| `favorite` | `boolean` | ✅ | Default favorite state. Should always be `false` in the catalogue; user favorites are stored in localStorage. | `false` |
| `production_notes` | `string \| null` | ❌ | Mixing tips, usage suggestions, or technical notes. | `"Tune to root key. Works at 140ms decay."` |

---

## Item Types (`ItemType`)

| Type | Description | Example |
|------|-------------|---------|
| `instrument` | A multi-sampled playable instrument (SFZ, Kontakt, etc.) | Rhodes Electric Piano |
| `sample` | A single audio hit or one-shot sound | 808 Kick, Snare, FX |
| `loop` | A repeating audio loop with a defined BPM | Drum loop, Bass loop, Chord loop |
| `preset` | A synthesizer or effect patch/preset file | Serum bass preset, Moog patch |
| `kit` | A collection of related samples for one drum kit | Lo-Fi Drum Kit, Electronic Kit |
| `collection` | A large pack or bundle of multiple sound types | Boom Bap Essentials Pack |
| `reference` | A reference track, chart, or production notes document | Frequency chart, Mastering notes |

---

## Recommended License Values

| Value | Meaning |
|-------|---------|
| `Royalty-Free` | Can use in commercial productions without per-use royalties |
| `Creative Commons CC0` | Public domain — no restrictions |
| `Creative Commons CC-BY` | Free to use with attribution |
| `Creative Commons CC-BY-NC` | Free for non-commercial use with attribution |
| `Sample License` | Custom sample library license — check terms |
| `Proprietary` | Commercial software preset — check DAW/synth EULA |
| `Public Domain` | Expired copyright — free to use |

---

## Key Values

Use the following values for the `key` field (sharps only, no flats):

`C`, `C#`, `D`, `D#`, `E`, `F`, `F#`, `G`, `G#`, `A`, `A#`, `B`

Do **not** include the mode (major/minor) in the `key` field — add that to `tags` instead (e.g. `"minor"`, `"major"`, `"dorian"`).
