import type { LyricProject, LyricWord } from '../types/lyrics';

function wordPhonetics(word: LyricWord, mode: LyricProject['displayMode']): string {
  if (mode === 'simple') return word.pronunciationSpelling;
  const tokens = word.phonemes.filter((p) => p.displayMode === mode || mode === 'arpabet');
  return tokens.map((t) => t.token).join(' ') || word.pronunciationSpelling;
}

export function exportPronunciationSheet(project: LyricProject): string {
  const lines: string[] = [`PRONUNCIATION SHEET: ${project.title}`, ''];

  for (const section of project.sections) {
    lines.push(`[ ${section.label} ]`);
    for (const line of section.lines) {
      const parts = line.words.map((w) => {
        const phonetic = wordPhonetics(w, project.displayMode);
        return `${w.original} (${phonetic})`;
      });
      lines.push(parts.join('  '));
    }
    lines.push('');
  }

  return lines.join('\n');
}

export function exportArpabetText(project: LyricProject): string {
  const lines: string[] = [];

  for (const section of project.sections) {
    lines.push(`# ${section.label}`);
    for (const line of section.lines) {
      const parts = line.words.map((w) =>
        w.phonemes.map((p) => p.token).join(' ') || w.pronunciationSpelling,
      );
      lines.push(parts.join(' | '));
    }
    lines.push('');
  }

  return lines.join('\n');
}

export function exportJSON(project: LyricProject): string {
  return JSON.stringify(project, null, 2);
}

export function exportAIVoicePrompt(project: LyricProject): string {
  const lines: string[] = [
    `Voiceover prompt for: "${project.title}"`,
    'Speak the following lyrics with the indicated pronunciation and performance notes:',
    '',
  ];

  for (const section of project.sections) {
    lines.push(`=== ${section.label} ===`);
    for (const line of section.lines) {
      const wordDescs = line.words.map((w) => {
        let desc = `"${w.original}" → [${w.pronunciationSpelling}]`;
        if (w.stress) desc += ` stress:${w.stress}`;
        if (w.breathBefore) desc += ' (breath before)';
        if (w.pauseAfter && w.pauseAfter > 0) desc += ` (pause ${w.pauseAfter}ms)`;
        if (w.performanceNotes) desc += ` — ${w.performanceNotes}`;
        return desc;
      });
      lines.push(wordDescs.join(', '));
    }
    lines.push('');
  }

  return lines.join('\n');
}

export function exportSSML(project: LyricProject): string {
  const xmlLines: string[] = ['<speak>'];

  for (const section of project.sections) {
    xmlLines.push(`  <!-- ${section.label} -->`);
    for (const line of section.lines) {
      const wordParts = line.words.map((w) => {
        const ipaPhonemes = w.phonemes.filter((p) => p.displayMode === 'ipa');
        let tag: string;
        if (ipaPhonemes.length > 0) {
          const ph = ipaPhonemes.map((p) => p.token).join('');
          tag = `<phoneme alphabet="ipa" ph="${ph}">${w.original}</phoneme>`;
        } else {
          tag = w.original;
        }

        if (w.breathBefore) tag = '<break strength="weak"/>' + tag;
        if (w.pauseAfter && w.pauseAfter > 0)
          tag = tag + `<break time="${w.pauseAfter}ms"/>`;

        return tag;
      });
      xmlLines.push('  ' + wordParts.join(' '));
    }
    xmlLines.push('  <break strength="medium"/>');
  }

  xmlLines.push('</speak>');
  return xmlLines.join('\n');
}
