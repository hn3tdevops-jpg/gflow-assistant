import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLyricsProjects } from '../hooks/useLyricsProjects';
import { parseTextToSections, sectionsToText } from '../utils/lyricsStudio';

export default function ImportLyricsPage() {
  const navigate = useNavigate();
  const { createLyric } = useLyricsProjects();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState('');

  function handleImport() {
    const sections = parseTextToSections(content);
    const lyric = createLyric({
      title: title.trim() || 'Imported Lyric',
      sections,
      currentContent: sectionsToText(sections),
    });
    setStatus(`Imported "${lyric.title}"`);
    navigate(`/lyrics/${lyric.id}`);
  }

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Import Lyrics</h1>
      <p className="text-sm text-gray-400">Paste plain text and FGFlow Studio will auto-create sections where possible.</p>
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Lyric title" className="bg-gray-900 border border-gray-700 rounded px-3 py-2" />
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={16}
        className="bg-gray-900 border border-gray-700 rounded px-3 py-2 font-mono text-sm"
        placeholder="[Verse]\n..."
      />
      <button onClick={handleImport} disabled={!content.trim()} className="py-2.5 rounded bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40">
        Import lyric
      </button>
      {status && <p className="text-sm text-emerald-400">{status}</p>}
    </div>
  );
}
