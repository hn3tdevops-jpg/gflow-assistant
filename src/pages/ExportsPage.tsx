import { useState, useMemo } from 'react';
import { useLyricsProjects } from '../hooks/useLyricsProjects';
import {
  exportPronunciationSheet,
  exportArpabetText,
  exportJSON,
  exportAIVoicePrompt,
  exportSSML,
} from '../utils/lyricExports';
import type { LyricProject, VoiceExportFormat } from '../types/lyrics';

const FORMAT_LABELS: Record<VoiceExportFormat, string> = {
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

export default function ExportsPage() {
  const { projects } = useLyricsProjects();
  const [selectedId, setSelectedId] = useState<string>(() => projects[0]?.id ?? '');
  const [format, setFormat] = useState<VoiceExportFormat>('pronunciation_sheet');
  const [copied, setCopied] = useState(false);

  const selectedProject =
    projects.find((p) => p.id === selectedId) ?? projects[0] ?? null;

  const output = useMemo(
    () => (selectedProject ? runExport(selectedProject, format) : ''),
    [selectedProject, format],
  );

  function handleCopy() {
    navigator.clipboard.writeText(output).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function handleDownload() {
    if (!output || !selectedProject) return;
    const ext: Record<VoiceExportFormat, string> = {
      pronunciation_sheet: 'txt',
      arpabet_text: 'txt',
      json: 'json',
      ai_voice_prompt: 'txt',
      ssml: 'xml',
    };
    const blob = new Blob([output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedProject.title.replace(/\s+/g, '_')}_${format}.${ext[format]}`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-2">Exports</h1>
        <p className="text-gray-400 text-sm mb-8">Export your lyric projects in various formats.</p>

        {projects.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <p className="text-lg font-medium mb-2">No projects to export</p>
            <p className="text-sm">Create a lyric project first.</p>
          </div>
        ) : (
          <div className="space-y-5">
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Project</label>
              <select
                value={selectedProject?.id ?? ''}
                onChange={(e) => setSelectedId(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Export Format</label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value as VoiceExportFormat)}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500"
              >
                {(Object.keys(FORMAT_LABELS) as VoiceExportFormat[]).map((fmt) => (
                  <option key={fmt} value={fmt}>
                    {FORMAT_LABELS[fmt]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Preview</label>
              <textarea
                readOnly
                value={output}
                rows={16}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-gray-300 text-xs font-mono focus:outline-none resize-none"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCopy}
                disabled={!output}
                className="flex-1 py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-40"
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
              <button
                onClick={handleDownload}
                disabled={!output}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-40"
              >
                Download
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
