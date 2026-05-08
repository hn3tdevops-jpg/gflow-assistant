import type { Lyric, LyricSection, StudioExportFormat } from '../types/lyrics';
import { normalizeSections } from './lyricsStudio';

function sectionBlock(section: LyricSection) {
  return `[${section.title}]\n${section.content}`.trim();
}

export function buildLyricExport(lyric: Lyric, format: StudioExportFormat): string {
  const sections = normalizeSections(lyric.sections);

  if (format === 'json') {
    return JSON.stringify(lyric, null, 2);
  }

  const body = sections.map(sectionBlock).join('\n\n');
  if (format === 'txt') {
    return body;
  }

  return [`# ${lyric.title}`, '', `- Artist: ${lyric.artistName || 'N/A'}`, `- Project: ${lyric.projectName || 'N/A'}`, '', body].join('\n');
}

export function getExportFileName(title: string, format: StudioExportFormat): string {
  const base = title.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || 'lyric';
  return `${base}.${format}`;
}

export function downloadTextFile(content: string, fileName: string, mimeType = 'text/plain'): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}
