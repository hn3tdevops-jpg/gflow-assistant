import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { parseLyrics } from '../../utils/lyricParser';
import { useLyricsProjects } from '../../hooks/useLyricsProjects';
import { useCustomDictionary } from '../../hooks/useCustomDictionary';
import type { LyricProject } from '../../types/lyrics';

export default function LyricsNewPage() {
  const navigate = useNavigate();
  const { saveProject } = useLyricsProjects();
  const { dictionary } = useCustomDictionary();
  const [title, setTitle] = useState('');
  const [rawLyrics, setRawLyrics] = useState('');
  const [error, setError] = useState('');

  function handleParse() {
    if (!title.trim()) {
      setError('Please enter a project title.');
      return;
    }
    if (!rawLyrics.trim()) {
      setError('Please enter some lyrics to parse.');
      return;
    }
    setError('');

    const sections = parseLyrics(rawLyrics, dictionary);
    const now = new Date().toISOString();
    const project: LyricProject = {
      id: crypto.randomUUID(),
      title: title.trim(),
      createdAt: now,
      updatedAt: now,
      sections,
      displayMode: 'simple',
    };

    saveProject(project);
    navigate(`/lyrics/${project.id}`);
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Link to="/lyrics" className="text-gray-500 hover:text-gray-300 text-sm">
            ← Back
          </Link>
          <h1 className="text-2xl font-bold text-white">New Lyric Project</h1>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Project Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Song Title — Draft 1"
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500 placeholder-gray-600"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Lyrics</label>
            <p className="text-xs text-gray-600 mb-2">
              Separate sections with blank lines. Start a section with [Verse], [Chorus], etc.
            </p>
            <textarea
              value={rawLyrics}
              onChange={(e) => setRawLyrics(e.target.value)}
              placeholder={`[Verse 1]\nHello world, I love you\nYou are my heart and soul\n\n[Chorus]\nDream the dream with me tonight`}
              rows={14}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500 placeholder-gray-600 font-mono text-sm resize-y"
            />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            onClick={handleParse}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium transition-colors"
          >
            Parse Lyrics →
          </button>
        </div>
      </div>
    </div>
  );
}
