import { useState, useCallback, useMemo, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useLyricsProjects } from '../../hooks/useLyricsProjects';
import { useCustomDictionary } from '../../hooks/useCustomDictionary';
import { parseLyrics } from '../../utils/lyricParser';
import {
  exportPronunciationSheet,
  exportArpabetText,
  exportJSON,
  exportAIVoicePrompt,
  exportSSML,
} from '../../utils/lyricExports';
import WordEditor from '../../components/lyrics/WordEditor';
import type { LyricProject, LyricWord, PhonemeDisplayMode, VoiceExportFormat } from '../../types/lyrics';

function hasWordAnnotations(word: LyricWord): boolean {
  return !!(
    word.stress ||
    word.breathBefore ||
    (word.pauseAfter && word.pauseAfter > 0) ||
    word.performanceNotes ||
    word.vowelStretch !== undefined ||
    word.consonantSoftness !== undefined
  );
}

const EXPORT_LABELS: Record<VoiceExportFormat, string> = {
  pronunciation_sheet: 'Pronunciation Sheet',
  arpabet_text: 'ARPAbet Text',
  json: 'JSON',
  ai_voice_prompt: 'AI Voice Prompt',
  ssml: 'SSML',
};

function runExport(project: LyricProject, format: VoiceExportFormat): string {
  switch (format) {
    case 'pronunciation_sheet': return exportPronunciationSheet(project);
    case 'arpabet_text': return exportArpabetText(project);
    case 'json': return exportJSON(project);
    case 'ai_voice_prompt': return exportAIVoicePrompt(project);
    case 'ssml': return exportSSML(project);
  }
}

function rebuildRawText(p: LyricProject): string {
  return p.sections
    .map((s) => {
      const labelLine = `[${s.label}]`;
      const lines = s.lines.map((l) => l.words.map((w) => w.original).join(' '));
      return [labelLine, ...lines].join('\n');
    })
    .join('\n\n');
}

export default function LyricsDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getProject, saveProject } = useLyricsProjects();
  const { dictionary, saveEntry } = useCustomDictionary();

  const [project, setProject] = useState<LyricProject | null>(() => {
    if (!id) return null;
    return getProject(id) ?? null;
  });
  const [rawText, setRawText] = useState<string>(() => {
    if (!id) return '';
    const p = getProject(id);
    return p ? rebuildRawText(p) : '';
  });
  const [displayMode, setDisplayMode] = useState<PhonemeDisplayMode>(
    () => getProject(id ?? '')?.displayMode ?? 'simple',
  );
  const [exportFormat, setExportFormat] = useState<VoiceExportFormat>('pronunciation_sheet');
  const [activeWordId, setActiveWordId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const exportOutput = useMemo(
    () => (project ? runExport(project, exportFormat) : ''),
    [project, exportFormat],
  );

  const persist = useCallback((p: LyricProject) => {
    saveProject({ ...p, updatedAt: new Date().toISOString() });
  }, [saveProject]);

  useEffect(() => {
    if (!project) {
      navigate('/lyrics');
    }
  }, [project, navigate]);

  if (!project) {
    return null;
  }

  // Non-null reference for use in handlers (TypeScript closures don't inherit narrowing)
  const activeProject: LyricProject = project;

  function handleReparse() {
    const hasEdits = activeProject.sections.some((s) =>
      s.lines.some((l) => l.words.some(hasWordAnnotations)),
    );
    if (
      hasEdits &&
      !window.confirm(
        'Re-parsing will discard all manual word annotations (stress, pauses, notes, etc.). Continue?',
      )
    ) {
      return;
    }
    const sections = parseLyrics(rawText, dictionary);
    const updated: LyricProject = { ...activeProject, sections, updatedAt: new Date().toISOString() };
    setProject(updated);
    persist(updated);
  }

  function handleTitleChange(title: string) {
    const updated: LyricProject = { ...activeProject, title };
    setProject(updated);
    persist(updated);
  }

  function handleDisplayModeChange(mode: PhonemeDisplayMode) {
    setDisplayMode(mode);
    const updated: LyricProject = { ...activeProject, displayMode: mode };
    setProject(updated);
    persist(updated);
  }

  function handleWordChange(sectionId: string, lineId: string, updatedWord: LyricWord) {
    const sections = activeProject.sections.map((s) =>
      s.id !== sectionId ? s : {
        ...s,
        lines: s.lines.map((l) =>
          l.id !== lineId ? l : {
            ...l,
            words: l.words.map((w) => (w.id === updatedWord.id ? updatedWord : w)),
          },
        ),
      },
    );
    const updated: LyricProject = { ...activeProject, sections };
    setProject(updated);
    persist(updated);
  }

  function handleSaveWordToDict(word: LyricWord) {
    saveEntry({
      word: word.original.toLowerCase(),
      pronunciationSpelling: word.pronunciationSpelling,
      phonemes: word.phonemes,
      syllables: word.syllables,
      source: 'custom',
    });
  }

  function handleCopy() {
    navigator.clipboard.writeText(exportOutput).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const phonemeDisplay = (word: LyricWord): string => {
    if (displayMode === 'simple') return word.pronunciationSpelling;
    const filtered = word.phonemes.filter((p) => p.displayMode === displayMode || displayMode === 'arpabet');
    return filtered.map((p) => p.token).join(' ') || word.pronunciationSpelling;
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <Link to="/lyrics" className="text-gray-500 hover:text-gray-300 text-sm shrink-0">
            ← Lyrics
          </Link>
          <input
            type="text"
            value={activeProject.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            className="bg-transparent text-xl font-bold text-white focus:outline-none border-b border-transparent focus:border-emerald-500 flex-1 min-w-0"
          />
          <span className="text-xs text-gray-600 shrink-0">
            Auto-saved · {new Date(activeProject.updatedAt).toLocaleTimeString()}
          </span>
        </div>
      </div>

      {/* Three-panel layout */}
      <div className="max-w-7xl mx-auto p-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Panel 1: Raw lyrics editor */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Raw Lyrics</h2>
          <textarea
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            rows={18}
            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm font-mono focus:outline-none focus:border-emerald-500 resize-none"
          />
          <button
            onClick={handleReparse}
            className="py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Re-parse Lyrics
          </button>
        </div>

        {/* Panel 2: Phonetic map */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 overflow-y-auto max-h-[80vh]">
          <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-3">Phonetic Map</h2>
          <div className="space-y-6">
            {activeProject.sections.map((section) => (
              <div key={section.id}>
                <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-2">
                  {section.label}
                </h3>
                {section.lines.map((line) => (
                  <div key={line.id} className="mb-4">
                    <div className="flex flex-wrap gap-1.5">
                      {line.words.map((word) => (
                        <button
                          key={word.id}
                          onClick={() => setActiveWordId(activeWordId === word.id ? null : word.id)}
                          className={`flex flex-col items-center px-2 py-1 rounded border transition-colors text-left ${
                            activeWordId === word.id
                              ? 'border-emerald-500 bg-emerald-950'
                              : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                          }`}
                        >
                          <span className="text-white text-sm">{word.original}</span>
                          <span className="text-emerald-400 text-xs font-mono leading-none">
                            {phonemeDisplay(word)}
                          </span>
                        </button>
                      ))}
                    </div>
                    {/* Inline word editor */}
                    {line.words.some((w) => w.id === activeWordId) && (
                      <div className="mt-2">
                        {line.words
                          .filter((w) => w.id === activeWordId)
                          .map((w) => (
                            <WordEditor
                              key={w.id}
                              word={w}
                              onChange={(updated) => handleWordChange(section.id, line.id, updated)}
                              onSaveToDict={() => handleSaveWordToDict(w)}
                            />
                          ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Panel 3: Export panel */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Export</h2>

          {/* Display mode */}
          <div>
            <label className="block text-xs text-gray-400 mb-1">Phoneme Display Mode</label>
            <select
              value={displayMode}
              onChange={(e) => handleDisplayModeChange(e.target.value as PhonemeDisplayMode)}
              className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-white text-sm focus:outline-none focus:border-emerald-500"
            >
              <option value="simple">Simple</option>
              <option value="arpabet">ARPAbet</option>
              <option value="ipa">IPA</option>
            </select>
          </div>

          {/* Export format */}
          <div>
            <label className="block text-xs text-gray-400 mb-1">Export Format</label>
            <div className="grid grid-cols-1 gap-1">
              {(Object.keys(EXPORT_LABELS) as VoiceExportFormat[]).map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => setExportFormat(fmt)}
                  className={`py-1.5 px-3 rounded text-xs text-left font-medium transition-colors ${
                    exportFormat === fmt
                      ? 'bg-emerald-700 text-white'
                      : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  {EXPORT_LABELS[fmt]}
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          <textarea
            readOnly
            value={exportOutput}
            rows={10}
            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-300 text-xs font-mono focus:outline-none resize-none"
          />

          <button
            onClick={handleCopy}
            className="py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors"
          >
            {copied ? '✓ Copied!' : 'Copy to Clipboard'}
          </button>
        </div>
      </div>
    </div>
  );
}
