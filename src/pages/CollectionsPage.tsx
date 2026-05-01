import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { SoundItem } from '../types/catalogue';

export default function CollectionsPage() {
  const [items, setItems] = useState<SoundItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/data/catalogue.json')
      .then((r) => r.json())
      .then((data: SoundItem[]) => {
        setItems(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const collections = items.filter((i) => i.type === 'collection');

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-100">Collections</h1>
        {!loading && (
          <span className="text-sm text-gray-400">{collections.length} collections</span>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-gray-500">
          <p>Loading…</p>
        </div>
      ) : collections.length === 0 ? (
        <div className="flex flex-col items-center py-20 text-gray-500 gap-3">
          <span className="text-4xl">📦</span>
          <p className="text-lg">No collections yet</p>
          <p className="text-sm">Add items of type "collection" to your catalogue</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {collections.map((col) => (
            <Link
              key={col.id}
              to={`/browse?category=${encodeURIComponent(col.category)}&type=collection`}
              className="bg-gray-800 hover:bg-gray-750 border border-gray-700 hover:border-purple-600 rounded-xl p-5 flex flex-col gap-3 transition-colors group"
              style={{ '--tw-bg-opacity': '1' } as React.CSSProperties}
            >
              <div className="flex items-start justify-between">
                <span className="text-2xl">📦</span>
                <span className="bg-pink-600 text-white text-xs font-medium px-2 py-0.5 rounded">
                  collection
                </span>
              </div>

              <div>
                <h3 className="text-gray-100 font-semibold group-hover:text-purple-300 transition-colors">
                  {col.title}
                </h3>
                <p className="text-gray-400 text-sm mt-0.5">{col.category}</p>
              </div>

              {col.description && (
                <p className="text-gray-500 text-xs leading-relaxed line-clamp-3">
                  {col.description}
                </p>
              )}

              <div className="flex flex-wrap gap-1 mt-auto pt-2">
                {col.tags.slice(0, 4).map((tag) => (
                  <span key={tag} className="text-xs text-gray-500 bg-gray-700 px-1.5 py-0.5 rounded">
                    #{tag}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
