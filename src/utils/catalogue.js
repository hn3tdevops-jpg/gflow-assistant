/**
 * catalogue.js
 * Catalogue data loading, searching, and filtering utilities.
 */

let _catalogue = null;

/** Load and cache the catalogue JSON. */
export async function loadCatalogue() {
  if (_catalogue) return _catalogue;
  try {
    const res  = await fetch('data/catalogue.json');
    const data = await res.json();
    _catalogue = data.sounds || data || [];
    return _catalogue;
  } catch (err) {
    console.error('Failed to load catalogue:', err);
    _catalogue = [];
    return _catalogue;
  }
}

/** Return all unique values for a field (flattening arrays for tags). */
export function uniqueValues(sounds, field) {
  const set = new Set();
  sounds.forEach(s => {
    const v = s[field];
    if (Array.isArray(v)) v.forEach(x => set.add(x));
    else if (v != null && v !== '') set.add(v);
  });
  return [...set].sort();
}

/**
 * Filter and search the catalogue.
 * @param {Array}  sounds
 * @param {Object} filters  { query, type, category, tags, key, bpmMin, bpmMax, license, favoritesOnly }
 * @param {Array}  favoriteIds
 */
export function applyFilters(sounds, filters, favoriteIds = []) {
  const {
    query       = '',
    type        = '',
    category    = '',
    tags        = [],
    key         = '',
    bpmMin      = '',
    bpmMax      = '',
    license     = '',
    favoritesOnly = false,
  } = filters;

  const q = query.trim().toLowerCase();

  return sounds.filter(s => {
    // text search
    if (q) {
      const hay = [s.title, s.description, s.category, s.subcategory, s.type,
                   ...(s.tags || []), s.key, s.source].join(' ').toLowerCase();
      if (!hay.includes(q)) return false;
    }
    // type
    if (type && s.type !== type) return false;
    // category
    if (category && s.category !== category) return false;
    // tags (ALL selected tags must be present)
    if (tags.length > 0) {
      if (!tags.every(t => (s.tags || []).includes(t))) return false;
    }
    // key
    if (key && s.key !== key) return false;
    // bpm range
    if (bpmMin !== '' && s.bpm != null && Number(s.bpm) < Number(bpmMin)) return false;
    if (bpmMax !== '' && s.bpm != null && Number(s.bpm) > Number(bpmMax)) return false;
    // license
    if (license && s.license !== license) return false;
    // favorites
    if (favoritesOnly && !favoriteIds.includes(s.id)) return false;

    return true;
  });
}

/** Format seconds as M:SS */
export function formatDuration(secs) {
  if (secs == null) return '--';
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

/** Return a color class based on item type. */
export function typeBadgeClass(type) {
  return `badge badge--type-${type || 'reference'}`;
}
