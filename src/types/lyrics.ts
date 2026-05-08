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

export interface LegacyLyricSection {
  id: string;
  label: string;
  lines: LyricLine[];
}

export interface LyricProject {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  sections: LegacyLyricSection[];
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

export type LyricStatus =
  | 'idea'
  | 'draft'
  | 'writing'
  | 'recording'
  | 'finished'
  | 'archived';

export type LyricSectionType =
  | 'Verse'
  | 'Hook'
  | 'Chorus'
  | 'Bridge'
  | 'Intro'
  | 'Outro'
  | 'Ad-libs'
  | 'Notes';

export interface LyricSection {
  id: string;
  sectionType: LyricSectionType;
  title: string;
  content: string;
  position: number;
  isCollapsed?: boolean;
}

export interface Lyric {
  id: string;
  ownerUserId: string;
  title: string;
  artistName: string;
  projectName: string;
  albumName: string;
  collectionName: string;
  personaName: string;
  genre: string;
  mood: string;
  status: LyricStatus;
  tags: string[];
  bpm?: number;
  songKey?: string;
  notes?: string;
  externalDemoUrl?: string;
  currentContent: string;
  sections: LyricSection[];
  isFavorite: boolean;
  archivedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LyricVersion {
  id: string;
  lyricId: string;
  versionName: string;
  content: string;
  metadataJson: string;
  sections: LyricSection[];
  createdAt: string;
  createdByUserId: string;
}

export type LyricSort = 'updated' | 'created' | 'title' | 'status';

export interface LyricFilters {
  query: string;
  status: LyricStatus | '';
  project: string;
  tag: string;
  genre: string;
  favoriteOnly: boolean;
}

export type StudioExportFormat = 'txt' | 'md' | 'json';
