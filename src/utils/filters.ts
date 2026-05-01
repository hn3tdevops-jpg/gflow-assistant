import type { SoundItem, FilterState } from '../types/catalogue';

export function applyFilters(items: SoundItem[], filters: FilterState, favorites: string[]): SoundItem[] {
  return items.filter((item) => {
    if (filters.favoritesOnly && !favorites.includes(item.id)) return false;
    if (filters.type && item.type !== filters.type) return false;
    if (filters.category && item.category !== filters.category) return false;
    if (filters.key && item.key !== filters.key) return false;
    if (filters.license && item.license !== filters.license) return false;
    if (filters.bpmMin !== '' && (item.bpm === null || item.bpm < Number(filters.bpmMin))) return false;
    if (filters.bpmMax !== '' && (item.bpm === null || item.bpm > Number(filters.bpmMax))) return false;
    if (filters.tags.length > 0 && !filters.tags.every((t) => item.tags.includes(t))) return false;
    if (filters.query) {
      const q = filters.query.toLowerCase();
      const inTitle = item.title.toLowerCase().includes(q);
      const inDesc = item.description?.toLowerCase().includes(q) ?? false;
      const inTags = item.tags.some((t) => t.toLowerCase().includes(q));
      if (!inTitle && !inDesc && !inTags) return false;
    }
    return true;
  });
}
