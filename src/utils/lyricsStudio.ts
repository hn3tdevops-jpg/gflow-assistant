import type {
  Lyric,
  LyricFilters,
  LyricSection,
  LyricSectionType,
  LyricSort,
  LyricStatus,
} from '../types/lyrics';

const SECTION_TYPES: LyricSectionType[] = [
  'Verse',
  'Hook',
  'Chorus',
  'Bridge',
  'Intro',
  'Outro',
  'Ad-libs',
  'Notes',
];

export const DEFAULT_STATUS: LyricStatus = 'draft';

function parseTagList(text: string): string[] {
  return text
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);
}

export function tagsToText(tags: string[]): string {
  return tags.join(', ');
}

export function textToTags(text: string): string[] {
  return parseTagList(text);
}

function inferSectionType(label: string): LyricSectionType {
  const normalized = label.toLowerCase();
  const found = SECTION_TYPES.find((type) => normalized.includes(type.toLowerCase().replace('-', '')));
  return found ?? 'Verse';
}

export function createSection(type: LyricSectionType, position: number, content = ''): LyricSection {
  return {
    id: crypto.randomUUID(),
    sectionType: type,
    title: `${type} ${position + 1}`,
    content,
    position,
  };
}

export function normalizeSections(sections: LyricSection[]): LyricSection[] {
  return sections
    .slice()
    .sort((a, b) => a.position - b.position)
    .map((section, index) => ({ ...section, position: index }));
}

export function parseTextToSections(input: string): LyricSection[] {
  const blocks = input.split(/\n{2,}/).map((block) => block.trim()).filter(Boolean);
  if (!blocks.length) {
    return [createSection('Verse', 0, '')];
  }

  return blocks.map((block, index) => {
    const lines = block.split('\n');
    const firstLine = lines[0]?.trim() ?? '';
    const hasLabel = /^\[.+\]$/.test(firstLine);
    const label = hasLabel ? firstLine.slice(1, -1).trim() : `Verse ${index + 1}`;
    const content = (hasLabel ? lines.slice(1) : lines).join('\n').trim();
    const sectionType = inferSectionType(label);
    return {
      id: crypto.randomUUID(),
      sectionType,
      title: label || `${sectionType} ${index + 1}`,
      content,
      position: index,
    };
  });
}

export function sectionsToText(sections: LyricSection[]): string {
  return normalizeSections(sections)
    .map((section) => `[${section.title}]\n${section.content}`.trim())
    .join('\n\n');
}

export function countTextStats(text: string) {
  const lines = text.trim().length ? text.split(/\r?\n/).length : 0;
  const words = text.trim().length ? text.trim().split(/\s+/).length : 0;
  return {
    characters: text.length,
    words,
    lines,
  };
}

function matchesQuery(lyric: Lyric, query: string): boolean {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;

  const corpus = [
    lyric.title,
    lyric.currentContent,
    lyric.genre,
    lyric.mood,
    lyric.notes ?? '',
    lyric.tags.join(' '),
  ]
    .join(' ')
    .toLowerCase();

  return corpus.includes(needle);
}

export function filterLyrics(lyrics: Lyric[], filters: LyricFilters): Lyric[] {
  return lyrics.filter((lyric) => {
    if (!matchesQuery(lyric, filters.query)) return false;
    if (filters.status && lyric.status !== filters.status) return false;
    if (filters.project && lyric.projectName !== filters.project) return false;
    if (filters.tag && !lyric.tags.includes(filters.tag)) return false;
    if (filters.genre && lyric.genre !== filters.genre) return false;
    if (filters.favoriteOnly && !lyric.isFavorite) return false;
    return true;
  });
}

export function sortLyrics(lyrics: Lyric[], sort: LyricSort): Lyric[] {
  const next = [...lyrics];
  if (sort === 'updated') {
    next.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }
  if (sort === 'created') {
    next.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
  if (sort === 'title') {
    next.sort((a, b) => a.title.localeCompare(b.title));
  }
  if (sort === 'status') {
    next.sort((a, b) => a.status.localeCompare(b.status));
  }
  return next;
}

export function createEmptyLyric(ownerUserId: string): Lyric {
  const now = new Date().toISOString();
  const sections = [createSection('Verse', 0, '')];
  return {
    id: crypto.randomUUID(),
    ownerUserId,
    title: 'Untitled Lyric',
    artistName: '',
    projectName: '',
    albumName: '',
    collectionName: '',
    personaName: '',
    genre: '',
    mood: '',
    status: DEFAULT_STATUS,
    tags: [],
    notes: '',
    currentContent: sectionsToText(sections),
    sections,
    isFavorite: false,
    createdAt: now,
    updatedAt: now,
  };
}
