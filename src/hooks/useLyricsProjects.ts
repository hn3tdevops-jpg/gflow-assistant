import { useCallback, useMemo } from 'react';
import type { Lyric, LyricVersion } from '../types/lyrics';
import { useLocalStorage } from './useLocalStorage';
import { useCurrentUser } from './useCurrentUser';
import { createEmptyLyric, normalizeSections, sectionsToText } from '../utils/lyricsStudio';

const LYRICS_KEY = 'gflow:studio:lyrics:v2';
const VERSIONS_KEY = 'gflow:studio:lyric_versions:v2';

function belongsToUser(userId: string, lyric: Lyric) {
  return lyric.ownerUserId === userId;
}

export function useLyricsProjects() {
  const [allLyrics, setAllLyrics] = useLocalStorage<Lyric[]>(LYRICS_KEY, []);
  const [allVersions, setAllVersions] = useLocalStorage<LyricVersion[]>(VERSIONS_KEY, []);
  const { userId } = useCurrentUser();

  const lyrics = useMemo(
    () => allLyrics.filter((lyric) => belongsToUser(userId, lyric)),
    [allLyrics, userId],
  );

  const versions = useMemo(
    () => allVersions.filter((version) => {
      const lyric = allLyrics.find((entry) => entry.id === version.lyricId);
      return lyric ? belongsToUser(userId, lyric) : false;
    }),
    [allLyrics, allVersions, userId],
  );

  const createLyric = useCallback((seed?: Partial<Lyric>) => {
    const lyric = { ...createEmptyLyric(userId), ...seed, ownerUserId: userId };
    const normalizedSections = normalizeSections(lyric.sections);
    const persisted = {
      ...lyric,
      sections: normalizedSections,
      currentContent: sectionsToText(normalizedSections),
    };
    setAllLyrics((prev) => [...prev, persisted]);
    return persisted;
  }, [setAllLyrics, userId]);

  const saveLyric = useCallback((lyric: Lyric) => {
    if (!belongsToUser(userId, lyric)) return;
    const normalizedSections = normalizeSections(lyric.sections);
    const updated: Lyric = {
      ...lyric,
      ownerUserId: userId,
      sections: normalizedSections,
      currentContent: sectionsToText(normalizedSections),
      updatedAt: new Date().toISOString(),
    };

    setAllLyrics((prev) => {
      const idx = prev.findIndex((item) => item.id === lyric.id);
      if (idx < 0) return [...prev, updated];
      const next = [...prev];
      next[idx] = updated;
      return next;
    });
  }, [setAllLyrics, userId]);

  const getLyric = useCallback((id: string) => {
    const lyric = allLyrics.find((entry) => entry.id === id);
    if (!lyric || !belongsToUser(userId, lyric)) return undefined;
    return lyric;
  }, [allLyrics, userId]);

  const deleteLyric = useCallback((id: string) => {
    setAllLyrics((prev) => prev.filter((entry) => entry.id !== id || !belongsToUser(userId, entry)));
    setAllVersions((prev) => prev.filter((version) => version.lyricId !== id));
  }, [setAllLyrics, setAllVersions, userId]);

  const setArchived = useCallback((id: string, archived: boolean) => {
    let updatedLyric: Lyric | undefined;
    setAllLyrics((prev) => prev.map((lyric) => {
      if (lyric.id !== id || !belongsToUser(userId, lyric)) return lyric;
      updatedLyric = {
        ...lyric,
        status: archived ? 'archived' : lyric.status === 'archived' ? 'draft' : lyric.status,
        archivedAt: archived ? new Date().toISOString() : undefined,
        updatedAt: new Date().toISOString(),
      };
      return updatedLyric;
    }));
    return updatedLyric;
  }, [setAllLyrics, userId]);

  const toggleFavorite = useCallback((id: string) => {
    let updatedLyric: Lyric | undefined;
    setAllLyrics((prev) => prev.map((lyric) => {
      if (lyric.id !== id || !belongsToUser(userId, lyric)) return lyric;
      updatedLyric = { ...lyric, isFavorite: !lyric.isFavorite, updatedAt: new Date().toISOString() };
      return updatedLyric;
    }));
    return updatedLyric;
  }, [setAllLyrics, userId]);

  const getLyricVersions = useCallback((lyricId: string) => {
    const lyric = getLyric(lyricId);
    if (!lyric) return [];
    return versions
      .filter((version) => version.lyricId === lyricId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [getLyric, versions]);

  const saveVersion = useCallback((lyricId: string, versionName: string) => {
    const lyric = getLyric(lyricId);
    if (!lyric) return undefined;
    const version: LyricVersion = {
      id: crypto.randomUUID(),
      lyricId,
      versionName: versionName.trim() || `Version ${new Date().toLocaleString()}`,
      content: lyric.currentContent,
      metadataJson: JSON.stringify({
        title: lyric.title,
        status: lyric.status,
        projectName: lyric.projectName,
        albumName: lyric.albumName,
        genre: lyric.genre,
        mood: lyric.mood,
      }),
      sections: lyric.sections,
      createdAt: new Date().toISOString(),
      createdByUserId: userId,
    };
    setAllVersions((prev) => [version, ...prev]);
    return version;
  }, [getLyric, setAllVersions, userId]);

  const restoreVersion = useCallback((versionId: string) => {
    const version = versions.find((entry) => entry.id === versionId);
    if (!version) return undefined;
    const lyric = getLyric(version.lyricId);
    if (!lyric) return undefined;
    const restored: Lyric = {
      ...lyric,
      sections: normalizeSections(version.sections),
      currentContent: version.content,
      updatedAt: new Date().toISOString(),
    };
    saveLyric(restored);
    return restored;
  }, [getLyric, saveLyric, versions]);

  const duplicateVersionAsDraft = useCallback((versionId: string, title?: string) => {
    const version = versions.find((entry) => entry.id === versionId);
    if (!version) return undefined;
    const source = getLyric(version.lyricId);
    if (!source) return undefined;

    const now = new Date().toISOString();
    const lyric: Lyric = {
      ...source,
      id: crypto.randomUUID(),
      title: title?.trim() || `${source.title} (Copy)`,
      sections: normalizeSections(version.sections.map((section) => ({ ...section, id: crypto.randomUUID() }))),
      status: 'draft',
      currentContent: version.content,
      createdAt: now,
      updatedAt: now,
      archivedAt: undefined,
      isFavorite: false,
      ownerUserId: userId,
    };
    setAllLyrics((prev) => [lyric, ...prev]);
    return lyric;
  }, [getLyric, setAllLyrics, userId, versions]);

  return {
    userId,
    lyrics,
    projects: lyrics,
    versions,
    createLyric,
    saveLyric,
    saveProject: saveLyric,
    getLyric,
    getProject: getLyric,
    deleteLyric,
    deleteProject: deleteLyric,
    toggleFavorite,
    setArchived,
    saveVersion,
    getLyricVersions,
    restoreVersion,
    duplicateVersionAsDraft,
  };
}
