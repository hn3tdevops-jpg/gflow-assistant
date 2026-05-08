import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useLyricsProjects } from '../../hooks/useLyricsProjects';
import type { LyricSectionType } from '../../types/lyrics';
import { countTextStats, createSection, normalizeSections, sectionsToText } from '../../utils/lyricsStudio';

const QUICK_TYPES: LyricSectionType[] = ['Verse', 'Chorus', 'Hook', 'Bridge', 'Outro'];

export default function LyricsWorkspacePage() {
  const { id } = useParams<{ id: string }>();
  const { getLyric, saveLyric } = useLyricsProjects();
  const lyric = id ? getLyric(id) : undefined;
  const [activeSectionId, setActiveSectionId] = useState(() => lyric?.sections[0]?.id ?? '');
  const [rhymeNotes, setRhymeNotes] = useState(lyric?.notes ?? '');

  if (!lyric) {
    return <p className="text-gray-400">Lyric not found.</p>;
  }

  const activeLyric = lyric;
  const sections = normalizeSections(activeLyric.sections);
  const activeSection = sections.find((section) => section.id === activeSectionId) ?? sections[0];
  const stats = countTextStats(activeLyric.currentContent);

  function patchSection(content: string) {
    const nextSections = sections.map((section) => section.id === activeSection.id ? { ...section, content } : section);
    saveLyric({ ...activeLyric, sections: nextSections, notes: rhymeNotes, currentContent: sectionsToText(nextSections) });
  }

  function addQuickSection(type: LyricSectionType) {
    const nextSections = normalizeSections([...sections, createSection(type, sections.length)]);
    saveLyric({ ...activeLyric, sections: nextSections, notes: rhymeNotes, currentContent: sectionsToText(nextSections) });
    setActiveSectionId(nextSections[nextSections.length - 1].id);
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-4 min-h-[70vh]">
      <aside className="bg-gray-900 border border-gray-800 rounded-xl p-3 space-y-2 lg:sticky lg:top-20 h-max">
        <div className="flex items-center justify-between">
          <h1 className="text-sm uppercase tracking-wider text-gray-400">Sections</h1>
          <Link to={`/lyrics/${activeLyric.id}`} className="text-xs text-emerald-400">Exit</Link>
        </div>
        <div className="space-y-1">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSectionId(section.id)}
              className={`w-full text-left px-3 py-2 rounded text-sm ${section.id === activeSection.id ? 'bg-emerald-700 text-white' : 'bg-gray-800 text-gray-300'}`}
            >
              {section.title}
            </button>
          ))}
        </div>
      </aside>

      <section className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex flex-col gap-4">
        <header className="flex flex-wrap gap-4 items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">{activeLyric.title}</h2>
            <p className="text-sm text-gray-400">Focused writing mode</p>
          </div>
          <div className="text-xs text-gray-400 flex flex-wrap gap-3">
            <span>{stats.words} words</span>
            <span>{stats.lines} lines</span>
            <span>{stats.characters} chars</span>
          </div>
        </header>

        <textarea
          value={activeSection.content}
          onChange={(event) => patchSection(event.target.value)}
          rows={18}
          className="w-full bg-gray-950 border border-gray-700 rounded-lg px-4 py-3 font-mono text-base leading-7"
        />

        <div>
          <label className="text-xs uppercase tracking-wider text-gray-400">Rhyme / phrase notes</label>
          <textarea
            value={rhymeNotes}
            onChange={(event) => {
              setRhymeNotes(event.target.value);
              saveLyric({ ...activeLyric, notes: event.target.value });
            }}
            rows={4}
            className="mt-1 w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm"
          />
        </div>

        <div className="lg:hidden fixed bottom-14 inset-x-0 bg-gray-900 border-t border-gray-800 px-3 py-2 z-40">
          <div className="flex gap-2 overflow-x-auto">
            {QUICK_TYPES.map((type) => (
              <button key={type} onClick={() => addQuickSection(type)} className="px-3 py-2 rounded bg-gray-800 text-xs whitespace-nowrap">+ {type}</button>
            ))}
          </div>
        </div>

        <div className="hidden lg:flex gap-2">
          {QUICK_TYPES.map((type) => (
            <button key={type} onClick={() => addQuickSection(type)} className="px-3 py-2 rounded bg-gray-800 text-xs">+ {type}</button>
          ))}
        </div>
      </section>
    </div>
  );
}
