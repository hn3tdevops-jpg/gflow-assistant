export type PhonemeDisplayMode = 'simple' | 'arpabet' | 'ipa';

export interface PhonemeToken {
  token: string;
  displayMode: PhonemeDisplayMode;
}

export interface LyricSyllable {
  text: string;
  stress?: 'primary' | 'secondary' | 'unstressed';
  phonemes: PhonemeToken[];
}

export interface LyricWord {
  id: string;
  original: string;
  pronunciationSpelling: string;
  phonemes: PhonemeToken[];
  syllables: LyricSyllable[];
  stress?: 'primary' | 'secondary' | 'unstressed';
  vowelStretch?: number;
  consonantSoftness?: number;
  breathBefore?: boolean;
  pauseAfter?: number;
  performanceNotes?: string;
}

export interface LyricLine {
  id: string;
  words: LyricWord[];
}

export interface LyricSection {
  id: string;
  label: string;
  lines: LyricLine[];
}

export interface LyricProject {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  sections: LyricSection[];
  displayMode: PhonemeDisplayMode;
}

export interface PronunciationDictionaryEntry {
  word: string;
  pronunciationSpelling: string;
  phonemes: PhonemeToken[];
  syllables: LyricSyllable[];
  source: 'builtin' | 'custom';
}

export type VoiceExportFormat =
  | 'pronunciation_sheet'
  | 'arpabet_text'
  | 'json'
  | 'ai_voice_prompt'
  | 'ssml';
