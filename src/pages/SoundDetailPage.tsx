import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { SoundItem } from '../types/catalogue';
import AudioPlayer from '../components/audio/AudioPlayer';
import { useFavorites } from '../hooks/useFavorites';
import { useCrates } from '../hooks/useCrates';

const TYPE_COLORS: Record<string, string> = {
  sample: 'bg-blue-600',
  loop: 'bg-green-600',
  instrument: 'bg-purple-600',
  preset: 'bg-yellow-600',
  kit: 'bg-red-600',
  collection: 'bg-pink-600',
  reference: 'bg-gray-600',
};

export default function SoundDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [item, setItem] = useState<SoundItem | null>(null);
  const [loading, setLoading] = useState(true);
  const { toggleFavorite, isFavorite } = useFavorites();
  const { crates, addSoundToCrate } = useCrates();

  useEffect(() => {
    fetch('/data/catalogue.json')
      .then((r) => r.json())
      .then((data: SoundItem[]) => {
        const found = data.find((s) => s.id === id) ?? null;
        setItem(found);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-500">
        <p>Loading…</p>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="flex flex-col items-center py-20 text-gray-500 gap-4">
        <p className="text-lg">Sound not found.</p>
        <Link to="/browse" className="text-purple-400 hover:text-purple-300">← Back to Library</Link>
      </div>
    );
  }

  const badgeColor = TYPE_COLORS[item.type] ?? 'bg-gray-600';
  const favorited = isFavorite(item.id);

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6">
      <Link to="/browse" className="text-sm text-gray-400 hover:text-purple-400 transition-colors w-fit">
        ← Back to Library
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`${badgeColor} text-white text-xs font-medium px-2 py-0.5 rounded`}>
              {item.type}
            </span>
            <span className="text-gray-400 text-sm">{item.category}</span>
            {item.subcategory && (
              <span className="text-gray-500 text-sm">/ {item.subcategory}</span>
            )}
          </div>
          <h1 className="text-2xl font-bold text-gray-100">{item.title}</h1>
        </div>
        <button
          onClick={() => toggleFavorite(item.id)}
          className={`text-2xl mt-1 transition-colors shrink-0 ${favorited ? 'text-red-400' : 'text-gray-600 hover:text-red-400'}`}
          aria-label={favorited ? 'Remove from favorites' : 'Add to favorites'}
        >
          ♥
        </button>
      </div>

      {/* Audio Player */}
      <div>
        <h2 className="text-xs text-gray-500 uppercase tracking-wider mb-2">Preview</h2>
        <AudioPlayer src={item.preview_path} />
      </div>

      {/* Description */}
      {item.description && (
        <div>
          <h2 className="text-xs text-gray-500 uppercase tracking-wider mb-2">Description</h2>
          <p className="text-gray-300 text-sm leading-relaxed">{item.description}</p>
        </div>
      )}

      {/* Tags */}
      {item.tags.length > 0 && (
        <div>
          <h2 className="text-xs text-gray-500 uppercase tracking-wider mb-2">Tags</h2>
          <div className="flex flex-wrap gap-2">
            {item.tags.map((tag) => (
              <span key={tag} className="text-sm text-gray-300 bg-gray-800 border border-gray-700 px-2 py-1 rounded">
                #{tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Production Notes */}
      {item.production_notes && (
        <div>
          <h2 className="text-xs text-gray-500 uppercase tracking-wider mb-2">Production Notes</h2>
          <p className="text-gray-300 text-sm bg-gray-900 border border-gray-800 rounded-lg p-4 leading-relaxed font-mono">
            {item.production_notes}
          </p>
        </div>
      )}

      {/* Technical Metadata */}
      <div>
        <h2 className="text-xs text-gray-500 uppercase tracking-wider mb-2">Technical Info</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { label: 'Format', value: item.format },
            { label: 'Sample Rate', value: item.sample_rate ? `${item.sample_rate} Hz` : null },
            { label: 'Bit Depth', value: item.bit_depth ? `${item.bit_depth}-bit` : null },
            { label: 'Duration', value: item.duration_seconds ? `${item.duration_seconds}s` : null },
            { label: 'BPM', value: item.bpm },
            { label: 'Key', value: item.key },
          ].map(({ label, value }) => (
            <div key={label} className="bg-gray-900 border border-gray-800 rounded-lg p-3">
              <div className="text-xs text-gray-500">{label}</div>
              <div className="text-sm text-gray-200 font-medium mt-0.5">{value ?? '—'}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Source & License */}
      <div className="grid grid-cols-2 gap-3">
        {item.source && (
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-3">
            <div className="text-xs text-gray-500">Source</div>
            <div className="text-sm text-gray-300 mt-0.5">{item.source}</div>
          </div>
        )}
        {item.license && (
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-3">
            <div className="text-xs text-gray-500">License</div>
            <div className="text-sm text-gray-300 mt-0.5">{item.license}</div>
          </div>
        )}
      </div>

      {/* File Location */}
      <div>
        <h2 className="text-xs text-gray-500 uppercase tracking-wider mb-2">File Location</h2>
        <code className="block text-xs text-green-400 bg-gray-900 border border-gray-800 rounded-lg p-3 break-all">
          {item.file_path}
        </code>
      </div>

      {/* Add to Crate */}
      {crates.length > 0 && (
        <div>
          <h2 className="text-xs text-gray-500 uppercase tracking-wider mb-2">Add to Crate</h2>
          <div className="flex flex-wrap gap-2">
            {crates.map((crate) => (
              <button
                key={crate.id}
                onClick={() => addSoundToCrate(crate.id, item.id)}
                className="text-sm bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 px-3 py-1.5 rounded transition-colors"
              >
                + {crate.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
