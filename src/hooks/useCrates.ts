import { useLocalStorage } from './useLocalStorage';
import type { Crate } from '../types/catalogue';

export function useCrates() {
  const [crates, setCrates] = useLocalStorage<Crate[]>('gflow_crates', []);

  const createCrate = (name: string): Crate => {
    const newCrate: Crate = {
      id: Date.now().toString(),
      name,
      soundIds: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setCrates((prev) => [...prev, newCrate]);
    return newCrate;
  };

  const renameCrate = (id: string, name: string) => {
    setCrates((prev) =>
      prev.map((c) => (c.id === id ? { ...c, name, updatedAt: new Date().toISOString() } : c))
    );
  };

  const deleteCrate = (id: string) => {
    setCrates((prev) => prev.filter((c) => c.id !== id));
  };

  const addSoundToCrate = (crateId: string, soundId: string) => {
    setCrates((prev) =>
      prev.map((c) =>
        c.id === crateId && !c.soundIds.includes(soundId)
          ? { ...c, soundIds: [...c.soundIds, soundId], updatedAt: new Date().toISOString() }
          : c
      )
    );
  };

  const removeSoundFromCrate = (crateId: string, soundId: string) => {
    setCrates((prev) =>
      prev.map((c) =>
        c.id === crateId
          ? { ...c, soundIds: c.soundIds.filter((id) => id !== soundId), updatedAt: new Date().toISOString() }
          : c
      )
    );
  };

  return { crates, createCrate, renameCrate, deleteCrate, addSoundToCrate, removeSoundFromCrate };
}
