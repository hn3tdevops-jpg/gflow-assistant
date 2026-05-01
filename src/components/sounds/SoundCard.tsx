import { Link } from 'react-router-dom';
import type { SoundItem, Crate } from '../../types/catalogue';
import { useAudio } from '../../hooks/useAudio';
import { resolvePreviewUrl } from '../../utils/preview';

const TYPE_COLORS: Record<string, string> = {
  sample: 'bg-blue-600',
  loop: 'bg-green-600',
  instrument: 'bg-purple-600',
  preset: 'bg-yellow-600',
  kit: 'bg-red-600',
  collection: 'bg-pink-600',
  reference: 'bg-gray-600',
};

interface SoundCardProps {
  item: SoundItem;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  crates: Crate[];
  onAddToCrate: (crateId: string, soundId: string) => void;
}

export default function SoundCard({ item, isFavorite, onToggleFavorite, crates, onAddToCrate }: SoundCardProps) {
  const badgeColor = TYPE_COLORS[item.type] ?? 'bg-gray-600';
  const { playingId, toggle } = useAudio();
  const isPlaying = playingId === item.id;
  const previewUrl = item.preview_path ? resolvePreviewUrl(item.preview_path) : null;

  return (
    <div className="bg-gray-800 hover:bg-gray-750 border border-gray-700 hover:border-gray-600 rounded-lg p-4 flex flex-col gap-3 transition-colors" style={{ '--tw-bg-opacity': '1' } as React.CSSProperties}>
      <div className="flex items-start justify-between gap-2">
        <Link to={`/sounds/${item.id}`} className="flex-1 min-w-0">
          <h3 className="text-gray-100 font-semibold text-sm leading-snug hover:text-purple-300 transition-colors truncate">
            {item.title}
          </h3>
        </Link>
        <button
          onClick={() => onToggleFavorite(item.id)}
          className={`text-lg shrink-0 transition-colors ${isFavorite ? 'text-red-400' : 'text-gray-600 hover:text-red-400'}`}
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          ♥
        </button>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <span className={`${badgeColor} text-white text-xs font-medium px-2 py-0.5 rounded`}>
          {item.type}
        </span>
        <span className="text-gray-400 text-xs">{item.category}</span>
        {item.key && (
          <span className="text-gray-500 text-xs bg-gray-700 px-1.5 py-0.5 rounded">
            {item.key}
          </span>
        )}
        {item.bpm && (
          <span className="text-gray-500 text-xs bg-gray-700 px-1.5 py-0.5 rounded">
            {item.bpm} BPM
          </span>
        )}
      </div>

      {item.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {item.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="text-xs text-gray-400 bg-gray-700 px-1.5 py-0.5 rounded">
              #{tag}
            </span>
          ))}
          {item.tags.length > 3 && (
            <span className="text-xs text-gray-500">+{item.tags.length - 3}</span>
          )}
        </div>
      )}

      <div className="mt-auto pt-2 border-t border-gray-700 flex items-center gap-2">
        {/* Preview button */}
        {previewUrl ? (
          <button
            onClick={() => toggle(item.id, previewUrl)}
            className={`shrink-0 w-7 h-7 flex items-center justify-center rounded-full text-xs transition-colors ${
              isPlaying
                ? 'bg-purple-600 text-white hover:bg-purple-700'
                : 'bg-gray-700 text-gray-300 hover:bg-purple-600 hover:text-white'
            }`}
            aria-label={isPlaying ? 'Pause preview' : 'Play preview'}
          >
            {isPlaying ? '⏸' : '▶'}
          </button>
        ) : (
          <span
            className="shrink-0 w-7 h-7 flex items-center justify-center rounded-full text-xs bg-gray-800 text-gray-600 border border-gray-700 cursor-not-allowed"
            title="No preview available"
            aria-label="No preview available"
          >
            ▶
          </span>
        )}

        {/* Crate selector */}
        <div className="flex-1">
          {crates.length > 0 ? (
            <select
              className="w-full bg-gray-700 text-gray-300 text-xs rounded px-2 py-1 border border-gray-600 focus:outline-none focus:border-purple-500"
              defaultValue=""
              onChange={(e) => {
                if (e.target.value) {
                  onAddToCrate(e.target.value, item.id);
                  e.target.value = '';
                }
              }}
              aria-label="Add to crate"
            >
              <option value="" disabled>+ Add to crate</option>
              {crates.map((crate) => (
                <option key={crate.id} value={crate.id}>
                  {crate.name}
                </option>
              ))}
            </select>
          ) : (
            <Link
              to="/crates"
              className="text-xs text-gray-500 hover:text-purple-400 transition-colors"
            >
              + Create a crate
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
