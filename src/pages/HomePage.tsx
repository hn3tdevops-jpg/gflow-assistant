import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { SoundItem } from '../types/catalogue';
import SoundGrid from '../components/sounds/SoundGrid';
import { useFavorites } from '../hooks/useFavorites';
import { useCrates } from '../hooks/useCrates';

export default function HomePage() {
  const [items, setItems] = useState<SoundItem[]>([]);
  const { favorites, toggleFavorite } = useFavorites();
  const { crates, addSoundToCrate } = useCrates();

  useEffect(() => {
    fetch('/data/catalogue.json')
      .then((r) => r.json())
      .then(setItems)
      .catch(console.error);
  }, []);

  const recentItems = items.slice(-6).reverse();
  const typeCount = new Set(items.map((i) => i.type)).size;
  const categoryCount = new Set(items.map((i) => i.category)).size;

  return (
    <div className="flex flex-col gap-10">
      {/* Hero */}
      <section className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-gray-900 via-purple-950 to-gray-950 border border-gray-800 px-8 py-14 text-center">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-500 via-transparent to-transparent pointer-events-none" />
        <h1 className="text-5xl font-black tracking-tight text-white mb-3">
          g<span className="text-purple-400">flow</span>
        </h1>
        <p className="text-xl text-gray-300 font-medium mb-2">Your Producer Sound Library</p>
        <p className="text-gray-500 text-sm max-w-md mx-auto mb-8">
          Organise, browse, and preview your entire sound catalogue. Tag everything. Find anything.
        </p>
        <div className="flex gap-3 justify-center">
          <Link
            to="/browse"
            className="bg-purple-600 hover:bg-purple-500 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors"
          >
            Browse Library
          </Link>
          <Link
            to="/crates"
            className="bg-gray-800 hover:bg-gray-700 text-gray-200 font-semibold px-6 py-2.5 rounded-lg border border-gray-700 transition-colors"
          >
            My Crates
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Sounds', value: items.length },
          { label: 'Categories', value: categoryCount },
          { label: 'Item Types', value: typeCount },
        ].map(({ label, value }) => (
          <div key={label} className="bg-gray-900 border border-gray-800 rounded-xl p-5 text-center">
            <div className="text-3xl font-black text-purple-400">{value}</div>
            <div className="text-xs text-gray-400 mt-1 font-medium">{label}</div>
          </div>
        ))}
      </section>

      {/* Recent Sounds */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-100">Recent Additions</h2>
          <Link to="/browse" className="text-sm text-purple-400 hover:text-purple-300 transition-colors">
            View all →
          </Link>
        </div>
        <SoundGrid
          items={recentItems}
          favorites={favorites}
          crates={crates}
          onToggleFavorite={toggleFavorite}
          onAddToCrate={addSoundToCrate}
        />
      </section>
    </div>
  );
}
