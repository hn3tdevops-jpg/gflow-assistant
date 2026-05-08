import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLyricsProjects } from '../../hooks/useLyricsProjects';
import { parseTextToSections, sectionsToText, textToTags } from '../../utils/lyricsStudio';

export default function LyricsNewPage() {
  const navigate = useNavigate();
  const { createLyric } = useLyricsProjects();

  const [title, setTitle] = useState('');
  const [artistName, setArtistName] = useState('');
  const [projectName, setProjectName] = useState('');
  const [albumName, setAlbumName] = useState('');
  const [genre, setGenre] = useState('');
  const [mood, setMood] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [notes, setNotes] = useState('');
  const [rawInput, setRawInput] = useState('');
  const [error, setError] = useState('');

  function handleCreate() {
    if (!title.trim()) {
      setError('Title is required.');
      return;
    }

    const sections = parseTextToSections(rawInput.trim() || `[Verse]\n`);
    const lyric = createLyric({
      title: title.trim(),
      artistName: artistName.trim(),
      projectName: projectName.trim(),
      albumName: albumName.trim(),
      genre: genre.trim(),
      mood: mood.trim(),
      tags: textToTags(tagInput),
      notes: notes.trim(),
      sections,
      currentContent: sectionsToText(sections),
    });

    navigate(`/lyrics/${lyric.id}`);
  }

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-5">
      <div className="flex items-center gap-2 text-sm text-gray-400">
        <Link to="/lyrics" className="hover:text-gray-200">Lyrics</Link>
        <span>/</span>
        <span>New Lyric</span>
      </div>

      <h1 className="text-2xl font-bold text-white">Create Lyric</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className="bg-gray-900 border border-gray-700 rounded px-3 py-2" />
        <input value={artistName} onChange={(e) => setArtistName(e.target.value)} placeholder="Artist / Persona" className="bg-gray-900 border border-gray-700 rounded px-3 py-2" />
        <input value={projectName} onChange={(e) => setProjectName(e.target.value)} placeholder="Project" className="bg-gray-900 border border-gray-700 rounded px-3 py-2" />
        <input value={albumName} onChange={(e) => setAlbumName(e.target.value)} placeholder="Album / Collection" className="bg-gray-900 border border-gray-700 rounded px-3 py-2" />
        <input value={genre} onChange={(e) => setGenre(e.target.value)} placeholder="Genre" className="bg-gray-900 border border-gray-700 rounded px-3 py-2" />
        <input value={mood} onChange={(e) => setMood(e.target.value)} placeholder="Mood" className="bg-gray-900 border border-gray-700 rounded px-3 py-2" />
      </div>

      <input
        value={tagInput}
        onChange={(e) => setTagInput(e.target.value)}
        placeholder="Tags (comma-separated)"
        className="bg-gray-900 border border-gray-700 rounded px-3 py-2"
      />

      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={3}
        placeholder="Notes"
        className="bg-gray-900 border border-gray-700 rounded px-3 py-2"
      />

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
        <p className="text-sm font-medium text-gray-200 mb-2">Import plain text lyrics</p>
        <p className="text-xs text-gray-500 mb-2">Paste lyrics; section labels like [Verse], [Chorus] are auto-detected.</p>
        <textarea
          value={rawInput}
          onChange={(e) => setRawInput(e.target.value)}
          rows={12}
          placeholder="[Verse 1]\n..."
          className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 font-mono text-sm"
        />
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <button onClick={handleCreate} className="py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 font-medium text-white">
        Create lyric
      </button>
    </div>
  );
}
