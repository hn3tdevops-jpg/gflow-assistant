import { useEffect, useState } from 'react';
import type { SoundItem } from '../types/catalogue';
import { useCrates } from '../hooks/useCrates';
import { useFavorites } from '../hooks/useFavorites';
import SoundGrid from '../components/sounds/SoundGrid';
import { Link } from 'react-router-dom';

const TYPE_COLORS: Record<string, string> = {
  sample: 'bg-blue-600',
  loop: 'bg-green-600',
  instrument: 'bg-purple-600',
  preset: 'bg-yellow-600',
  kit: 'bg-red-600',
  collection: 'bg-pink-600',
  reference: 'bg-gray-600',
};

export default function CratesPage() {
  const [allItems, setAllItems] = useState<SoundItem[]>([]);
  const [selectedCrateId, setSelectedCrateId] = useState<string | null>(null);
  const [newCrateName, setNewCrateName] = useState('');
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

  const { crates, createCrate, renameCrate, deleteCrate, addSoundToCrate, removeSoundFromCrate } = useCrates();
  const { favorites, toggleFavorite, isFavorite } = useFavorites();

  useEffect(() => {
    fetch('/data/catalogue.json')
      .then((r) => r.json())
      .then(setAllItems)
      .catch(console.error);
  }, []);

  const handleCreateCrate = () => {
    const name = newCrateName.trim();
    if (!name) return;
    const crate = createCrate(name);
    setSelectedCrateId(crate.id);
    setNewCrateName('');
  };

  const handleRenameSubmit = (id: string) => {
    const name = renameValue.trim();
    if (name) renameCrate(id, name);
    setRenamingId(null);
  };

  const selectedCrate = crates.find((c) => c.id === selectedCrateId) ?? null;
  const crateItems = selectedCrate
    ? allItems.filter((item) => selectedCrate.soundIds.includes(item.id))
    : [];

  const favoriteItems = allItems.filter((item) => favorites.includes(item.id));

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-bold text-gray-100">Crates</h1>

      {/* Favorites Section */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-red-400 text-lg">♥</span>
          <h2 className="text-lg font-semibold text-gray-100">Favorites</h2>
          <span className="text-sm text-gray-500">({favoriteItems.length})</span>
        </div>
        {favoriteItems.length === 0 ? (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center text-gray-500">
            <p className="text-sm">No favorites yet. Click ♥ on any sound to add it here.</p>
          </div>
        ) : (
          <SoundGrid
            items={favoriteItems}
            favorites={favorites}
            crates={crates}
            onToggleFavorite={toggleFavorite}
            onAddToCrate={addSoundToCrate}
          />
        )}
      </section>

      {/* Crates Section */}
      <section>
        <h2 className="text-lg font-semibold text-gray-100 mb-4">My Crates</h2>

        <div className="flex gap-6 items-start">
          {/* Sidebar: crate list */}
          <aside className="w-64 shrink-0 flex flex-col gap-3">
            {/* Create new crate */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="New crate name…"
                value={newCrateName}
                onChange={(e) => setNewCrateName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateCrate()}
                className="flex-1 bg-gray-800 border border-gray-700 text-gray-100 text-sm rounded px-3 py-2 placeholder-gray-500 focus:outline-none focus:border-purple-500"
              />
              <button
                onClick={handleCreateCrate}
                disabled={!newCrateName.trim()}
                className="bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white text-sm font-medium px-3 py-2 rounded transition-colors"
              >
                +
              </button>
            </div>

            {crates.length === 0 ? (
              <p className="text-xs text-gray-500 text-center py-4">No crates yet. Create one above!</p>
            ) : (
              <div className="flex flex-col gap-1">
                {crates.map((crate) => (
                  <div key={crate.id}>
                    {renamingId === crate.id ? (
                      <div className="flex gap-1">
                        <input
                          autoFocus
                          type="text"
                          value={renameValue}
                          onChange={(e) => setRenameValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleRenameSubmit(crate.id);
                            if (e.key === 'Escape') setRenamingId(null);
                          }}
                          className="flex-1 bg-gray-800 border border-purple-500 text-gray-100 text-sm rounded px-2 py-1 focus:outline-none"
                        />
                        <button
                          onClick={() => handleRenameSubmit(crate.id)}
                          className="text-xs text-purple-400 px-1"
                        >
                          ✓
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setSelectedCrateId(crate.id === selectedCrateId ? null : crate.id)}
                        className={`w-full text-left px-3 py-2 rounded text-sm transition-colors flex items-center justify-between group ${
                          selectedCrateId === crate.id
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-900 hover:bg-gray-800 text-gray-300 border border-gray-800'
                        }`}
                      >
                        <span className="truncate">{crate.name}</span>
                        <span className="text-xs opacity-60 shrink-0 ml-1">{crate.soundIds.length}</span>
                      </button>
                    )}

                    {selectedCrateId === crate.id && renamingId !== crate.id && (
                      <div className="flex gap-1 mt-1 px-1">
                        <button
                          onClick={() => {
                            setRenamingId(crate.id);
                            setRenameValue(crate.name);
                          }}
                          className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
                        >
                          Rename
                        </button>
                        <span className="text-gray-700">·</span>
                        <button
                          onClick={() => {
                            deleteCrate(crate.id);
                            setSelectedCrateId(null);
                          }}
                          className="text-xs text-red-500 hover:text-red-400 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </aside>

          {/* Main: crate contents */}
          <div className="flex-1 min-w-0">
            {!selectedCrate ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-500 bg-gray-900 border border-gray-800 rounded-xl">
                <span className="text-4xl mb-3">📂</span>
                <p className="text-sm">Select a crate to view its contents</p>
              </div>
            ) : crateItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-500 bg-gray-900 border border-gray-800 rounded-xl">
                <span className="text-4xl mb-3">🗂️</span>
                <p className="font-medium text-gray-400">{selectedCrate.name}</p>
                <p className="text-sm mt-1">This crate is empty.</p>
                <Link to="/browse" className="mt-3 text-sm text-purple-400 hover:text-purple-300">
                  Browse sounds →
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold text-gray-200">{selectedCrate.name}</h3>
                  <span className="text-sm text-gray-400">{crateItems.length} sounds</span>
                </div>
                <div className="flex flex-col gap-2">
                  {crateItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 bg-gray-900 border border-gray-800 rounded-lg px-4 py-3"
                    >
                      <span className={`${TYPE_COLORS[item.type] ?? 'bg-gray-600'} text-white text-xs px-1.5 py-0.5 rounded shrink-0`}>
                        {item.type}
                      </span>
                      <Link
                        to={`/sounds/${item.id}`}
                        className="flex-1 text-sm text-gray-200 hover:text-purple-300 transition-colors truncate"
                      >
                        {item.title}
                      </Link>
                      <span className="text-xs text-gray-500 shrink-0">{item.category}</span>
                      <button
                        onClick={() => toggleFavorite(item.id)}
                        className={`text-sm shrink-0 transition-colors ${isFavorite(item.id) ? 'text-red-400' : 'text-gray-600 hover:text-red-400'}`}
                      >
                        ♥
                      </button>
                      <button
                        onClick={() => removeSoundFromCrate(selectedCrate.id, item.id)}
                        className="text-sm text-gray-600 hover:text-red-400 transition-colors shrink-0"
                        aria-label="Remove from crate"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
