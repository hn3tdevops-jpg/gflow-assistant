import { act, render, renderHook, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import { useLyricsProjects } from '../hooks/useLyricsProjects';
import type { Lyric } from '../types/lyrics';
import { buildLyricExport } from '../utils/lyricsStudioExports';
import { createEmptyLyric, filterLyrics } from '../utils/lyricsStudio';

beforeEach(() => {
  localStorage.clear();
});

describe('lyrics workflow', () => {
  it('creates and edits a lyric', () => {
    localStorage.setItem('gflow:studio:user', JSON.stringify('user-a'));
    const { result } = renderHook(() => useLyricsProjects());

    let createdId = '';
    act(() => {
      const created = result.current.createLyric({ title: 'First Song' });
      createdId = created.id;
    });

    expect(result.current.lyrics).toHaveLength(1);
    expect(result.current.lyrics[0].title).toBe('First Song');

    act(() => {
      const lyric = result.current.getLyric(createdId);
      if (!lyric) throw new Error('lyric missing');
      result.current.saveLyric({ ...lyric, title: 'First Song Updated', mood: 'melancholic' });
    });

    expect(result.current.getLyric(createdId)?.title).toBe('First Song Updated');
    expect(result.current.getLyric(createdId)?.mood).toBe('melancholic');
  });

  it('lists only current user lyrics and denies other user lyric access', () => {
    localStorage.setItem('gflow:studio:user', JSON.stringify('user-a'));
    const { result, rerender } = renderHook(() => useLyricsProjects());

    let userALyricId = '';
    act(() => {
      userALyricId = result.current.createLyric({ title: 'User A Song' }).id;
    });

    expect(result.current.lyrics.map((entry) => entry.title)).toContain('User A Song');

    localStorage.setItem('gflow:studio:user', JSON.stringify('user-b'));
    rerender();

    expect(result.current.lyrics).toHaveLength(0);
    expect(result.current.getLyric(userALyricId)).toBeUndefined();

    act(() => {
      result.current.createLyric({ title: 'User B Song' });
    });

    expect(result.current.lyrics).toHaveLength(1);
    expect(result.current.lyrics[0].title).toBe('User B Song');

    localStorage.setItem('gflow:studio:user', JSON.stringify('user-a'));
    rerender();

    expect(result.current.lyrics).toHaveLength(1);
    expect(result.current.getLyric(userALyricId)?.title).toBe('User A Song');
  });

  it('saves and restores lyric versions', () => {
    localStorage.setItem('gflow:studio:user', JSON.stringify('user-a'));
    const { result } = renderHook(() => useLyricsProjects());

    let lyricId = '';
    act(() => {
      const lyric = result.current.createLyric({ title: 'Versioned Song' });
      lyricId = lyric.id;
      result.current.saveLyric({ ...lyric, currentContent: 'Line A', sections: [{ ...lyric.sections[0], content: 'Line A' }] });
    });

    act(() => {
      result.current.saveVersion(lyricId, 'Original Draft');
    });

    act(() => {
      const lyric = result.current.getLyric(lyricId);
      if (!lyric) throw new Error('lyric missing');
      result.current.saveLyric({ ...lyric, currentContent: 'Line B', sections: [{ ...lyric.sections[0], content: 'Line B' }] });
    });

    const versions = result.current.getLyricVersions(lyricId);
    expect(versions).toHaveLength(1);
    expect(versions[0].versionName).toBe('Original Draft');

    act(() => {
      result.current.restoreVersion(versions[0].id);
    });

    expect(result.current.getLyric(lyricId)?.currentContent).toContain('Line A');
  });

  it('filters lyrics by query and metadata', () => {
    const owner = 'user-z';
    const make = (title: string, mood: string, tags: string[]): Lyric => {
      const base = createEmptyLyric(owner);
      return { ...base, title, mood, tags, genre: mood === 'dark' ? 'rap' : 'pop' };
    };

    const data = [make('Night Drive', 'dark', ['city']), make('Summer Bloom', 'bright', ['sun'])];
    const filtered = filterLyrics(data, {
      query: 'night',
      status: '',
      project: '',
      tag: '',
      genre: '',
      favoriteOnly: false,
    });

    expect(filtered).toHaveLength(1);
    expect(filtered[0].title).toBe('Night Drive');
  });

  it('exports lyric data in markdown', () => {
    const lyric = createEmptyLyric('user-a');
    lyric.title = 'Export Song';
    lyric.sections[0].content = 'Hello export';
    const output = buildLyricExport(lyric, 'md');
    expect(output).toContain('# Export Song');
    expect(output).toContain('Hello export');
  });
});

describe('mobile navigation', () => {
  it('renders expected primary links', () => {
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>,
    );

    expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Lyrics' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Projects' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Tools' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Account' })).toBeInTheDocument();
  });
});
