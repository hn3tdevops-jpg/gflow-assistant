import { useContext } from 'react';
import { AudioCtx } from '../context/audioCtx';

export function useAudio() {
  const ctx = useContext(AudioCtx);
  if (!ctx) throw new Error('useAudio must be used inside AudioProvider');
  return ctx;
}
