import SoundCard from './SoundCard';
import type { SoundItem, Crate } from '../../types/catalogue';

interface SoundGridProps {
  items: SoundItem[];
  favorites: string[];
  crates: Crate[];
  onToggleFavorite: (id: string) => void;
  onAddToCrate: (crateId: string, soundId: string) => void;
}

export default function SoundGrid({ items, favorites, crates, onToggleFavorite, onAddToCrate }: SoundGridProps) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-500">
        <span className="text-4xl mb-3">🔇</span>
        <p className="text-lg font-medium">No sounds found</p>
        <p className="text-sm mt-1">Try adjusting your filters</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((item) => (
        <SoundCard
          key={item.id}
          item={item}
          isFavorite={favorites.includes(item.id)}
          onToggleFavorite={onToggleFavorite}
          crates={crates}
          onAddToCrate={onAddToCrate}
        />
      ))}
    </div>
  );
}
