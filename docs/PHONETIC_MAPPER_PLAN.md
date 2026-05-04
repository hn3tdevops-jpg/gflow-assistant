# Phonetic Mapper — Plan

## Overview

The **Lyrics-to-Phonetic-Map** module converts raw lyric text into a structured, word-level phonetic representation. It supports multiple phoneme notations and enables rich performance annotations for AI voice synthesis or human vocalists.

## Goals

1. Parse raw lyric text into hierarchical sections → lines → words.
2. Look up each word in a pronunciation dictionary (built-in + user-custom).
3. Allow per-word editing of pronunciation, stress, timing, and performance notes.
4. Export the annotated project in multiple formats (pronunciation sheet, ARPAbet, JSON, AI prompt, SSML).
5. Persist projects and custom dictionary entries in localStorage.

## Architecture

```
src/
├── types/lyrics.ts            # All TypeScript interfaces
├── utils/
│   ├── phonemeDictionary.ts   # ~80-word built-in dict + lookup helpers
│   ├── lyricParser.ts         # Text → LyricSection[] parser
│   └── lyricExports.ts        # 5 export format renderers
├── hooks/
│   ├── useLyricsProjects.ts   # CRUD for LyricProject[] in localStorage
│   └── useCustomDictionary.ts # CRUD for custom PronunciationDictionaryEntry[]
├── components/lyrics/
│   └── WordEditor.tsx         # Collapsible per-word annotation card
└── pages/
    ├── lyrics/
    │   ├── LyricsListPage.tsx  # Project list + "New Project" CTA
    │   ├── LyricsNewPage.tsx   # Title + raw lyrics form → parse & redirect
    │   └── LyricsDetailPage.tsx# 3-panel editor: raw | phonetic map | export
    ├── DictionaryPage.tsx      # Manage custom + view built-in dictionary
    └── ExportsPage.tsx         # Cross-project export with download/copy
```

## Data Flow

```
User types lyrics
    ↓
parseLyrics(text, customDict)
    ↓  splits on blank lines → sections
    ↓  first [Label] line → section.label
    ↓  each word → lookupWord(word, customDict)
    ↓                  checks custom dict
    ↓                  → falls back to BUILTIN_DICTIONARY
    ↓                  → createPlaceholder() if unknown
    ↓
LyricProject saved to localStorage
    ↓
LyricsDetailPage: 3-panel view
    ├── Panel 1: Re-editable raw text + re-parse button
    ├── Panel 2: Phonetic map (click word → WordEditor)
    └── Panel 3: Format selector → export preview → copy/download
```

## localStorage Schema

| Key | Type | Description |
|-----|------|-------------|
| `gflow:lyrics:v1:projects` | `LyricProject[]` | All saved projects |
| `gflow:lyrics:v1:dictionary` | `Record<string, PronunciationDictionaryEntry>` | Custom entries |

## Routing

| Path | Component |
|------|-----------|
| `/lyrics` | LyricsListPage |
| `/lyrics/new` | LyricsNewPage |
| `/lyrics/:id` | LyricsDetailPage |
| `/dictionary` | DictionaryPage |
| `/exports` | ExportsPage |

## UI Theme

- Background: `bg-gray-950` / `bg-gray-900`
- Accent for lyrics module: **emerald** (`emerald-500` / `emerald-600`) to distinguish from the catalogue's purple accent
- Navbar: visual divider between catalogue links and lyrics module links

## Future Enhancements

- [ ] CMU Pronouncing Dictionary integration via API
- [ ] IPA lookup service
- [ ] Syllable-level timing / BPM grid alignment
- [ ] AI pronunciation suggestions
- [ ] Audio preview of phoneme sequences
