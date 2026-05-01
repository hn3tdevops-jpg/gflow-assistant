import { useState } from 'react';
import type { FilterState, ItemType, SoundItem } from '../../types/catalogue';

const ITEM_TYPES: ItemType[] = ['instrument', 'sample', 'loop', 'preset', 'kit', 'collection', 'reference'];
const KEYS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

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

interface FilterPanelProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  items: SoundItem[];
}

export default function FilterPanel({ filters, onChange, items }: FilterPanelProps) {
  const [collapsed, setCollapsed] = useState(false);

  const categories = Array.from(new Set(items.map((i) => i.category))).sort();
  const licenses = Array.from(new Set(items.map((i) => i.license).filter(Boolean) as string[])).sort();

  const update = (partial: Partial<FilterState>) => onChange({ ...filters, ...partial });

  const hasActiveFilters =
    filters.query || filters.type || filters.category || filters.key ||
    filters.license || filters.bpmMin !== '' || filters.bpmMax !== '' ||
    filters.tags.length > 0 || filters.favoritesOnly;

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
        <span className="text-sm font-semibold text-gray-200">Filters</span>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              onClick={() => onChange(DEFAULT_FILTERS)}
              className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
            >
              Clear all
            </button>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-gray-400 hover:text-white text-sm transition-colors md:hidden"
            aria-label="Toggle filters"
          >
            {collapsed ? '☰' : '✕'}
          </button>
        </div>
      </div>

      <div className={`${collapsed ? 'hidden' : 'block'} md:block`}>
        <div className="p-4 flex flex-col gap-4">
          {/* Search */}
          <div>
            <label className="block text-xs text-gray-400 mb-1">Search</label>
            <input
              type="text"
              placeholder="Search title, description, tags…"
              value={filters.query}
              onChange={(e) => update({ query: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 text-gray-100 text-sm rounded px-3 py-2 placeholder-gray-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Type */}
          <div>
            <label className="block text-xs text-gray-400 mb-1">Type</label>
            <select
              value={filters.type}
              onChange={(e) => update({ type: e.target.value as ItemType | '' })}
              className="w-full bg-gray-800 border border-gray-700 text-gray-100 text-sm rounded px-3 py-2 focus:outline-none focus:border-purple-500"
            >
              <option value="">All types</option>
              {ITEM_TYPES.map((t) => (
                <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
              ))}
            </select>
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs text-gray-400 mb-1">Category</label>
            <select
              value={filters.category}
              onChange={(e) => update({ category: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 text-gray-100 text-sm rounded px-3 py-2 focus:outline-none focus:border-purple-500"
            >
              <option value="">All categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Key */}
          <div>
            <label className="block text-xs text-gray-400 mb-1">Key</label>
            <select
              value={filters.key}
              onChange={(e) => update({ key: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 text-gray-100 text-sm rounded px-3 py-2 focus:outline-none focus:border-purple-500"
            >
              <option value="">Any key</option>
              {KEYS.map((k) => (
                <option key={k} value={k}>{k}</option>
              ))}
            </select>
          </div>

          {/* BPM Range */}
          <div>
            <label className="block text-xs text-gray-400 mb-1">BPM Range</label>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Min"
                value={filters.bpmMin}
                min={0}
                onChange={(e) => update({ bpmMin: e.target.value === '' ? '' : Number(e.target.value) })}
                className="w-full bg-gray-800 border border-gray-700 text-gray-100 text-sm rounded px-3 py-2 placeholder-gray-500 focus:outline-none focus:border-purple-500"
              />
              <input
                type="number"
                placeholder="Max"
                value={filters.bpmMax}
                min={0}
                onChange={(e) => update({ bpmMax: e.target.value === '' ? '' : Number(e.target.value) })}
                className="w-full bg-gray-800 border border-gray-700 text-gray-100 text-sm rounded px-3 py-2 placeholder-gray-500 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {/* License */}
          <div>
            <label className="block text-xs text-gray-400 mb-1">License</label>
            <select
              value={filters.license}
              onChange={(e) => update({ license: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 text-gray-100 text-sm rounded px-3 py-2 focus:outline-none focus:border-purple-500"
            >
              <option value="">Any license</option>
              {licenses.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>

          {/* Favorites */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.favoritesOnly}
              onChange={(e) => update({ favoritesOnly: e.target.checked })}
              className="w-4 h-4 accent-purple-500"
            />
            <span className="text-sm text-gray-300">Favorites only</span>
          </label>
        </div>
      </div>
    </div>
  );
}
