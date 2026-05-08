import type { LegacyLyricSection, LyricLine, LyricWord, PronunciationDictionaryEntry } from '../types/lyrics';
import { lookupWord } from './phonemeDictionary';

const SECTION_LABEL_RE = /^\[.*\]$|^(verse|chorus|bridge|outro|intro|hook|pre-chorus|breakdown)/i;

export function naiveSyllableSplit(word: string): string[] {
  const lower = word.toLowerCase();
  const vowels = 'aeiouy';
  const hasVowel = (s: string) => [...s].some((c) => vowels.includes(c));
  const syllables: string[] = [];
  let current = '';
  let prevWasVowel = false;

  for (let i = 0; i < lower.length; i++) {
    const ch = lower[i];
    const isVowel = vowels.includes(ch);

    // Split before a new vowel cluster only if the current accumulator already contains a vowel
    if (isVowel && !prevWasVowel && hasVowel(current)) {
      syllables.push(current);
      current = ch;
    } else {
      current += ch;
    }
    prevWasVowel = isVowel;
  }

  if (current.length > 0) syllables.push(current);
  return syllables.length > 0 ? syllables : [word];
}

function wordToLyricWord(
  raw: string,
  dict: Record<string, PronunciationDictionaryEntry>,
): LyricWord {
  // Normalize Unicode curly quotes and em/en-dashes to ASCII before cleaning
  const normalized = raw
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u2013\u2014]/g, '-');
  const clean = normalized.replace(/[^a-zA-Z'-]/g, '');
  if (!clean) {
    return {
      id: crypto.randomUUID(),
      original: raw,
      pronunciationSpelling: raw.toUpperCase(),
      phonemes: [],
      syllables: [],
    };
  }

  const entry = lookupWord(clean, dict);
  return {
    id: crypto.randomUUID(),
    original: raw,
    pronunciationSpelling: entry.pronunciationSpelling,
    phonemes: entry.phonemes,
    syllables: entry.syllables,
  };
}

export function parseLyrics(
  text: string,
  dict: Record<string, PronunciationDictionaryEntry>,
): LegacyLyricSection[] {
  const rawSections = text.split(/\n{2,}/);
  const sections: LegacyLyricSection[] = [];

  for (const rawSection of rawSections) {
    const trimmed = rawSection.trim();
    if (!trimmed) continue;

    const rawLines = trimmed.split('\n');
    let label = 'Verse';
    let lineStart = 0;

    if (rawLines.length > 0 && SECTION_LABEL_RE.test(rawLines[0].trim())) {
      label = rawLines[0].trim().replace(/^\[|\]$/g, '');
      lineStart = 1;
    }

    const lines: LyricLine[] = [];
    for (let i = lineStart; i < rawLines.length; i++) {
      const lineText = rawLines[i].trim();
      if (!lineText) continue;

      const tokens = lineText.split(/\s+/);
      const words: LyricWord[] = tokens
        .filter((t) => t.length > 0)
        .map((t) => wordToLyricWord(t, dict));

      if (words.length > 0) {
        lines.push({ id: crypto.randomUUID(), words });
      }
    }

    if (lines.length > 0) {
      sections.push({ id: crypto.randomUUID(), label, lines });
    }
  }

  return sections;
}
