# gflow-assistant — Sound Catalogue

A producer-focused sound library and catalogue app. Browse, filter, and preview your entire sound library through a clean dark web UI — no backend required (JSON + localStorage).

Built with **Vite 8 + React 19 + TypeScript + Tailwind CSS v4**.

---

## Install

```bash
npm install
```

Requires Node ≥ 20.

---

## Development commands

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server at `http://localhost:5173` |
| `npm run build` | Type-check (`tsc -b`) then bundle to `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Run ESLint across all source files |

---

## How catalogue data works

The catalogue is a single JSON array at `public/data/catalogue.json` which Vite serves as a static asset.

Each entry conforms to the `SoundItem` interface defined in `src/types/catalogue.ts`. Key fields:

| Field | Type | Description |
|---|---|---|
| `id` | `string` | Unique identifier (UUID) |
| `title` | `string` | Display name |
| `type` | `ItemType` | `sample`, `loop`, `instrument`, `preset`, `kit`, `collection`, `reference` |
| `category` | `string` | Primary category (e.g. `drums`, `bass`) |
| `file_path` | `string` | Relative path to the audio file |
| `preview_path` | `string \| null` | Relative path to a short MP3/OGG preview clip in `public/previews/` |
| `tags` | `string[]` | Searchable tags |
| `bpm` | `number \| null` | Tempo |
| `key` | `string \| null` | Musical key |
| `license` | `string \| null` | License identifier |

A canonical copy is also kept at `data/catalogue.json` for source control. After editing, copy it to `public/data/`:

```bash
cp data/catalogue.json public/data/catalogue.json
```

See `docs/METADATA_SCHEMA.md` for the full field reference and `docs/INGESTION_GUIDE.md` for step-by-step ingestion instructions.

---

## How to add preview audio

1. Create a short (5–30 s) preview clip in MP3 or OGG format.
2. Place it in `public/previews/` — e.g. `public/previews/my-kick.mp3`.
3. Set the `preview_path` field in your catalogue entry to `previews/my-kick.mp3`.
4. The SoundCard component will show a ▶ / ⏸ play button automatically.

> **Note:** `public/previews/` is listed in `.gitignore` to avoid committing large audio files to the repository. Keep preview clips small (< 1 MB each) and store originals outside the repo.

---

## Generating a catalogue with the scanner script

```bash
node scripts/scan-library.mjs ./library > data/catalogue.json
cp data/catalogue.json public/data/catalogue.json
```

The script recursively scans a folder for `.wav`, `.aif`, `.aiff`, `.flac`, `.mp3`, `.ogg`, and `.m4a` files and generates catalogue entries from folder structure and filenames. See `docs/INGESTION_GUIDE.md` for details.

---

## Deployment

The app is a fully static SPA. Build and deploy the `dist/` folder to any static host (Netlify, Vercel, GitHub Pages, S3, etc.).

```bash
npm run build
# dist/ is ready to deploy
```

See `docs/DEPLOYMENT.md` for detailed hosting instructions including SPA routing configuration.
