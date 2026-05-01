import { createContext } from 'react';

export interface AudioContextValue {
  playingId: string | null;
  play: (id: string, src: string) => void;
  pause: () => void;
  toggle: (id: string, src: string) => void;
}

export const AudioCtx = createContext<AudioContextValue | null>(null);
