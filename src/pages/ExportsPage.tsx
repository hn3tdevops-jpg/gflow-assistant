import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLyricsProjects } from '../hooks/useLyricsProjects';
import type { StudioExportFormat } from '../types/lyrics';
import { buildLyricExport, downloadTextFile, getExportFileName } from '../utils/lyricsStudioExports';

export default function ExportsPage() {
  const { lyrics } = useLyricsProjects();
  const [lyricId, setLyricId] = useState('');
  const [format, setFormat] = useState<StudioExportFormat>('txt');
  const [copied, setCopied] = useState(false);

  const selectedLyric = lyrics.find((lyric) => lyric.id === lyricId) ?? lyrics[0];

  const output = useMemo(
    () => (selectedLyric ? buildLyricExport(selectedLyric, format) : ''),
    [format, selectedLyric],
  );

  function copyOutput() {
    navigator.clipboard.writeText(output).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    });
  }

  function downloadOutput() {
    if (!selectedLyric) return;
    downloadTextFile(
      output,
      getExportFileName(selectedLyric.title, format),
      format === 'json' ? 'application/json' : 'text/plain',
    );
  }

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-5">
      <h1 className="text-2xl font-bold">Export Lyrics</h1>
      <p className="text-sm text-gray-400">Export lyrics as .txt, .md, or .json and copy directly to clipboard.</p>

      {lyrics.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-10 text-center">
          <p className="text-gray-300 mb-2">No lyrics available to export.</p>
          <Link to="/lyrics/new" className="text-emerald-400">Create lyric</Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <select value={selectedLyric?.id ?? ''} onChange={(e) => setLyricId(e.target.value)} className="bg-gray-900 border border-gray-700 rounded px-3 py-2">
              {lyrics.map((lyric) => <option key={lyric.id} value={lyric.id}>{lyric.title}</option>)}
            </select>
            <select value={format} onChange={(e) => setFormat(e.target.value as StudioExportFormat)} className="bg-gray-900 border border-gray-700 rounded px-3 py-2">
              <option value="txt">Text (.txt)</option>
              <option value="md">Markdown (.md)</option>
              <option value="json">JSON (.json)</option>
            </select>
          </div>

          <textarea readOnly value={output} rows={16} className="bg-gray-900 border border-gray-700 rounded px-3 py-2 font-mono text-xs" />

          <div className="flex gap-2">
            <button onClick={copyOutput} className="flex-1 py-2.5 rounded bg-gray-800 hover:bg-gray-700">{copied ? 'Copied' : 'Copy'}</button>
            <button onClick={downloadOutput} className="flex-1 py-2.5 rounded bg-emerald-600 hover:bg-emerald-500">Download</button>
          </div>
        </>
      )}
    </div>
  );
}
