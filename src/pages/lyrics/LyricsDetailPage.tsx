import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useLyricsProjects } from '../../hooks/useLyricsProjects';
import type { Lyric, LyricSectionType, LyricStatus, StudioExportFormat } from '../../types/lyrics';
import { buildLyricExport, downloadTextFile, getExportFileName } from '../../utils/lyricsStudioExports';
import { compareTextLines } from '../../utils/lyricsVersionDiff';
import { createSection, normalizeSections, sectionsToText, textToTags } from '../../utils/lyricsStudio';

const STATUS_OPTIONS: LyricStatus[] = ['idea', 'draft', 'writing', 'recording', 'finished', 'archived'];
const QUICK_SECTION_TYPES: LyricSectionType[] = ['Verse', 'Chorus', 'Hook', 'Bridge', 'Outro'];

function sectionButton(type: LyricSectionType) {
  return <span className="px-2 py-1 rounded bg-gray-800 text-xs">+ {type}</span>;
}

function editableDraftKey(lyric: Lyric): string {
  return JSON.stringify({
    title: lyric.title,
    artistName: lyric.artistName,
    projectName: lyric.projectName,
    albumName: lyric.albumName,
    genre: lyric.genre,
    mood: lyric.mood,
    tags: lyric.tags,
    notes: lyric.notes ?? '',
    status: lyric.status,
    bpm: lyric.bpm ?? null,
    songKey: lyric.songKey ?? '',
    currentContent: lyric.currentContent,
    sections: lyric.sections,
  });
}

function hasDraftChanges(left: Lyric, right: Lyric): boolean {
  return editableDraftKey(left) !== editableDraftKey(right);
}

export default function LyricsDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    getLyric,
    saveLyric,
    setArchived,
    toggleFavorite,
    saveVersion,
    getLyricVersions,
    restoreVersion,
    duplicateVersionAsDraft,
  } = useLyricsProjects();

  const [lyric, setLyric] = useState<Lyric | null>(() => (id ? getLyric(id) ?? null : null));
  const [versionName, setVersionName] = useState('');
  const [lastSaved, setLastSaved] = useState('');
  const [toast, setToast] = useState('');
  const [exportFormat, setExportFormat] = useState<StudioExportFormat>('txt');
  const [compareLeft, setCompareLeft] = useState('');
  const [compareRight, setCompareRight] = useState('');
  const persistedLyric = id ? getLyric(id) ?? null : null;

  const localEditableKey = useMemo(() => (lyric ? editableDraftKey(lyric) : ''), [lyric]);
  const persistedEditableKey = useMemo(() => (persistedLyric ? editableDraftKey(persistedLyric) : ''), [persistedLyric]);

  useEffect(() => {
    const next = id ? getLyric(id) ?? null : null;
    setLyric(next);
    setLastSaved(next?.updatedAt ?? '');
  }, [getLyric, id]);

  useEffect(() => {
    if (!persistedLyric) {
      setLyric(null);
      return;
    }
    setLyric((current) => {
      if (!current || current.id !== persistedLyric.id) return persistedLyric;
      if (hasDraftChanges(current, persistedLyric)) return current;
      if (
        current.isFavorite === persistedLyric.isFavorite
        && current.archivedAt === persistedLyric.archivedAt
        && current.updatedAt === persistedLyric.updatedAt
      ) {
        return current;
      }
      return persistedLyric;
    });
    setLastSaved(persistedLyric.updatedAt);
  }, [persistedLyric]);

  useEffect(() => {
    if (!lyric || !persistedLyric) return;
    if (lyric.id !== persistedLyric.id) return;
    if (localEditableKey === persistedEditableKey) return;

    const timer = window.setTimeout(() => {
      const latest = getLyric(lyric.id);
      if (!latest) return;
      const latestEditableKey = editableDraftKey(latest);
      if (latestEditableKey === localEditableKey) return;
      saveLyric({
        ...lyric,
        ownerUserId: latest.ownerUserId,
        isFavorite: latest.isFavorite,
        archivedAt: latest.archivedAt,
      });
      setLastSaved(new Date().toISOString());
    }, 500);

    return () => window.clearTimeout(timer);
  }, [getLyric, localEditableKey, lyric, persistedEditableKey, persistedLyric, saveLyric]);

  if (!id || !lyric) {
    return (
      <div className="max-w-2xl mx-auto py-10">
        <h1 className="text-xl font-semibold mb-2">Lyric unavailable</h1>
        <p className="text-sm text-gray-400 mb-4">You may not have access to this lyric.</p>
        <Link to="/lyrics" className="text-emerald-400">Back to library</Link>
      </div>
    );
  }

  const activeLyric: Lyric = lyric;
  const versions = getLyricVersions(activeLyric.id);

  const leftVersion = versions.find((entry) => entry.id === compareLeft);
  const rightVersion = versions.find((entry) => entry.id === compareRight);
  const diffLines = leftVersion && rightVersion
    ? compareTextLines(leftVersion.content, rightVersion.content)
    : [];

  function patchLyric(updater: (current: Lyric) => Lyric) {
    setLyric((current) => (current ? updater(current) : current));
  }

  function addSection(type: LyricSectionType) {
    patchLyric((current) => {
      const nextSections = [...current.sections, createSection(type, current.sections.length, '')];
      const normalized = normalizeSections(nextSections);
      return { ...current, sections: normalized, currentContent: sectionsToText(normalized) };
    });
  }

  function updateSection(sectionId: string, content: string) {
    patchLyric((current) => {
      const nextSections = current.sections.map((section) => (section.id === sectionId ? { ...section, content } : section));
      return { ...current, sections: nextSections, currentContent: sectionsToText(nextSections) };
    });
  }

  function moveSection(sectionId: string, direction: -1 | 1) {
    patchLyric((current) => {
      const ordered = normalizeSections(current.sections);
      const index = ordered.findIndex((section) => section.id === sectionId);
      const target = index + direction;
      if (index < 0 || target < 0 || target >= ordered.length) return current;
      const next = [...ordered];
      const [picked] = next.splice(index, 1);
      next.splice(target, 0, picked);
      const normalized = normalizeSections(next);
      return { ...current, sections: normalized, currentContent: sectionsToText(normalized) };
    });
  }

  function duplicateSection(sectionId: string) {
    patchLyric((current) => {
      const ordered = normalizeSections(current.sections);
      const index = ordered.findIndex((section) => section.id === sectionId);
      if (index < 0) return current;
      const source = ordered[index];
      const duplicate = {
        ...source,
        id: crypto.randomUUID(),
        title: `${source.title} Copy`,
      };
      const next = [...ordered.slice(0, index + 1), duplicate, ...ordered.slice(index + 1)];
      const normalized = normalizeSections(next);
      return { ...current, sections: normalized, currentContent: sectionsToText(normalized) };
    });
  }

  function toggleCollapsed(sectionId: string) {
    patchLyric((current) => ({
      ...current,
      sections: current.sections.map((section) =>
        section.id === sectionId ? { ...section, isCollapsed: !section.isCollapsed } : section,
      ),
    }));
  }

  function copyFullLyrics() {
    navigator.clipboard.writeText(activeLyric.currentContent).then(() => setToast('Lyrics copied'));
  }

  function copySection(sectionId: string) {
    const section = activeLyric.sections.find((entry) => entry.id === sectionId);
    if (!section) return;
    navigator.clipboard.writeText(section.content).then(() => setToast(`${section.title} copied`));
  }

  function doExport() {
    const content = buildLyricExport(activeLyric, exportFormat);
    downloadTextFile(content, getExportFileName(activeLyric.title, exportFormat), exportFormat === 'json' ? 'application/json' : 'text/plain');
  }

  function saveNewVersion() {
    const saved = saveVersion(activeLyric.id, versionName);
    if (!saved) return;
    setVersionName('');
    setToast(`Saved version: ${saved.versionName}`);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-2 text-sm text-gray-400">
        <Link to="/lyrics" className="hover:text-gray-200">Lyrics</Link>
        <span>/</span>
        <span>{activeLyric.title}</span>
        <Link to={`/lyrics/${activeLyric.id}/workspace`} className="ml-auto px-3 py-1.5 rounded bg-gray-800 hover:bg-gray-700 text-gray-200">Writing Mode</Link>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
        <input value={activeLyric.title} onChange={(e) => patchLyric((current) => ({ ...current, title: e.target.value }))} className="bg-gray-800 border border-gray-700 rounded px-3 py-2" aria-label="Title" />
        <input value={activeLyric.artistName} onChange={(e) => patchLyric((current) => ({ ...current, artistName: e.target.value }))} placeholder="Artist / Persona" className="bg-gray-800 border border-gray-700 rounded px-3 py-2" />
        <input value={activeLyric.projectName} onChange={(e) => patchLyric((current) => ({ ...current, projectName: e.target.value }))} placeholder="Project" className="bg-gray-800 border border-gray-700 rounded px-3 py-2" />
        <input value={activeLyric.albumName} onChange={(e) => patchLyric((current) => ({ ...current, albumName: e.target.value }))} placeholder="Album / Collection" className="bg-gray-800 border border-gray-700 rounded px-3 py-2" />
        <input value={activeLyric.genre} onChange={(e) => patchLyric((current) => ({ ...current, genre: e.target.value }))} placeholder="Genre" className="bg-gray-800 border border-gray-700 rounded px-3 py-2" />
        <input value={activeLyric.mood} onChange={(e) => patchLyric((current) => ({ ...current, mood: e.target.value }))} placeholder="Mood" className="bg-gray-800 border border-gray-700 rounded px-3 py-2" />
        <input
          value={activeLyric.tags.join(', ')}
          onChange={(e) => patchLyric((current) => ({ ...current, tags: textToTags(e.target.value) }))}
          placeholder="Tags (comma-separated)"
          className="bg-gray-800 border border-gray-700 rounded px-3 py-2 md:col-span-2"
        />
        <textarea value={activeLyric.notes ?? ''} onChange={(e) => patchLyric((current) => ({ ...current, notes: e.target.value }))} rows={3} placeholder="Notes" className="bg-gray-800 border border-gray-700 rounded px-3 py-2 md:col-span-2" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:col-span-2">
          <select value={activeLyric.status} onChange={(e) => patchLyric((current) => ({ ...current, status: e.target.value as LyricStatus }))} className="bg-gray-800 border border-gray-700 rounded px-3 py-2">
            {STATUS_OPTIONS.map((status) => <option key={status} value={status}>{status}</option>)}
          </select>
          <input
            type="number"
            value={activeLyric.bpm ?? ''}
            onChange={(e) => patchLyric((current) => ({ ...current, bpm: e.target.value ? Number(e.target.value) : undefined }))}
            placeholder="BPM"
            className="bg-gray-800 border border-gray-700 rounded px-3 py-2"
          />
          <input value={activeLyric.songKey ?? ''} onChange={(e) => patchLyric((current) => ({ ...current, songKey: e.target.value }))} placeholder="Key" className="bg-gray-800 border border-gray-700 rounded px-3 py-2" />
          <button
            onClick={() => {
              const updated = toggleFavorite(activeLyric.id);
              if (!updated) return;
              setLyric(updated);
              setLastSaved(updated.updatedAt);
            }}
            className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm"
          >
            {activeLyric.isFavorite ? '★ Favorited' : '☆ Favorite'}
          </button>
        </div>
        <div className="md:col-span-2 flex flex-wrap gap-2 text-xs text-gray-500">
          <span>Last saved: {new Date(lastSaved || activeLyric.updatedAt).toLocaleTimeString()}</span>
          {toast && <span className="text-emerald-400">• {toast}</span>}
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <h2 className="text-sm uppercase tracking-wider text-gray-300 font-semibold">Sections</h2>
          {QUICK_SECTION_TYPES.map((type) => (
            <button key={type} onClick={() => addSection(type)}>{sectionButton(type)}</button>
          ))}
        </div>
        <div className="space-y-3">
          {normalizeSections(activeLyric.sections).map((section) => (
            <section key={section.id} className="bg-gray-800 border border-gray-700 rounded-lg">
              <header className="flex items-center gap-2 px-3 py-2 border-b border-gray-700">
                <input
                  value={section.title}
                  onChange={(e) => patchLyric((current) => ({
                    ...current,
                    sections: current.sections.map((entry) => entry.id === section.id ? { ...entry, title: e.target.value } : entry),
                  }))}
                  className="bg-transparent text-sm font-medium text-gray-100 flex-1"
                />
                <button onClick={() => moveSection(section.id, -1)} className="text-xs text-gray-400">↑</button>
                <button onClick={() => moveSection(section.id, 1)} className="text-xs text-gray-400">↓</button>
                <button onClick={() => duplicateSection(section.id)} className="text-xs text-gray-300">Duplicate</button>
                <button onClick={() => copySection(section.id)} className="text-xs text-gray-300">Copy</button>
                <button onClick={() => toggleCollapsed(section.id)} className="text-xs text-gray-300">{section.isCollapsed ? 'Expand' : 'Collapse'}</button>
              </header>
              {!section.isCollapsed && (
                <textarea
                  value={section.content}
                  onChange={(e) => updateSection(section.id, e.target.value)}
                  rows={6}
                  className="w-full bg-gray-800 rounded-b-lg px-3 py-2 font-mono text-sm"
                />
              )}
            </section>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-3">
          <h2 className="text-sm uppercase tracking-wider text-gray-300 font-semibold">Export & Copy</h2>
          <div className="flex gap-2">
            <button onClick={copyFullLyrics} className="px-3 py-2 rounded bg-gray-800 hover:bg-gray-700 text-sm">Copy full lyrics</button>
            <select value={exportFormat} onChange={(e) => setExportFormat(e.target.value as StudioExportFormat)} className="bg-gray-800 border border-gray-700 rounded px-2 py-2 text-sm">
              <option value="txt">.txt</option>
              <option value="md">.md</option>
              <option value="json">.json</option>
            </select>
            <button onClick={doExport} className="px-3 py-2 rounded bg-emerald-700 hover:bg-emerald-600 text-sm">Export</button>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                const shouldArchive = !activeLyric.archivedAt;
                const updated = setArchived(activeLyric.id, shouldArchive);
                if (!updated) return;
                setLyric(updated);
                setLastSaved(updated.updatedAt);
              }}
              className="px-3 py-2 rounded bg-gray-800 hover:bg-gray-700 text-sm"
            >
              {activeLyric.archivedAt ? 'Restore from archive' : 'Archive lyric'}
            </button>
            <button
              onClick={() => {
                if (!window.confirm('Discard unsaved visual state and reload stored lyric?')) return;
                const next = getLyric(activeLyric.id);
                if (next) setLyric(next);
              }}
              className="px-3 py-2 rounded bg-gray-800 hover:bg-gray-700 text-sm"
            >
              Reload saved
            </button>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-3">
          <h2 className="text-sm uppercase tracking-wider text-gray-300 font-semibold">Version History</h2>
          <div className="flex gap-2">
            <input
              value={versionName}
              onChange={(e) => setVersionName(e.target.value)}
              placeholder="Version name (e.g. Studio Take 2)"
              className="flex-1 bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm"
            />
            <button onClick={saveNewVersion} className="px-3 py-2 rounded bg-emerald-700 hover:bg-emerald-600 text-sm">Save version</button>
          </div>

          <div className="space-y-2 max-h-48 overflow-auto pr-1">
            {versions.length === 0 ? <p className="text-sm text-gray-500">No saved versions yet.</p> : versions.map((version) => (
              <div key={version.id} className="bg-gray-800 border border-gray-700 rounded p-2 text-sm flex flex-wrap gap-2 items-center">
                <span className="font-medium text-gray-200">{version.versionName}</span>
                <span className="text-xs text-gray-500">{new Date(version.createdAt).toLocaleString()}</span>
                <button
                  onClick={() => {
                    const restored = restoreVersion(version.id);
                    if (!restored) return;
                    setLyric(restored);
                    setLastSaved(restored.updatedAt);
                    setToast(`Restored: ${version.versionName}`);
                  }}
                  className="ml-auto text-xs text-emerald-300"
                >
                  Restore
                </button>
                <button onClick={() => {
                  const created = duplicateVersionAsDraft(version.id, `${activeLyric.title} (${version.versionName})`);
                  if (created) navigate(`/lyrics/${created.id}`);
                }} className="text-xs text-gray-300">Duplicate</button>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <select value={compareLeft} onChange={(e) => setCompareLeft(e.target.value)} className="bg-gray-800 border border-gray-700 rounded px-2 py-2 text-sm">
              <option value="">Compare: left</option>
              {versions.map((version) => <option key={version.id} value={version.id}>{version.versionName}</option>)}
            </select>
            <select value={compareRight} onChange={(e) => setCompareRight(e.target.value)} className="bg-gray-800 border border-gray-700 rounded px-2 py-2 text-sm">
              <option value="">Compare: right</option>
              {versions.map((version) => <option key={version.id} value={version.id}>{version.versionName}</option>)}
            </select>
          </div>
          {diffLines.length > 0 && (
            <pre className="bg-gray-950 border border-gray-700 rounded p-3 text-xs overflow-auto max-h-48">
              {diffLines.map((line, index) => (
                <div key={`${line.kind}-${index}`} className={line.kind === 'added' ? 'text-emerald-300' : line.kind === 'removed' ? 'text-red-300' : 'text-gray-500'}>
                  {line.kind === 'added' ? '+' : line.kind === 'removed' ? '-' : ' '} {line.text}
                </div>
              ))}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}
