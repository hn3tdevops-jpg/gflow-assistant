/**
 * storage.js
 * localStorage utilities for crates and favorites.
 */

const CRATES_KEY = 'gflow_crates';
const FAVS_KEY   = 'gflow_favorites';

// ── Favorites ──────────────────────────────────────────────
export function getFavorites() {
  try {
    return JSON.parse(localStorage.getItem(FAVS_KEY) || '[]');
  } catch { return []; }
}

export function toggleFavorite(id) {
  const favs = getFavorites();
  const idx  = favs.indexOf(id);
  if (idx === -1) favs.push(id);
  else favs.splice(idx, 1);
  localStorage.setItem(FAVS_KEY, JSON.stringify(favs));
  return favs.includes(id);
}

export function isFavorite(id) {
  return getFavorites().includes(id);
}

// ── Crates ─────────────────────────────────────────────────
export function getCrates() {
  try {
    return JSON.parse(localStorage.getItem(CRATES_KEY) || '[]');
  } catch { return []; }
}

export function saveCrates(crates) {
  localStorage.setItem(CRATES_KEY, JSON.stringify(crates));
}

export function createCrate(name) {
  const crates = getCrates();
  const crate  = { id: Date.now().toString(), name, soundIds: [], createdAt: new Date().toISOString() };
  crates.push(crate);
  saveCrates(crates);
  return crate;
}

export function deleteCrate(id) {
  const crates = getCrates().filter(c => c.id !== id);
  saveCrates(crates);
}

export function renameCrate(id, newName) {
  const crates = getCrates().map(c => c.id === id ? { ...c, name: newName } : c);
  saveCrates(crates);
}

export function addSoundToCrate(crateId, soundId) {
  const crates = getCrates().map(c => {
    if (c.id !== crateId) return c;
    if (!c.soundIds.includes(soundId)) return { ...c, soundIds: [...c.soundIds, soundId] };
    return c;
  });
  saveCrates(crates);
}

export function removeSoundFromCrate(crateId, soundId) {
  const crates = getCrates().map(c => {
    if (c.id !== crateId) return c;
    return { ...c, soundIds: c.soundIds.filter(id => id !== soundId) };
  });
  saveCrates(crates);
}
