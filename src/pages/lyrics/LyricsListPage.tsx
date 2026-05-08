import { useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLyricsProjects } from '../../hooks/useLyricsProjects';
import type { LyricFilters, LyricSort, LyricStatus } from '../../types/lyrics';
import { filterLyrics, sortLyrics } from '../../utils/lyricsStudio';

const STATUS_OPTIONS: LyricStatus[] = ['idea', 'draft', 'writing', 'recording', 'finished', 'archived'];

const emptyFilters: LyricFilters = {
  query: '',
  status: '',
  project: '',
  tag: '',
  genre: '',
  favoriteOnly: false,
};

export default function LyricsListPage() {
  const { lyrics, deleteLyric, toggleFavorite, setArchived } = useLyricsProjects();
  const location = useLocation();
  const [filters, setFilters] = useState<LyricFilters>(emptyFilters);
  const [sort, setSort] = useState<LyricSort>('updated');

  const mode = location.pathname.endsWith('/favorites')
    ? 'favorites'
    : location.pathname.endsWith('/archived')
      ? 'archived'
      : 'library';

  const filteredLyrics = useMemo(() => {
    const scoped = lyrics.filter((lyric) => {
      if (mode === 'favorites') return lyric.isFavorite;
      if (mode === 'archived') return Boolean(lyric.archivedAt) || lyric.status === 'archived';
      return true;
    });
    const mergedFilters: LyricFilters = {
      ...filters,
      status: mode === 'archived' ? 'archived' : filters.status,
      favoriteOnly: mode === 'favorites' || filters.favoriteOnly,
    };
    return sortLyrics(filterLyrics(scoped, mergedFilters), sort);
  }, [filters, lyrics, mode, sort]);

  const tags = [...new Set(lyrics.flatMap((lyric) => lyric.tags))].sort();
  const projects = [...new Set(lyrics.map((lyric) => lyric.projectName).filter(Boolean))].sort();
  const genres = [...new Set(lyrics.map((lyric) => lyric.genre).filter(Boolean))].sort();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">
            {mode === 'favorites' ? 'Favorite Lyrics' : mode === 'archived' ? 'Archived Lyrics' : 'Lyrics Library'}
          </h1>
          <p className="text-sm text-gray-400">Search, organize, and manage every lyric project.</p>
        </div>
        <div className="flex gap-2">
          <Link to="/lyrics/new" className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium">
            Create Lyric
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3 bg-gray-900 border border-gray-800 rounded-xl p-3">
        <input
          value={filters.query}
          onChange={(event) => setFilters((prev) => ({ ...prev, query: event.target.value }))}
          placeholder="Search title, content, tags, notes..."
          className="lg:col-span-2 bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm"
        />
        <select
          value={filters.status}
          onChange={(event) => setFilters((prev) => ({ ...prev, status: event.target.value as LyricStatus | '' }))}
          className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm"
          disabled={mode === 'archived'}
        >
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.map((status) => <option key={status} value={status}>{status}</option>)}
        </select>
        <select
          value={filters.project}
          onChange={(event) => setFilters((prev) => ({ ...prev, project: event.target.value }))}
          className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm"
        >
          <option value="">All Projects</option>
          {projects.map((project) => <option key={project} value={project}>{project}</option>)}
        </select>
        <select
          value={filters.tag}
          onChange={(event) => setFilters((prev) => ({ ...prev, tag: event.target.value }))}
          className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm"
        >
          <option value="">All Tags</option>
          {tags.map((tag) => <option key={tag} value={tag}>{tag}</option>)}
        </select>
        <select
          value={filters.genre}
          onChange={(event) => setFilters((prev) => ({ ...prev, genre: event.target.value }))}
          className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm"
        >
          <option value="">All Genres</option>
          {genres.map((genre) => <option key={genre} value={genre}>{genre}</option>)}
        </select>
        <select
          value={sort}
          onChange={(event) => setSort(event.target.value as LyricSort)}
          className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm"
        >
          <option value="updated">Sort: Updated</option>
          <option value="created">Sort: Created</option>
          <option value="title">Sort: Title</option>
          <option value="status">Sort: Status</option>
        </select>
      </div>

      {filteredLyrics.length === 0 ? (
        <div className="bg-gray-900 border border-dashed border-gray-700 rounded-xl text-center py-20 px-6">
          <p className="text-lg text-gray-200 mb-2">No lyrics found</p>
          <p className="text-sm text-gray-500 mb-6">Try different filters or create a new lyric project.</p>
          <Link to="/lyrics/new" className="inline-block px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium">
            Create lyric
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredLyrics.map((lyric) => (
            <article key={lyric.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex flex-col gap-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <Link to={`/lyrics/${lyric.id}`} className="text-lg font-semibold text-white hover:text-emerald-300 block truncate">
                    {lyric.title}
                  </Link>
                  <p className="text-xs text-gray-500 mt-1 truncate">{lyric.artistName || 'Unknown artist'} · {lyric.projectName || 'No project'}</p>
                </div>
                <button
                  onClick={() => toggleFavorite(lyric.id)}
                  aria-label={lyric.isFavorite ? 'Unfavorite lyric' : 'Favorite lyric'}
                  className={`text-lg ${lyric.isFavorite ? 'text-yellow-300' : 'text-gray-500 hover:text-yellow-200'}`}
                >
                  ★
                </button>
              </div>

              <div className="flex flex-wrap gap-2 text-xs">
                <span className="px-2 py-1 rounded bg-gray-800 text-gray-300">{lyric.status}</span>
                {lyric.genre && <span className="px-2 py-1 rounded bg-gray-800 text-gray-300">{lyric.genre}</span>}
                {lyric.mood && <span className="px-2 py-1 rounded bg-gray-800 text-gray-300">{lyric.mood}</span>}
                {lyric.tags.slice(0, 2).map((tag) => <span key={tag} className="px-2 py-1 rounded bg-emerald-950 text-emerald-300">#{tag}</span>)}
              </div>

              <p className="text-xs text-gray-500">Updated {new Date(lyric.updatedAt).toLocaleString()}</p>

              <div className="flex flex-wrap gap-2 pt-1">
                <Link to={`/lyrics/${lyric.id}`} className="px-3 py-1.5 rounded bg-emerald-700 hover:bg-emerald-600 text-xs font-medium text-white">Open</Link>
                <button
                  onClick={() => setArchived(lyric.id, !lyric.archivedAt)}
                  className="px-3 py-1.5 rounded bg-gray-800 hover:bg-gray-700 text-xs font-medium text-gray-200"
                >
                  {lyric.archivedAt ? 'Unarchive' : 'Archive'}
                </button>
                <button
                  onClick={() => {
                    if (window.confirm(`Delete \"${lyric.title}\"?`)) {
                      deleteLyric(lyric.id);
                    }
                  }}
                  className="px-3 py-1.5 rounded bg-red-950 hover:bg-red-900 text-xs font-medium text-red-200"
                >
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
