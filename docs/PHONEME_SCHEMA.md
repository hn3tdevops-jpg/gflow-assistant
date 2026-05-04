# Phoneme Schema

## Overview

All phoneme data in the gflow lyrics module uses a three-layer schema:

```
LyricProject
  └── LyricSection[]
        └── LyricLine[]
              └── LyricWord[]
                    ├── PhonemeToken[]   (flat sequence)
                    └── LyricSyllable[]
                          └── PhonemeToken[]  (per syllable)
```

---

## PhonemeToken

```ts
interface PhonemeToken {
  token: string;           // e.g. "HH", "AH0", "L", "OW1"
  displayMode: 'simple' | 'arpabet' | 'ipa';
}
```

`displayMode` indicates which notation system the token belongs to, enabling the UI to filter tokens by the active display mode.

---

## Phoneme Notation Systems

### Simple (Human-readable)
Syllabified pronunciation spelling designed to be readable without phonetics training.

| Word | Simple |
|------|--------|
| hello | HEH-loh |
| world | WURLD |
| dream | DREEM |

### ARPAbet
Machine-readable ASCII phoneme set used by the CMU Pronouncing Dictionary. Vowels carry a stress digit suffix: `0` = unstressed, `1` = primary, `2` = secondary.

**Vowels**

| Symbol | Example | Word |
|--------|---------|------|
| AA | f**a**ther | AA1 |
| AE | b**a**t | AE1 |
| AH | b**u**t | AH1 |
| AO | b**ou**ght | AO1 |
| AW | b**ou**t | AW1 |
| AY | b**i**te | AY1 |
| EH | b**e**t | EH1 |
| ER | b**ir**d | ER1 |
| EY | b**ai**t | EY1 |
| IH | b**i**t | IH1 |
| IY | b**ea**t | IY1 |
| OW | b**oa**t | OW1 |
| OY | b**oy** | OY1 |
| UH | b**oo**k | UH1 |
| UW | b**oo**t | UW1 |

**Consonants**

| Symbol | Example | Symbol | Example |
|--------|---------|--------|---------|
| B | **b**et | M | **m**et |
| CH | **ch**est | N | **n**et |
| D | **d**ew | NG | si**ng** |
| DH | **th**en | P | **p**et |
| F | **f**et | R | **r**ed |
| G | **g**et | S | **s**et |
| HH | **h**et | SH | **sh**et |
| JH | **j**et | T | **t**et |
| K | **k**et | TH | **th**in |
| L | **l**et | V | **v**et |
| | | W | **w**et |
| | | Y | **y**et |
| | | Z | **z**et |
| | | ZH | mea**s**ure |

### IPA
International Phonetic Alphabet. Not currently populated by the built-in dictionary; reserved for future integration with an IPA lookup service. IPA tokens are stored as `displayMode: 'ipa'`.

---

## LyricSyllable

```ts
interface LyricSyllable {
  text: string;                                         // e.g. "hel"
  stress?: 'primary' | 'secondary' | 'unstressed';
  phonemes: PhonemeToken[];
}
```

Syllables are derived from the dictionary entry. The `naiveSyllableSplit()` heuristic is used for unknown words.

---

## LyricWord

```ts
interface LyricWord {
  id: string;                  // crypto.randomUUID()
  original: string;            // raw token from lyrics
  pronunciationSpelling: string; // simple notation
  phonemes: PhonemeToken[];    // flat ARPAbet sequence
  syllables: LyricSyllable[];
  // Performance annotations
  stress?: 'primary' | 'secondary' | 'unstressed';
  vowelStretch?: number;       // 0–2, default 1.0
  consonantSoftness?: number;  // 0–2, default 1.0
  breathBefore?: boolean;
  pauseAfter?: number;         // milliseconds 0–2000
  performanceNotes?: string;
}
```

---

## PronunciationDictionaryEntry

```ts
interface PronunciationDictionaryEntry {
  word: string;
  pronunciationSpelling: string;
  phonemes: PhonemeToken[];
  syllables: LyricSyllable[];
  source: 'builtin' | 'custom';
}
```

Custom entries always override built-in entries during lookup.
