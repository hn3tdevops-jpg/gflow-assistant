import { useEffect, useState } from 'react';
import type { SoundItem, FilterState } from '../types/catalogue';
import FilterPanel from '../components/filters/FilterPanel';
import SoundGrid from '../components/sounds/SoundGrid';
import { applyFilters } from '../utils/filters';
import { useFavorites } from '../hooks/useFavorites';
import { useCrates } from '../hooks/useCrates';

const DEFAULT_FILTERS: FilterState = {
  query: '',
  type: '',
  category: '',
  tags: [],
  key: '',
  bpmMin: '',
  bpmMax: '',
  license: '',
  favoritesOnly: false,
};

export default function BrowsePage() {
  const [items, setItems] = useState<SoundItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const { favorites, toggleFavorite } = useFavorites();
  const { crates, addSoundToCrate } = useCrates();

  useEffect(() => {
    fetch('/data/catalogue.json')
      .then((r) => r.json())
      .then((data: SoundItem[]) => {
        setItems(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const filtered = applyFilters(items, filters, favorites);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-100">Browse Library</h1>
        <span className="text-sm text-gray-400">
          {loading ? 'Loading…' : `${filtered.length} of ${items.length} sounds`}
        </span>
      </div>

      <div className="flex gap-6 items-start">
        {/* Sidebar */}
        <aside className="w-64 shrink-0 sticky top-20">
          <FilterPanel filters={filters} onChange={setFilters} items={items} />
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {loading ? (
            <div className="flex items-center justify-center py-20 text-gray-500">
              <div className="text-center">
                <div className="text-3xl mb-3">⏳</div>
                <p>Loading catalogue…</p>
              </div>
            </div>
          ) : (
            <SoundGrid
              items={filtered}
              favorites={favorites}
              crates={crates}
              onToggleFavorite={toggleFavorite}
              onAddToCrate={addSoundToCrate}
            />
          )}
        </div>
      </div>
    </div>
  );
}
